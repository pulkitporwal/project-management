"use client"
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Search,
    Plus,
    Filter,
    MoreHorizontal,
    Calendar,
    ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '@/lib/api';
import { toast } from '@/components/ui/sonner';
import { SimpleTaskForm } from '@/components/forms/simple-task-form';

const statusColors: any = {
    backlog: 'badge-todo',
    todo: 'badge-todo',
    'in-progress': 'badge-progress',
    review: 'badge-review',
    done: 'badge-done',
};

const statusLabels: any = {
    backlog: 'Backlog',
    todo: 'To Do',
    'in-progress': 'In Progress',
    review: 'In Review',
    done: 'Done',
};

const priorityColors: any = {
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    medium: 'bg-info/10 text-info',
    high: 'bg-warning/10 text-warning',
    urgent: 'bg-destructive/10 text-destructive',
};

export default function Tasks() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);

    useEffect(() => {
        Promise.all([
            apiGet<any[]>("/api/tasks"),
            apiGet<any[]>("/api/projects"),
        ])
            .then(([t, p]) => {
                setTasks(t);
                setProjects(p);
            })
            .catch((err) => {
                toast.error(err.message || "Failed to load tasks");
            });
    }, []);

    const projectById = useMemo(() => {
        const map: Record<string, any> = {};
        projects.forEach((p: any) => { map[p._id] = p; });
        return map;
    }, [projects]);

    const handleCreateTask = async (values: any) => {
        try {
            // Make actual API call to create task
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create task');
            }

            const newTask = await response.json();

            // Add the new task to the local state
            setTasks(prev => [...prev, newTask]);

            // Close dialog after successful submission
            setIsCreateTaskDialogOpen(false);

            // Show success message
            toast.success("Task created successfully!");
        } catch (error) {
            console.error('Error creating task:', error);
            toast.error(error instanceof Error ? error.message : "Failed to create task");
        }
    };

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
                        <h1 className="text-2xl lg:text-3xl font-bold">Tasks</h1>
                        <p className="text-muted-foreground">
                            View and manage all your tasks in one place
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 lg:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                className="pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-input"
                            />
                        </div>
                        <Select defaultValue="all">
                            <SelectTrigger className="w-40">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Tasks</SelectItem>
                                <SelectItem value="my-tasks">My Tasks</SelectItem>
                                <SelectItem value="high-priority">High Priority</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                        <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Task
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Create New Task</DialogTitle>
                                </DialogHeader>
                                <SimpleTaskForm
                                    onSubmit={handleCreateTask}
                                    onCancel={() => setIsCreateTaskDialogOpen(false)}
                                    projects={projects.map(p => ({ id: p._id, title: p.title }))}
                                    users={[
                                        { id: "1", name: "John Doe" },
                                        { id: "2", name: "Jane Smith" },
                                        { id: "3", name: "Mike Johnson" },
                                    ]}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </motion.div>

            {/* Tasks Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-card rounded-xl border border-border overflow-hidden"
            >
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12"></TableHead>
                            <TableHead>
                                <Button variant="ghost" className="gap-1 -ml-4 font-medium">
                                    Task
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task: any, index) => {
                            const project = projectById[String(task.projectId)];
                            const uiStatus = task.status === 'completed' ? 'done' : (task.status === 'in-review' ? 'review' : task.status);

                            return (
                                <motion.tr
                                    key={task._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: 0.02 * index }}
                                    className="group hover:bg-muted/50 transition-colors"
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={uiStatus === 'done'}
                                            className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p
                                                className={cn(
                                                    'font-medium',
                                                    task.status === 'done' && 'line-through text-muted-foreground'
                                                )}
                                            >
                                                {task.title}
                                            </p>
                                            {task.labels && task.labels.length > 0 && (
                                                <div className="flex gap-1 mt-1">
                                                    {task.labels.slice(0, 2).map((tag: string) => (
                                                        <Badge
                                                            key={tag}
                                                            variant="secondary"
                                                            className="text-xs px-1.5"
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {project && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{project.title}</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn('badge-status', statusColors[uiStatus])}>
                                            {statusLabels[uiStatus]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn('text-xs capitalize', priorityColors[task.priority])}>
                                            {task.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-7 w-7">
                                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                    {String(task.assignedTo || '').slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{task.assignedTo ? String(task.assignedTo) : '—'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {task.dueDate && (
                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(task.dueDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </motion.tr>
                            );
                        })}
                    </TableBody>
                </Table>
            </motion.div>
        </div>
    );
}
