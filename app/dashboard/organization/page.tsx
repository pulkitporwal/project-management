"use client"
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Search,
    Plus,
    Building2,
    Users,
    Shield,
    History,
    MoreHorizontal,
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

const departments = [
    { id: 1, name: 'Engineering', headCount: 12, lead: 'Sarah Chen' },
    { id: 2, name: 'Product', headCount: 5, lead: 'Alex Johnson' },
    { id: 3, name: 'Design', headCount: 4, lead: 'Mike Williams' },
    { id: 4, name: 'Marketing', headCount: 6, lead: 'Emily Davis' },
];

const auditLogs = [
    { id: 1, user: 'John Doe', action: 'Updated project settings', target: 'Website Redesign', time: '2 hours ago' },
    { id: 2, user: 'Sarah Chen', action: 'Added team member', target: 'Emily Davis', time: '5 hours ago' },
    { id: 3, user: 'Alex Johnson', action: 'Modified role permissions', target: 'Editor role', time: '1 day ago' },
    { id: 4, user: 'John Doe', action: 'Created new project', target: 'Mobile App v2.0', time: '2 days ago' },
];

const roles = [
    { id: 1, name: 'Admin', members: 2, permissions: ['Full access'] },
    { id: 2, name: 'Manager', members: 5, permissions: ['Manage team', 'View analytics', 'Create projects'] },
    { id: 3, name: 'Member', members: 12, permissions: ['View projects', 'Manage tasks', 'Add comments'] },
    { id: 4, name: 'Viewer', members: 3, permissions: ['View only'] },
];

export default function Organization() {
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
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/10">
                                <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold">Organization</h1>
                                <p className="text-muted-foreground">
                                    Manage your organization, teams, and permissions
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <Tabs defaultValue="departments" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="departments" className="gap-2">
                            <Building2 className="h-4 w-4" />
                            Departments
                        </TabsTrigger>
                        <TabsTrigger value="roles" className="gap-2">
                            <Shield className="h-4 w-4" />
                            Roles & Permissions
                        </TabsTrigger>
                        <TabsTrigger value="audit" className="gap-2">
                            <History className="h-4 w-4" />
                            Audit Log
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="departments">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search departments..."
                                        className="pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-input"
                                    />
                                </div>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Department
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {departments.map((dept) => (
                                    <Card key={dept.id} className="hover:border-primary/20 transition-colors">
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{dept.name}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Lead: {dept.lead}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-2 mt-4">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">{dept.headCount} members</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="roles">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-muted-foreground">
                                    Manage roles and their permissions
                                </p>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Role
                                </Button>
                            </div>

                            <div className="grid gap-4">
                                {roles.map((role) => (
                                    <Card key={role.id}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 rounded-lg bg-primary/10">
                                                        <Shield className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold">{role.name}</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            {role.members} members
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {role.permissions.map((perm) => (
                                                            <Badge key={perm} variant="secondary" className="text-xs">
                                                                {perm}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        Edit
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="audit">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>Audit Log</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Action</TableHead>
                                                <TableHead>Target</TableHead>
                                                <TableHead>Time</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {auditLogs.map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                                    {log.user.split(' ').map(n => n[0]).join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="font-medium">{log.user}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{log.action}</TableCell>
                                                    <TableCell className="text-muted-foreground">{log.target}</TableCell>
                                                    <TableCell className="text-muted-foreground">{log.time}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>
                </Tabs>
            </div>
    );
}
