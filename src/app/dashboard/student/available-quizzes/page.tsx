
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { upcomingQuizzes } from '@/lib/mock-data';
import { ListChecks, ArrowRight, Clock, BookOpen, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AvailableQuizzesPage() {
  return (
    <main className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Available Quizzes</h1>
        <p className="text-sm sm:text-base text-muted-foreground">All the quizzes available for you to take.</p>
      </div>

      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <ListChecks className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Quiz List</CardTitle>
                <CardDescription className="text-xs sm:text-sm hidden sm:block">
                  Complete these quizzes to test your knowledge.
                </CardDescription>
              </div>
            </div>
            <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/20">
              {upcomingQuizzes.length} available
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden sm:block rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Quiz Title</TableHead>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold">Due Date</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingQuizzes.map((quiz, index) => (
                  <TableRow 
                    key={quiz.id}
                    className="group cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{quiz.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{quiz.subject}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-sm">{quiz.dueDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary"
                        className={cn(
                          quiz.status === 'Pending' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                          quiz.status === 'Completed' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        )}
                      >
                        {quiz.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="group/btn transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      >
                        Start Quiz
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3">
            {upcomingQuizzes.map((quiz, index) => (
              <div 
                key={quiz.id}
                className="p-4 rounded-lg border bg-card transition-all hover:shadow-md hover:border-primary/20 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{quiz.title}</h3>
                      <Badge variant="outline" className="text-[10px] mt-1">{quiz.subject}</Badge>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={cn(
                      "text-[10px] flex-shrink-0",
                      quiz.status === 'Pending' && 'bg-yellow-100 text-yellow-800',
                      quiz.status === 'Completed' && 'bg-green-100 text-green-800'
                    )}
                  >
                    {quiz.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Due: {quiz.dueDate}</span>
                  </div>
                  <Button 
                    size="sm"
                    className="h-8 text-xs"
                  >
                    Start
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
