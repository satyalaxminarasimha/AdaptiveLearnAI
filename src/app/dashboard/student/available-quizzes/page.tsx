
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
import { ListChecks } from 'lucide-react';

export default function AvailableQuizzesPage() {
  return (
    <main className="flex-1 space-y-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-primary" />
            <CardTitle>Available Quizzes</CardTitle>
          </div>
          <CardDescription>
            Here are all the quizzes available for you to take.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingQuizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>{quiz.subject}</TableCell>
                  <TableCell>{quiz.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{quiz.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Start Quiz
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
