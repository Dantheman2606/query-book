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
      const result = await queryService.getQueries({ ...filters, ...overrides }) as any;
      setQueries(result.queries || result.data || []);
      setTotal(result.pagination?.total ?? result.total ?? 0);
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
      const result = type === 'up'
        ? await queryService.upvoteQuery(id)
        : await queryService.downvoteQuery(id);

      setQueries(prev =>
        prev.map(query =>
          query.id === id
            ? {
                ...query,
                upvotes: result.upvotes,
                downvotes: result.downvotes,
              }
            : query
        )
      );
    } catch (e: any) {
      showToast(e.message || 'Failed to vote', 'error');
    }
  }, [showToast]);

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
