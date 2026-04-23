'use client';
import { clsx } from 'clsx';
import Image from 'next/image';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg',
};

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
}

// Generate a consistent color from name
function getColor(name?: string): string {
  const colors = [
    'bg-brand-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500',
    'bg-emerald-500', 'bg-sky-500', 'bg-pink-500', 'bg-teal-500',
  ];
  if (!name) return colors[0];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export default function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <div className={clsx('relative rounded-full overflow-hidden shrink-0', SIZES[size], className)}>
        <Image src={src} alt={name || 'avatar'} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'rounded-full shrink-0 flex items-center justify-center font-semibold text-white select-none',
        SIZES[size],
        getColor(name),
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
