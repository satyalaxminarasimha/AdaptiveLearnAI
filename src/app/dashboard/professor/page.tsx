
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { professorRecentActivity, professorStats, professorUser, allStudents, allQuizPerformances, quizzesBySubject } from '@/lib/mock-data';
import { Book, FileText, Search, Users, Clock, CheckCircle, ListTodo, UserCheck } from 'lucide-react';
import { useProfessorSession } from '@/context/professor-session-context';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: { [key: string]: React.ElementType } = {
    Users: Users,
    FileText: FileText,
    Book: Book,
    CheckCircle: CheckCircle,
    ListTodo: ListTodo,
    UserCheck: UserCheck,
};

function ProfessorDashboardSkeleton() {
    return (
        <main className="flex-1 space-y-6 p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <Skeleton className="h-8 w-72 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>
                <div className="relative w-full md:w-72">
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-5 w-5" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-12" />
                        </CardContent>
                    </Card>
                ))}
            </section>
             <section className="space-y-6">
                <Card>
                  <CardHeader>
                     <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-6 w-40" />
                    </div>
                  </CardHeader>
                    <CardContent>
                         <div className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                               <Skeleton key={i} className="h-12 w-full" />
                            ))}
                         </div>
                    </CardContent>
                </Card>
              </section>
        </main>
    );
}


export default function ProfessorDashboardPage() {
  const { selectedClass, isLoading } = useProfessorSession();

  const classStats = useMemo(() => {
    if (!selectedClass) return {
        activeStudents: 0,
        quizzesCreated: 0,
        totalAttempts: 0,
    };

    const studentsInClass = allStudents.filter(s => s.batch === selectedClass.batch && s.section === selectedClass.section);
    const quizzesForSubject = quizzesBySubject[selectedClass.subject as keyof typeof quizzesBySubject] || [];
    
    const totalAttempts = allQuizPerformances.filter(p => {
        const student = allStudents.find(s => s.id === p.studentId);
        return student && student.batch === selectedClass.batch && student.section === selectedClass.section && quizzesForSubject.includes(p.quiz);
    }).length;

    return {
        activeStudents: studentsInClass.length,
        quizzesCreated: quizzesForSubject.length,
        totalAttempts: totalAttempts,
    };
  }, [selectedClass]);

  const stats = [
    { title: 'Active Students', value: classStats.activeStudents, icon: 'Users' },
    { title: 'Quizzes Created', value: classStats.quizzesCreated, icon: 'FileText' },
    { title: 'Total Topics', value: professorStats[1].value, icon: 'Book' },
    { title: 'Topics Covered', value: professorStats[2].value, icon: 'CheckCircle' },
    { title: 'Topics Pending', value: professorStats[3].value, icon: 'ListTodo' },
  ];

  if (isLoading) {
      return <ProfessorDashboardSkeleton />
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Good morning, {professorUser.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">
                {selectedClass 
                    ? `Here's what's happening with ${selectedClass.subject} (${selectedClass.section}) today.`
                    : "Please select a class to view details."
                }
            </p>
        </div>
        <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search students..." className="pl-10" />
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => {
            const Icon = iconMap[stat.icon];
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
      </section>

      <section className="space-y-6">
        <Card>
          <CardHeader>
             <div className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                <CardTitle>Recent Activity</CardTitle>
            </div>
          </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Topic</TableHead>
                        <TableHead className="text-right">Date & Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {professorRecentActivity && professorRecentActivity.length > 0 ? (
                            professorRecentActivity.map((activity) => (
                            <TableRow key={activity.id}>
                                <TableCell className="font-medium">
                                    {activity.topic}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                  {activity.date}
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                           <TableRow>
                              <TableCell colSpan={2} className="text-center">No recent activity.</TableCell>
                           </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </section>
    </main>
  );
}
