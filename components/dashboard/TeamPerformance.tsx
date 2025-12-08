import { useAppStore } from '@/stores/appStore';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function TeamPerformance() {
  const teamMembers = useAppStore((state) => state.teamMembers);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-success';
      case 'away':
        return 'bg-warning';
      default:
        return 'bg-muted-foreground';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 80) return 'text-info';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="bg-card rounded-xl border border-border p-6"
    >
      <h2 className="text-lg font-semibold mb-6">Team Performance</h2>

      <div className="space-y-4">
        {teamMembers.slice(0, 5).map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {member.avatar}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
                  getStatusColor(member.status)
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium truncate">{member.name}</p>
                <Badge variant="secondary" className="text-xs">
                  {member.department}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{member.role}</p>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={member.performance} className="w-20 h-1.5" />
              <span className={cn('text-sm font-semibold', getPerformanceColor(member.performance))}>
                {member.performance}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
