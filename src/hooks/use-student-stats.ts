'use client';

import { useState, useEffect } from 'react';

interface StudentStats {
  totalQuizzes: number;
  quizzesAttempted: number;
  pendingQuizzes: number;
  averageScore: number;
  upcomingQuizzes: any[];
}

export function useStudentStats(studentId?: string) {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentId) {
      fetchStats();
    }
  }, [studentId]);

  const fetchStats = async () => {
    if (!studentId) return;

    try {
      const response = await fetch(`/api/students/${studentId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('Failed to fetch stats');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return { stats, isLoading, error, refetch: fetchStats };
}