import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Team } from "@/models/Team";
import { User } from "@/models/User";
import { allowRoles } from "@/lib/roleGuardServer";
import { AuditLog } from "@/models/AuditLog";

export async function GET(request: NextRequest, { params }: { params: Promise<{ organisationId: string }> }) {
  await connectDB();
  const { organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const url = new URL(request.url);
  const memberId = url.searchParams.get("memberId");
  const includeMembers = url.searchParams.get("includeMembers") === "true";
  
  const query: any = { organisationId };
  if (session.user.role === "employee") {
    query.members = session.user.id;
  } else if (memberId) {
    query.members = memberId;
  }
  
  let teams;
  if (includeMembers) {
    teams = await Team.find(query)
      .populate('members', 'name email role department avatar')
      .populate('leadId', 'name email role department avatar')
      .sort({ createdAt: -1 });
  } else {
    teams = await Team.find(query).sort({ createdAt: -1 });
  }
  
  return NextResponse.json(teams);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ organisationId: string }> }) {
  await connectDB();
  const { organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const body = await request.json();
  const { name, description, members, leadId } = body;
  
  // Validate required fields
  if (!name) {
    return NextResponse.json({ error: "Team name is required" }, { status: 400 });
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
  
  const doc = new Team({ 
    name, 
    description, 
    members: members || [], 
    leadId: leadId || null,
    organisationId, 
    createdBy: session.user.id 
  });
  
  await doc.save();
  
  await AuditLog.create({
    userId: session.user.id,
    action: "create",
    module: "teams",
    entityId: doc._id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    organisationId: organisationId,
    timestamp: new Date(),
  });
  
  return NextResponse.json(doc, { status: 201 });
}
