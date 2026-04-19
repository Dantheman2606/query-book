import { apiRequest } from '@/lib/apiClient';
import type { Announcement, CreateAnnouncementPayload, AnnouncementFilters, PaginatedResult } from '@/types/frontend';

export async function getAnnouncements(
  filters: AnnouncementFilters = {}
): Promise<PaginatedResult<Announcement>> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.limit != null) params.set('limit', String(filters.limit));
  if (filters.offset != null) params.set('offset', String(filters.offset));
  const qs = params.toString();
  return apiRequest<PaginatedResult<Announcement>>(`/announcements${qs ? `?${qs}` : ''}`);
}

export async function getAnnouncementById(id: string): Promise<{ announcement: Announcement }> {
  return apiRequest<{ announcement: Announcement }>(`/announcements/${id}`);
}

export async function createAnnouncement(
  payload: CreateAnnouncementPayload
): Promise<{ announcement: Announcement }> {
  return apiRequest<{ announcement: Announcement }>('/announcements', {
    method: 'POST',
    body: payload,
  });
}

export async function updateAnnouncement(
  id: string,
  payload: Partial<CreateAnnouncementPayload>
): Promise<{ announcement: Announcement }> {
  return apiRequest<{ announcement: Announcement }>(`/announcements/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await apiRequest(`/announcements/${id}`, { method: 'DELETE' });
}
