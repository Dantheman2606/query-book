'use client';
import { useState, useCallback } from 'react';
import type { Tag } from '@/types/frontend';
import * as tagService from '@/lib/services/tagService';
import { useToast } from '@/contexts/ToastContext';

export function useTags() {
  const { showToast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSelectableTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await tagService.getSelectableTags();
      setTags(result.tags ?? []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load tags', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const fetchAllTags = useCallback(async (search?: string) => {
    setIsLoading(true);
    try {
      const result = await tagService.getTags({ search, limit: 100 });
      setTags(result.tags ?? []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load tags', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const createTag = useCallback(async (name: string) => {
    try {
      await tagService.createTag(name);
      await fetchAllTags();
      showToast(`Tag "${name}" created`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to create tag', 'error');
    }
  }, [fetchAllTags, showToast]);

  const deleteTag = useCallback(async (id: string, name?: string) => {
    try {
      await tagService.deleteTag(id);
      setTags(prev => prev.filter(tag => tag.id !== id));
      showToast(`Tag "${name || id}" deleted`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to delete tag', 'error');
    }
  }, [showToast]);

  return { tags, isLoading, fetchSelectableTags, fetchAllTags, createTag, deleteTag };
}
