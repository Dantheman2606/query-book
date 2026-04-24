'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUp, ArrowDown, Clock, Tag } from 'lucide-react';
import { useQuery } from '@/hooks/useQuery';
import { useReplies } from '@/hooks/useReplies';
import { useAuth } from '@/contexts/AuthContext';
import Avatar from '@/components/ui/Avatar';
import TagBadge from '@/components/tags/TagBadge';
import ReplyList from '@/components/replies/ReplyList';
import { PageSpinner } from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { formatDistanceToNow } from '@/components/queries/timeUtils';
import { clsx } from 'clsx';

export default function QueryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { query, isLoading, userVote, fetchQuery, vote } = useQuery(params.id);
  const { replies, isLoading: repliesLoading, userVotes: replyUserVotes, fetchReplies, postReply, vote: voteReply } = useReplies(params.id);

  useEffect(() => {
    fetchQuery();
    fetchReplies();
  // eslint-disable-next-line
  }, []);

  if (isLoading) return <PageSpinner />;
  if (!query) return (
    <div className="text-center py-20 text-gray-400">Query not found.</div>
  );

  const netVotes = (query.upvotes ?? 0) - (query.downvotes ?? 0);

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.back()}>
        Back
      </Button>

      {/* Query Detail Card */}
      <article className="card p-6">
        {/* Vote + Title row */}
        <div className="flex gap-4">
          {/* Vote column */}
          <div className="flex flex-col items-center gap-1.5 shrink-0 w-10">
            <button
              onClick={() => vote('up')}
              className={clsx(
                'vote-btn text-gray-400 hover:text-brand-500',
                userVote === 'UPVOTE' &&
                  'text-brand-600 bg-brand-100 hover:text-brand-700 hover:bg-brand-200 dark:text-brand-300 dark:bg-brand-900/40 dark:hover:bg-brand-900/60'
              )}
              aria-label="Upvote"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <span
              className={clsx(
                'text-sm font-bold tabular-nums',
                netVotes > 0 ? 'text-brand-600 dark:text-brand-400' :
                netVotes < 0 ? 'text-rose-600 dark:text-rose-400' :
                'text-gray-400 dark:text-gray-500'
              )}
            >
              {netVotes}
            </span>
            <button
              onClick={() => vote('down')}
              className={clsx(
                'vote-btn text-gray-400 hover:text-rose-500',
                userVote === 'DOWNVOTE' &&
                  'text-rose-600 bg-rose-100 hover:text-rose-700 hover:bg-rose-200 dark:text-rose-300 dark:bg-rose-900/40 dark:hover:bg-rose-900/60'
              )}
              aria-label="Downvote"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-3 leading-snug">
              {query.title}
            </h1>

            {/* Tags */}
            {query.tags && query.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {query.tags.map(qt => (
                  <TagBadge key={qt.tagId} name={qt.tag.name} />
                ))}
              </div>
            )}

            {/* Body */}
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {query.content}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
              <div className="flex items-center gap-1.5">
                <Avatar name={query.postedBy} size="xs" />
                <span className="font-medium text-gray-600 dark:text-gray-300">{query.postedBy}</span>
              </div>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(query.datePosted)}
                {query.isEdited && <span className="ml-1 italic">(edited)</span>}
              </span>
              <span>{query.upvotes} up / {query.downvotes} down</span>
            </div>
          </div>
        </div>
      </article>

      {/* Replies */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        <ReplyList
          replies={replies}
          queryId={params.id}
          isLoading={repliesLoading}
          userVotes={replyUserVotes}
          onVote={voteReply}
          onPost={postReply}
        />
      </section>
    </div>
  );
}
