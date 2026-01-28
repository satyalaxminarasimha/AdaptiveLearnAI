import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

interface RecentActivity {
  id: string;
  description: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
  type: string;
}

interface AdminStats {
  totalUsers: number;
  totalProfessors: number;
  totalStudents: number;
  admissionRequests: number;
  recentActivity: RecentActivity[];
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('/api/admin/stats');
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