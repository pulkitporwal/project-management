import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Comment } from "@/models/Comment";
import { AuditLog } from "@/models/AuditLog";
import { allowRoles } from "@/lib/roleGuardServer";

export async function GET(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const taskId = url.searchParams.get("taskId");
  const projectId = url.searchParams.get("projectId");
  const query: any = {};
  if (taskId) query.taskId = taskId;
  if (projectId) query.projectId = projectId;
  if (session.user.role === "employee" && !taskId && !projectId) {
    return NextResponse.json([], { status: 200 });
  }
  const items = await Comment.find(query).sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const doc = new Comment({ ...body, userId: session.user.id });
  await doc.save();
  await AuditLog.create({
    userId: session.user.id,
    action: "create",
    module: "comments",
    entityId: doc._id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    timestamp: new Date(),
  });
  return NextResponse.json(doc, { status: 201 });
}
