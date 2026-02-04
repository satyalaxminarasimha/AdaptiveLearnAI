
'use client';

import { useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, UserPlus, X, RefreshCw, Users, IdCard } from 'lucide-react';
import { admitRequests } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdmissionRequests } from '@/hooks/use-admission-requests';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdmissionRequestsPage() {
  const { requests, isLoading, approveRequest, rejectRequest, refetch } = useAdmissionRequests();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [employeeIdDialogOpen, setEmployeeIdDialogOpen] = useState(false);
  const [pendingProfessor, setPendingProfessor] = useState<any>(null);
  const [employeeId, setEmployeeId] = useState('');

  const { professorRequests, studentRequests } = useMemo(() => {
    const professorRequests = requests.filter((req: any) => req.role === 'professor');
    const studentRequests = requests.filter((req: any) => req.role === 'student');
    return { professorRequests, studentRequests };
  }, [requests]);

  const handleApprove = async (userId: string, role: string) => {
    // For professors, show employee ID dialog first
    if (role === 'professor') {
      const professor = requests.find(r => r._id === userId);
      setPendingProfessor(professor);
      setEmployeeId('');
      setEmployeeIdDialogOpen(true);
      return;
    }
    
    // For students, approve directly
    setProcessingId(userId);
    const result = await approveRequest(userId);
    setProcessingId(null);
    if (result.success) {
      toast({
        title: 'Request Approved',
        description: 'The user has been approved and can now log in.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Approval Failed',
        description: result.error,
      });
    }
  };

  const handleProfessorApproval = async () => {
    if (!pendingProfessor || !employeeId.trim()) {
      toast({
        variant: 'destructive',
        title: 'Employee ID Required',
        description: 'Please enter an employee ID for the professor.',
      });
      return;
    }

    setProcessingId(pendingProfessor._id);
    setEmployeeIdDialogOpen(false);
    
    const result = await approveRequest(pendingProfessor._id, employeeId.trim());
    setProcessingId(null);
    setPendingProfessor(null);
    setEmployeeId('');
    
    if (result.success) {
      toast({
        title: 'Professor Approved',
        description: `Professor has been approved with Employee ID: ${employeeId}`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Approval Failed',
        description: result.error,
      });
    }
  };

  const handleReject = async (userId: string) => {
    setProcessingId(userId);
    const result = await rejectRequest(userId);
    setProcessingId(null);
    if (result.success) {
      toast({
        title: 'Request Rejected',
        description: 'The request has been rejected.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Rejection Failed',
        description: result.error,
      });
    }
  };

  const renderSkeleton = () => (
    <TableRow className="animate-pulse">
      <TableCell><Skeleton className="h-4 w-20 sm:w-24" /></TableCell>
      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-32 sm:w-40" /></TableCell>
      <TableCell className="text-right space-x-1 sm:space-x-2">
        <Skeleton className="h-8 w-8 inline-block rounded-md" />
        <Skeleton className="h-8 w-8 inline-block rounded-md" />
      </TableCell>
    </TableRow>
  );

  const renderRequestRow = (req: any, index: number) => (
    <TableRow 
      key={req._id}
      className="group animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <TableCell>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110">
            <span className="text-xs font-semibold text-primary">
              {req.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate text-sm">{req.name}</p>
            <p className="text-xs text-muted-foreground truncate sm:hidden">{req.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <span className="text-muted-foreground text-sm truncate block max-w-[200px]">{req.email}</span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1 sm:gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "h-8 w-8 border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/30 transition-all",
              processingId === req._id && "opacity-50 pointer-events-none"
            )}
            onClick={() => handleApprove(req._id, req.role)}
            disabled={processingId === req._id}
          >
            {processingId === req._id ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "h-8 w-8 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 transition-all",
              processingId === req._id && "opacity-50 pointer-events-none"
            )}
            onClick={() => handleReject(req._id)}
            disabled={processingId === req._id}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  const totalRequests = professorRequests.length + studentRequests.length;

  return (
    <main className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admission Requests</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Review and approve pending admission requests.</p>
        </div>
        {totalRequests > 0 && (
          <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/20 text-sm">
            {totalRequests} pending
          </Badge>
        )}
      </div>

       <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Pending Requests</CardTitle>
                  <CardDescription className="text-xs sm:text-sm hidden sm:block">Users waiting for approval to access the platform.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="professors" className="space-y-3">
              <AccordionItem value="professors" className="border rounded-lg px-3 sm:px-4">
                <AccordionTrigger className="text-sm sm:text-base font-medium py-3 sm:py-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Professor Admits</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {isLoading ? '...' : professorRequests.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3 sm:pb-4">
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Name</TableHead>
                          <TableHead className="font-semibold hidden sm:table-cell">Email</TableHead>
                          <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <>
                            {renderSkeleton()}
                            {renderSkeleton()}
                          </>
                        ) : professorRequests.length > 0 ? (
                          professorRequests.map((req: any, index: number) => renderRequestRow(req, index))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="h-20 text-center">
                              <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
                                <Check className="h-6 w-6 opacity-50" />
                                <span className="text-sm">No pending professor requests.</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="students" className="border rounded-lg px-3 sm:px-4">
                <AccordionTrigger className="text-sm sm:text-base font-medium py-3 sm:py-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span>Student Admits</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {isLoading ? '...' : studentRequests.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3 sm:pb-4">
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Name</TableHead>
                          <TableHead className="font-semibold hidden sm:table-cell">Email</TableHead>
                          <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                       {isLoading ? (
                          <>
                            {renderSkeleton()}
                            {renderSkeleton()}
                            {renderSkeleton()}
                          </>
                        ) : studentRequests.length > 0 ? (
                          studentRequests.map((req: any, index: number) => renderRequestRow(req, index))
                        ) : (
                           <TableRow>
                            <TableCell colSpan={3} className="h-20 text-center">
                              <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
                                <Check className="h-6 w-6 opacity-50" />
                                <span className="text-sm">No pending student requests.</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

      {/* Employee ID Dialog for Professor Approval */}
      <Dialog open={employeeIdDialogOpen} onOpenChange={setEmployeeIdDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IdCard className="h-5 w-5 text-primary" />
              Assign Employee ID
            </DialogTitle>
            <DialogDescription>
              Enter the employee ID for {pendingProfessor?.name} to complete the approval.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                placeholder="e.g., EMP001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="col-span-3"
              />
            </div>
            {pendingProfessor && (
              <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
                <p><span className="text-muted-foreground">Name:</span> {pendingProfessor.name}</p>
                <p><span className="text-muted-foreground">Email:</span> {pendingProfessor.email}</p>
                <p><span className="text-muted-foreground">Department:</span> {pendingProfessor.department || 'Not specified'}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmployeeIdDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProfessorApproval} disabled={!employeeId.trim()}>
              <Check className="h-4 w-4 mr-2" />
              Approve Professor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
