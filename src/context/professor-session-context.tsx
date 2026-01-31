
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type ProfessorClass = {
  batch: string;
  section: string;
  subject: string;
  semester?: string;
};

type SessionContextType = {
  selectedClass: ProfessorClass | null;
  setSelectedClass: (classInfo: ProfessorClass | null) => void;
  isLoading: boolean;
  refreshClasses: () => Promise<ProfessorClass[]>;
  availableClasses: ProfessorClass[];
};

const ProfessorSessionContext = createContext<SessionContextType | undefined>(undefined);

export function ProfessorSessionProvider({ children }: { children: ReactNode }) {
  const [selectedClass, setSelectedClassState] = useState<ProfessorClass | null>(null);
  const [availableClasses, setAvailableClasses] = useState<ProfessorClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const setSelectedClass = useCallback((classInfo: ProfessorClass | null) => {
    setSelectedClassState(classInfo);
    if (classInfo) {
      window.localStorage.setItem('professorClass', JSON.stringify(classInfo));
    } else {
      window.localStorage.removeItem('professorClass');
    }
  }, []);

  const refreshClasses = useCallback(async (): Promise<ProfessorClass[]> => {
    try {
      const token = window.localStorage.getItem('token');
      if (!token) return [];
      
      const res = await fetch('/api/professors/classes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const classes = await res.json();
        setAvailableClasses(classes);
        return classes;
      }
    } catch (error) {
      console.error('Failed to fetch professor classes:', error);
    }
    return [];
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const item = window.localStorage.getItem('professorClass');
        if (item) {
          setSelectedClassState(JSON.parse(item));
        }
        
        // Fetch available classes
        await refreshClasses();
      } catch (error) {
        console.error("Failed to parse professor class from localStorage", error);
        setSelectedClassState(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, [refreshClasses]);

  return (
    <ProfessorSessionContext.Provider value={{ 
      selectedClass, 
      setSelectedClass, 
      isLoading, 
      refreshClasses,
      availableClasses 
    }}>
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
