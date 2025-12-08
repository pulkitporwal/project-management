import { useAppStore, TaskStatus, Task } from '@/stores/appStore';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Plus, MoreHorizontal, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: 'bg-slate-500' },
  { id: 'todo', title: 'To Do', color: 'bg-slate-400' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-info' },
  { id: 'review', title: 'In Review', color: 'bg-warning' },
  { id: 'done', title: 'Done', color: 'bg-success' },
];

const priorityColors = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  medium: 'bg-info/10 text-info',
  high: 'bg-warning/10 text-warning',
  urgent: 'bg-destructive/10 text-destructive',
};

export function KanbanBoard() {
  const tasks = useAppStore((state) => state.tasks);
  const teamMembers = useAppStore((state) => state.teamMembers);
  const moveTask = useAppStore((state) => state.moveTask);

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((task) => task.status === status);

  const getAssignee = (assigneeId?: string) =>
    teamMembers.find((m) => m.id === assigneeId);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as TaskStatus;

    moveTask(draggableId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-6 min-h-[calc(100vh-12rem)]">
        {columns.map((column, columnIndex) => (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * columnIndex }}
            className="flex-shrink-0 w-80"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full', column.color)} />
                <h3 className="font-medium">{column.title}</h3>
                <Badge variant="secondary" className="ml-1">
                  {getTasksByStatus(column.id).length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    'kanban-column transition-colors',
                    snapshot.isDraggingOver && 'bg-primary/5 border-2 border-dashed border-primary/20'
                  )}
                >
                  {getTasksByStatus(column.id).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            'kanban-card mb-3',
                            snapshot.isDragging && 'shadow-lg ring-2 ring-primary/20'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <h4 className="font-medium text-sm leading-snug">
                              {task.title}
                            </h4>
                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>

                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-1.5 mb-3">
                            <Badge className={cn('text-xs', priorityColors[task.priority])}>
                              {task.priority}
                            </Badge>
                            {task.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            {task.dueDate && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(task.dueDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </div>
                            )}
                            {task.assigneeId && (
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                  {getAssignee(task.assigneeId)?.avatar}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </motion.div>
        ))}
      </div>
    </DragDropContext>
  );
}
