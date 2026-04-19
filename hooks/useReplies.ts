'use client';
import { useState, useCallback } from 'react';
import type { Reply, CreateReplyPayload } from '@/types/frontend';
import * as replyService from '@/lib/services/replyService';
import { useToast } from '@/contexts/ToastContext';

export function useReplies(queryId: string) {
  const { showToast } = useToast();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, 'UPVOTE' | 'DOWNVOTE' | null>>({});
  const [pendingVotes, setPendingVotes] = useState<Record<string, boolean>>({});

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
        await replyService.createReplyToReply(payload.parentId!, payload);
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
    if (pendingVotes[replyId]) return;

    const previousVote = userVotes[replyId] ?? null;
    let previousReply: Reply | null = null;

    const findReply = (items: Reply[]): Reply | null => {
      for (const item of items) {
        if (item.id === replyId) return item;
        if (item.children?.length) {
          const found = findReply(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const updateReply = (
      items: Reply[],
      updater: (reply: Reply) => Reply
    ): Reply[] =>
      items.map(item => {
        if (item.id === replyId) return updater(item);
        if (item.children?.length) {
          return { ...item, children: updateReply(item.children, updater) };
        }
        return item;
      });

    const applyTransition = (reply: Reply, voteType: 'up' | 'down', currentVote: 'UPVOTE' | 'DOWNVOTE' | null) => {
      let netVotes = reply.netVotes;
      let nextVote: 'UPVOTE' | 'DOWNVOTE' | null = currentVote;

      if (voteType === 'up') {
        if (currentVote === 'UPVOTE') {
          netVotes -= 1;
          nextVote = null;
        } else if (currentVote === 'DOWNVOTE') {
          netVotes += 2;
          nextVote = 'UPVOTE';
        } else {
          netVotes += 1;
          nextVote = 'UPVOTE';
        }
      } else {
        if (currentVote === 'DOWNVOTE') {
          netVotes += 1;
          nextVote = null;
        } else if (currentVote === 'UPVOTE') {
          netVotes -= 2;
          nextVote = 'DOWNVOTE';
        } else {
          netVotes -= 1;
          nextVote = 'DOWNVOTE';
        }
      }

      return { netVotes, nextVote };
    };

    setPendingVotes(prev => ({ ...prev, [replyId]: true }));

    try {
      setReplies(prev => {
        previousReply = findReply(prev);
        return updateReply(prev, (reply) => {
          const { netVotes, nextVote } = applyTransition(reply, type, previousVote);
          setUserVotes(v => ({ ...v, [replyId]: nextVote }));
          return { ...reply, netVotes };
        });
      });

      const result = type === 'up'
        ? await replyService.upvoteReply(replyId)
        : await replyService.downvoteReply(replyId);

      setReplies(prev =>
        updateReply(prev, (reply) => ({
          ...reply,
          netVotes: result.upvotes - result.downvotes,
        }))
      );
      setUserVotes(prev => ({ ...prev, [replyId]: result.userVote }));
    } catch (e: any) {
      if (previousReply) {
        setReplies(prev =>
          updateReply(prev, () => previousReply!)
        );
      }
      setUserVotes(prev => ({ ...prev, [replyId]: previousVote }));
      showToast(e.message || 'Failed to vote', 'error');
    } finally {
      setPendingVotes(prev => ({ ...prev, [replyId]: false }));
    }
  }, [pendingVotes, showToast, userVotes]);

  return { replies, isLoading, fetchReplies, postReply, vote };
}
