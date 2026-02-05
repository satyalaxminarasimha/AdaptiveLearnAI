
'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  AlertTriangle,
  BarChart2,
  BookCheck,
  BookCopy,
  BrainCircuit,
  CalendarDays,
  FileCheck,
  FileEdit,
  FilePen,
  FileText,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MessageSquare,
  PlusCircle,
  Trophy,
  User as UserIcon,
  UserPlus,
  Users,
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { adminUser, professorUser, studentUser } from '@/lib/mock-data';

// Dynamic import to prevent hydration mismatch with Radix UI components
const AiChatTutor = dynamic(
  () => import('@/components/ai-chat-tutor').then((mod) => mod.AiChatTutor),
  { ssr: false }
);

import { ProfessorSessionProvider } from '@/context/professor-session-context';
import { StudentSessionProvider } from '@/context/student-session-context';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

const AdminNav = () => {
  const pathname = usePathname();
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/admin" 
          tooltip="Dashboard"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/admin' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <LayoutDashboard className="transition-transform group-hover:scale-110" />
          Dashboard
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/admin/manage-users" 
          tooltip="Manage Users"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/admin/manage-users' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <Users className="transition-transform group-hover:scale-110" />
          Manage Users
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/admin/admission-requests" 
          tooltip="Requests"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/admin/admission-requests' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <UserPlus className="transition-transform group-hover:scale-110" />
          Requests
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/admin/edit-syllabus" 
          tooltip="Manage Data"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/admin/edit-syllabus' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <FilePen className="transition-transform group-hover:scale-110" />
          Manage Data & Syllabus
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/admin/view-analytics" 
          tooltip="View Analytics"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/admin/view-analytics' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <BarChart2 className="transition-transform group-hover:scale-110" />
          View Analytics
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/admin/change-requests" 
          tooltip="Change Requests"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/admin/change-requests' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <FileEdit className="transition-transform group-hover:scale-110" />
          Change Requests
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/admin/profile" 
          tooltip="My Profile"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/admin/profile' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <UserIcon className="transition-transform group-hover:scale-110" />
          My Profile
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
};

const ProfessorNav = () => {
  const pathname = usePathname();
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/professor" 
          tooltip="Dashboard"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/professor' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <LayoutDashboard className="transition-transform group-hover:scale-110" />
          Dashboard
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/professor/manage-classes" 
          tooltip="My Courses"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/professor/manage-classes' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <BookCopy className="transition-transform group-hover:scale-110" />
          My Courses
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/professor/timetable" 
          tooltip="Classroom Timetable"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/professor/timetable' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <CalendarDays className="transition-transform group-hover:scale-110" />
          Classroom Timetable
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/professor/view-students" 
          tooltip="View Students"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/professor/view-students' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <Users className="transition-transform group-hover:scale-110" />
          View Students
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/professor/create-quiz" 
          tooltip="Create Quiz"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/professor/create-quiz' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <PlusCircle className="transition-transform group-hover:scale-110" />
          Create Quiz
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/professor/student-analysis" 
          tooltip="Student Analysis"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/professor/student-analysis' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <BarChart2 className="transition-transform group-hover:scale-110" />
          Student Analysis
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/professor/weak-areas" 
          tooltip="Weak Areas Report"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/professor/weak-areas' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <AlertTriangle className="transition-transform group-hover:scale-110" />
          Weak Areas Report
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/professor/update-syllabus" 
          tooltip="Update Syllabus"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/professor/update-syllabus' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <BookCheck className="transition-transform group-hover:scale-110" />
          Update Syllabus
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/professor/discussions" 
          tooltip="Discussions"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/professor/discussions' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <MessageSquare className="transition-transform group-hover:scale-110" />
          Discussions
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/professor/change-requests" 
          tooltip="Change Requests"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/professor/change-requests' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <FileEdit className="transition-transform group-hover:scale-110" />
          Change Requests
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/professor/profile" 
          tooltip="My Profile"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/professor/profile' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <UserIcon className="transition-transform group-hover:scale-110" />
          My Profile
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
};

