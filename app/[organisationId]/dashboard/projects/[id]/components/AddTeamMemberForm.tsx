"use client"
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { UserPlus } from "lucide-react"

interface AddTeamMemberFormProps {
  projectId: string
  onMemberAdded: () => void
  trigger: React.ReactNode
}

interface User {
  _id: string
  name: string
  email: string
  role: string
  department: string
}

export default function AddTeamMemberForm({ projectId, onMemberAdded, trigger }: AddTeamMemberFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [currentMembers, setCurrentMembers] = useState<string[]>([])

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current team members
        const teamResponse = await fetch(`/api/projects/${projectId}/team`)
        const teamData = await teamResponse.json()
        setCurrentMembers(teamData.members.map((m: any) => m._id))

        // Fetch all available users (you might need to create this endpoint)
        const usersResponse = await fetch('/api/users') // Assuming this endpoint exists
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setAvailableUsers(usersData)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    if (open) {
      fetchData()
    }
  }, [open, projectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedUsers.length === 0) return

    setLoading(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add team members')
      }

      setOpen(false)
      onMemberAdded()
      setSelectedUsers([])
    } catch (error) {
      console.error('Error adding team members:', error)
      // TODO: Show error toast
    } finally {
      setLoading(false)
    }
  }

  const handleUserToggle = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId])
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId))
    }
  }

  const filteredUsers = availableUsers.filter(user => !currentMembers.includes(user._id))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Team Members</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-base font-medium">Select Users to Add</Label>
            <div className="mt-2 space-y-2">
              {filteredUsers.length === 0 ? (
                <p className="text-sm text-gray-500">No available users to add</p>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user._id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={user._id}
                      checked={selectedUsers.includes(user._id)}
                      onCheckedChange={(checked) => handleUserToggle(user._id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <label htmlFor={user._id} className="cursor-pointer">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">
                          {user.role} • {user.department}
                        </div>
                      </label>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium">
                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedUsers.map(userId => {
                  const user = availableUsers.find(u => u._id === userId)
                  return user ? (
                    <span key={userId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {user.name}
                    </span>
                  ) : null
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || selectedUsers.length === 0}>
              {loading ? 'Adding...' : `Add ${selectedUsers.length} Member${selectedUsers.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
