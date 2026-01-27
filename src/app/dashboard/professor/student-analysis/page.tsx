
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
import { Users } from 'lucide-react';
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
          <main className="flex-1 space-y-6 p-4 md:p-6">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
                  <Card><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent><Skeleton className="h-80 w-full" /></CardContent></Card>
                  <Card><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent><Skeleton className="h-80 w-full" /></CardContent></Card>
              </div>
              <Card className="mt-6">
                  <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                  <CardContent><Skeleton className="h-64 w-full" /></CardContent>
              </Card>
          </main>
      )
  }
  
  return (
    <main className="flex-1 space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Student Analysis</h1>
        <p className="text-muted-foreground">
          Analyze student performance for{' '}
          <span className="font-semibold text-primary">
            {selectedClass ? `${selectedClass.subject} (${selectedClass.batch} - ${selectedClass.section})` : 'your classes'}
          </span>.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quizzes Conducted</CardTitle>
            <CardDescription>Number of quizzes conducted per month.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={quizzesConductedChartConfig} className="h-80 w-full">
              <BarChart accessibilityLayer data={quizzesConductedData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="quizzes" fill="var(--color-quizzes)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overall Student Performance</CardTitle>
            <CardDescription>Pass vs. Fail rate across all quizzes.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={studentPassFailChartConfig} className="mx-auto aspect-square h-80">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel formatter={(value, name, props) => `${value} Students - ${props.payload.status}`}/>}
                />
                <Pie data={studentPassFailData} dataKey="students" nameKey="status" innerRadius={60} strokeWidth={5}>
                  {studentPassFailData.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="status" />}
                  className="!p-4"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
           <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle>Student Performance Comparison</CardTitle>
          </div>
          <CardDescription>
            View individual student scores for a specific quiz.
          </CardDescription>
           <div className="pt-4 flex flex-wrap items-center gap-4">
              <Select value={selectedQuiz} onValueChange={setSelectedQuiz} disabled={!selectedClass}>
                  <SelectTrigger className="w-full sm:w-[280px]">
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No.</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceData.length > 0 ? (
                performanceData.map((data) => (
                  <TableRow key={data.id}>
                    <TableCell className="font-mono text-xs">{data.rollNo}</TableCell>
                    <TableCell className="font-medium">{data.name}</TableCell>
                    <TableCell className="text-center">
                      {data.score !== null ? `${data.score}%` : 'N/A'}
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
                  <TableCell colSpan={4} className="text-center">
                    {selectedClass ? 'No student data for this class.' : 'Please select a class from the login page.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
