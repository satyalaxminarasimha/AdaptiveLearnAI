
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { professorRecentActivity, professorStats, professorUser, allStudents, allQuizPerformances, quizzesBySubject } from '@/lib/mock-data';
import { Book, FileText, Search, Users, Clock, CheckCircle, ListTodo, UserCheck, TrendingUp, Sparkles } from 'lucide-react';
import { useProfessorSession } from '@/context/professor-session-context';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const iconMap: { [key: string]: React.ElementType } = {
    Users: Users,
    FileText: FileText,
    Book: Book,
    CheckCircle: CheckCircle,
    ListTodo: ListTodo,
    UserCheck: UserCheck,
};

const colorMap: { [key: string]: string } = {
    Users: 'from-blue-500 to-blue-600',
    FileText: 'from-purple-500 to-purple-600',
    Book: 'from-orange-500 to-orange-600',
    CheckCircle: 'from-green-500 to-green-600',
    ListTodo: 'from-pink-500 to-pink-600',
};

function ProfessorDashboardSkeleton() {
    return (
        <main className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <Skeleton className="h-7 sm:h-8 w-56 sm:w-72 mb-2" />
                    <Skeleton className="h-4 sm:h-5 w-72 sm:w-96" />
                </div>
                <div className="relative w-full md:w-72">
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
            <section className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <Skeleton className="h-3 sm:h-4 w-16 sm:w-24" />
                            <Skeleton className="h-7 sm:h-8 w-7 sm:w-8 rounded-lg" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-6 sm:h-8 w-10 sm:w-12" />
                        </CardContent>
                    </Card>
                ))}
            </section>
             <section className="space-y-4 sm:space-y-6">
                <Card>
                  <CardHeader>
                     <div className="flex items-center gap-2">
                        <Skeleton className="h-5 sm:h-6 w-5 sm:w-6 rounded-lg" />
                        <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
                    </div>
                  </CardHeader>
                    <CardContent>
                         <div className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                               <Skeleton key={i} className="h-10 sm:h-12 w-full" />
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
    { title: 'Active Students', value: classStats.activeStudents, icon: 'Users', change: '+3' },
    { title: 'Quizzes Created', value: classStats.quizzesCreated, icon: 'FileText', change: '+2' },
    { title: 'Total Topics', value: professorStats[1].value, icon: 'Book', change: '' },
    { title: 'Topics Covered', value: professorStats[2].value, icon: 'CheckCircle', change: '' },
    { title: 'Topics Pending', value: professorStats[3].value, icon: 'ListTodo', change: '' },
  ];

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  if (isLoading) {
      return <ProfessorDashboardSkeleton />
  }

  return (
    <main className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{greeting}, {professorUser.name.split(' ')[0]}!</h1>
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 animate-pulse" />
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
                {selectedClass 
                    ? <>Here's what's happening with <Badge variant="outline" className="font-semibold">{selectedClass.subject}</Badge> <Badge variant="secondary">{selectedClass.section}</Badge> today.</>
                    : "Please select a class to view details."
                }
            </p>
        </div>
        <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search students..." 
              className="pl-9 transition-all focus:ring-2 focus:ring-primary/20" 
            />
        </div>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-5 stagger-children">
          {stats.map((stat, index) => {
            const Icon = iconMap[stat.icon];
            const gradientClass = colorMap[stat.icon] || 'from-gray-500 to-gray-600';
            return (
              <Card 
                key={stat.title}
                className="group relative overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br",
                  gradientClass
                )} />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground line-clamp-1">{stat.title}</CardTitle>
                  {Icon && (
                    <div className={cn(
                      "p-1.5 sm:p-2 rounded-lg bg-gradient-to-br text-white transition-transform group-hover:scale-110",
                      gradientClass
                    )}>
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex items-end gap-1.5 sm:gap-2">
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold">{stat.value}</div>
                      {stat.change && (
                        <Badge variant="secondary" className="text-[8px] sm:text-[10px] mb-0.5 sm:mb-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <TrendingUp className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5" />
                          {stat.change}
                        </Badge>
                      )}
                    </div>
                </CardContent>
              </Card>
            );
          })}
      </section>

      <section className="space-y-4 sm:space-y-6">
        <Card className="animate-fade-in" style={{ animationDelay: '500ms' }}>
          <CardHeader className="pb-3">
             <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
                  <CardDescription className="text-xs sm:text-sm hidden sm:block">Latest updates from your classes</CardDescription>
                </div>
            </div>
          </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                 <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Topic</TableHead>
                        <TableHead className="text-right font-semibold">Date & Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {professorRecentActivity && professorRecentActivity.length > 0 ? (
                            professorRecentActivity.map((activity, index) => (
                            <TableRow 
                              key={activity.id}
                              className="group cursor-pointer animate-fade-in"
                              style={{ animationDelay: `${(index + 6) * 50}ms` }}
                            >
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                      {activity.topic}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                  <Badge variant="outline" className="font-normal">
                                    {activity.date}
                                  </Badge>
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                           <TableRow>
                              <TableCell colSpan={2} className="h-24 text-center">
                                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                  <Clock className="h-8 w-8 opacity-50" />
                                  <span>No recent activity.</span>
                                </div>
                              </TableCell>
                           </TableRow>
                        )}
                    </TableBody>
                </Table>
              </div>
            </CardContent>
        </Card>
      </section>
    </main>
  );
}
