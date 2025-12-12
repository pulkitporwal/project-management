import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { allowRoles } from "@/lib/roleGuardServer";
import { Project } from "@/models/Project";
import { BudgetTransaction } from "@/models/BudgetTransaction";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string; id: string }> }
) {
  await connectDB();
  const { organisationId, id } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager", "employee"]);
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const project = await Project.findOne({ _id: id, organisationId });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const items = await BudgetTransaction.find({ projectId: id, organisationId }).sort({ date: -1 });
  return NextResponse.json(items);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string; id: string }> }
) {
  await connectDB();
  const { organisationId, id } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const tx = new BudgetTransaction({ ...body, projectId: id, organisationId, createdBy: session.user.id });
  await tx.save();
  return NextResponse.json(tx, { status: 201 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string; id: string }> }
) {
  await connectDB();
  const { organisationId, id } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { transactionId, ...updates } = body;
  if (!transactionId) return NextResponse.json({ error: 'transactionId is required' }, { status: 400 });
  const tx = await BudgetTransaction.findOne({ _id: transactionId, projectId: id, organisationId });
  if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  Object.assign(tx, updates);
  await tx.save();
  return NextResponse.json(tx);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string; id: string }> }
) {
  await connectDB();
  const { organisationId, id } = await params;
  const { ok, session, res } = await allowRoles(["admin", "manager"]);
  if (!ok) return res;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const transactionId = url.searchParams.get('transactionId');
  if (!transactionId) return NextResponse.json({ error: 'transactionId is required' }, { status: 400 });
  const tx = await BudgetTransaction.findOne({ _id: transactionId, projectId: id, organisationId });
  if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
  await BudgetTransaction.deleteOne({ _id: transactionId });
  return NextResponse.json({ success: true });
}

