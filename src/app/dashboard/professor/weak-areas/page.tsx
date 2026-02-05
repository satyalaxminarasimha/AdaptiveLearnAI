'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  AlertTriangle, 
  Users, 
  BookOpen, 
  TrendingDown, 
  ChevronDown, 
  ChevronRight,
  Brain,
  Target,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useProfessorSession } from '@/context/professor-session-context';
import { cn } from '@/lib/utils';

interface AggregatedTopic {
  topic: string;
  subject: string;
  students: Array<{ name: string; email: string; severity: string; accuracy: number }>;
  subtopics: string[];
  prerequisites: string[];
  totalStudents: number;
  criticalCount: number;
  needsWorkCount: number;
}

interface StudentSummary {
  student: {
    _id: string;
    name: string;
    email: string;
    rollNo?: string;
  };
  weakAreasCount: number;
  criticalCount: number;
  recentAttempts: number;
  averageScore: number | null;
  weakTopics: Array<{ topic: string; subject: string; status: string }>;
}

interface RecentAttempt {
  studentName: string;
  subject: string;
  unitName?: string;
  percentage: number;
  status: string;
  attemptedAt: string;
}

interface ClassStats {
  totalStudents: number;
  studentsWithWeakAreas: number;
  criticalTopicsCount: number;
  averageWeakAreasPerStudent: number;
  mostProblematicTopics: AggregatedTopic[];
}

