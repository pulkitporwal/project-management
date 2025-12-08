"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NavItem } from "../ui/nav-item";

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Tasks", href: "/dashboard/tasks", icon: ListTodo, badge: 5 },
  { name: "Kanban Board", href: "/dashboard/kanban", icon: LayoutDashboard },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

const performanceItems = [
  { name: "OKRs", href: "/dashboard/okrs", icon: Target },
  { name: "Reviews", href: "/dashboard/reviews", icon: MessageSquare },
  { name: "AI Insights", href: "/dashboard/ai-insights", icon: Sparkles },
];

const adminItems = [
  { name: "Organization", href: "/dashboard/organization", icon: Building2 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-sidebar-foreground">
              WorkFlow
            </span>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1 flex flex-col gap-3">
          {!collapsed && (
            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Workspace
            </p>
          )}

          {navigationItems.map((item) => (
            <NavItem
              key={item.name}
              href={item.href}
              className={({ isActive }) =>
                cn(
                  "sidebar-item flex gap-3 px-2",
                  isActive && "active",
                  collapsed && "justify-center px-2"
                )
              }
            >
              <item.icon className="w-5 h-5" />

              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="h-5 w-5 p-0 justify-center text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </NavItem>
          ))}
        </div>

        {/* Performance */}
        <div className="mt-6 space-y-1 flex flex-col gap-3">
          {!collapsed && (
            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Performance
            </p>
          )}

          {performanceItems.map((item) => (
            <NavItem
              key={item.name}
              href={item.href}
              className={({ isActive }) =>
                cn(
                  "sidebar-item flex gap-3 px-2",
                  isActive && "active",
                  collapsed && "justify-center px-2"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span>{item.name}</span>}
            </NavItem>
          ))}
        </div>

        {/* Admin */}
        <div className="mt-6 space-y-1 flex flex-col gap-3">
          {!collapsed && (
            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Admin
            </p>
          )}

          {adminItems.map((item) => (
            <NavItem
              key={item.name}
              href={item.href}
              className={({ isActive }) =>
                cn(
                  "sidebar-item flex gap-3 px-2",
                  isActive && "active",
                  collapsed && "justify-center px-2"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span>{item.name}</span>}
            </NavItem>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div
        className={cn(
          "border-t border-sidebar-border p-4",
          collapsed && "flex justify-center"
        )}
      >
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
              <p className="text-xs text-muted-foreground truncate">Admin</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
