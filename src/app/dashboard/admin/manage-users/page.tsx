'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUsers, User } from '@/hooks/use-users';
import { useToast } from '@/hooks/use-toast';
import { Users, GraduationCap, UserSquare, RefreshCw, Pencil, Trash2, Search, Eye, Filter, X, Mail, Calendar, BookOpen, Hash, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ManageUsersPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states for students
  const [filterBatch, setFilterBatch] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  
  const roleFilter = activeTab === 'all' ? undefined : activeTab;
  const { users, isLoading, refetch, updateUser, deleteUser } = useUsers(roleFilter);
  const { toast } = useToast();

  // Get unique batches and sections for filter dropdowns
  const { availableBatches, availableSections, availableBranches } = useMemo(() => {
    const batches = new Set<string>();
    const sections = new Set<string>();
    const branches = new Set<string>();
    
    users.forEach(user => {
      if (user.role === 'student') {
        if (user.batch) batches.add(user.batch);
        if (user.section) sections.add(user.section);
        // Extract branch from email or rollNo if available
        const emailMatch = user.email.match(/\.(\w+)@/);
        if (emailMatch) branches.add(emailMatch[1].toUpperCase());
      }
    });
    
    return {
      availableBatches: Array.from(batches).sort().reverse(),
      availableSections: Array.from(sections).sort(),
      availableBranches: Array.from(branches).sort(),
    };
  }, [users]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '' as 'student' | 'professor' | 'admin',
    isApproved: false,
    rollNo: '',
    batch: '',
    section: '',
    expertise: '',
  });

  const filteredUsers = users.filter(user => {
    // Text search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.rollNo && user.rollNo.toLowerCase().includes(query))
      );
      if (!matchesSearch) return false;
    }
    
    // Apply student-specific filters only when on student tab
    if (activeTab === 'student' && user.role === 'student') {
      // Batch (year) filter
      if (filterBatch !== 'all' && user.batch !== filterBatch) {
        return false;
      }
      // Section filter
      if (filterSection !== 'all' && user.section !== filterSection) {
        return false;
      }
      // Branch filter (extract from email)
      if (filterBranch !== 'all') {
        const emailMatch = user.email.match(/\.(\w+)@/);
        const userBranch = emailMatch ? emailMatch[1].toUpperCase() : '';
        if (userBranch !== filterBranch) {
          return false;
        }
      }
    }
    
    return true;
  });

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
  };

  const handleClearFilters = () => {
    setFilterBatch('all');
    setFilterSection('all');
    setFilterBranch('all');
  };

  const hasActiveFilters = filterBatch !== 'all' || filterSection !== 'all' || filterBranch !== 'all';

  const handleViewClick = (user: User) => {
    setViewingUser(user);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      rollNo: user.rollNo || '',
      batch: user.batch || '',
      section: user.section || '',
      expertise: user.expertise || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (userId: string) => {
    setDeleteUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    setIsSaving(true);
    const result = await updateUser(editingUser._id, editForm);
    setIsSaving(false);
    
    if (result.success) {
      toast({
        title: 'User Updated',
        description: 'User details have been updated successfully.',
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } else {
      toast({
        title: 'Update Failed',
        description: result.error || 'Failed to update user.',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteUserId) return;
    
    const result = await deleteUser(deleteUserId);
    
    if (result.success) {
      toast({
        title: 'User Deleted',
        description: 'User has been removed successfully.',
      });
    } else {
      toast({
        title: 'Delete Failed',
        description: result.error || 'Failed to delete user.',
        variant: 'destructive',
      });
    }
    
    setIsDeleteDialogOpen(false);
    setDeleteUserId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderUserTable = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      );
    }

    if (filteredUsers.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No users found.
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user._id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn(
                  user.role === 'admin' && 'border-purple-500 text-purple-500',
                  user.role === 'professor' && 'border-blue-500 text-blue-500',
                  user.role === 'student' && 'border-green-500 text-green-500',
                )}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {user.role === 'student' && (
                  <span>{user.rollNo || '-'} | {user.batch || '-'} | {user.section || '-'}</span>
                )}
                {user.role === 'professor' && (
                  <span>{user.expertise || '-'}</span>
                )}
                {user.role === 'admin' && '-'}
              </TableCell>
              <TableCell>
                <Badge variant={user.isApproved ? 'default' : 'secondary'} className={cn(
                  user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                )}>
                  {user.isApproved ? 'Approved' : 'Pending'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(user.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewClick(user)}
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(user)}
                    title="Edit User"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteClick(user._id)}
                    title="Delete User"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <main className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground">View and manage all users in the platform.</p>
        </div>
        <Button variant="outline" onClick={refetch} disabled={isLoading}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 md:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or roll no..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-8 pr-8"
                  />
                  {searchInput && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                      onClick={handleClearSearch}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
                <Button onClick={handleSearch} size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                {activeTab === 'student' && (
                  <Button 
                    variant={showFilters ? "secondary" : "outline"} 
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        !
                      </Badge>
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Student Filters */}
            {activeTab === 'student' && showFilters && (
              <div className="flex flex-wrap items-end gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="grid gap-2">
                  <Label htmlFor="filter-batch" className="text-sm">Year/Batch</Label>
                  <Select value={filterBatch} onValueChange={setFilterBatch}>
                    <SelectTrigger id="filter-batch" className="w-[140px]">
                      <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {availableBatches.map(batch => (
                        <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filter-section" className="text-sm">Section</Label>
                  <Select value={filterSection} onValueChange={setFilterSection}>
                    <SelectTrigger id="filter-section" className="w-[140px]">
                      <SelectValue placeholder="All Sections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {availableSections.map(section => (
                        <SelectItem key={section} value={section}>Section {section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="filter-branch" className="text-sm">Branch</Label>
                  <Select value={filterBranch} onValueChange={setFilterBranch}>
                    <SelectTrigger id="filter-branch" className="w-[140px]">
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {availableBranches.map(branch => (
                        <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="gap-2">
                <Users className="h-4 w-4" />
                All Users
              </TabsTrigger>
              <TabsTrigger value="student" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Students
              </TabsTrigger>
              <TabsTrigger value="professor" className="gap-2">
                <UserSquare className="h-4 w-4" />
                Professors
              </TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              {renderUserTable()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* View User Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information about this user.
            </DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-6 py-4">
              {/* User Header */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {viewingUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{viewingUser.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={cn(
                      viewingUser.role === 'admin' && 'border-purple-500 text-purple-500',
                      viewingUser.role === 'professor' && 'border-blue-500 text-blue-500',
                      viewingUser.role === 'student' && 'border-green-500 text-green-500',
                    )}>
                      {viewingUser.role}
                    </Badge>
                    <Badge className={cn(
                      viewingUser.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    )}>
                      {viewingUser.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{viewingUser.email}</span>
                  </div>
                </div>
              </div>
              
              {/* Role-specific Information */}
              {viewingUser.role === 'student' && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Academic Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Roll Number</p>
                          <p className="text-sm font-medium">{viewingUser.rollNo || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Batch/Year</p>
                          <p className="text-sm font-medium">{viewingUser.batch || 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Section</p>
                          <p className="text-sm font-medium">{viewingUser.section ? `Section ${viewingUser.section}` : 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Branch</p>
                          <p className="text-sm font-medium">
                            {viewingUser.email.match(/\.(\w+)@/)?.[1]?.toUpperCase() || 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {viewingUser.role === 'professor' && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Professional Information</h4>
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Expertise</p>
                        <p className="text-sm font-medium">{viewingUser.expertise || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <Separator />
              
              {/* Account Information */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Account Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Joined</p>
                      <p className="text-sm font-medium">{formatDate(viewingUser.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Last Updated</p>
                      <p className="text-sm font-medium">{formatDate(viewingUser.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              if (viewingUser) handleEditClick(viewingUser);
            }}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value: 'student' | 'professor' | 'admin') => 
                    setEditForm({ ...editForm, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.isApproved ? 'approved' : 'pending'}
                  onValueChange={(value) => 
                    setEditForm({ ...editForm, isApproved: value === 'approved' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {editForm.role === 'student' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="edit-rollNo">Roll Number</Label>
                  <Input
                    id="edit-rollNo"
                    value={editForm.rollNo}
                    onChange={(e) => setEditForm({ ...editForm, rollNo: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-batch">Batch</Label>
                    <Input
                      id="edit-batch"
                      value={editForm.batch}
                      onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-section">Section</Label>
                    <Select
                      value={editForm.section}
                      onValueChange={(value) => setEditForm({ ...editForm, section: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Section A</SelectItem>
                        <SelectItem value="B">Section B</SelectItem>
                        <SelectItem value="C">Section C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
            
            {editForm.role === 'professor' && (
              <div className="grid gap-2">
                <Label htmlFor="edit-expertise">Expertise</Label>
                <Input
                  id="edit-expertise"
                  value={editForm.expertise}
                  onChange={(e) => setEditForm({ ...editForm, expertise: e.target.value })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
