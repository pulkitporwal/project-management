"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface SimpleOKRFormProps {
  onSubmit: (values: any) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  users?: Array<{ id: string; name: string }>
  teams?: Array<{ id: string; name: string }>
}

export function SimpleOKRForm({ onSubmit, onCancel, isLoading, users = [], teams = [] }: SimpleOKRFormProps) {
  const [formData, setFormData] = useState({
    objective: "",
    alignment: "individual",
    userId: "",
    teamId: "",
    quarter: Math.ceil((new Date().getMonth() + 1) / 3),
    year: new Date().getFullYear(),
    priority: "medium",
  })
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [keyResults, setKeyResults] = useState([
    {
      title: "",
      description: "",
      targetValue: "",
      currentValue: "0",
      unit: "",
      dueDate: "",
      status: "not-started",
    }
  ])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleKeyResultChange = (index: number, field: string, value: any) => {
    const updatedKeyResults = [...keyResults]
    updatedKeyResults[index] = { ...updatedKeyResults[index], [field]: value }
    setKeyResults(updatedKeyResults)
  }

  const handleAddKeyResult = () => {
    setKeyResults([
      ...keyResults,
      {
        title: "",
        description: "",
        targetValue: "",
        currentValue: "0",
        unit: "",
        dueDate: "",
        status: "not-started",
      }
    ])
  }

  const handleRemoveKeyResult = (index: number) => {
    if (keyResults.length > 1) {
      setKeyResults(keyResults.filter((_, i) => i !== index))
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.objective.trim()) {
      toast.error("Objective is required")
      return
    }

    if (formData.alignment === "individual" && !formData.userId) {
      toast.error("User is required for individual OKRs")
      return
    }

    if (formData.alignment === "team" && !formData.teamId) {
      toast.error("Team is required for team OKRs")
      return
    }

    const invalidKeyResults = keyResults.filter(kr => !kr.title.trim() || !kr.description.trim() || !kr.targetValue || !kr.unit || !kr.dueDate)
    if (invalidKeyResults.length > 0) {
      toast.error("All key results must have title, description, target value, unit, and due date")
      return
    }

    try {
      await onSubmit({
        ...formData,
        tags,
        keyResults: keyResults.map(kr => ({
          ...kr,
          targetValue: parseFloat(kr.targetValue),
          currentValue: parseFloat(kr.currentValue),
        }))
      })
      toast.success("OKR created successfully")
      // Reset form
      setFormData({
        objective: "",
        alignment: "individual",
        userId: "",
        teamId: "",
        quarter: Math.ceil((new Date().getMonth() + 1) / 3),
        year: new Date().getFullYear(),
        priority: "medium",
      })
      setTags([])
      setKeyResults([{
        title: "",
        description: "",
        targetValue: "",
        currentValue: "0",
        unit: "",
        dueDate: "",
        status: "not-started",
      }])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create OKR")
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create OKR</CardTitle>
        <CardDescription>Define your objective and key results</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="objective">Objective *</Label>
              <Textarea
                id="objective"
                placeholder="What do you want to achieve?"
                rows={3}
                value={formData.objective}
                onChange={(e) => handleInputChange("objective", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="alignment">Alignment *</Label>
              <Select value={formData.alignment} onValueChange={(value) => handleInputChange("alignment", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select alignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.alignment === "individual" && (
              <div>
                <Label htmlFor="userId">User *</Label>
                <Select value={formData.userId} onValueChange={(value) => handleInputChange("userId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.alignment === "team" && (
              <div>
                <Label htmlFor="teamId">Team *</Label>
                <Select value={formData.teamId} onValueChange={(value) => handleInputChange("teamId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="quarter">Quarter *</Label>
              <Select value={formData.quarter.toString()} onValueChange={(value) => handleInputChange("quarter", parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Q1</SelectItem>
                  <SelectItem value="2">Q2</SelectItem>
                  <SelectItem value="3">Q3</SelectItem>
                  <SelectItem value="4">Q4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                min="2020"
                max="2030"
                value={formData.year}
                onChange={(e) => handleInputChange("year", parseInt(e.target.value))}
              />
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
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Tags</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  />
                  <Button
                    type="button"
                    onClick={handleAddTag}
                    size="sm"
                  >
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Key Results</Label>
              <Button
                type="button"
                onClick={handleAddKeyResult}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Key Result
              </Button>
            </div>

            {keyResults.map((keyResult, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Key Result {index + 1}</CardTitle>
                    {keyResults.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => handleRemoveKeyResult(index)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Title *</Label>
                      <Input
                        placeholder="What's the key result?"
                        value={keyResult.title}
                        onChange={(e) => handleKeyResultChange(index, "title", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Unit *</Label>
                      <Input
                        placeholder="e.g., %, number, count"
                        value={keyResult.unit}
                        onChange={(e) => handleKeyResultChange(index, "unit", e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Description *</Label>
                      <Textarea
                        placeholder="How will you measure this?"
                        rows={2}
                        value={keyResult.description}
                        onChange={(e) => handleKeyResultChange(index, "description", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Target Value *</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="100"
                        value={keyResult.targetValue}
                        onChange={(e) => handleKeyResultChange(index, "targetValue", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Current Value</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={keyResult.currentValue}
                        onChange={(e) => handleKeyResultChange(index, "currentValue", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Due Date *</Label>
                      <Input
                        type="date"
                        value={keyResult.dueDate}
                        onChange={(e) => handleKeyResultChange(index, "dueDate", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Status</Label>
                      <Select value={keyResult.status} onValueChange={(value) => handleKeyResultChange(index, "status", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-started">Not Started</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="at-risk">At Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
              {isLoading ? "Creating..." : "Create OKR"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
