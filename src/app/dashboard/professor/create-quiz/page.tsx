
'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { detailedSyllabus } from '@/lib/mock-data';
import { useProfessorSession } from '@/context/professor-session-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function CreateQuizPage() {
  const [date, setDate] = useState<Date>();
  const { selectedClass, isLoading } = useProfessorSession();

  const topicsForSubject = useMemo(() => {
    if (!selectedClass) return [];
    
    for (const year of Object.values(detailedSyllabus)) {
        for (const semester of Object.values(year)) {
            const subject = semester.find(s => s.name === selectedClass.subject);
            if (subject) {
                return subject.topics;
            }
        }
    }
    return [];
  }, [selectedClass]);

  if (isLoading) {
    return (
        <main className="flex-1 space-y-6 p-4 md:p-6">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </main>
    )
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PlusCircle className="h-6 w-6" />
            <CardTitle className="text-2xl">Log Syllabus Topic</CardTitle>
          </div>
          <CardDescription>
            Adding a topic for{' '}
            <span className="font-semibold text-primary">{selectedClass?.subject} ({selectedClass?.section})</span> 
            {' '}will automatically generate a 5-question quiz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
               <Input id="course" value={selectedClass?.subject || 'Loading...'} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Select>
                <SelectTrigger id="topic">
                    <SelectValue placeholder="Select a topic to generate a quiz for" />
                </SelectTrigger>
                <SelectContent>
                    {topicsForSubject.map(topic => (
                        <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Scheduled Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="pass-percentage">Pass Percentage (%)</Label>
              <Input id="pass-percentage" type="number" placeholder="e.g., 60" />
            </div>
            <Button size="lg" className="w-full">
              <PlusCircle className="mr-2" />
              Log Topic & Generate Quiz
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
