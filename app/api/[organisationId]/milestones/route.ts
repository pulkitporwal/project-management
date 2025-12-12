import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Milestone } from "@/models/Milestone";
import { Project } from "@/models/Project";
import { AuditLog } from "@/models/AuditLog";
import { allowRoles } from "@/lib/roleGuardServer";

export async function GET(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  const query: any = {};
  if (projectId) query.projectId = projectId;
  if (session.user.role === "employee") {
    if (!projectId) return NextResponse.json([], { status: 200 });
    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json([], { status: 200 });
    const isMember = project.members.map(String).includes(session.user.id);
    const isCreator = project.createdBy.toString() === session.user.id;
    const inTeam = project.assignedTeams.map(String).includes((project as any).teamId);
    const isPublic = project.visibility === "public";
    if (!(isMember || isCreator || isPublic)) {
      return NextResponse.json([], { status: 200 });
    }
  }
  const items = await Milestone.find(query).sort({ dueDate: 1 });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const doc = new Milestone({ ...body, createdBy: session.user.id });
  await doc.save()
  await AuditLog.create({
    userId: session.user.id,
    action: "create",
    module: "milestones",
    entityId: doc._id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    timestamp: new Date(),
  });
  return NextResponse.json(doc, { status: 201 });
}
