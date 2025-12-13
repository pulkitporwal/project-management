import { NextRequest, NextResponse } from 'next/server'
import { Budget } from '@/models/Budget'
import { BudgetTransaction } from '@/models/BudgetTransaction'
import { Project } from '@/models/Project'
import connectDB from '@/lib/db'
import { allowRoles } from '@/lib/roleGuardServer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ organisationId: string; id: string }> }
) {
  try {
    await connectDB()
    const { organisationId, id } = await params
    const { ok, session, res } = await allowRoles(["admin", "manager", "employee"])
    if (!ok) return res
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(request.url)
    const timeRange = parseInt(url.searchParams.get('timeRange') || '30')

    // Get budget and transactions
    const budget = await Budget.findOne({ projectId: id, organisationId })
    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    const transactions = await BudgetTransaction.find({ 
      projectId: id, 
      organisationId, 
      status: 'approved' 
    }).sort({ date: -1 })

    // Calculate basic metrics
    const totalSpent = transactions.reduce((sum, tx) => 
      sum + (tx.type === 'expense' ? tx.amount : -tx.amount), 0
    )
    const totalBudget = budget.totalBudget
    const remainingBudget = totalBudget - totalSpent
    const utilizationPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    // Calculate monthly trends
    const now = new Date()
    const startDate = new Date(now.getTime() - timeRange * 24 * 60 * 60 * 1000)
    const recentTransactions = transactions.filter(tx => new Date(tx.date) >= startDate)

    // Group by month
    const monthlyData = recentTransactions.reduce((acc: any, tx) => {
      const month = new Date(tx.date).toISOString().slice(0, 7)
      if (!acc[month]) {
        acc[month] = { spent: 0, count: 0 }
      }
      acc[month].spent += tx.type === 'expense' ? tx.amount : -tx.amount
      acc[month].count += 1
      return acc
    }, {})

    const months = Object.keys(monthlyData).sort()
    const monthlyTrend = {
      averageMonthlySpend: months.length > 0 
        ? months.reduce((sum, month) => sum + monthlyData[month].spent, 0) / months.length 
        : 0,
      spentChange: months.length >= 2 
        ? ((monthlyData[months[months.length - 1]].spent - monthlyData[months[months.length - 2]].spent) / 
           Math.abs(monthlyData[months[months.length - 2]].spent)) * 100 
        : 0
    }

    // Category breakdown
    const categoryBreakdown = (budget.categories || []).map((category: any) => ({
      name: category.name,
      budgeted: category.allocatedAmount,
      spent: category.spentAmount || 0,
      transactionCount: transactions.filter(tx => tx.category === category.name).length
    }))

    // Vendor breakdown
    const vendorData = transactions.reduce((acc: any, tx) => {
      if (tx.vendor) {
        if (!acc[tx.vendor]) {
          acc[tx.vendor] = { totalSpent: 0, count: 0 }
        }
        acc[tx.vendor].totalSpent += tx.amount
        acc[tx.vendor].count += 1
      }
      return acc
    }, {})

    const vendorBreakdown = Object.entries(vendorData)
      .map(([name, data]: [string, any]) => ({ name, ...data }))
      .sort((a, b) => b.totalSpent - a.totalSpent)

    // Projected spend
    const daysInPeriod = timeRange
    const dailyAverage = daysInPeriod > 0 ? totalSpent / daysInPeriod : 0
    const remainingDays = budget.period.endDate 
      ? Math.max(0, Math.ceil((new Date(budget.period.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 30
    const projectedSpend = totalSpent + (dailyAverage * remainingDays)
    const overBudget = projectedSpend > totalBudget ? projectedSpend - totalBudget : 0

    // Generate alerts
    const alerts = []
    if (utilizationPercentage >= 95) {
      alerts.push({
        severity: 'critical',
        title: 'Budget Nearly Exhausted',
        description: `You've used ${utilizationPercentage.toFixed(1)}% of your budget`
      })
    } else if (utilizationPercentage >= 80) {
      alerts.push({
        severity: 'warning',
        title: 'Budget Usage High',
        description: `You've used ${utilizationPercentage.toFixed(1)}% of your budget`
      })
    }

    // Check for overspending categories
    categoryBreakdown.forEach(category => {
      if (category.spent > category.budgeted) {
        alerts.push({
          severity: 'warning',
          title: 'Category Over Budget',
          description: `${category.name} is over budget by ${category.spent - category.budgeted}`
        })
      }
    })

    // Savings opportunities
    const savingsOpportunities = []
    categoryBreakdown.forEach(category => {
      if (category.spent > category.budgeted * 0.9) {
        savingsOpportunities.push({
          category: category.name,
          description: 'Consider reducing spending in this category',
          potentialSavings: category.spent * 0.1,
          savingsPercentage: 10
        })
      }
    })

    const analytics = {
      totalSpent,
      totalBudget,
      remainingBudget,
      utilizationPercentage,
      monthlyTrend,
      categoryBreakdown,
      vendorBreakdown,
      projectedSpend: {
        total: projectedSpend,
        overBudget
      },
      alerts,
      savingsOpportunities,
      timeRange,
      generatedAt: new Date().toISOString()
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Error generating budget analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
