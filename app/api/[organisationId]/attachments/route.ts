import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Attachment } from "@/models/Attachment";
import { AuditLog } from "@/models/AuditLog";
import { allowRoles } from "@/lib/roleGuardServer";

export async function GET(request: NextRequest) {
  await connectDB();
  const { ok, session , res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const taskId = url.searchParams.get("taskId");
  const projectId = url.searchParams.get("projectId");
  const commentId = url.searchParams.get("commentId");
  const baseQuery: any = {};
  if (taskId) baseQuery.taskId = taskId;
  if (projectId) baseQuery.projectId = projectId;
  if (commentId) baseQuery.commentId = commentId;
  const role = session.user.role;
  if (role === "employee") {
    baseQuery.$or = [{ uploadedBy: session.user.id }, { isPublic: true }];
  }
  const items = await Attachment.find(baseQuery).sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const doc = new Attachment({ ...body, uploadedBy: session.user.id });
  await doc.save();
  await AuditLog.create({
    userId: doc.uploadedBy,
    action: "create",
    module: "attachments",
    entityId: doc._id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    timestamp: new Date(),
  });
  return NextResponse.json(doc, { status: 201 });
}
