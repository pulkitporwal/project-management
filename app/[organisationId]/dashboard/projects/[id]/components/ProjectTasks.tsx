"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, 
  Plus, 
  Filter, 
  Calendar, 
  User, 
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2
} from "lucide-react"
import CreateTaskForm from './CreateTaskForm'

interface ProjectTasksProps {
  projectId: string
  organisationId: string
}

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'review' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo?: {
    id: string
    name: string
    avatar?: string
  }
  createdBy: {
    id: string
    name: string
    avatar?: string
  }
  dueDate?: string
  createdAt: string
  updatedAt: string
  tags: string[]
  subtasks: {
    id: string
    title: string
    completed: boolean
  }[]
  comments: number
  attachments: number
  estimatedHours?: number
  actualHours?: number
  milestone?: string
  dependencies: string[]
}

export default function ProjectTasks({ projectId, organisationId }: ProjectTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'assignee' | 'milestone'>('status')

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/${organisationId}/projects/${projectId}/tasks`)
        if (!response.ok) {
          throw new Error('Failed to fetch tasks')
        }
        const data = await response.json()
        
        // Transform data to match our interface
        const transformedTasks: Task[] = data.map((task: any) => ({
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignedTo: task.assignedTo ? {
            id: task.assignedTo._id,
            name: task.assignedTo.name,
            avatar: task.assignedTo.avatar
          } : undefined,
          createdBy: {
            id: task.createdBy._id,
            name: task.createdBy.name,
            avatar: task.createdBy.avatar
          },
          dueDate: task.dueDate,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          tags: task.labels || [],
          subtasks: [], // TODO: Fetch subtasks if needed
          comments: task.comments?.length || 0,
          attachments: task.attachments?.length || 0,
          estimatedHours: task.estimatedHours,
          actualHours: task.loggedHours,
          milestone: task.milestone,
          dependencies: task.dependencies || []
        }))
        
        setTasks(transformedTasks)
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [projectId])

  const refreshTasks = () => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/${organisationId}/projects/${projectId}/tasks`)
        if (!response.ok) {
          throw new Error('Failed to fetch tasks')
        }
        const data = await response.json()
        
        // Transform data to match our interface
        const transformedTasks: Task[] = data.map((task: any) => ({
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignedTo: task.assignedTo ? {
            id: task.assignedTo._id,
            name: task.assignedTo.name,
            avatar: task.assignedTo.avatar
          } : undefined,
          createdBy: {
            id: task.createdBy._id,
            name: task.createdBy.name,
            avatar: task.createdBy.avatar
          },
          dueDate: task.dueDate,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          tags: task.labels || [],
          subtasks: [], // TODO: Fetch subtasks if needed
          comments: task.comments?.length || 0,
          attachments: task.attachments?.length || 0,
          estimatedHours: task.estimatedHours,
          actualHours: task.loggedHours,
          milestone: task.milestone,
          dependencies: task.dependencies || []
        }))
        
        setTasks(transformedTasks)
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      }
    }

    fetchTasks()
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const response = await fetch(`/api/${organisationId}/projects/${projectId}/tasks?taskId=${taskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      // Refresh tasks list
      refreshTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
      // TODO: Show error toast
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'review':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'todo': 'bg-gray-100 text-gray-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'review': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors]
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    return colors[priority as keyof typeof colors]
  }

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const groupTasks = (tasks: Task[]) => {
    const groups: Record<string, Task[]> = {}
    
    tasks.forEach(task => {
      let key = ''
      switch (groupBy) {
        case 'status':
          key = task.status
          break
        case 'priority':
          key = task.priority
          break
        case 'assignee':
          key = task.assignedTo?.name || 'Unassigned'
          break
        case 'milestone':
          key = task.milestone || 'No Milestone'
          break
      }
      
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(task)
    })
    
    return groups
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const groupedTasks = groupTasks(filteredTasks)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Tasks</h2>
          <p className="text-gray-600">Manage and track project tasks</p>
        </div>
        <CreateTaskForm 
          projectId={projectId} 
          organisationId={organisationId}
          onTaskCreated={refreshTasks}
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          }
        />
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white"
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
                className="px-3 py-2 border rounded-md bg-white"
              >
                <option value="status">Group by Status</option>
                <option value="priority">Group by Priority</option>
                <option value="assignee">Group by Assignee</option>
                <option value="milestone">Group by Milestone</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Groups */}
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([groupKey, groupTasks]) => (
          <Card key={groupKey}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {groupBy === 'status' && getStatusIcon(groupKey)}
                  {groupBy === 'priority' && (
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(groupKey).split(' ')[0]}`} />
                  )}
                  {groupKey}
                  <Badge variant="secondary">{groupTasks.length}</Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {groupTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleTaskExpansion(task.id)}
                          >
                            {expandedTasks.has(task.id) ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                          </Button>
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                            {task.status}
                          </Badge>
                          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3 ml-9">
                            {task.description}
                          </p>
                        )}

                        {/* Tags */}
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3 ml-9">
                            {task.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between ml-9">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {task.assignedTo && (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={task.assignedTo.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{task.assignedTo.name}</span>
                              </div>
                            )}
                            {task.dueDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {task.comments > 0 && (
                              <span>{task.comments} comments</span>
                            )}
                            {task.attachments > 0 && (
                              <span>{task.attachments} attachments</span>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Expanded Content */}
                        {expandedTasks.has(task.id) && (
                          <div className="mt-4 pt-4 border-t ml-9">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium text-sm mb-2">Subtasks</h5>
                                <div className="space-y-1">
                                  {task.subtasks.map((subtask) => (
                                    <div key={subtask.id} className="flex items-center gap-2 text-sm">
                                      <div className={`w-3 h-3 rounded ${subtask.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                                      <span className={subtask.completed ? 'line-through text-gray-500' : ''}>
                                        {subtask.title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h5 className="font-medium text-sm mb-2">Time Tracking</h5>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span>Estimated:</span>
                                    <span>{task.estimatedHours || 0}h</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Actual:</span>
                                    <span>{task.actualHours || 0}h</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || selectedStatus !== 'all' || selectedPriority !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Create your first task to get started'
                }
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
