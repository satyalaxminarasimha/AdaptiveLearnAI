
'use client';

import { Clock, BookCopy, FileCheck, Sparkles, AlertCircle, History } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useStudentStats } from '@/hooks/use-student-stats';

export const dynamic = 'force-dynamic';

const iconMap: { [key: string]: React.ElementType } = {
  BookCopy,
  FileCheck,
  Clock,
  History,
};

const colorMap: { [key: string]: { bg: string; text: string; icon: string } } = {
  BookCopy: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', icon: 'from-blue-500 to-blue-600' },
  FileCheck: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', icon: 'from-green-500 to-green-600' },
  Clock: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', icon: 'from-orange-500 to-orange-600' },
  History: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', icon: 'from-purple-500 to-purple-600' },
};

const progressColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];

export default function StudentDashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const { user: authUser } = useAuth();
  const { stats, quizzes, subjectProgress, isLoading } = useStudentStats();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const displayUser = authUser;
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

  // Show empty state if no user is logged in
  if (!displayUser) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Please log in to view your dashboard.</p>
          </CardContent>
        </Card>
      </main>
    );
  }
  
  return (
    <main className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {greeting}, {displayUser.rollNo || displayUser.name}!
            </h1>
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">Here's a summary of your learning journey.</p>
        </div>
      </div>

      <section className="stagger-children">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            stats.map((stat, index) => {
              const Icon = iconMap[stat.icon];
              const colors = colorMap[stat.icon];
              const destination =
                stat.title === 'Quizzes Attempted'
                  ? '/dashboard/student/analysis'
                  : '/dashboard/student/available-quizzes';
              return (
                <Card 
                  key={stat.title} 
                  className="group relative overflow-hidden animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => router.push(destination)}
                >
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br",
                    colors.icon
                  )} />
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    {Icon && (
                      <div className={cn(
                        "p-1.5 sm:p-2 rounded-lg bg-gradient-to-br text-white transition-transform group-hover:scale-110",
                        colors.icon
                      )}>
                        <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:gap-6">
        <Card
          className="animate-fade-in cursor-pointer group border-purple-200 dark:border-purple-900/50"
          style={{ animationDelay: '300ms' }}
          onClick={() => router.push('/dashboard/student/attempted-quizzes')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Quiz History & Review
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  View your attempted quizzes with detailed explanations powered by AI.
                </CardDescription>
              </div>
              <div className="text-right">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:animate-spin" />
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card
          className="animate-fade-in cursor-pointer"
          style={{ animationDelay: '400ms' }}
          onClick={() => router.push('/dashboard/student/learning-path')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Subject Progress</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your progress in different subjects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-2.5 w-full" />
                  </div>
                ))}
              </div>
            ) : subjectProgress.length > 0 ? (
              subjectProgress.map((item, index) => (
                <div
                  key={item.subject}
                  className="space-y-2 group"
                  onClick={(event) => {
                    event.stopPropagation();
                    router.push('/dashboard/student/learning-path');
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium">{item.subject}</span>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">
                      {item.progress}%
                    </Badge>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={item.progress} 
                      className="h-2 sm:h-2.5 transition-all duration-300 group-hover:h-3"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No syllabus progress data available yet.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
