import { z } from 'zod';

export const CreateQuerySchema = z.object({
  title: z.string().min(1).max(255, 'Title must be less than 255 characters'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string().uuid()).optional().default([]),
});

export const UpdateQuerySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string().uuid()).optional(),
});

export const QueryFilterSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string().uuid()).optional(),
  sortBy: z.enum(['recent', 'popular', 'trending']).optional().default('recent'),
  limit: z.number().positive().max(100).optional().default(20),
  offset: z.number().nonnegative().optional().default(0),
});

export const QueryVoteSchema = z.object({
  type: z.enum(['UPVOTE', 'DOWNVOTE']),
});

export const QueryResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  postedBy: z.string(),
  upvotes: z.number(),
  downvotes: z.number(),
  userId: z.string().uuid(),
  datePosted: z.date(),
  isEdited: z.boolean(),
  dateEdited: z.date(),
  tags: z.array(z.object({
    tagId: z.string().uuid(),
    tag: z.object({
      id: z.string().uuid(),
      name: z.string(),
    }),
  })).optional(),
  replies: z.array(z.any()).optional(),
});

export type CreateQuery = z.infer<typeof CreateQuerySchema>;
export type UpdateQuery = z.infer<typeof UpdateQuerySchema>;
export type QueryFilter = z.infer<typeof QueryFilterSchema>;
export type QueryVote = z.infer<typeof QueryVoteSchema>;
export type QueryResponse = z.infer<typeof QueryResponseSchema>;
