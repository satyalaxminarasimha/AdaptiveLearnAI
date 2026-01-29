
'use client';

import { useState, useMemo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader, Siren, Sparkles, AlertTriangle, BookOpen, Lightbulb, CheckCircle2, Target } from 'lucide-react';
import { aiChatTutor, type AIChatTutorOutput } from '@/ai/flows/ai-chat-tutor';
import { studentFullQuizHistory, detailedSyllabus } from '@/lib/mock-data';

type WeakTopic = {
  subject: string;
  topic: string;
  score: number;
  totalQuestions: number;
};

export default function ReviewsPage() {
  const [analysis, setAnalysis] = useState<Record<string, AIChatTutorOutput | null>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const weakTopics = useMemo(() => {
    return studentFullQuizHistory.filter(
      (item) => (item.score / item.totalQuestions) * 100 < 60
    );
  }, []);

  const handleAnalysis = async (topic: WeakTopic) => {
    setLoading((prev) => ({ ...prev, [topic.topic]: true }));
    setError(null);

    try {
      const result = await aiChatTutor({
        question: `I'm struggling with the topic "${topic.topic}" in my ${topic.subject} course. My score was ${topic.score}/${topic.totalQuestions}. Can you explain the core concepts to me in a simple, easy-to-understand way and provide some actionable recommendations on how I can improve? Please be encouraging.`,
        studentQuizHistory: JSON.stringify(studentFullQuizHistory, null, 2),
        subjectSyllabus: JSON.stringify(detailedSyllabus, null, 2),
        difficultyLevel: 'medium',
        weakAreas: topic.topic,
      });

      setAnalysis((prev) => ({ ...prev, [topic.topic]: result }));
    } catch (e: any) {
      console.error(e);
      setError(`An error occurred while analyzing ${topic.topic}. Please try again.`);
    } finally {
      setLoading((prev) => ({ ...prev, [topic.topic]: false }));
    }
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 50) return 'text-yellow-500';
    if (percentage >= 30) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">Personalized Performance Review</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Analyze your weak areas to get personalized explanations and study tips from our AI tutor.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {error && (
            <Alert variant="destructive" className="animate-fade-in">
              <Siren className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {weakTopics.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-center gap-2 text-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg sm:text-xl font-semibold">Your Identified Weak Areas</h2>
              </div>
              <p className="text-center text-xs sm:text-sm text-muted-foreground mb-4">
                Click "Analyze" to get personalized study recommendations
              </p>
              {weakTopics.map((topic, index) => (
                <Card 
                  key={topic.topic} 
                  className="bg-muted/30 transition-all duration-300 hover:shadow-md animate-fade-in border-l-4 border-l-primary/50"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs shrink-0">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {topic.subject}
                        </Badge>
                        <CardTitle className="text-base sm:text-lg truncate">{topic.topic}</CardTitle>
                      </div>
                      <CardDescription className="mt-1 flex items-center gap-2 text-xs sm:text-sm">
                        <Target className="h-3 w-3" />
                        Your score: 
                        <span className={`font-semibold ${getScoreColor(topic.score, topic.totalQuestions)}`}>
                          {topic.score}/{topic.totalQuestions}
                        </span>
                        <span className="text-muted-foreground">
                          ({Math.round((topic.score / topic.totalQuestions) * 100)}%)
                        </span>
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={() => handleAnalysis(topic)} 
                      disabled={loading[topic.topic]}
                      size="sm"
                      className="w-full sm:w-auto transition-all duration-200 hover:scale-105"
                    >
                      {loading[topic.topic] ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          <span className="hidden sm:inline">Analyzing...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Analyze
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  {analysis[topic.topic] && (
                    <CardContent className="p-3 sm:p-4 pt-0 animate-fade-in">
                       <Accordion type="single" collapsible className="w-full" defaultValue="explanation">
                            <AccordionItem value="explanation" className="border rounded-lg mb-2 overflow-hidden">
                                <AccordionTrigger className="px-3 sm:px-4 hover:no-underline hover:bg-muted/50">
                                  <span className="flex items-center gap-2 text-sm sm:text-base">
                                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                                    Explanation
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent className="px-3 sm:px-4 pb-4">
                                  <div className="prose prose-sm max-w-none text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                    {analysis[topic.topic]?.explanation}
                                  </div>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="recommendations" className="border rounded-lg overflow-hidden">
                                <AccordionTrigger className="px-3 sm:px-4 hover:no-underline hover:bg-muted/50">
                                  <span className="flex items-center gap-2 text-sm sm:text-base">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    Recommendations
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent className="px-3 sm:px-4 pb-4">
                                  <div className="prose prose-sm max-w-none text-muted-foreground text-xs sm:text-sm leading-relaxed">
                                    {analysis[topic.topic]?.recommendations}
                                  </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8 sm:py-12 animate-fade-in">
              <div className="p-4 rounded-full bg-green-500/10 w-fit mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-green-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">Great job!</h3>
              <p className="text-sm sm:text-base mt-2">No significant weak areas were identified based on your recent performance.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
