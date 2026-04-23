import { apiRequest } from '@/lib/apiClient';
import type {
  AdminAuditLog,
  AdminDashboardAnalytics,
  AdminSystemMetrics,
  User,
} from '@/types/frontend';

export async function getAdminDashboardAnalytics(): Promise<{
  analytics: AdminDashboardAnalytics;
}> {
  return apiRequest<{ analytics: AdminDashboardAnalytics }>('/admin/analytics');
}

export async function getAdminLogs(options?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<{
  logs: AdminAuditLog[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}> {
  const params = new URLSearchParams();
  if (options?.limit != null) params.set('limit', String(options.limit));
  if (options?.offset != null) params.set('offset', String(options.offset));
  if (options?.search?.trim()) params.set('search', options.search.trim());

  const query = params.toString();
  const path = query ? `/admin/logs?${query}` : '/admin/logs';

  return apiRequest<{
    logs: AdminAuditLog[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  }>(path);
}

export async function promoteUserToFaculty(id: string): Promise<{ user: User; message: string }> {
  return apiRequest<{ user: User; message: string }>(`/admin/users/${id}/promote`, {
    method: 'PUT',
  });
}

export async function getAdminSystemMetrics(): Promise<{ metrics: AdminSystemMetrics }> {
  return apiRequest<{ metrics: AdminSystemMetrics }>('/admin/system');
}
