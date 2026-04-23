'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Trash2, Tags } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useTags } from '@/hooks/useTags';
import { useDebounce } from '@/hooks/useDebounce';

export default function AdminTagsPage() {
  const { tags, isLoading, fetchAllTags, createTag, deleteTag } = useTags();
  const [search, setSearch] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newTagError, setNewTagError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchAllTags(debouncedSearch);
  }, [fetchAllTags, debouncedSearch]);

  const filteredTags = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    if (!q) return tags;
    return tags.filter((tag) => tag.name.toLowerCase().includes(q));
  }, [tags, debouncedSearch]);

  const handleCreateTag = async () => {
    if (!newTag.trim()) {
      setNewTagError('Tag name is required');
      return;
    }

    setNewTagError('');
    setIsCreating(true);
    try {
      await createTag(newTag.trim());
      setNewTag('');
      await fetchAllTags(debouncedSearch);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!deleteTarget) return;
    await deleteTag(deleteTarget.id, deleteTarget.name);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tag Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create new tags and remove outdated tags used across queries.
        </p>
      </header>

      <div className="card p-4">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Add Tag</p>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="e.g. ai-ethics"
            error={newTagError}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
            wrapperClassName="flex-1"
          />
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            isLoading={isCreating}
            onClick={handleCreateTag}
          >
            Add
          </Button>
        </div>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
        placeholder="Search tags..."
      />

      {isLoading ? (
        <Spinner className="py-10" label="Loading tags..." />
      ) : filteredTags.length === 0 ? (
        <EmptyState
          icon={<Tags className="w-5 h-5" />}
          title="No tags found"
          description="Try a different search or add a new tag."
        />
      ) : (
        <div className="card divide-y divide-gray-100 dark:divide-gray-700/60 overflow-hidden">
          {filteredTags.map((tag) => (
            <div key={tag.id} className="px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">#{tag.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Used in {tag.queryCount ?? 0} queries
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => setDeleteTarget({ id: tag.id, name: tag.name })}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTag}
        title={`Delete #${deleteTarget?.name}?`}
        message="This will remove the tag. Queries will no longer be associated with it."
      />
    </div>
  );
}
