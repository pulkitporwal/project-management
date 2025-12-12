"use client"
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface AddCardFormProps {
  onCardAdd: (cardData: {
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    labels: string[]
    assignedTo?: string
    dueDate?: string
  }, columnId?: string) => void
  trigger: React.ReactNode
  teamMembers?: Array<{ _id: string; name: string; email: string }>
  columnId?: string
}

export default function AddCardForm({ onCardAdd, trigger, teamMembers = [], columnId }: AddCardFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    labels: [] as string[],
    assignedTo: '',
    dueDate: ''
  })
  const [newLabel, setNewLabel] = useState('')

  const handleAddLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()]
      }))
      setNewLabel('')
    }
  }

  const handleRemoveLabel = (label: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(l => l !== label)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setLoading(true)
    try {
      onCardAdd({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        labels: formData.labels,
        assignedTo: formData.assignedTo || undefined,
        dueDate: formData.dueDate || undefined
      }, columnId)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        labels: [],
        assignedTo: '',
        dueDate: ''
      })
      setOpen(false)
    } catch (error) {
      console.error('Failed to add card:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="card-title">Title *</Label>
            <Input
              id="card-title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter card title..."
              required
            />
          </div>

          <div>
            <Label htmlFor="card-description">Description</Label>
            <Textarea
              id="card-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter card description..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="card-priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {teamMembers.length > 0 && (
            <div>
              <Label htmlFor="card-assignee">Assign To</Label>
              <Select value={formData.assignedTo} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value === 'unassigned' ? '' : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member._id} value={member._id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="card-duedate">Due Date</Label>
            <Input
              id="card-duedate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>

          <div>
            <Label>Labels</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Add label..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
                className="flex-1"
              />
              <Button type="button" onClick={handleAddLabel} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.labels.map((label) => (
                  <Badge key={label} variant="secondary" className="flex items-center gap-1">
                    {label}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveLabel(label)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim()}>
              {loading ? 'Adding...' : 'Add Card'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
