import { compare, hash } from 'bcryptjs';
import { SignJWT } from 'jose';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { type Login, type Register, type VerifyEmail } from '@/schemas/auth';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'default_development_secret_key_change_in_production'
);

interface AuthToken {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    department: string;
    avatarUrl: string;
    bio: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
  };
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  avatarUrl: string;
  bio: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Authenticate user with email and password
 */
export async function loginUser(data: Login): Promise<AuthToken> {
  const user = await db.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Account is inactive. Please contact support.');
  }

  const isPasswordMatch = await compare(data.password, user.password);

  if (!isPasswordMatch) {
    throw new Error('Invalid email or password');
  }

  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isVerified: user.isVerified,
    isActive: user.isActive,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  };
}

/**
 * Register a new user
 */
export async function registerUser(data: Register): Promise<UserProfile> {
  if (data.role === 'admin') {
    throw new Error('You cannot register as admin');
  }

  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('Email already registered.');
  }

  const hashedPassword = await hash(data.password, 10);
  const verificationToken = randomBytes(32).toString('hex');
  const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const newUser = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role === 'faculty' ? 'faculty' : 'student',
      department: data.department || '',
      avatarUrl: data.avatarUrl || '',
      bio: data.bio || '',
      isVerified: false,
      isActive: true,
      verificationToken,
      verificationTokenExpiry,
    },
  });

  // TODO: Send verification email
  // await sendVerificationEmail(newUser.email, verificationToken);

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    department: newUser.department,
    avatarUrl: newUser.avatarUrl,
    bio: newUser.bio,
    isVerified: newUser.isVerified,
    isActive: newUser.isActive,
    createdAt: newUser.createdAt,
  };
}

/**
 * Verify email with token
 */
export async function verifyEmail(data: VerifyEmail): Promise<void> {
  const user = await db.user.findFirst({
    where: {
      verificationToken: data.token,
      verificationTokenExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new Error('Invalid or expired verification token');
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  });
}

/**
 * Get user profile by id (excluding password)
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    isVerified: user.isVerified,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}
