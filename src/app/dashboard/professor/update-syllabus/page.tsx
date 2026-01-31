
'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BookCheck, BookOpen, GraduationCap, Layers, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { useProfessorSession } from '@/context/professor-session-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';

interface TopicCompletion {
  topic: string;
  isCompleted: boolean;
  completedDate?: string;
  completedBy?: string;
}

interface SyllabusData {
  _id: string;
  subject: string;
  batch: string;
  section?: string;
  topics: TopicCompletion[];
  totalTopics: number;
  completedTopics: number;
}

export default function UpdateSyllabusPage() {
  const { selectedClass, isLoading: sessionLoading } = useProfessorSession();
  const { user } = useAuth();
  const { toast } = useToast();
  const [syllabusData, setSyllabusData] = useState<SyllabusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTopic, setUpdatingTopic] = useState<string | null>(null);

  const fetchSyllabus = useCallback(async () => {
    if (!selectedClass) return;
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        subject: selectedClass.subject,
        batch: selectedClass.batch,
        ...(selectedClass.section && { section: selectedClass.section }),
      });
      
      const response = await fetch(`/api/syllabus?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setSyllabusData(data[0]);
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

  const handleTopicToggle = async (topic: string, isCompleted: boolean) => {
    if (!syllabusData || !user) return;
    
    setUpdatingTopic(topic);
    try {
      const response = await fetch(`/api/syllabus/${syllabusData._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: [{ topic, isCompleted }],
          completedBy: user._id,
        }),
      });

      if (response.ok) {
        const updatedSyllabus = await response.json();
        setSyllabusData(updatedSyllabus);
        toast({
          title: isCompleted ? 'Topic Marked Complete' : 'Topic Unmarked',
          description: `"${topic}" has been ${isCompleted ? 'marked as completed' : 'marked as incomplete'}`,
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

  const completionPercentage = syllabusData 
    ? Math.round((syllabusData.completedTopics / syllabusData.totalTopics) * 100) 
    : 0;

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
              </CardDescription>
            </div>
          </div>
          
          {syllabusData && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {syllabusData.completedTopics} / {syllabusData.totalTopics} topics completed
                </span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{completionPercentage}% complete</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {syllabusData && syllabusData.topics.length > 0 ? (
            <div className="space-y-2">
              {syllabusData.topics.map((topicData, topicIndex) => (
                <div 
                  key={topicData.topic} 
                  className={`flex items-center justify-between gap-3 rounded-md border p-3 sm:p-4 transition-all duration-200 hover:bg-muted/50 animate-fade-in ${
                    topicData.isCompleted ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20' : ''
                  }`}
                  style={{ animationDelay: `${topicIndex * 50}ms` }}
                >
                  <div className="flex-1 space-y-1">
                    <Label 
                      htmlFor={`topic-${topicData.topic}`} 
                      className={`font-medium text-sm cursor-pointer ${
                        topicData.isCompleted ? 'text-green-700 dark:text-green-400' : ''
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {topicData.isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                        )}
                        {topicData.topic}
                      </span>
                    </Label>
                    {topicData.isCompleted && topicData.completedDate && (
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
                    <Switch 
                      id={`topic-${topicData.topic}`}
                      checked={topicData.isCompleted}
                      disabled={updatingTopic !== null}
                      onCheckedChange={(checked) => handleTopicToggle(topicData.topic, checked)}
                      className="shrink-0"
                    />
                  </div>
                </div>
              ))}
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
    </main>
  );
}
