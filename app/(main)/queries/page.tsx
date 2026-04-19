'use client';
import { useEffect, useState } from 'react';
import { Plus, HelpCircle } from 'lucide-react';
import { useQueries } from '@/hooks/useQueries';
import { useTags } from '@/hooks/useTags';
import { useAuth } from '@/contexts/AuthContext';
import QueryList from '@/components/queries/QueryList';
import QueryFiltersBar from '@/components/queries/QueryFiltersBar';
import CreateQueryForm from '@/components/queries/CreateQueryForm';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';

export default function QueriesPage() {
  const { user } = useAuth();
  const { queries, total, isLoading, filters, fetchQueries, updateFilter, vote, deleteQuery } = useQueries();
  const { tags, fetchSelectableTags } = useTags();
  const [createOpen, setCreateOpen] = useState(false);

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

  return (
    <div className="space-y-5">
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
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
            Ask Question
          </Button>
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

      {/* Create modal */}
      <CreateQueryForm
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchQueries}
        tags={tags}
      />
    </div>
  );
}
