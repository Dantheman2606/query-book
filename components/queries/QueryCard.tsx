'use client';
import Link from 'next/link';
import { ArrowUp, ArrowDown, MessageSquare, Clock, Trash2 } from 'lucide-react';
import type { Query } from '@/types/frontend';
import Avatar from '@/components/ui/Avatar';
import TagBadge from '@/components/tags/TagBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { clsx } from 'clsx';
import { formatDistanceToNow } from './timeUtils';

interface QueryCardProps {
  query: Query;
  userVote?: 'UPVOTE' | 'DOWNVOTE' | null;
  onVote?: (id: string, type: 'up' | 'down') => void;
  onDelete?: (id: string) => void;
  onTagFilter?: (tagId: string) => void;
}

export default function QueryCard({ query, userVote, onVote, onDelete, onTagFilter }: QueryCardProps) {
  const { user } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const netVotes = (query.upvotes ?? 0) - (query.downvotes ?? 0);
  const canDelete = user?.id === query.userId || user?.role === 'admin';

  return (
    <>
      <article className="card p-4 flex gap-3 hover:shadow-md transition-shadow duration-200 group">
        {/* Vote Column */}
        <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0 w-8">
          <button
            onClick={() => onVote?.(query.id, 'up')}
            className={clsx(
              'vote-btn text-gray-400 hover:text-brand-500',
              userVote === 'UPVOTE' &&
                'text-brand-600 bg-brand-100 hover:text-brand-700 hover:bg-brand-200 dark:text-brand-300 dark:bg-brand-900/40 dark:hover:bg-brand-900/60'
            )}
            aria-label="Upvote"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <span
            className={clsx(
              'text-xs font-semibold tabular-nums',
              netVotes > 0
                ? 'text-brand-600 dark:text-brand-400'
                : netVotes < 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-gray-400 dark:text-gray-500'
            )}
          >
            {netVotes}
          </span>
          <button
            onClick={() => onVote?.(query.id, 'down')}
            className={clsx(
              'vote-btn text-gray-400 hover:text-rose-500',
              userVote === 'DOWNVOTE' &&
                'text-rose-600 bg-rose-100 hover:text-rose-700 hover:bg-rose-200 dark:text-rose-300 dark:bg-rose-900/40 dark:hover:bg-rose-900/60'
            )}
            aria-label="Downvote"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start gap-2 justify-between mb-1">
            <Link
              href={`/queries/${query.id}`}
              className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors line-clamp-2 flex-1"
            >
              {query.title}
            </Link>
            {canDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Preview */}
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{query.content}</p>

          {/* Tags */}
          {query.tags && query.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-2">
              {query.tags.map(qt => (
                <TagBadge
                  key={qt.tagId}
                  name={qt.tag.name}
                  onClick={onTagFilter ? () => onTagFilter(qt.tagId) : undefined}
                />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            <div className="flex items-center gap-1.5">
              <Avatar name={query.postedBy} size="xs" />
              <span>{query.postedBy}</span>
            </div>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(query.datePosted)}
            </span>
            <Link
              href={`/queries/${query.id}`}
              className="flex items-center gap-1 hover:text-brand-500 transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              <span>{query.replies?.length ?? query._count?.replies ?? 0} replies</span>
            </Link>
          </div>
        </div>
      </article>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => { onDelete?.(query.id); setConfirmDelete(false); }}
        title="Delete query?"
        message="This will permanently delete this query and all its replies."
      />
    </>
  );
}
