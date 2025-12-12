import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { allowRoles } from "@/lib/roleGuardServer";
import { Sprint } from "@/models/Sprint";
import { Project } from "@/models/Project";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string; id: string }> }
) {
  await connectDB();
  const { organisationId, id } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await Project.findOne({ _id: id, organisationId });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const sprints = await Sprint.find({ projectId: id, organisationId }).sort({ startDate: -1 });
  return NextResponse.json(sprints);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string; id: string }> }
) {
  await connectDB();
  const { organisationId, id } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, goal, startDate, endDate, committedPoints, capacityPoints } = body;
  const sprint = new Sprint({
    projectId: id,
    organisationId,
    name,
    goal,
    startDate,
    endDate,
    state: 'planned',
    committedPoints: committedPoints || 0,
    capacityPoints: capacityPoints || 0,
  });
  await sprint.save();
  return NextResponse.json(sprint, { status: 201 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string; id: string }> }
) {
  await connectDB();
  const { organisationId, id } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { sprintId, ...updates } = body;
  if (!sprintId) return NextResponse.json({ error: 'sprintId is required' }, { status: 400 });
  const sprint = await Sprint.findOne({ _id: sprintId, projectId: id, organisationId });
  if (!sprint) return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });
  Object.assign(sprint, updates);
  await sprint.save();
  return NextResponse.json(sprint);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string; id: string }> }
) {
  await connectDB();
  const { organisationId, id } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const sprintId = url.searchParams.get('sprintId');
  if (!sprintId) return NextResponse.json({ error: 'sprintId is required' }, { status: 400 });
  const sprint = await Sprint.findOne({ _id: sprintId, projectId: id, organisationId });
  if (!sprint) return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });
  await Sprint.deleteOne({ _id: sprintId });
  return NextResponse.json({ success: true });
}

