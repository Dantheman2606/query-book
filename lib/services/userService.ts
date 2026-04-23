import { apiRequest } from '@/lib/apiClient';
import type { User } from '@/types/frontend';

interface GetUsersOptions {
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getAllUsers(options: GetUsersOptions = {}): Promise<{
  users: User[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}> {
  const params = new URLSearchParams();
  if (options.search?.trim()) params.set('search', options.search.trim());
  if (options.limit != null) params.set('limit', String(options.limit));
  if (options.offset != null) params.set('offset', String(options.offset));

  const query = params.toString();
  const path = query ? `/users?${query}` : '/users';

  return apiRequest<{
    users: User[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  }>(path);
}

export async function getUserById(id: string): Promise<{ user: User }> {
  return apiRequest<{ user: User }>(`/users/${id}`);
}

export async function updateProfile(data: {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  department?: string;
}): Promise<{ user: User }> {
  return apiRequest<{ user: User }>('/users/updateUserProfile', {
    method: 'PUT',
    body: data,
  });
}

export async function deleteUserProfile(userId: string): Promise<void> {
  await apiRequest(`/users/deleteUserProfile`, {
    method: 'DELETE',
    body: { userId },
  });
}

export async function checkUserRole(userId: string) {
  return apiRequest(`/users/checkUserRole`, {
    method: 'POST',
    body: { userId },
  });
}
