import { AppLayout } from '@/components/layout/AppLayout';
import { useAppStore } from '@/stores/appStore';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Plus,
  Star,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const reviews = [
  {
    id: 1,
    employee: { name: 'Sarah Chen', avatar: 'SC', role: 'Senior Developer' },
    cycle: 'Q1 2024',
    status: 'completed',
    selfScore: 4.2,
    managerScore: 4.5,
    peerScore: 4.3,
    completedDate: '2024-02-15',
  },
  {
    id: 2,
    employee: { name: 'Alex Johnson', avatar: 'AJ', role: 'Product Manager' },
    cycle: 'Q1 2024',
    status: 'pending',
    selfScore: 4.0,
    managerScore: null,
    peerScore: 4.1,
    dueDate: '2024-02-28',
  },
  {
    id: 3,
    employee: { name: 'Mike Williams', avatar: 'MW', role: 'UI/UX Designer' },
    cycle: 'Q1 2024',
    status: 'in-progress',
    selfScore: 3.8,
    managerScore: null,
    peerScore: null,
    dueDate: '2024-03-05',
  },
];

const statusConfig = {
  completed: { label: 'Completed', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  pending: { label: 'Pending Review', color: 'bg-warning/10 text-warning', icon: Clock },
  'in-progress': { label: 'In Progress', color: 'bg-info/10 text-info', icon: AlertCircle },
};

export default function Reviews() {
  const teamMembers = useAppStore((state) => state.teamMembers);

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
              <h1 className="text-2xl lg:text-3xl font-bold">Performance Reviews</h1>
              <p className="text-muted-foreground">
                Manage and track performance review cycles
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  className="pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-input"
                />
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Start Review
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Reviews</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              {[
                { title: 'Active Cycle', value: 'Q1 2024', subtitle: 'Current Period' },
                { title: 'Total Reviews', value: '12', subtitle: '5 pending' },
                { title: 'Average Score', value: '4.2', subtitle: 'Team Average' },
                { title: 'Completion Rate', value: '75%', subtitle: '9 of 12 done' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((review, index) => {
                const status = statusConfig[review.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * index }}
                  >
                    <Card className="hover:border-primary/20 transition-colors cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {review.employee.avatar}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold">{review.employee.name}</h3>
                              <Badge className={cn(status.color)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {review.employee.role} • {review.cycle}
                            </p>
                          </div>

                          <div className="hidden lg:flex items-center gap-8">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground mb-1">Self</p>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-warning fill-warning" />
                                <span className="font-semibold">
                                  {review.selfScore || '-'}
                                </span>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground mb-1">Manager</p>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-warning fill-warning" />
                                <span className="font-semibold">
                                  {review.managerScore || '-'}
                                </span>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground mb-1">Peer</p>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-warning fill-warning" />
                                <span className="font-semibold">
                                  {review.peerScore || '-'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            {review.status === 'completed' ? (
                              <p className="text-sm text-muted-foreground">
                                Completed {review.completedDate}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Due {review.dueDate}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Pending Reviews</h3>
                <p className="text-muted-foreground">
                  Reviews awaiting completion will appear here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-success mb-4" />
                <h3 className="font-semibold mb-2">Completed Reviews</h3>
                <p className="text-muted-foreground">
                  All completed reviews from this cycle
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
