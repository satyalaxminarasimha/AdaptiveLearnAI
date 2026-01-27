
'use client';

import { useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { detailedSyllabus } from '@/lib/mock-data';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BookCheck } from 'lucide-react';
import { useProfessorSession } from '@/context/professor-session-context';
import { Skeleton } from '@/components/ui/skeleton';

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
      <main className="flex-1 space-y-6 p-4 md:p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
                <BookCheck className="h-6 w-6 text-primary" />
                <CardTitle>Update Syllabus</CardTitle>
            </div>
            <CardDescription>
                Mark topics as covered for{' '}
                <span className="font-semibold text-primary">{selectedClass?.subject}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(filteredSyllabus).length > 0 ? (
                <Accordion type="multiple" className="w-full" defaultValue={Object.keys(filteredSyllabus)}>
                {Object.entries(filteredSyllabus).map(([year, semesters]) => (
                    <AccordionItem value={year} key={year}>
                    <AccordionTrigger className="text-lg font-medium">{year}</AccordionTrigger>
                    <AccordionContent>
                        <Accordion type="multiple" className="space-y-2" defaultValue={Object.keys(semesters as any)}>
                        {Object.entries(semesters as any).map(([semester, subjects]) => (
                            <AccordionItem value={`${year}-${semester}`} key={`${year}-${semester}`} className="border rounded-md px-3">
                                <AccordionTrigger className="text-base font-medium no-underline">{semester}</AccordionTrigger>
                                <AccordionContent>
                                    <Accordion type="multiple" className="space-y-1" defaultValue={(subjects as any[]).map(s => s.name)}>
                                    {(subjects as any[]).map((subject) => (
                                        <AccordionItem value={subject.name} key={subject.name}>
                                            <AccordionTrigger className="text-sm py-3 font-semibold">{subject.name}</AccordionTrigger>
                                            <AccordionContent className="pl-4 space-y-4">
                                                {subject.topics.map((topic: string) => (
                                                    <div key={topic} className="flex items-center justify-between space-x-2 rounded-md border p-3">
                                                        <Label htmlFor={`${subject.name}-${topic}`} className="font-normal text-muted-foreground">
                                                            {topic}
                                                        </Label>
                                                        <Switch id={`${subject.name}-${topic}`} />
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
                <p className="text-muted-foreground">Please select a class from the login page to see the syllabus.</p>
            )}
          </CardContent>
        </Card>
    </main>
  );
}
