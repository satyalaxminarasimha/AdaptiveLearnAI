'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FileEdit, Clock, CheckCircle, XCircle, Loader2, User, Eye } from 'lucide-react';

interface ChangeRequest {
  _id: string;
  userId: { _id: string; name: string; email: string; role: string };
  userRole: string;
  requestType: string;
  title: string;
  description: string;
  requestedChanges: { field: string; currentValue: string; newValue: string }[];
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string;
  reviewedBy?: { name: string };
  createdAt: string;
  reviewedAt?: string;
}

export default function AdminChangeRequestsPage() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/change-requests?status=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (status: 'approved' | 'rejected', applyChanges: boolean = false) => {
    if (!selectedRequest) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/change-requests/${selectedRequest._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          adminResponse,
          applyChanges,
        }),
      });

      if (res.ok) {
        toast({
          title: `Request ${status}`,
          description: applyChanges ? 'Changes have been applied to the user profile.' : `The request has been ${status}.`,
        });
        setIsDialogOpen(false);
        setSelectedRequest(null);
        setAdminResponse('');
        fetchRequests();
      } else {
        const data = await res.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to process request',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Network error. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRequestDetails = (request: ChangeRequest) => {
    setSelectedRequest(request);
    setAdminResponse(request.adminResponse || '');
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Change Requests</h1>
        <p className="text-muted-foreground">Manage user requests to update their details</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {pendingCount > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileEdit className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No {activeTab} Requests</h3>
                <p className="text-muted-foreground text-center">
                  There are no {activeTab} change requests at this time.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {requests.map((request) => (
                <Card key={request._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{request.title}</CardTitle>
                          <CardDescription>
                            From: {request.userId?.name || 'Unknown'} ({request.userRole})
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRequestDetails(request)}
                        >
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>Type: {request.requestType.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>Submitted: {new Date(request.createdAt).toLocaleDateString()}</span>
                      {request.reviewedAt && (
                        <>
                          <span>•</span>
                          <span>Reviewed: {new Date(request.reviewedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Change Request Details</DialogTitle>
            <DialogDescription>
              Review and respond to this change request.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Requested By</p>
                  <p className="text-muted-foreground">{selectedRequest.userId?.name}</p>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">{selectedRequest.userId?.email}</p>
                </div>
                <div>
                  <p className="font-medium">Role</p>
                  <p className="text-muted-foreground capitalize">{selectedRequest.userRole}</p>
                </div>
                <div>
                  <p className="font-medium">Request Type</p>
                  <p className="text-muted-foreground capitalize">{selectedRequest.requestType.replace('_', ' ')}</p>
                </div>
              </div>

              <div>
                <p className="font-medium text-sm mb-2">Description</p>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  {selectedRequest.description}
                </p>
              </div>

              <div>
                <p className="font-medium text-sm mb-2">Requested Changes</p>
                <div className="bg-muted rounded-lg p-3 space-y-2">
                  {selectedRequest.requestedChanges.map((change, i) => (
                    <div key={i} className="text-sm flex items-center gap-2 p-2 bg-background rounded">
                      <span className="font-medium min-w-[100px]">{change.field}:</span>
                      <span className="text-muted-foreground line-through">{change.currentValue || '(empty)'}</span>
                      <span>→</span>
                      <span className="text-primary font-medium">{change.newValue}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedRequest.status === 'pending' ? (
                <>
                  <div>
                    <p className="font-medium text-sm mb-2">Your Response (Optional)</p>
                    <Textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      placeholder="Add a message to the user about your decision..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleAction('rejected')}
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-700"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAction('approved', false)}
                      disabled={isSubmitting}
                    >
                      Approve Only
                    </Button>
                    <Button
                      onClick={() => handleAction('approved', true)}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                      Approve & Apply Changes
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Status: {getStatusBadge(selectedRequest.status)}</p>
                  {selectedRequest.adminResponse && (
                    <p className="text-sm text-muted-foreground mt-2">Response: {selectedRequest.adminResponse}</p>
                  )}
                  {selectedRequest.reviewedBy && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Reviewed by {selectedRequest.reviewedBy.name} on {new Date(selectedRequest.reviewedAt!).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
