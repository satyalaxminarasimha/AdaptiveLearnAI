import { useState, useEffect } from 'react';
import { apiGetJsonCached, apiRequest, invalidateApiCache } from '@/lib/api';

interface AdmissionRequest {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'professor';
  rollNo?: string;
  batch?: string;
  section?: string;
  expertise?: string;
  isApproved: boolean;
  createdAt: string;
}

export function useAdmissionRequests() {
  const [requests, setRequests] = useState<AdmissionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const data = await apiGetJsonCached<AdmissionRequest[]>('/api/users?approved=false', {}, 20_000);
      setRequests(data);
      setError(null);
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approveRequest = async (userId: string, employeeId?: string) => {
    try {
      const body: Record<string, unknown> = { isApproved: true };
      if (employeeId) {
        body.employeeId = employeeId;
      }
      
      const response = await apiRequest(`/api/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      if (response.ok) {
        invalidateApiCache('/api/users');
        setRequests(prev => prev.filter(req => req._id !== userId));
        return { success: true };
      } else {
        return { success: false, error: 'Failed to approve' };
      }
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  const rejectRequest = async (userId: string) => {
    try {
      const response = await apiRequest(`/api/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isApproved: false }),
      });

      if (response.ok) {
        invalidateApiCache('/api/users');
        setRequests(prev => prev.filter(req => req._id !== userId));
        return { success: true };
      } else {
        return { success: false, error: 'Failed to reject' };
      }
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  return {
    requests,
    isLoading,
    error,
    approveRequest,
    rejectRequest,
    refetch: fetchRequests
  };
}