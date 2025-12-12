"use client"
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, SortAsc, Search, Plus } from 'lucide-react';

export default function Kanban() {
  return (
    <div className="p-6 lg:p-8 h-full flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Kanban Board</h1>
              <p className="text-muted-foreground">
                Drag and drop tasks to update their status
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-10 bg-muted/50 border-transparent focus:bg-background focus:border-input"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="my-tasks">My Tasks</SelectItem>
                  <SelectItem value="high-priority">High Priority</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-hidden">
          <KanbanBoard />
        </div>
      </div>
  );
}
