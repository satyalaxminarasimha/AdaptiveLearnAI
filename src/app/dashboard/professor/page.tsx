
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useProfessorSession } from '@/context/professor-session-context';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
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
    semester?: string;
    year?: string;
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
  syllabus: {
    year: string;
    semester: string;
    program?: string;
    regulation?: string;
    lastUpdated: string;
    subject: {
      name: string;
      units: number;
      totalTopics: number;
      completedTopics: number;
      inProgressTopics: number;
    } | null;
  } | null;
};

function ProfessorDashboardSkeleton() {
  return (
    <main className="flex-1 space-y-4 p-3 sm:p-4 md:p-6">
      <Card className="overflow-hidden border-primary/10">
        <CardHeader className="space-y-4 p-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-8 w-72 max-w-full" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-2xl" />
            ))}
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

const metricCards = [
  {
    key: 'activeStudents',
    title: 'Active Students',
    description: 'Approved learners in the selected class',
    icon: Users,
  },
  {
    key: 'quizzesCreated',
    title: 'Quizzes Created',
    description: 'Class-specific quizzes available now',
    icon: FileText,
  },
  {
    key: 'topicsCovered',
    title: 'Topics Covered',
    description: 'Completed syllabus topics',
    icon: CheckCircle2,
  },
  {
    key: 'completionRate',
    title: 'Coverage Rate',
    description: 'Syllabus progress for this class',
    icon: BookOpen,
  },
];

const quickActions = [
  { href: '/dashboard/professor/create-quiz', label: 'Create quiz' },
  { href: '/dashboard/professor/view-students', label: 'View students' },
  { href: '/dashboard/professor/update-syllabus', label: 'Update syllabus' },
];