export default function WeakAreasReportPage() {
  const { selectedClass, isLoading: sessionLoading } = useProfessorSession();
  const [isLoading, setIsLoading] = useState(true);
  const [aggregatedTopics, setAggregatedTopics] = useState<AggregatedTopic[]>([]);
  const [studentSummaries, setStudentSummaries] = useState<StudentSummary[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<RecentAttempt[]>([]);
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('topics');

  const fetchData = useCallback(async () => {
    if (!selectedClass) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        batch: selectedClass.batch,
        ...(selectedClass.section && { section: selectedClass.section }),
        subject: selectedClass.subject,
      });

      const response = await fetch(`/api/weak-areas/class?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAggregatedTopics(data.aggregatedTopics || []);
        setStudentSummaries(data.studentSummaries || []);
        setRecentAttempts(data.recentAttempts || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching weak areas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleTopic = (key: string) => {
    setExpandedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  if (sessionLoading || !selectedClass) {
    return (
      <main className="flex-1 p-4 md:p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Select a Class</h3>
            <p className="text-muted-foreground mt-1">
              Please select a class from the top menu to view weak areas report.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </main>
    );
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Weak Areas Report
          </h1>
          <p className="text-muted-foreground">
            AI-analyzed student performance insights for {selectedClass.subject}
          </p>
        </div>
        <Badge variant="outline" className="w-fit">
          {selectedClass.batch} • Section {selectedClass.section}
        </Badge>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.studentsWithWeakAreas}</p>
                  <p className="text-xs text-muted-foreground">
                    of {stats.totalStudents} need help
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.criticalTopicsCount}</p>
                  <p className="text-xs text-muted-foreground">Critical topics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{aggregatedTopics.length}</p>
                  <p className="text-xs text-muted-foreground">Weak topics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.averageWeakAreasPerStudent.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Avg per student</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="topics">Topics Analysis</TabsTrigger>
          <TabsTrigger value="students">Student Details</TabsTrigger>
          <TabsTrigger value="recent">Recent Attempts</TabsTrigger>
        </TabsList>

        {/* Topics Analysis Tab */}
        <TabsContent value="topics" className="space-y-4">
          {aggregatedTopics.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-medium">No Weak Areas Detected</h3>
                <p className="text-muted-foreground mt-1">
                  All students are performing well! No critical topics identified.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {aggregatedTopics.map((topic, index) => {
                const key = `${topic.subject}:${topic.topic}`;
                const isExpanded = expandedTopics.has(key);
                const severityRatio = topic.criticalCount / topic.totalStudents;

                return (
                  <Card 
                    key={key}
                    className={cn(
                      "transition-all",
                      severityRatio > 0.5 && "border-red-300",
                      severityRatio > 0.3 && severityRatio <= 0.5 && "border-orange-300"
                    )}
                  >
                    <Collapsible open={isExpanded} onOpenChange={() => toggleTopic(key)}>
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold",
                              severityRatio > 0.5 ? "bg-red-100 text-red-700" :
                              severityRatio > 0.3 ? "bg-orange-100 text-orange-700" :
                              "bg-yellow-100 text-yellow-700"
                            )}>
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold">{topic.topic}</h3>
                              <p className="text-sm text-muted-foreground">{topic.subject}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <Badge variant="destructive" className="text-xs">
                                  {topic.criticalCount} critical
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {topic.totalStudents} students
                                </Badge>
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="px-4 pb-4 pt-0 border-t">
                          {/* Subtopics and Prerequisites */}
                          <div className="grid md:grid-cols-2 gap-4 mt-4">
                            {topic.subtopics.length > 0 && (
                              <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                                <p className="text-xs font-medium text-orange-800 dark:text-orange-200 mb-2">
                                  Subtopics to Focus On:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {topic.subtopics.map((sub, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {sub}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {topic.prerequisites.length > 0 && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                                <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">
                                  Prerequisites to Review:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {topic.prerequisites.map((pre, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {pre}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Students struggling with this topic */}
                          <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Affected Students:</p>
                            <div className="rounded-lg border overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    <TableHead>Student</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Accuracy</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {topic.students.slice(0, 10).map((student, i) => (
                                    <TableRow key={i}>
                                      <TableCell>
                                        <div>
                                          <p className="font-medium text-sm">{student.name}</p>
                                          <p className="text-xs text-muted-foreground">{student.email}</p>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Badge 
                                          variant={student.severity === 'critical' ? 'destructive' : 'secondary'}
                                          className="text-xs"
                                        >
                                          {student.severity}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Progress value={student.accuracy} className="h-2 w-16" />
                                          <span className="text-xs">{student.accuracy}%</span>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                              {topic.students.length > 10 && (
                                <div className="p-2 text-center text-xs text-muted-foreground bg-muted/30">
                                  +{topic.students.length - 10} more students
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Students Needing Attention</CardTitle>
              <CardDescription>
                Students with weak areas, sorted by severity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentSummaries.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-10 w-10 mx-auto text-green-500 mb-3" />
                  <p className="text-muted-foreground">All students are performing well!</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Student</TableHead>
                        <TableHead>Weak Areas</TableHead>
                        <TableHead>Critical</TableHead>
                        <TableHead>Avg Score</TableHead>
                        <TableHead>Weak Topics</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentSummaries.map((summary, index) => (
                        <TableRow key={summary.student._id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{summary.student.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {summary.student.rollNo || summary.student.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{summary.weakAreasCount}</Badge>
                          </TableCell>
                          <TableCell>
                            {summary.criticalCount > 0 ? (
                              <Badge variant="destructive">{summary.criticalCount}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {summary.averageScore !== null ? (
                              <span className={cn(
                                "font-medium",
                                summary.averageScore >= 60 ? "text-green-600" : "text-red-600"
                              )}>
                                {summary.averageScore}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {summary.weakTopics.slice(0, 3).map((wt, i) => (
                                <Badge 
                                  key={i} 
                                  variant={wt.status === 'critical' ? 'destructive' : 'outline'}
                                  className="text-xs"
                                >
                                  {wt.topic}
                                </Badge>
                              ))}
                              {summary.weakTopics.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{summary.weakTopics.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Attempts Tab */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Quiz Attempts</CardTitle>
              <CardDescription>
                Latest quiz submissions from students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentAttempts.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No quiz attempts yet</p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Student</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentAttempts.map((attempt, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {attempt.studentName}
                          </TableCell>
                          <TableCell>{attempt.subject}</TableCell>
                          <TableCell>
                            {attempt.unitName || '-'}
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "font-bold",
                              attempt.percentage >= 60 ? "text-green-600" : "text-red-600"
                            )}>
                              {attempt.percentage}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={attempt.status === 'pass' ? 'default' : 'destructive'}>
                              {attempt.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(attempt.attemptedAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
