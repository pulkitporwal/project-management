"use client"
import { useState } from 'react';
import { Search, Plus, Bell, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects, tasks, people..."
            className="pl-10 pr-12 bg-muted/50 border-transparent focus:bg-background focus:border-input"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Create New</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>New Project</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>New Task</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>New OKR</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>New Review</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 justify-center text-[10px]">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <p className="text-sm font-medium">New task assigned</p>
                <p className="text-xs text-muted-foreground">Sarah assigned you "Design Review"</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <p className="text-sm font-medium">Project deadline updated</p>
                <p className="text-xs text-muted-foreground">Website Redesign deadline moved</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <p className="text-sm font-medium">Review cycle started</p>
                <p className="text-xs text-muted-foreground">Q1 Performance Reviews are now open</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
