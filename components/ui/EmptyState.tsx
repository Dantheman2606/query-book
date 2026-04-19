'use client';
import React from 'react';
import { clsx } from 'clsx';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3 py-16 px-4 text-center', className)}>
      {icon && (
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-gray-700 dark:text-gray-300">{title}</p>
        {description && <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">{description}</p>}
      </div>
      {action}
    </div>
  );
}
