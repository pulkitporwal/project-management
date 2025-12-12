"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  UserPlus,
  MoreHorizontal,
  Crown,
  Shield,
  User,
  Plus,
  Settings,
  Edit,
  Trash2
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useParams } from 'next/navigation'

interface ProjectTeamProps {
  projectId: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'employee'
  jobTitle: string
  department: string
  avatar?: string
  joinedAt: string
  lastActive: string
  tasksCount: number
  completedTasks: number
  permissions: string[]
  isActive: boolean
  location?: string
  phone?: string
}

interface Team {
  id: string
  name: string
  description?: string
  members: TeamMember[]
  leadId: string
}

export default function ProjectTeam({ projectId }: ProjectTeamProps) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeView, setActiveView] = useState<'members' | 'teams'>('members')
  const [isCreateTeamDialogOpen, setIsCreateTeamDialogOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isEditTeamDialogOpen, setIsEditTeamDialogOpen] = useState(false)
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    description: '',
    leadId: '',
    members: [] as string[]
  })
  const params = useParams()
  const { organisationId } = params

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        // Fetch organization members
        const membersResponse = await fetch(`/api/${organisationId}/members`)
        if (!membersResponse.ok) {
          throw new Error('Failed to fetch members')
        }
        const membersData = await membersResponse.json()

        // Fetch organization teams
        const teamsResponse = await fetch(`/api/${organisationId}/teams?includeMembers=true`)
        if (!teamsResponse.ok) {
          throw new Error('Failed to fetch teams')
        }
        const teamsData = await teamsResponse.json()

        // Transform members data to match our interface
        const transformedMembers: TeamMember[] = membersData.members.map((member: any) => ({
          id: member._id,
          name: member.name,
          email: member.email,
          role: member.role,
          jobTitle: member.role, // Using role as jobTitle for now
          department: member.department || 'Unassigned',
          avatar: member.avatar,
          joinedAt: member.joinedAt,
          lastActive: member.lastActive || new Date().toISOString(),
          tasksCount: 0, // TODO: Fetch from tasks API
          completedTasks: 0, // TODO: Fetch from tasks API
          permissions: [],
          isActive: member.isActive,
          location: member.location,
          phone: member.phone
        }))

        // Transform teams data
        const transformedTeams: Team[] = teamsData.map((team: any) => ({
          id: team._id,
          name: team.name,
          description: team.description,
          members: team.members ? team.members.map((member: any) => ({
            id: member._id,
            name: member.name,
            email: member.email,
            role: member.role,
            jobTitle: member.role,
            department: member.department,
            avatar: member.avatar,
            joinedAt: member.joinedAt,
            lastActive: member.lastActive || new Date().toISOString(),
            tasksCount: 0,
            completedTasks: 0,
            permissions: [],
            isActive: true,
            location: member.location,
            phone: member.phone
          })) : [],
          leadId: team.leadId
        }))

        setMembers(transformedMembers)
        setTeams(transformedTeams)
      } catch (error) {
        console.error('Failed to fetch team data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamData()
  }, [projectId, organisationId])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-purple-500" />
      case 'manager':
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateTeam = async () => {
    try {
      const response = await fetch(`/api/${organisationId}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamFormData),
      })

      if (!response.ok) {
        throw new Error('Failed to create team')
      }

      const newTeam = await response.json()
      setTeams(prev => [...prev, newTeam])
      setIsCreateTeamDialogOpen(false)

      // Reset form
      setTeamFormData({
        name: '',
        description: '',
        leadId: '',
        members: []
      })
    } catch (error) {
      console.error('Error creating team:', error)
    }
  }

  const handleUpdateTeam = async () => {
    if (!selectedTeam) return

    try {
      const response = await fetch(`/api/${organisationId}/teams/${selectedTeam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamFormData),
      })

      if (!response.ok) {
        throw new Error('Failed to update team')
      }

      const updatedTeam = await response.json()
      setTeams(prev => prev.map(team => team.id === selectedTeam.id ? updatedTeam : team))
      setIsEditTeamDialogOpen(false)
      setSelectedTeam(null)

      // Reset form
      setTeamFormData({
        name: '',
        description: '',
        leadId: '',
        members: []
      })
    } catch (error) {
      console.error('Error updating team:', error)
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return

    try {
      const response = await fetch(`/api/${organisationId}/teams/${teamId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete team')
      }

      setTeams(prev => prev.filter(team => team.id !== teamId))
    } catch (error) {
      console.error('Error deleting team:', error)
    }
  }

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team)
    setTeamFormData({
      name: team.name,
      description: team.description || '',
      leadId: team.leadId || '',
      members: team.members.map(member => member.id)
    })
    setIsEditTeamDialogOpen(true)
  }

  const handleMemberSelection = (memberId: string, isChecked: boolean) => {
    if (isChecked) {
      setTeamFormData(prev => ({
        ...prev,
        members: [...prev.members, memberId]
      }))
    } else {
      setTeamFormData(prev => ({
        ...prev,
        members: prev.members.filter(id => id !== memberId)
      }))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Team</h2>
          <p className="text-gray-600">Manage team members and collaboration</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateTeamDialogOpen} onOpenChange={setIsCreateTeamDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teamName">Team Name *</Label>
                  <Input
                    id="teamName"
                    value={teamFormData.name}
                    onChange={(e) => setTeamFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter team name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="teamDescription">Description</Label>
                  <Textarea
                    id="teamDescription"
                    value={teamFormData.description}
                    onChange={(e) => setTeamFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter team description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="teamLead">Team Lead</Label>
                  <Select value={teamFormData.leadId} onValueChange={(value) => setTeamFormData(prev => ({ ...prev, leadId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team lead" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} - {member.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Team Members</Label>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={member.id}
                          checked={teamFormData.members.includes(member.id)}
                          onCheckedChange={(checked) => handleMemberSelection(member.id, checked as boolean)}
                        />
                        <Label htmlFor={member.id} className="text-sm">
                          {member.name} - {member.department}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateTeamDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTeam} disabled={!teamFormData.name}>
                    Create Team
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={activeView === 'members' ? 'default' : 'outline'}
          onClick={() => setActiveView('members')}
        >
          <Users className="h-4 w-4 mr-2" />
          Members ({members.length})
        </Button>
        <Button
          variant={activeView === 'teams' ? 'default' : 'outline'}
          onClick={() => setActiveView('teams')}
        >
          <Users className="h-4 w-4 mr-2" />
          Teams ({teams.length})
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {activeView === 'members' ? (
        /* Members View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{member.name}</h3>
                        {getRoleIcon(member.role)}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{member.jobTitle}</p>
                      <Badge className={`text-xs mt-1 ${getRoleColor(member.role)}`}>
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>{member.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="h-3 w-3" />
                      <span>{member.department}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-center">
                      <p className="text-lg font-semibold">{member.tasksCount}</p>
                      <p className="text-xs text-gray-600">Tasks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">{member.completedTasks}</p>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">
                        {member.tasksCount > 0 ? Math.round((member.completedTasks / member.tasksCount) * 100) : 0}%
                      </p>
                      <p className="text-xs text-gray-600">Progress</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-600">
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Last active: {new Date(member.lastActive).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Teams View */
        <div className="space-y-6">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {team.name}
                    </CardTitle>
                    <CardDescription>{team.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{team.members.length} members</Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleEditTeam(team)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        <p className="text-xs text-gray-600 truncate">{member.jobTitle}</p>
                      </div>
                      {team.leadId === member.id && (
                        <Crown className="h-4 w-4 text-purple-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredMembers.length === 0 && activeView === 'members' && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'Try adjusting your search' : 'Add your first team member to get started'}
              </p>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Team Dialog */}
      <Dialog open={isEditTeamDialogOpen} onOpenChange={setIsEditTeamDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTeamName">Team Name *</Label>
              <Input
                id="editTeamName"
                value={teamFormData.name}
                onChange={(e) => setTeamFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter team name"
                required
              />
            </div>
            <div>
              <Label htmlFor="editTeamDescription">Description</Label>
              <Textarea
                id="editTeamDescription"
                value={teamFormData.description}
                onChange={(e) => setTeamFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter team description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="editTeamLead">Team Lead</Label>
              <Select value={teamFormData.leadId} onValueChange={(value) => setTeamFormData(prev => ({ ...prev, leadId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team lead" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Team Members</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2 py-1">
                    <Checkbox
                      id={`edit-${member.id}`}
                      checked={teamFormData.members.includes(member.id)}
                      onCheckedChange={(checked) => handleMemberSelection(member.id, checked as boolean)}
                    />
                    <Label htmlFor={`edit-${member.id}`} className="text-sm">
                      {member.name} - {member.department}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditTeamDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTeam} disabled={!teamFormData.name}>
                Update Team
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
