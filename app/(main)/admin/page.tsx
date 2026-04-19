'use client';
import { useEffect, useState } from 'react';
import { Shield, Users, Tag, Plus, Trash2, Search } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useTags } from '@/hooks/useTags';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { formatDistanceToNow } from '@/components/queries/timeUtils';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { users, isLoading: usersLoading, fetchUsers, deleteUser } = useUsers();
  const { tags, isLoading: tagsLoading, fetchAllTags, createTag } = useTags();
  const [tab, setTab] = useState<'users' | 'tags'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [tagName, setTagName] = useState('');
  const [tagError, setTagError] = useState('');
  const [isTagLoading, setIsTagLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Guard: only admins
  useEffect(() => {
    if (user && user.role !== 'admin') router.replace('/queries');
  }, [user, router]);

  useEffect(() => {
    if (tab === 'users') fetchUsers();
    else fetchAllTags();
  // eslint-disable-next-line
  }, [tab]);

  const filteredUsers = users.filter(u =>
    !userSearch ||
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleCreateTag = async () => {
    if (!tagName.trim()) { setTagError('Tag name is required'); return; }
    setTagError('');
    setIsTagLoading(true);
    try {
      await createTag(tagName.trim());
      setTagName('');
    } finally {
      setIsTagLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
          <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500">Manage users and system data</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {(['users', 'tags'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize
              ${tab === t
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            {t === 'users' ? <Users className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
            {t}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="space-y-3">
          <Input
            placeholder="Search users…"
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          {usersLoading ? (
            <Spinner className="py-8" label="Loading users…" />
          ) : filteredUsers.length === 0 ? (
            <EmptyState icon={<Users className="w-5 h-5" />} title="No users found" />
          ) : (
            <div className="card divide-y divide-gray-100 dark:divide-gray-700/60 overflow-hidden">
              {filteredUsers.map(u => (
                <div key={u.id} className="flex items-center gap-3 px-4 py-3 group">
                  <Avatar name={u.name} src={u.avatarUrl || undefined} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge role={u.role} className="capitalize">{u.role}</Badge>
                    {!u.isVerified && <Badge variant="amber">Unverified</Badge>}
                    {!u.isActive && <Badge variant="rose">Inactive</Badge>}
                    <span className="text-xs text-gray-400 hidden sm:block">
                      Joined {formatDistanceToNow(u.createdAt)}
                    </span>
                    {u.id !== user?.id && (
                      <button
                        onClick={() => setDeleteTarget({ id: u.id, name: u.name })}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tags Tab */}
      {tab === 'tags' && (
        <div className="space-y-4">
          {/* Create tag */}
          <div className="card p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Create New Tag</p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. algorithms"
                value={tagName}
                onChange={e => setTagName(e.target.value)}
                error={tagError}
                onKeyDown={e => e.key === 'Enter' && handleCreateTag()}
                wrapperClassName="flex-1"
              />
              <Button isLoading={isTagLoading} leftIcon={<Plus className="w-4 h-4" />} onClick={handleCreateTag}>
                Create
              </Button>
            </div>
          </div>

          {/* Tag list */}
          {tagsLoading ? (
            <Spinner className="py-8" />
          ) : tags.length === 0 ? (
            <EmptyState icon={<Tag className="w-5 h-5" />} title="No tags yet" />
          ) : (
            <div className="card divide-y divide-gray-100 dark:divide-gray-700/60 overflow-hidden">
              {tags.map(t => (
                <div key={t.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">#{t.name}</span>
                    {t.queryCount != null && (
                      <span className="text-xs text-gray-400">{t.queryCount} queries</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await deleteUser(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title={`Delete ${deleteTarget?.name}?`}
        message="This will permanently delete the user account and all their data."
      />
    </div>
  );
}
