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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Loader2, 
  CheckCircle,
  History,
  Search,
  FileText,
  BookMarked,
  Info,
  Sparkles,
  Clock,
  Calendar,
  X,
  Pencil
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicInfo {
  topic: string;
  status: 'not-started' | 'in-progress' | 'completed';
}

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface AvailableSubject {
  name: string;
  code: string;
  credits: number;
  category: string;
  program: string;
  year: string;
  semester: string;
  regulation: string;
  topics: TopicInfo[];
  totalTopics: number;
  courseObjectives: string[];
  courseOutcomes: string[];
  textbooks: string[];
  references: string[];
}

interface ClassTeaching {
  subject: string;
  subjectCode?: string;
  program?: string;
  course?: string;
  batch: string;
  semester?: string;
  section: string;
  year?: number;
  status?: 'active' | 'completed';
  syllabusId?: string;
  credits?: number;
  category?: string;
  regulation?: string;
  topics?: TopicInfo[];
  timeSlots?: TimeSlot[];
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeOptions = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', 
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

const formatTime = (time: string) => {
  const hour = parseInt(time.split(':')[0]);
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return '12:00 PM';
  return `${hour - 12}:00 PM`;
};

export default function ManageClassesPage() {
  const [classes, setClasses] = useState<ClassTeaching[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<AvailableSubject[]>([]);
  const [groupedSubjects, setGroupedSubjects] = useState<Record<string, AvailableSubject[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassTeaching | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [selectedSubject, setSelectedSubject] = useState<AvailableSubject | null>(null);
  const [selectedYearSemester, setSelectedYearSemester] = useState<string>('');
  const [dialogStep, setDialogStep] = useState<'subject' | 'schedule'>('subject');
  
  // Time slots state
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState<TimeSlot>({
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00'
  });
  
  const [newClass, setNewClass] = useState<ClassTeaching>({
    subject: '',
    subjectCode: '',
    program: '',
    course: '',
    batch: '',
    semester: '',
    section: '',
    year: new Date().getFullYear() % 100,
    status: 'active'
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const programs = ['CSE(AI&ML)', 'CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT'];
  const courses = ['B.TECH', 'M.TECH', 'MCA', 'MBA', 'Ph.D'];
  const batches = ['2021 - 2022', '2022 - 2023', '2023 - 2024', '2024 - 2025', '2025 - 2026'];
  const sections = ['A', 'B', 'C', 'D', 'E'];
  const years = [1, 2, 3, 4];

  // Add time slot
  const addTimeSlot = () => {
    if (parseInt(newTimeSlot.endTime) <= parseInt(newTimeSlot.startTime)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Time',
        description: 'End time must be after start time',
      });
      return;
    }
    
    // Check for overlapping slots on same day
    const hasOverlap = timeSlots.some(slot => {
      if (slot.day !== newTimeSlot.day) return false;
      const newStart = parseInt(newTimeSlot.startTime);
      const newEnd = parseInt(newTimeSlot.endTime);
      const slotStart = parseInt(slot.startTime);
      const slotEnd = parseInt(slot.endTime);
      return (newStart < slotEnd && newEnd > slotStart);
    });

    if (hasOverlap) {
      toast({
        variant: 'destructive',
        title: 'Time Conflict',
        description: 'This time slot overlaps with an existing slot on the same day',
      });
      return;
    }

    setTimeSlots([...timeSlots, { ...newTimeSlot }]);
    setNewTimeSlot({
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00'
    });
  };

  // Remove time slot
  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  // Fetch available subjects from syllabus database
  const fetchAvailableSubjects = useCallback(async (program?: string) => {
    setIsLoadingSubjects(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (program) params.append('program', program);
      
      const res = await fetch(`/api/syllabus/subjects?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setAvailableSubjects(data.subjects || []);
        setGroupedSubjects(data.groupedSubjects || {});
      }
    } catch (error) {
      console.error('Failed to fetch available subjects:', error);
    } finally {
      setIsLoadingSubjects(false);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/professors/classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const enhancedData = data.map((cls: ClassTeaching) => ({
          ...cls,
          subjectCode: cls.subjectCode || '',
          program: cls.program || 'CSE(AI&ML)',
          course: cls.course || 'B.TECH',
          semester: cls.semester || '4',
          year: cls.year || 2,
          status: cls.status || 'active',
          timeSlots: cls.timeSlots || []
        }));
        setClasses(enhancedData);
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

  useEffect(() => {
    if (isDialogOpen) {
      fetchAvailableSubjects(newClass.program || undefined);
    }
  }, [isDialogOpen, newClass.program, fetchAvailableSubjects]);

  const handleSubjectSelect = (subject: AvailableSubject) => {
    setSelectedSubject(subject);
    setNewClass(prev => ({
      ...prev,
      subject: subject.name,
      subjectCode: subject.code,
      program: subject.program,
      semester: subject.semester,
      year: parseInt(subject.year) || prev.year,
      credits: subject.credits,
      category: subject.category,
      regulation: subject.regulation,
      topics: subject.topics
    }));
  };

  const addClass = async () => {
    if (!newClass.subject || !newClass.batch || !newClass.section) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    if (timeSlots.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Schedule',
        description: 'Please add at least one time slot for this class',
      });
      return;
    }

    setIsAddingClass(true);
    try {
      const token = localStorage.getItem('token');
      const classToAdd = {
        ...newClass,
        status: 'active',
        topics: selectedSubject?.topics || [],
        timeSlots: timeSlots
      };
      
      console.log('Adding class with timeSlots:', classToAdd);
      
      const res = await fetch('/api/professors/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(classToAdd),
      });

      if (res.ok) {
        const data = await res.json();
        const enhancedData = data.classesTeaching.map((cls: ClassTeaching) => ({
          ...cls,
          subjectCode: cls.subjectCode || '',
          program: cls.program || 'CSE(AI&ML)',
          course: cls.course || 'B.TECH',
          semester: cls.semester || '4',
          year: cls.year || 2,
          status: cls.status || 'active',
          timeSlots: cls.timeSlots || []
        }));
        setClasses(enhancedData);
        resetDialog();
        toast({
          title: 'Course Added',
          description: `${newClass.subject} has been added with ${timeSlots.length} time slot(s).`,
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

  const resetDialog = () => {
    setNewClass({
      subject: '',
      subjectCode: '',
      program: '',
      course: '',
      batch: '',
      semester: '',
      section: '',
      year: new Date().getFullYear() % 100,
      status: 'active'
    });
    setSelectedSubject(null);
    setSelectedYearSemester('');
    setTimeSlots([]);
    setDialogStep('subject');
    setIsDialogOpen(false);
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
        const enhancedData = data.classesTeaching.map((cls: ClassTeaching) => ({
          ...cls,
          subjectCode: cls.subjectCode || '',
          program: cls.program || 'CSE(AI&ML)',
          course: cls.course || 'B.TECH',
          semester: cls.semester || '4',
          year: cls.year || 2,
          status: cls.status || 'active',
          timeSlots: cls.timeSlots || []
        }));
        setClasses(enhancedData);
        toast({
          title: 'Course Removed',
          description: `${classToRemove.subject} has been removed.`,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove course',
      });
    }
  };

  // Open edit dialog for a class
  const openEditDialog = (classItem: ClassTeaching) => {
    setEditingClass(classItem);
    setTimeSlots(classItem.timeSlots || []);
    setIsEditDialogOpen(true);
  };

  // Save updated time slots for a class
  const saveEditedTimeSlots = async () => {
    if (!editingClass) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/professors/classes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: editingClass.subject,
          batch: editingClass.batch,
          section: editingClass.section,
          updates: { timeSlots: timeSlots }
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const enhancedData = data.classesTeaching.map((cls: ClassTeaching) => ({
          ...cls,
          subjectCode: cls.subjectCode || '',
          program: cls.program || 'CSE(AI&ML)',
          course: cls.course || 'B.TECH',
          semester: cls.semester || '4',
          year: cls.year || 2,
          status: cls.status || 'active',
          timeSlots: cls.timeSlots || []
        }));
        setClasses(enhancedData);
        setIsEditDialogOpen(false);
        setEditingClass(null);
        setTimeSlots([]);
        toast({
          title: 'Schedule Updated',
          description: `${editingClass.subject} schedule has been updated with ${timeSlots.length} time slot(s).`,
        });
      } else {
        const data = await res.json();
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to update schedule',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update schedule',
      });
    }
  };

  const markAsCompleted = async (classItem: ClassTeaching) => {
    setClasses(prev => prev.map(cls => 
      cls.subject === classItem.subject && cls.batch === classItem.batch && cls.section === classItem.section
        ? { ...cls, status: 'completed' as const }
        : cls
    ));
    toast({
      title: 'Course Archived',
      description: `${classItem.subject} has been moved to history.`,
    });
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.subjectCode && cls.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTab = activeTab === 'active' ? cls.status !== 'completed' : cls.status === 'completed';
    return matchesSearch && matchesTab;
  });

  const filteredAvailableSubjects = availableSubjects.filter(subject => {
    const matchesSearch = 
      subject.name.toLowerCase().includes(subjectSearchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(subjectSearchQuery.toLowerCase());
    const matchesYearSem = !selectedYearSemester || 
      `Year ${subject.year} - Semester ${subject.semester}` === selectedYearSemester;
    return matchesSearch && matchesYearSem;
  });

  const selectClass = (classItem: ClassTeaching) => {
    localStorage.setItem('professorClass', JSON.stringify({
      ...classItem,
      semester: 'Current'
    }));
    
    toast({
      title: 'Class Selected',
      description: `Now viewing ${classItem.subject} (${classItem.batch}-${classItem.section})`,
    });
    
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Courses</h1>
          </div>
          <p className="text-muted-foreground">
            Manage the courses and subjects you teach with linked syllabus
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) resetDialog();
          else setIsDialogOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 self-start md:self-auto">
              <Plus className="w-4 h-4" /> Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {dialogStep === 'subject' ? 'Add New Course' : 'Set Class Schedule'}
              </DialogTitle>
              <DialogDescription>
                {dialogStep === 'subject' 
                  ? 'Select a subject and set class details'
                  : 'Add time slots for when this class will be held'
                }
              </DialogDescription>
            </DialogHeader>
            
            {dialogStep === 'subject' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                {/* Left side - Subject Selection */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <BookMarked className="h-4 w-4" />
                      Select from Available Subjects
                    </Label>
                    
                    <Select
                      value={newClass.program || 'all'}
                      onValueChange={(value) => setNewClass({ ...newClass, program: value === 'all' ? '' : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Programs</SelectItem>
                        {programs.map(prog => (
                          <SelectItem key={prog} value={prog}>{prog}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedYearSemester || 'all'}
                      onValueChange={(value) => setSelectedYearSemester(value === 'all' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by year & semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years & Semesters</SelectItem>
                        {Object.keys(groupedSubjects).map(key => (
                          <SelectItem key={key} value={key}>{key}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search subjects..."
                        value={subjectSearchQuery}
                        onChange={(e) => setSubjectSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <ScrollArea className="h-[280px] border rounded-lg">
                    {isLoadingSubjects ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : filteredAvailableSubjects.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
                        <FileText className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm text-center">No subjects found</p>
                      </div>
                    ) : (
                      <div className="p-2 space-y-2">
                        {filteredAvailableSubjects.map((subject, index) => (
                          <div
                            key={`${subject.code}-${index}`}
                            onClick={() => handleSubjectSelect(subject)}
                            className={cn(
                              "p-3 rounded-lg border cursor-pointer transition-all",
                              selectedSubject?.code === subject.code && selectedSubject?.name === subject.name
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "hover:border-primary/50 hover:bg-muted/50"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{subject.name}</p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {subject.code}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {subject.credits} Credits
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Year {subject.year} • Sem {subject.semester} • {subject.totalTopics} topics
                                </p>
                              </div>
                              {selectedSubject?.code === subject.code && selectedSubject?.name === subject.name && (
                                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
                
                {/* Right side - Class Details */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Class Details
                  </Label>
                  
                  {selectedSubject && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Selected Subject</span>
                      </div>
                      <p className="font-semibold">{selectedSubject.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedSubject.code} • {selectedSubject.credits} credits
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Course Type *</Label>
                      <Select
                        value={newClass.course}
                        onValueChange={(value) => setNewClass({ ...newClass, course: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map(course => (
                            <SelectItem key={course} value={course}>{course}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Batch *</Label>
                      <Select
                        value={newClass.batch}
                        onValueChange={(value) => setNewClass({ ...newClass, batch: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select batch" />
                        </SelectTrigger>
                        <SelectContent>
                          {batches.map(batch => (
                            <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Section *</Label>
                      <Select
                        value={newClass.section}
                        onValueChange={(value) => setNewClass({ ...newClass, section: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map(sec => (
                            <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Select
                        value={newClass.year?.toString()}
                        onValueChange={(value) => setNewClass({ ...newClass, year: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map(year => (
                            <SelectItem key={year} value={year.toString()}>Year {year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or enter manually
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Subject Name</Label>
                      <Input
                        value={newClass.subject}
                        onChange={(e) => {
                          setNewClass({ ...newClass, subject: e.target.value });
                          setSelectedSubject(null);
                        }}
                        placeholder="e.g., Database Management"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subject Code</Label>
                      <Input
                        value={newClass.subjectCode}
                        onChange={(e) => setNewClass({ ...newClass, subjectCode: e.target.value })}
                        placeholder="e.g., 20CS301"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={resetDialog}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        if (!newClass.subject || !newClass.batch || !newClass.section) {
                          toast({
                            variant: 'destructive',
                            title: 'Error',
                            description: 'Please fill in subject, batch, and section',
                          });
                          return;
                        }
                        setDialogStep('schedule');
                      }}
                    >
                      Next: Set Schedule
                      <Clock className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Schedule Step */
              <div className="space-y-6 pt-4">
                {/* Selected Course Summary */}
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{newClass.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        {newClass.subjectCode} • {newClass.batch} • Section {newClass.section}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setDialogStep('subject')}>
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Add Time Slot */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Add Class Time Slots
                  </Label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Day</Label>
                      <Select
                        value={newTimeSlot.day}
                        onValueChange={(value) => setNewTimeSlot({ ...newTimeSlot, day: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map(day => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Start Time</Label>
                      <Select
                        value={newTimeSlot.startTime}
                        onValueChange={(value) => setNewTimeSlot({ ...newTimeSlot, startTime: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(time => (
                            <SelectItem key={time} value={time}>{formatTime(time)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">End Time</Label>
                      <Select
                        value={newTimeSlot.endTime}
                        onValueChange={(value) => setNewTimeSlot({ ...newTimeSlot, endTime: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(time => (
                            <SelectItem key={time} value={time}>{formatTime(time)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addTimeSlot} className="w-full">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Added Time Slots */}
                <div className="space-y-2">
                  <Label>Scheduled Time Slots ({timeSlots.length})</Label>
                  {timeSlots.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No time slots added yet</p>
                      <p className="text-xs">Add at least one time slot for this class</p>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {timeSlots.map((slot, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{slot.day}</Badge>
                            <span className="font-medium">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTimeSlot(index)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogStep('subject')}>
                    Back
                  </Button>
                  <Button onClick={addClass} disabled={isAddingClass || timeSlots.length === 0}>
                    {isAddingClass ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Add Course
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs and Search */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="active" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Active Courses
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredClasses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">
                {activeTab === 'active' ? 'No active courses' : 'No course history'}
              </h3>
              <p className="text-sm mt-1">
                {activeTab === 'active' 
                  ? 'Add your first course to get started'
                  : 'Completed courses will appear here'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Subject Name</TableHead>
                    <TableHead className="font-semibold">Subject Code</TableHead>
                    <TableHead className="font-semibold">Program</TableHead>
                    <TableHead className="font-semibold">Batch</TableHead>
                    <TableHead className="font-semibold">Section</TableHead>
                    <TableHead className="font-semibold">Schedule</TableHead>
                    <TableHead className="font-semibold">Syllabus</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((classItem, index) => (
                    <TableRow 
                      key={index}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => selectClass(classItem)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate max-w-[200px]">{classItem.subject}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {classItem.subjectCode || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>{classItem.program}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {classItem.batch}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {classItem.section}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {classItem.timeSlots && classItem.timeSlots.length > 0 ? (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            <Clock className="h-3 w-3 mr-1" />
                            {classItem.timeSlots.length} slot(s)
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            No schedule
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {classItem.topics && classItem.topics.length > 0 ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <FileText className="h-3 w-3 mr-1" />
                            {classItem.topics.length} topics
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Not linked
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {activeTab === 'active' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-blue-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(classItem);
                                }}
                                title="Edit schedule"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsCompleted(classItem);
                                }}
                                title="Mark as completed"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeClass(classItem);
                            }}
                            title="Remove course"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Time Slots Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              {editingClass && (
                <span>{editingClass.subject} • {editingClass.batch} • Section {editingClass.section}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Add Time Slot */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Add Time Slots
              </Label>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Day</Label>
                  <Select
                    value={newTimeSlot.day}
                    onValueChange={(value) => setNewTimeSlot({ ...newTimeSlot, day: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Start</Label>
                  <Select
                    value={newTimeSlot.startTime}
                    onValueChange={(value) => setNewTimeSlot({ ...newTimeSlot, startTime: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={time} value={time}>{formatTime(time)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End</Label>
                  <Select
                    value={newTimeSlot.endTime}
                    onValueChange={(value) => setNewTimeSlot({ ...newTimeSlot, endTime: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map(time => (
                        <SelectItem key={time} value={time}>{formatTime(time)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={addTimeSlot} className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add Slot
              </Button>
            </div>

            {/* Current Time Slots */}
            <div className="space-y-2">
              <Label>Current Schedule ({timeSlots.length} slots)</Label>
              {timeSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/50">
                  No time slots scheduled
                </p>
              ) : (
                <ScrollArea className="h-[150px]">
                  <div className="space-y-2">
                    {timeSlots.map((slot, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{slot.day}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeTimeSlot(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Save Button */}
            <Button onClick={saveEditedTimeSlots} className="w-full">
              Save Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
