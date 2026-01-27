import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { detailedSyllabus } from '@/lib/mock-data';

export default function EditSyllabusPage() {
  return (
    <main className="flex-1 space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Data and Syllabus</CardTitle>
          <CardDescription>
            Manage the knowledge base and syllabus content for the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold mb-2">Ingest Knowledge</h2>
                <div className="flex justify-center items-center h-48 border-2 border-dashed rounded-lg bg-muted/50">
                    <div className="text-center text-muted-foreground">
                        <Upload className="mx-auto h-12 w-12" />
                        <p className="mt-4">Drag and drop files here to ingest knowledge.</p>
                        <p className="text-sm">You can manage URLs and uploaded documents.</p>
                        <Button className="mt-4">Upload File</Button>
                    </div>
                </div>
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-2">Syllabus Overview</h2>
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
                                                <AccordionTrigger className="text-sm py-3 font-semibold">{subject.name}</AccordionTrigger>
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
            </div>
        </CardContent>
      </Card>
    </main>
  );
}
