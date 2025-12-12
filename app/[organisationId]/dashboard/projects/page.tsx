"use client"
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    Calendar,
    FolderKanban,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from '@/components/ui/sonner';
import { useSession } from 'next-auth/react';
import { canManageProjects } from '@/lib/roles';
import { SimpleProjectForm } from '@/components/forms/simple-project-form';
import Link from 'next/link';

export default function Projects() {
    const params = useParams();
    const organisationId = params.organisationId as string;
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch(`/api/${organisationId}/projects`);
                if (!response.ok) {
                    throw new Error('Failed to fetch projects');
                }
                const data = await response.json();
                setProjects(data);
                toast.success("Projects loaded");
            } catch (error) {
                console.error('Error fetching projects:', error);
                toast.error(error instanceof Error ? error.message : "Failed to load projects");
            } finally {
                setLoading(false);
            }
        };

        if (organisationId) {
            fetchProjects();
        }
    }, [organisationId]);

    const handleCreateProject = async (values: any) => {
        try {
            // Make actual API call to create project
            const response = await fetch(`/api/${organisationId}/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || 'Failed to create project');
            }

            const newProject = await response.json();

            // Add the new project to the local state
            setProjects(prev => [...prev, newProject]);

            // Close dialog after successful submission
            setIsCreateProjectDialogOpen(false);

            // Show success message
            toast.success("Project created successfully!");
        } catch (error) {
            console.error('Error creating project:', error);
            toast.error(error instanceof Error ? error.message : "Failed to create project");
        }
    };

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-[250px] bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold">Projects</h1>
                                <p className="text-muted-foreground">
                                    Manage and track all your projects
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1 lg:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search projects..."
                                        className="pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-input"
                                    />
                                </div>
                                <Button variant="outline" className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filter
                                </Button>
                                {canManageProjects(session) && (
                                  <Dialog open={isCreateProjectDialogOpen} onOpenChange={setIsCreateProjectDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        New Project
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>Create New Project</DialogTitle>
                                      </DialogHeader>
                                      <SimpleProjectForm
                                        onSubmit={handleCreateProject}
                                        onCancel={() => setIsCreateProjectDialogOpen(false)}
                                      />
                                    </DialogContent>
                                  </Dialog>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project: any, index) => (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.05 * index }}
                            >
                                <Link href={`/${organisationId}/dashboard/projects/${project._id}`}>
                                    <Card className="group max-h-[300px] h-[250px] hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer">
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10">
                                                        <FolderKanban
                                                            className="h-5 w-5"
                                                            style={{ color: 'var(--color-primary)' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">{project.title}</h3>
                                                        <Badge
                                                            variant="secondary"
                                                            className="mt-1 text-xs capitalize"
                                                        >
                                                            {project.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                {project.description}
                                            </p>

                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span className="text-muted-foreground">Progress</span>
                                                        <span className="font-medium">{project.progress || 0}%</span>
                                                    </div>
                                                    <Progress value={project.progress || 0} className="h-2" />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        {project.endDate && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar className="h-4 w-4" />
                                                                {new Date(project.endDate).toLocaleDateString(
                                                                    'en-US',
                                                                    {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                    }
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card></Link>
                            </motion.div>
                        ))}

                        {/* Add Project Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.05 * projects.length }}
                        >
                            <Dialog open={isCreateProjectDialogOpen} onOpenChange={setIsCreateProjectDialogOpen}>
                                <DialogTrigger asChild>
                                    <Card className="max-h-[300px] h-[250px] border-dashed hover:border-primary hover:bg-muted/30 transition-all duration-300 cursor-pointer flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                                <Plus className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <p className="font-medium">Create New Project</p>
                                            <p className="text-sm text-muted-foreground">
                                                Start tracking a new project
                                            </p>
                                        </div>
                                    </Card>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Create New Project</DialogTitle>
                                    </DialogHeader>
                                    <SimpleProjectForm
                                        onSubmit={handleCreateProject}
                                        onCancel={() => setIsCreateProjectDialogOpen(false)}
                                    />
                                </DialogContent>
                            </Dialog>
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    );
}
