'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';

interface StatItem {
  title: string;
  value: string;
  icon: string;
}

interface SubjectProgress {
  subject: string;
  progress: number;
}

interface Quiz {
  id: string;
  title: string;
  subject: string;
  status: string;
}

export function useStudentStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatItem[]>([
    { title: 'Total Quizzes', value: '0', icon: 'BookCopy' },
    { title: 'Quizzes Attempted', value: '0', icon: 'FileCheck' },
    { title: 'Quizzes Pending', value: '0', icon: 'Clock' },
  ]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch quizzes
      const quizzesRes = await fetch('/api/quizzes', { headers });
      let availableQuizzes: Quiz[] = [];
      if (quizzesRes.ok) {
        const quizzesData = await quizzesRes.json();
        availableQuizzes = quizzesData.map((q: any) => ({
          id: q._id,
          title: q.title,
          subject: q.subject,
          status: 'Available'
        }));
        setQuizzes(availableQuizzes);
      }

      // Fetch quiz attempts
      const attemptsRes = await fetch('/api/quiz-attempts', { headers });
      let attemptedCount = 0;
      if (attemptsRes.ok) {
        const attemptsData = await attemptsRes.json();
        attemptedCount = attemptsData.length;
      }

      // Calculate stats
      const totalQuizzes = availableQuizzes.length;
      const pendingQuizzes = Math.max(0, totalQuizzes - attemptedCount);

      setStats([
        { title: 'Total Quizzes', value: totalQuizzes.toString(), icon: 'BookCopy' },
        { title: 'Quizzes Attempted', value: attemptedCount.toString(), icon: 'FileCheck' },
        { title: 'Quizzes Pending', value: pendingQuizzes.toString(), icon: 'Clock' },
      ]);

      // Fetch syllabus progress
      if (user.batch && user.section) {
        const syllabusRes = await fetch(
          `/api/syllabus?batch=${user.batch}&section=${user.section}`,
          { headers }
        );
        if (syllabusRes.ok) {
          const syllabusData = await syllabusRes.json();
          if (syllabusData.length > 0 && syllabusData[0].subjects) {
            const progress = syllabusData[0].subjects.map((s: any) => ({
              subject: s.name,
              progress: s.totalTopics > 0 
                ? Math.round((s.completedTopics / s.totalTopics) * 100) 
                : 0
            }));
            setSubjectProgress(progress);
          }
        }
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching student stats:', err);
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, quizzes, subjectProgress, isLoading, error, refetch: fetchData };
}