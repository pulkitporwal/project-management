import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Project } from "@/models/Project";
import { Kanban } from "@/models/Kanban";
import { allowRoles } from "@/lib/roleGuardServer";
import { AuditLog } from "@/models/AuditLog";

export async function GET(request: NextRequest, { params }: { params: Promise<{ organisationId: string }> }) {
  await connectDB();
  const { organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const visibility = url.searchParams.get("visibility");
  const query: any = { organisationId };
  if (status) query.status = status;
  if (visibility) query.visibility = visibility;
  if (session.user.role === "employee") {
    query.$or = [
      { members: session.user.id },
      { createdBy: session.user.id },
      { visibility: "public" },
    ];
  }
  const items = await Project.find(query).sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ organisationId: string }> }) {
  await connectDB();
  const { organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const doc = new Project({
    ...body, createdBy: session.user.id,
    organisationId: organisationId,
  });
  await doc.save();

  // Create default Kanban board for the project
  const defaultKanban = new Kanban({
    projectId: doc._id,
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

  await AuditLog.create({
    userId: session.user.id,
    action: "create",
    module: "projects",
    entityId: doc._id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    organisationId: organisationId,
    timestamp: new Date(),
  });
  return NextResponse.json(doc, { status: 201 });
}
