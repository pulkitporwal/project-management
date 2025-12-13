"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  PieChart,
  BarChart3,
  CreditCard,
  Receipt
} from "lucide-react"
import { BudgetForm } from './BudgetForm'
import { TransactionForm } from './TransactionForm'
import { TransactionDetail } from './TransactionDetail'

interface BudgetOverviewProps {
  projectId: string
  organisationId: string
}

export default function BudgetOverview({ projectId, organisationId }: BudgetOverviewProps) {
  const [budget, setBudget] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [createBudgetOpen, setCreateBudgetOpen] = useState(false)
  const [createTransactionOpen, setCreateTransactionOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [transactionDetailOpen, setTransactionDetailOpen] = useState(false)

  useEffect(() => {
    fetchBudgetData()
  }, [projectId, organisationId])

  const fetchBudgetData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/${organisationId}/projects/${projectId}/budget`)
      if (response.ok) {
        const data = await response.json()
        setBudget(data.budget)
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error('Error fetching budget data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || transaction.type === filterType
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus

    return matchesSearch && matchesType && matchesCategory && matchesStatus
  })

  const getAlertColor = (alertLevel: string) => {
    switch (alertLevel) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-green-600 bg-green-50'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
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

  if (!budget) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Budget Management</h2>
            <p className="text-gray-600">Create a budget to start tracking project expenses</p>
          </div>
          <Dialog open={createBudgetOpen} onOpenChange={setCreateBudgetOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Project Budget</DialogTitle>
              </DialogHeader>
              <BudgetForm
                projectId={projectId}
                organisationId={organisationId}
                onSuccess={() => {
                  setCreateBudgetOpen(false)
                  fetchBudgetData()
                }}
                onCancel={() => setCreateBudgetOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <Card className="text-center py-12">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Budget Created</h3>
          <p className="text-gray-600 mb-4">Start by creating a budget for this project</p>
          <Button onClick={() => setCreateBudgetOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Budget
          </Button>
        </Card>
      </div>
    )
  }

  const categories = budget.categories || []
  const totalSpent = budget.totalSpentAmount || 0
  const remainingBudget = budget.remainingBudget || 0
  const utilizationPercentage = budget.utilizationPercentage || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Budget Management</h2>
          <p className="text-gray-600">Track and manage project finances</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={createTransactionOpen} onOpenChange={setCreateTransactionOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Receipt className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
              </DialogHeader>
              <TransactionForm
                projectId={projectId}
                organisationId={organisationId}
                budget={budget}
                onSuccess={() => {
                  setCreateTransactionOpen(false)
                  fetchBudgetData()
                }}
                onCancel={() => setCreateTransactionOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(budget.totalBudget, budget.currency)}</div>
            <p className="text-xs text-muted-foreground">
              {budget.currency} • {categories.length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent, budget.currency)}</div>
            <Progress value={utilizationPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {utilizationPercentage.toFixed(1)}% utilized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(remainingBudget, budget.currency)}</div>
            <p className="text-xs text-muted-foreground">
              {budget.isOverBudget ? 'Over budget!' : 'On track'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${budget.alertLevel === 'critical' ? 'text-red-500' : budget.alertLevel === 'warning' ? 'text-yellow-500' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <Badge className={getAlertColor(budget.alertLevel)}>
              {budget.alertLevel === 'critical' ? 'Critical' : budget.alertLevel === 'warning' ? 'Warning' : 'Healthy'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {budget.isExpired ? 'Expired' : `Expires: ${new Date(budget.period.endDate).toLocaleDateString()}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Budget Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category: any, index: number) => {
              const categoryUtilization = category.allocatedAmount > 0 
                ? (category.spentAmount / category.allocatedAmount) * 100 
                : 0
              
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{category.name}</h4>
                      <span className="text-sm text-gray-600">
                        {formatCurrency(category.spentAmount, budget.currency)} / {formatCurrency(category.allocatedAmount, budget.currency)}
                      </span>
                    </div>
                    <Progress value={categoryUtilization} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {categoryUtilization.toFixed(1)}% utilized • {category.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat: any) => (
                  <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium text-sm">Date</th>
                    <th className="text-left p-3 font-medium text-sm">Description</th>
                    <th className="text-left p-3 font-medium text-sm">Category</th>
                    <th className="text-left p-3 font-medium text-sm">Amount</th>
                    <th className="text-left p-3 font-medium text-sm">Type</th>
                    <th className="text-left p-3 font-medium text-sm">Status</th>
                    <th className="text-left p-3 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-sm">
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          {transaction.vendor && (
                            <div className="text-gray-500 text-xs">{transaction.vendor}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <Badge variant="outline">{transaction.category}</Badge>
                      </td>
                      <td className="p-3 text-sm font-medium">
                        <span className={transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                          {transaction.type === 'expense' ? '-' : '+'}
                          {formatCurrency(transaction.amount, budget.currency)}
                        </span>
                      </td>
                      <td className="p-3 text-sm">
                        <Badge variant={transaction.type === 'expense' ? 'destructive' : 'default'}>
                          {transaction.type}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        <Badge variant={
                          transaction.status === 'approved' ? 'default' :
                          transaction.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedTransaction(transaction)
                              setTransactionDetailOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTransactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No transactions found matching your filters
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Dialog */}
      <Dialog open={transactionDetailOpen} onOpenChange={setTransactionDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <TransactionDetail
              transaction={selectedTransaction}
              onClose={() => setTransactionDetailOpen(false)}
              onUpdate={fetchBudgetData}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BudgetOverview
