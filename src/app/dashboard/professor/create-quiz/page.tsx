
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, PlusCircle, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useProfessorSession } from '@/context/professor-session-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

export default function CreateQuizPage() {
  const [date, setDate] = useState<Date>();
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [passPercentage, setPassPercentage] = useState<string>('60');
  const [questionCount, setQuestionCount] = useState<string>('5');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedClass, setSelectedClass, availableClasses, isLoading } = useProfessorSession();
  const [topicsForSubject, setTopicsForSubject] = useState<string[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!selectedClass && availableClasses.length === 1) {
      setSelectedClass(availableClasses[0]);
    }
  }, [availableClasses, selectedClass, setSelectedClass]);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedClass) {
        setTopicsForSubject([]);
        setTopicsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
          batch: selectedClass.batch,
          section: selectedClass.section,
        });
        if (selectedClass.year) params.set('year', selectedClass.year);
        if (selectedClass.semester) params.set('semester', selectedClass.semester);

        const response = await fetch(
          `/api/syllabus?${params.toString()}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (response.ok) {
          const syllabi = await response.json();
          if (syllabi.length > 0) {
            const syllabus = syllabi[0];
            const subject = syllabus.subjects?.find((s: any) => s.name === selectedClass.subject);
            if (subject && subject.topics) {
              setTopicsForSubject(subject.topics.map((t: any) => t.topic || t));
            } else {
              setTopicsForSubject([]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching topics:', err);
        setTopicsForSubject([]);
      } finally {
        setTopicsLoading(false);
      }
    };

    fetchTopics();
  }, [selectedClass]);

  useEffect(() => {
    setSelectedTopic('');
  }, [selectedClass]);

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!selectedClass || !selectedTopic || !user) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a class and topic.',
      });
      return;
    }

    const parsedQuestionCount = parseInt(questionCount, 10);
    if (Number.isNaN(parsedQuestionCount) || parsedQuestionCount < 5 || parsedQuestionCount > 20) {
      toast({
        variant: 'destructive',
        title: 'Invalid Question Count',
        description: 'Please choose between 5 and 20 questions.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate and save quiz on the server
      const token = localStorage.getItem('token');
      const response = await fetch('/api/quizzes/generate-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `${selectedClass.subject} - ${selectedTopic}`,
          subject: selectedClass.subject,
          topic: selectedTopic,
          dueDate: date?.toISOString(),
          passPercentage: parseInt(passPercentage) || 60,
          batch: selectedClass.batch,
          section: selectedClass.section,
          semester: selectedClass.semester,
          difficulty: difficulty || 'medium',
          numberOfQuestions: parsedQuestionCount,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const questionCount = data?.quiz?.questionCount || 5;

        toast({
          title: 'Quiz Created!',
          description: `Successfully generated a ${questionCount}-question quiz for "${selectedTopic}".`,
        });
        
        // Reset form
        setSelectedTopic('');
        setDate(undefined);
        setDifficulty('medium');
        setPassPercentage('60');
        setQuestionCount('5');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save quiz');
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate quiz. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || topicsLoading) {
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
                Adding a topic will automatically generate a quiz between 5 and 20 questions.
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
              <Label htmlFor="course" className="text-xs sm:text-sm">Class</Label>
              {availableClasses.length > 0 ? (
                <Select
                  value={
                    selectedClass
                      ? `${selectedClass.subject}||${selectedClass.batch}||${selectedClass.section}`
                      : ''
                  }
                  onValueChange={(value) => {
                    const [subject, batch, section] = value.split('||');
                    const found = availableClasses.find(
                      (cls) => cls.subject === subject && cls.batch === batch && cls.section === section
                    );
                    setSelectedClass(found || null);
                    setSelectedTopic('');
                  }}
                >
                  <SelectTrigger id="course" className="text-sm">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map((cls) => (
                      <SelectItem
                        key={`${cls.subject}-${cls.batch}-${cls.section}`}
                        value={`${cls.subject}||${cls.batch}||${cls.section}`}
                        className="text-sm"
                      >
                        {cls.subject} - Batch {cls.batch} Section {cls.section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="course"
                  value="No classes found. Add a class first."
                  disabled
                  className="text-sm bg-muted/50"
                />
              )}
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
              {!topicsLoading && selectedClass && topicsForSubject.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No topics found for this subject. Update the syllabus to add topics.
                </p>
              )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="question-count" className="text-xs sm:text-sm">Number of Questions</Label>
                <Input
                  id="question-count"
                  type="number"
                  min={5}
                  max={20}
                  className="text-sm"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Min 5, max 20</p>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="pass-percentage" className="text-xs sm:text-sm">Pass Percentage (%)</Label>
                <Input 
                  id="pass-percentage" 
                  type="number" 
                  placeholder="e.g., 60" 
                  className="text-sm"
                  value={passPercentage}
                  onChange={(e) => setPassPercentage(e.target.value)}
                />
              </div>
            </div>
            <Button 
              size="lg" 
              className="w-full text-sm sm:text-base group"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedTopic || !selectedClass}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              )}
              {isSubmitting ? 'Generating Quiz...' : 'Log Topic & Generate Quiz'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
