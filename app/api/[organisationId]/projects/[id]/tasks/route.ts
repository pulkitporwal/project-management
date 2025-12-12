import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Project } from "@/models/Project";
import { Task } from "@/models/Task";
import { allowRoles } from "@/lib/roleGuardServer";
import { AuditLog } from "@/models/AuditLog";

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string, organisationId: string }> }
) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if user has access to the project
  const project = await Project.findOne({ _id: id, organisationId });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (session.user.role === "employee") {
    const canView = project.members.map(String).includes(session.user.id) ||
      project.createdBy.toString() === session.user.id ||
      project.visibility === "public";
    if (!canView) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tasks = await Task.find({ projectId: id })
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('attachments')
    .populate('dependencies')
    .sort({ createdAt: -1 });

  return NextResponse.json(tasks);
}

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string, organisationId: string }> }
) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if project exists and user has access
  const project = await Project.findOne({ _id: id, organisationId });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (session.user.role === "employee") {
    const canCreate = project.members.map(String).includes(session.user.id) ||
      project.createdBy.toString() === session.user.id;
    if (!canCreate) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();

  try {
    const task = new Task({
      ...body,
      projectId: id,
      organisationId: organisationId,
      createdBy: session.user.id,
      labels: body.labels || [],
      dependencies: body.dependencies || []
    });
    await task.save();

    // Log the action
    await AuditLog.create({
      userId: session.user.id,
      action: "create",
      module: "tasks",
      entityId: task._id,
      details: `Created task: ${task.title}`,
      ipAddress: request.headers.get("x-forwarded-for") || "localhost",
      userAgent: request.headers.get("user-agent") || "",
      success: true,
      organisationId: organisationId,
      timestamp: new Date(),
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Task creation error:', error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string, organisationId: string }> }
) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { taskId, ...updateData } = body;

  if (!taskId) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }

  try {
    // First verify project belongs to organisation
    const project = await Project.findOne({ _id: id, organisationId });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const task = await Task.findOne({ _id: taskId, projectId: id })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar');
    
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    
    // Check permissions for updates
    if (session.user.role === "employee" && 
        task.assignedTo?.toString() !== session.user.id && 
        task.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    Object.assign(task, updateData);
    await task.save();

    // Log the action
    await AuditLog.create({
      userId: session.user.id,
      action: "update",
      module: "tasks",
      entityId: taskId,
      details: `Updated task: ${taskId}`,
      ipAddress: request.headers.get("x-forwarded-for") || "localhost",
      userAgent: request.headers.get("user-agent") || "",
      success: true,
      organisationId: organisationId,
      timestamp: new Date(),
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Task update error:', error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string, organisationId: string }> }
) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
  }

  try {
    // First verify project belongs to organisation
    const project = await Project.findOne({ _id: id, organisationId });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const task = await Task.findOne({ _id: taskId, projectId: id });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    
    await Task.findByIdAndDelete(taskId);

    // Log the action
    await AuditLog.create({
      userId: session.user.id,
      action: "delete",
      module: "tasks",
      entityId: taskId,
      details: `Deleted task: ${taskId}`,
      ipAddress: request.headers.get("x-forwarded-for") || "localhost",
      userAgent: request.headers.get("user-agent") || "",
      success: true,
      organisationId: organisationId,
      timestamp: new Date(),
    });

    return NextResponse.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error('Task deletion error:', error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
