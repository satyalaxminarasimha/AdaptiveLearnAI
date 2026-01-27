
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
import { Loader, Siren, Sparkles } from 'lucide-react';
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

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle>Personalized Performance Review</CardTitle>
          </div>
          <CardDescription>
            Analyze your weak areas to get personalized explanations and study tips from our AI tutor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <Siren className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {weakTopics.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Your Identified Weak Areas</h2>
              {weakTopics.map((topic) => (
                <Card key={topic.topic} className="bg-muted/30">
                  <CardHeader className="flex flex-row items-center justify-between p-4">
                    <div>
                      <CardTitle className="text-lg">{topic.subject} - {topic.topic}</CardTitle>
                      <CardDescription>Your score: {topic.score}/{topic.totalQuestions}</CardDescription>
                    </div>
                    <Button onClick={() => handleAnalysis(topic)} disabled={loading[topic.topic]}>
                      {loading[topic.topic] ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
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
                    <CardContent className="p-4 pt-0">
                       <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="explanation">
                                <AccordionTrigger>Explanation</AccordionTrigger>
                                <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                                    {analysis[topic.topic]?.explanation}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="recommendations">
                                <AccordionTrigger>Recommendations</AccordionTrigger>
                                <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                                    {analysis[topic.topic]?.recommendations}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <h3 className="text-lg font-semibold">Great job!</h3>
              <p>No significant weak areas were identified based on your recent performance.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
