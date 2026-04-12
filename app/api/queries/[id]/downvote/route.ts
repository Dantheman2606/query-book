import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import { withRateLimit } from '@/middleware/rateLimiter';
import { toggleQueryDownvote } from '@/services/vote.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Toggle downvote on a query
 * Similar logic to upvote (toggle behavior)
 * Updates vote count in database
 * Returns updated vote count or status
 *
 * Route: PUT /api/queries/:id/downvote
 * Auth Required: Yes
 * Rate Limit: 30 requests per 60 seconds per IP
 */
export const PUT = withRateLimit(
  withAuth(
    (async (request, context, user) => {
      try {
        const { id } = context.params;
        const result = await toggleQueryDownvote(id, user.id);

        return NextResponse.json(
          { message: 'Vote updated', ...result },
          { status: 200 }
        );
      } catch (error) {
        console.error('Error downvoting query:', error);

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
