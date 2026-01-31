'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { FileEdit, Plus, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ChangeRequest {
  _id: string;
  requestType: string;
  title: string;
  description: string;
  requestedChanges: { field: string; currentValue: string; newValue: string }[];
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string;
  createdAt: string;
  reviewedAt?: string;
}

export default function ProfessorChangeRequestsPage() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Form state
  const [requestType, setRequestType] = useState('profile_update');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [changes, setChanges] = useState([{ field: '', currentValue: '', newValue: '' }]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/change-requests', {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/change-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestType,
          title,
          description,
          requestedChanges: changes.filter(c => c.field && c.newValue),
        }),
      });

      if (res.ok) {
        toast({
          title: 'Request Submitted',
          description: 'Your change request has been sent to the administrator.',
        });
        setIsDialogOpen(false);
        fetchRequests();
        setTitle('');
        setDescription('');
        setChanges([{ field: '', currentValue: '', newValue: '' }]);
      } else {
        const data = await res.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to submit request',
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

  const addChangeField = () => {
    setChanges([...changes, { field: '', currentValue: '', newValue: '' }]);
  };

  const updateChange = (index: number, key: string, value: string) => {
    const updated = [...changes];
    updated[index] = { ...updated[index], [key]: value };
    setChanges(updated);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Change Requests</h1>
          <p className="text-muted-foreground">Request changes to your profile or teaching assignments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Submit Change Request</DialogTitle>
              <DialogDescription>
                Request the administrator to update your profile or teaching details.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Request Type</Label>
                <Select value={requestType} onValueChange={setRequestType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profile_update">Profile Update</SelectItem>
                    <SelectItem value="details_change">Teaching Assignment Change</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief title for your request"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain why you need this change..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Requested Changes</Label>
                {changes.map((change, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Field"
                      value={change.field}
                      onChange={(e) => updateChange(index, 'field', e.target.value)}
                    />
                    <Input
                      placeholder="Current Value"
                      value={change.currentValue}
                      onChange={(e) => updateChange(index, 'currentValue', e.target.value)}
                    />
                    <Input
                      placeholder="New Value"
                      value={change.newValue}
                      onChange={(e) => updateChange(index, 'newValue', e.target.value)}
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addChangeField}>
                  + Add Another Field
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Submit Request
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileEdit className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Change Requests</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't submitted any change requests yet.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              Submit Your First Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{request.title}</CardTitle>
                  {getStatusBadge(request.status)}
                </div>
                <CardDescription>
                  Submitted on {new Date(request.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{request.description}</p>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Requested Changes:</p>
                  <div className="bg-muted rounded-lg p-3 space-y-1">
                    {request.requestedChanges.map((change, i) => (
                      <div key={i} className="text-sm flex gap-2">
                        <span className="font-medium">{change.field}:</span>
                        <span className="text-muted-foreground line-through">{change.currentValue}</span>
                        <span>→</span>
                        <span className="text-primary">{change.newValue}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {request.adminResponse && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Admin Response:</p>
                    <p className="text-sm text-blue-700">{request.adminResponse}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
