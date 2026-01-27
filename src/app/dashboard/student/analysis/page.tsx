
'use client';

import { useMemo, useState } from 'react';
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
  studentQuizAnalysisStats,
  studentQuizAnalysisChartConfig,
  subjectPerformanceData,
  subjectPerformanceChartConfig,
  studentAnswerAnalysisBySubject,
  studentAnswerAnalysisChartConfig,
  studentUser,
  allStudents,
  quizzesBySubject,
  allQuizPerformances,
} from '@/lib/mock-data';
import { useStudentSession } from '@/context/student-session-context';
import { Separator } from '@/components/ui/separator';

export default function StudentAnalysisPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const { session } = useStudentSession();

  const analysisData = useMemo(() => {
    if (!selectedSubject) return [];
    return studentAnswerAnalysisBySubject[selectedSubject as keyof typeof studentAnswerAnalysisBySubject];
  }, [selectedSubject]);

  const availableQuizzes = useMemo(() => {
    if (!selectedSubject) return [];
    return quizzesBySubject[selectedSubject as keyof typeof quizzesBySubject] || [];
  }, [selectedSubject]);

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedQuiz('');
  };
  
  const studentPerformanceListData = useMemo(() => {
    if (!selectedQuiz || !session?.section) return [];

    const classmates = allStudents.filter(
      (s) => s.batch === studentUser.batch && s.section === session.section
    ).sort((a, b) => a.rollNo.localeCompare(b.rollNo));

    return classmates.map(student => {
      const performance = allQuizPerformances.find(p => p.studentId === student.id && p.quiz === selectedQuiz);
      return {
        ...student,
        score: performance?.score ?? null,
        status: performance?.status ?? 'Not Attempted',
      };
    });
  }, [selectedQuiz, session]);

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


  return (
    <main className="flex-1 space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Performance Analysis</h1>
        <p className="text-muted-foreground">
          Visualize your quiz performance and subject mastery.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Completion Status</CardTitle>
            <CardDescription>A breakdown of your total vs. attempted quizzes.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer
              config={studentQuizAnalysisChartConfig}
              className="mx-auto aspect-square h-80"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel formatter={(value) => `${value} Quizzes`}/>}
                />
                <Pie data={studentQuizAnalysisStats} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                  {studentQuizAnalysisStats.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="!p-4"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Your average scores across different subjects.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={subjectPerformanceChartConfig} className="h-80 w-full">
              <BarChart accessibilityLayer data={subjectPerformanceData} layout="vertical">
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="subject"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  className="w-24"
                />
                <XAxis dataKey="score" type="number" hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value) => `${value}%`} />} />
                <Bar dataKey="score" fill="var(--color-score)" radius={4}>
                   {subjectPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
          <Card>
            <CardHeader>
                <CardTitle>In-depth Analysis</CardTitle>
                <CardDescription>
                  Break down your performance by subject and see your classmates' scores.
                </CardDescription>
                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                      <SelectTrigger className="w-full sm:w-[240px]">
                      <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                      {Object.keys(studentAnswerAnalysisBySubject).map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                      </SelectContent>
                  </Select>
                  <Select value={selectedQuiz} onValueChange={setSelectedQuiz} disabled={!selectedSubject}>
                      <SelectTrigger className="w-full sm:w-[240px]">
                      <SelectValue placeholder="Select a quiz" />
                      </SelectTrigger>
                      <SelectContent>
                      {availableQuizzes.map(quiz => (
                          <SelectItem key={quiz} value={quiz}>{quiz}</SelectItem>
                      ))}
                      </SelectContent>
                  </Select>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center min-h-[320px]">
                    {selectedSubject ? (
                    <ChartContainer
                        config={studentAnswerAnalysisChartConfig}
                        className="mx-auto aspect-square h-80"
                    >
                        <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel formatter={(value) => `${value} Answers`} />}
                        />
                        <Pie
                            data={analysisData}
                            dataKey="answers"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            {analysisData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                            ))}
                        </Pie>
                        <ChartLegend
                            content={<ChartLegendContent nameKey="name" />}
                            className="!p-4"
                        />
                        </PieChart>
                    </ChartContainer>
                    ) : (
                    <div className="text-muted-foreground">
                        <p>Please select a subject to see the analysis.</p>
                    </div>
                    )}
                </div>
                
                {selectedQuiz && (
                  <>
                    <Separator className="my-6" />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-center sm:text-left">
                        Student Scores: <span className="text-primary">{selectedQuiz}</span>
                      </h3>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-center">Rank</TableHead>
                              <TableHead>Roll No.</TableHead>
                              <TableHead>Student Name</TableHead>
                              <TableHead className="text-center">Score</TableHead>
                              <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {studentPerformanceListData.filter((data) => data.status !== 'Not Attempted').length > 0 ? (
                              studentPerformanceListData
                                .filter((data) => data.status !== 'Not Attempted')
                                .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
                                .map((data, index) => (
                                  <TableRow key={data.id} className={data.id === studentUser.id ? 'bg-primary/10' : ''}>
                                    <TableCell className="text-center font-medium">
                                      {index + 1}
                                    </TableCell>
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
                                <TableCell colSpan={5} className="text-center">
                                  No one has attempted this quiz yet.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </>
                )}

            </CardContent>
         </Card>
      </div>

    </main>
  );
}
