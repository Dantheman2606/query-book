import { apiRequest } from '@/lib/apiClient';
import type { Tag } from '@/types/frontend';

export async function getSelectableTags(): Promise<{ tags: Tag[] }> {
  return apiRequest<{ tags: Tag[] }>('/tags/selectable');
}

export async function getTags(params?: { search?: string; limit?: number; offset?: number }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.limit != null) qs.set('limit', String(params.limit));
  if (params?.offset != null) qs.set('offset', String(params.offset));
  return apiRequest<{ tags: Tag[]; total: number }>(`/tags${qs.toString() ? `?${qs}` : ''}`);
}

export async function createTag(name: string) {
  return apiRequest('/tags', { method: 'POST', body: { name } });
}
