import { z } from 'zod';

export const CreateTagSchema = z.object({
  name: z.string().min(1).max(50, 'Tag name must be less than 50 characters').toLowerCase(),
});

export const UpdateTagSchema = z.object({
  name: z.string().min(1).max(50).toLowerCase().optional(),
});

export const TagFilterSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(['name', 'popularity']).optional().default('name'),
  limit: z.number().positive().max(100).optional().default(20),
  offset: z.number().nonnegative().optional().default(0),
});

export const TagResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  queryCount: z.number().optional(),
});

export const QueryTagSchema = z.object({
  queryId: z.string().uuid(),
  tagId: z.string().uuid(),
});

export type CreateTag = z.infer<typeof CreateTagSchema>;
export type UpdateTag = z.infer<typeof UpdateTagSchema>;
export type TagFilter = z.infer<typeof TagFilterSchema>;
export type TagResponse = z.infer<typeof TagResponseSchema>;
export type QueryTag = z.infer<typeof QueryTagSchema>;
