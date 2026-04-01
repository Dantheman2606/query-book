import { z } from 'zod';

export const CreateReplySchema = z.object({
  content: z.string().min(1, 'Reply content is required'),
  queryId: z.string().uuid('Invalid query ID'),
  parentId: z.string().uuid().optional().nullable(),
});

export const UpdateReplySchema = z.object({
  content: z.string().min(1, 'Reply content is required'),
});

export const ReplyVoteSchema = z.object({
  type: z.enum(['UPVOTE', 'DOWNVOTE']),
});

export const ReplyFilterSchema = z.object({
  queryId: z.string().uuid('Invalid query ID'),
  parentId: z.string().uuid().optional().nullable(),
  sortBy: z.enum(['recent', 'votes']).optional().default('recent'),
  limit: z.number().positive().max(100).optional().default(20),
  offset: z.number().nonnegative().optional().default(0),
});

export const ReplyResponseSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  netVotes: z.number(),
  postedBy: z.string(),
  userId: z.string().uuid(),
  queryId: z.string().uuid(),
  parentId: z.string().uuid().optional().nullable(),
  datePosted: z.date(),
  children: z.array(z.any()).optional(),
  votes: z.array(z.any()).optional(),
});

export type CreateReply = z.infer<typeof CreateReplySchema>;
export type UpdateReply = z.infer<typeof UpdateReplySchema>;
export type ReplyVote = z.infer<typeof ReplyVoteSchema>;
export type ReplyFilter = z.infer<typeof ReplyFilterSchema>;
export type ReplyResponse = z.infer<typeof ReplyResponseSchema>;
