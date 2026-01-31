'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Loader2, 
  GraduationCap,
  Users,
  Calendar
} from 'lucide-react';

interface ClassTeaching {
  subject: string;
  batch: string;
  section: string;
}

export default function ManageClassesPage() {
  const [classes, setClasses] = useState<ClassTeaching[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    subject: '',
    batch: '',
    section: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchClasses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/professors/classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const addClass = async () => {
    if (!newClass.subject || !newClass.batch || !newClass.section) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all fields',
      });
      return;
    }

    setIsAddingClass(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/professors/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newClass),
      });

      if (res.ok) {
        const data = await res.json();
        setClasses(data.classesTeaching);
        setNewClass({ subject: '', batch: '', section: '' });
        setIsDialogOpen(false);
        toast({
          title: 'Class Added',
          description: `${newClass.subject} for ${newClass.batch}-${newClass.section} has been added.`,
        });
      } else {
        const data = await res.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to add class',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Network error. Please try again.',
      });
    } finally {
      setIsAddingClass(false);
    }
  };

  const removeClass = async (classToRemove: ClassTeaching) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/professors/classes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(classToRemove),
      });

      if (res.ok) {
        const data = await res.json();
        setClasses(data.classesTeaching);
        toast({
          title: 'Class Removed',
          description: `${classToRemove.subject} has been removed.`,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove class',
      });
    }
  };

  const selectClass = (classItem: ClassTeaching) => {
    // Save selected class to localStorage for use across the professor dashboard
    localStorage.setItem('professorClass', JSON.stringify({
      ...classItem,
      semester: 'Current'
    }));
    
    toast({
      title: 'Class Selected',
      description: `Now viewing ${classItem.subject} (${classItem.batch}-${classItem.section})`,
    });
    
    // Reload to update the session context
    window.location.href = '/dashboard/professor';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manage Classes</h1>
          </div>
          <p className="text-muted-foreground">
            Add and manage the classes and subjects you teach
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
              <DialogDescription>
                Add a class and subject that you are teaching this semester.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Subject Name</Label>
                <Input
                  value={newClass.subject}
                  onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                  placeholder="e.g., Data Structures and Algorithms"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Batch</Label>
                  <Select
                    value={newClass.batch}
                    onValueChange={(value) => setNewClass({ ...newClass, batch: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2021">2021</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select
                    value={newClass.section}
                    onValueChange={(value) => setNewClass({ ...newClass, section: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Section A</SelectItem>
                      <SelectItem value="B">Section B</SelectItem>
                      <SelectItem value="C">Section C</SelectItem>
                      <SelectItem value="D">Section D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addClass} disabled={isAddingClass}>
                  {isAddingClass ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Class
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Your Classes
          </CardTitle>
          <CardDescription>
            Classes and subjects you are currently teaching. Click on a class to select it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No classes added yet</h3>
              <p className="text-sm mt-1">Add your first class to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classItem, index) => (
                  <TableRow 
                    key={index}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => selectClass(classItem)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        {classItem.subject}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {classItem.batch}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        Section {classItem.section}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeClass(classItem);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
