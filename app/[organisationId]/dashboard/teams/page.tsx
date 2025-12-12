"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  Plus, 
  Filter, 
  Users, 
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  Settings
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Team {
  _id: string
  name: string
  description: string
  leadId: string
  members: TeamMember[]
  createdAt: string
  projects?: number
  status: 'active' | 'inactive'
}

interface TeamMember {
  _id: string
  name: string
  email: string
  role: string
  avatar?: string
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<TeamMember[]>([])

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/teams')
        if (!response.ok) {
          throw new Error('Failed to fetch teams')
        }
        const data = await response.json()
        setTeams(data)
      } catch (error) {
        console.error('Failed to fetch teams:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          setAvailableUsers(data)
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }

    fetchTeams()
    fetchUsers()
  }, [])

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = selectedStatus === "all" || team.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  const handleCreateTeam = async (formData: any) => {
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create team')
      }

      const newTeam = await response.json()
      setTeams(prev => [...prev, newTeam])
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Error creating team:', error)
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return

    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete team')
      }

      setTeams(prev => prev.filter(t => t._id !== teamId))
    } catch (error) {
      console.error('Error deleting team:', error)
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teams</h1>
          <p className="text-gray-600">Manage your project teams and collaborations</p>
        </div>
        <CreateTeamDialog 
          onTeamCreated={handleCreateTeam}
          availableUsers={availableUsers}
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          }
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <Card key={team._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{team.name}</h3>
                  <p className="text-sm text-gray-600">{team.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => handleDeleteTeam(team._id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(team.status)}>
                    {team.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{team.members.length} members</span>
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Team Members</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <UserPlus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {/* Team Lead */}
                    {team.leadId && (() => {
                      const lead = team.members.find(m => m._id === team.leadId)
                      return lead ? (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={lead.avatar} />
                            <AvatarFallback className="text-xs">
                              {lead.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{lead.name}</p>
                            <p className="text-xs text-blue-600">Team Lead</p>
                          </div>
                        </div>
                      ) : null
                    })()}
                    
                    {/* Other Members */}
                    {team.members
                      .filter(m => m._id !== team.leadId)
                      .slice(0, 3)
                      .map((member) => (
                        <div key={member._id} className="flex items-center gap-2 p-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    
                    {team.members.length > 4 && (
                      <div className="text-center text-xs text-gray-500 pt-1">
                        +{team.members.length - 4} more members
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                    {team.projects && (
                      <span>{team.projects} projects</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'Try adjusting your search or filters' : 'Create your first team to get started'}
              </p>
              <CreateTeamDialog 
                onTeamCreated={handleCreateTeam}
                availableUsers={availableUsers}
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Team
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Create Team Dialog Component
interface CreateTeamDialogProps {
  onTeamCreated: (data: any) => void
  availableUsers: TeamMember[]
  trigger: React.ReactNode
}

function CreateTeamDialog({ onTeamCreated, availableUsers, trigger }: CreateTeamDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leadId: '',
    memberIds: [] as string[]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onTeamCreated(formData)
    setFormData({
      name: '',
      description: '',
      leadId: '',
      memberIds: []
    })
  }

  const handleMemberToggle = (userId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        memberIds: [...prev.memberIds, userId]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        memberIds: prev.memberIds.filter(id => id !== userId)
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Team Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter team name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter team description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="leadId">Team Lead</Label>
            <Select value={formData.leadId} onValueChange={(value) => setFormData(prev => ({ ...prev, leadId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select team lead" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name} - {user.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Team Members</Label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
              {availableUsers.map((user) => (
                <div key={user._id} className="flex items-center space-x-3 p-2 border rounded">
                  <input
                    type="checkbox"
                    checked={formData.memberIds.includes(user._id)}
                    onChange={(e) => handleMemberToggle(user._id, e.target.checked)}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name}>
              Create Team
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
