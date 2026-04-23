'use client';
import React from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export default function Textarea({
  label,
  error,
  hint,
  wrapperClassName,
  id,
  className,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={clsx('flex flex-col gap-1', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        {...props}
        className={clsx(
          'input-base resize-none',
          error && 'border-rose-400 dark:border-rose-500 focus:ring-rose-500',
          className
        )}
      />
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
}
