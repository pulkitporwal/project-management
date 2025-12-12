"use client"
import { useAppStore } from '@/stores/appStore';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Target, Users, CheckCircle2 } from 'lucide-react';

const productivityData = [
  { name: 'Mon', tasks: 12, completed: 10 },
  { name: 'Tue', tasks: 18, completed: 15 },
  { name: 'Wed', tasks: 15, completed: 14 },
  { name: 'Thu', tasks: 22, completed: 18 },
  { name: 'Fri', tasks: 20, completed: 19 },
  { name: 'Sat', tasks: 8, completed: 8 },
  { name: 'Sun', tasks: 5, completed: 5 },
];

const velocityData = [
  { name: 'Week 1', velocity: 45 },
  { name: 'Week 2', velocity: 52 },
  { name: 'Week 3', velocity: 48 },
  { name: 'Week 4', velocity: 61 },
  { name: 'Week 5', velocity: 55 },
  { name: 'Week 6', velocity: 67 },
];

const departmentData = [
  { name: 'Engineering', performance: 88, tasks: 145 },
  { name: 'Design', performance: 92, tasks: 78 },
  { name: 'Product', performance: 85, tasks: 56 },
  { name: 'Marketing', performance: 79, tasks: 42 },
];

export default function Analytics() {
  const tasks = useAppStore((state) => state.tasks);
  const projects = useAppStore((state) => state.projects);
  const teamMembers = useAppStore((state) => state.teamMembers);

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
              <h1 className="text-2xl lg:text-3xl font-bold">Analytics</h1>
              <p className="text-muted-foreground">
                Track team productivity and project performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select defaultValue="7d">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Productivity',
              value: '87%',
              change: '+12%',
              positive: true,
              icon: Activity,
            },
            {
              title: 'Tasks Completed',
              value: '234',
              change: '+18%',
              positive: true,
              icon: CheckCircle2,
            },
            {
              title: 'Team Velocity',
              value: '67 pts',
              change: '+8%',
              positive: true,
              icon: Target,
            },
            {
              title: 'Active Members',
              value: teamMembers.length.toString(),
              change: '-',
              positive: true,
              icon: Users,
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * index }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <h3 className="text-2xl font-bold">{stat.value}</h3>
                        {stat.change !== '-' && (
                          <Badge
                            variant="secondary"
                            className={stat.positive ? 'text-success' : 'text-destructive'}
                          >
                            {stat.positive ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {stat.change}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-primary/10">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Weekly Productivity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={productivityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="tasks"
                        stackId="1"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary) / 0.2)"
                        name="Total Tasks"
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stackId="2"
                        stroke="hsl(var(--success))"
                        fill="hsl(var(--success) / 0.2)"
                        name="Completed"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Team Velocity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={velocityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="velocity"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                        name="Story Points"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Department Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-muted-foreground" />
                    <YAxis dataKey="name" type="category" className="text-muted-foreground" width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="performance"
                      fill="hsl(var(--primary))"
                      name="Performance %"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar
                      dataKey="tasks"
                      fill="hsl(var(--info))"
                      name="Tasks Completed"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
  );
}
