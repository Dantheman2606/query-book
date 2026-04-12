import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import { getQueryVotes, getQueryVote } from '@/services/vote.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Get vote count for a query
 * Also returns user's vote status if authenticated
 *
 * Route: GET /api/queries/:id/votes
 * Auth Required: Yes
 */
export const GET = withAuth(
  (async (request, context, user) => {
    try {
      const { id } = context.params;
      const votes = await getQueryVotes(id);
      const userVote = await getQueryVote(id, user.id);

      return NextResponse.json(
        { ...votes, userVote },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error fetching query votes:', error);

      const message = error instanceof Error ? error.message : 'Unknown error';
      const status = message.includes('not found') ? 404 : 500;

      return NextResponse.json(
        { message: 'Server error', error: message },
        { status }
      );
    }
  }) as AuthRouteHandler
);
