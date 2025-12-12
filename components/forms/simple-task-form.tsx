"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface SimpleTaskFormProps {
  onSubmit: (values: any) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  projects?: Array<{ id: string; title: string }>
  users?: Array<{ id: string; name: string }>
}

export function SimpleTaskForm({ onSubmit, onCancel, isLoading, projects = [], users = [] }: SimpleTaskFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    startDate: "",
    projectId: "",
    assignedTo: "",
    estimatedHours: "",
  })
  const [labels, setLabels] = useState<string[]>([])
  const [blockers, setBlockers] = useState<string[]>([])
  const [newLabel, setNewLabel] = useState("")
  const [newBlocker, setNewBlocker] = useState("")
  const [recurring, setRecurring] = useState({
    enabled: false,
    frequency: "weekly",
    interval: 1,
    endDate: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRecurringChange = (field: string, value: any) => {
    setRecurring(prev => ({ ...prev, [field]: value }))
  }

  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()])
      setNewLabel("")
    }
  }

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove))
  }

  const handleAddBlocker = () => {
    if (newBlocker.trim()) {
      setBlockers([...blockers, newBlocker.trim()])
      setNewBlocker("")
    }
  }

  const handleRemoveBlocker = (blockerToRemove: string) => {
    setBlockers(blockers.filter(blocker => blocker !== blockerToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error("Task title is required")
      return
    }

    if (!formData.projectId) {
      toast.error("Project is required")
      return
    }

    try {
      await onSubmit({ 
        ...formData, 
        labels, 
        blockers, 
        recurring: recurring.enabled ? recurring : undefined 
      })
      toast.success("Task created successfully")
      // Reset form
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
        startDate: "",
        projectId: "",
        assignedTo: "",
        estimatedHours: "",
      })
      setLabels([])
      setBlockers([])
      setRecurring({
        enabled: false,
        frequency: "weekly",
        interval: 1,
        endDate: "",
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create task")
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Task</CardTitle>
        <CardDescription>Fill in the task details below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter task description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="projectId">Project *</Label>
              <Select value={formData.projectId} onValueChange={(value) => handleInputChange("projectId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange("assignedTo", value === 'unassigned' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                placeholder="0"
                min="0"
                max="1000"
                value={formData.estimatedHours}
                onChange={(e) => handleInputChange("estimatedHours", e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Labels</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a label"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLabel())}
                  />
                  <Button
                    type="button"
                    onClick={handleAddLabel}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
                {labels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {labels.map((label) => (
                      <Badge key={label} variant="secondary" className="flex items-center gap-1">
                        {label}
                        <button
                          type="button"
                          onClick={() => handleRemoveLabel(label)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <Label>Blockers</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a blocker"
                    value={newBlocker}
                    onChange={(e) => setNewBlocker(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddBlocker())}
                  />
                  <Button
                    type="button"
                    onClick={handleAddBlocker}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
                {blockers.length > 0 && (
                  <div className="space-y-2">
                    {blockers.map((blocker, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <span className="flex-1 text-sm">{blocker}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBlocker(blocker)}
                          className="p-1 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <Label>Recurring Task</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurring"
                    checked={recurring.enabled}
                    onCheckedChange={(checked) => handleRecurringChange("enabled", checked)}
                  />
                  <Label htmlFor="recurring">Enable recurring task</Label>
                </div>
                
                {recurring.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select value={recurring.frequency} onValueChange={(value) => handleRecurringChange("frequency", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="interval">Interval</Label>
                      <Input
                        id="interval"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={recurring.interval}
                        onChange={(e) => handleRecurringChange("interval", parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={recurring.endDate}
                        onChange={(e) => handleRecurringChange("endDate", e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
