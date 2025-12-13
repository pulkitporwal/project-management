"use client"

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, X, Receipt, DollarSign, Calendar, MapPin, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

const transactionSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['expense', 'income']),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  vendor: z.string().optional(),
  invoiceNumber: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  tags: z.array(z.string()).optional(),
  location: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'check', 'other']).optional(),
  receiptUrl: z.string().optional()
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  projectId: string
  organisationId: string
  budget: any
  onSuccess?: () => void
  onCancel?: () => void
}

export function TransactionForm({ projectId, organisationId, budget, onSuccess, onCancel }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const form = useForm<TransactionFormData>({
    defaultValues: {
      amount: 0,
      type: 'expense',
      category: budget.categories?.[0]?.name || '',
      description: '',
      vendor: '',
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      tags: [],
      location: '',
      paymentMethod: 'card',
      receiptUrl: ''
    }
  })

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()]
      setTags(newTags)
      form.setValue('tags', newTags)
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove)
    setTags(newTags)
    form.setValue('tags', newTags)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type and size
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB')
        return
      }
      
      if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
        toast.error('Only images and PDF files are allowed')
        return
      }
      
      setUploadedFile(file)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
  }

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true)
    
    try {
      // Simulate file upload (in real app, you'd upload to cloud storage)
      let receiptUrl = ''
      if (uploadedFile) {
        // For now, just simulate the upload
        receiptUrl = `/uploads/receipts/${uploadedFile.name}`
        toast.success('Receipt uploaded successfully')
      }

      const response = await fetch(`/api/${organisationId}/projects/${projectId}/budget/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          tags: tags,
          receiptUrl,
          date: new Date(data.date).toISOString()
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create transaction')
      }

      toast.success('Transaction created successfully!')
      onSuccess?.()
    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = budget.categories || []

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Transaction Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transaction Details
          </CardTitle>
          <CardDescription>
            Enter the basic information about this transaction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-10"
                  {...form.register('amount', { valueAsNumber: true })}
                />
              </div>
              {form.formState.errors.amount && (
                <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select 
                value={form.watch('type')} 
                onValueChange={(value) => form.setValue('type', value设施的['expense', 'income'] as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Expense
                    </div>
                  </SelectItem>
                  <SelectItem value="income">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Income
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={form.watch('category')} 
                onValueChange={(value) => form.setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.name} ({cat.allocatedAmount ? `$${cat.allocatedAmount.toLocaleString()}` : 'No limit'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  className="pl-10"
                  {...form.register('date')}
                />
              </div>
              {form.formState.errors.date && (
                <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe this transaction..."
              rows={3}
              {...form.register('description')}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
          <CardDescription>
            Add more context to this transaction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor/Supplier (Optional)</Label>
              <Input
                id="vendor"
                placeholder="e.g., Amazon, Microsoft"
                {...form.register('vendor')}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number (Optional)</Label>
              <Input
                id="invoiceNumber"
                placeholder="e.g., INV-2024-001"
                {...form.register('invoiceNumber')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select 
                value={form.watch('paymentMethod')} 
                onValueChange={(value) => form.setValue('paymentMethod', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Credit/Debit Card
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                  <SelectItem value="check">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Check
                    </div>
                  </SelectItem>
                  <SelectItem value="other">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Other
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  placeholder="e.g., New York, NY"
                  className="pl-10"
                  {...form.register('location')}
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Receipt Upload */}
          <div className="space-y-2">
            <Label>Receipt (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {uploadedFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{uploadedFile.name}</span>
                    <Badge variant="outline">{(uploadedFile.size / 1024).toFixed(1)} KB</Badge>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload receipt or invoice
                  </p>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <label htmlFor="receipt-upload" className="cursor-pointer">
                      Choose File
                    </label>
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Images and PDF files up to 5MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Type</p>
              <Badge variant={form.watch('type') === 'expense' ? 'destructive' : 'default'}>
                {form.watch('type')}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="font-bold text-lg">
                {form.watch('type') === 'expense' ? '-' : '+'}
                ${form.watch('amount')?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Category</p>
              <p className="font-medium">{form.watch('category') || 'Not selected'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-medium">{form.watch('date') || 'Not selected'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Transaction'}
        </Button>
      </div>
    </form>
  )
}
