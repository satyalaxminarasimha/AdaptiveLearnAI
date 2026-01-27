
'use client';

import { useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, UserPlus, X } from 'lucide-react';
import { admitRequests } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdmissionRequests } from '@/hooks/use-admission-requests';
import { useToast } from '@/hooks/use-toast';

export default function AdmissionRequestsPage() {
  const { requests, isLoading, approveRequest, rejectRequest } = useAdmissionRequests();
  const { toast } = useToast();

  const { professorRequests, studentRequests } = useMemo(() => {
    const professorRequests = requests.filter((req: any) => req.role === 'professor');
    const studentRequests = requests.filter((req: any) => req.role === 'student');
    return { professorRequests, studentRequests };
  }, [requests]);

  const handleApprove = async (userId: string) => {
    const result = await approveRequest(userId);
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

  const handleReject = async (userId: string) => {
    const result = await rejectRequest(userId);
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
    <TableRow>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
      <TableCell className="text-right space-x-2">
        <Skeleton className="h-8 w-8 inline-block" />
        <Skeleton className="h-8 w-8 inline-block" />
      </TableCell>
    </TableRow>
  );

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6">
       <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-primary" />
                <CardTitle>Admission Requests</CardTitle>
            </div>
            <CardDescription>Review and approve pending admission requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible defaultValue="professors">
              <AccordionItem value="professors">
                <AccordionTrigger className="text-lg font-medium">Professor Admits ({isLoading ? '...' : professorRequests.length})</AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <>
                          {renderSkeleton()}
                          {renderSkeleton()}
                        </>
                      ) : professorRequests.length > 0 ? (
                        professorRequests.map((req: any) => (
                          <TableRow key={req._id}>
                            <TableCell className="font-medium">{req.name}</TableCell>
                            <TableCell>{req.email}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button variant="outline" size="icon" className="h-8 w-8 border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600" onClick={() => handleApprove(req._id)}>
                                 <Check className="h-4 w-4" /> 
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleReject(req._id)}>
                                  <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center">No pending professor requests.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="students">
                <AccordionTrigger className="text-lg font-medium">Student Admits ({isLoading ? '...' : studentRequests.length})</AccordionTrigger>
                <AccordionContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
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
                        studentRequests.map((req: any) => (
                          <TableRow key={req._id}>
                            <TableCell className="font-medium">{req.name}</TableCell>
                             <TableCell>{req.email}</TableCell>
                            <TableCell className="text-right space-x-2">
                               <Button variant="outline" size="icon" className="h-8 w-8 border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600" onClick={() => handleApprove(req._id)}>
                                 <Check className="h-4 w-4" /> 
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleReject(req._id)}>
                                  <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                         <TableRow>
                          <TableCell colSpan={3} className="text-center">No pending student requests.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
    </main>
  );
}
