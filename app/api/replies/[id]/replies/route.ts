import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import {
  ReplyFilterSchema,
  type ReplyFilter,
} from '@/schemas/reply';
import { getReplies } from '@/services/reply.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Get nested replies for a specific reply (children)
 * Route: GET /api/replies/:id/replies
 * Auth Required: Yes
 */
export const GET = withAuth(
  (async (request, context, user) => {
    try {
      const { id } = context.params;
      const searchParams = new URL(request.url).searchParams;

      // This endpoint needs queryId to filter properly
      // For now, we'll fetch children of this reply
      // If queryId is not provided, respond with error
      const queryId = searchParams.get('queryId');

      if (!queryId) {
        return NextResponse.json(
          { error: 'queryId parameter is required' },
          { status: 400 }
        );
      }

      const filters: Partial<ReplyFilter> = {
        queryId,
        parentId: id,
        sortBy: (searchParams.get('sortBy') as 'recent' | 'votes') || 'recent',
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
        offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      };

      const validatedFilters = ReplyFilterSchema.parse(filters);
      const result = await getReplies(validatedFilters);

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      console.error('Error fetching nested replies:', error);
      return NextResponse.json(
        { message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }) as AuthRouteHandler
);
