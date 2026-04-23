'use client';
import { useState, useCallback } from 'react';
import type { Announcement, AnnouncementFilters } from '@/types/frontend';
import * as announcementService from '@/lib/services/announcementService';
import { useToast } from '@/contexts/ToastContext';

export function useAnnouncements(initialFilters: AnnouncementFilters = {}) {
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<AnnouncementFilters>({
    limit: 20, offset: 0, sortBy: 'recent', ...initialFilters,
  });

  const fetchAnnouncements = useCallback(async (overrides?: AnnouncementFilters) => {
    setIsLoading(true);
    try {
      const result = await announcementService.getAnnouncements({ ...filters, ...overrides }) as any;
      setAnnouncements(result.announcements || result.data || []);
      setTotal(result.pagination?.total ?? result.total ?? 0);
    } catch (e: any) {
      showToast(e.message || 'Failed to load announcements', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters, showToast]);

  const createAnnouncement = useCallback(async (data: { title: string; content: string }) => {
    try {
      await announcementService.createAnnouncement(data);
      await fetchAnnouncements();
      showToast('Announcement posted', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to post announcement', 'error');
      throw e;
    }
  }, [fetchAnnouncements, showToast]);

  const deleteAnnouncement = useCallback(async (id: string) => {
    try {
      await announcementService.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      showToast('Announcement deleted', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to delete', 'error');
    }
  }, [showToast]);

  const updateFilter = useCallback((updates: Partial<AnnouncementFilters>) => {
    setFilters(prev => ({ ...prev, ...updates, offset: 0 }));
  }, []);

  return { announcements, total, isLoading, filters, fetchAnnouncements, createAnnouncement, deleteAnnouncement, updateFilter };
}
