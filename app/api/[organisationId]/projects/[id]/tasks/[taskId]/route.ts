import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Task } from "@/models/Task";
import { Project } from "@/models/Project";
import { allowRoles } from "@/lib/roleGuardServer";
import { AuditLog } from "@/models/AuditLog";

export async function PATCH(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string, taskId: string, organisationId: string }> }
) {
  await connectDB();
  const { id, taskId, organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const body = await request.json();
    const oldStatus = task.status;
    
    Object.assign(task, body);
    await task.save();

    // Log the action
    await AuditLog.create({
      userId: session.user.id,
      action: "update",
      module: "tasks",
      entityId: taskId,
      details: `Updated task: ${task.title}${body.status && oldStatus !== body.status ? ` (status: ${oldStatus} → ${body.status})` : ''}`,
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
