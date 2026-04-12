import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import { withRateLimit } from '@/middleware/rateLimiter';
import { toggleReplyDownvote } from '@/services/vote.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Toggle downvote on a reply
 * Toggle behavior: add/remove/switch vote
 * Updates vote count on the reply
 *
 * Route: PUT /api/replies/:id/downvote
 * Auth Required: Yes
 * Rate Limit: 30 requests per 60 seconds per IP
 */
export const PUT = withRateLimit(
  withAuth(
    (async (request, context, user) => {
      try {
        const { id } = context.params;
        const result = await toggleReplyDownvote(id, user.id);

        return NextResponse.json(
          { message: 'Vote updated', ...result },
          { status: 200 }
        );
      } catch (error) {
        console.error('Error downvoting reply:', error);

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