const formatDate = (value?: string) => {
  if (!value) return 'No due date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

const formatRelativeDate = (value?: string) => {
  if (!value) return 'Recently created';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
};

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
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setDashboard(null);
          return;
        }

        const params = new URLSearchParams({
          batch: selectedClass.batch,
          section: selectedClass.section,
          subject: selectedClass.subject,
        });

        const response = await fetch(`/api/professors/dashboard?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to load professor dashboard');
        }

        const data = (await response.json()) as ProfessorDashboardData;
        setDashboard(data);
      } catch (error) {
        console.error('Error fetching professor dashboard:', error);
        setDashboard(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [selectedClass]);

  const greeting = new Date().getHours() < 12
    ? 'Good morning'
    : new Date().getHours() < 18
      ? 'Good afternoon'
      : 'Good evening';

  const displayName = user?.name?.split(' ')[0] || 'Professor';
  const selectedClassLabel = dashboard?.selectedClass
    ? `${dashboard.selectedClass.subject} • Batch ${dashboard.selectedClass.batch} • Section ${dashboard.selectedClass.section}`
    : 'Select a class to view performance details';

  const recentQuizzes = useMemo(() => {
    const quizzes = dashboard?.recentQuizzes || [];
    if (!searchQuery.trim()) {
      return quizzes;
    }

    const query = searchQuery.toLowerCase();
    return quizzes.filter((quiz) => {
      return (
        quiz.title.toLowerCase().includes(query) ||
        quiz.subject.toLowerCase().includes(query)
      );
    });
  }, [dashboard?.recentQuizzes, searchQuery]);

  if (sessionLoading || isLoading) {
    return <ProfessorDashboardSkeleton />;
  }

  if (!selectedClass) {
    return (
      <main className="flex-1 p-3 sm:p-4 md:p-6">
        <Card className="mx-auto max-w-2xl border-dashed border-primary/20 bg-background/80">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">Choose a class to begin</CardTitle>
            <CardDescription>
              Your dashboard summary loads after you select one of your assigned classes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/dashboard/professor/manage-classes">Open my classes</Link>
            </Button>
          </CardContent>
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

  return (
    <main className="flex-1 space-y-4 p-3 sm:p-4 md:p-6 animate-fade-in">
      <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-sm">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-24 w-24 rounded-full bg-indigo-300/30 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <Badge variant="secondary" className="w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Professor dashboard
            </Badge>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {greeting}, {displayName}.
              </h1>
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              {selectedClassLabel}. Track quiz output, syllabus progress, and student coverage from one place.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full border-primary/20 bg-background/80 px-3 py-1">
                {dashboard?.availableClasses.length || 0} assigned classes
              </Badge>
              {dashboard?.syllabus?.year && (
                <Badge variant="outline" className="rounded-full border-primary/20 bg-background/80 px-3 py-1">
                  {dashboard.syllabus.year} {dashboard.syllabus.semester}
                </Badge>
              )}
              {dashboard?.syllabus?.program && (
                <Badge variant="outline" className="rounded-full border-primary/20 bg-background/80 px-3 py-1">
                  {dashboard.syllabus.program}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[340px] lg:grid-cols-1">
            <Card className="border-primary/10 bg-background/90 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Coverage</p>
                    <p className="mt-2 text-2xl font-bold text-primary">{metrics.completionRate}%</p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${metrics.completionRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-background/90 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Students</p>
                    <p className="mt-2 text-2xl font-bold text-primary">{metrics.activeStudents}</p>
                  </div>
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Approved learners in the selected batch and section.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 stagger-children">
        {metricCards.map((metric, index) => {
          const Icon = metric.icon;
          const value = metrics[metric.key as keyof typeof metrics] as number;
          return (
            <Card key={metric.key} className="group overflow-hidden border-border/60 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg" style={{ animationDelay: `${index * 80}ms` }}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
                  <CardDescription className="mt-1 text-xs">{metric.description}</CardDescription>
                </div>
                <div className="rounded-2xl bg-primary/10 p-2 text-primary transition-transform group-hover:scale-110">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-4 border-b bg-muted/20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl">Recent Quizzes</CardTitle>
                <CardDescription>
                  {dashboard?.recentQuizzes.length || 0} quiz{(dashboard?.recentQuizzes.length || 0) === 1 ? '' : 'es'} in this class
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search quizzes"
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-6">
            {recentQuizzes.length > 0 ? (
              recentQuizzes.map((quiz, index) => (
                <div
                  key={quiz._id}
                  className="rounded-2xl border bg-background p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold leading-none">{quiz.title}</h3>
                        <Badge variant={quiz.isActive ? 'default' : 'secondary'} className="rounded-full">
                          {quiz.isActive ? 'Active' : 'Draft'}
                        </Badge>
                        <Badge variant="outline" className="rounded-full border-primary/15">
                          {quiz.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {quiz.subject} • {quiz.topicCount} topic{quiz.topicCount === 1 ? '' : 's'} • Created {formatRelativeDate(quiz.createdAt)}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground sm:text-right">
                      <div className="font-medium text-foreground">Due {formatDate(quiz.dueDate)}</div>
                      <div>{quiz.totalAttempts} attempt{quiz.totalAttempts === 1 ? '' : 's'}</div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-primary/5 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Average score</p>
                      <p className="mt-1 text-lg font-semibold text-primary">{Math.round(quiz.averageScore)}%</p>
                    </div>
                    <div className="rounded-xl bg-primary/5 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Top score</p>
                      <p className="mt-1 text-lg font-semibold text-primary">{Math.round(quiz.topScore)}%</p>
                    </div>
                    <div className="rounded-xl bg-primary/5 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Attempts</p>
                      <p className="mt-1 text-lg font-semibold text-primary">{quiz.totalAttempts}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
                <Clock3 className="mx-auto mb-3 h-10 w-10 opacity-50" />
                <p className="font-medium text-foreground">No quizzes yet</p>
                <p className="text-sm">Create the first assessment for this class to start tracking progress.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Syllabus Snapshot</CardTitle>
              <CardDescription>Current coverage for the selected subject</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{dashboard?.syllabus?.subject?.name || selectedClass.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {dashboard?.syllabus?.program || 'Program'} • {dashboard?.syllabus?.regulation || 'Regulation'}
                  </p>
                </div>
                <Badge variant="outline" className="rounded-full border-primary/15">
                  {metrics.totalTopics} topics
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Covered</span>
                  <span className="font-medium">{metrics.topicsCovered}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${metrics.completionRate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Pending topics</span>
                  <span className="font-medium text-foreground">{metrics.topicsPending}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-muted/40 p-4 text-sm text-muted-foreground">
                Last updated {dashboard?.syllabus?.lastUpdated ? formatRelativeDate(dashboard.syllabus.lastUpdated) : 'recently'}.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Jump to the next task</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action) => (
                <Button key={action.href} asChild variant="outline" className="w-full justify-between rounded-2xl border-border/70 bg-background px-4 py-6 text-left">
                  <Link href={action.href}>
                    <span>{action.label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
