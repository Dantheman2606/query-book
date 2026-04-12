import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import { withFaculty } from '@/middleware/requireFaculty';
import { withRateLimit } from '@/middleware/rateLimiter';
import {
  UpdateAnnouncementSchema,
  type UpdateAnnouncement,
} from '@/schemas/announcement';
import {
  getAnnouncementById,
  deleteAnnouncement,
} from '@/services/announcement.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Get announcement by ID
 * Route: GET /api/announcements/:id
 * Auth Required: Yes
 */
export const GET = withAuth(
  (async (request, context, user) => {
    try {
      const { id } = context.params;
      const announcement = await getAnnouncementById(id);

      return NextResponse.json(
        { announcement },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error fetching announcement:', error);

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
 * Delete announcement by ID (Faculty only)
 * Route: DELETE /api/announcements/:id
 * Auth Required: Yes | Faculty Required: Yes
 * Rate Limit: 10 requests per 60 seconds per IP
 */
export const DELETE = withRateLimit(
  withFaculty(
    (async (request, context, user) => {
      try {
        const { id } = context.params;
        await deleteAnnouncement(id, user.id, user.role);

        return NextResponse.json(
          { message: 'Announcement deleted successfully' },
          { status: 200 }
        );
      } catch (error) {
        console.error('Error deleting announcement:', error);

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
