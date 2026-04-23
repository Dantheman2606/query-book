'use client';
import React from 'react';
import { clsx } from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  wrapperClassName?: string;
}

export default function Select({ label, error, options, wrapperClassName, id, className, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={clsx('flex flex-col gap-1', wrapperClassName)}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <select
        id={selectId}
        {...props}
        className={clsx(
          'input-base appearance-none',
          props.disabled
            ? 'cursor-not-allowed bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 opacity-90'
            : 'cursor-pointer',
          error && 'border-rose-400 dark:border-rose-500',
          className
        )}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
