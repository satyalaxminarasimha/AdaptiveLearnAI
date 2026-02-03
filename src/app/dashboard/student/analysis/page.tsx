
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
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentSession } from '@/context/student-session-context';
import { Separator } from '@/components/ui/separator';
import { BarChart3, PieChart as PieChartIcon, Trophy, Medal, TrendingUp, AlertCircle } from 'lucide-react';

// Chart configs
const studentQuizAnalysisChartConfig = {
  score: { label: 'Score', color: 'hsl(var(--primary))' },
  average: { label: 'Class Average', color: 'hsl(var(--muted-foreground))' },
};

const subjectPerformanceChartConfig = {
  Mathematics: { label: 'Mathematics', color: '#4f46e5' },
  Physics: { label: 'Physics', color: '#10b981' },
  'Computer Science': { label: 'Computer Science', color: '#f59e0b' },
};

const studentAnswerAnalysisChartConfig = {
  correct: { label: 'Correct', color: 'hsl(142 76% 36%)' },
  incorrect: { label: 'Incorrect', color: 'hsl(0 84% 60%)' },
};

export default function StudentAnalysisPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedQuiz, setSelectedQuiz] = useState<string>('');
  const { session } = useStudentSession();
  
  const [isLoading, setIsLoading] = useState(true);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch quiz attempts
        const attemptsRes = await fetch('/api/quiz-attempts', { headers });
        if (attemptsRes.ok) {
          const attempts = await attemptsRes.json();
          setQuizAttempts(attempts);
          
          // Extract unique subjects
          const uniqueSubjects = [...new Set(attempts.map((a: any) => a.quiz?.subject).filter(Boolean))];
          setSubjects(uniqueSubjects as string[]);
        }
      } catch (err) {
        console.error('Error fetching analysis data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const analysisData = useMemo(() => {
    if (!selectedSubject || quizAttempts.length === 0) return [];
    const subjectAttempts = quizAttempts.filter(a => a.quiz?.subject === selectedSubject);
    const totalCorrect = subjectAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
    const totalQuestions = subjectAttempts.reduce((sum, a) => sum + (a.totalQuestions || 10), 0);
    return [
      { name: 'Correct', answers: totalCorrect, fill: 'hsl(142 76% 36%)' },
      { name: 'Incorrect', answers: totalQuestions - totalCorrect, fill: 'hsl(0 84% 60%)' },
    ];
  }, [selectedSubject, quizAttempts]);

  // Get quizzes by subject for real data
  const subjectQuizzes = useMemo(() => {
    const result: Record<string, string[]> = {};
    quizAttempts.forEach(a => {
      const subject = a.quiz?.subject;
      const title = a.quiz?.title;
      if (subject && title) {
        if (!result[subject]) result[subject] = [];
        if (!result[subject].includes(title)) result[subject].push(title);
      }
    });
    return result;
  }, [quizAttempts]);

  const availableQuizzes = useMemo(() => {
    if (!selectedSubject) return [];
    return subjectQuizzes[selectedSubject] || [];
  }, [selectedSubject, subjectQuizzes]);

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedQuiz('');
  };

  if (isLoading) {
    return (
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </main>
    );
  }

  if (quizAttempts.length === 0) {
    return (
      <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Quiz Analysis</h1>
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Quiz Data Available</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You haven't attempted any quizzes yet. Complete some quizzes to see your performance analysis here.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Calculate stats from real data
  const totalAttempts = quizAttempts.length;
  const avgScore = quizAttempts.length > 0 
    ? Math.round(quizAttempts.reduce((sum, a) => sum + ((a.score / (a.totalQuestions || 10)) * 100), 0) / quizAttempts.length)
    : 0;

  // Pie chart data for quiz completion
  const quizCompletionData = [
    { name: 'Completed', value: totalAttempts, fill: 'hsl(var(--chart-1))' },
    { name: 'Remaining', value: Math.max(0, 10 - totalAttempts), fill: 'hsl(var(--chart-2))' },
  ];

  // Subject performance from real data
  const subjectPerformanceData = subjects.map(subject => {
    const subjectAttempts = quizAttempts.filter(a => a.quiz?.subject === subject);
    const avg = subjectAttempts.length > 0
      ? Math.round(subjectAttempts.reduce((sum, a) => sum + ((a.score / (a.totalQuestions || 10)) * 100), 0) / subjectAttempts.length)
      : 0;
    return { name: subject, value: avg };
  });


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
                <Pie data={quizCompletionData} dataKey="value" nameKey="name" innerRadius={50} strokeWidth={5}>
                  {quizCompletionData.map((entry) => (
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
                      {subjects.map(subject => (
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
                        Selected Quiz: <span className="text-primary">{selectedQuiz}</span>
                      </h3>
                      <div className="text-center p-6 text-muted-foreground text-sm bg-muted/30 rounded-lg">
                        <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Quiz performance details will appear here based on your attempts.</p>
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
