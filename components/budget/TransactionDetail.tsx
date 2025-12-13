"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  DollarSign, 
  Calendar, 
  User, 
  Receipt, 
  MapPin, 
  CreditCard,
  Tag,
  Edit,
  Trash2,
  Download,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

interface TransactionDetailProps {
  transaction: any
  onClose?: () => void
  onUpdate?: () => void
}

export function TransactionDetail({ transaction, onClose, onUpdate }: TransactionDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const response = await fetch(
        `/api/${transaction.organisationId}/projects/${transaction.projectId}/budget/transactions?transactionId=${transaction._id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete transaction')
      }

      toast.success('Transaction deleted successfully!')
      setDeleteConfirmOpen(false)
      onClose?.()
      onUpdate?.()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast.error('Failed to delete transaction')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownloadReceipt = () => {
    if (transaction.receiptUrl) {
      window.open(transaction.receiptUrl, '_blank')
    } else {
      toast.info('No receipt available for this transaction')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{transaction.description}</h3>
          <p className="text-sm text-gray-600">
            Transaction ID: {transaction._id}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadReceipt}>
            <Download className="h-4 w-4 mr-2" />
            Receipt
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDeleteConfirmOpen(true)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Transaction Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Transaction Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className={`text-2xl font-bold ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                  {transaction.type === 'expense' ? '-' : '+'}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <Badge variant={transaction.type === 'expense' ? 'destructive' : 'default'}>
                  {transaction.type}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <Badge variant="outline">{transaction.category}</Badge>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant={
                  transaction.status === 'approved' ? 'default' :
                  transaction.status === 'rejected' ? 'destructive' : 'secondary'
                }>
                  {transaction.status}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(transaction.date)}
                </p>
              </div>
              
              {transaction.vendor && (
                <div>
                  <p className="text-sm text-gray-600">Vendor</p>
                  <p className="font-medium">{transaction.vendor}</p>
                </div>
              )}
              
              {transaction.invoiceNumber && (
                <div>
                  <p className="text-sm text-gray-600">Invoice Number</p>
                  <p className="font-medium">{transaction.invoiceNumber}</p>
                </div>
              )}
              
              {transaction.paymentMethod && (
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    {transaction.paymentMethod.replace('_', ' ').charAt(0).toUpperCase() + transaction.paymentMethod.slice(1)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {transaction.location && (
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {transaction.location}
              </p>
            </div>
          )}
          
          {transaction.tags && transaction.tags.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {transaction.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {transaction.receiptUrl && (
            <div>
              <p className="text-sm text-gray-600">Receipt</p>
              <Button variant="outline" size="sm" onClick={handleDownloadReceipt}>
                <ExternalLink className="h-4 w-4 mr-2" />
                View Receipt
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* People Information */}
      <Card>
        <CardHeader>
          <CardTitle>People</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Created By</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{transaction.createdBy?.name || 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{transaction.createdBy?.email || ''}</p>
                </div>
              </div>
            </div>
            
            {transaction.approvedBy && (
              <div>
                <p className="text-sm text-gray-600">Approved By</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.approvedBy?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{transaction.approvedBy?.email || ''}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle>Timestamps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Created:</span>
            <span className="text-sm font-medium">{formatDate(transaction.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Last Updated:</span>
            <span className="text-sm font-medium">{formatDate(transaction.updatedAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="font-medium">{transaction.description}</p>
              <p className={`text-lg font-bold ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                {transaction.type === 'expense' ? '-' : '+'}
                {formatCurrency(transaction.amount, transaction.currency)}
              </p>
            </div>
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Transaction'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
