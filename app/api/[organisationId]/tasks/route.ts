import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Task } from "@/models/Task";
import { allowRoles } from "@/lib/roleGuardServer";
import { AuditLog } from "@/models/AuditLog";

export async function GET(request: NextRequest, { params }: { params: Promise<{ organisationId: string }> }) {
  await connectDB();
  const { organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  const status = url.searchParams.get("status");
  const assignedTo = url.searchParams.get("assignedTo");
  const query: any = { organisationId };
  if (projectId) query.projectId = projectId;
  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;
  if (session.user.role === "employee") {
    query.$or = [{ assignedTo: session.user.id }, { createdBy: session.user.id }];
  }
  const items = await Task.find(query).sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ organisationId: string }> }) {
  await connectDB();
  const { organisationId } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const doc = new Task({ ...body, organisationId, createdBy: session.user.id });
  await doc.save();
  await AuditLog.create({
    userId: session.user.id,
    action: "create",
    module: "tasks",
    entityId: doc._id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    organisationId: organisationId,
    timestamp: new Date(),
  });
  return NextResponse.json(doc, { status: 201 });
}
