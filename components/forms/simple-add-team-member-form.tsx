"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { toast } from "sonner"

interface SimpleAddTeamMemberFormProps {
  onSubmit: (values: any) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  teams?: Array<{ id: string; name: string }>
  availableSkills?: Array<{ id: string; name: string }>
  availablePermissions?: Array<{ id: string; name: string }>
}

export function SimpleAddTeamMemberForm({ 
  onSubmit, 
  onCancel, 
  isLoading, 
  teams = [], 
  availableSkills = [],
  availablePermissions = []
}: SimpleAddTeamMemberFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "employee",
    jobTitle: "",
    department: "",
    teamId: "",
    notificationsEnabled: true,
    isActive: true,
  })
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSkillToggle = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    )
  }

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Name is required")
      return
    }

    if (!formData.email.trim()) {
      toast.error("Email is required")
      return
    }

    if (!formData.email.includes("@")) {
      toast.error("Invalid email address")
      return
    }

    if (!formData.jobTitle.trim()) {
      toast.error("Job title is required")
      return
    }

    if (!formData.department.trim()) {
      toast.error("Department is required")
      return
    }

    try {
      await onSubmit({ 
        ...formData, 
        skills: selectedSkills, 
        permissions: selectedPermissions 
      })
      toast.success("Team member added successfully")
      // Reset form
      setFormData({
        name: "",
        email: "",
        role: "employee",
        jobTitle: "",
        department: "",
        teamId: "",
        notificationsEnabled: true,
        isActive: true,
      })
      setSelectedSkills([])
      setSelectedPermissions([])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add team member")
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add Team Member</CardTitle>
        <CardDescription>Fill in the team member details below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                placeholder="Enter job title"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange("jobTitle", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                placeholder="Enter department"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="teamId">Team</Label>
              <Select value={formData.teamId} onValueChange={(value) => handleInputChange("teamId", value === 'no-team' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-team">No Team</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Skills</Label>
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSkills.map((skill) => (
                    <div key={skill.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill.id}`}
                        checked={selectedSkills.includes(skill.id)}
                        onCheckedChange={() => handleSkillToggle(skill.id)}
                      />
                      <Label htmlFor={`skill-${skill.id}`} className="text-sm">
                        {skill.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skillId) => {
                      const skill = availableSkills.find(s => s.id === skillId)
                      return skill ? (
                        <Badge key={skillId} variant="secondary" className="flex items-center gap-1">
                          {skill.name}
                          <button
                            type="button"
                            onClick={() => handleSkillToggle(skillId)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <Label>Permissions</Label>
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`permission-${permission.id}`}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />
                      <Label htmlFor={`permission-${permission.id}`} className="text-sm">
                        {permission.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedPermissions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedPermissions.map((permissionId) => {
                      const permission = availablePermissions.find(p => p.id === permissionId)
                      return permission ? (
                        <Badge key={permissionId} variant="secondary" className="flex items-center gap-1">
                          {permission.name}
                          <button
                            type="button"
                            onClick={() => handlePermissionToggle(permissionId)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notificationsEnabled"
                  checked={formData.notificationsEnabled}
                  onCheckedChange={(checked) => handleInputChange("notificationsEnabled", checked)}
                />
                <Label htmlFor="notificationsEnabled">Enable Notifications</Label>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
                <Label htmlFor="isActive">Active User</Label>
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
              {isLoading ? "Adding..." : "Add Team Member"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
