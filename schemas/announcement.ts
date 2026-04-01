import { z } from 'zod';

export const CreateAnnouncementSchema = z.object({
  title: z.string().min(1).max(255, 'Title must be less than 255 characters'),
  content: z.string().min(1, 'Content is required'),
});

export const UpdateAnnouncementSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
});

export const AnnouncementFilterSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(['recent', 'oldest']).optional().default('recent'),
  limit: z.number().positive().max(100).optional().default(20),
  offset: z.number().nonnegative().optional().default(0),
});

export const AnnouncementResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  postedBy: z.string(),
  userId: z.string().uuid(),
  datePosted: z.date(),
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    avatarUrl: z.string().url().or(z.literal('')),
  }).optional(),
});

export type CreateAnnouncement = z.infer<typeof CreateAnnouncementSchema>;
export type UpdateAnnouncement = z.infer<typeof UpdateAnnouncementSchema>;
export type AnnouncementFilter = z.infer<typeof AnnouncementFilterSchema>;
export type AnnouncementResponse = z.infer<typeof AnnouncementResponseSchema>;
