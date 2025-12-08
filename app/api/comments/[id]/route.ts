import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Comment } from "@/models/Comment";
import { AuditLog } from "@/models/AuditLog";
import { allowRoles } from "@/lib/roleGuardServer";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { ok, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  const { id } = await params;
  const item = await Comment.findById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  const { id } = await params;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await Comment.findById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const canEdit = session.user.role !== "employee" || item.userId.toString() === session.user.id;
  if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  Object.assign(item, body);
  await item.save();
  await AuditLog.create({
    userId: session.user.id,
    action: "update",
    module: "comments",
    entityId: item._id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    timestamp: new Date(),
  });
  return NextResponse.json(item);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  const { id } = await params;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await Comment.findById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const canDelete = session.user.role !== "employee" || item.userId.toString() === session.user.id;
  if (!canDelete) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await Comment.findByIdAndDelete(id);
  await AuditLog.create({
    userId: session.user.id,
    action: "delete",
    module: "comments",
    entityId: id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    timestamp: new Date(),
  });
  return NextResponse.json({ success: true });
}
