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
    <main className="flex-1 space-y-4 p-3 sm:p-4 md:p-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
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

        const res = await fetch(`/api/professors/dashboard?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
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
      <main className="p-6">
        <p>Select a class to view dashboard</p>
      </main>
    );
  }

  const metrics = dashboard?.metrics || {};

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">
        Welcome {user?.name?.split(' ')[0] || 'Professor'}
      </h1>

      <section className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent>Students: {metrics.activeStudents}</CardContent>
        </Card>
        <Card>
          <CardContent>Quizzes: {metrics.quizzesCreated}</CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard?.recentQuizzes?.map((q) => (
            <div key={q._id} className="border p-3 rounded mb-2">
              <p>{q.title}</p>
              <p>{q.subject}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}