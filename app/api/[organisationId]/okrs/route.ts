import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { OKR } from "@/models/OKR";
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
  const quarter = url.searchParams.get("quarter");
  const year = url.searchParams.get("year");
  const query: any = {};
  if (session.user.role === "employee") {
    query.$or = [{ userId: session.user.id }, { teamId: (session as any).user.teamId }];
  } else {
    if (userId) query.userId = userId;
    if (teamId) query.teamId = teamId;
  }
  if (quarter) query.quarter = parseInt(quarter, 10);
  if (year) query.year = parseInt(year, 10);
  const items = await OKR.find(query).sort({ lastUpdated: -1 });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const doc = new OKR({ ...body, createdBy: body.createdBy || session.user.id });
  await doc.save();
  await AuditLog.create({
    userId: session.user.id,
    action: "create",
    module: "okrs",
    entityId: doc._id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    timestamp: new Date(),
  });
  return NextResponse.json(doc, { status: 201 });
}
