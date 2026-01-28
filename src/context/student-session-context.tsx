
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './auth-context';

export type StudentSession = {
  section: string | null;
};

type SessionContextType = {
  session: StudentSession | null;
  isLoading: boolean;
};

const StudentSessionContext = createContext<SessionContextType | undefined>(undefined);

export function StudentSessionProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  // Get section from authenticated user's profile
  const session: StudentSession | null = user?.section 
    ? { section: user.section } 
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
