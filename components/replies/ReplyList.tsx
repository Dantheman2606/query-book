'use client';
import { useState } from 'react';
import type { Reply, CreateReplyPayload } from '@/types/frontend';
import ReplyCard from './ReplyCard';
import ReplyForm from './ReplyForm';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { MessageSquare } from 'lucide-react';

interface ReplyListProps {
  replies: Reply[];
  queryId: string;
  isLoading: boolean;
  onVote: (id: string, type: 'up' | 'down') => void;
  onPost: (payload: CreateReplyPayload) => Promise<void>;
}

export default function ReplyList({ replies, queryId, isLoading, onVote, onPost }: ReplyListProps) {
  // Tracks which thread we're replying to (null = top-level)
  const [replyingTo, setReplyingTo] = useState<{ id: string; author: string } | null>(null);

  const handleReply = (parentId: string, parentAuthor: string) => {
    setReplyingTo({ id: parentId, author: parentAuthor });
  };

  const handlePost = async (content: string, parentId?: string | null) => {
    await onPost({ content, queryId, parentId });
    setReplyingTo(null);
  };

  if (isLoading) {
    return <Spinner className="py-8" label="Loading replies…" />;
  }

  return (
    <div className="space-y-1">
      {/* Top-level reply form */}
      <ReplyForm
        placeholder="Share your answer or thoughts…"
        onSubmit={content => handlePost(content, null)}
        replyingTo={null}
        onCancelReply={() => {}}
      />

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        {replies.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="w-5 h-5" />}
            title="No replies yet"
            description="Be the first to answer this question"
          />
        ) : (
          <div className="space-y-0">
            {replies.map(reply => (
              <div key={reply.id}>
                <ReplyCard
                  reply={reply}
                  depth={0}
                  onVote={onVote}
                  onReply={handleReply}
                />
                {/* Inline reply form for nested */}
                {replyingTo?.id === reply.id && (
                  <div className="ml-10 mb-3">
                    <ReplyForm
                      placeholder={`Replying to ${replyingTo.author}…`}
                      onSubmit={content => handlePost(content, replyingTo.id)}
                      replyingTo={replyingTo.author}
                      onCancelReply={() => setReplyingTo(null)}
                      autoFocus
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
