'use client';
import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { useToast } from '@/contexts/ToastContext';
import * as announcementService from '@/lib/services/announcementService';

interface CreateAnnouncementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateAnnouncementForm({ isOpen, onClose, onCreated }: CreateAnnouncementFormProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) { setTitle(''); setContent(''); setErrors({}); }
  }, [isOpen]);

  const validate = () => {
    const e: typeof errors = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!content.trim()) e.content = 'Content is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await announcementService.createAnnouncement({ title: title.trim(), content: content.trim() });
      showToast('Announcement posted!', 'success');
      onCreated();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to post', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Announcement"
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button isLoading={isLoading} onClick={handleSubmit}>Post Announcement</Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="Announcement title…"
          value={title}
          onChange={e => setTitle(e.target.value)}
          error={errors.title}
        />
        <Textarea
          label="Content"
          placeholder="Write your announcement…"
          value={content}
          onChange={e => setContent(e.target.value)}
          error={errors.content}
          rows={6}
        />
      </form>
    </Modal>
  );
}
