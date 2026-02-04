'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Clock,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface ClassTeaching {
  subject: string;
  subjectCode?: string;
  program?: string;
  course?: string;
  batch: string;
  semester?: string;
  section: string;
  year?: number;
  status?: 'active' | 'completed';
  timeSlots?: TimeSlot[];
}

interface TimetableEvent {
  id: string;
  subject: string;
  subjectCode: string;
  section: string;
  program: string;
  day: string;
  startTime: string;
  endTime: string;
  color: string;
}

// Color palette for different classes
const classColors = [
  'bg-purple-500',
  'bg-green-500',
  'bg-red-500',
  'bg-blue-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-indigo-500',
];

const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Time slots from 6am to 6pm
const timeSlots = Array.from({ length: 13 }, (_, i) => {
  const hour = i + 6;
  return {
    label: hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`,
    value: `${hour.toString().padStart(2, '0')}:00`,
    hour
  };
});

export default function TimetablePage() {
  const [classes, setClasses] = useState<ClassTeaching[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/professors/classes', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched classes:', data);
        const activeClasses = data.filter((cls: ClassTeaching) => cls.status !== 'completed');
        console.log('Active classes with timeSlots:', activeClasses.map((c: ClassTeaching) => ({ 
          subject: c.subject, 
          timeSlots: c.timeSlots 
        })));
        setClasses(activeClasses);
      } else {
        console.error('Failed to fetch classes:', res.status);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Get week dates
  const weekDates = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [currentDate]);

  // Convert classes to timetable events
  const events = useMemo(() => {
    const allEvents: TimetableEvent[] = [];
    
    classes.forEach((cls, classIndex) => {
      if (cls.timeSlots && cls.timeSlots.length > 0) {
        cls.timeSlots.forEach((slot, slotIndex) => {
          allEvents.push({
            id: `${cls.subjectCode}-${slot.day}-${slotIndex}`,
            subject: cls.subject,
            subjectCode: cls.subjectCode || cls.subject.substring(0, 6).toUpperCase(),
            section: cls.section,
            program: cls.program || 'CSE(AI&ML)',
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            color: classColors[classIndex % classColors.length],
          });
        });
      }
    });
    
    console.log('Generated events:', allEvents);
    return allEvents;
  }, [classes]);

  // Get events for a specific day and time
  const getEventsForSlot = (dayIndex: number, hour: number) => {
    const dayName = fullDays[dayIndex];
    return events.filter(event => {
      const eventStartHour = parseInt(event.startTime.split(':')[0]);
      const eventEndHour = parseInt(event.endTime.split(':')[0]);
      return event.day === dayName && eventStartHour <= hour && eventEndHour > hour;
    });
  };

  // Check if event starts at this hour
  const eventStartsAtHour = (event: TimetableEvent, hour: number) => {
    const eventStartHour = parseInt(event.startTime.split(':')[0]);
    return eventStartHour === hour;
  };

  // Get event duration in hours
  const getEventDuration = (event: TimetableEvent) => {
    const startHour = parseInt(event.startTime.split(':')[0]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    return endHour - startHour;
  };

  // Navigation
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format week range
  const weekRange = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[6];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (start.getMonth() === end.getMonth()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
  }, [weekDates]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Classroom Timetable</h1>
          </div>
          <p className="text-muted-foreground">
            View your weekly teaching schedule
          </p>
        </div>
        
        <Button variant="outline" onClick={fetchClasses} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="default" onClick={goToToday} className="ml-2">
                Today
              </Button>
            </div>

            {/* Date Range */}
            <div className="text-lg font-semibold">
              {weekRange}
            </div>

            {/* View Toggle */}
            <div className="flex rounded-lg overflow-hidden border">
              <Button 
                variant={view === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('month')}
                className="rounded-none"
              >
                Month
              </Button>
              <Button 
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('week')}
                className="rounded-none border-x"
              >
                Week
              </Button>
              <Button 
                variant={view === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('day')}
                className="rounded-none"
              >
                Day
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Week View */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Day Headers */}
              <div className="grid grid-cols-8 border-b">
                <div className="p-2 text-center text-xs font-medium text-muted-foreground border-r">
                  
                </div>
                {weekDates.map((date, index) => {
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <div 
                      key={index} 
                      className={cn(
                        "p-2 text-center border-r last:border-r-0",
                        isToday && "bg-primary/5"
                      )}
                    >
                      <div className="text-xs font-medium text-muted-foreground">
                        {days[index]} {date.getMonth() + 1}/{date.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* All-day row */}
              <div className="grid grid-cols-8 border-b">
                <div className="p-2 text-xs text-muted-foreground border-r flex items-center justify-center">
                  all-day
                </div>
                {weekDates.map((_, index) => (
                  <div key={index} className="p-2 border-r last:border-r-0 min-h-[40px]" />
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots.map((time) => (
                <div key={time.value} className="grid grid-cols-8 border-b last:border-b-0">
                  <div className="p-2 text-xs text-muted-foreground border-r flex items-start justify-center pt-0">
                    {time.label}
                  </div>
                  {weekDates.map((date, dayIndex) => {
                    const isToday = date.toDateString() === new Date().toDateString();
                    const slotEvents = getEventsForSlot(dayIndex, time.hour);
                    
                    return (
                      <div 
                        key={dayIndex} 
                        className={cn(
                          "border-r last:border-r-0 min-h-[60px] relative",
                          isToday && "bg-primary/5"
                        )}
                      >
                        {slotEvents.map((event) => {
                          if (eventStartsAtHour(event, time.hour)) {
                            const duration = getEventDuration(event);
                            return (
                              <div
                                key={event.id}
                                className={cn(
                                  "absolute left-0.5 right-0.5 rounded-md p-1.5 text-white text-xs overflow-hidden z-10",
                                  event.color
                                )}
                                style={{ 
                                  height: `${duration * 60 - 4}px`,
                                  top: '2px'
                                }}
                              >
                                <div className="font-semibold truncate">
                                  {event.startTime.replace(':00', '')}
                                </div>
                                <div className="font-bold truncate">
                                  {event.subjectCode} - {event.section}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          {classes.length > 0 && (
            <div className="p-4 border-t">
              <div className="flex flex-wrap gap-3">
                {classes.filter(c => c.status !== 'completed').map((cls, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded", classColors[index % classColors.length])} />
                    <span className="text-sm">
                      {cls.subjectCode || cls.subject.substring(0, 8)} - {cls.section}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {classes.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No classes scheduled</h3>
              <p className="text-sm mt-1">
                Add courses with time slots in My Courses to see them here
              </p>
            </div>
          )}

          {classes.length > 0 && events.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No time slots configured</h3>
              <p className="text-sm mt-1">
                Edit your courses in My Courses to add class timings
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
