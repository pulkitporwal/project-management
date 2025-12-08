import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { PerformanceReview } from "@/models/PerformanceReview";
import { AuditLog } from "@/models/AuditLog";
import { allowRoles } from "@/lib/roleGuardServer";

export async function GET(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const query: any = {};
  if (session.user.role === "employee") {
    query.userId = session.user.id;
  } else if (userId) {
    query.userId = userId;
  }
  const items = await PerformanceReview.find(query).sort({ reviewDate: -1 });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const doc = new PerformanceReview({ ...body, createdBy: session.user.id });
  await doc.save();
  await AuditLog.create({
    userId: session.user.id,
    action: "create",
    module: "performance-reviews",
    entityId: doc._id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    timestamp: new Date(),
  });
  return NextResponse.json(doc, { status: 201 });
}
