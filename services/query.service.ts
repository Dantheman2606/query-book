import { db } from '@/lib/db';
import {
  type CreateQuery,
  type UpdateQuery,
  type QueryFilter,
} from '@/schemas/query';

interface QueryResponse {
  id: string;
  title: string;
  content: string;
  postedBy: string;
  upvotes: number;
  downvotes: number;
  userId: string;
  datePosted: Date;
  isEdited: boolean;
  dateEdited: Date;
  user?: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  tags?: Array<{
    tagId: string;
    tag: {
      id: string;
      name: string;
    };
  }>;
  _count?: {
    replies: number;
  };
}

interface QueriesResponse {
  queries: QueryResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Create a new query (question)
 */
export async function createQuery(
  data: CreateQuery,
  userId: string,
  userName: string
): Promise<QueryResponse> {
  const query = await db.query.create({
    data: {
      title: data.title,
      content: data.content,
      postedBy: userName,
      userId,
      tags: {
        create: data.tags?.map((tagId) => ({
          tag: {
            connect: {
              id: tagId,
            },
          },
        })) || [],
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });

  return formatQueryResponse(query);
}

/**
 * Get all queries with filtering and pagination
 */
export async function getQueries(filters: QueryFilter): Promise<QueriesResponse> {
  const where: any = {};

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { content: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.tags && filters.tags.length > 0) {
    where.tags = {
      some: {
        tagId: {
          in: filters.tags,
        },
      },
    };
  }

  const orderBy: any = {};
  if (filters.sortBy === 'popular') {
    orderBy.upvotes = 'desc';
  } else if (filters.sortBy === 'trending') {
    orderBy.datePosted = 'desc';
  } else {
    orderBy.datePosted = 'desc';
  }

  const queries = await db.query.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
    orderBy,
    take: filters.limit,
    skip: filters.offset,
  });

  const total = await db.query.count({ where });

  return {
    queries: queries.map(formatQueryResponse),
    pagination: {
      total,
      limit: filters.limit,
      offset: filters.offset,
      hasMore: filters.offset + filters.limit < total,
    },
  };
}

/**
 * Get a single query by ID
 */
export async function getQueryById(id: string): Promise<QueryResponse> {
  const query = await db.query.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });

  if (!query) {
    throw new Error('Query not found');
  }

  return formatQueryResponse(query);
}

/**
 * Update a query
 */
export async function updateQuery(
  id: string,
  data: UpdateQuery,
  userId: string,
  userRole: string
): Promise<QueryResponse> {
  const query = await db.query.findUnique({
    where: { id },
  });

  if (!query) {
    throw new Error('Query not found');
  }

  // Authorization check
  if (query.userId !== userId && userRole !== 'admin') {
    throw new Error('Not authorized to update this query');
  }

  // Handle tag updates
  if (data.tags) {
    await db.queryTag.deleteMany({
      where: { queryId: id },
    });
  }

  const updatedQuery = await db.query.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content,
      isEdited: true,
      ...(data.tags && {
        tags: {
          create: data.tags.map((tagId) => ({
            tag: {
              connect: {
                id: tagId,
              },
            },
          })),
        },
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });

  return formatQueryResponse(updatedQuery);
}

/**
 * Delete a query
 */
export async function deleteQuery(
  id: string,
  userId: string,
  userRole: string
): Promise<void> {
  const query = await db.query.findUnique({
    where: { id },
  });

  if (!query) {
    throw new Error('Query not found');
  }

  // Authorization check
  if (query.userId !== userId && userRole !== 'admin') {
    throw new Error('Not authorized to delete this query');
  }

  await db.query.delete({
    where: { id },
  });
}

/**
 * Helper function to format query response
 */
function formatQueryResponse(query: any): QueryResponse {
  return {
    id: query.id,
    title: query.title,
    content: query.content,
    postedBy: query.postedBy,
    upvotes: query.upvotes,
    downvotes: query.downvotes,
    userId: query.userId,
    datePosted: query.datePosted,
    isEdited: query.isEdited,
    dateEdited: query.dateEdited,
    user: query.user,
    tags: query.tags,
    _count: query._count,
  };
}
