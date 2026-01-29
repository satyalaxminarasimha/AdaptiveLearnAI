
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { detailedSyllabus } from '@/lib/mock-data';
import { BookOpen, GraduationCap, Layers, Library } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SyllabusOverviewPage() {
  return (
    <main className="flex-1 space-y-6 p-4 md:p-6 animate-fade-in">
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Library className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl">Syllabus Overview</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">Browse the syllabus for the CSM department.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full space-y-2">
              {Object.entries(detailedSyllabus).map(([year, semesters], yearIndex) => (
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
                                                      key={topic}
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
          </CardContent>
        </Card>
    </main>
  );
}
