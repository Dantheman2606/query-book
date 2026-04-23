'use client';
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import TagSelector from '@/components/tags/TagSelector';
import type { Tag } from '@/types/frontend';
import * as queryService from '@/lib/services/queryService';
import { useToast } from '@/contexts/ToastContext';

interface CreateQueryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  tags: Tag[];
}

export default function CreateQueryForm({ isOpen, onClose, onCreated, tags }: CreateQueryFormProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setContent('');
      setSelectedTags([]);
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const e: typeof errors = {};
    if (!title.trim()) e.title = 'Title is required';
    else if (title.length > 255) e.title = 'Title must be under 255 characters';
    if (!content.trim()) e.content = 'Content is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await queryService.createQuery({ title: title.trim(), content: content.trim(), tags: selectedTags });
      showToast('Query posted!', 'success');
      onCreated();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to create query', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ask a Question"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button isLoading={isLoading} onClick={handleSubmit}>Post Query</Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="What's your question? Be specific."
          value={title}
          onChange={e => setTitle(e.target.value)}
          error={errors.title}
          maxLength={255}
        />
        <Textarea
          label="Details"
          placeholder="Provide all the relevant context, code, or steps to reproduce the issue…"
          value={content}
          onChange={e => setContent(e.target.value)}
          error={errors.content}
          rows={8}
        />
        <TagSelector
          label="Tags"
          tags={tags}
          selected={selectedTags}
          onChange={setSelectedTags}
        />
      </form>
    </Modal>
  );
}
