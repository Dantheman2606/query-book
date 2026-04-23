'use client';
import { useState, useCallback } from 'react';
import type { User } from '@/types/frontend';
import * as userService from '@/lib/services/userService';
import { useToast } from '@/contexts/ToastContext';

export function useUsers() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(0);
  const [offset, setOffset] = useState(0);

  const fetchUsers = useCallback(async (options?: { search?: string; limit?: number; offset?: number }) => {
    setIsLoading(true);
    try {
      const result = await userService.getAllUsers(options);
      setUsers(result.users ?? []);
      setTotal(result.total ?? 0);
      setLimit(result.limit ?? 0);
      setOffset(result.offset ?? 0);
    } catch (e: any) {
      showToast(e.message || 'Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      await userService.deleteUserProfile(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast('User deleted', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to delete user', 'error');
    }
  }, [showToast]);

  return { users, total, limit, offset, isLoading, fetchUsers, deleteUser };
}
