'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowRight, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  Sparkles 
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

interface AttemptedQuiz {
  _id: string;
  quizId: {
    title: string;
    subject: string;
    unitName?: string;
  };
  score: number;
  totalQuestions: number;
  percentage: number;
  status: 'pass' | 'fail' | 'attempted';
  timeTaken?: number;
  completedAt?: string;
}

export default function AttemptedQuizzesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [attempts, setAttempts] = useState<AttemptedQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch('/api/quiz-attempts', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch attempts');
        }

        const data = await response.json();
        setAttempts(data);
      } catch (err) {
        console.error('Error fetching attempts:', err);
        setError('Failed to load attempted quizzes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttempts();
  }, [router]);

  const handleViewDetails = (attemptId: string) => {
    router.push(`/dashboard/student/attempted-quizzes/${attemptId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' };
      case 'fail':
        return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' };
      default:
        return { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' };
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <Card className="border-red-200 dark:border-red-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attempted Quizzes</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review your quiz attempts with AI-powered explanations
            </p>
          </div>
        </div>
      </div>

      {/* Attempts Grid */}
      {attempts.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
              No quizzes attempted yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Start taking quizzes to see your attempts here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {attempts.map((attempt) => {
            const statusColor = getStatusColor(attempt.status);
            const percentageColor = getPercentageColor(attempt.percentage);
            const attemptDate = new Date(attempt.completedAt || '');
            const formattedDate = attemptDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const formattedTime = attemptDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <Card
                key={attempt._id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => handleViewDetails(attempt._id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Left Section - Quiz Info */}
                    <div className="flex-1 min-w-[200px] space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {attempt.quizId.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {attempt.quizId.subject}
                        </Badge>
                        {attempt.quizId.unitName && (
                          <Badge variant="secondary" className="text-xs">
                            {attempt.quizId.unitName}
                          </Badge>
                        )}
                      </div>

                      {/* Date and Time */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formattedTime}</span>
                        </div>
                        {attempt.timeTaken && (
                          <div className="hidden sm:flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Took {formatTime(attempt.timeTaken)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Score and Badge */}
                    <div className="flex items-center gap-4">
                      <div className="text-right space-y-1">
                        <div className="flex items-center justify-end gap-2">
                          <span className={cn('text-3xl font-bold', percentageColor)}>
                            {attempt.percentage}%
                          </span>
                          {attempt.status === 'pass' ? (
                            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {attempt.score}/{attempt.totalQuestions} correct
                        </p>
                        <Badge
                          className={cn('text-xs font-medium', statusColor)}
                          variant="outline"
                        >
                          {attempt.status === 'pass' ? '✓ Passed' : '✗ Failed'}
                        </Badge>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="group-hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(attempt._id);
                        }}
                      >
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Banner */}
      {attempts.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Click on any quiz to review all questions, see your answers, and get AI-powered explanations
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
