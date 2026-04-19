import { apiRequest } from '@/lib/apiClient';
import type { Query, CreateQueryPayload, QueryFilters, PaginatedResult } from '@/types/frontend';

export interface QueryVoteResponse {
  message: string;
  queryId: string;
  upvotes: number;
  downvotes: number;
  userVote: 'UPVOTE' | 'DOWNVOTE' | null;
}

export async function getQueries(filters: QueryFilters = {}): Promise<PaginatedResult<Query>> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.tags?.length) params.set('tags', filters.tags.join(','));
  if (filters.limit != null) params.set('limit', String(filters.limit));
  if (filters.offset != null) params.set('offset', String(filters.offset));
  const qs = params.toString();
  return apiRequest<PaginatedResult<Query>>(`/queries${qs ? `?${qs}` : ''}`);
}

export async function getQueryById(id: string): Promise<{ query: Query }> {
  return apiRequest<{ query: Query }>(`/queries/${id}`);
}

export async function createQuery(payload: CreateQueryPayload): Promise<{ query: Query }> {
  return apiRequest<{ query: Query }>('/queries', {
    method: 'POST',
    body: payload,
  });
}

export async function deleteQuery(id: string): Promise<void> {
  await apiRequest(`/queries/${id}`, { method: 'DELETE' });
}

export async function upvoteQuery(id: string) {
  return apiRequest<QueryVoteResponse>(`/queries/${id}/upvote`, { method: 'PUT' });
}

export async function downvoteQuery(id: string) {
  return apiRequest<QueryVoteResponse>(`/queries/${id}/downvote`, { method: 'PUT' });
}

export async function getQueryVotes(id: string) {
  return apiRequest<{ upvotes: number; downvotes: number; userVote: string | null }>(`/queries/${id}/votes`);
}
