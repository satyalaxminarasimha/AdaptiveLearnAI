
'use client';

import { useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { detailedSyllabus } from '@/lib/mock-data';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BookCheck, BookOpen, GraduationCap, Layers } from 'lucide-react';
import { useProfessorSession } from '@/context/professor-session-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function UpdateSyllabusPage() {
  const { selectedClass, isLoading } = useProfessorSession();

  const filteredSyllabus = useMemo(() => {
    if (!selectedClass) return {};
    const result: any = {};

    for (const [year, semesters] of Object.entries(detailedSyllabus)) {
        for (const [semester, subjects] of Object.entries(semesters)) {
            const relevantSubject = subjects.find(s => s.name === selectedClass.subject);
            if (relevantSubject) {
                if (!result[year]) {
                    result[year] = {};
                }
                if (!result[year][semester]) {
                    result[year][semester] = [];
                }
                (result[year as keyof typeof detailedSyllabus] as any)[semester].push(relevantSubject);
            }
        }
    }
    return result;
  }, [selectedClass]);

  if (isLoading) {
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
    )
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Update Syllabus</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                    Mark topics as covered for{' '}
                    <Badge variant="outline" className="ml-1 font-semibold">
                      {selectedClass?.subject || 'your subject'}
                    </Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {Object.keys(filteredSyllabus).length > 0 ? (
                <Accordion type="multiple" className="w-full space-y-2" defaultValue={Object.keys(filteredSyllabus)}>
                {Object.entries(filteredSyllabus).map(([year, semesters], yearIndex) => (
                    <AccordionItem 
                      value={year} 
                      key={year}
                      className="border rounded-lg overflow-hidden animate-fade-in"
                      style={{ animationDelay: `${yearIndex * 100}ms` }}
                    >
                    <AccordionTrigger className="text-base sm:text-lg font-medium px-3 sm:px-4 hover:no-underline hover:bg-muted/50">
                      <span className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        {year}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 sm:px-3 pb-3">
                        <Accordion type="multiple" className="space-y-2" defaultValue={Object.keys(semesters as any)}>
                        {Object.entries(semesters as any).map(([semester, subjects]) => (
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
                                    <Accordion type="multiple" className="space-y-1" defaultValue={(subjects as any[]).map(s => s.name)}>
                                    {(subjects as any[]).map((subject) => (
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
                                            <AccordionContent className="pl-2 sm:pl-4 space-y-2 sm:space-y-3">
                                                {subject.topics.map((topic: string, topicIndex: number) => (
                                                    <div 
                                                      key={topic} 
                                                      className="flex items-center justify-between gap-3 rounded-md border p-2 sm:p-3 transition-all duration-200 hover:bg-muted/50 hover:border-primary/20 animate-fade-in"
                                                      style={{ animationDelay: `${topicIndex * 50}ms` }}
                                                    >
                                                        <Label 
                                                          htmlFor={`${subject.name}-${topic}`} 
                                                          className="font-normal text-xs sm:text-sm text-muted-foreground cursor-pointer flex-1"
                                                        >
                                                            {topic}
                                                        </Label>
                                                        <Switch 
                                                          id={`${subject.name}-${topic}`} 
                                                          className="shrink-0"
                                                        />
                                                    </div>
                                                ))}
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
            ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                    <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Please select a class from the login page to see the syllabus.
                  </p>
                </div>
            )}
          </CardContent>
        </Card>
    </main>
  );
}
