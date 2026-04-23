'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { clsx } from 'clsx';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-8 h-8" />;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className={clsx(
        'relative w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200',
        'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400',
        'hover:text-gray-700 dark:hover:text-gray-200',
        className
      )}
    >
      <Sun
        className={clsx(
          'w-4 h-4 absolute transition-all duration-300',
          isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        )}
      />
      <Moon
        className={clsx(
          'w-4 h-4 absolute transition-all duration-300',
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
        )}
      />
    </button>
  );
}
