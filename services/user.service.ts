import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { type UserProfileUpdate } from '@/schemas/user';

interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  avatarUrl: string;
  bio: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all users
 */
export async function getAllUsers(): Promise<UserResponse[]> {
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      avatarUrl: true,
      bio: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users;
}

/**
 * Get a single user by ID
 */
export async function getUserById(id: string): Promise<UserResponse> {
  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      avatarUrl: true,
      bio: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  id: string,
  data: UserProfileUpdate,
  requestUserId: string,
  userRole: string
): Promise<UserResponse> {
  // Authorization: users can only update their own profile, admins can update anyone
  if (id !== requestUserId && userRole !== 'admin') {
    throw new Error('Not authorized to update this profile');
  }

  const user = await db.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const updatedUser = await db.user.update({
    where: { id },
    data: {
      name: data.name,
      bio: data.bio,
      avatarUrl: data.avatarUrl,
      department: data.department,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      avatarUrl: true,
      bio: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
}

/**
 * Check user role
 */
export async function checkUserRole(id: string): Promise<{ role: string }> {
  const user = await db.user.findUnique({
    where: { id },
    select: {
      role: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    role: user.role,
  };
}

/**
 * Delete user profile (soft delete via deactivation)
 */
export async function deleteUserProfile(
  id: string,
  requestUserId: string,
  userRole: string
): Promise<void> {
  // Authorization: users can only delete their own profile, admins can delete anyone
  if (id !== requestUserId && userRole !== 'admin') {
    throw new Error('Not authorized to delete this profile');
  }

  const user = await db.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Soft delete: deactivate the account
  await db.user.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
}

/**
 * Get user's queries count
 */
export async function getUserQueriesCount(id: string): Promise<number> {
  const count = await db.query.count({
    where: { userId: id },
  });

  return count;
}

/**
 * Get user's replies count
 */
export async function getUserRepliesCount(id: string): Promise<number> {
  const count = await db.reply.count({
    where: { userId: id },
  });

  return count;
}

/**
 * Get user statistics
 */
export async function getUserStatistics(
  id: string
): Promise<{
  queriesCount: number;
  repliesCount: number;
  totalVotes: number;
}> {
  const [queriesCount, repliesCount, questionsUpvotes, repliesUpvotes] = await Promise.all([
    db.query.count({ where: { userId: id } }),
    db.reply.count({ where: { userId: id } }),
    db.query.aggregate({
      where: { userId: id },
      _sum: { upvotes: true },
    }),
    db.reply.aggregate({
      where: { userId: id },
      _sum: { netVotes: true },
    }),
  ]);

  const totalVotes =
    (questionsUpvotes._sum.upvotes || 0) + (repliesUpvotes._sum.netVotes || 0);

  return {
    queriesCount,
    repliesCount,
    totalVotes,
  };
}
