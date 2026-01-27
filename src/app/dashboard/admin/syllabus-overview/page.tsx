
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { detailedSyllabus } from '@/lib/mock-data';

export default function SyllabusOverviewPage() {
  return (
    <main className="flex-1 space-y-6 p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Syllabus Overview</CardTitle>
            <CardDescription>Browse the syllabus for the CSM department.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {Object.entries(detailedSyllabus).map(([year, semesters]) => (
                <AccordionItem value={year} key={year}>
                  <AccordionTrigger className="text-lg font-medium">{year}</AccordionTrigger>
                  <AccordionContent>
                    <Accordion type="multiple" className="space-y-2">
                      {Object.entries(semesters).map(([semester, subjects]) => (
                         <AccordionItem value={`${year}-${semester}`} key={`${year}-${semester}`} className="border rounded-md px-3">
                            <AccordionTrigger className="text-base font-medium no-underline">{semester}</AccordionTrigger>
                             <AccordionContent>
                               <Accordion type="multiple" className="space-y-1">
                                {subjects.map((subject) => (
                                    <AccordionItem value={subject.name} key={subject.name}>
                                        <AccordionTrigger className="text-sm py-3">{subject.name}</AccordionTrigger>
                                        <AccordionContent className="pl-4">
                                            <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                                                {subject.topics.map((topic) => (
                                                    <li key={topic}>{topic}</li>
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
          </CardContent>
        </Card>
    </main>
  );
}
