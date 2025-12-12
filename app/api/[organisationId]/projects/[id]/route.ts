import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Project } from "@/models/Project";
import { Kanban } from "@/models/Kanban";
import { allowRoles } from "@/lib/roleGuardServer";
import { AuditLog } from "@/models/AuditLog";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string, organisationId: string }> }) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  // First check if project exists at all
  const projectExists = await Project.findById(id);
  
  const item = await Project.findOne({ _id: id, organisationId });
  
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.user.role === "employee") {
    const canView = item.members.map(String).includes(session.user.id) ||
      item.createdBy.toString() === session.user.id ||
      item.visibility === "public";
    if (!canView) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check if kanban board exists, create default if not
  const existingKanban = await Kanban.findOne({ projectId: id });
  if (!existingKanban) {
    const defaultKanban = new Kanban({
      projectId: id,
      title: "Default Kanban Board",
      description: "Default kanban board for project management",
      columns: [
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
          id: 'review',
          title: 'Review',
          order: 2,
          color: '#8b5cf6',
          cards: []
        },
        {
          id: 'done',
          title: 'Done',
          order: 3,
          color: '#10b981',
          cards: []
        }
      ],
      createdBy: session.user.id,
      members: [session.user.id],
      isDefault: true
    });
    await defaultKanban.save();
  }

  return NextResponse.json(item);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string, organisationId: string }> }) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await Project.findOne({ _id: id, organisationId });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await request.json();
  Object.assign(item, body);
  await item.save();
  await AuditLog.create({
    userId: session.user.id,
    action: "update",
    module: "projects",
    entityId: item._id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    organisationId: organisationId,
    timestamp: new Date(),
  });
  return NextResponse.json(item);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string, organisationId: string }> }) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin"]);
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await Project.findOne({ _id: id, organisationId });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await Project.findOneAndDelete({ _id: id, organisationId });
  await AuditLog.create({
    userId: session.user.id,
    action: "delete",
    module: "projects",
    entityId: id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    organisationId: organisationId,
    timestamp: new Date(),
  });
  return NextResponse.json({ success: true });
}
