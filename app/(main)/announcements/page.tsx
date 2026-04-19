'use client';
import { useEffect, useState } from 'react';
import { Megaphone, Plus, Search } from 'lucide-react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useAuth } from '@/contexts/AuthContext';
import AnnouncementCard from '@/components/announcements/AnnouncementCard';
import CreateAnnouncementForm from '@/components/announcements/CreateAnnouncementForm';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { useDebounce } from '@/hooks/useDebounce';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
];

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const { announcements, total, isLoading, filters, fetchAnnouncements, deleteAnnouncement, updateFilter } = useAnnouncements();
  const [createOpen, setCreateOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    fetchAnnouncements();
  // eslint-disable-next-line
  }, [filters.search, filters.sortBy, filters.offset]);

  useEffect(() => {
    updateFilter({ search: debouncedSearch || undefined });
  // eslint-disable-next-line
  }, [debouncedSearch]);

  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-violet-500" />
            Announcements
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {isFaculty
              ? 'Post important updates for your students'
              : 'Stay up-to-date with the latest notices from faculty'}
          </p>
        </div>
        {isFaculty && (
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setCreateOpen(true)}
          >
            New Announcement
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Input
          placeholder="Search announcements…"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          wrapperClassName="flex-1"
        />
        <Select
          options={SORT_OPTIONS}
          value={filters.sortBy || 'recent'}
          onChange={e => updateFilter({ sortBy: e.target.value as any })}
          wrapperClassName="w-48 shrink-0"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <Spinner className="py-12" label="Loading announcements…" />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="w-6 h-6" />}
          title="No announcements yet"
          description={isFaculty ? 'Create the first announcement for your students.' : 'No announcements have been posted yet.'}
          action={isFaculty ? (
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setCreateOpen(true)}>
              Create Announcement
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <AnnouncementCard key={a.id} announcement={a} onDelete={deleteAnnouncement} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        total={total}
        limit={filters.limit ?? 20}
        offset={filters.offset ?? 0}
        onOffset={o => updateFilter({ offset: o })}
      />

      {/* Create modal */}
      <CreateAnnouncementForm
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={fetchAnnouncements}
      />
    </div>
  );
}
