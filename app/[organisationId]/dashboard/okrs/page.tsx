"use client"
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Search,
    Plus,
    Filter,
    Target,
    TrendingUp,
    CheckCircle2,
    Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '@/lib/api';
import { toast } from '@/components/ui/sonner';
import { SimpleOKRForm } from '@/components/forms/simple-okr-form';

const statusColors = {
    'not-started': 'bg-muted/50 text-muted-foreground',
    'in-progress': 'bg-info/10 text-info',
    'completed': 'bg-success/10 text-success',
    'at-risk': 'bg-warning/10 text-warning',
    'archived': 'bg-muted/50 text-muted-foreground',
    'cancelled': 'bg-destructive/10 text-destructive',
};

export default function OKRs() {
    const [okrs, setOkrs] = useState<any[]>([]);
    const [isCreateOKRDialogOpen, setIsCreateOKRDialogOpen] = useState(false);

    useEffect(() => {
        apiGet<any[]>("/api/okrs")
            .then((data) => setOkrs(data))
            .catch((err) => toast.error(err.message || "Failed to load OKRs"));
    }, []);

    const handleCreateOKR = async (values: any) => {
        try {
            // Make actual API call to create OKR
            const response = await fetch('/api/okrs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create OKR');
            }

            const newOKR = await response.json();
            
            // Add new OKR to local state
            setOkrs(prev => [...prev, newOKR]);
            
            // Close dialog after successful submission
            setIsCreateOKRDialogOpen(false);
            
            // Show success message
            toast.success("OKR created successfully!");
        } catch (error) {
            console.error('Error creating OKR:', error);
            toast.error(error instanceof Error ? error.message : "Failed to create OKR");
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
                            <h1 className="text-2xl lg:text-3xl font-bold">OKRs</h1>
                            <p className="text-muted-foreground">
                                Track objectives and key results for your team
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 lg:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search OKRs..."
                                    className="pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-input"
                                />
                            </div>
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Q1 2024
                            </Button>
                            <Dialog open={isCreateOKRDialogOpen} onOpenChange={setIsCreateOKRDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        New Objective
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Create New OKR</DialogTitle>
                                    </DialogHeader>
                                    <SimpleOKRForm
                                        onSubmit={handleCreateOKR}
                                        onCancel={() => setIsCreateOKRDialogOpen(false)}
                                        users={[
                                            { id: "1", name: "John Doe" },
                                            { id: "2", name: "Jane Smith" },
                                            { id: "3", name: "Mike Johnson" },
                                        ]}
                                        teams={[
                                            { id: "1", name: "Engineering Team" },
                                            { id: "2", name: "Design Team" },
                                            { id: "3", name: "Marketing Team" },
                                        ]}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </motion.div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    {[
                        { title: 'Total Objectives', value: okrs.length, icon: Target, color: 'text-primary' },
                        { title: 'Active', value: okrs.filter((o: any) => o.status === 'active').length, icon: TrendingUp, color: 'text-success' },
                        { title: 'Key Results', value: okrs.reduce((sum: number, o: any) => sum + (o.keyResults?.length || 0), 0), icon: CheckCircle2, color: 'text-info' },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.05 * index }}
                        >
                            <Card>
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-muted">
                                        <stat.icon className={cn('h-6 w-6', stat.color)} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Objectives List */}
                <div className="space-y-6">
                    {okrs.map((objective: any, index) => (
                        <motion.div
                            key={objective._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 * index }}
                        >
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-xl bg-primary/10">
                                                <Target className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{objective.objective}</CardTitle>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <Badge variant="secondary">Q{objective.quarter} {objective.year}</Badge>
                                                    <Badge
                                                        className={cn(
                                                            'capitalize',
                                                            statusColors[objective.status as keyof typeof statusColors] || 'bg-muted/50 text-muted-foreground'
                                                        )}
                                                    >
                                                        {objective.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold">{objective.progress ?? 0}%</p>
                                            <p className="text-sm text-muted-foreground">Complete</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <Progress value={objective.progress ?? 0} className="h-2" />
                                    </div>

                                    <div className="space-y-4">
                                        {objective.keyResults?.map((kr: any, i: number) => {
                                            const pct = kr.targetValue ? Math.min(100, Math.round((kr.currentValue / kr.targetValue) * 100)) : 0;
                                            return (
                                            <div
                                                key={i}
                                                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                                            >
                                                {pct === 100 ? (
                                                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                                                ) : (
                                                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium">{kr.title}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Progress value={pct} className="h-1.5 flex-1 max-w-48" />
                                                        <span className="text-xs text-muted-foreground">
                                                            {kr.currentValue} / {kr.targetValue} {kr.unit}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        pct >= 70
                                                            ? 'text-success'
                                                            : pct >= 40
                                                                ? 'text-warning'
                                                                : 'text-destructive'
                                                    )}
                                                >
                                                    {pct}%
                                                </Badge>
                                            </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
    );
}
