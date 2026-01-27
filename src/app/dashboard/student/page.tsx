
'use client';

import { Clock, BookCopy, FileCheck } from 'lucide-react';
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
import { studentStats, upcomingQuizzes, studentUser as user, weeklyProgressData } from '@/lib/mock-data';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

const iconMap: { [key: string]: React.ElementType } = {
  BookCopy,
  FileCheck,
  Clock,
};

export default function StudentDashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const { user: authUser } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading state
  }

  const displayUser = authUser || user;
  return (
    <main className="flex-1 space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Good Morning, {displayUser.rollNo || displayUser.name}!</h1>
        <p className="text-muted-foreground">Here's a summary of your learning journey.</p>
      </div>

      <section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {studentStats.map((stat) => {
            const Icon = iconMap[stat.icon];
            return (
              <Card key={stat.title} className="flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
            <CardDescription>Your progress in different subjects this week.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyProgressData.map((item) => (
                <div key={item.subject} className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">{item.subject}</span>
                        <span className="text-sm font-medium">{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} />
                </div>
            ))}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Quizzes</CardTitle>
              <CardDescription>Stay prepared for your upcoming assessments.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz</TableHead>
                    <TableHead className="hidden sm:table-cell">Subject</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingQuizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell className="hidden sm:table-cell">{quiz.subject}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          Start Quiz
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
        </Card>
      </section>
    </main>
  );
}
