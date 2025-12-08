import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle2, MessageSquare, FileText, GitBranch, Clock } from 'lucide-react';

const activities = [
  {
    id: 1,
    user: { name: 'Sarah Chen', avatar: 'SC' },
    action: 'completed task',
    target: 'Implement authentication',
    project: 'Mobile App v2.0',
    time: '2 min ago',
    icon: CheckCircle2,
    iconColor: 'text-success',
  },
  {
    id: 2,
    user: { name: 'Alex Johnson', avatar: 'AJ' },
    action: 'commented on',
    target: 'Design review meeting notes',
    project: 'Website Redesign',
    time: '15 min ago',
    icon: MessageSquare,
    iconColor: 'text-info',
  },
  {
    id: 3,
    user: { name: 'Mike Williams', avatar: 'MW' },
    action: 'uploaded',
    target: 'New wireframes.fig',
    project: 'Dashboard Analytics',
    time: '1 hour ago',
    icon: FileText,
    iconColor: 'text-warning',
  },
  {
    id: 4,
    user: { name: 'Emily Davis', avatar: 'ED' },
    action: 'merged branch',
    target: 'feature/api-integration',
    project: 'API Integration',
    time: '2 hours ago',
    icon: GitBranch,
    iconColor: 'text-primary',
  },
  {
    id: 5,
    user: { name: 'James Wilson', avatar: 'JW' },
    action: 'updated deadline for',
    target: 'Database migration',
    project: 'API Integration',
    time: '3 hours ago',
    icon: Clock,
    iconColor: 'text-muted-foreground',
  },
];

export function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-card rounded-xl border border-border p-6"
    >
      <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>

      <div className="space-y-6">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
            className="flex gap-4"
          >
            <div className="relative">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {activity.user.avatar}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background flex items-center justify-center`}
              >
                <activity.icon className={`h-3.5 w-3.5 ${activity.iconColor}`} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{activity.user.name}</span>{' '}
                <span className="text-muted-foreground">{activity.action}</span>{' '}
                <span className="font-medium">{activity.target}</span>
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">{activity.project}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
