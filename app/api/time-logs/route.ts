import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { TimeLog } from "@/models/TimeLog";
import { allowRoles } from "@/lib/roleGuardServer";
import { AuditLog } from "@/models/AuditLog";

export async function GET(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const taskId = url.searchParams.get("taskId");
  const projectId = url.searchParams.get("projectId");
  const approved = url.searchParams.get("approved");
  const query: any = {};
  if (session.user.role === "employee") {
    query.userId = session.user.id;
  } else {
    if (userId) query.userId = userId;
  }
  if (taskId) query.taskId = taskId;
  if (projectId) query.projectId = projectId;
  if (approved) query.approved = approved === "true";
  const items = await TimeLog.find(query).sort({ date: -1 });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const ownerId = session.user.role === "employee" ? session.user.id : (body.userId || session.user.id);
  const doc = new TimeLog({ ...body, userId: ownerId });
  await doc.save();
  await AuditLog.create({
    userId: session.user.id,
    action: "create",
    module: "timelogs",
    entityId: doc._id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    timestamp: new Date(),
  });
  return NextResponse.json(doc, { status: 201 });
}
