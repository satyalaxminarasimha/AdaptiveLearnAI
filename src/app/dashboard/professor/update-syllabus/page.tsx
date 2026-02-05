'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookCheck, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Circle,
  Loader2,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
  FileQuestion
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type TopicStatus = 'not-started' | 'in-progress' | 'completed';

interface TopicCompletion {
  topic: string;
  status?: TopicStatus;
  isCompleted: boolean;
  completedDate?: string;
}

interface Subject {
  _id?: string;
  name: string;
  code?: string;
  topics: TopicCompletion[];
  totalTopics: number;
  completedTopics: number;
}

interface SyllabusData {
  _id: string;
  year: string;
  semester: string;
  batch: string;
  section: string;
  subjects: Subject[];
  lastUpdated: string;
}

interface ClassTeaching {
  subject: string;
  subjectCode?: string;
  batch: string;
  section: string;
  year?: string;
  semester?: string;
  status?: string;
}

interface UnitGroup {
  unitNumber: string;
  unitName: string;
  topics: TopicCompletion[];
  completed: number;
  total: number;
}

interface GeneratedQuiz {
  _id: string;
  title: string;
  unitName: string;
  questionCount: number;
}

// Helper function to parse unit from topic name
function parseUnitFromTopic(topic: string): { unit: string; topicName: string } {
  const match = topic.match(/^UNIT\s*([IVX]+|[0-9]+)\s*:\s*(.+)$/i);
  if (match) {
    return { unit: match[1], topicName: match[2] };
  }
  return { unit: 'General', topicName: topic };
}

// Helper function to group topics by unit
function groupTopicsByUnit(topics: TopicCompletion[]): UnitGroup[] {
  const unitMap = new Map<string, TopicCompletion[]>();
  
  topics.forEach(topic => {
    const { unit } = parseUnitFromTopic(topic.topic);
    if (!unitMap.has(unit)) {
      unitMap.set(unit, []);
    }
    unitMap.get(unit)!.push(topic);
  });

  // Sort units (I, II, III, IV, V or 1, 2, 3, 4, 5)
  const romanToNum: Record<string, number> = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8 };
  const sortedUnits = Array.from(unitMap.entries()).sort((a, b) => {
    const numA = romanToNum[a[0]] || parseInt(a[0]) || 99;
    const numB = romanToNum[b[0]] || parseInt(b[0]) || 99;
    return numA - numB;
  });

  return sortedUnits.map(([unit, topics]) => {
    const completed = topics.filter(t => 
      t.status === 'completed' || t.isCompleted
    ).length;
    return {
      unitNumber: unit,
      unitName: `Unit ${unit}`,
      topics,
      completed,
      total: topics.length,
    };
  });
}

