
'use client';

import { Clock, BookCopy, FileCheck, ArrowRight, Sparkles } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { studentStats, upcomingQuizzes, studentUser as user, weeklyProgressData } from '@/lib/mock-data';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const iconMap: { [key: string]: React.ElementType } = {
  BookCopy,
  FileCheck,
  Clock,
};

const colorMap: { [key: string]: { bg: string; text: string; icon: string } } = {
  BookCopy: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', icon: 'from-blue-500 to-blue-600' },
  FileCheck: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', icon: 'from-green-500 to-green-600' },
  Clock: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', icon: 'from-orange-500 to-orange-600' },
};

const progressColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];

export default function StudentDashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const { user: authUser } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const displayUser = authUser || user;
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening';
  
  return (
    <main className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 animate-fade-in">
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
          {studentStats.map((stat, index) => {
            const Icon = iconMap[stat.icon];
            const colors = colorMap[stat.icon];
            return (
              <Card 
                key={stat.title} 
                className="group relative overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
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
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">Weekly Progress</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your progress in different subjects this week.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5">
            {weeklyProgressData.map((item, index) => (
                <div key={item.subject} className="space-y-2 group">
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
            ))}
          </CardContent>
        </Card>
        
        <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg">Upcoming Quizzes</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Stay prepared for your upcoming assessments.</CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  {upcomingQuizzes.length} pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Quiz</TableHead>
                      <TableHead className="hidden sm:table-cell font-semibold">Subject</TableHead>
                      <TableHead className="text-right font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingQuizzes.map((quiz, index) => (
                      <TableRow 
                        key={quiz.id} 
                        className="group cursor-pointer animate-fade-in"
                        style={{ animationDelay: `${(index + 5) * 50}ms` }}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{quiz.title}</span>
                            <span className="text-xs text-muted-foreground sm:hidden">{quiz.subject}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{quiz.subject}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="group/btn transition-all hover:bg-primary hover:text-primary-foreground"
                          >
                            <span className="hidden sm:inline">Start Quiz</span>
                            <span className="sm:hidden">Start</span>
                            <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
        </Card>
      </section>
    </main>
  );
}
