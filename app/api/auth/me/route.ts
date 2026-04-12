import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import { getUserProfile } from '@/services/auth.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Get current user profile information
 * Uses JWT from Authorization header
 *
 * Route: GET /api/auth/me
 * Auth Required: Yes
 */
export const GET = withAuth(
  (async (request, context, user) => {
    try {
      const profile = await getUserProfile(user.id);
      return NextResponse.json(
        { user: profile },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json(
        { message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }) as AuthRouteHandler
);
