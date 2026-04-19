'use client';
import { useState } from 'react';
import type { Tag } from '@/types/frontend';
import { clsx } from 'clsx';
import { X, ChevronDown } from 'lucide-react';

interface TagSelectorProps {
  tags: Tag[];
  selected: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  error?: string;
}

export default function TagSelector({ tags, selected, onChange, label, error }: TagSelectorProps) {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };

  const remove = (id: string) => onChange(selected.filter(s => s !== id));

  const selectedTags = tags.filter(t => selected.includes(t.id));

  return (
    <div className="flex flex-col gap-1 relative">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={clsx(
          'input-base text-left flex items-center justify-between',
          error && 'border-rose-400'
        )}
      >
        <span className="flex flex-wrap gap-1 flex-1 min-h-[20px]">
          {selectedTags.length === 0 ? (
            <span className="text-gray-400 dark:text-gray-500">Select tags…</span>
          ) : (
            selectedTags.map(t => (
              <span
                key={t.id}
                className="tag-pill"
                onClick={e => { e.stopPropagation(); remove(t.id); }}
              >
                #{t.name} <X className="w-3 h-3" />
              </span>
            ))
          )}
        </span>
        <ChevronDown className={clsx('w-4 h-4 shrink-0 text-gray-400 transition-transform ml-2', open && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-20 card shadow-xl max-h-56 overflow-y-auto animate-fade-in">
          {tags.length === 0 ? (
            <p className="text-sm text-gray-400 px-3 py-2">No tags available</p>
          ) : (
            <div className="p-2 flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggle(tag.id)}
                  className={clsx(
                    'tag-pill transition-all',
                    selected.includes(tag.id) &&
                      'bg-brand-100 dark:bg-brand-900/60 ring-1 ring-brand-400 dark:ring-brand-600'
                  )}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}

      {/* Close on outside click */}
      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}
    </div>
  );
}
