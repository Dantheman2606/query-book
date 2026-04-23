'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/contexts/ToastContext';
import { useUsers } from '@/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';
import { promoteUserToFaculty } from '@/lib/services/adminService';

export default function AdminUsersPage() {
  const { users, total, isLoading, fetchUsers } = useUsers();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const PAGE_LIMIT = 10;

  useEffect(() => {
    fetchUsers({ search: debouncedSearch, limit: PAGE_LIMIT, offset: 0 });
  }, [fetchUsers, debouncedSearch]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return users;

    return users.filter((user) => {
      const haystack = `${user.name} ${user.email} ${user.role}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [users, search]);

  const handlePromote = async (id: string) => {
    setPromotingId(id);
    try {
      await promoteUserToFaculty(id);
      showToast('User promoted to faculty', 'success');
      await fetchUsers({ search: debouncedSearch, limit: PAGE_LIMIT, offset: 0 });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to promote user', 'error');
    } finally {
      setPromotingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Role Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Promote student accounts to faculty for announcement and moderation privileges.
        </p>
      </header>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
        placeholder="Search users by name or email..."
      />

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Showing up to {PAGE_LIMIT} users{debouncedSearch.trim() ? ` matching "${debouncedSearch.trim()}"` : ''}.
        {total > PAGE_LIMIT ? ' Refine search to find specific users.' : ''}
      </p>

      {isLoading ? (
        <Spinner className="py-12" label="Loading users..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<UserPlus className="h-5 w-5" />}
          title="No users found"
          description="Try a different name or email search query."
        />
      ) : (
        <div className="card divide-y divide-gray-100 dark:divide-gray-700/60 overflow-hidden">
          {filtered.map((user) => {
            const canPromote = user.role === 'student' && user.isActive;

            return (
              <div key={user.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge role={user.role} className="capitalize">
                      {user.role}
                    </Badge>
                    {!user.isActive && <Badge variant="rose">Inactive</Badge>}
                    {!user.isVerified && <Badge variant="amber">Unverified</Badge>}
                  </div>
                </div>

                <Button
                  size="sm"
                  leftIcon={<UserPlus className="w-4 h-4" />}
                  isLoading={promotingId === user.id}
                  disabled={!canPromote || promotingId === user.id}
                  onClick={() => handlePromote(user.id)}
                >
                  Promote to Faculty
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
