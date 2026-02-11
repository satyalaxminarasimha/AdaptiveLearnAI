'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Brain,
  Lightbulb,
  Trophy,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface SubjectPerformance {
  subject: string;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  weakTopics: string[];
  strongTopics: string[];
}

interface WeakArea {
  topic: string;
  subject: string;
  status: 'critical' | 'needs_work' | 'improving' | 'mastered';
  wrongAnswersCount: number;
  totalAttempts: number;
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  type: string;
  title: string;
  description: string;
  topics?: Array<{ topic: string; subject: string }>;
  subject?: string;
}

interface RecentQuiz {
  _id: string;
  title: string;
  subject: string;
  score: number;
  status: 'pass' | 'fail';
  attemptedAt: string;
}

interface LearningPathData {
  student: {
    _id: string;
    name: string;
    rollNo: string;
    batch: string;
    section: string;
  };
  subjectPerformance: SubjectPerformance[];
  weakAreas: WeakArea[];
  recommendations: Recommendation[];
  aiLearningPath: string | null;
  recentQuizzes: RecentQuiz[];
  stats: {
    totalQuizzes: number;
    averageScore: number;
    criticalAreasCount: number;
    masteredTopicsCount: number;
  };
}

export default function LearningPathPage() {
  const [data, setData] = useState<LearningPathData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLearningPath();
  }, []);

  const fetchLearningPath = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('/api/learning-path');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        const err = await response.json();
        setError(err.error || 'Failed to load learning path');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" /> Critical</Badge>;
      case 'needs_work':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1"><Target className="w-3 h-3" /> Needs Work</Badge>;
      case 'improving':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1"><TrendingUp className="w-3 h-3" /> Improving</Badge>;
      case 'mastered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1"><CheckCircle className="w-3 h-3" /> Mastered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Generating your personalized learning path...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personalized Learning Path</h1>
          <p className="text-muted-foreground">AI-powered study recommendations based on your performance</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Learning Path</h3>
            <p className="text-muted-foreground text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Personalized Learning Path
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </h1>
          <p className="text-muted-foreground">AI-powered study recommendations based on your performance</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Quizzes Completed</CardDescription>
            <CardTitle className="text-2xl">{data.stats.totalQuizzes}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-2xl">{data.stats.averageScore}%</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardDescription>Critical Areas</CardDescription>
            <CardTitle className="text-2xl text-red-600">{data.stats.criticalAreasCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription>Topics Mastered</CardDescription>
            <CardTitle className="text-2xl text-green-600">{data.stats.masteredTopicsCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations">
            <Lightbulb className="w-4 h-4 mr-2" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="ai-path">
            <Brain className="w-4 h-4 mr-2" />
            AI Learning Path
          </TabsTrigger>
          <TabsTrigger value="subjects">
            <BookOpen className="w-4 h-4 mr-2" />
            By Subject
          </TabsTrigger>
          <TabsTrigger value="progress">
            <TrendingUp className="w-4 h-4 mr-2" />
            Progress
          </TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {data.recommendations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="w-12 h-12 text-yellow-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">You're Doing Great!</h3>
                <p className="text-muted-foreground text-center">
                  Complete some quizzes to get personalized learning recommendations.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {data.recommendations.map((rec, index) => (
                <Card key={index} className={`border-l-4 ${rec.priority === 'high' ? 'border-l-red-500' : rec.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {rec.type === 'weak_area' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        {rec.type === 'subject_improvement' && <BookOpen className="w-5 h-5 text-yellow-500" />}
                        {rec.type === 'practice' && <Target className="w-5 h-5 text-blue-500" />}
                        {rec.type === 'achievement' && <Trophy className="w-5 h-5 text-green-500" />}
                        {rec.title}
                      </CardTitle>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                      </Badge>
                    </div>
                    <CardDescription>{rec.description}</CardDescription>
                  </CardHeader>
                  {rec.topics && rec.topics.length > 0 && (
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {rec.topics.map((topic, i) => (
                          <Badge key={i} variant="secondary">
                            {topic.topic} <span className="text-muted-foreground ml-1">({topic.subject})</span>
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* AI Learning Path Tab */}
        <TabsContent value="ai-path" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI-Generated Learning Path
              </CardTitle>
              <CardDescription>
                Personalized study plan generated by AI based on your quiz performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.aiLearningPath ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                    {data.aiLearningPath}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Complete more quizzes to generate an AI-powered learning path.</p>
                  <p className="text-sm mt-2">We need at least a few quiz attempts to analyze your learning style.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          {data.subjectPerformance.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Subject Data Yet</h3>
                <p className="text-muted-foreground text-center">
                  Complete quizzes in different subjects to see your performance breakdown.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {data.subjectPerformance.map((subject) => (
                <Card key={subject.subject}>
                  <CardHeader>
                    <CardTitle className="text-lg">{subject.subject}</CardTitle>
                    <CardDescription>{subject.totalAttempts} quizzes attempted</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Average Score</span>
                        <span className="font-medium">{Math.round(subject.averageScore)}%</span>
                      </div>
                      <Progress value={subject.averageScore} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Pass Rate</span>
                        <span className="font-medium">{Math.round(subject.passRate)}%</span>
                      </div>
                      <Progress 
                        value={subject.passRate} 
                        className="h-2"
                      />
                    </div>
                    {subject.weakTopics.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 text-red-600">Weak Topics:</p>
                        <div className="flex flex-wrap gap-1">
                          {subject.weakTopics.map((topic, i) => (
                            <Badge key={i} variant="destructive" className="text-xs">{topic}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {subject.strongTopics.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 text-green-600">Strong Topics:</p>
                        <div className="flex flex-wrap gap-1">
                          {subject.strongTopics.map((topic, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-green-50 text-green-700">{topic}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Weak Areas Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.weakAreas.filter(wa => wa.status !== 'mastered').length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No weak areas detected yet!</p>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {data.weakAreas.filter(wa => wa.status !== 'mastered').slice(0, 8).map((area, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <span>{area.topic}</span>
                            {getStatusBadge(area.status)}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 text-sm">
                            <p><strong>Subject:</strong> {area.subject}</p>
                            <p><strong>Wrong Answers:</strong> {area.wrongAnswersCount} / {area.totalAttempts}</p>
                            <p className="text-muted-foreground">
                              Focus on reviewing this topic and attempt related quizzes to improve.
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>

            {/* Recent Quizzes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Recent Quiz Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.recentQuizzes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No quizzes attempted yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data.recentQuizzes.map((quiz) => (
                      <div key={quiz._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium text-sm">{quiz.title}</p>
                          <p className="text-xs text-muted-foreground">{quiz.subject}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={quiz.status === 'pass' ? 'default' : 'destructive'}>
                            {quiz.score}%
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(quiz.attemptedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
