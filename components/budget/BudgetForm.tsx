"use client"

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Calendar, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

const budgetSchema = z.object({
  totalBudget: z.number().min(1, 'Total budget must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  periodType: z.enum(['monthly', 'quarterly', 'yearly', 'project']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  warningThreshold: z.number().min(1).max(100).default(80),
  criticalThreshold: z.number().min(1).max(100).default(95),
  notes: z.string().optional(),
  categories: z.array(z.object({
    name: z.string().min(1, 'Category name is required'),
    allocatedAmount: z.number().min(0, 'Amount must be positive'),
    description: z.string().optional()
  })).min(1, 'At least one category is required')
})

type BudgetFormData = z.infer<typeof budgetSchema>

interface BudgetFormProps {
  projectId: string
  organisationId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function BudgetForm({ projectId, organisationId, onSuccess, onCancel }: BudgetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState([
    { name: 'Development', allocatedAmount: 0, description: 'Software development costs' },
    { name: 'Design', allocatedAmount: 0, description: 'UI/UX design expenses' },
    { name: 'Marketing', allocatedAmount: 0, description: 'Marketing and promotion' }
  ])

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      totalBudget: 0,
      currency: 'USD',
      periodType: 'project',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      warningThreshold: 80,
      criticalThreshold: 95,
      notes: '',
      categories: categories
    }
  })

  const addCategory = () => {
    const newCategory = { name: '', allocatedAmount: 0, description: '' }
    const updatedCategories = [...categories, newCategory]
    setCategories(updatedCategories)
    form.setValue('categories', updatedCategories)
  }

  const removeCategory = (index: number) => {
    const updatedCategories = categories.filter((_, i) => i !== index)
    setCategories(updatedCategories)
    form.setValue('categories', updatedCategories)
  }

  const updateCategory = (index: number, field: string, value: any) => {
    const updatedCategories = categories.map((cat, i) => 
      i === index ? { ...cat, [field]: value } : cat
    )
    setCategories(updatedCategories)
    form.setValue('categories', updatedCategories)
  }

  const onSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/${organisationId}/projects/${projectId}/budget`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalBudget: data.totalBudget,
          currency: data.currency,
          period: {
            type: data.periodType,
            startDate: data.startDate,
            endDate: data.endDate
          },
          alertThresholds: {
            warningAt: data.warningThreshold,
            criticalAt: data.criticalThreshold
          },
          notes: data.notes,
          categories: data.categories
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create budget')
      }

      toast.success('Budget created successfully!')
      onSuccess?.()
    } catch (error) {
      console.error('Error creating budget:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create budget')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalAllocated = categories.reduce((sum, cat) => sum + (cat.allocatedAmount || 0), 0)

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Set up the basic budget parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalBudget">Total Budget</Label>
              <Input
                id="totalBudget"
                type="number"
                placeholder="10000"
                {...form.register('totalBudget', { valueAsNumber: true })}
              />
              {form.formState.errors.totalBudget && (
                <p className="text-sm text-red-500">{form.formState.errors.totalBudget.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={form.watch('currency')} 
                onValueChange={(value) => form.setValue('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periodType">Period Type</Label>
              <Select 
                value={form.watch('periodType')} 
                onValueChange={(value) => form.setValue('periodType', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="project">Project Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...form.register('startDate')}
              />
              {form.formState.errors.startDate && (
                <p className="text-sm text-red-500">{form.formState.errors.startDate.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                {...form.register('endDate')}
              />
              {form.formState.errors.endDate && (
                <p className="text-sm text-red-500">{form.formState.errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this budget..."
              rows={3}
              {...form.register('notes')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alert Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Thresholds</CardTitle>
          <CardDescription>
            Set when you want to receive budget alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warningThreshold">Warning Alert (%)</Label>
              <Input
                id="warningThreshold"
                type="number"
                min="1"
                max="100"
                placeholder="80"
                {...form.register('warningThreshold', { valueAsNumber: true })}
              />
              <p className="text-xs text-gray-500">Send warning when budget reaches this percentage</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="criticalThreshold">Critical Alert (%)</Label>
              <Input
                id="criticalThreshold"
                type="number"
                min="1"
                max="100"
                placeholder="95"
                {...form.register('criticalThreshold', { valueAsNumber: true })}
              />
              <p className="text-xs text-gray-500">Send critical alert when budget reaches this percentage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Budget Categories</span>
            <Button type="button" variant="outline" size="sm" onClick={addCategory}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </CardTitle>
          <CardDescription>
            Divide your budget into different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Category Name</Label>
                    <Input
                      placeholder="e.g., Development"
                      value={category.name}
                      onChange={(e) => updateCategory(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Allocated Amount</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={category.allocatedAmount || ''}
                      onChange={(e) => updateCategory(index, 'allocatedAmount', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="Optional description"
                      value={category.description || ''}
                      onChange={(e) => updateCategory(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCategory(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          {/* Budget Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Allocated:</span>
              <span className={`font-bold ${totalAllocated > form.watch('totalBudget') ? 'text-red-600' : 'text-green-600'}`}>
                ${totalAllocated.toLocaleString()} / ${form.watch('totalBudget').toLocaleString()}
              </span>
            </div>
            {totalAllocated > form.watch('totalBudget') && (
              <p className="text-sm text-red-500 mt-2">
                Total allocated exceeds total budget!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || totalAllocated > form.watch('totalBudget')}>
          {isSubmitting ? 'Creating...' : 'Create Budget'}
        </Button>
      </div>
    </form>
  )
}
