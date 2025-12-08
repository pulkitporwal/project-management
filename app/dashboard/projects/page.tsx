"use client"
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    Calendar,
    FolderKanban,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

export default function Projects() {
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        apiGet<any[]>("/api/projects")
            .then((data) => {
                setProjects(data);
                toast.success("Projects loaded");
            })
            .catch((err) => {
                toast.error(err.message || "Failed to load projects");
            });
    }, []);

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
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
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                New Project
                            </Button>
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
                            <Card className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer">
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
                            </Card>
                        </motion.div>
                    ))}

                    {/* Add Project Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 * projects.length }}
                    >
                        <Card className="h-full border-dashed hover:border-primary/50 hover:bg-muted/30 transition-all duration-300 cursor-pointer flex items-center justify-center min-h-[280px]">
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
                    </motion.div>
                </div>
            </div>
    );
}
