import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Kanban } from "@/models/Kanban";
import { Project } from "@/models/Project";
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

  // Get kanban boards for this project
  const kanbanBoards = await Kanban.find({ 
    projectId: id, 
    archived: false 
  }).populate('members', 'name email avatar')
   .populate('createdBy', 'name email avatar')
   .populate('columns.cards.assignedTo', 'name email avatar')
   .populate('columns.cards.createdBy', 'name email avatar');

  return NextResponse.json(kanbanBoards);
}

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string, organisationId: string }> }
) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if project exists
  const project = await Project.findOne({ _id: id, organisationId });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const body = await request.json();
  
  // Create new kanban board
  const kanbanBoard = new Kanban({
    projectId: id,
    title: body.title,
    description: body.description,
    columns: body.columns || [
      {
        id: 'todo',
        title: 'To Do',
        order: 0,
        color: '#6366f1',
        cards: []
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        order: 1,
        color: '#f59e0b',
        cards: []
      },
      {
        id: 'done',
        title: 'Done',
        order: 2,
        color: '#10b981',
        cards: []
      }
    ],
    createdBy: session.user.id,
    members: body.members || [session.user.id],
    isDefault: body.isDefault || false
  });

  await kanbanBoard.save();

  // Log the action
  await AuditLog.create({
    userId: session.user.id,
    action: "create",
    module: "kanban",
    entityId: kanbanBoard._id,
    details: `Created kanban board: ${kanbanBoard.title}`,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    organisationId: organisationId,
    timestamp: new Date(),
  });

  return NextResponse.json(kanbanBoard);
}

export async function PATCH(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string, organisationId: string }> }
) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check if project exists
  const project = await Project.findOne({ _id: id, organisationId });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const body = await request.json();
  const { kanbanId, action, ...data } = body;

  if (!kanbanId || !action) {
    return NextResponse.json({ error: "kanbanId and action are required" }, { status: 400 });
  }

  try {
    const kanbanBoard = await Kanban.findOne({ _id: kanbanId, projectId: id });
    if (!kanbanBoard) {
      return NextResponse.json({ error: "Kanban board not found" }, { status: 404 });
    }

    if (action === "addColumn") {
      const { title } = data;
      if (!title) {
        return NextResponse.json({ error: "Column title is required" }, { status: 400 });
      }

      const newColumn = {
        id: `col-${Date.now()}`,
        title,
        order: kanbanBoard.columns.length,
        color: '#6366f1',
        cards: []
      };

      kanbanBoard.columns.push(newColumn);
      await kanbanBoard.save();

      // Log the action
      await AuditLog.create({
        userId: session.user.id,
        action: "update",
        module: "kanban",
        entityId: kanbanBoard._id,
        details: `Added column: ${title}`,
        ipAddress: request.headers.get("x-forwarded-for") || "localhost",
        userAgent: request.headers.get("user-agent") || "",
        success: true,
        organisationId: organisationId,
        timestamp: new Date(),
      });

      return NextResponse.json({ column: newColumn });
    }

    if (action === "addCard") {
      const { columnId, title, description, priority, labels, assignedTo, dueDate } = data;
      if (!columnId || !title) {
        return NextResponse.json({ error: "columnId and title are required" }, { status: 400 });
      }

      const column = kanbanBoard.columns.find((col:any) => col.id === columnId);
      if (!column) {
        return NextResponse.json({ error: "Column not found" }, { status: 404 });
      }

      const newCard = {
        id: `card-${Date.now()}`,
        title,
        description,
        priority: priority || 'medium',
        labels: labels || [],
        dueDate: dueDate ? new Date(dueDate) : undefined,
        order: column.cards.length,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: session.user.id,
        attachments: [],
        comments: [],
        assignedTo: assignedTo || undefined
      };

      column.cards.push(newCard);
      await kanbanBoard.save();

      // Log the action
      await AuditLog.create({
        userId: session.user.id,
        action: "update",
        module: "kanban",
        entityId: kanbanBoard._id,
        details: `Added card: ${title} to column: ${column.title}`,
        ipAddress: request.headers.get("x-forwarded-for") || "localhost",
        userAgent: request.headers.get("user-agent") || "",
        success: true,
        organisationId: organisationId,
        timestamp: new Date(),
      });

      return NextResponse.json({ card: newCard });
    }

    if (action === "removeColumn") {
      const { columnId } = data;
      if (!columnId) {
        return NextResponse.json({ error: "columnId is required" }, { status: 400 });
      }

      const column = kanbanBoard.columns.find((col:any) => col.id === columnId);
      if (!column) {
        return NextResponse.json({ error: "Column not found" }, { status: 404 });
      }

      // Don't allow removing the last column
      if (kanbanBoard.columns.length <= 1) {
        return NextResponse.json({ error: "Cannot remove the last column" }, { status: 400 });
      }

      kanbanBoard.columns = kanbanBoard.columns.filter((col:any) => col.id !== columnId);
      await kanbanBoard.save();

      // Log the action
      await AuditLog.create({
        userId: session.user.id,
        action: "update",
        module: "kanban",
        entityId: kanbanBoard._id,
        details: `Removed column: ${column.title}`,
        ipAddress: request.headers.get("x-forwarded-for") || "localhost",
        userAgent: request.headers.get("user-agent") || "",
        success: true,
        organisationId: organisationId,
        timestamp: new Date(),
      });

      return NextResponse.json({ success: true, message: "Column removed successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error('Kanban update error:', error);
    return NextResponse.json({ error: "Failed to update kanban board" }, { status: 500 });
  }
}
