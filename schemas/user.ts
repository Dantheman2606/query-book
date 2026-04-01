import { z } from 'zod';

export const RoleEnum = z.enum(['student', 'faculty', 'admin']);

export const UserProfileUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  bio: z.string().max(200).optional(),
  avatarUrl: z.string().url().optional(),
  department: z.string().max(255).optional(),
});

export const UserRoleUpdateSchema = z.object({
  role: RoleEnum,
});

export const UserResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  role: RoleEnum,
  department: z.string(),
  avatarUrl: z.url().or(z.literal('')),
  bio: z.string(),
  isActive: z.boolean(),
  isVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;
export type UserRoleUpdate = z.infer<typeof UserRoleUpdateSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
