import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Users,
  BarChart3,
  Calendar,
  Settings,
  Target,
  MessageSquare,
  Bell,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/tasks', icon: ListTodo, badge: 5 },
  { name: 'Kanban Board', href: '/kanban', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const performanceItems = [
  { name: 'OKRs', href: '/okrs', icon: Target },
  { name: 'Reviews', href: '/reviews', icon: MessageSquare },
  { name: 'AI Insights', href: '/ai-insights', icon: Sparkles },
];

const adminItems = [
  { name: 'Organization', href: '/organization', icon: Building2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-sidebar-foreground">WorkFlow</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Workspace
            </p>
          )}
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'sidebar-item',
                  isActive && 'active',
                  collapsed && 'justify-center px-2'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="h-5 w-5 p-0 justify-center text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="mt-6 space-y-1">
          {!collapsed && (
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Performance
            </p>
          )}
          {performanceItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'sidebar-item',
                  isActive && 'active',
                  collapsed && 'justify-center px-2'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </div>

        <div className="mt-6 space-y-1">
          {!collapsed && (
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Admin
            </p>
          )}
          {adminItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'sidebar-item',
                  isActive && 'active',
                  collapsed && 'justify-center px-2'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className={cn(
        'border-t border-sidebar-border p-4',
        collapsed && 'flex justify-center'
      )}>
        {collapsed ? (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              JD
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                John Doe
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Admin
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
