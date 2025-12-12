import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Feedback } from "@/models/Feedback";
import { AuditLog } from "@/models/AuditLog";
import { allowRoles } from "@/lib/roleGuardServer";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string, organisationId: string}> }) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await Feedback.findById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.user.role === "employee") {
    const canView = item.givenBy.toString() === session.user.id || item.givenTo.toString() === session.user.id;
    if (!canView) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(item);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string,organisationId: string }> }) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await Feedback.findById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const canEdit = session.user.role !== "employee" || item.givenBy.toString() === session.user.id;
  if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  Object.assign(item, body);
  await item.save();
  await AuditLog.create({
    userId: session.user.id,
    action: "update",
    module: "feedback",
    entityId: item._id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    timestamp: new Date(),
  });
  return NextResponse.json(item);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string,organisationId: string }> }) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await Feedback.findById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await Feedback.findByIdAndDelete(id);
  await AuditLog.create({
    userId: session.user.id,
    action: "delete",
    module: "feedback",
    entityId: id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    timestamp: new Date(),
  });
  return NextResponse.json({ success: true });
}
