
'use client';

import {
  BarChart2,
  BookCheck,
  BookCopy,
  BrainCircuit,
  FileCheck,
  FilePen,
  FileText,
  LayoutDashboard,
  ListChecks,
  LogOut,
  PlusCircle,
  User as UserIcon,
  UserPlus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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
import { AiChatTutor } from '@/components/ai-chat-tutor';
import { adminUser, professorUser, studentUser } from '@/lib/mock-data';
import { ProfessorSessionProvider } from '@/context/professor-session-context';
import { StudentSessionProvider } from '@/context/student-session-context';

const AdminNav = () => (
  <>
    <SidebarMenuItem>
      <SidebarMenuButton href="/dashboard/admin" tooltip="Dashboard">
        <LayoutDashboard />
        Dashboard
      </SidebarMenuButton>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <SidebarMenuButton href="/dashboard/admin/manage-users" tooltip="Manage Users">
        <Users />
        Manage Users
      </SidebarMenuButton>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <SidebarMenuButton href="/dashboard/admin/admission-requests" tooltip="Requests">
        <UserPlus />
        Requests
      </SidebarMenuButton>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <SidebarMenuButton href="/dashboard/admin/edit-syllabus" tooltip="Manage Data">
        <FilePen />
        Manage Data & Syllabus
      </SidebarMenuButton>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <SidebarMenuButton href="/dashboard/admin/view-analytics" tooltip="View Analytics">
        <BarChart2 />
        View Analytics
      </SidebarMenuButton>
    </SidebarMenuItem>
  </>
);

const ProfessorNav = () => (
  <>
    <SidebarMenuItem>
      <SidebarMenuButton href="/dashboard/professor" tooltip="Dashboard">
        <LayoutDashboard />
        Dashboard
      </SidebarMenuButton>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <SidebarMenuButton href="/dashboard/professor/create-quiz" tooltip="Create Quiz">
        <PlusCircle />
        Create Quiz
      </SidebarMenuButton>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <SidebarMenuButton href="/dashboard/professor/student-analysis" tooltip="Student Analysis">
        <Users />
        Student Analysis
      </SidebarMenuButton>
    </SidebarMenuItem>
    <SidebarMenuItem>
      <SidebarMenuButton href="/dashboard/professor/update-syllabus" tooltip="Update Syllabus">
        <BookCheck />
        Update Syllabus
      </SidebarMenuButton>
    </SidebarMenuItem>
  </>
);

const StudentNav = () => (
   <>
    <SidebarMenuItem>
      <SidebarMenuButton href="/dashboard/student" tooltip="Dashboard">
        <LayoutDashboard />
        Dashboard
      </SidebarMenuButton>
    </SidebarMenuItem>
     <SidebarMenuItem>
      <SidebarMenuButton href="/dashboard/student/available-quizzes" tooltip="Available Quizzes">
        <ListChecks />
        Available Quizzes
      </SidebarMenuButton>
    </SidebarMenuItem>
     <SidebarMenuItem>
      <SidebarMenuButton href="/dashboard/student/analysis" tooltip="Analysis">
        <BarChart2 />
        Analysis
      </SidebarMenuButton>
    </SidebarMenuItem>
     <SidebarMenuItem>
      <SidebarMenuButton href="/dashboard/student/reviews" tooltip="Reviews">
        <FileText />
        Reviews
      </SidebarMenuButton>
    </SidebarMenuItem>
  </>
);


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoading = false;
  
  const getRole = () => {
    if (pathname.startsWith('/dashboard/admin')) return 'Admin';
    if (pathname.startsWith('/dashboard/professor')) return 'Professor';
    if (pathname.startsWith('/dashboard/student')) return 'Student';
    return 'Admin'; // Default role
  };

  const role = getRole();

  const getUser = () => {
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


  const renderNav = () => {
    if (isLoading) {
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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-primary" asChild>
              <Link href="/dashboard">
                <BrainCircuit className="h-7 w-7" />
              </Link>
            </Button>
            <span className="text-lg font-semibold text-primary group-data-[collapsible=icon]:hidden">
              AdaptiveLearnAI
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>{renderNav()}</SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3 p-2 transition-all duration-200 ease-linear group-data-[collapsible=icon]:justify-center">
            {isLoading ? (
                <div className="flex items-center gap-3 w-full">
                    <SidebarMenuSkeleton showIcon className="w-9 h-9 !rounded-full" />
                    <div className="flex-1 space-y-1 group-data-[collapsible=icon]:hidden">
                        <SidebarMenuSkeleton className="w-3/4 h-4" />
                        <SidebarMenuSkeleton className="w-full h-3" />
                    </div>
                </div>
            ) : (
              <>
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    <UserIcon />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">{displayEmail}</span>
                </div>
                <Button variant="ghost" size="icon" className="group-data-[collapsible=icon]:hidden" asChild>
                  <Link href="/">
                    <LogOut />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:px-6">
          <SidebarTrigger />
          <AiChatTutor user={currentUser} />
        </header>
        {role === 'Professor'
          ? professorDashboard
          : role === 'Student'
          ? studentDashboard
          : children}
      </SidebarInset>
    </SidebarProvider>
  );
}
