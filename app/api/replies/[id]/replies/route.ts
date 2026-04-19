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
      const queryId = searchParams.get('queryId');

      // Backward-compatible behavior:
      // - /api/replies/:id/replies?queryId=:queryId -> children for parent reply :id
      // - /api/replies/:id/replies -> top-level replies for query :id
      const effectiveQueryId = queryId ?? id;
      const effectiveParentId = queryId ? id : null;

      const filters: Partial<ReplyFilter> = {
        queryId: effectiveQueryId,
        parentId: effectiveParentId,
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
