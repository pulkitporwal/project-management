"use client"
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { motion } from 'framer-motion'
import { MoreHorizontal, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface KanbanBoardProps {
  projectId: string
  organisationId: string
}

interface ProjectTask {
  _id: string
  title: string
  description?: string
  status: 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: {
    _id: string
    name: string
    avatar?: string
  }
  dueDate?: string
  labels: string[]
  createdAt: string
  updatedAt: string
}

interface TeamMember {
  _id: string
  name: string
  email: string
  avatar?: string
}

const columns: { id: string; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: 'bg-slate-500' },
  { id: 'todo', title: 'Todo', color: 'bg-slate-400' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-info' },
  { id: 'in-review', title: 'In Review', color: 'bg-warning' },
  { id: 'done', title: 'Done', color: 'bg-success' },
  { id: 'cancelled', title: 'Cancelled', color: 'bg-destructive' },
]

const priorityColors = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  medium: 'bg-info/10 text-info',
  high: 'bg-warning/10 text-warning',
  urgent: 'bg-destructive/10 text-destructive',
}

export default function KanbanBoard({ projectId, organisationId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project tasks
        const tasksResponse = await fetch(`/api/${organisationId}/projects/${projectId}/tasks`)
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json()
          setTasks(tasksData)
        }

        // Fetch team members
        const teamResponse = await fetch(`/api/${organisationId}/projects/${projectId}/team`)
        if (teamResponse.ok) {
          const teamData = await teamResponse.json()
          setTeamMembers(teamData)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId, organisationId])

  const getTasksByStatus = (status: string) =>
    tasks.filter((task) => task.status === status)

  const getAssignee = (assigneeId?: string) =>
    teamMembers.find((m) => m._id === assigneeId)

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const newStatus = destination.droppableId
    const taskId = draggableId

    // Update local state immediately for better UX
    setTasks(prev => prev.map(task => 
      task._id === taskId 
        ? { ...task, status: newStatus as any }
        : task
    ))

    // Update in backend
    try {
      const response = await fetch(`/api/${organisationId}/projects/${projectId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      })

      if (!response.ok) {
        // Revert on error
        setTasks(prev => prev.map(task => 
          task._id === taskId 
            ? { ...task, status: result.source.droppableId as any }
            : task
        ))
        throw new Error('Failed to update task status')
      }
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-6 px-1">
        {columns.map((_, index) => (
          <div key={index} className="flex-shrink-0 w-80">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 min-h-[500px]">
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 px-1">
        {columns.map((column, columnIndex) => (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * columnIndex }}
            className="flex-shrink-0 w-80"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className={cn('w-2.5 h-2.5 rounded-full', column.color)} />
                <h3 className="font-semibold text-sm">{column.title}</h3>
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {getTasksByStatus(column.id).length}
                </Badge>
              </div>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    'rounded-lg p-3 transition-all duration-200 min-h-[calc(100vh-16rem)]',
                    'bg-muted/30 border-2 border-transparent',
                    snapshot.isDraggingOver && 'bg-muted/60 border-primary/30 shadow-sm'
                  )}
                >
                  <div className="space-y-3">
                    {getTasksByStatus(column.id).map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              'bg-card rounded-lg p-4 border border-border shadow-sm',
                              'hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing',
                              snapshot.isDragging && 'shadow-xl ring-2 ring-primary/30 rotate-2 scale-105'
                            )}
                          >
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <h4 className="font-medium text-sm leading-snug flex-1">
                                {task.title}
                              </h4>
                              <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1 flex-shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>

                            {task.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-1.5 mb-3">
                              <Badge className={cn('text-xs font-medium', priorityColors[task.priority])}>
                                {task.priority}
                              </Badge>
                              {task.labels.slice(0, 2).map((label) => (
                                <Badge key={label} variant="secondary" className="text-xs">
                                  {label}
                                </Badge>
                              ))}
                              {task.labels.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{task.labels.length - 2}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                              {task.dueDate ? (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </div>
                              ) : (
                                <div />
                              )}
                              {task.assignedTo && (
                                <Avatar className="h-6 w-6 border border-border">
                                  <AvatarFallback className="text-[10px] font-medium bg-primary/10 text-primary">
                                    {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </div>
                  {provided.placeholder}
                  
                  {/* Empty state */}
                  {getTasksByStatus(column.id).length === 0 && (
                    <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                      No tasks
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </motion.div>
        ))}
      </div>
    </DragDropContext>
  )
}