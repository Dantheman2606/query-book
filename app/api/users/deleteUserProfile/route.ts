import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import { withRateLimit } from '@/middleware/rateLimiter';
import { deleteUserProfile } from '@/services/user.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Delete current user's account
 * Performs soft delete via deactivation
 * Route: DELETE /api/users/deleteUserProfile
 * Auth Required: Yes
 * Rate Limit: 1 request per 60 seconds per IP
 */
export const DELETE = withRateLimit(
  withAuth(
    (async (request, context, user) => {
      try {
        await deleteUserProfile(user.id, user.id, user.role);

        return NextResponse.json(
          { message: 'Account deleted successfully' },
          { status: 200 }
        );
      } catch (error) {
        console.error('Error deleting profile:', error);

        const message = error instanceof Error ? error.message : 'Unknown error';
        let status = 500;

        if (message.includes('not found')) {
          status = 404;
        } else if (message.includes('Not authorized')) {
          status = 403;
        }

        return NextResponse.json(
          { message: 'Server error', error: message },
          { status }
        );
      }
    }) as AuthRouteHandler
  ),
  { type: 'auth' }
);
