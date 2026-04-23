import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).max(255, 'Name must be less than 255 characters'),
  role: z.enum(['student', 'faculty', 'admin']).default('student'),
  department: z.string().optional().default(''),
  avatarUrl: z.string().url().or(z.literal('')).optional().default(''),
  bio: z.string().max(200).optional().default(''),
});

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const PasswordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const PasswordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: z.enum(['student', 'faculty', 'admin']),
  }),
});

export type Login = z.infer<typeof LoginSchema>;
export type Register = z.infer<typeof RegisterSchema>;
export type VerifyEmail = z.infer<typeof VerifyEmailSchema>;
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;
export type PasswordReset = z.infer<typeof PasswordResetSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
