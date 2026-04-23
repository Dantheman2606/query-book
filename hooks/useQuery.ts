'use client';
import { useState, useCallback } from 'react';
import type { Query } from '@/types/frontend';
import * as queryService from '@/lib/services/queryService';
import { useToast } from '@/contexts/ToastContext';

export function useQuery(id: string) {
  const { showToast } = useToast();
  const [query, setQuery] = useState<Query | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userVote, setUserVote] = useState<'UPVOTE' | 'DOWNVOTE' | null>(null);

  const fetchQuery = useCallback(async () => {
    setIsLoading(true);
    try {
      const { query: q } = await queryService.getQueryById(id);
      setQuery(q);
      // Also fetch vote status
      try {
        const votes = await queryService.getQueryVotes(id);
        if (votes.userVote === 'UPVOTE') setUserVote('UPVOTE');
        else if (votes.userVote === 'DOWNVOTE') setUserVote('DOWNVOTE');
        else setUserVote(null);
      } catch { /* vote endpoint may not exist */ }
    } catch (e: any) {
      showToast(e.message || 'Failed to load query', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast]);

  const vote = useCallback(async (type: 'up' | 'down') => {
    if (!query) return;
    try {
      if (type === 'up') {
        await queryService.upvoteQuery(id);
        setQuery(prev => prev ? {
          ...prev,
          upvotes: userVote === 'UPVOTE' ? prev.upvotes - 1 : prev.upvotes + 1,
          downvotes: userVote === 'DOWNVOTE' ? prev.downvotes - 1 : prev.downvotes,
        } : prev);
        setUserVote(prev => prev === 'UPVOTE' ? null : 'UPVOTE');
      } else {
        await queryService.downvoteQuery(id);
        setQuery(prev => prev ? {
          ...prev,
          downvotes: userVote === 'DOWNVOTE' ? prev.downvotes - 1 : prev.downvotes + 1,
          upvotes: userVote === 'UPVOTE' ? prev.upvotes - 1 : prev.upvotes,
        } : prev);
        setUserVote(prev => prev === 'DOWNVOTE' ? null : 'DOWNVOTE');
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to vote', 'error');
    }
  }, [query, id, userVote, showToast]);

  return { query, isLoading, userVote, fetchQuery, vote };
}
