'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import TagSelector from '@/components/tags/TagSelector';
import { useTags } from '@/hooks/useTags';
import { useToast } from '@/contexts/ToastContext';
import * as queryService from '@/lib/services/queryService';

export default function CreateQueryPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { tags, isLoading: tagsLoading, fetchSelectableTags } = useTags();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  useEffect(() => {
    fetchSelectableTags();
  }, [fetchSelectableTags]);

  const validate = () => {
    const nextErrors: { title?: string; content?: string } = {};

    if (!title.trim()) nextErrors.title = 'Title is required';
    else if (title.trim().length > 255) nextErrors.title = 'Title must be under 255 characters';

    if (!content.trim()) nextErrors.content = 'Content is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await queryService.createQuery({
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags,
      });

      showToast('Query posted successfully', 'success');
      router.push('/queries');
      router.refresh();
    } catch (error: any) {
      showToast(error?.message || 'Failed to create query', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ask a Question</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Share the full context so others can provide precise answers.
          </p>
        </div>
        <Link href="/queries">
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Feed
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <Input
          label="Title"
          placeholder="What is your question?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          maxLength={255}
        />

        <Textarea
          label="Details"
          placeholder="Add background, code, errors, and what you already tried..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          error={errors.content}
          rows={10}
        />

        {tagsLoading ? (
          <Spinner className="py-3" label="Loading all tags..." />
        ) : (
          <TagSelector
            label="Tags"
            tags={tags}
            selected={selectedTags}
            onChange={setSelectedTags}
          />
        )}

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSubmitting} leftIcon={<Send className="w-4 h-4" />}>
            Post Query
          </Button>
        </div>
      </form>
    </div>
  );
}
