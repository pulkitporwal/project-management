import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { OKR } from "@/models/OKR";
import { allowRoles } from "@/lib/roleGuardServer";
import { AuditLog } from "@/models/AuditLog";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string, organisationId: string}> }) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await OKR.findById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.user.role === "employee") {
    const isOwner = item.userId?.toString() === session.user.id;
    const inTeam = item.teamId?.toString() === (session as any).user.teamId;
    if (!(isOwner || inTeam)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  return NextResponse.json(item);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string,organisationId: string }> }) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const item = await OKR.findById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await request.json();
  Object.assign(item, body);
  await item.save();
  await AuditLog.create({
    userId: session.user.id,
    action: "update",
    module: "okrs",
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
  const item = await OKR.findById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await OKR.findByIdAndDelete(id);
  await AuditLog.create({
    userId: session.user.id,
    action: "delete",
    module: "okrs",
    entityId: id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    timestamp: new Date(),
  });
  return NextResponse.json({ success: true });
}
