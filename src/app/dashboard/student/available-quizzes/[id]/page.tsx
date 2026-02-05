'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trophy,
  Target,
  Brain,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  topic?: string;
  subtopic?: string;
  prerequisites?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  points?: number;
}

interface Quiz {
  _id: string;
  title: string;
  subject: string;
  unitName?: string;
  questions: Question[];
  duration: number;
  passPercentage: number;
  unitSummary?: string;
}

interface PerformanceAnalysis {
  overallAnalysis: string;
  strengthAreas: Array<{ topic: string; accuracy: number; comment: string }>;
  weakAreas: Array<{
    topic: string;
    subtopics: string[];
    prerequisites: string[];
    accuracy: number;
    severity: string;
    recommendation: string;
  }>;
  recommendations: string[];
  predictedGrade: string;
  improvementPlan: string;
}

export default function AttemptQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [startTime] = useState(Date.now());

  // Fetch quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          setQuiz(data);
          setAnswers(new Array(data.questions.length).fill(null));
          setTimeLeft(data.duration * 60); // Convert to seconds
        } else {
          toast({
            title: 'Error',
            description: 'Failed to load quiz',
            variant: 'destructive',
          });
          router.push('/dashboard/student/available-quizzes');
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId, router, toast]);

  // Timer
  useEffect(() => {
    if (!quiz || quizCompleted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, quizCompleted, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;
    
    setShowConfirmSubmit(false);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      
      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quizId: quiz._id,
          answers: answers.map(a => a ?? -1), // -1 for unanswered
          timeTaken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setQuizCompleted(true);
        
        toast({
          title: 'Quiz Submitted!',
          description: 'Your answers have been analyzed.',
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to submit quiz',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredCount = answers.filter((a) => a !== null).length;
  const progress = quiz ? (answeredCount / quiz.questions.length) * 100 : 0;

  if (isLoading) {
    return (
      <main className="flex-1 p-4 md:p-6">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="flex-1 p-4 md:p-6">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Quiz not found</h3>
            <Button 
              className="mt-4"
              onClick={() => router.push('/dashboard/student/available-quizzes')}
            >
              Back to Quizzes
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Show results page
  if (quizCompleted && results) {
    const percentage = Math.round((results.score / results.totalQuestions) * 100);
    const passed = percentage >= quiz.passPercentage;

    return (
      <main className="flex-1 p-4 md:p-6 animate-fade-in">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Score Card */}
          <Card className={cn(
            "border-2",
            passed ? "border-green-300 bg-green-50/50 dark:bg-green-900/10" : "border-red-300 bg-red-50/50 dark:bg-red-900/10"
          )}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={cn(
                  "h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4",
                  passed ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                )}>
                  {passed ? (
                    <Trophy className="h-12 w-12 text-green-600" />
                  ) : (
                    <Target className="h-12 w-12 text-red-600" />
                  )}
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  {results.score} / {results.totalQuestions}
                </h2>
                <p className="text-xl font-semibold mb-2">
                  {percentage}%
                </p>
                <Badge 
                  className={cn(
                    "text-lg px-4 py-1",
                    passed ? "bg-green-600" : "bg-red-600"
                  )}
                >
                  {passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                </Badge>
                {results.rank && (
                  <p className="mt-4 text-muted-foreground">
                    Your Rank: <span className="font-bold text-primary">#{results.rank}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          {results.performanceAnalysis && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    AI Performance Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {results.performanceAnalysis.overallAnalysis}
                  </p>
                  
                  {/* Predicted Grade */}
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Predicted Grade:</span>
                    <Badge variant="outline" className="text-lg font-bold">
                      {results.performanceAnalysis.predictedGrade}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Weak Areas */}
              {results.performanceAnalysis.weakAreas?.length > 0 && (
                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-orange-600">Areas Needing Improvement</CardTitle>
                    <CardDescription>Focus on these topics to improve your performance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.performanceAnalysis.weakAreas.map((area: any, i: number) => (
                      <div key={i} className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{area.topic}</h4>
                          <Badge 
                            variant={
                              area.severity === 'critical' ? 'destructive' : 
                              area.severity === 'needs_work' ? 'secondary' : 'outline'
                            }
                          >
                            {area.accuracy}% accuracy
                          </Badge>
                        </div>
                        {area.subtopics?.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-muted-foreground mb-1">Subtopics to review:</p>
                            <div className="flex flex-wrap gap-1">
                              {area.subtopics.map((sub: string, j: number) => (
                                <Badge key={j} variant="outline" className="text-xs">{sub}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {area.prerequisites?.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-muted-foreground mb-1">Prerequisites to strengthen:</p>
                            <div className="flex flex-wrap gap-1">
                              {area.prerequisites.map((pre: string, j: number) => (
                                <Badge key={j} variant="secondary" className="text-xs">{pre}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-sm text-orange-800 dark:text-orange-200 mt-2">
                          {area.recommendation}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Strength Areas */}
              {results.performanceAnalysis.strengthAreas?.length > 0 && (
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-600">Your Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      {results.performanceAnalysis.strengthAreas.map((area: any, i: number) => (
                        <div key={i} className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{area.topic}</h4>
                            <Badge className="bg-green-600 text-xs">{area.accuracy}%</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{area.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {results.performanceAnalysis.recommendations?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Study Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {results.performanceAnalysis.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Improvement Plan */}
              {results.performanceAnalysis.improvementPlan && (
                <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-600">Your Improvement Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {results.performanceAnalysis.improvementPlan}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <Button 
            className="w-full"
            onClick={() => router.push('/dashboard/student/available-quizzes')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>
        </div>
      </main>
    );
  }

  // Quiz attempt view
  const question = quiz.questions[currentQuestion];

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-semibold">{quiz.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {quiz.subject} {quiz.unitName && `• ${quiz.unitName}`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono",
                  timeLeft < 300 ? "bg-red-100 text-red-700" : "bg-muted"
                )}>
                  <Clock className="h-4 w-4" />
                  {formatTime(timeLeft)}
                </div>
                <Badge variant="outline">
                  {answeredCount}/{quiz.questions.length} answered
                </Badge>
              </div>
            </div>
            <Progress value={progress} className="mt-3 h-2" />
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </Badge>
              {question.difficulty && (
                <Badge 
                  variant="outline"
                  className={cn(
                    question.difficulty === 'easy' && 'border-green-300 text-green-700',
                    question.difficulty === 'medium' && 'border-yellow-300 text-yellow-700',
                    question.difficulty === 'hard' && 'border-red-300 text-red-700'
                  )}
                >
                  {question.difficulty}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg mt-4 leading-relaxed">
              {question.question}
            </CardTitle>
            {question.topic && (
              <CardDescription>Topic: {question.topic}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQuestion]?.toString() ?? ''}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer",
                    answers[currentQuestion] === index
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50 hover:bg-muted/50"
                  )}
                  onClick={() => handleAnswerChange(index.toString())}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer text-sm"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button
                onClick={() => setShowConfirmSubmit(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submit Quiz
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion((prev) => Math.min(quiz.questions.length - 1, prev + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Question Navigation */}
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground mb-3">Jump to question:</p>
            <div className="flex flex-wrap gap-2">
              {quiz.questions.map((_, index) => (
                <Button
                  key={index}
                  variant={answers[index] !== null ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0",
                    currentQuestion === index && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirm Submit Dialog */}
      <AlertDialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} out of {quiz.questions.length} questions.
              {answeredCount < quiz.questions.length && (
                <span className="block mt-2 text-orange-600">
                  Warning: You have {quiz.questions.length - answeredCount} unanswered questions!
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Answers</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Submit Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
