import { NextResponse } from 'next/server';
import { withAdmin } from '@/middleware/requireAdmin';
import { withRateLimit } from '@/middleware/rateLimiter';
import { deleteTag } from '@/services/tag.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Delete a tag (Admin only)
 * Route: DELETE /api/tags/:id
 * Auth Required: Yes | Admin Required: Yes
 */
export const DELETE = withRateLimit(
  withAdmin(
    (async (request, context) => {
      try {
        const { id } = context.params;
        await deleteTag(id);

        return NextResponse.json({ message: 'Tag deleted successfully' }, { status: 200 });
      } catch (error) {
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
