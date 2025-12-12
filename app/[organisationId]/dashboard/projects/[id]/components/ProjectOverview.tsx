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

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Velocity (last 3 sprints)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.velocityPointsLast3Sprints || 0} pts</div>
              <p className="text-xs text-muted-foreground">Total story points completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lead Time (avg)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.leadTimeAvgDays || 0} days</div>
              <p className="text-xs text-muted-foreground">Created to Done</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cycle Time (avg)</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.cycleTimeAvgDays || 0} days</div>
              <p className="text-xs text-muted-foreground">In-Progress to Done</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WIP</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.wipCount || 0}</div>
              <p className="text-xs text-muted-foreground">In-progress and review</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Backlog</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.backlogCount || 0}</div>
              <p className="text-xs text-muted-foreground">Items waiting</p>
            </CardContent>
          </Card>
          {analytics.burndown && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Burndown</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm">Committed: {analytics.burndown.committedPoints} pts</div>
                <div className="text-sm">Completed: {analytics.burndown.completedPoints} pts</div>
                <div className="text-sm">Remaining: {analytics.burndown.remainingPoints} pts</div>
                <div className="text-xs text-muted-foreground">Days left: {analytics.burndown.daysLeft}</div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
