import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Notification } from "@/models/Notification";
import { AuditLog } from "@/models/AuditLog";
import { allowRoles } from "@/lib/roleGuardServer";

export async function GET(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const unread = url.searchParams.get("unread");
  const priority = url.searchParams.get("priority");
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);
  const query: any = { userId: session.user.id };
  if (unread === "true") query.read = false;
  if (priority) query.priority = priority;
  const items = await Notification.find(query).sort({ createdAt: -1 }).limit(limit);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const doc = new Notification({ ...body, userId: session.user.id });
  await doc.save();
  await AuditLog.create({
    userId: session.user.id,
    action: "create",
    module: "notifications",
    entityId: doc._id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    timestamp: new Date(),
  });
  return NextResponse.json(doc, { status: 201 });
}
