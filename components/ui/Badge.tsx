'use client';
import { clsx } from 'clsx';

type BadgeVariant = 'brand' | 'gray' | 'emerald' | 'rose' | 'amber' | 'violet';

const COLOR_MAP: Record<BadgeVariant, string> = {
  brand: 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border-brand-100 dark:border-brand-900/50',
  gray: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/50',
  rose: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-900/50',
  amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-900/50',
  violet: 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-900/50',
};

const ROLE_COLOR: Record<string, BadgeVariant> = {
  admin: 'rose',
  faculty: 'violet',
  student: 'emerald',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  role?: string;
  className?: string;
}

export default function Badge({ children, variant, role, className }: BadgeProps) {
  const colorKey = role ? (ROLE_COLOR[role] ?? 'gray') : (variant ?? 'gray');
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border',
        COLOR_MAP[colorKey],
        className
      )}
    >
      {children}
    </span>
  );
}
