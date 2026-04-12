import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import {
  getQueryById,
  deleteQuery,
} from '@/services/query.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Get a specific query by ID with details
 * Route: GET /api/queries/:id
 * Auth Required: Yes
 */
export const GET = withAuth(
  (async (request, context, user) => {
    try {
      const { id } = context.params;
      const query = await getQueryById(id);

      return NextResponse.json(
        { query },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error fetching query:', error);

      const message = error instanceof Error ? error.message : 'Unknown error';
      const status = message.includes('not found') ? 404 : 500;

      return NextResponse.json(
        { message: 'Server error', error: message },
        { status }
      );
    }
  }) as AuthRouteHandler
);

/**
 * Delete a query by ID
 * Authorization: User must own the query or be Admin
 * Route: DELETE /api/queries/:id
 * Auth Required: Yes
 */
export const DELETE = withAuth(
  (async (request, context, user) => {
    try {
      const { id } = context.params;
      await deleteQuery(id, user.id, user.role);

      return NextResponse.json(
        { message: 'Query deleted successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error deleting query:', error);

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
);
