"use client"
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

const objectives = [
    {
        id: 1,
        title: 'Increase Product Market Share',
        quarter: 'Q1 2024',
        progress: 72,
        status: 'on-track',
        keyResults: [
            { id: 1, title: 'Launch 3 new features', progress: 100, target: 3, current: 3 },
            { id: 2, title: 'Achieve 10,000 active users', progress: 85, target: 10000, current: 8500 },
            { id: 3, title: 'Reduce churn rate to 5%', progress: 60, target: 5, current: 7 },
        ],
    },
    {
        id: 2,
        title: 'Improve Customer Satisfaction',
        quarter: 'Q1 2024',
        progress: 55,
        status: 'at-risk',
        keyResults: [
            { id: 1, title: 'Achieve NPS score of 50+', progress: 80, target: 50, current: 45 },
            { id: 2, title: 'Response time under 2 hours', progress: 40, target: 2, current: 3.2 },
            { id: 3, title: 'Resolve 95% tickets in first contact', progress: 45, target: 95, current: 78 },
        ],
    },
    {
        id: 3,
        title: 'Scale Engineering Team',
        quarter: 'Q1 2024',
        progress: 85,
        status: 'on-track',
        keyResults: [
            { id: 1, title: 'Hire 5 senior engineers', progress: 100, target: 5, current: 5 },
            { id: 2, title: 'Complete onboarding program', progress: 80, target: 100, current: 80 },
            { id: 3, title: 'Establish mentorship program', progress: 75, target: 100, current: 75 },
        ],
    },
];

const statusColors = {
    'on-track': 'bg-success/10 text-success',
    'at-risk': 'bg-warning/10 text-warning',
    'behind': 'bg-destructive/10 text-destructive',
};

export default function OKRs() {
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
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                New Objective
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    {[
                        { title: 'Total Objectives', value: 3, icon: Target, color: 'text-primary' },
                        { title: 'On Track', value: 2, icon: TrendingUp, color: 'text-success' },
                        { title: 'Key Results', value: 9, icon: CheckCircle2, color: 'text-info' },
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
                    {objectives.map((objective, index) => (
                        <motion.div
                            key={objective.id}
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
                                                <CardTitle className="text-lg">{objective.title}</CardTitle>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <Badge variant="secondary">{objective.quarter}</Badge>
                                                    <Badge
                                                        className={cn(
                                                            'capitalize',
                                                            statusColors[objective.status as keyof typeof statusColors]
                                                        )}
                                                    >
                                                        {objective.status.replace('-', ' ')}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold">{objective.progress}%</p>
                                            <p className="text-sm text-muted-foreground">Complete</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4">
                                        <Progress value={objective.progress} className="h-2" />
                                    </div>

                                    <div className="space-y-4">
                                        {objective.keyResults.map((kr) => (
                                            <div
                                                key={kr.id}
                                                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                                            >
                                                {kr.progress === 100 ? (
                                                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                                                ) : (
                                                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium">{kr.title}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Progress value={kr.progress} className="h-1.5 flex-1 max-w-48" />
                                                        <span className="text-xs text-muted-foreground">
                                                            {kr.current} / {kr.target}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        kr.progress >= 70
                                                            ? 'text-success'
                                                            : kr.progress >= 40
                                                                ? 'text-warning'
                                                                : 'text-destructive'
                                                    )}
                                                >
                                                    {kr.progress}%
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
    );
}
