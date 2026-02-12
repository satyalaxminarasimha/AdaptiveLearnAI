'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Loader,
  Clock,
  BookOpen,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  questionIndex: number;
  question: string;
  options: string[];
  topic: string;
  subtopic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  correctAnswer: number;
  selectedAnswer: number;
  isCorrect: boolean;
  points: number;
  explanation?: string;
}

interface QuizAttemptDetail {
  _id: string;
  quizId: {
    title: string;
    subject: string;
    unitName?: string;
  };
  studentId: {
    name: string;
    email: string;
  };
  score: number;
  totalQuestions: number;
  percentage: number;
  status: 'pass' | 'fail' | 'attempted';
  timeTaken?: number;
  attemptedAt: string;
  questions: Question[];
}

interface AIExplanation {
  explanation: string;
  whyCorrect: string;
  whyIncorrect?: string;
  keyPoints: string[];
  relatedConcepts: string[];
  studyTips: string[];
}

export default function QuizAttemptDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const attemptId = params.id as string;

  const [attemptData, setAttemptData] = useState<QuizAttemptDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<number, AIExplanation | null>>({});
  const [loadingExplanations, setLoadingExplanations] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchAttemptDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const response = await fetch(`/api/quiz-attempts/${attemptId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch quiz attempt');
        }

        const data = await response.json();
        setAttemptData(data);
      } catch (err) {
        console.error('Error fetching attempt:', err);
        setError('Failed to load quiz attempt. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttemptDetails();
  }, [attemptId, router]);

  const handleExplain = async (questionIndex: number) => {
    if (explanations[questionIndex]) {
      // Already loaded, just expand
      return;
    }

    setLoadingExplanations((prev) => ({ ...prev, [questionIndex]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/quiz-attempts/${attemptId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionIndex }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate explanation');
      }

      const data = await response.json();
      setExplanations((prev) => ({
        ...prev,
        [questionIndex]: data.explanation,
      }));
    } catch (err) {
      console.error('Error generating explanation:', err);
      setExplanations((prev) => ({
        ...prev,
        [questionIndex]: {
          explanation: 'Failed to generate explanation. Please try again.',
          whyCorrect: 'Error occurred',
          keyPoints: [],
          relatedConcepts: [],
          studyTips: [],
        },
      }));
    } finally {
      setLoadingExplanations((prev) => ({ ...prev, [questionIndex]: false }));
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'hard':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
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
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !attemptData) {
    return (
      <div className="flex-1 p-4 md:p-6">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Failed to load quiz attempt'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const attemptDate = new Date(attemptData.attemptedAt);
  const formattedDate = attemptDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const passPercentage = attemptData.percentage >= 60 ? true : false;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <Button
        variant="ghost"
        className="mb-2"
        onClick={() => router.push('/dashboard/student/attempted-quizzes')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Quizzes
      </Button>

      {/* Quiz Summary Card */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl">{attemptData.quizId.title}</CardTitle>
              <CardDescription className="text-base mt-2">
                {attemptData.quizId.subject}
                {attemptData.quizId.unitName && ` • ${attemptData.quizId.unitName}`}
              </CardDescription>
            </div>
            <div className="text-right space-y-2">
              <div className="flex items-center justify-end gap-2">
                <span className="text-4xl font-bold">{attemptData.percentage}%</span>
                {passPercentage ? (
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                )}
              </div>
              <Badge
                variant={passPercentage ? 'default' : 'destructive'}
                className="text-sm"
              >
                {passPercentage ? 'Passed' : 'Failed'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
            <p className="text-2xl font-bold">
              {attemptData.score}/{attemptData.totalQuestions}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">Correct</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {attemptData.score}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">Incorrect</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {attemptData.totalQuestions - attemptData.score}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
            </div>
            <p className="text-lg font-bold">{formatTime(attemptData.timeTaken)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Click the "Explain with AI" button on any question to get detailed explanations, key concepts, and personalized study tips.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Questions Accordion */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Review Questions</h2>
        <Accordion type="single" collapsible className="space-y-2 w-full">
          {attemptData.questions.map((question, idx) => {
            const isCorrect = question.isCorrect;
            const explanation = explanations[question.questionIndex];
            const isLoadingExp = loadingExplanations[question.questionIndex];

            return (
              <AccordionItem
                key={question.questionIndex}
                value={`question-${question.questionIndex}`}
                className="border rounded-lg px-4 data-[state=open]:bg-slate-50 dark:data-[state=open]:bg-slate-900/50 transition-colors"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-start gap-3 text-left flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          Question {question.questionIndex + 1}
                        </span>
                        <span className={cn('text-xs font-medium', getDifficultyColor(question.difficulty))}>
                          {question.difficulty}
                        </span>
                        {question.topic && (
                          <Badge variant="outline" className="text-xs">
                            {question.topic}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {question.question}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4 pb-4">
                  {/* Question Text */}
                  <div>
                    <h4 className="font-semibold mb-2">Question</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{question.question}</p>
                  </div>

                  {/* Options */}
                  <div>
                    <h4 className="font-semibold mb-2">Options</h4>
                    <div className="space-y-2">
                      {question.options.map((option, optIdx) => {
                        const isSelected = question.selectedAnswer === optIdx;
                        const isCorrectOption = question.correctAnswer === optIdx;
                        const showAsWrong = isSelected && !isCorrect && !isCorrectOption;
                        const showAsCorrect = isCorrectOption;

                        return (
                          <div
                            key={optIdx}
                            className={cn(
                              'p-3 rounded-lg border-2 transition-colors',
                              showAsCorrect
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : showAsWrong
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : isSelected
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                : 'border-gray-200 dark:border-gray-700'
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-sm w-6">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span className="text-sm flex-1">{option}</span>
                              {showAsCorrect && <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />}
                              {showAsWrong && <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />}
                              {isSelected && !isCorrect && isCorrectOption && (
                                <span className="text-xs font-semibold text-green-600">CORRECT</span>
                              )}
                              {isSelected && isCorrect && (
                                <span className="text-xs font-semibold text-green-600">YOUR ANSWER</span>
                              )}
                              {isSelected && !isCorrect && !isCorrectOption && (
                                <span className="text-xs font-semibold text-red-600">YOUR ANSWER</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Result */}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm">
                      <span className="font-semibold">Result: </span>
                      {isCorrect ? (
                        <span className="text-green-600 dark:text-green-400">Correct ✓</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">Incorrect ✗</span>
                      )}
                      {' • '}
                      <span className="font-semibold">{question.points} points</span>
                    </span>
                  </div>

                  {/* AI Explanation */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleExplain(question.questionIndex)}
                      disabled={isLoadingExp}
                      className="flex-1"
                      variant="default"
                    >
                      {isLoadingExp ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : explanation ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          View Explanation
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Explain with AI
                        </>
                      )}
                    </Button>
                  </div>

                  {/* AI Explanation Display */}
                  {explanation && (
                    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-900">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <CardTitle className="text-base">AI Explanation</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Overall Explanation */}
                        <div>
                          <h5 className="font-semibold text-sm mb-2 text-purple-900 dark:text-purple-100">
                            Overview
                          </h5>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {explanation.explanation}
                          </p>
                        </div>

                        {/* Why Correct */}
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900">
                          <h5 className="font-semibold text-sm mb-2 text-green-900 dark:text-green-100">
                            ✓ Why This is Correct
                          </h5>
                          <p className="text-sm text-green-800 dark:text-green-200">
                            {explanation.whyCorrect}
                          </p>
                        </div>

                        {/* Why Incorrect */}
                        {explanation.whyIncorrect && !isCorrect && (
                          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900">
                            <h5 className="font-semibold text-sm mb-2 text-red-900 dark:text-red-100">
                              ✗ Why Your Answer Was Incorrect
                            </h5>
                            <p className="text-sm text-red-800 dark:text-red-200">
                              {explanation.whyIncorrect}
                            </p>
                          </div>
                        )}

                        {/* Key Points */}
                        <div>
                          <h5 className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">
                            Key Points to Remember
                          </h5>
                          <ul className="space-y-1">
                            {explanation.keyPoints.map((point, idx) => (
                              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                                <span className="text-purple-600 dark:text-purple-400">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Related Concepts */}
                        <div>
                          <h5 className="font-semibold text-sm mb-2 text-gray-900 dark:text-gray-100">
                            Related Concepts to Study
                          </h5>
                          <ul className="space-y-1">
                            {explanation.relatedConcepts.map((concept, idx) => (
                              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                                <span className="text-blue-600 dark:text-blue-400">→</span>
                                <span>{concept}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Study Tips */}
                        <div>
                          <h5 className="font-semibold text-sm mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            Study Tips
                          </h5>
                          <ul className="space-y-1">
                            {explanation.studyTips.map((tip, idx) => (
                              <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                                <span className="text-yellow-600 dark:text-yellow-400">💡</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
