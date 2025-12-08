import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Settings } from "@/models/Settings";
import { allowRoles } from "@/lib/roleGuardServer";
import { AuditLog } from "@/models/AuditLog";

export async function GET(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const teamId = url.searchParams.get("teamId");

  const query: any = {};
  if (session.user.role === "employee") {
    query.userId = session.user.id;
  } else {
    if (userId) query.userId = userId;
    if (teamId) query.teamId = teamId;
  }
  const items = await Settings.find(query);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();

  if (session.user.role === "employee") {
    const doc = await Settings.findOneAndUpdate(
      { userId: session.user.id },
      { ...body, userId: session.user.id, teamId: undefined },
      { upsert: true, new: true }
    );
    await AuditLog.create({
      userId: session.user.id,
      action: "upsert",
      module: "settings",
      entityId: doc._id,
      ipAddress: request.headers.get("x-forwarded-for") || "localhost",
      userAgent: request.headers.get("user-agent") || "",
      success: true,
      timestamp: new Date(),
    });
    return NextResponse.json(doc, { status: 201 });
  }

  const doc = await Settings.findOneAndUpdate(
    { userId: body.userId, teamId: body.teamId },
    body,
    { upsert: true, new: true }
  );
  await AuditLog.create({
    userId: session.user.id,
    action: "upsert",
    module: "settings",
    entityId: doc._id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    timestamp: new Date(),
  });
  return NextResponse.json(doc, { status: 201 });
}
