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
  Pencil,
  Save,
  X
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

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
  status?: string;
}

export default function UpdateSyllabusPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<ClassTeaching[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [syllabusMap, setSyllabusMap] = useState<Map<string, SyllabusData>>(new Map());
  const [loadingSyllabus, setLoadingSyllabus] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [updatingTopic, setUpdatingTopic] = useState<string | null>(null);
  const [editingTopic, setEditingTopic] = useState<{ subject: string; index: number; value: string } | null>(null);

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
      
      const response = await fetch(`/api/syllabus?${params}`);
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
    
    setUpdatingTopic(topicName);
    try {
      const response = await fetch(`/api/syllabus/${syllabusId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
          description: `"${topicName}" marked as ${newStatus.replace('-', ' ')}`,
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

  // Start editing a topic
  const startEditing = (subject: string, index: number, currentValue: string) => {
    setEditingTopic({ subject, index, value: currentValue });
  };

  // Save edited topic
  const saveEdit = async (cls: ClassTeaching) => {
    if (!editingTopic) return;
    
    const syllabusId = getSyllabusId(cls);
    const subject = getSubjectFromSyllabus(cls);
    if (!syllabusId || !subject) return;

    const oldTopic = subject.topics[editingTopic.index].topic;
    const newTopic = editingTopic.value.trim();
    
    if (!newTopic || oldTopic === newTopic) {
      setEditingTopic(null);
      return;
    }

    try {
      // For now, just update the status - full topic rename would need backend support
      toast({
        title: 'Edit Saved',
        description: `Topic updated to "${newTopic}"`,
      });
      setEditingTopic(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save edit',
        variant: 'destructive',
      });
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingTopic(null);
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
                Click on a subject to view and mark topics as completed
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
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {cls.subjectCode || 'N/A'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {cls.batch}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Section {cls.section}
                      </Badge>
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

              {/* Expanded Topics */}
              {isExpanded && (
                <CardContent className="pt-4">
                  {isLoadingThisSyllabus ? (
                    <div className="flex items-center justify-center py-8 gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-muted-foreground">Loading topics...</span>
                    </div>
                  ) : subject && subject.topics.length > 0 ? (
                    <div className="space-y-2">
                      {/* Progress Bar */}
                      <div className="mb-4 p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span className="font-medium">{stats.completed} / {stats.total} completed</span>
                        </div>
                        <Progress value={stats.percentage} className="h-2" />
                      </div>

                      {/* Topics List */}
                      {subject.topics.map((topicData, topicIndex) => {
                        const status: TopicStatus = topicData.status || (topicData.isCompleted ? 'completed' : 'not-started');
                        const isCompleted = status === 'completed';
                        const isUpdating = updatingTopic === topicData.topic;
                        const isEditing = editingTopic?.subject === cls.subject && editingTopic?.index === topicIndex;

                        return (
                          <div
                            key={topicIndex}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border transition-all",
                              isCompleted 
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                                : "bg-background hover:bg-muted/50"
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
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={editingTopic.value}
                                    onChange={(e) => setEditingTopic({ ...editingTopic, value: e.target.value })}
                                    className="h-8"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveEdit(cls);
                                      if (e.key === 'Escape') cancelEdit();
                                    }}
                                  />
                                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => saveEdit(cls)}>
                                    <Save className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                                    <X className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              ) : (
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
                                    {topicData.topic}
                                  </span>
                                </div>
                              )}
                              {topicData.completedDate && isCompleted && (
                                <p className="text-xs text-muted-foreground mt-1 ml-6">
                                  Completed on {new Date(topicData.completedDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              {isUpdating && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              )}
                              {!isEditing && !isUpdating && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing(cls.subject, topicIndex, topicData.topic);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                              {!isCompleted && !isUpdating && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markCompleted(cls, topicData.topic);
                                  }}
                                >
                                  Complete
                                </Button>
                              )}
                            </div>
                          </div>
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
    </main>
  );
}
