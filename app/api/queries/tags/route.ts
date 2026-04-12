import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import { getQueriesByTags } from '@/services/tag.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Get queries filtered by tags
 * Example: /api/queries/tags?tags=react,nextjs
 * Route: GET /api/queries/tags
 * Auth Required: Yes
 */
export const GET = withAuth(
  (async (request, context, user) => {
    try {
      const searchParams = new URL(request.url).searchParams;
      const tagsParam = searchParams.get('tags');

      if (!tagsParam) {
        return NextResponse.json(
          { error: 'tags parameter is required' },
          { status: 400 }
        );
      }

      const tagIds = tagsParam.split(',').filter(Boolean);
      const queries = await getQueriesByTags(tagIds);

      return NextResponse.json(
        { queries },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error fetching queries by tags:', error);
      return NextResponse.json(
        { message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }) as AuthRouteHandler
);
