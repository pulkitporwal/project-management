"use client"
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const events = [
  { id: 1, title: 'Design Review', time: '09:00', duration: '1h', color: 'bg-primary', day: 5 },
  { id: 2, title: 'Sprint Planning', time: '10:30', duration: '2h', color: 'bg-success', day: 8 },
  { id: 3, title: 'Team Standup', time: '09:30', duration: '30m', color: 'bg-info', day: 12 },
  { id: 4, title: 'Client Meeting', time: '14:00', duration: '1h', color: 'bg-warning', day: 15 },
  { id: 5, title: 'Code Review', time: '11:00', duration: '1h', color: 'bg-primary', day: 18 },
  { id: 6, title: 'Product Demo', time: '15:00', duration: '1.5h', color: 'bg-success', day: 22 },
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const [currentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);

  const getEventsForDay = (day: number) => events.filter((e) => e.day === day);

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
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Calendar</h1>
              <p className="text-muted-foreground">
                Manage your schedule and deadlines
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium min-w-32 text-center">
                  {currentDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <Card className="p-6">
              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {/* Empty cells for days before the first day of the month */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayEvents = getEventsForDay(day);
                  const isToday = day === new Date().getDate();
                  const isSelected = day === selectedDate;

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        'aspect-square p-2 rounded-lg border border-transparent cursor-pointer transition-all hover:bg-muted/50',
                        isToday && 'bg-primary/5 border-primary/20',
                        isSelected && 'bg-primary/10 border-primary/30 ring-2 ring-primary/20'
                      )}
                    >
                      <div className="flex flex-col h-full">
                        <span
                          className={cn(
                            'text-sm font-medium',
                            isToday && 'text-primary'
                          )}
                        >
                          {day}
                        </span>
                        <div className="flex-1 mt-1 space-y-1 overflow-hidden">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={cn(
                                'h-1.5 rounded-full',
                                event.color
                              )}
                            />
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{dayEvents.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                {events.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className={cn('w-1 h-12 rounded-full', event.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{event.time}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5">
                          {event.duration}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {currentDate.toLocaleDateString('en-US', { month: 'short' })} {event.day}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
  );
}
