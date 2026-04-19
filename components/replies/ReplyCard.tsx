'use client';
import { useState } from 'react';
import { ArrowUp, ArrowDown, MessageSquare, ChevronDown } from 'lucide-react';
import type { Reply } from '@/types/frontend';
import Avatar from '@/components/ui/Avatar';
import { formatDistanceToNow } from '@/components/queries/timeUtils';
import { useAuth } from '@/contexts/AuthContext';
import { clsx } from 'clsx';

interface ReplyCardProps {
  reply: Reply;
  depth?: number;
  onVote: (id: string, type: 'up' | 'down') => void;
  onReply: (parentId: string, parentAuthor: string) => void;
}

const MAX_DEPTH = 6; // Stop indenting past this

export default function ReplyCard({ reply, depth = 0, onVote, onReply }: ReplyCardProps) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const hasChildren = reply.children && reply.children.length > 0;
  const indentStyle = depth > 0 ? { marginLeft: `${Math.min(depth, MAX_DEPTH) * 20}px` } : {};

  return (
    <div style={indentStyle} className="relative">
      {/* Thread indent line (for nested) */}
      {depth > 0 && (
        <div
          className="thread-line"
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? 'Expand' : 'Collapse thread'}
        />
      )}

      <div className={clsx('pl-4 pb-2', depth > 0 && 'pl-5')}>
        {/* Reply body */}
        <div className="flex gap-2 group">
          <Avatar name={reply.postedBy} size="xs" className="mt-0.5 shrink-0" />

          <div className="flex-1 min-w-0">
            {/* Author + time */}
            <div className="flex items-baseline gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                {reply.postedBy}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {formatDistanceToNow(reply.datePosted)}
              </span>
            </div>

            {/* Content */}
            {!collapsed && (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {reply.content}
              </p>
            )}

            {/* Actions row */}
            <div className="flex items-center gap-3 mt-1.5">
              {/* Vote */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => onVote(reply.id, 'up')}
                  className="vote-btn text-gray-400 hover:text-brand-500 h-6 w-6"
                  aria-label="Upvote"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <span
                  className={clsx(
                    'text-xs font-semibold tabular-nums w-6 text-center',
                    reply.netVotes > 0
                      ? 'text-brand-600 dark:text-brand-400'
                      : reply.netVotes < 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-gray-400 dark:text-gray-500'
                  )}
                >
                  {reply.netVotes}
                </span>
                <button
                  onClick={() => onVote(reply.id, 'down')}
                  className="vote-btn text-gray-400 hover:text-rose-500 h-6 w-6"
                  aria-label="Downvote"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reply button */}
              {user && (
                <button
                  onClick={() => onReply(reply.id, reply.postedBy)}
                  className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  Reply
                </button>
              )}

              {/* Collapse toggle */}
              {hasChildren && (
                <button
                  onClick={() => setCollapsed(v => !v)}
                  className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <ChevronDown className={clsx('w-3 h-3 transition-transform', collapsed && '-rotate-90')} />
                  {collapsed ? `Show ${reply.children!.length} repl${reply.children!.length === 1 ? 'y' : 'ies'}` : 'Collapse'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Recursive children */}
        {!collapsed && hasChildren && (
          <div className="mt-2">
            {reply.children!.map(child => (
              <ReplyCard
                key={child.id}
                reply={child}
                depth={depth + 1}
                onVote={onVote}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
