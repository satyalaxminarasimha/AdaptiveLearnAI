
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ListChecks, ArrowRight, Clock, BookOpen, Calendar, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Quiz {
  _id: string;
  title: string;
  subject: string;
  unitName?: string;
  dueDate?: string;
  status?: string;
  difficulty?: string;
  duration?: number;
  isAIGenerated?: boolean;
  totalQuestions?: number;
  hasAttempted?: boolean;
}

export default function AvailableQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch quizzes
        const response = await fetch('/api/quizzes?isActive=true', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Fetch user's attempts
        const attemptsRes = await fetch('/api/quiz-attempts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const attempts = attemptsRes.ok ? await attemptsRes.json() : [];
          const attemptedQuizIds = new Set(attempts.map((a: any) => a.quizId?._id || a.quizId));
          
          setQuizzes(data.map((q: any) => ({
            ...q,
            totalQuestions: q.questions?.length || 0,
            status: attemptedQuizIds.has(q._id) ? 'Completed' : 'Available',
            hasAttempted: attemptedQuizIds.has(q._id),
          })));
        }
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleStartQuiz = (quizId: string) => {
    router.push(`/dashboard/student/available-quizzes/${quizId}`);
  };

  if (isLoading) {
    return (
      <main className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Card>
          <CardContent className="pt-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Available Quizzes</h1>
        <p className="text-sm sm:text-base text-muted-foreground">All the quizzes available for you to take.</p>
      </div>

      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <ListChecks className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Quiz List</CardTitle>
                <CardDescription className="text-xs sm:text-sm hidden sm:block">
                  Complete these quizzes to test your knowledge.
                </CardDescription>
              </div>
            </div>
            <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/20">
              {quizzes.length} available
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {quizzes.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No quizzes available at the moment.</p>
              <p className="text-sm text-muted-foreground mt-1">Check back later for new quizzes.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Quiz Title</TableHead>
                      <TableHead className="font-semibold">Subject</TableHead>
                      <TableHead className="font-semibold">Difficulty</TableHead>
                      <TableHead className="font-semibold">Questions</TableHead>
                      <TableHead className="text-right font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quizzes.map((quiz, index) => (
                      <TableRow 
                        key={quiz._id}
                        className="group cursor-pointer animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110">
                              <BookOpen className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{quiz.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{quiz.subject}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary"
                            className={cn(
                              quiz.difficulty === 'easy' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                              quiz.difficulty === 'medium' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                              quiz.difficulty === 'hard' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            )}
                          >
                            {quiz.difficulty || 'Medium'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{quiz.totalQuestions || '-'} questions</span>
                        </TableCell>
                        <TableCell className="text-right">
                          {quiz.hasAttempted ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="group/btn transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
                              onClick={() => handleStartQuiz(quiz._id)}
                            >
                              Start Quiz
                              <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {quizzes.map((quiz, index) => (
                  <div 
                    key={quiz._id}
                    className="p-4 rounded-lg border bg-card transition-all hover:shadow-md hover:border-primary/20 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{quiz.title}</h3>
                          <Badge variant="outline" className="text-[10px] mt-1">{quiz.subject}</Badge>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary"
                        className={cn(
                          "text-[10px] flex-shrink-0",
                          quiz.difficulty === 'easy' && 'bg-green-100 text-green-800',
                          quiz.difficulty === 'medium' && 'bg-yellow-100 text-yellow-800',
                          quiz.difficulty === 'hard' && 'bg-red-100 text-red-800'
                        )}
                      >
                        {quiz.difficulty || 'Medium'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{quiz.totalQuestions || '-'} questions</span>
                        {quiz.duration && (
                          <>
                            <span>•</span>
                            <span>{quiz.duration} min</span>
                          </>
                        )}
                      </div>
                      {quiz.hasAttempted ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Done
                        </Badge>
                      ) : (
                        <Button 
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleStartQuiz(quiz._id)}
                        >
                          Start
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
