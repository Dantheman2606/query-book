'use client';
import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ReplyFormProps {
  placeholder?: string;
  onSubmit: (content: string) => Promise<void>;
  replyingTo: string | null;
  onCancelReply: () => void;
  autoFocus?: boolean;
}

export default function ReplyForm({
  placeholder = 'Write a reply…',
  onSubmit,
  replyingTo,
  onCancelReply,
  autoFocus,
}: ReplyFormProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(autoFocus ?? false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  // Auto-grow textarea
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    try {
      await onSubmit(content.trim());
      setContent('');
      setFocused(false);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={clsx(
      'rounded-xl border transition-all duration-200',
      focused
        ? 'border-brand-400 dark:border-brand-600 shadow-sm shadow-brand-500/10'
        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30'
    )}>
      {replyingTo && (
        <div className="flex items-center justify-between px-3 pt-2.5 pb-0">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Replying to <span className="font-medium text-brand-500">{replyingTo}</span>
          </span>
          <button onClick={onCancelReply} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        placeholder={placeholder}
        rows={focused ? 3 : 2}
        className="w-full bg-transparent px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none min-h-[60px] overflow-hidden"
      />
      {focused && (
        <div className="flex items-center justify-between px-3 pb-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">Ctrl+Enter to submit</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setFocused(false); setContent(''); onCancelReply(); }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              isLoading={isLoading}
              disabled={!content.trim()}
            >
              Post
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
