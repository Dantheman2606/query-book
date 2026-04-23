import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import { getUserById } from '@/services/user.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Get user profile by ID
 * Route: GET /api/users/:id
 * Auth Required: Yes
 */
export const GET = withAuth(
  (async (request, context, user) => {
    try {
      const { id } = context.params;
      const userProfile = await getUserById(id);

      return NextResponse.json(
        { user: userProfile },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error fetching user:', error);

      const message = error instanceof Error ? error.message : 'Unknown error';
      const status = message.includes('not found') ? 404 : 500;

      return NextResponse.json(
        { message: 'Server error', error: message },
        { status }
      );
    }
  }) as AuthRouteHandler
);
