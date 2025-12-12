"use client"
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Users,
  Calendar,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const insights = [
  {
    id: 1,
    type: 'prediction',
    title: 'Project Delay Risk Detected',
    description: 'Website Redesign may miss the March deadline. Current velocity suggests 2-week delay.',
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    priority: 'high',
    actions: ['View bottlenecks', 'Adjust resources'],
  },
  {
    id: 2,
    type: 'recommendation',
    title: 'Workload Imbalance',
    description: 'Sarah Chen has 40% more tasks than team average. Consider redistributing 3-4 tasks.',
    icon: Users,
    color: 'text-info',
    bgColor: 'bg-info/10',
    priority: 'medium',
    actions: ['View workload', 'Redistribute tasks'],
  },
  {
    id: 3,
    type: 'insight',
    title: 'Team Velocity Improving',
    description: 'Engineering team velocity increased 15% over the last sprint. Maintain current processes.',
    icon: TrendingUp,
    color: 'text-success',
    bgColor: 'bg-success/10',
    priority: 'low',
    actions: ['View details'],
  },
  {
    id: 4,
    type: 'suggestion',
    title: 'Skill Gap Identified',
    description: 'Team lacks expertise in GraphQL. Consider training or hiring for upcoming API project.',
    icon: Lightbulb,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    priority: 'medium',
    actions: ['Find courses', 'View job posts'],
  },
];

const growthSuggestions = [
  {
    employee: { name: 'Alex Johnson', avatar: 'AJ' },
    currentSkills: ['Product Strategy', 'User Research'],
    suggestedSkills: ['Data Analytics', 'A/B Testing'],
    reason: 'To better measure product impact and make data-driven decisions',
  },
  {
    employee: { name: 'Emily Davis', avatar: 'ED' },
    currentSkills: ['Backend Development', 'Python'],
    suggestedSkills: ['Cloud Architecture', 'Kubernetes'],
    reason: 'Aligns with company infrastructure modernization goals',
  },
];

export default function AIInsights() {
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
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">AI Insights</h1>
                <p className="text-muted-foreground">
                  AI-powered recommendations and predictions
                </p>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Insights
            </Button>
          </div>
        </motion.div>

        {/* AI Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-primary/5 via-transparent to-info/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Weekly Summary</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    This week, your team completed <span className="font-medium text-foreground">23 tasks</span> across 
                    <span className="font-medium text-foreground"> 4 active projects</span>. Overall productivity is 
                    <span className="font-medium text-success"> up 12%</span> compared to last week. One project 
                    shows signs of delay risk and workload distribution could be optimized. See detailed insights below.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Insights List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-semibold text-lg">Active Insights</h2>
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                >
                  <Card className="hover:border-primary/20 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={cn('p-3 rounded-xl', insight.bgColor)}>
                          <Icon className={cn('h-5 w-5', insight.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{insight.title}</h3>
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-xs capitalize',
                                insight.priority === 'high' && 'bg-destructive/10 text-destructive',
                                insight.priority === 'medium' && 'bg-warning/10 text-warning',
                                insight.priority === 'low' && 'bg-success/10 text-success'
                              )}
                            >
                              {insight.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {insight.description}
                          </p>
                          <div className="flex gap-2">
                            {insight.actions.map((action) => (
                              <Button key={action} variant="outline" size="sm">
                                {action}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Growth Recommendations */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Growth Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {growthSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-muted/30 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {suggestion.employee.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{suggestion.employee.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Current: {suggestion.currentSkills.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Suggested Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.suggestedSkills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <Lightbulb className="h-3 w-3 inline mr-1" />
                        {suggestion.reason}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    AI Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Delay Predictions', value: 87 },
                    { label: 'Workload Analysis', value: 92 },
                    { label: 'Skill Matching', value: 78 },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{metric.label}</span>
                        <span className="font-medium">{metric.value}%</span>
                      </div>
                      <Progress value={metric.value} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
  );
}
