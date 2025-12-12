import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { allowRoles } from "@/lib/roleGuardServer";
import { Project } from "@/models/Project";
import { Task } from "@/models/Task";
import { Sprint } from "@/models/Sprint";

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

  if (session.user.role === "employee") {
    const canView = project.members.map(String).includes(session.user.id) ||
      project.createdBy.toString() === session.user.id ||
      project.visibility === "public";
    if (!canView) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tasks = await Task.find({ projectId: id, organisationId });

  const statusCounts: Record<string, number> = {
    backlog: 0, todo: 0, "in-progress": 0, "in-review": 0, done: 0, cancelled: 0
  };
  let doneLeadTimes: number[] = [];
  let doneCycleTimes: number[] = [];
  let backlogCount = 0;
  let wipCount = 0;
  let totalStoryPoints = 0;

  for (const t of tasks) {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    if (t.status === 'backlog') backlogCount += 1;
    if (t.status === 'in-progress' || t.status === 'in-review') wipCount += 1;
    totalStoryPoints += (t as any).storyPoints || 0;
    if (t.status === 'done' && t.actualEndDate) {
      const createdAt = (t as any).createdAt as Date;
      const start = t.actualStartDate || createdAt;
      const end = t.actualEndDate as Date;
      const lead = end.getTime() - createdAt.getTime();
      const cycle = end.getTime() - start.getTime();
      doneLeadTimes.push(lead);
      doneCycleTimes.push(cycle);
    }
  }

  const avgMs = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  const msToDays = (ms: number) => (ms ? Math.round(ms / (1000 * 60 * 60 * 24)) : 0);

  const currentSprint = await Sprint.findOne({ projectId: id, organisationId, state: 'active' }).sort({ startDate: -1 });
  const recentSprints = await Sprint.find({ projectId: id, organisationId }).sort({ endDate: -1 }).limit(3);

  let velocity = 0;
  if (recentSprints.length) {
    const sprintIds = recentSprints.map(s => s._id);
    const sprintDoneTasks = await Task.find({ sprintId: { $in: sprintIds }, status: 'done' });
    velocity = sprintDoneTasks.reduce((sum, t: any) => sum + (t.storyPoints || 0), 0);
  }

  const burndown = currentSprint ? {
    committedPoints: currentSprint.committedPoints || 0,
    completedPoints: currentSprint.completedPoints || 0,
    remainingPoints: Math.max(0, (currentSprint.committedPoints || 0) - (currentSprint.completedPoints || 0)),
    daysLeft: Math.max(0, Math.ceil(((currentSprint.endDate as any) - Date.now()) / (1000 * 60 * 60 * 24)))
  } : null;

  return NextResponse.json({
    statusCounts,
    backlogCount,
    wipCount,
    leadTimeAvgDays: msToDays(avgMs(doneLeadTimes)),
    cycleTimeAvgDays: msToDays(avgMs(doneCycleTimes)),
    velocityPointsLast3Sprints: velocity,
    totalStoryPoints,
    burndown,
  });
}

