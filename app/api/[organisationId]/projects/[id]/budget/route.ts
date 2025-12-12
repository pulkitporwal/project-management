import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { allowRoles } from "@/lib/roleGuardServer";
import { Project } from "@/models/Project";
import { Budget } from "@/models/Budget";
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

  const budget = await Budget.findOne({ projectId: id, organisationId });
  const txs = await BudgetTransaction.find({ projectId: id, organisationId, status: 'approved' });
  const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const incomes = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const actualCost = Math.max(0, expenses - incomes);

  return NextResponse.json({
    budget: budget || null,
    currency: budget?.currency || 'USD',
    totalBudget: budget?.totalBudget || project.budget || 0,
    actualCost,
    remaining: Math.max(0, (budget?.totalBudget || project.budget || 0) - actualCost),
  });
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
  const { totalBudget, currency, notes } = body;
  let budget = await Budget.findOne({ projectId: id, organisationId });
  if (!budget) {
    budget = new Budget({ projectId: id, organisationId, totalBudget, currency: currency || 'USD', notes, allocatedBy: session.user.id });
  } else {
    if (totalBudget !== undefined) budget.totalBudget = totalBudget;
    if (currency) budget.currency = currency;
    if (notes !== undefined) budget.notes = notes;
  }
  await budget.save();
  return NextResponse.json(budget);
}