const StudentNav = () => {
  const pathname = usePathname();
  return (
     <>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/student" 
          tooltip="Dashboard"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/student' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <LayoutDashboard className="transition-transform group-hover:scale-110" />
          Dashboard
        </SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/student/available-quizzes" 
          tooltip="Available Quizzes"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/student/available-quizzes' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <ListChecks className="transition-transform group-hover:scale-110" />
          Available Quizzes
        </SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/student/analysis" 
          tooltip="Analysis"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/student/analysis' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <BarChart2 className="transition-transform group-hover:scale-110" />
          Analysis
        </SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/student/reviews" 
          tooltip="Reviews"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/student/reviews' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <FileText className="transition-transform group-hover:scale-110" />
          Reviews
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/student/weak-areas" 
          tooltip="Weak Areas"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/student/weak-areas' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <AlertTriangle className="transition-transform group-hover:scale-110" />
          Weak Areas
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/student/rankings" 
          tooltip="Rankings"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/student/rankings' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <Trophy className="transition-transform group-hover:scale-110" />
          Rankings
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/student/discussions" 
          tooltip="Discussions"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/student/discussions' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <MessageSquare className="transition-transform group-hover:scale-110" />
          Discussions
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/student/change-requests" 
          tooltip="Change Requests"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/student/change-requests' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <FileEdit className="transition-transform group-hover:scale-110" />
          Change Requests
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton 
          href="/dashboard/student/profile" 
          tooltip="My Profile"
          className={cn(
            "transition-all duration-200",
            pathname === '/dashboard/student/profile' && "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <UserIcon className="transition-transform group-hover:scale-110" />
          My Profile
        </SidebarMenuButton>
      </SidebarMenuItem>
    </>
  );
};


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  
  const getRole = () => {
    if (pathname.startsWith('/dashboard/admin')) return 'Admin';
    if (pathname.startsWith('/dashboard/professor')) return 'Professor';
    if (pathname.startsWith('/dashboard/student')) return 'Student';
    return 'Admin'; // Default role
  };

  const role = getRole();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Get user info - use actual logged-in user if available, otherwise fallback to mock
  const getUser = () => {
    if (user) {
      return user;
    }
    // Fallback to mock data for development
    switch (role) {
      case 'Admin':
        return adminUser;
      case 'Professor':
        return professorUser;
      case 'Student':
        return studentUser;
      default:
        return adminUser;
    }
  }

  const currentUser = getUser();
  const displayName = currentUser.name;
  const displayEmail = currentUser.email;

  const handleLogout = () => {
    logout();
    router.push('/');
  };


  const renderNav = () => {
    if (authLoading) {
      return (
          <>
            <SidebarMenuSkeleton showIcon />
            <SidebarMenuSkeleton showIcon />
            <SidebarMenuSkeleton showIcon />
          </>
      );
    }
    switch (role) {
      case 'Admin':
        return <AdminNav />;
      case 'Professor':
        return <ProfessorNav />;
      case 'Student':
        return <StudentNav />;
      default:
        return <AdminNav />;
    }
  };

  const professorDashboard = (
    <ProfessorSessionProvider>{children}</ProfessorSessionProvider>
  );

  const studentDashboard = (
    <StudentSessionProvider>{children}</StudentSessionProvider>
  );

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 text-primary transition-transform hover:scale-105" asChild>
              <Link href="/dashboard">
                <BrainCircuit className="h-6 w-6 sm:h-7 sm:w-7" />
              </Link>
            </Button>
            <span className="text-base sm:text-lg font-semibold text-primary group-data-[collapsible=icon]:hidden">
              AdaptiveLearnAI
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="scrollbar-thin">
          <SidebarMenu className="gap-1">{renderNav()}</SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 sm:gap-3 p-2 transition-all duration-200 ease-linear group-data-[collapsible=icon]:justify-center rounded-lg hover:bg-sidebar-accent/50">
            {authLoading ? (
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                    <SidebarMenuSkeleton showIcon className="w-8 h-8 sm:w-9 sm:h-9 !rounded-full" />
                    <div className="flex-1 space-y-1 group-data-[collapsible=icon]:hidden">
                        <SidebarMenuSkeleton className="w-3/4 h-3 sm:h-4" />
                        <SidebarMenuSkeleton className="w-full h-2 sm:h-3" />
                    </div>
                </div>
            ) : (
              <>
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 transition-transform hover:scale-105">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden min-w-0">
                  <span className="truncate font-medium text-xs sm:text-sm">{displayName}</span>
                  <span className="truncate text-[10px] sm:text-xs text-muted-foreground">{displayEmail}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 group-data-[collapsible=icon]:hidden ml-auto transition-colors hover:bg-destructive/10 hover:text-destructive" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-12 sm:h-14 items-center justify-between border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-3 sm:px-4 lg:px-6 gap-2">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="h-8 w-8" />
            <Badge variant="outline" className="hidden sm:flex text-xs font-normal capitalize">
              {role}
            </Badge>
          </div>
          <AiChatTutor user={currentUser} />
        </header>
        <div className="flex-1 overflow-auto scrollbar-thin">
          {role === 'Professor'
            ? professorDashboard
            : role === 'Student'
            ? studentDashboard
            : children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
