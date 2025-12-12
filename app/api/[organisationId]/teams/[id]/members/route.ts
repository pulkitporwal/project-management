import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Team } from "@/models/Team";
import { User } from "@/models/User";
import { allowRoles } from "@/lib/roleGuardServer";
import { AuditLog } from "@/models/AuditLog";

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
  const { memberIds, action } = body; // action: 'add' | 'remove'

  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    return NextResponse.json({ error: "Member IDs are required" }, { status: 400 });
  }

  if (!action || !['add', 'remove'].includes(action)) {
    return NextResponse.json({ error: "Valid action (add/remove) is required" }, { status: 400 });
  }

  // Find the team
  const team = await Team.findOne({ _id: id, organisationId });
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const memberUsers = await User.find({
    _id: { $in: memberIds },
    associatedWith: { $elemMatch: { organisationId, isActive: true } }
  });
  if (memberUsers.length !== memberIds.length) {
    return NextResponse.json({ error: "Some members are not part of this organization" }, { status: 400 });
  }

  // Update team members
  if (action === 'add') {
    // Add new members (avoid duplicates)
    const newMembers = memberIds.filter(id => !team.members.map(String).includes(id));
    team.members.push(...(newMembers as any));
  } else if (action === 'remove') {
    // Remove members
    team.members = team.members.filter((memberId: any) => !memberIds.includes(memberId));

    // If lead is being removed, clear the lead
    if (team.leadId && memberIds.includes(team.leadId.toString())) {
      team.leadId = null;
    }
  }

  await team.save();

  await AuditLog.create({
    userId: session.user.id,
    action: action === 'add' ? "add_members" : "remove_members",
    module: "teams",
    entityId: team._id,
    details: { memberIds, action },
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    organisationId: organisationId,
    timestamp: new Date(),
  });

  return NextResponse.json({
    message: `Members ${action}ed successfully`,
    team: team
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string; id: string }> }
) {
  await connectDB();
  const { organisationId, id } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Find the team with populated members
  const team = await Team.findOne({ _id: id, organisationId })
    .populate('members', 'name email role department avatar')
    .populate('leadId', 'name email role department avatar');

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  // Employees can only see team details if they are members
  if (session.user.role === "employee" && !team.members.some((member: any) => member._id.toString() === session.user.id)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  return NextResponse.json(team.members);
}
