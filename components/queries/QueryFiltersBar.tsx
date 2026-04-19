'use client';
import { useEffect } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import TagBadge from '@/components/tags/TagBadge';
import type { Tag, QueryFilters } from '@/types/frontend';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useState } from 'react';
import { clsx } from 'clsx';

interface QueryFiltersBarProps {
  filters: QueryFilters;
  tags: Tag[];
  onSearch: (v: string) => void;
  onSort: (v: 'recent' | 'popular' | 'trending') => void;
  onTagToggle: (id: string) => void;
}

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' },
];

export default function QueryFiltersBar({
  filters, tags, onSearch, onSort, onTagToggle,
}: QueryFiltersBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    onSearch(debouncedSearch);
  // eslint-disable-next-line
  }, [debouncedSearch]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Search queries…"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          wrapperClassName="flex-1"
        />
        <Select
          options={SORT_OPTIONS}
          value={filters.sortBy || 'recent'}
          onChange={e => onSort(e.target.value as any)}
          wrapperClassName="w-48 shrink-0"
        />
      </div>

      {/* Tag filter chips */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <TagBadge
              key={tag.id}
              name={tag.name}
              active={filters.tags?.includes(tag.id)}
              onClick={() => onTagToggle(tag.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
