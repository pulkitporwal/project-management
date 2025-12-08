import { useAppStore } from '@/stores/appStore';
import { motion } from 'framer-motion';
import { ArrowRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

export function ProjectsOverview() {
  const projects = useAppStore((state) => state.projects);
  const teamMembers = useAppStore((state) => state.teamMembers);

  const getProjectMembers = (teamIds: string[]) => {
    return teamMembers.filter((m) => teamIds.includes(m.id)).slice(0, 3);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-card rounded-xl border border-border p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Active Projects</h2>
        <Link to="/projects">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            View all
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {projects.slice(0, 4).map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="group flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{project.name}</h3>
                <Badge
                  variant="secondary"
                  className="text-xs capitalize"
                >
                  {project.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <Progress value={project.progress} className="h-1.5 flex-1 max-w-32" />
                <span className="text-xs text-muted-foreground">
                  {project.progress}%
                </span>
              </div>
            </div>
            <div className="flex items-center -space-x-2">
              {getProjectMembers(project.teamIds).map((member) => (
                <Avatar key={member.id} className="h-7 w-7 border-2 border-background">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {member.avatar}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
