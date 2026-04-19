'use client';
import { clsx } from 'clsx';

interface TagBadgeProps {
  name: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

export default function TagBadge({ name, onClick, active, className }: TagBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={clsx(
        'tag-pill transition-all',
        active && 'bg-brand-100 dark:bg-brand-900/60 ring-1 ring-brand-400 dark:ring-brand-600',
        !onClick && 'cursor-default pointer-events-none',
        className
      )}
    >
      #{name}
    </button>
  );
}
