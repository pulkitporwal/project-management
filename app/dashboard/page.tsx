"use client"
import { StatCard } from '@/components/dashboard/StatCard';
import { ProjectsOverview } from '@/components/dashboard/ProjectsOverview';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { TeamPerformance } from '@/components/dashboard/TeamPerformance';
import { TaskDistribution } from '@/components/dashboard/TaskDistribution';
import { useAppStore } from '@/stores/appStore';
import { motion } from 'framer-motion';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Target,
} from 'lucide-react';

export default function Dashboard() {
  const tasks = useAppStore((state) => state.tasks);
  const projects = useAppStore((state) => state.projects);
  const teamMembers = useAppStore((state) => state.teamMembers);

  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const avgPerformance = Math.round(
    teamMembers.reduce((acc, m) => acc + m.performance, 0) / teamMembers.length
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            Good morning, John 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your projects today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Projects"
            value={activeProjects}
            subtitle={`${projects.length} total projects`}
            icon={FolderKanban}
            color="primary"
            trend={{ value: 12, isPositive: true }}
            delay={0.1}
          />
          <StatCard
            title="Completed Tasks"
            value={completedTasks}
            subtitle={`${tasks.length} total tasks`}
            icon={CheckCircle2}
            color="success"
            trend={{ value: 8, isPositive: true }}
            delay={0.15}
          />
          <StatCard
            title="In Progress"
            value={inProgressTasks}
            subtitle="Tasks being worked on"
            icon={Clock}
            color="info"
            delay={0.2}
          />
          <StatCard
            title="Team Performance"
            value={`${avgPerformance}%`}
            subtitle={`${teamMembers.length} team members`}
            icon={TrendingUp}
            color="warning"
            trend={{ value: 5, isPositive: true }}
            delay={0.25}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProjectsOverview />
            <RecentActivity />
          </div>
          <div className="space-y-6">
            <TaskDistribution />
            <TeamPerformance />
          </div>
        </div>
      </div>
  );
}
