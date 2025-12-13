"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart3,
  Calendar,
  AlertTriangle,
  Target,
  Download,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

interface BudgetAnalyticsProps {
  projectId: string
  organisationId: string
}

export default function BudgetAnalytics({ projectId, organisationId }: BudgetAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')
  const [comparisonMode, setComparisonMode] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [projectId, organisationId, timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/${organisationId}/projects/${projectId}/budget/analytics?timeRange=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Available</h3>
        <p className="text-gray-600">Start adding transactions to see analytics</p>
      </div>
    )
  }

  const {
    totalSpent,
    totalBudget,
    remainingBudget,
    utilizationPercentage,
    monthlyTrend,
    categoryBreakdown,
    vendorBreakdown,
    projectedSpend,
    savingsOpportunities,
    alerts
  } = analytics

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Budget Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into your project finances</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setComparisonMode(!comparisonMode)}>
            <Filter className="h-4 w-4 mr-2" />
            {comparisonMode ? 'Hide' : 'Show'} Comparison
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(utilizationPercentage)} of budget utilized
            </p>
            {monthlyTrend && (
              <div className="flex items-center gap-1 mt-2">
                {monthlyTrend.spentChange >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-red-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-500" />
                )}
                <span className={`text-xs ${monthlyTrend.spentChange >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {formatPercentage(Math.abs(monthlyTrend.spentChange))} from last month
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(remainingBudget)}</div>
            <Progress value={utilizationPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentage(100 - utilizationPercentage)} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyTrend?.averageMonthlySpend || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Based on last {timeRange} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(projectedSpend?.total || 0)}</div>
            <p className="text-xs text-muted-foreground">
              At current spending rate
            </p>
            {projectedSpend?.overBudget && (
              <Badge variant="destructive" className="mt-2">
                Over budget by {formatCurrency(projectedSpend.overBudget)}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Warnings */}
      {alerts && alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Budget Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert: any, index: number) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                    <Badge variant={
                      alert.severity === 'critical' ? 'destructive' :
                      alert.severity === 'warning' ? 'secondary' : 'default'
                    }>
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryBreakdown?.map((category: any, index: number) => {
                const percentage = (category.spent / totalSpent) * 100
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{category.name}</span>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(category.spent)}</div>
                        <div className="text-xs text-gray-500">
                          {formatPercentage(percentage)} of total
                        </div>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Budget: {formatCurrency(category.budgeted)}</span>
                      <span>
                        {category.spent > category.budgeted ? (
                          <span className="text-red-500">
                            Over by {formatCurrency(category.spent - category.budgeted)}
                          </span>
                        ) : (
                          <span className="text-green-500">
                            {formatCurrency(category.budgeted - category.spent)} remaining
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Vendor Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vendorBreakdown?.slice(0, 5).map((vendor: any, index: number) => {
                const percentage = (vendor.totalSpent / totalSpent) * 100
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{vendor.name}</div>
                      <div className="text-sm text-gray-500">
                        {vendor.transactionCount} transactions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(vendor.totalSpent)}</div>
                      <div className="text-xs text-gray-500">
                        {formatPercentage(percentage)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Trend</CardTitle>
          <CardDescription>
            Monthly spending over the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p>Chart visualization would go here</p>
              <p className="text-sm">Integration with chart library needed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Opportunities */}
      {savingsOpportunities && savingsOpportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Savings Opportunities</CardTitle>
            <CardDescription>
              Areas where you could potentially reduce costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savingsOpportunities.map((opportunity: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{opportunity.category}</h4>
                      <p className="text-sm text-gray-600">{opportunity.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        Save {formatCurrency(opportunity.potentialSavings)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatPercentage(opportunity.savingsPercentage)} reduction
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
