"use client"
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { canManageProjects } from '@/lib/roles'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SimpleProjectForm } from '@/components/forms/simple-project-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Users,
  DollarSign,
  Target,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2
} from "lucide-react"

interface ProjectOverviewProps {
  projectId: string,
  organisationId: string
}

export default function ProjectOverview({ projectId, organisationId }: ProjectOverviewProps) {
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<any>(null)
  const [budget, setBudget] = useState<any>(null)
  const [milestones, setMilestones] = useState<any[]>([])
  const [sprints, setSprints] = useState<any[]>([])
  const [currentSprint, setCurrentSprint] = useState<any>(null)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch(`/api/${organisationId}/projects/${projectId}`)
        if (!response.ok) { 
          throw new Error('Failed to fetch project data')
        }
        const data = await response.json()
        setProject(data)
        const analyticsRes = await fetch(`/api/${organisationId}/projects/${projectId}/analytics`)
        if (analyticsRes.ok) {
          setAnalytics(await analyticsRes.json())
        }
        const budgetRes = await fetch(`/api/${organisationId}/projects/${projectId}/budget`)
        if (budgetRes.ok) {
          setBudget(await budgetRes.json())
        }
        const milestonesRes = await fetch(`/api/${organisationId}/milestones?projectId=${projectId}`)
        if (milestonesRes.ok) {
          setMilestones(await milestonesRes.json())
        }
        const sprintsRes = await fetch(`/api/${organisationId}/sprints?projectId=${projectId}`)
        if (sprintsRes.ok) {
          const sprintsData = await sprintsRes.json()
          setSprints(sprintsData)
          // Find current sprint
          const activeSprint = sprintsData.find((sprint: any) => sprint.state === 'active')
          setCurrentSprint(activeSprint)
        }
      } catch (error) {
        console.error('Failed to fetch project data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [projectId, organisationId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!project) {
    return <div>Project not found</div>
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      planning: "bg-blue-100 text-blue-800",
      completed: "bg-gray-100 text-gray-800",
      "on-hold": "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800"
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    }
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
              <CardDescription className="text-base">{project.description}</CardDescription>
              <div className="flex items-center gap-2 mt-4">
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                <Badge variant="outline" className={getPriorityColor(project.priority)}>
                  {project.priority}
                </Badge>
                {(project.tags || []).map((tag: string) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {canManageProjects(session) && (
                <>
                  <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Edit Project</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                      </DialogHeader>
                      <SimpleProjectForm
                        mode="edit"
                        initialValues={{
                          title: project.title,
                          description: project.description,
                          status: project.status,
                          priority: project.priority,
                          startDate: project.startDate?.slice(0,10),
                          endDate: project.endDate?.slice(0,10),
                          visibility: project.visibility,
                          budget: project.budget,
                          client: project.client,
                          tags: project.tags || [],
                        }}
                        onCancel={() => setEditOpen(false)}
                        onSubmit={async (values: any) => {
                          const res = await fetch(`/api/${organisationId}/projects/${projectId}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(values),
                          })
                          if (!res.ok) {
                            const data = await res.json();
                            throw new Error(data?.error || 'Failed to update project')
                          }
                          const updated = await res.json();
                          setProject(updated);
                          setEditOpen(false);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button>Update Progress</Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.progress}%</div>
            <Progress value={project.progress} className="mt-2" />
            {analytics && (
              <p className="text-xs text-muted-foreground mt-2">
                {analytics.statusCounts?.done || 0} of {Object.values(analytics.statusCounts || {}).reduce((a:any,b:any)=>a+b,0)} tasks completed
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.members?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {project?.assignedTeams?.length || 0} teams assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(budget?.actualCost || project.actualCost || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              of ${(budget?.totalBudget || project?.budget || 0).toLocaleString()} total budget
            </p>
            <Progress value={((budget?.actualCost || project.actualCost || 0) / (budget?.totalBudget || project?.budget || 1)) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.duration || 0} days</div>
            <p className="text-xs text-muted-foreground">
              {project.startDate} - {project.endDate}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone: any) => (
              <div key={milestone._id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {milestone.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <h4 className="font-medium">{milestone.title}</h4>
                    <p className="text-sm text-gray-600">Due: {milestone.dueDate}</p>
                  </div>
                </div>
                <Badge variant={milestone.completed ? "default" : "secondary"}>
                  {milestone.completed ? "Completed" : "Pending"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {project.recentActivity ? (project.recentActivity.map((activity: any) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span> {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))) : (
              <div>No Recent Activities</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Sprint Section */}
      {currentSprint && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Current Sprint: {currentSprint.name}
            </CardTitle>
            <CardDescription>
              {currentSprint.goal && `Goal: ${currentSprint.goal}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Duration</div>
                <div className="text-lg font-semibold">{currentSprint.duration || 0} days</div>
                <div className="text-xs text-gray-500">{currentSprint.daysRemaining || 0} days left</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Progress</div>
                <div className="text-lg font-semibold">{currentSprint.completionPercentage || 0}%</div>
                <Progress value={currentSprint.completionPercentage || 0} className="mt-1" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Story Points</div>
                <div className="text-lg font-semibold">
                  {currentSprint.completedPoints || 0}/{currentSprint.committedPoints || 0}
                </div>
                <div className="text-xs text-gray-500">Completed/Committed</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Velocity</div>
                <div className="text-lg font-semibold">{currentSprint.velocity || 0}</div>
                <div className="text-xs text-gray-500">Points per sprint</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Agile Analytics */}
      {analytics && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Agile Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analytics.velocityPointsLast3Sprints || 0}</div>
                  <div className="text-sm text-gray-600">Avg Velocity (3 sprints)</div>
                  <div className="text-xs text-gray-500">Story points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analytics.leadTimeAvgDays || 0}</div>
                  <div className="text-sm text-gray-600">Avg Lead Time</div>
                  <div className="text-xs text-gray-500">Created to Done (days)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{analytics.cycleTimeAvgDays || 0}</div>
                  <div className="text-sm text-gray-600">Avg Cycle Time</div>
                  <div className="text-xs text-gray-500">In Progress to Done (days)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analytics.throughputPerWeek || 0}</div>
                  <div className="text-sm text-gray-600">Throughput</div>
                  <div className="text-xs text-gray-500">Tasks per week</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Work in Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Current WIP</span>
                    <Badge variant={analytics.wipCount > 5 ? "destructive" : "secondary"}>
                      {analytics.wipCount || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Backlog Items</span>
                    <Badge variant="outline">{analytics.backlogCount || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Code Review</span>
                    <Badge variant="outline">{analytics.reviewCount || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Blocked Items</span>
                    <Badge variant={analytics.blockedCount > 0 ? "destructive" : "secondary"}>
                      {analytics.blockedCount || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sprint Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Sprint Success Rate</span>
                    <Badge variant={analytics.sprintSuccessRate >= 80 ? "default" : "secondary"}>
                      {analytics.sprintSuccessRate || 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>On-Time Delivery</span>
                    <Badge variant={analytics.onTimeDeliveryRate >= 75 ? "default" : "secondary"}>
                      {analytics.onTimeDeliveryRate || 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Quality Score</span>
                    <Badge variant={analytics.qualityScore >= 90 ? "default" : "secondary"}>
                      {analytics.qualityScore || 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Team Morale</span>
                    <Badge variant={analytics.teamMorale >= 4 ? "default" : "secondary"}>
                      {analytics.teamMorale || 0}/5
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {analytics.burndown && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Sprint Burndown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{analytics.burndown.committedPoints || 0}</div>
                    <div className="text-sm text-gray-600">Committed Points</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{analytics.burndown.completedPoints || 0}</div>
                    <div className="text-sm text-gray-600">Completed Points</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">{analytics.burndown.remainingPoints || 0}</div>
                    <div className="text-sm text-gray-600">Remaining Points</div>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-gray-600">
                  {analytics.burndown.daysLeft || 0} days remaining in sprint
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
