import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import { checkUserRole } from '@/services/user.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Check the current user's role
 * Route: GET /api/users/checkUserRole
 * Auth Required: Yes
 */
export const GET = withAuth(
  (async (request, context, user) => {
    try {
      const roleInfo = await checkUserRole(user.id);

      return NextResponse.json(
        { ...roleInfo, hasRole: true },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error checking user role:', error);

      const message = error instanceof Error ? error.message : 'Unknown error';
      const status = message.includes('not found') ? 404 : 500;

      return NextResponse.json(
        { message: 'Server error', error: message },
        { status }
      );
    }
  }) as AuthRouteHandler
);
