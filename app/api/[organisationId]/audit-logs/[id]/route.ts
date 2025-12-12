import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { AuditLog } from "@/models/AuditLog";
import { allowRoles } from "@/lib/roleGuardServer";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string, organisationId: string}> }) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  const item = await AuditLog.findById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string, organisationId: string}> }) {
  await connectDB();
  const { id, organisationId } = await params;
  const { ok, res } = await allowRoles(["admin"]);
  if (!ok) return res;
  const item = await AuditLog.findById(id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await AuditLog.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
