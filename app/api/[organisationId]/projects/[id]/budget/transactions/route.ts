import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { allowRoles } from "@/lib/roleGuardServer";
import { Project } from "@/models/Project";
import { BudgetTransaction } from "@/models/BudgetTransaction";
import { Budget } from "@/models/Budget";

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

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const type = url.searchParams.get('type')
  const category = url.searchParams.get('category')
  const limit = parseInt(url.searchParams.get('limit') || '50')

  // Build query
  const query: any = { projectId: id, organisationId }
  if (status) query.status = status
  if (type) query.type = type
  if (category) query.category = category

  const items = await BudgetTransaction.find(query)
    .populate('createdBy approvedBy', 'name email')
    .sort({ date: -1 })
    .limit(limit);
  
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
  const {
    amount,
    type,
    category,
    description,
    vendor,
    invoiceNumber,
    date,
    tags = [],
    location,
    paymentMethod,
    receiptUrl
  } = body;

  // Validate required fields
  if (!amount || !type) {
    return NextResponse.json({ 
      error: 'Amount and type are required' 
    }, { status: 400 })
  }

  // Find the budget for this project
  const budget = await Budget.findOne({ projectId: id, organisationId })
  if (!budget) {
    return NextResponse.json({ 
      error: 'Budget not found for this project' 
    }, { status: 404 })
  }

  // Create transaction
  const tx = new BudgetTransaction({ 
    ...body, 
    budgetId: budget._id,
    projectId: id, 
    organisationId, 
    createdBy: session.user.id,
    date: date ? new Date(date) : new Date(),
    tags: tags || [],
    status: 'approved' // Auto-approve for now
  });
  
  await tx.save();

  // Update budget category spent amount
  if (category && budget.categories) {
    const categoryIndex = budget.categories.findIndex(cat => cat.name === category)
    if (categoryIndex !== -1) {
      budget.categories[categoryIndex].spentAmount += type === 'expense' ? amount : -amount
      await budget.save()
    }
  }

  return NextResponse.json(await tx.populate('createdBy', 'name email'), { status: 201 });
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

