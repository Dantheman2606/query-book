'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { Plus, HelpCircle, Compass, Flame, Filter, ChartNoAxesColumn } from 'lucide-react';
import { useQueries } from '@/hooks/useQueries';
import { useTags } from '@/hooks/useTags';
import { useAuth } from '@/contexts/AuthContext';
import QueryList from '@/components/queries/QueryList';
import QueryFiltersBar from '@/components/queries/QueryFiltersBar';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';

export default function QueriesPage() {
  const { user } = useAuth();
  const { queries, total, isLoading, filters, userVotes, fetchQueries, updateFilter, vote, deleteQuery } = useQueries();
  const { tags, fetchSelectableTags } = useTags();

  useEffect(() => {
    fetchQueries();
    fetchSelectableTags();
  // eslint-disable-next-line
  }, [filters.search, filters.sortBy, filters.tags, filters.offset]);

  const handleSearch = (v: string) => updateFilter({ search: v || undefined });
  const handleSort = (v: 'recent' | 'popular' | 'trending') => updateFilter({ sortBy: v });
  const handleTagToggle = (id: string) =>
    updateFilter({
      tags: filters.tags?.includes(id)
        ? filters.tags.filter(t => t !== id)
        : [...(filters.tags || []), id],
    });

  const selectedTagIds = filters.tags || [];
  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));
  const topTags = [...tags].slice(0, 6);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)_280px] 2xl:grid-cols-[280px_minmax(0,1fr)_300px] gap-5 xl:gap-6 items-start">
        {/* Left rail */}
        <aside className="hidden xl:block sticky top-20 space-y-3">
          <div className="card p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-brand-500" />
              Explore
            </p>
            <div className="space-y-1.5">
              <button
                onClick={() => updateFilter({ sortBy: 'recent' })}
                className="w-full text-left px-2.5 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Most Recent
              </button>
              <button
                onClick={() => updateFilter({ sortBy: 'popular' })}
                className="w-full text-left px-2.5 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Most Popular
              </button>
              <button
                onClick={() => updateFilter({ sortBy: 'trending' })}
                className="w-full text-left px-2.5 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Trending
              </button>
            </div>
          </div>

          <div className="card p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-brand-500" />
              Active Filters
            </p>
            {selectedTags.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500">No tag filters selected.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className="px-2 py-1 rounded-md text-[11px] font-medium bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-900/50"
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main feed */}
        <div className="space-y-5 min-w-0">
          {/* Page header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-brand-500" />
                Queries
              </h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                {total > 0 ? `${total} question${total === 1 ? '' : 's'}` : 'Ask anything — the community is here to help'}
              </p>
            </div>
            {user && (
              <Link href="/queries/create">
                <Button leftIcon={<Plus className="w-4 h-4" />}>
                  Ask Question
                </Button>
              </Link>
            )}
          </div>

          {/* Filters */}
          <QueryFiltersBar
            filters={filters}
            tags={tags}
            onSearch={handleSearch}
            onSort={handleSort}
            onTagToggle={handleTagToggle}
          />

          {/* List */}
          <QueryList
            queries={queries}
            isLoading={isLoading}
            userVotes={userVotes}
            onVote={vote}
            onDelete={deleteQuery}
            onTagFilter={handleTagToggle}
          />

          {/* Pagination */}
          <Pagination
            total={total}
            limit={filters.limit ?? 20}
            offset={filters.offset ?? 0}
            onOffset={o => updateFilter({ offset: o })}
          />
        </div>

        {/* Right rail */}
        <aside className="hidden xl:block sticky top-20 space-y-3">
          <div className="card p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <ChartNoAxesColumn className="w-3.5 h-3.5 text-brand-500" />
              Feed Snapshot
            </p>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-2.5">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{queries.length}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">Visible</p>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-2.5">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{total}</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">Total</p>
              </div>
            </div>
          </div>

          <div className="card p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-brand-500" />
              Top Tags
            </p>
            <div className="space-y-1">
              {topTags.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500">No tags available yet.</p>
              ) : (
                topTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    #{tag.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

    </div>
  );
}
