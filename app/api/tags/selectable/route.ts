import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import { getSelectableTags } from '@/services/tag.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Get all selectable tags for creating/editing queries
 * No admin role required
 *
 * Route: GET /api/tags/selectable
 * Auth Required: Yes
 * Admin Required: No
 */
export const GET = withAuth(
  (async (request, context, user) => {
    try {
      const tags = await getSelectableTags();

      return NextResponse.json(
        { tags },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error fetching selectable tags:', error);
      return NextResponse.json(
        { message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }) as AuthRouteHandler
);
