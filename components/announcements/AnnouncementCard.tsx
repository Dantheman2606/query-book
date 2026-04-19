'use client';
import { Megaphone, Clock, Trash2 } from 'lucide-react';
import type { Announcement } from '@/types/frontend';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { formatDistanceToNow } from '@/components/queries/timeUtils';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface AnnouncementCardProps {
  announcement: Announcement;
  onDelete?: (id: string) => void;
}

export default function AnnouncementCard({ announcement, onDelete }: AnnouncementCardProps) {
  const { user } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const canDelete = user?.role === 'admin' || user?.id === announcement.userId;

  return (
    <>
      <article className="card p-5 group hover:shadow-md transition-shadow duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 shrink-0">
              <Megaphone className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{announcement.title}</h3>
          </div>
          {canDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Content */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap mb-4">
          {announcement.content}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
          <div className="flex items-center gap-1.5">
            <Avatar
              name={announcement.user?.name || announcement.postedBy}
              src={announcement.user?.avatarUrl || undefined}
              size="xs"
            />
            <span>{announcement.postedBy}</span>
            <Badge role="faculty" className="capitalize">Faculty</Badge>
          </div>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(announcement.datePosted)}
          </span>
        </div>
      </article>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => { onDelete?.(announcement.id); setConfirmDelete(false); }}
        title="Delete announcement?"
        message="This will permanently delete this announcement."
      />
    </>
  );
}
