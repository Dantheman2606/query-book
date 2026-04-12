import { db } from '@/lib/db';
import {
  type CreateReply,
  type UpdateReply,
  type ReplyFilter,
} from '@/schemas/reply';

interface ReplyResponse {
  id: string;
  content: string;
  netVotes: number;
  postedBy: string;
  userId: string;
  queryId: string;
  parentId: string | null;
  datePosted: Date;
  user?: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  children?: ReplyResponse[];
}

interface RepliesResponse {
  replies: ReplyResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Create a new reply
 */
export async function createReply(
  data: CreateReply,
  userId: string,
  userName: string
): Promise<ReplyResponse> {
  // Verify query exists
  const query = await db.query.findUnique({
    where: { id: data.queryId },
  });

  if (!query) {
    throw new Error('Query not found');
  }

  // If reply to reply, verify parent exists
  if (data.parentId) {
    const parent = await db.reply.findUnique({
      where: { id: data.parentId },
    });

    if (!parent || parent.queryId !== data.queryId) {
      throw new Error('Parent reply not found or does not belong to this query');
    }
  }

  const reply = await db.reply.create({
    data: {
      content: data.content,
      postedBy: userName,
      userId,
      queryId: data.queryId,
      parentId: data.parentId || null,
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

  return formatReplyResponse(reply);
}

/**
 * Get replies for a query
 */
export async function getReplies(filters: ReplyFilter): Promise<RepliesResponse> {
  const where: any = {
    queryId: filters.queryId,
    parentId: filters.parentId || null,
  };

  const orderBy: any = {};
  if (filters.sortBy === 'votes') {
    orderBy.netVotes = 'desc';
  } else {
    orderBy.datePosted = 'desc';
  }

  const replies = await db.reply.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      children: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
    orderBy,
    take: filters.limit,
    skip: filters.offset,
  });

  const total = await db.reply.count({ where });

  return {
    replies: replies.map(formatReplyResponse),
    pagination: {
      total,
      limit: filters.limit,
      offset: filters.offset,
      hasMore: filters.offset + filters.limit < total,
    },
  };
}

/**
 * Get a single reply by ID
 */
export async function getReplyById(id: string): Promise<ReplyResponse> {
  const reply = await db.reply.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      children: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!reply) {
    throw new Error('Reply not found');
  }

  return formatReplyResponse(reply);
}

/**
 * Update a reply
 */
export async function updateReply(
  id: string,
  data: UpdateReply,
  userId: string,
  userRole: string
): Promise<ReplyResponse> {
  const reply = await db.reply.findUnique({
    where: { id },
  });

  if (!reply) {
    throw new Error('Reply not found');
  }

  // Authorization check
  if (reply.userId !== userId && userRole !== 'admin') {
    throw new Error('Not authorized to update this reply');
  }

  const updatedReply = await db.reply.update({
    where: { id },
    data: {
      content: data.content,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      children: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  return formatReplyResponse(updatedReply);
}

/**
 * Delete a reply
 */
export async function deleteReply(
  id: string,
  userId: string,
  userRole: string
): Promise<void> {
  const reply = await db.reply.findUnique({
    where: { id },
  });

  if (!reply) {
    throw new Error('Reply not found');
  }

  // Authorization check
  if (reply.userId !== userId && userRole !== 'admin') {
    throw new Error('Not authorized to delete this reply');
  }

  // Delete all nested replies recursively
  await deleteChildReplies(id);

  await db.reply.delete({
    where: { id },
  });
}

/**
 * Helper to delete all child replies
 */
async function deleteChildReplies(parentId: string): Promise<void> {
  const children = await db.reply.findMany({
    where: { parentId },
  });

  for (const child of children) {
    await deleteChildReplies(child.id);
    await db.reply.delete({
      where: { id: child.id },
    });
  }
}

/**
 * Helper function to format reply response
 */
function formatReplyResponse(reply: any): ReplyResponse {
  return {
    id: reply.id,
    content: reply.content,
    netVotes: reply.netVotes,
    postedBy: reply.postedBy,
    userId: reply.userId,
    queryId: reply.queryId,
    parentId: reply.parentId,
    datePosted: reply.datePosted,
    user: reply.user,
    children: reply.children?.map(formatReplyResponse),
  };
}
