
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type StudentSession = {
  section: string | null;
};

type SessionContextType = {
  session: StudentSession | null;
  isLoading: boolean;
};

const StudentSessionContext = createContext<SessionContextType | undefined>(undefined);

export function StudentSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const section = window.localStorage.getItem('studentSection');
      if (section) {
        setSession({ section });
      }
    } catch (error) {
      console.error("Failed to parse student session from localStorage", error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
