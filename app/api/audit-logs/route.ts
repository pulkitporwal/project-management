import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { AuditLog } from "@/models/AuditLog";
import { allowRoles } from "@/lib/roleGuardServer";

export async function GET(request: NextRequest) {
  await connectDB();
  const { ok, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  const url = new URL(request.url);
  const module = url.searchParams.get("module");
  const userId = url.searchParams.get("userId");
  const severity = url.searchParams.get("severity");
  const success = url.searchParams.get("success");
  const query: any = {};
  if (module) query.module = module;
  if (userId) query.userId = userId;
  if (severity) query.severity = severity;
  if (success) query.success = success === "true";
  const items = await AuditLog.find(query).sort({ timestamp: -1 }).limit(500);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const doc = await AuditLog.create({
    ...body,
    userId: body.userId || session.user.id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
  });
  return NextResponse.json(doc, { status: 201 });
}
