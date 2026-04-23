import { db } from '@/lib/db';
import { type CreateAnnouncement, type AnnouncementFilter } from '@/schemas/announcement';

interface AnnouncementResponse {
  id: string;
  title: string;
  content: string;
  userId: string;
  postedBy: string;
  datePosted: Date;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
  };
}

interface AnnouncementsResponse {
  announcements: AnnouncementResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Create a new announcement (Faculty only)
 */
export async function createAnnouncement(
  data: CreateAnnouncement,
  userId: string,
  userName: string
): Promise<AnnouncementResponse> {
  const announcement = await db.announcement.create({
    data: {
      title: data.title,
      content: data.content,
      postedBy: userName,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return {
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    userId: announcement.userId,
    postedBy: announcement.postedBy,
    datePosted: announcement.datePosted,
    user: announcement.user,
  };
}

/**
 * Get all announcements with filtering and pagination
 */
export async function getAnnouncements(
  filters: AnnouncementFilter
): Promise<AnnouncementsResponse> {
  const where: any = {};

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { content: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const announcements = await db.announcement.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      datePosted: filters.sortBy === 'recent' ? 'desc' : 'asc',
    },
    take: filters.limit,
    skip: filters.offset,
  });

  const total = await db.announcement.count({ where });

  return {
    announcements: announcements.map((ann) => ({
      id: ann.id,
      title: ann.title,
      content: ann.content,
      userId: ann.userId,
      postedBy: ann.postedBy,
      datePosted: ann.datePosted,
      user: ann.user,
    })),
    pagination: {
      total,
      limit: filters.limit,
      offset: filters.offset,
      hasMore: filters.offset + filters.limit < total,
    },
  };
}

/**
 * Get a single announcement by ID
 */
export async function getAnnouncementById(id: string): Promise<AnnouncementResponse> {
  const announcement = await db.announcement.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!announcement) {
    throw new Error('Announcement not found');
  }

  return {
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    userId: announcement.userId,
    postedBy: announcement.postedBy,
    datePosted: announcement.datePosted,
    user: announcement.user,
  };
}

/**
 * Delete an announcement (Faculty/Admin only)
 */
export async function deleteAnnouncement(id: string, userId: string, userRole: string): Promise<void> {
  const announcement = await db.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    throw new Error('Announcement not found');
  }

  // Check authorization: user must own announcement or be admin
  if (announcement.userId !== userId && userRole !== 'admin') {
    throw new Error('Not authorized to delete this announcement');
  }

  await db.announcement.delete({
    where: { id },
  });
}
