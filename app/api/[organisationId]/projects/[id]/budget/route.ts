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

  const budget = await Budget.findOne({ projectId: id, organisationId })
    .populate('allocatedBy approvedBy', 'name email');
  const txs = await BudgetTransaction.find({ projectId: id, organisationId, status: 'approved' })
    .populate('createdBy approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(50);
  const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const incomes = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const actualCost = Math.max(0, expenses - incomes);

  // Enhanced budget data
  const budgetData = budget ? {
    ...budget.toObject(),
    totalSpentAmount: budget.totalSpentAmount,
    remainingBudget: budget.remainingBudget,
    utilizationPercentage: budget.utilizationPercentage,
    alertLevel: budget.alertLevel,
    isOverBudget: budget.isOverBudget,
    isExpired: budget.isExpired
  } : null;

  return NextResponse.json({
    budget: budgetData,
    transactions: txs,
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
  const { 
    totalBudget, 
    currency, 
    notes,
    categories = [],
    period,
    alertThresholds
  } = body;
  
  let budget = await Budget.findOne({ projectId: id, organisationId });
  if (!budget) {
    budget = new Budget({ 
      projectId: id, 
      organisationId, 
      totalBudget, 
      currency: currency || 'USD', 
      notes,
      categories: categories.map(cat => ({
        ...cat,
        spentAmount: 0
      })),
      period: period ? {
        startDate: new Date(period.startDate),
        endDate: new Date(period.endDate),
        type: period.type || 'project'
      } : {
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
        type: 'project'
      },
      alertThresholds: alertThresholds || {
        warningAt: 80,
        criticalAt: 95
      },
      allocatedBy: session.user.id 
    });
  } else {
    if (totalBudget !== undefined) budget.totalBudget = totalBudget;
    if (currency) budget.currency = currency;
    if (notes !== undefined) budget.notes = notes;
    if (categories) budget.categories = categories;
    if (period) {
      budget.period.startDate = new Date(period.startDate);
      budget.period.endDate = new Date(period.endDate);
      if (period.type) budget.period.type = period.type;
    }
    if (alertThresholds) budget.alertThresholds = alertThresholds;
  }
  await budget.save();
  return NextResponse.json(await budget.populate('allocatedBy', 'name email'));
}

