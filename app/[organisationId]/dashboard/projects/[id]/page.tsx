"use client"
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
    Calendar,
    Users,
    Paperclip,
    CheckSquare,
    Settings,
    ArrowLeft,
    MoreHorizontal,
    Edit,
    Trash2,
    Plus,
    DollarSign
} from "lucide-react"
import ProjectOverview from './components/ProjectOverview'
import KanbanBoard from './components/KanbanBoard'
import ProjectAttachments from './components/ProjectAttachments'
import ProjectTeam from './components/ProjectTeam'
import ProjectTasks from './components/ProjectTasks'
import BudgetOverview from '@/components/budget/BudgetOverview'
import BudgetAnalytics from '@/components/budget/BudgetAnalytics'

export default function ProjectDetailPage() {
    const params = useParams()
    const router = useRouter()
    const organisationId = params.organisationId as string
    const projectId = params.id as string
    const [activeTab, setActiveTab] = useState("overview")
    const [project, setProject] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await fetch(`/api/${organisationId}/projects/${projectId}`)
                console.log(response)
                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Project not found')
                    } else if (response.status === 403) {
                        setError('Access denied')
                    } else {
                        setError('Failed to fetch project')
                    }
                    return
                }
                const data = await response.json()
                setProject(data)
            } catch (error) {
                console.error('Failed to fetch project:', error)
                setError('Failed to fetch project')
            } finally {
                setLoading(false)
            }
        }


        if (projectId && organisationId) {
            fetchProject()
        }
    }, [projectId, organisationId])

    const getStatusColor = (status: string) => {
        const colors = {
            active: "bg-green-500",
            planning: "bg-blue-500",
            completed: "bg-gray-500",
            "on-hold": "bg-yellow-500",
            cancelled: "bg-red-500"
        }
        return colors[status as keyof typeof colors] || "bg-gray-500"
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
                    <p className="text-gray-600 mb-4">{error || 'Project not found'}</p>
                    <Button onClick={() => router.push(`/${organisationId}/dashboard/projects`)}>
                        Back to Projects
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/30">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="text-gray-500" onClick={() => router.push(`/${organisationId}/dashboard/projects`)}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Projects
                            </Button>
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`} />
                                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                                <Badge variant="secondary" className={getPriorityColor(project.priority)}>
                                    {project.priority}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                            <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'} -
                                {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No end date'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{project.members?.length || 0} members</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4" />
                            <span>{project.completedTasks}/{project.tasks} tasks</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white px-6 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Project Progress</span>
                    <span className="text-sm text-gray-600">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
            </div>

            {/* Main Content */}
            <div className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="kanban" className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4" />
                            Kanban
                        </TabsTrigger>
                        <TabsTrigger value="budget" className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Budget
                        </TabsTrigger>
                        <TabsTrigger value="attachments" className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            Attachments
                        </TabsTrigger>
                        <TabsTrigger value="team" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Team
                        </TabsTrigger>
                        <TabsTrigger value="tasks" className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4" />
                            Tasks
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <ProjectOverview projectId={projectId} organisationId={organisationId} />
                    </TabsContent>

                    <TabsContent value="kanban" className="space-y-6">
                        <KanbanBoard projectId={projectId} organisationId={organisationId} />
                    </TabsContent>

                    <TabsContent value="budget" className="space-y-6">
                        <div className="space-y-6">
                            <BudgetOverview projectId={projectId} organisationId={organisationId} />
                            <BudgetAnalytics projectId={projectId} organisationId={organisationId} />
                        </div>
                    </TabsContent>

                    <TabsContent value="attachments" className="space-y-6">
                        <ProjectAttachments projectId={projectId} organisationId={organisationId} />
                    </TabsContent>

                    <TabsContent value="team" className="space-y-6">
                        <ProjectTeam projectId={projectId} />
                    </TabsContent>

                    <TabsContent value="tasks" className="space-y-6">
                        <ProjectTasks projectId={projectId} organisationId={organisationId} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}