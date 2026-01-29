
'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, PlusCircle, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { detailedSyllabus } from '@/lib/mock-data';
import { useProfessorSession } from '@/context/professor-session-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function CreateQuizPage() {
  const [date, setDate] = useState<Date>();
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
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
        <main className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
            <Card className="max-w-4xl mx-auto animate-pulse">
                <CardHeader className="pb-3 sm:pb-4">
                    <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
                    <Skeleton className="h-3 sm:h-4 w-72 sm:w-96 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                        <Skeleton className="h-9 sm:h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                        <Skeleton className="h-9 sm:h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 sm:h-12 w-full" />
                </CardContent>
            </Card>
        </main>
    )
  }

  return (
    <main className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 animate-fade-in">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg bg-primary/10">
              <PlusCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl md:text-2xl">Log Syllabus Topic</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5">
                Adding a topic will automatically generate a 5-question quiz.
              </CardDescription>
            </div>
          </div>
          {selectedClass && (
            <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-4">
              <span className="text-xs sm:text-sm text-muted-foreground">Creating quiz for:</span>
              <Badge variant="outline" className="text-xs sm:text-sm">
                <BookOpen className="h-3 w-3 mr-1" />
                {selectedClass.subject}
              </Badge>
              <Badge variant="secondary" className="text-xs sm:text-sm">
                {selectedClass.section}
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form className="space-y-4 sm:space-y-6">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="course" className="text-xs sm:text-sm">Course</Label>
               <Input 
                id="course" 
                value={selectedClass?.subject || 'Loading...'} 
                disabled 
                className="text-sm bg-muted/50"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="topic" className="text-xs sm:text-sm">Topic</Label>
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger id="topic" className="text-sm">
                    <SelectValue placeholder="Select a topic to generate a quiz for" />
                </SelectTrigger>
                <SelectContent>
                    {topicsForSubject.map(topic => (
                        <SelectItem key={topic} value={topic} className="text-sm">{topic}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="date" className="text-xs sm:text-sm">Scheduled Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal text-sm',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="difficulty" className="text-xs sm:text-sm">Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty" className="text-sm">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy" className="text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Easy
                      </div>
                    </SelectItem>
                    <SelectItem value="medium" className="text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="hard" className="text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        Hard
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
             <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="pass-percentage" className="text-xs sm:text-sm">Pass Percentage (%)</Label>
              <Input 
                id="pass-percentage" 
                type="number" 
                placeholder="e.g., 60" 
                className="text-sm"
              />
            </div>
            <Button size="lg" className="w-full text-sm sm:text-base group">
              <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              Log Topic & Generate Quiz
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
