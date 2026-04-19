import { apiRequest } from '@/lib/apiClient';
import type { User } from '@/types/frontend';

export async function getAllUsers(): Promise<{ users: User[] }> {
  return apiRequest<{ users: User[] }>('/users');
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
