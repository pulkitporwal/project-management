import { AppLayout } from '@/components/layout/AppLayout';
import { useAppStore } from '@/stores/appStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Team() {
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
    <AppLayout>
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
              <h1 className="text-2xl lg:text-3xl font-bold">Team</h1>
              <p className="text-muted-foreground">
                Manage your team members and their performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  className="pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-input"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * index }}
            >
              <Card className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="text-lg bg-primary/10 text-primary">
                            {member.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={cn(
                            'absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background',
                            getStatusColor(member.status)
                          )}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {member.role}
                        </p>
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

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <Badge variant="secondary">{member.department}</Badge>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        Performance Score
                      </span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className={cn('h-4 w-4', getPerformanceColor(member.performance))} />
                        <span
                          className={cn(
                            'font-semibold',
                            getPerformanceColor(member.performance)
                          )}
                        >
                          {member.performance}%
                        </span>
                      </div>
                    </div>
                    <Progress value={member.performance} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Add Team Member Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * teamMembers.length }}
          >
            <Card className="h-full border-dashed hover:border-primary/50 hover:bg-muted/30 transition-all duration-300 cursor-pointer flex items-center justify-center min-h-[280px]">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium">Add Team Member</p>
                <p className="text-sm text-muted-foreground">
                  Invite a new member to your team
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
