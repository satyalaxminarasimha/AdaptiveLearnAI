'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, BookOpen, GraduationCap, Layers, FileText, Cloud, Loader2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface Subject {
  name: string;
  code: string;
  credits: number;
  topics: string[];
}

type SyllabusData = Record<string, Record<string, Subject[]>>;

export default function EditSyllabusPage() {
  const [syllabus, setSyllabus] = useState<SyllabusData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/syllabus', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch syllabus');
        }

        const data = await response.json();
        setSyllabus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load syllabus');
      } finally {
        setLoading(false);
      }
    };

    fetchSyllabus();
  }, []);

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="text-center text-destructive">
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg sm:text-xl">Manage Data and Syllabus</CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-1">
                Manage the knowledge base and syllabus content for the platform.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 sm:space-y-8">
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Cloud className="h-5 w-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-semibold">Ingest Knowledge</h2>
                </div>
                <div className="flex justify-center items-center h-40 sm:h-48 border-2 border-dashed rounded-lg bg-muted/30 transition-all duration-300 hover:bg-muted/50 hover:border-primary/50 cursor-pointer group">
                    <div className="text-center text-muted-foreground p-4">
                        <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 transition-transform group-hover:scale-110 group-hover:text-primary" />
                        <p className="mt-3 sm:mt-4 text-sm sm:text-base">Drag and drop files here to ingest knowledge.</p>
                        <p className="text-xs sm:text-sm">You can manage URLs and uploaded documents.</p>
                        <Button className="mt-3 sm:mt-4 transition-transform hover:scale-105" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </Button>
                    </div>
                </div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h2 className="text-lg sm:text-xl font-semibold">Syllabus Overview</h2>
                </div>
                {Object.keys(syllabus).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No syllabus data available.</p>
                    <p className="text-sm">Run the seed script to populate syllabus data.</p>
                  </div>
                ) : (
                 <Accordion type="multiple" className="w-full space-y-2">
                    {Object.entries(syllabus).map(([year, semesters], yearIndex) => (
                        <AccordionItem 
                          value={year} 
                          key={year}
                          className="border rounded-lg overflow-hidden animate-fade-in"
                          style={{ animationDelay: `${(yearIndex + 3) * 100}ms` }}
                        >
                        <AccordionTrigger className="text-base sm:text-lg font-medium px-3 sm:px-4 hover:no-underline hover:bg-muted/50">
                          <span className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            {year}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-2 sm:px-3 pb-3">
                            <Accordion type="multiple" className="space-y-2">
                            {Object.entries(semesters).map(([semester, subjects]) => (
                                <AccordionItem 
                                  value={`${year}-${semester}`} 
                                  key={`${year}-${semester}`} 
                                  className="border rounded-md px-2 sm:px-3 bg-muted/30"
                                >
                                    <AccordionTrigger className="text-sm sm:text-base font-medium no-underline hover:no-underline">
                                      <span className="flex items-center gap-2">
                                        <Layers className="h-4 w-4 text-muted-foreground" />
                                        {semester}
                                      </span>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <Accordion type="multiple" className="space-y-1">
                                        {subjects.map((subject) => (
                                            <AccordionItem value={subject.name} key={subject.name}>
                                                <AccordionTrigger className="text-xs sm:text-sm py-2 sm:py-3 font-semibold hover:no-underline">
                                                  <span className="flex items-center gap-2">
                                                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                                                    {subject.name}
                                                    <Badge variant="secondary" className="ml-2 text-xs">
                                                      {subject.topics.length} topics
                                                    </Badge>
                                                  </span>
                                                </AccordionTrigger>
                                                <AccordionContent className="pl-2 sm:pl-4">
                                                    <ul className="list-disc space-y-1 sm:space-y-2 pl-4 text-muted-foreground text-xs sm:text-sm">
                                                        {subject.topics.map((topic, topicIndex) => (
                                                            <li 
                                                              key={`${subject.code}-topic-${topicIndex}`}
                                                              className="py-1 transition-colors hover:text-foreground animate-fade-in"
                                                              style={{ animationDelay: `${topicIndex * 30}ms` }}
                                                            >
                                                              {topic}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                      </Accordion>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                            </Accordion>
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                )}
            </div>
        </CardContent>
      </Card>
    </main>
  );
}
