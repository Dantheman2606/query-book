'use client';
import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export default function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  wrapperClassName,
  id,
  className,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={clsx('flex flex-col gap-1', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          {...props}
          className={clsx(
            'input-base',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            error && 'border-rose-400 dark:border-rose-500 focus:ring-rose-500',
            className
          )}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
}
