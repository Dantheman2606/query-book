'use client';
import { Megaphone, Clock, Trash2, AlertCircle } from 'lucide-react';
import type { Announcement } from '@/types/frontend';
import Avatar from '@/components/ui/Avatar';
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
      <article className="relative group overflow-hidden rounded-2xl p-6 lg:p-7 transition-all duration-300 bg-white dark:bg-[#111118] border-2 border-gray-300 dark:border-white shadow-md hover:shadow-lg hover:-translate-y-0.5">
        {/* Subtle gradient wash in background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 dark:bg-brand-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-inner shrink-0 mt-0.5">
                <Megaphone className="w-5 h-5 text-white animate-pulse-slow" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-500/20">
                    <AlertCircle className="w-3 h-3" /> Important Update
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {announcement.title}
                </h3>
              </div>
            </div>

            {canDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-500/20 transition-all shrink-0 z-20"
                aria-label="Delete announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="relative z-10 mb-6 pl-13 sm:pl-[52px]">
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-medium flex gap-3">
              {/* Decorative quote bar */}
              <span className="w-1 rounded-full bg-brand-200 dark:bg-brand-900/50 shrink-0 self-stretch my-1" />
              {announcement.content}
            </p>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-4 pl-13 sm:pl-[52px]">
            <div className="flex items-center gap-2.5">
              <Avatar
                name={announcement.user?.name || announcement.postedBy}
                src={announcement.user?.avatarUrl || undefined}
                size="sm"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold font-semibold text-gray-900 dark:text-gray-100 leading-none mb-1">
                  {announcement.postedBy}
                </span>
                <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                  Faculty Member
                </span>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 px-2.5 py-1.5 rounded-lg border border-gray-100 dark:border-white/5">
              <Clock className="w-3.5 h-3.5" />
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
