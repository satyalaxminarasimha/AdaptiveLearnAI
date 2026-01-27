
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ProfessorClass = {
  batch: string;
  section: string;
  subject: string;
  semester: string;
};

type SessionContextType = {
  selectedClass: ProfessorClass | null;
  isLoading: boolean;
};

const ProfessorSessionContext = createContext<SessionContextType | undefined>(undefined);

export function ProfessorSessionProvider({ children }: { children: ReactNode }) {
  const [selectedClass, setSelectedClass] = useState<ProfessorClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem('professorClass');
      if (item) {
        setSelectedClass(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to parse professor class from localStorage", error);
      setSelectedClass(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <ProfessorSessionContext.Provider value={{ selectedClass, isLoading }}>
      {children}
    </ProfessorSessionContext.Provider>
  );
}

export function useProfessorSession() {
  const context = useContext(ProfessorSessionContext);
  if (context === undefined) {
    throw new Error('useProfessorSession must be used within a ProfessorSessionProvider');
  }
  return context;
}
