
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './auth-context';

export type StudentSession = {
  batch: string | null;
  section: string | null;
  branch: string | null;
  rollNo: string | null;
};

type SessionContextType = {
  session: StudentSession | null;
  isLoading: boolean;
};

const StudentSessionContext = createContext<SessionContextType | undefined>(undefined);

export function StudentSessionProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  // Get batch and section from authenticated user's profile
  const session: StudentSession | null = user 
    ? { 
        batch: user.batch || null, 
        section: user.section || null,
        branch: ('branch' in user ? (user.branch as string) : null) || null,
        rollNo: user.rollNo || null
      } 
    : null;

  return (
    <StudentSessionContext.Provider value={{ session, isLoading }}>
      {children}
    </StudentSessionContext.Provider>
  );
}

export function useStudentSession() {
  const context = useContext(StudentSessionContext);
  if (context === undefined) {
    throw new Error('useStudentSession must be used within a StudentSessionProvider');
  }
  return context;
}
