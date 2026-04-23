'use client';
import type { Query } from '@/types/frontend';
import QueryCard from './QueryCard';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { Search } from 'lucide-react';

interface QueryListProps {
  queries: Query[];
  isLoading: boolean;
  onVote?: (id: string, type: 'up' | 'down') => void;
  onDelete?: (id: string) => void;
  onTagFilter?: (tagId: string) => void;
}

function QuerySkeleton() {
  return (
    <div className="card p-4 flex gap-3 animate-pulse">
      <div className="flex flex-col items-center gap-1 w-8 pt-0.5">
        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-4 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="flex gap-2 mt-3">
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function QueryList({ queries, isLoading, onVote, onDelete, onTagFilter }: QueryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <QuerySkeleton key={i} />)}
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <EmptyState
        icon={<Search className="w-6 h-6" />}
        title="No queries found"
        description="Be the first to ask a question — the community is waiting!"
      />
    );
  }

  return (
    <div className="space-y-3">
      {queries.map(q => (
        <QueryCard
          key={q.id}
          query={q}
          onVote={onVote}
          onDelete={onDelete}
          onTagFilter={onTagFilter}
        />
      ))}
    </div>
  );
}
