import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Team } from "@/models/Team";
import { User } from "@/models/User";
import { allowRoles } from "@/lib/roleGuardServer";
import { AuditLog } from "@/models/AuditLog";

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ organisationId: string; id: string }> }
) {
  await connectDB();
  const { organisationId, id } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const includeMembers = url.searchParams.get("includeMembers") === "true";

  const query: any = { _id: id, organisationId };
  
  // Employees can only see teams they are members of
  if (session.user.role === "employee") {
    query.members = session.user.id;
  }

  let team;
  if (includeMembers) {
    team = await Team.findOne(query)
      .populate('members', 'name email role department avatar')
      .populate('leadId', 'name email role department avatar')
      .populate('createdBy', 'name email');
  } else {
    team = await Team.findOne(query);
  }

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  return NextResponse.json(team);
}

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ organisationId: string; id: string }> }
) {
  await connectDB();
  const { organisationId, id } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, description, members, leadId } = body;

  // Find the team
  const team = await Team.findOne({ _id: id, organisationId });
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  // Validate lead and members exist in the organization
  if (leadId) {
    const lead = await User.findOne({ _id: leadId, organisationId });
    if (!lead) {
      return NextResponse.json({ error: "Team lead not found in this organization" }, { status: 400 });
    }
  }

  if (members && members.length > 0) {
    const memberUsers = await User.find({ _id: { $in: members }, organisationId });
    if (memberUsers.length !== members.length) {
      return NextResponse.json({ error: "Some members not found in this organization" }, { status: 400 });
    }
  }

  // Update team
  if (name) team.name = name;
  if (description !== undefined) team.description = description;
  if (members) team.members = members;
  if (leadId !== undefined) team.leadId = leadId;

  await team.save();

  await AuditLog.create({
    userId: session.user.id,
    action: "update",
    module: "teams",
    entityId: team._id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    organisationId: organisationId,
    timestamp: new Date(),
  });

  return NextResponse.json(team);
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

  // Find and delete the team
  const team = await Team.findOne({ _id: id, organisationId });
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  await Team.findByIdAndDelete(id);

  await AuditLog.create({
    userId: session.user.id,
    action: "delete",
    module: "teams",
    entityId: id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    organisationId: organisationId,
    timestamp: new Date(),
  });

  return NextResponse.json({ message: "Team deleted successfully" });
}
