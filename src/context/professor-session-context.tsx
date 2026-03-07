
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type ProfessorClass = {
  batch: string;
  section: string;
  subject: string;
  semester?: string;
  year?: string;
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
          const parsed = JSON.parse(item) as ProfessorClass;
          // Auto-normalize stale batch format: "2022 - 2023" → "2022"
          if (parsed.batch && parsed.batch.includes(' - ')) {
            parsed.batch = parsed.batch.split(' - ')[0].trim();
            window.localStorage.setItem('professorClass', JSON.stringify(parsed));
          }
          setSelectedClassState(parsed);
        }
        
        // Fetch available classes (this also normalizes DB records)
        const classes = await refreshClasses();
        
        // If selected class batch was stale, re-validate against refreshed list
        const storedItem = window.localStorage.getItem('professorClass');
        if (storedItem && classes.length > 0) {
          const stored = JSON.parse(storedItem) as ProfessorClass;
          const match = classes.find(
            (c: ProfessorClass) => c.subject === stored.subject && c.batch === stored.batch && c.section === stored.section
          );
          if (!match) {
            // Selected class no longer exists with that exact data, pick first available
            setSelectedClassState(classes[0]);
            window.localStorage.setItem('professorClass', JSON.stringify(classes[0]));
          }
        }
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
