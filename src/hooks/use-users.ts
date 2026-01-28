import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'professor' | 'admin';
  avatarUrl?: string;
  rollNo?: string;
  batch?: string;
  section?: string;
  expertise?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useUsers(role?: string) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      
      const response = await apiRequest(`/api/users?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUser = async (userId: string, updateData: Partial<User>) => {
    try {
      const response = await apiRequest(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...data.user } : u));
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await apiRequest(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  return { users, isLoading, error, refetch: fetchUsers, updateUser, deleteUser };
}
