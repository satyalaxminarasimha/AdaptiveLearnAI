'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/context/auth-context';
import { useProfessorSession } from '@/context/professor-session-context';
import { apiGetJsonCached } from '@/lib/api';

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';

type RecentQuiz = {
  _id: string;
  title: string;
  subject: string;
  isActive: boolean;
  dueDate?: string;
  totalAttempts: number;
  averageScore: number;
  topScore: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  topicCount: number;
  createdAt: string;
};

type ProfessorDashboardData = {
  selectedClass: {
    batch: string;
    section: string;
    subject: string;
  } | null;
  availableClasses: Array<{
    batch: string;
    section: string;
    subject: string;
  }>;
  metrics: {
    activeStudents: number;
    quizzesCreated: number;
    totalTopics: number;
    topicsCovered: number;
    topicsPending: number;
    completionRate: number;
  };
  recentQuizzes: RecentQuiz[];
  syllabus: any;
};

function ProfessorDashboardSkeleton() {
  return (
    <main className="relative flex-1 overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.12),_transparent_35%),radial-gradient(circle_at_top_right,_hsl(var(--accent)/0.08),_transparent_30%)]" />
      <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
        <Card className="border-primary/10 shadow-lg shadow-primary/5">
          <CardHeader className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full rounded-2xl" />
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border-primary/10">
              <CardContent className="p-6">
                <Skeleton className="mb-4 h-4 w-20" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-primary/10">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full rounded-2xl" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function ProfessorDashboardPage() {
  const { selectedClass, isLoading: sessionLoading } = useProfessorSession();
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState<ProfessorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!selectedClass) {
        setDashboard(null);
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const params = new URLSearchParams({
          batch: selectedClass.batch,
          section: selectedClass.section,
          subject: selectedClass.subject,
        });

        const data = await apiGetJsonCached<ProfessorDashboardData>(
          `/api/professors/dashboard?${params.toString()}`,
          {},
          20_000
        );
        setDashboard(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [selectedClass]);

  if (sessionLoading || isLoading) return <ProfessorDashboardSkeleton />;

  if (!selectedClass) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center p-6">
        <Card className="max-w-md border-primary/10 shadow-lg shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5 text-primary" />
              Select a class
            </CardTitle>
            <CardDescription>
              Choose one of your assigned classes to see student counts, quiz activity, and syllabus progress.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const metrics = dashboard?.metrics || {
    activeStudents: 0,
    quizzesCreated: 0,
    totalTopics: 0,
    topicsCovered: 0,
    topicsPending: 0,
    completionRate: 0,
  };
  const recentQuizzes = (dashboard?.recentQuizzes || []).filter((quiz) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      quiz.title.toLowerCase().includes(query) ||
      quiz.subject.toLowerCase().includes(query) ||
      quiz.difficulty.toLowerCase().includes(query)
    );
  });

  const syllabusCompletion = metrics.completionRate || 0;
  const classLabel = `${selectedClass.batch} • Section ${selectedClass.section}`;

  return (
    <main className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.12),_transparent_35%),radial-gradient(circle_at_bottom_right,_hsl(var(--accent)/0.08),_transparent_30%)]" />
      <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
        <Card className="border-primary/10 bg-card/90 shadow-xl shadow-primary/5 backdrop-blur">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Professor Dashboard</Badge>
                <Badge variant="outline" className="border-primary/15 text-muted-foreground">
                  {classLabel}
                </Badge>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Welcome back, {user?.name?.split(' ')[0] || 'Professor'}
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                  A quick view of your class performance, quiz activity, and syllabus progress for{' '}
                  {selectedClass.subject}.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/dashboard/professor/create-quiz">
                    Create Quiz
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/dashboard/professor/textbook-upload">Upload Textbook</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard/professor/manage-classes">Manage Classes</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-primary/10 bg-secondary/60 p-4">
              <div className="flex items-center justify-between gap-3 rounded-xl bg-background/80 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Syllabus completion</p>
                  <p className="text-2xl font-semibold text-primary">{syllabusCompletion}%</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-xl bg-background/80 p-3">
                  <p className="text-muted-foreground">Students</p>
                  <p className="mt-1 text-lg font-semibold">{metrics.activeStudents || 0}</p>
                </div>
                <div className="rounded-xl bg-background/80 p-3">
                  <p className="text-muted-foreground">Quizzes</p>
                  <p className="mt-1 text-lg font-semibold">{metrics.quizzesCreated || 0}</p>
                </div>
                <div className="rounded-xl bg-background/80 p-3">
                  <p className="text-muted-foreground">Topics</p>
                  <p className="mt-1 text-lg font-semibold">{metrics.totalTopics || 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-primary/10 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Students</p>
                <p className="text-2xl font-semibold">{metrics.activeStudents || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quizzes Created</p>
                <p className="text-2xl font-semibold">{metrics.quizzesCreated || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Topics Covered</p>
                <p className="text-2xl font-semibold">{metrics.topicsCovered || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-semibold">{syllabusCompletion}%</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Class Overview
              </CardTitle>
              <CardDescription>
                Quick details for {selectedClass.subject} in {classLabel}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Topics completed</span>
                  <span className="font-medium">
                    {metrics.topicsCovered || 0}/{metrics.totalTopics || 0}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                    style={{ width: `${syllabusCompletion}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border bg-muted/40 p-4">
                  <p className="text-sm text-muted-foreground">Topics pending</p>
                  <p className="mt-1 text-xl font-semibold">{metrics.topicsPending || 0}</p>
                </div>
                <div className="rounded-2xl border bg-muted/40 p-4">
                  <p className="text-sm text-muted-foreground">Current subject</p>
                  <p className="mt-1 line-clamp-2 text-xl font-semibold">{selectedClass.subject}</p>
                </div>
              </div>

              {dashboard?.syllabus?.subject ? (
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Syllabus snapshot</p>
                  <p className="mt-1">
                    {dashboard.syllabus.subject.units || 0} units •{' '}
                    {dashboard.syllabus.subject.totalTopics || 0} total topics •{' '}
                    {dashboard.syllabus.subject.completedTopics || 0} completed topics
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Recent Quizzes</CardTitle>
                  <CardDescription>
                    The latest quiz activity for {selectedClass.subject}.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-primary/15">
                  {recentQuizzes.length} shown
                </Badge>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search quizzes by title, subject, or difficulty"
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentQuizzes.length > 0 ? (
                recentQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="group rounded-2xl border border-border/60 bg-muted/20 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-background hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium leading-none">{quiz.title}</p>
                          <Badge variant={quiz.isActive ? 'default' : 'secondary'} className="text-xs">
                            {quiz.isActive ? 'Active' : 'Closed'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{quiz.subject}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock3 className="h-4 w-4" />
                        {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'Recently'}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-background/80 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Attempts</p>
                        <p className="mt-1 text-lg font-semibold">{quiz.totalAttempts}</p>
                      </div>
                      <div className="rounded-xl bg-background/80 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Average</p>
                        <p className="mt-1 text-lg font-semibold">{Math.round(quiz.averageScore)}%</p>
                      </div>
                      <div className="rounded-xl bg-background/80 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Difficulty</p>
                        <p className="mt-1 text-lg font-semibold capitalize">{quiz.difficulty}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No quizzes match your search.
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}