export default function UpdateSyllabusPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<ClassTeaching[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [syllabusMap, setSyllabusMap] = useState<Map<string, SyllabusData>>(new Map());
  const [loadingSyllabus, setLoadingSyllabus] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [updatingTopic, setUpdatingTopic] = useState<string | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState<string | null>(null);
  const [unitQuizzes, setUnitQuizzes] = useState<Map<string, GeneratedQuiz>>(new Map());
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [generatedQuizInfo, setGeneratedQuizInfo] = useState<any>(null);

  // Fetch professor's classes
  const fetchClasses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/professors/classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const activeClasses = data.filter((cls: ClassTeaching) => cls.status !== 'completed');
        setClasses(activeClasses);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setIsLoadingClasses(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Fetch syllabus for a specific class
  const fetchSyllabusForClass = async (cls: ClassTeaching) => {
    const key = `${cls.subject}-${cls.batch}-${cls.section}`;
    
    if (syllabusMap.has(key) || loadingSyllabus.has(key)) return;
    
    setLoadingSyllabus(prev => new Set(prev).add(key));
    
    try {
      const params = new URLSearchParams({
        batch: cls.batch,
        section: cls.section,
      });
      if (cls.year) params.append('year', cls.year);
      if (cls.semester) params.append('semester', cls.semester);
      
      const response = await fetch(`/api/syllabus?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const syllabus = data.find((s: SyllabusData) => 
            s.subjects?.some((sub: Subject) => sub.name === cls.subject)
          ) || data[0];
          
          setSyllabusMap(prev => new Map(prev).set(key, syllabus));
        }
      }
    } catch (error) {
      console.error('Error fetching syllabus:', error);
    } finally {
      setLoadingSyllabus(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  // Toggle subject expansion
  const toggleSubject = async (cls: ClassTeaching) => {
    const key = `${cls.subject}-${cls.batch}-${cls.section}`;
    
    setExpandedSubjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
        fetchSyllabusForClass(cls);
      }
      return newSet;
    });
  };

  // Toggle unit expansion
  const toggleUnit = (subjectKey: string, unitNumber: string) => {
    const key = `${subjectKey}-${unitNumber}`;
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Get subject from syllabus
  const getSubjectFromSyllabus = (cls: ClassTeaching): Subject | null => {
    const key = `${cls.subject}-${cls.batch}-${cls.section}`;
    const syllabus = syllabusMap.get(key);
    if (!syllabus) return null;
    return syllabus.subjects.find(s => s.name === cls.subject) || null;
  };

  // Get syllabus ID for a class
  const getSyllabusId = (cls: ClassTeaching): string | null => {
    const key = `${cls.subject}-${cls.batch}-${cls.section}`;
    return syllabusMap.get(key)?._id || null;
  };

  // Handle topic status change
  const handleStatusChange = async (cls: ClassTeaching, topicName: string, newStatus: TopicStatus) => {
    const syllabusId = getSyllabusId(cls);
    if (!syllabusId || !user) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setUpdatingTopic(topicName);
    try {
      const response = await fetch(`/api/syllabus/${syllabusId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subjectName: cls.subject,
          topicUpdates: [{ topic: topicName, status: newStatus }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const key = `${cls.subject}-${cls.batch}-${cls.section}`;
        setSyllabusMap(prev => new Map(prev).set(key, data.syllabus));
        
        toast({
          title: 'Topic Updated',
          description: `Topic marked as ${newStatus.replace('-', ' ')}`,
        });
      }
    } catch (error) {
      console.error('Error updating topic:', error);
      toast({
        title: 'Error',
        description: 'Failed to update topic',
        variant: 'destructive',
      });
    } finally {
      setUpdatingTopic(null);
    }
  };

  // Mark topic as completed
  const markCompleted = (cls: ClassTeaching, topicName: string) => {
    handleStatusChange(cls, topicName, 'completed');
  };

  // Calculate completion stats for a subject
  const getCompletionStats = (subject: Subject | null) => {
    if (!subject) return { completed: 0, total: 0, percentage: 0 };
    const completed = subject.topics.filter(t => 
      (t.status || (t.isCompleted ? 'completed' : 'not-started')) === 'completed'
    ).length;
    const total = subject.topics.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  // Check if quiz exists for a unit
  const checkUnitQuiz = async (subject: string, unitName: string, batch: string, section: string) => {
    const key = `${subject}-${unitName}`;
    if (unitQuizzes.has(key)) return;
    
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        subject,
        unitName: `Unit ${unitName}`,
        batch,
        section,
      });
      
      const response = await fetch(`/api/quizzes/generate-unit?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const quizzes = await response.json();
        if (quizzes.length > 0) {
          setUnitQuizzes(prev => new Map(prev).set(key, quizzes[0]));
        }
      }
    } catch (error) {
      console.error('Error checking unit quiz:', error);
    }
  };

  // Generate quiz for a completed unit
  const handleGenerateQuiz = async (cls: ClassTeaching, unit: UnitGroup) => {
    const key = `${cls.subject}-${unit.unitNumber}`;
    setGeneratingQuiz(key);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/quizzes/generate-unit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: cls.subject,
          unitName: `Unit ${unit.unitNumber}`,
          unitNumber: unit.unitNumber,
          topics: unit.topics.map(t => t.topic),
          batch: cls.batch,
          section: cls.section,
          year: cls.year,
          semester: cls.semester,
          numberOfQuestions: 30,
          duration: 45,
          passPercentage: 60,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnitQuizzes(prev => new Map(prev).set(key, data.quiz));
        setGeneratedQuizInfo(data.quiz);
        setShowQuizDialog(true);
        
        toast({
          title: 'Quiz Generated Successfully!',
          description: `${data.quiz.questionCount} questions created for ${unit.unitName}`,
        });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to generate quiz',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingQuiz(null);
    }
  };

  if (isLoadingClasses) {
    return (
      <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </main>
    );
  }

  if (classes.length === 0) {
    return (
      <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Classes Found</h3>
              <p className="text-muted-foreground mt-1">
                Please add classes from the Manage Classes page first.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Update Syllabus</CardTitle>
              <CardDescription>
                Click on a subject to view units, then expand each unit to see topics
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Subjects List */}
      <div className="space-y-3">
        {classes.map((cls, index) => {
          const key = `${cls.subject}-${cls.batch}-${cls.section}`;
          const isExpanded = expandedSubjects.has(key);
          const isLoadingThisSyllabus = loadingSyllabus.has(key);
          const subject = getSubjectFromSyllabus(cls);
          const stats = getCompletionStats(subject);
          const unitGroups = subject ? groupTopicsByUnit(subject.topics) : [];

          return (
            <Card key={index} className="overflow-hidden">
              {/* Subject Header - Clickable */}
              <div
                className={cn(
                  "flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                  isExpanded && "border-b bg-muted/30"
                )}
                onClick={() => toggleSubject(cls)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    isExpanded ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{cls.subject}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {cls.subjectCode || 'N/A'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {cls.batch}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Section {cls.section}
                      </Badge>
                      {cls.year && cls.semester && (
                        <Badge variant="outline" className="text-xs">
                          Year {cls.year} Sem {cls.semester}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {subject && (
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium">{stats.percentage}% Complete</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.completed} / {stats.total} topics
                      </p>
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded Units */}
              {isExpanded && (
                <CardContent className="pt-4">
                  {isLoadingThisSyllabus ? (
                    <div className="flex items-center justify-center py-8 gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-muted-foreground">Loading syllabus...</span>
                    </div>
                  ) : unitGroups.length > 0 ? (
                    <div className="space-y-3">
                      {/* Overall Progress Bar */}
                      <div className="mb-4 p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-medium">Overall Progress</span>
                          <span className="font-medium">{stats.completed} / {stats.total} topics completed</span>
                        </div>
                        <Progress value={stats.percentage} className="h-2" />
                      </div>

                      {/* Units List */}
                      {unitGroups.map((unit) => {
                        const unitKey = `${key}-${unit.unitNumber}`;
                        const isUnitExpanded = expandedUnits.has(unitKey);
                        const unitPercentage = unit.total > 0 ? Math.round((unit.completed / unit.total) * 100) : 0;

                        return (
                          <Collapsible
                            key={unit.unitNumber}
                            open={isUnitExpanded}
                            onOpenChange={() => toggleUnit(key, unit.unitNumber)}
                          >
                            <CollapsibleTrigger asChild>
                              <div
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                                  isUnitExpanded 
                                    ? "bg-primary/5 border-primary/20" 
                                    : "bg-muted/30 hover:bg-muted/50",
                                  unit.completed === unit.total && unit.total > 0 && "border-green-300 bg-green-50 dark:bg-green-900/20"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "p-2 rounded-md",
                                    unit.completed === unit.total && unit.total > 0
                                      ? "bg-green-100 dark:bg-green-900"
                                      : "bg-muted"
                                  )}>
                                    <Layers className={cn(
                                      "h-4 w-4",
                                      unit.completed === unit.total && unit.total > 0
                                        ? "text-green-600"
                                        : "text-muted-foreground"
                                    )} />
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{unit.unitName}</h4>
                                    <p className="text-xs text-muted-foreground">
                                      {unit.total} topics
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <div className="flex items-center gap-2">
                                      {unit.completed === unit.total && unit.total > 0 ? (
                                        <Badge variant="default" className="bg-green-600 text-xs">
                                          Completed
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary" className="text-xs">
                                          {unitPercentage}%
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {unit.completed}/{unit.total}
                                    </p>
                                  </div>
                                  {isUnitExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="mt-2 ml-4 space-y-1">
                              {unit.topics.map((topicData, topicIndex) => {
                                const status: TopicStatus = topicData.status || (topicData.isCompleted ? 'completed' : 'not-started');
                                const isCompleted = status === 'completed';
                                const isUpdating = updatingTopic === topicData.topic;
                                const { topicName } = parseUnitFromTopic(topicData.topic);

                                return (
                                  <div
                                    key={topicIndex}
                                    className={cn(
                                      "flex items-center gap-3 p-2.5 rounded-md border transition-all",
                                      isCompleted 
                                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                                        : "bg-background hover:bg-muted/50 border-transparent"
                                    )}
                                  >
                                    {/* Checkbox */}
                                    <Checkbox
                                      checked={isCompleted}
                                      disabled={isUpdating}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          markCompleted(cls, topicData.topic);
                                        } else {
                                          handleStatusChange(cls, topicData.topic, 'not-started');
                                        }
                                      }}
                                      className="shrink-0"
                                    />

                                    {/* Topic Name */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        {isCompleted ? (
                                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                                        ) : status === 'in-progress' ? (
                                          <Clock className="h-4 w-4 text-yellow-600 shrink-0" />
                                        ) : (
                                          <Circle className="h-4 w-4 text-gray-400 shrink-0" />
                                        )}
                                        <span className={cn(
                                          "text-sm",
                                          isCompleted && "line-through text-muted-foreground"
                                        )}>
                                          {topicName}
                                        </span>
                                      </div>
                                      {topicData.completedDate && isCompleted && (
                                        <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                                          Completed on {new Date(topicData.completedDate).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 shrink-0">
                                      {isUpdating && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      )}
                                      {!isCompleted && !isUpdating && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-xs h-7 px-2"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markCompleted(cls, topicData.topic);
                                          }}
                                        >
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Done
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Generate Quiz Button - Shows when unit is completed */}
                              {unit.completed === unit.total && unit.total > 0 && (
                                <div className="mt-4 pt-3 border-t">
                                  {unitQuizzes.has(`${cls.subject}-${unit.unitNumber}`) ? (
                                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                      <div className="flex items-center gap-2">
                                        <FileQuestion className="h-5 w-5 text-blue-600" />
                                        <div>
                                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                            Quiz Generated
                                          </p>
                                          <p className="text-xs text-blue-700 dark:text-blue-300">
                                            {unitQuizzes.get(`${cls.subject}-${unit.unitNumber}`)?.questionCount || 30} questions ready for students
                                          </p>
                                        </div>
                                      </div>
                                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                        Active
                                      </Badge>
                                    </div>
                                  ) : (
                                    <Button
                                      className="w-full"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleGenerateQuiz(cls, unit);
                                      }}
                                      disabled={generatingQuiz === `${cls.subject}-${unit.unitNumber}`}
                                    >
                                      {generatingQuiz === `${cls.subject}-${unit.unitNumber}` ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Generating 30 Questions with AI...
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="h-4 w-4 mr-2" />
                                          Generate Quiz (30 Questions)
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">
                        No syllabus found for this subject.
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Please contact admin to add syllabus.
                      </p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Quiz Generated Dialog */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Quiz Generated Successfully!
            </DialogTitle>
            <DialogDescription>
              AI has created a comprehensive assessment for your students.
            </DialogDescription>
          </DialogHeader>
          {generatedQuizInfo && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Title</span>
                  <span className="text-sm font-medium">{generatedQuizInfo.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Questions</span>
                  <span className="text-sm font-medium">{generatedQuizInfo.questionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium">45 minutes</span>
                </div>
              </div>
              {generatedQuizInfo.unitSummary && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {generatedQuizInfo.unitSummary}
                  </p>
                </div>
              )}
              {generatedQuizInfo.topicCoverage && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Topic Coverage:</p>
                  <div className="flex flex-wrap gap-2">
                    {generatedQuizInfo.topicCoverage.slice(0, 5).map((tc: any, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tc.topic}: {tc.questionCount}
                      </Badge>
                    ))}
                    {generatedQuizInfo.topicCoverage.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{generatedQuizInfo.topicCoverage.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Students can now attempt this quiz from their dashboard. Results will be analyzed by AI.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
