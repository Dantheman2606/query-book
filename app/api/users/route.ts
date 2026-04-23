import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/middleware/requireAdmin';
import { withRateLimit } from '@/middleware/rateLimiter';
import { getUsers } from '@/services/user.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Get all users (Admin only)
 * Route: GET /api/users
 * Auth Required: Yes | Admin Required: Yes
 * Rate Limit: 50 requests per 60 seconds per IP
 */
export const GET = withRateLimit(
  withAdmin(
    (async (request, context, user) => {
      try {
        const searchParams = new URL(request.url).searchParams;
        const search = searchParams.get('search') || undefined;
        const limit = Number(searchParams.get('limit') || '20');
        const offset = Number(searchParams.get('offset') || '0');

        const result = await getUsers({ search, limit, offset });

        return NextResponse.json(
          result,
          { status: 200 }
        );
      } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
          { message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }) as AuthRouteHandler
  ),
  { type: 'general' }
);
