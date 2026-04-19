'use client';
import { useState, useCallback } from 'react';
import type { Reply, CreateReplyPayload } from '@/types/frontend';
import * as replyService from '@/lib/services/replyService';
import { useToast } from '@/contexts/ToastContext';

export function useReplies(queryId: string) {
  const { showToast } = useToast();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReplies = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await replyService.getReplies(queryId);
      setReplies(result.replies ?? []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load replies', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [queryId, showToast]);

  const postReply = useCallback(async (payload: CreateReplyPayload) => {
    const isNested = !!payload.parentId;
    try {
      if (isNested) {
        await replyService.createReplyToReply(queryId, payload);
      } else {
        await replyService.createReply(payload);
      }
      await fetchReplies();
      showToast('Reply posted', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to post reply', 'error');
      throw e;
    }
  }, [queryId, fetchReplies, showToast]);

  const vote = useCallback(async (replyId: string, type: 'up' | 'down') => {
    try {
      if (type === 'up') await replyService.upvoteReply(replyId);
      else await replyService.downvoteReply(replyId);
      // Optimistic update
      const updateVotes = (items: Reply[]): Reply[] =>
        items.map(r => {
          if (r.id === replyId) {
            return {
              ...r,
              netVotes: type === 'up' ? r.netVotes + 1 : r.netVotes - 1,
            };
          }
          if (r.children?.length) {
            return { ...r, children: updateVotes(r.children) };
          }
          return r;
        });
      setReplies(prev => updateVotes(prev));
    } catch (e: any) {
      showToast(e.message || 'Failed to vote', 'error');
    }
  }, [showToast]);

  return { replies, isLoading, fetchReplies, postReply, vote };
}
