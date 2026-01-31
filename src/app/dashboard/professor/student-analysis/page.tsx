
'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BarChart3, PieChart as PieChartIcon, Trophy, TrendingUp, TrendingDown, Medal, Crown, Award } from 'lucide-react';
import { useProfessorSession } from '@/context/professor-session-context';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface StudentRanking {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    rollNumber?: string;
  };
  batch: string;
  section?: string;
  totalScore: number;
  averageScore: number;
  quizzesAttempted: number;
  classRank: number;
  batchRank: number;
  overallRank: number;
  subjectScores: { subject: string; score: number; attempts: number }[];
  currentStreak: number;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  rollNumber?: string;
  batch?: string;
  section?: string;
}

export default function StudentAnalysisPage() {
  const { selectedClass, isLoading: sessionLoading } = useProfessorSession();
  const { toast } = useToast();
  const [rankings, setRankings] = useState<StudentRanking[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('class');

  const fetchData = useCallback(async () => {
    if (!selectedClass) return;
    
    setIsLoading(true);
    try {
      // Fetch rankings
      const rankingParams = new URLSearchParams({
        type: 'class',
        batch: selectedClass.batch,
        ...(selectedClass.section && { section: selectedClass.section }),
      });
      
      const [rankingsRes, studentsRes] = await Promise.all([
        fetch(`/api/rankings?${rankingParams}`),
        fetch(`/api/students?batch=${selectedClass.batch}${selectedClass.section ? `&section=${selectedClass.section}` : ''}`),
      ]);
      
      if (rankingsRes.ok) {
        const data = await rankingsRes.json();
        setRankings(data);
      }
      
      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate pass/fail stats
  const passFailStats = useMemo(() => {
    const passed = rankings.filter(r => r.averageScore >= 40).length;
    const failed = rankings.filter(r => r.averageScore < 40).length;
    return [
      { status: 'Pass', students: passed, fill: 'hsl(var(--chart-1))' },
      { status: 'Fail', students: failed, fill: 'hsl(var(--chart-2))' },
    ];
  }, [rankings]);

  // Calculate performance distribution
  const performanceDistribution = useMemo(() => {
    const excellent = rankings.filter(r => r.averageScore >= 80).length;
    const good = rankings.filter(r => r.averageScore >= 60 && r.averageScore < 80).length;
    const average = rankings.filter(r => r.averageScore >= 40 && r.averageScore < 60).length;
    const poor = rankings.filter(r => r.averageScore < 40).length;
    return [
      { category: 'Excellent', count: excellent },
      { category: 'Good', count: good },
      { category: 'Average', count: average },
      { category: 'Poor', count: poor },
    ];
  }, [rankings]);

  const getBadgeVariant = (score: number) => {
    if (score >= 60) return 'default';
    if (score >= 40) return 'secondary';
    return 'destructive';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="font-mono">#{rank}</span>;
  };

  if (sessionLoading || isLoading) {
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
              <CardTitle className="text-lg sm:text-xl">Performance Distribution</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">Student performance categories based on average scores.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0 sm:pl-2">
            <ChartContainer 
              config={{
                count: { label: "Students", color: "hsl(var(--chart-1))" }
              }} 
              className="h-56 sm:h-72 md:h-80 w-full"
            >
              <BarChart accessibilityLayer data={performanceDistribution}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="category" tickLine={false} tickMargin={10} axisLine={false} className="text-xs sm:text-sm" />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} className="text-xs sm:text-sm" />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg sm:text-xl">Overall Pass/Fail Rate</CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm">Pass vs. Fail rate across all quizzes.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer 
              config={{
                Pass: { label: "Pass", color: "hsl(var(--chart-1))" },
                Fail: { label: "Fail", color: "hsl(var(--chart-2))" },
              }} 
              className="mx-auto aspect-square h-56 sm:h-72 md:h-80"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel formatter={(value, name, props) => `${value} Students - ${props.payload.status}`}/>}
                />
                <Pie data={passFailStats} dataKey="students" nameKey="status" innerRadius={50} strokeWidth={5}>
                  {passFailStats.map((entry) => (
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
            <Trophy className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg sm:text-xl">Student Rankings</CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            View student rankings and performance in your class.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {rankings.length > 0 ? (
              rankings.map((ranking, index) => (
                <div 
                  key={ranking._id} 
                  className={`p-3 rounded-lg border bg-card transition-all duration-200 hover:bg-muted/50 animate-fade-in ${
                    ranking.classRank <= 3 ? 'ring-2 ring-yellow-400/50' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {getRankBadge(ranking.classRank)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{ranking.studentId?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground font-mono">{ranking.studentId?.rollNumber || ranking.studentId?.email}</p>
                      </div>
                    </div>
                    <Badge variant={getBadgeVariant(ranking.averageScore) as any} className="text-xs shrink-0">
                      {ranking.averageScore >= 40 ? 'Pass' : 'Fail'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Avg Score</span>
                    <span className={`font-semibold text-sm ${
                      ranking.averageScore >= 60 ? 'text-green-500' : ranking.averageScore >= 40 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {ranking.averageScore.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Quizzes: {ranking.quizzesAttempted}</span>
                    <span>Streak: {ranking.currentStreak} 🔥</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 text-muted-foreground text-sm">
                {selectedClass ? 'No ranking data for this class yet.' : 'Please select a class from the login page.'}
              </div>
            )}
          </div>
          
          {/* Desktop table view */}
          <div className="hidden sm:block rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-center">Avg Score</TableHead>
                  <TableHead className="text-center">Quizzes</TableHead>
                  <TableHead className="text-center">Streak</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings.length > 0 ? (
                  rankings.map((ranking) => (
                    <TableRow 
                      key={ranking._id} 
                      className={`transition-colors hover:bg-muted/50 ${
                        ranking.classRank <= 3 ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''
                      }`}
                    >
                      <TableCell>
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                          {getRankBadge(ranking.classRank)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ranking.studentId?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            {ranking.studentId?.rollNumber || ranking.studentId?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-semibold ${
                          ranking.averageScore >= 60 ? 'text-green-500' : ranking.averageScore >= 40 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {ranking.averageScore.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{ranking.quizzesAttempted}</TableCell>
                      <TableCell className="text-center">
                        {ranking.currentStreak > 0 && (
                          <span className="flex items-center justify-center gap-1">
                            {ranking.currentStreak} 🔥
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={getBadgeVariant(ranking.averageScore) as any}>
                          {ranking.averageScore >= 40 ? 'Pass' : 'Fail'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {selectedClass ? 'No ranking data for this class yet.' : 'Please select a class from the login page.'}
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
