
'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  BookCheck, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Circle,
  Loader2,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useProfessorSession } from '@/context/professor-session-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type TopicStatus = 'not-started' | 'in-progress' | 'completed';

interface TopicCompletion {
  topic: string;
  status?: TopicStatus;
  isCompleted: boolean;
  completedDate?: string;
  completedBy?: string;
  notes?: string;
}

interface Subject {
  _id: string;
  name: string;
  topics: TopicCompletion[];
  totalTopics: number;
  completedTopics: number;
  inProgressTopics?: number;
}

interface SyllabusData {
  _id: string;
  year: string;
  semester: string;
  batch: string;
  section: string;
  subjects: Subject[];
  overallCompletion?: number;
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

export default function UpdateSyllabusPage() {
  const { selectedClass, isLoading: sessionLoading } = useProfessorSession();
  const { user } = useAuth();
  const { toast } = useToast();
  const [syllabusData, setSyllabusData] = useState<SyllabusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTopic, setUpdatingTopic] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const fetchSyllabus = useCallback(async () => {
    if (!selectedClass) return;
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        batch: selectedClass.batch,
        ...(selectedClass.section && { section: selectedClass.section }),
      });
      
      const response = await fetch(`/api/syllabus?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          // Find the syllabus that has the subject the professor teaches
          const syllabus = data.find((s: SyllabusData) => 
            s.subjects?.some((sub: Subject) => sub.name === selectedClass.subject)
          ) || data[0];
          setSyllabusData(syllabus);
          
          // Set the selected subject to the one the professor teaches
          if (syllabus.subjects) {
            const teachingSubject = syllabus.subjects.find(
              (sub: Subject) => sub.name === selectedClass.subject
            );
            if (teachingSubject) {
              setSelectedSubject(teachingSubject.name);
            }
          }
        } else {
          setSyllabusData(null);
        }
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
  }, [selectedClass, toast]);

  useEffect(() => {
    fetchSyllabus();
  }, [fetchSyllabus]);

  const handleStatusChange = async (subjectName: string, topic: string, newStatus: TopicStatus) => {
    if (!syllabusData || !user) return;
    
    setUpdatingTopic(topic);
    try {
      const response = await fetch(`/api/syllabus/${syllabusData._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName,
          topicUpdates: [{ topic, status: newStatus }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSyllabusData(data.syllabus);
        
        const config = statusConfig[newStatus];
        toast({
          title: 'Topic Updated',
          description: `"${topic}" marked as ${config.label.toLowerCase()}`,
        });
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Error updating topic:', error);
      toast({
        title: 'Error',
        description: 'Failed to update topic status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingTopic(null);
    }
  };

  const currentSubject = useMemo(() => {
    if (!syllabusData?.subjects || !selectedSubject) return null;
    return syllabusData.subjects.find(s => s.name === selectedSubject);
  }, [syllabusData, selectedSubject]);

  const completionStats = useMemo(() => {
    if (!currentSubject) return { completed: 0, inProgress: 0, notStarted: 0, total: 0, percentage: 0 };
    
    const completed = currentSubject.topics.filter(t => (t.status || (t.isCompleted ? 'completed' : 'not-started')) === 'completed').length;
    const inProgress = currentSubject.topics.filter(t => t.status === 'in-progress').length;
    const notStarted = currentSubject.topics.filter(t => (t.status || (t.isCompleted ? 'completed' : 'not-started')) === 'not-started').length;
    const total = currentSubject.topics.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, inProgress, notStarted, total, percentage };
  }, [currentSubject]);

  if (sessionLoading || isLoading) {
    return (
      <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg sm:text-xl">Update Syllabus</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Mark topics as covered for{' '}
                <Badge variant="outline" className="ml-1 font-semibold">
                  {selectedClass?.subject || 'your subject'}
                </Badge>
                {selectedClass && (
                  <span className="ml-2 text-muted-foreground">
                    ({selectedClass.batch} - Section {selectedClass.section})
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          
          {currentSubject && (
            <div className="mt-4 space-y-3">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {completionStats.completed} / {completionStats.total} topics completed
                  </span>
                </div>
                <Progress value={completionStats.percentage} className="h-2" />
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p className="text-lg font-bold text-green-600">{completionStats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <p className="text-lg font-bold text-yellow-600">{completionStats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
                <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/20">
                  <p className="text-lg font-bold text-gray-600">{completionStats.notStarted}</p>
                  <p className="text-xs text-muted-foreground">Not Started</p>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {currentSubject && currentSubject.topics.length > 0 ? (
            <div className="space-y-2">
              {currentSubject.topics.map((topicData, topicIndex) => {
                const status: TopicStatus = topicData.status || (topicData.isCompleted ? 'completed' : 'not-started');
                const config = statusConfig[status];
                const StatusIcon = config.icon;

                return (
                  <div 
                    key={topicData.topic} 
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg border p-3 sm:p-4 transition-all duration-200 hover:shadow-sm animate-fade-in",
                      config.bg,
                      config.border
                    )}
                    style={{ animationDelay: `${topicIndex * 30}ms` }}
                  >
                    <div className="flex-1 space-y-1">
                      <Label 
                        className={cn(
                          "font-medium text-sm cursor-default flex items-center gap-2",
                          config.color
                        )}
                      >
                        <StatusIcon className="h-4 w-4" />
                        <span className={status === 'completed' ? 'line-through opacity-70' : ''}>
                          {topicData.topic}
                        </span>
                      </Label>
                      {topicData.completedDate && status === 'completed' && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 ml-6">
                          <Clock className="h-3 w-3" />
                          Completed on {new Date(topicData.completedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {updatingTopic === topicData.topic && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={updatingTopic !== null}>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className={cn("min-w-[130px] justify-between", config.badge)}
                          >
                            <span className="flex items-center gap-2">
                              <StatusIcon className="h-3 w-3" />
                              {config.label}
                            </span>
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[150px]">
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(currentSubject.name, topicData.topic, 'not-started')}
                            className="flex items-center gap-2"
                          >
                            <Circle className="h-4 w-4 text-gray-500" />
                            Not Started
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(currentSubject.name, topicData.topic, 'in-progress')}
                            className="flex items-center gap-2"
                          >
                            <Clock className="h-4 w-4 text-yellow-500" />
                            In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(currentSubject.name, topicData.topic, 'completed')}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Completed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                {selectedClass 
                  ? 'No syllabus found for this class. Please contact admin to add syllabus.'
                  : 'Please select a class from the login page to see the syllabus.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      {currentSubject && currentSubject.topics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const notStartedTopics = currentSubject.topics.filter(
                    t => (t.status || (t.isCompleted ? 'completed' : 'not-started')) === 'not-started'
                  );
                  if (notStartedTopics.length > 0) {
                    const firstTopic = notStartedTopics[0];
                    await handleStatusChange(currentSubject.name, firstTopic.topic, 'in-progress');
                  }
                }}
                disabled={updatingTopic !== null || completionStats.notStarted === 0}
              >
                <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                Start Next Topic
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const inProgressTopics = currentSubject.topics.filter(t => t.status === 'in-progress');
                  if (inProgressTopics.length > 0) {
                    const firstTopic = inProgressTopics[0];
                    await handleStatusChange(currentSubject.name, firstTopic.topic, 'completed');
                  }
                }}
                disabled={updatingTopic !== null || completionStats.inProgress === 0}
              >
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Complete Current Topic
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
