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
  const [userVotes, setUserVotes] = useState<Record<string, 'UPVOTE' | 'DOWNVOTE' | null>>({});
  const [pendingVotes, setPendingVotes] = useState<Record<string, boolean>>({});
  const [filters, setFilters] = useState<QueryFilters>({ limit: 20, offset: 0, sortBy: 'recent', ...initialFilters });

  const fetchQueries = useCallback(async (overrides?: QueryFilters) => {
    setIsLoading(true);
    try {
      const result = await queryService.getQueries({ ...filters, ...overrides }) as any;
      const loadedQueries = result.queries || result.data || [];
      setQueries(loadedQueries);
      setTotal(result.pagination?.total ?? result.total ?? 0);

      if (loadedQueries.length === 0) {
        setUserVotes({});
      } else {
        const voteEntries = await Promise.all(
          loadedQueries.map(async (query: Query) => {
            try {
              const voteStatus = await queryService.getQueryVotes(query.id);
              const userVote =
                voteStatus.userVote === 'UPVOTE' || voteStatus.userVote === 'DOWNVOTE'
                  ? voteStatus.userVote
                  : null;
              return [query.id, userVote] as const;
            } catch {
              return [query.id, null] as const;
            }
          })
        );

        setUserVotes((prev) => ({
          ...prev,
          ...Object.fromEntries(voteEntries),
        }));
      }
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
    if (pendingVotes[id]) return;

    const previousVote = userVotes[id] ?? null;
    let previousQuery: Query | null = null;

    const applyTransition = (query: Query, voteType: 'up' | 'down', currentVote: 'UPVOTE' | 'DOWNVOTE' | null) => {
      let upvotes = query.upvotes ?? 0;
      let downvotes = query.downvotes ?? 0;
      let nextVote: 'UPVOTE' | 'DOWNVOTE' | null = currentVote;

      if (voteType === 'up') {
        if (currentVote === 'UPVOTE') {
          upvotes = Math.max(0, upvotes - 1);
          nextVote = null;
        } else if (currentVote === 'DOWNVOTE') {
          downvotes = Math.max(0, downvotes - 1);
          upvotes += 1;
          nextVote = 'UPVOTE';
        } else {
          upvotes += 1;
          nextVote = 'UPVOTE';
        }
      } else {
        if (currentVote === 'DOWNVOTE') {
          downvotes = Math.max(0, downvotes - 1);
          nextVote = null;
        } else if (currentVote === 'UPVOTE') {
          upvotes = Math.max(0, upvotes - 1);
          downvotes += 1;
          nextVote = 'DOWNVOTE';
        } else {
          downvotes += 1;
          nextVote = 'DOWNVOTE';
        }
      }

      return { upvotes, downvotes, nextVote };
    };

    const getNextVote = (voteType: 'up' | 'down', currentVote: 'UPVOTE' | 'DOWNVOTE' | null) => {
      if (voteType === 'up') return currentVote === 'UPVOTE' ? null : 'UPVOTE';
      return currentVote === 'DOWNVOTE' ? null : 'DOWNVOTE';
    };

    setPendingVotes(prev => ({ ...prev, [id]: true }));

    try {
      const optimisticVote = getNextVote(type, previousVote);

      setUserVotes(prev => ({ ...prev, [id]: optimisticVote }));

      setQueries(prev =>
        prev.map(query => {
          if (query.id !== id) return query;

          previousQuery = query;
          const { upvotes, downvotes } = applyTransition(query, type, previousVote);

          return {
            ...query,
            upvotes,
            downvotes,
          };
        })
      );

      const result = type === 'up'
        ? await queryService.upvoteQuery(id)
        : await queryService.downvoteQuery(id);

      setQueries(prev =>
        prev.map(query =>
          query.id === id
            ? { ...query, upvotes: result.upvotes, downvotes: result.downvotes }
            : query
        )
      );
      setUserVotes(prev => ({ ...prev, [id]: result.userVote }));
    } catch (e: any) {
      if (previousQuery) {
        setQueries(prev =>
          prev.map(query => (query.id === id ? previousQuery! : query))
        );
      }
      setUserVotes(prev => ({ ...prev, [id]: previousVote }));
      showToast(e.message || 'Failed to vote', 'error');
    } finally {
      setPendingVotes(prev => ({ ...prev, [id]: false }));
    }
  }, [pendingVotes, showToast, userVotes]);

  const deleteQuery = useCallback(async (id: string) => {
    try {
      await queryService.deleteQuery(id);
      setQueries(prev => prev.filter(q => q.id !== id));
      showToast('Query deleted', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to delete', 'error');
    }
  }, [showToast]);

  return { queries, total, isLoading, filters, userVotes, fetchQueries, updateFilter, vote, deleteQuery };
}
