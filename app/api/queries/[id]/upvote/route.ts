import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import { withRateLimit } from '@/middleware/rateLimiter';
import { toggleQueryUpvote } from '@/services/vote.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Toggle upvote on a query
 * If user has downvoted, removes downvote and adds upvote
 * If user has upvoted, removes upvote (toggle)
 * Updates vote count in database
 *
 * Route: PUT /api/queries/:id/upvote
 * Auth Required: Yes
 * Rate Limit: 30 requests per 60 seconds per IP
 */
export const PUT = withRateLimit(
  withAuth(
    (async (request, context, user) => {
      try {
        const { id } = await context.params;
        const result = await toggleQueryUpvote(id, user.id);

        return NextResponse.json(
          { message: 'Vote updated', ...result },
          { status: 200 }
        );
      } catch (error) {
        console.error('Error upvoting query:', error);

        const message = error instanceof Error ? error.message : 'Unknown error';
        const status = message.includes('not found') ? 404 : 500;

        return NextResponse.json(
          { message: 'Server error', error: message },
          { status }
        );
      }
    }) as AuthRouteHandler
  ),
  { type: 'auth' }
);
