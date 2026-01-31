'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertTriangle, TrendingUp, BookOpen, Target, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface WeakArea {
  _id: string;
  subject: string;
  topic: string;
  subtopics: string[];
  prerequisites: string[];
  wrongAnswersCount: number;
  totalAttempts: number;
  improvementScore: number;
  status: 'critical' | 'needs_work' | 'improving' | 'mastered';
  lastAttemptDate: string;
}

interface WeakAreaData {
  weakAreas: WeakArea[];
  groupedBySubject: Record<string, WeakArea[]>;
  summary: {
    totalWeakAreas: number;
    criticalCount: number;
    needsWorkCount: number;
    improvingCount: number;
    masteredCount: number;
  };
}

export default function WeakAreasPage() {
  const [data, setData] = useState<WeakAreaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    fetchWeakAreas();
  }, []);

  const fetchWeakAreas = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/weak-areas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch weak areas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Critical</Badge>;
      case 'needs_work':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1"><AlertTriangle className="w-3 h-3" /> Needs Work</Badge>;
      case 'improving':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1"><TrendingUp className="w-3 h-3" /> Improving</Badge>;
      case 'mastered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1"><CheckCircle className="w-3 h-3" /> Mastered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'needs_work': return 'bg-yellow-500';
      case 'improving': return 'bg-blue-500';
      case 'mastered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredAreas = data?.weakAreas.filter(area => {
    if (selectedSubject !== 'all' && area.subject !== selectedSubject) return false;
    if (selectedStatus !== 'all' && area.status !== selectedStatus) return false;
    return true;
  }) || [];

  const subjects = data ? Object.keys(data.groupedBySubject) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || data.weakAreas.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weak Areas Analysis</h1>
          <p className="text-muted-foreground">Track and improve your knowledge gaps</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Weak Areas Detected</h3>
            <p className="text-muted-foreground text-center">
              Complete some quizzes to start tracking your areas for improvement.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Weak Areas Analysis</h1>
        <p className="text-muted-foreground">Track and improve your knowledge gaps based on quiz performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardDescription>Critical</CardDescription>
            <CardTitle className="text-2xl text-red-600">{data.summary.criticalCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-2">
            <CardDescription>Needs Work</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{data.summary.needsWorkCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardDescription>Improving</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{data.summary.improvingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription>Mastered</CardDescription>
            <CardTitle className="text-2xl text-green-600">{data.summary.masteredCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="w-[200px]">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[200px]">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="needs_work">Needs Work</SelectItem>
              <SelectItem value="improving">Improving</SelectItem>
              <SelectItem value="mastered">Mastered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Weak Areas List */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="subject">By Subject</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredAreas.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No weak areas match your filters.
              </CardContent>
            </Card>
          ) : (
            filteredAreas.map(area => (
              <Card key={area._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary">{area.subject}</Badge>
                        {getStatusBadge(area.status)}
                      </div>
                      <CardTitle className="text-lg">{area.topic}</CardTitle>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{area.improvementScore}%</p>
                      <p className="text-xs text-muted-foreground">Improvement Score</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{area.improvementScore}%</span>
                      </div>
                      <Progress value={area.improvementScore} className={getStatusColor(area.status)} />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Wrong Answers</p>
                        <p className="font-medium text-red-600">{area.wrongAnswersCount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Attempts</p>
                        <p className="font-medium">{area.totalAttempts}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Attempt</p>
                        <p className="font-medium">{new Date(area.lastAttemptDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {area.prerequisites.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Prerequisites to Review:</p>
                        <div className="flex flex-wrap gap-2">
                          {area.prerequisites.map((prereq, i) => (
                            <Badge key={i} variant="outline" className="bg-orange-50 text-orange-700">
                              <BookOpen className="w-3 h-3 mr-1" /> {prereq}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {area.subtopics.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Related Subtopics:</p>
                        <div className="flex flex-wrap gap-2">
                          {area.subtopics.map((subtopic, i) => (
                            <Badge key={i} variant="secondary">{subtopic}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="subject">
          <Accordion type="multiple" className="space-y-4">
            {subjects.map(subject => {
              const subjectAreas = data.groupedBySubject[subject];
              const avgImprovement = Math.round(
                subjectAreas.reduce((sum, a) => sum + a.improvementScore, 0) / subjectAreas.length
              );
              const criticalCount = subjectAreas.filter(a => a.status === 'critical').length;

              return (
                <AccordionItem key={subject} value={subject} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-primary" />
                        <span className="font-semibold">{subject}</span>
                        <Badge variant="outline">{subjectAreas.length} topics</Badge>
                        {criticalCount > 0 && (
                          <Badge variant="destructive">{criticalCount} critical</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-sm text-muted-foreground mr-2">Avg. Improvement:</span>
                          <span className="font-bold">{avgImprovement}%</span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {subjectAreas.map(area => (
                        <div key={area._id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(area.status)}`} />
                            <span className="font-medium">{area.topic}</span>
                            {getStatusBadge(area.status)}
                          </div>
                          <div className="flex items-center gap-4">
                            <Progress value={area.improvementScore} className="w-24" />
                            <span className="text-sm font-medium w-10 text-right">{area.improvementScore}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
}
