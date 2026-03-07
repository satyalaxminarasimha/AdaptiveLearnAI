'use client';

import { useState, useEffect } from 'react';
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
import { CalendarIcon, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';

interface AdminContent {
  _id: string;
  title: string;
  content: string;
  type: 'announcement' | 'system-update' | 'policy' | 'maintenance' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetAudience: ('students' | 'professors' | 'admins')[];
  isActive: boolean;
  createdBy: { name: string; email: string };
  publishedAt: string;
  expiresAt?: string;
  createdAt: string;
}

export default function ManageContentPage() {
  const [contents, setContents] = useState<AdminContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<AdminContent | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'announcement' as const,
    priority: 'medium' as const,
    targetAudience: [] as ('students' | 'professors' | 'admins')[],
    publishedAt: new Date(),
    expiresAt: undefined as Date | undefined,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
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
  };

  const handleCreate = async () => {
    try {
      await apiRequest('/api/admin-content', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      toast({
        title: 'Success',
        description: 'Content created successfully',
      });

      setIsCreateDialogOpen(false);
      resetForm();
      fetchContents();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create content',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = async () => {
    if (!editingContent) return;

    try {
      await apiRequest(`/api/admin-content/${editingContent._id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      toast({
        title: 'Success',
        description: 'Content updated successfully',
      });

      setIsEditDialogOpen(false);
      setEditingContent(null);
      resetForm();
      fetchContents();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update content',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      await apiRequest(`/api/admin-content/${id}`, {
        method: 'DELETE',
      });

      toast({
        title: 'Success',
        description: 'Content deleted successfully',
      });

      fetchContents();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete content',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await apiRequest(`/api/admin-content/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      toast({
        title: 'Success',
        description: `Content ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });

      fetchContents();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update content status',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'announcement',
      priority: 'medium',
      targetAudience: [],
      publishedAt: new Date(),
      expiresAt: undefined,
    });
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-800';
      case 'system-update': return 'bg-green-100 text-green-800';
      case 'policy': return 'bg-purple-100 text-purple-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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
                  <TableCell className="font-medium">{content.title}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(content.type)}>
                      {content.type.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPriorityColor(content.priority)}>
                      {content.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {content.targetAudience.map((audience) => (
                        <Badge key={audience} variant="outline">
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
                  <TableCell>
                    {format(new Date(content.publishedAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(content._id, content.isActive)}
                      >
                        {content.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(content)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(content._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
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
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ContentFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  submitLabel: string;
}

function ContentForm({ formData, setFormData, onSubmit, submitLabel }: ContentFormProps) {
  const handleAudienceChange = (audience: 'students' | 'professors' | 'admins', checked: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      targetAudience: checked
        ? [...prev.targetAudience, audience]
        : prev.targetAudience.filter((a: string) => a !== audience),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
            placeholder="Enter content title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value: any) => setFormData((prev: any) => ({ ...prev, type: value }))}
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
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData((prev: any) => ({ ...prev, content: e.target.value }))}
          placeholder="Enter content details"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: any) => setFormData((prev: any) => ({ ...prev, priority: value }))}
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
          <Label>Target Audience</Label>
          <div className="space-y-2">
            {(['students', 'professors', 'admins'] as const).map((audience) => (
              <div key={audience} className="flex items-center space-x-2">
                <Checkbox
                  id={audience}
                  checked={formData.targetAudience.includes(audience)}
                  onCheckedChange={(checked) => handleAudienceChange(audience, checked as boolean)}
                />
                <Label htmlFor={audience} className="capitalize">
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
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.publishedAt ? format(formData.publishedAt, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.publishedAt}
                onSelect={(date) => setFormData((prev: any) => ({ ...prev, publishedAt: date }))}
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
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.expiresAt ? format(formData.expiresAt, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.expiresAt}
                onSelect={(date) => setFormData((prev: any) => ({ ...prev, expiresAt: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button onClick={onSubmit}>{submitLabel}</Button>
      </div>
    </div>
  );
}