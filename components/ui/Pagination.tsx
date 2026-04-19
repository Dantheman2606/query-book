'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  onOffset: (offset: number) => void;
}

export default function Pagination({ total, limit, offset, onOffset }: PaginationProps) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Page <span className="font-medium text-gray-700 dark:text-gray-300">{currentPage}</span> of{' '}
        <span className="font-medium text-gray-700 dark:text-gray-300">{totalPages}</span>
      </span>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
          disabled={offset === 0}
          onClick={() => onOffset(Math.max(0, offset - limit))}
        >
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
          disabled={offset + limit >= total}
          onClick={() => onOffset(offset + limit)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
