'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Circle,
  GraduationCap,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TopicStatus = 'not-started' | 'in-progress' | 'completed';

interface Topic {
  topic: string;
  status: TopicStatus;
  isCompleted: boolean;
  completedDate?: string;
  notes?: string;
}

interface Subject {
  _id: string;
  name: string;
  units?: number;
  topics: Topic[];
  totalTopics: number;
  completedTopics: number;
  inProgressTopics?: number;
  completionPercentage?: number;
}

interface SyllabusData {
  _id: string;
  year: string;
  semester: string;
  batch: string;
  section: string;
  subjects: Subject[];
  overallCompletion: number;
  lastUpdated: string;
}

const statusConfig = {
  'completed': {
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    label: 'Completed'
  },
  'in-progress': {
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    label: 'In Progress'
  },
  'not-started': {
    icon: Circle,
    color: 'text-gray-400 dark:text-gray-500',
    bg: 'bg-gray-50 dark:bg-gray-900/20',
    border: 'border-gray-200 dark:border-gray-700',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    label: 'Not Started'
  }
};

export default function StudentSyllabusPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [syllabusData, setSyllabusData] = useState<SyllabusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSyllabus = useCallback(async () => {
    if (!user?.batch || !user?.section) return;
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        batch: user.batch,
        section: user.section,
      });
      
      const response = await fetch(`/api/syllabus?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSyllabusData(data);
      } else {
        throw new Error('Failed to fetch syllabus');
      }
    } catch (error) {
      console.error('Error fetching syllabus:', error);
      toast({
        title: 'Error',
        description: 'Failed to load syllabus data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.batch, user?.section, toast]);

  useEffect(() => {
    fetchSyllabus();
  }, [fetchSyllabus]);

  if (isLoading) {
    return (
      <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!user?.batch || !user?.section) {
    return (
      <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Your batch and section information is not available. Please contact admin.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            My Syllabus
          </h1>
          <p className="text-muted-foreground">
            Track your learning progress for {user.batch} - Section {user.section}
          </p>
        </div>
      </div>

      {syllabusData.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No syllabus found for your batch and section. Please contact your professor.
            </p>
          </CardContent>
        </Card>
      ) : (
        syllabusData.map((syllabus) => (
          <Card key={syllabus._id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Year {syllabus.year} - Semester {syllabus.semester}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    Last updated: {new Date(syllabus.lastUpdated).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Overall Progress</p>
                    <p className="text-2xl font-bold text-primary">{syllabus.overallCompletion}%</p>
                  </div>
                  <div className="w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted/20"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${syllabus.overallCompletion * 1.76} 176`}
                        className="text-primary transition-all duration-500"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full space-y-3">
                {syllabus.subjects.map((subject, subjectIndex) => {
                  const completionPercentage = subject.totalTopics > 0 
                    ? Math.round((subject.completedTopics / subject.totalTopics) * 100) 
                    : 0;
                  const inProgressCount = subject.topics.filter(t => t.status === 'in-progress').length;

                  return (
                    <AccordionItem 
                      key={subject._id || subjectIndex} 
                      value={`subject-${subjectIndex}`}
                      className="border rounded-lg px-4 transition-all hover:shadow-md"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left w-full pr-4">
                          <div className="flex-1">
                            <h3 className="font-semibold">{subject.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {subject.completedTopics}/{subject.totalTopics} topics
                              </Badge>
                              {inProgressCount > 0 && (
                                <Badge className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  {inProgressCount} in progress
                                </Badge>
                              )}
                              {subject.units && (
                                <Badge variant="secondary" className="text-xs">
                                  {subject.units} units
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:min-w-[200px]">
                            <Progress value={completionPercentage} className="h-2 flex-1" />
                            <span className="text-sm font-medium min-w-[3ch]">
                              {completionPercentage}%
                            </span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="space-y-2 pt-2">
                          {subject.topics.map((topic, topicIndex) => {
                            const status = topic.status || (topic.isCompleted ? 'completed' : 'not-started');
                            const config = statusConfig[status];
                            const StatusIcon = config.icon;

                            return (
                              <div 
                                key={topicIndex}
                                className={cn(
                                  "flex items-center justify-between gap-3 rounded-lg border p-3 transition-all",
                                  config.bg,
                                  config.border
                                )}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <StatusIcon className={cn("h-5 w-5 shrink-0", config.color)} />
                                  <div className="flex-1">
                                    <p className={cn(
                                      "font-medium",
                                      status === 'completed' && "line-through opacity-70"
                                    )}>
                                      {topic.topic}
                                    </p>
                                    {topic.notes && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        📝 {topic.notes}
                                      </p>
                                    )}
                                    {topic.completedDate && status === 'completed' && (
                                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Completed on {new Date(topic.completedDate).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Badge className={cn("text-xs shrink-0", config.badge)}>
                                  {config.label}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        ))
      )}

      {/* Summary Card */}
      {syllabusData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Progress Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <CheckCircle2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {syllabusData.reduce((acc, s) => acc + s.subjects.reduce((a, sub) => a + sub.completedTopics, 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Topics Completed</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <Clock className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                <p className="text-2xl font-bold text-yellow-600">
                  {syllabusData.reduce((acc, s) => acc + s.subjects.reduce((a, sub) => a + (sub.inProgressTopics || sub.topics.filter(t => t.status === 'in-progress').length), 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Topics In Progress</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <BookOpen className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  {syllabusData.reduce((acc, s) => acc + s.subjects.reduce((a, sub) => a + sub.totalTopics, 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Topics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
