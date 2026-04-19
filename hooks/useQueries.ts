'use client';
import { useState, useCallback } from 'react';
import type { Query, QueryFilters } from '@/types/frontend';
import * as queryService from '@/lib/services/queryService';
import { useToast } from '@/contexts/ToastContext';

export function useQueries(initialFilters: QueryFilters = {}) {
  const { showToast } = useToast();
  const [queries, setQueries] = useState<Query[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<QueryFilters>({ limit: 20, offset: 0, sortBy: 'recent', ...initialFilters });

  const fetchQueries = useCallback(async (overrides?: QueryFilters) => {
    setIsLoading(true);
    try {
      const result = await queryService.getQueries({ ...filters, ...overrides });
      setQueries(result.data ?? []);
      setTotal(result.total ?? 0);
    } catch (e: any) {
      showToast(e.message || 'Failed to load queries', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters, showToast]);

  const updateFilter = useCallback((updates: Partial<QueryFilters>) => {
    setFilters(prev => ({ ...prev, ...updates, offset: 0 }));
  }, []);

  const vote = useCallback(async (id: string, type: 'up' | 'down') => {
    try {
      if (type === 'up') await queryService.upvoteQuery(id);
      else await queryService.downvoteQuery(id);
      // Optimistically update vote counts by re-fetching
      await fetchQueries();
    } catch (e: any) {
      showToast(e.message || 'Failed to vote', 'error');
    }
  }, [fetchQueries, showToast]);

  const deleteQuery = useCallback(async (id: string) => {
    try {
      await queryService.deleteQuery(id);
      setQueries(prev => prev.filter(q => q.id !== id));
      showToast('Query deleted', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to delete', 'error');
    }
  }, [showToast]);

  return { queries, total, isLoading, filters, fetchQueries, updateFilter, vote, deleteQuery };
}
