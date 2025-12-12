import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { SkillAssessment } from "@/models/SkillAssessment";
import { allowRoles } from "@/lib/roleGuardServer";
import { AuditLog } from "@/models/AuditLog";

export async function GET(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const skillId = url.searchParams.get("skillId");
  const status = url.searchParams.get("status");
  const query: any = {};
  if (session.user.role === "employee") {
    query.userId = session.user.id;
  } else {
    if (userId) query.userId = userId;
    if (skillId) query.skillId = skillId;
  }
  if (status) query.status = status;
  const items = await SkillAssessment.find(query).sort({ assessmentDate: -1 });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const ownerId = session.user.role === "employee" ? session.user.id : (body.userId || session.user.id);
  const doc = new SkillAssessment({ ...body, userId: ownerId });
  await doc.save();
  await AuditLog.create({
    userId: session.user.id,
    action: "create",
    module: "skills",
    entityId: doc._id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    timestamp: new Date(),
  });
  return NextResponse.json(doc, { status: 201 });
}
