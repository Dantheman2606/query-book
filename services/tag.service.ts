import { db } from '@/lib/db';
import {
  type CreateTag,
  type UpdateTag,
  type TagFilter,
} from '@/schemas/tag';

interface TagResponse {
  id: string;
  name: string;
  queryCount?: number;
}

interface TagsResponse {
  tags: TagResponse[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Create a new tag (Admin only)
 */
export async function createTag(data: CreateTag): Promise<TagResponse> {
  // Check if tag already exists
  const existingTag = await db.tag.findUnique({
    where: { name: data.name.toLowerCase() },
  });

  if (existingTag) {
    throw new Error('Tag already exists');
  }

  const tag = await db.tag.create({
    data: {
      name: data.name.toLowerCase(),
    },
  });

  return {
    id: tag.id,
    name: tag.name,
  };
}

/**
 * Get all tags with filtering and pagination
 */
export async function getTags(filters: TagFilter): Promise<TagsResponse> {
  const where: any = {};

  if (filters.search) {
    where.name = {
      contains: filters.search.toLowerCase(),
      mode: 'insensitive',
    };
  }

  const orderBy: any = {};
  if (filters.sortBy === 'popularity') {
    orderBy.queries = {
      _count: 'desc',
    };
  } else {
    orderBy.name = 'asc';
  }

  const tags = await db.tag.findMany({
    where,
    include: {
      _count: {
        select: {
          queries: true,
        },
      },
    },
    orderBy,
    take: filters.limit,
    skip: filters.offset,
  });

  const total = await db.tag.count({ where });

  return {
    tags: tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      queryCount: tag._count.queries,
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
 * Get a single tag by ID
 */
export async function getTagById(id: string): Promise<TagResponse> {
  const tag = await db.tag.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          queries: true,
        },
      },
    },
  });

  if (!tag) {
    throw new Error('Tag not found');
  }

  return {
    id: tag.id,
    name: tag.name,
    queryCount: tag._count.queries,
  };
}

/**
 * Update a tag (Admin only)
 */
export async function updateTag(
  id: string,
  data: UpdateTag
): Promise<TagResponse> {
  const tag = await db.tag.findUnique({
    where: { id },
  });

  if (!tag) {
    throw new Error('Tag not found');
  }

  // Check if new name already exists
  if (data.name && data.name.toLowerCase() !== tag.name) {
    const existingTag = await db.tag.findUnique({
      where: { name: data.name.toLowerCase() },
    });

    if (existingTag) {
      throw new Error('Tag name already exists');
    }
  }

  const updatedTag = await db.tag.update({
    where: { id },
    data: {
      name: data.name?.toLowerCase(),
    },
    include: {
      _count: {
        select: {
          queries: true,
        },
      },
    },
  });

  return {
    id: updatedTag.id,
    name: updatedTag.name,
    queryCount: updatedTag._count.queries,
  };
}

/**
 * Delete a tag (Admin only)
 */
export async function deleteTag(id: string): Promise<void> {
  const tag = await db.tag.findUnique({
    where: { id },
  });

  if (!tag) {
    throw new Error('Tag not found');
  }

  await db.tag.delete({
    where: { id },
  });
}

/**
 * Get selectable tags (for creating/editing queries)
 */
export async function getSelectableTags(): Promise<TagResponse[]> {
  const tags = await db.tag.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
  }));
}

/**
 * Get queries by tags
 */
export async function getQueriesByTags(tagIds: string[]): Promise<any[]> {
  if (tagIds.length === 0) {
    return [];
  }

  const queries = await db.query.findMany({
    where: {
      tags: {
        some: {
          tagId: {
            in: tagIds,
          },
        },
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
    orderBy: {
      datePosted: 'desc',
    },
  });

  return queries;
}
