
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
import { generateQuizFromSyllabus } from '@/ai/flows/generate-quiz-from-syllabus';

export default function CreateQuizPage() {
  const [date, setDate] = useState<Date>();
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [passPercentage, setPassPercentage] = useState<string>('60');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedClass, isLoading } = useProfessorSession();
  const [topicsForSubject, setTopicsForSubject] = useState<string[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedClass) {
        setTopicsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `/api/syllabus?batch=${selectedClass.batch}&section=${selectedClass.section}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (response.ok) {
          const syllabi = await response.json();
          if (syllabi.length > 0) {
            const syllabus = syllabi[0];
            const subject = syllabus.subjects?.find((s: any) => s.name === selectedClass.subject);
            if (subject && subject.topics) {
              setTopicsForSubject(subject.topics.map((t: any) => t.topic || t));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching topics:', err);
      } finally {
        setTopicsLoading(false);
      }
    };

    fetchTopics();
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

    setIsSubmitting(true);

    try {
      // Generate quiz using AI
      const aiResult = await generateQuizFromSyllabus({
        syllabusTopic: selectedTopic,
        difficultyLevel: difficulty || 'medium',
        numberOfQuestions: 5,
      });

      // Format questions for the API - convert correctAnswer string to index
      const formattedQuestions = aiResult.quizQuestions.map((q, index) => {
        // Find the index of the correct answer in options
        const correctIndex = q.options.findIndex(opt => opt === q.correctAnswer);
        return {
          question: q.question,
          options: q.options,
          correctAnswer: correctIndex >= 0 ? correctIndex : 0,
          points: 20, // 5 questions = 100 points total
        };
      });

      // Save quiz to database
      const token = localStorage.getItem('token');
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `${selectedClass.subject} - ${selectedTopic}`,
          subject: selectedClass.subject,
          topics: [selectedTopic],
          questions: formattedQuestions,
          createdBy: user._id,
          dueDate: date?.toISOString(),
          passPercentage: parseInt(passPercentage) || 60,
          batch: selectedClass.batch,
          section: selectedClass.section,
          difficulty: difficulty || 'medium',
        }),
      });

      if (response.ok) {
        toast({
          title: 'Quiz Created!',
          description: `Successfully generated a ${formattedQuestions.length}-question quiz for "${selectedTopic}".`,
        });
        
        // Reset form
        setSelectedTopic('');
        setDate(undefined);
        setDifficulty('medium');
        setPassPercentage('60');
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
                value={passPercentage}
                onChange={(e) => setPassPercentage(e.target.value)}
              />
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
