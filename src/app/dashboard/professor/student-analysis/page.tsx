
'use client';

import { useMemo, useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  quizzesConductedData,
  quizzesConductedChartConfig,
  studentPassFailData,
  studentPassFailChartConfig,
  allStudents,
  quizzesBySubject,
  allQuizPerformances,
} from '@/lib/mock-data';
import { Users, BarChart3, PieChart as PieChartIcon, UserCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useProfessorSession } from '@/context/professor-session-context';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentAnalysisPage() {
  const { selectedClass, isLoading } = useProfessorSession();
  const [selectedQuiz, setSelectedQuiz] = useState('');

  // Get available quizzes for the selected subject
  const quizzesForSubject = useMemo(() => {
    if (!selectedClass) return [];
    return quizzesBySubject[selectedClass.subject as keyof typeof quizzesBySubject] || [];
  }, [selectedClass]);

  // Set the first available quiz when the subject changes
  useEffect(() => {
    if (quizzesForSubject.length > 0) {
      setSelectedQuiz(quizzesForSubject[0]);
    } else {
      setSelectedQuiz('');
    }
  }, [quizzesForSubject]);

  // Filter students based on the selected class
  const filteredStudents = useMemo(() => {
    if (!selectedClass) return [];
    return allStudents
      .filter(student => student.batch === selectedClass.batch && student.section === selectedClass.section)
      .sort((a, b) => a.rollNo.localeCompare(b.rollNo));
  }, [selectedClass]);

  // Combine student list with their performance for the selected quiz
  const performanceData = useMemo(() => {
    if (!selectedQuiz) return [];
    return filteredStudents.map(student => {
      const performance = allQuizPerformances.find(p => p.studentId === student.id && p.quiz === selectedQuiz);
      return {
        ...student,
        score: performance?.score ?? null,
        status: performance?.status ?? 'Not Attempted',
      };
    });
  }, [filteredStudents, selectedQuiz]);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Pass':
        return 'default';
      case 'Fail':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
      return (
          <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-5 w-96" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 mt-6">
                  <Card><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent><Skeleton className="h-56 sm:h-72 md:h-80 w-full" /></CardContent></Card>
                  <Card><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent><Skeleton className="h-56 sm:h-72 md:h-80 w-full" /></CardContent></Card>
              </div>
              <Card className="mt-6">
                  <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                  <CardContent><Skeleton className="h-64 w-full" /></CardContent>
              </Card>
          </main>
      )
  }
  
  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Student Analysis</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Analyze student performance for{' '}
          <span className="font-semibold text-primary">
            {selectedClass ? `${selectedClass.subject} (${selectedClass.batch} - ${selectedClass.section})` : 'your classes'}
          </span>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg sm:text-xl">Quizzes Conducted</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">Number of quizzes conducted per month.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0 sm:pl-2">
            <ChartContainer config={quizzesConductedChartConfig} className="h-56 sm:h-72 md:h-80 w-full">
              <BarChart accessibilityLayer data={quizzesConductedData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} className="text-xs sm:text-sm" />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} className="text-xs sm:text-sm" />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="quizzes" fill="var(--color-quizzes)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg sm:text-xl">Overall Student Performance</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">Pass vs. Fail rate across all quizzes.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={studentPassFailChartConfig} className="mx-auto aspect-square h-56 sm:h-72 md:h-80">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel formatter={(value, name, props) => `${value} Students - ${props.payload.status}`}/>}
                />
                <Pie data={studentPassFailData} dataKey="students" nameKey="status" innerRadius={50} strokeWidth={5}>
                  {studentPassFailData.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="status" />}
                  className="!p-2 sm:!p-4"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '300ms' }}>
        <CardHeader className="pb-2 sm:pb-4">
           <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg sm:text-xl">Student Performance Comparison</CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            View individual student scores for a specific quiz.
          </CardDescription>
           <div className="pt-3 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-4">
              <Select value={selectedQuiz} onValueChange={setSelectedQuiz} disabled={!selectedClass}>
                  <SelectTrigger className="w-full sm:w-[280px] h-10 sm:h-11">
                      <SelectValue placeholder="Select a quiz" />
                  </SelectTrigger>
                  <SelectContent>
                      {quizzesForSubject.map(quiz => (
                          <SelectItem key={quiz} value={quiz}>{quiz}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
        </CardHeader>
        <CardContent>
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {performanceData.length > 0 ? (
              performanceData.map((data, index) => (
                <div 
                  key={data.id} 
                  className="p-3 rounded-lg border bg-card transition-all duration-200 hover:bg-muted/50 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {data.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{data.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{data.rollNo}</p>
                      </div>
                    </div>
                    <Badge variant={getBadgeVariant(data.status) as any} className="text-xs shrink-0">
                      {data.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Score</span>
                    <span className={`font-semibold text-sm ${
                      data.score !== null 
                        ? data.score >= 60 ? 'text-green-500' : data.score >= 40 ? 'text-yellow-500' : 'text-red-500'
                        : 'text-muted-foreground'
                    }`}>
                      {data.score !== null ? `${data.score}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 text-muted-foreground text-sm">
                {selectedClass ? 'No student data for this class.' : 'Please select a class from the login page.'}
              </div>
            )}
          </div>
          
          {/* Desktop table view */}
          <div className="hidden sm:block rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="hidden md:table-cell w-14">#</TableHead>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceData.length > 0 ? (
                  performanceData.map((data, index) => (
                    <TableRow key={data.id} className="transition-colors hover:bg-muted/50">
                      <TableCell className="hidden md:table-cell">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-primary">
                            {data.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{data.rollNo}</TableCell>
                      <TableCell className="font-medium">{data.name}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-semibold ${
                          data.score !== null 
                            ? data.score >= 60 ? 'text-green-500' : data.score >= 40 ? 'text-yellow-500' : 'text-red-500'
                            : ''
                        }`}>
                          {data.score !== null ? `${data.score}%` : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                         <Badge variant={getBadgeVariant(data.status) as any}>
                          {data.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {selectedClass ? 'No student data for this class.' : 'Please select a class from the login page.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
