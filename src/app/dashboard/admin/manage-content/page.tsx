'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Edit, Trash2, Eye, EyeOff, Loader2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';

// Type definitions
type ContentType = 'announcement' | 'system-update' | 'policy' | 'maintenance' | 'other';
type Priority = 'low' | 'medium' | 'high' | 'critical';
type Audience = 'students' | 'professors' | 'admins';

interface AdminContent {
  _id: string;
  title: string;
  content: string;
  type: ContentType;
  priority: Priority;
  targetAudience: Audience[];
  isActive: boolean;
  createdBy: { name: string; email: string };
  publishedAt: string;
  expiresAt?: string;
  createdAt: string;
}

interface FormData {
  title: string;
  content: string;
  type: ContentType;
  priority: Priority;
  targetAudience: Audience[];
  publishedAt: Date;
  expiresAt: Date | undefined;
}

const initialFormData: FormData = {
  title: '',
  content: '',
  type: 'announcement',
  priority: 'medium',
  targetAudience: [],
  publishedAt: new Date(),
  expiresAt: undefined,
};

export default function ManageContentPage() {
  const [contents, setContents] = useState<AdminContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<AdminContent | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const { toast } = useToast();

  const fetchContents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('/api/admin-content');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setContents(data.contents || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch content',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.content.trim()) return 'Content is required';
    if (formData.targetAudience.length === 0) return 'Select at least one target audience';
    if (formData.expiresAt && formData.expiresAt < formData.publishedAt) {
      return 'Expiry date must be after publish date';
    }
    return null;
  };

  const handleCreate = async () => {
    const error = validateForm();
    if (error) {
      toast({ title: 'Validation Error', description: error, variant: 'destructive' });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiRequest('/api/admin-content', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create');
      }

      toast({ title: 'Success', description: 'Content created successfully' });
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
      fetchContents();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create content',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingContent) return;

    const error = validateForm();
    if (error) {
      toast({ title: 'Validation Error', description: error, variant: 'destructive' });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiRequest(`/api/admin-content/${editingContent._id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update');
      }

      toast({ title: 'Success', description: 'Content updated successfully' });
      setIsEditDialogOpen(false);
      setEditingContent(null);
      setFormData(initialFormData);
      fetchContents();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update content',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const response = await apiRequest(`/api/admin-content/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      toast({ title: 'Success', description: 'Content deleted successfully' });
      fetchContents();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete content',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await apiRequest(`/api/admin-content/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update');
      }

      toast({
        title: 'Success',
        description: `Content ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      fetchContents();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update content status',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (content: AdminContent) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      content: content.content,
      type: content.type,
      priority: content.priority,
      targetAudience: content.targetAudience,
      publishedAt: new Date(content.publishedAt),
      expiresAt: content.expiresAt ? new Date(content.expiresAt) : undefined,
    });
    setIsEditDialogOpen(true);
  };

  const handleDialogClose = (open: boolean, isCreate: boolean) => {
    if (!open && !isSubmitting) {
      if (isCreate) {
        setIsCreateDialogOpen(false);
      } else {
        setIsEditDialogOpen(false);
        setEditingContent(null);
      }
      setFormData(initialFormData);
    } else if (open) {
      if (isCreate) setIsCreateDialogOpen(true);
    }
  };

  const getPriorityVariant = (priority: Priority): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
    }
  };

  const getTypeColor = (type: ContentType) => {
    const colors: Record<ContentType, string> = {
      'announcement': 'bg-blue-100 text-blue-800',
      'system-update': 'bg-green-100 text-green-800',
      'policy': 'bg-purple-100 text-purple-800',
      'maintenance': 'bg-orange-100 text-orange-800',
      'other': 'bg-gray-100 text-gray-800',
    };
    return colors[type];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Content</h1>
          <p className="text-muted-foreground">
            Create and manage announcements, policies, and system updates
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => handleDialogClose(open, true)}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Content</DialogTitle>
              <DialogDescription>
                Create announcements, policies, or system updates for users
              </DialogDescription>
            </DialogHeader>
            <ContentForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              submitLabel="Create Content"
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Content</CardTitle>
          <CardDescription>
            Manage all system content and announcements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No content yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first announcement, policy, or system update.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Content
              </Button>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contents.map((content) => (
                <TableRow key={content._id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{content.title}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(content.type)}>
                      {content.type.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityVariant(content.priority)}>
                      {content.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {content.targetAudience.map((audience) => (
                        <Badge key={audience} variant="outline" className="text-xs">
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={content.isActive ? 'default' : 'secondary'}>
                      {content.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(content.publishedAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(content._id, content.isActive)}
                        title={content.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {content.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(content)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(content._id)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => handleDialogClose(open, false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Update the content details
            </DialogDescription>
          </DialogHeader>
          <ContentForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEdit}
            submitLabel="Update Content"
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ContentFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: () => void;
  submitLabel: string;
  isSubmitting: boolean;
}

function ContentForm({ formData, setFormData, onSubmit, submitLabel, isSubmitting }: ContentFormProps) {
  const handleAudienceChange = (audience: Audience, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      targetAudience: checked
        ? [...prev.targetAudience, audience]
        : prev.targetAudience.filter((a) => a !== audience),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Enter content title"
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type <span className="text-destructive">*</span></Label>
          <Select
            value={formData.type}
            onValueChange={(value: ContentType) => setFormData((prev) => ({ ...prev, type: value }))}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="announcement">Announcement</SelectItem>
              <SelectItem value="system-update">System Update</SelectItem>
              <SelectItem value="policy">Policy</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content <span className="text-destructive">*</span></Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
          placeholder="Enter content details"
          rows={4}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: Priority) => setFormData((prev) => ({ ...prev, priority: value }))}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Target Audience <span className="text-destructive">*</span></Label>
          <div className="space-y-2">
            {(['students', 'professors', 'admins'] as const).map((audience) => (
              <div key={audience} className="flex items-center space-x-2">
                <Checkbox
                  id={audience}
                  checked={formData.targetAudience.includes(audience)}
                  onCheckedChange={(checked) => handleAudienceChange(audience, checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor={audience} className="capitalize cursor-pointer">
                  {audience}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Published At</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formData.publishedAt && 'text-muted-foreground'
                )}
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.publishedAt ? format(formData.publishedAt, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.publishedAt}
                onSelect={(date) => setFormData((prev) => ({ ...prev, publishedAt: date || new Date() }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Expires At (Optional)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !formData.expiresAt && 'text-muted-foreground'
                )}
                disabled={isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.expiresAt ? format(formData.expiresAt, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.expiresAt}
                onSelect={(date) => setFormData((prev) => ({ ...prev, expiresAt: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}