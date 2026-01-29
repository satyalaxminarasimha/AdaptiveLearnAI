
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
import { BarChart3, PieChart as PieChartIcon, Trophy, Medal, Award, TrendingUp } from 'lucide-react';

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
    <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Performance Analysis</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Visualize your quiz performance and subject mastery.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '100ms' }}>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg sm:text-xl">Quiz Completion Status</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">A breakdown of your total vs. attempted quizzes.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer
              config={studentQuizAnalysisChartConfig}
              className="mx-auto aspect-square h-56 sm:h-72 md:h-80"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel formatter={(value) => `${value} Quizzes`}/>}
                />
                <Pie data={studentQuizAnalysisStats} dataKey="value" nameKey="name" innerRadius={50} strokeWidth={5}>
                  {studentQuizAnalysisStats.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="!p-2 sm:!p-4"
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg sm:text-xl">Subject Performance</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">Your average scores across different subjects.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0 sm:pl-2">
            <ChartContainer config={subjectPerformanceChartConfig} className="h-56 sm:h-72 md:h-80 w-full">
              <BarChart accessibilityLayer data={subjectPerformanceData} layout="vertical">
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="subject"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  className="w-20 sm:w-24 text-xs sm:text-sm"
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
      
      <div className="mt-4 sm:mt-6">
          <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '300ms' }}>
            <CardHeader className="pb-2 sm:pb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <CardTitle className="text-lg sm:text-xl">In-depth Analysis</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Break down your performance by subject and see your classmates' scores.
                </CardDescription>
                <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                      <SelectTrigger className="w-full sm:w-[240px] h-10 sm:h-11">
                      <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                      {Object.keys(studentAnswerAnalysisBySubject).map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                      </SelectContent>
                  </Select>
                  <Select value={selectedQuiz} onValueChange={setSelectedQuiz} disabled={!selectedSubject}>
                      <SelectTrigger className="w-full sm:w-[240px] h-10 sm:h-11">
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
                <div className="flex items-center justify-center min-h-[250px] sm:min-h-[320px]">
                    {selectedSubject ? (
                    <ChartContainer
                        config={studentAnswerAnalysisChartConfig}
                        className="mx-auto aspect-square h-56 sm:h-72 md:h-80"
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
                            innerRadius={50}
                            strokeWidth={5}
                        >
                            {analysisData.map((entry) => (
                            <Cell key={entry.name} fill={entry.fill} />
                            ))}
                        </Pie>
                        <ChartLegend
                            content={<ChartLegendContent nameKey="name" />}
                            className="!p-2 sm:!p-4"
                        />
                        </PieChart>
                    </ChartContainer>
                    ) : (
                    <div className="text-muted-foreground text-center p-6 sm:p-8">
                        <PieChartIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm sm:text-base">Please select a subject to see the analysis.</p>
                    </div>
                    )}
                </div>
                
                {selectedQuiz && (
                  <>
                    <Separator className="my-4 sm:my-6" />
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-base sm:text-lg font-semibold text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
                        <Medal className="h-5 w-5 text-orange-500" />
                        Student Scores: <span className="text-primary">{selectedQuiz}</span>
                      </h3>
                      
                      {/* Mobile card view */}
                      <div className="sm:hidden space-y-3">
                        {studentPerformanceListData.filter((data) => data.status !== 'Not Attempted').length > 0 ? (
                          studentPerformanceListData
                            .filter((data) => data.status !== 'Not Attempted')
                            .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
                            .map((data, index) => (
                              <div 
                                key={data.id} 
                                className={`p-3 rounded-lg border transition-all duration-200 ${
                                  data.id === studentUser.id 
                                    ? 'bg-primary/10 border-primary/20' 
                                    : 'bg-card hover:bg-muted/50'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                      {index === 0 ? <Trophy className="h-3 w-3" /> : 
                                       index === 1 ? <Medal className="h-3 w-3" /> : 
                                       index === 2 ? <Award className="h-3 w-3" /> : index + 1}
                                    </span>
                                    <span className="font-medium text-sm">{data.name}</span>
                                  </div>
                                  <Badge variant={getBadgeVariant(data.status) as any} className="text-xs">
                                    {data.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span className="font-mono">{data.rollNo}</span>
                                  <span className="font-semibold text-foreground">
                                    {data.score !== null ? `${data.score}%` : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="text-center p-6 text-muted-foreground text-sm">
                            No one has attempted this quiz yet.
                          </div>
                        )}
                      </div>
                      
                      {/* Desktop table view */}
                      <div className="hidden sm:block rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/30">
                              <TableHead className="text-center w-16">Rank</TableHead>
                              <TableHead className="hidden md:table-cell">Roll No.</TableHead>
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
                                  <TableRow 
                                    key={data.id} 
                                    className={`transition-colors ${data.id === studentUser.id ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                                  >
                                    <TableCell className="text-center font-medium">
                                      <span className="flex items-center justify-center">
                                        {index === 0 ? <Trophy className="h-4 w-4 text-yellow-500" /> : 
                                         index === 1 ? <Medal className="h-4 w-4 text-gray-400" /> : 
                                         index === 2 ? <Award className="h-4 w-4 text-amber-600" /> : index + 1}
                                      </span>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell font-mono text-xs">{data.rollNo}</TableCell>
                                    <TableCell className="font-medium">{data.name}</TableCell>
                                    <TableCell className="text-center font-semibold">
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
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
