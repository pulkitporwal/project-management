import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Feedback } from "@/models/Feedback";
import { AuditLog } from "@/models/AuditLog";
import { allowRoles } from "@/lib/roleGuardServer";

export async function GET(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const givenTo = url.searchParams.get("givenTo");
  const givenBy = url.searchParams.get("givenBy");
  const status = url.searchParams.get("status");
  const query: any = {};
  if (session.user.role === "employee") {
    query.$or = [{ givenBy: session.user.id }, { givenTo: session.user.id }];
  } else {
    if (givenTo) query.givenTo = givenTo;
    if (givenBy) query.givenBy = givenBy;
  }
  if (status) query.status = status;
  const items = await Feedback.find(query).sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  await connectDB();
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if(!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const doc = new Feedback({ ...body, givenBy: session.user.id });
  await doc.save();
  await AuditLog.create({
    userId: session.user.id,
    action: "create",
    module: "feedback",
    entityId: doc._id,
    ipAddress: request.headers.get("x-forwarded-for") || "localhost",
    userAgent: request.headers.get("user-agent") || "",
    success: true,
    timestamp: new Date(),
  });
  return NextResponse.json(doc, { status: 201 });
}
