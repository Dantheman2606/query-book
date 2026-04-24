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
  const [isVotePending, setIsVotePending] = useState(false);

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
    if (!query || isVotePending) return;

    const previousQuery = query;
    const previousVote = userVote;

    const applyTransition = (current: Query, voteType: 'up' | 'down', currentVote: 'UPVOTE' | 'DOWNVOTE' | null) => {
      let upvotes = current.upvotes ?? 0;
      let downvotes = current.downvotes ?? 0;
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

    const optimistic = applyTransition(query, type, previousVote);

    setIsVotePending(true);
    setUserVote(optimistic.nextVote);
    setQuery(prev =>
      prev
        ? {
            ...prev,
            upvotes: optimistic.upvotes,
            downvotes: optimistic.downvotes,
          }
        : prev
    );

    try {
      const result = type === 'up'
        ? await queryService.upvoteQuery(id)
        : await queryService.downvoteQuery(id);

      setQuery(prev =>
        prev
          ? {
              ...prev,
              upvotes: result.upvotes,
              downvotes: result.downvotes,
            }
          : prev
      );
      setUserVote(result.userVote);
    } catch (e: any) {
      setQuery(previousQuery);
      setUserVote(previousVote);
      showToast(e.message || 'Failed to vote', 'error');
    } finally {
      setIsVotePending(false);
    }
  }, [query, id, userVote, isVotePending, showToast]);

  return { query, isLoading, userVote, fetchQuery, vote };
}
