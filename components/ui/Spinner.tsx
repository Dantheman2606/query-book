'use client';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const SIZES = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };

export default function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={clsx('animate-spin text-brand-500', SIZES[size])} />
      {label && <p className="text-sm text-gray-400 dark:text-gray-500">{label}</p>}
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" label="Loading…" />
    </div>
  );
}
