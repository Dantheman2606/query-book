import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import { withFaculty } from '@/middleware/requireFaculty';
import { withRateLimit } from '@/middleware/rateLimiter';
import {
  CreateAnnouncementSchema,
  AnnouncementFilterSchema,
  type CreateAnnouncement,
  type AnnouncementFilter,
} from '@/schemas/announcement';
import {
  createAnnouncement,
  getAnnouncements,
} from '@/services/announcement.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Creates a new announcement (Faculty only)
 * Route: POST /api/announcements
 * Auth Required: Yes | Faculty Required: Yes
 * Rate Limit: 10 requests per 60 seconds per IP
 */
export const POST = withRateLimit(
  withFaculty(
    (async (request, context, user) => {
      try {
        const body = await request.json();
        const result = CreateAnnouncementSchema.safeParse(body);

        if (!result.success) {
          return NextResponse.json(
            {
              error: 'Validation failed',
              fields: result.error.flatten().fieldErrors,
            },
            { status: 422 }
          );
        }

        const data: CreateAnnouncement = result.data;
        const announcement = await createAnnouncement(data, user.id, user.name);

        return NextResponse.json(
          { message: 'Announcement posted successfully', announcement },
          { status: 201 }
        );
      } catch (error) {
        console.error('Error creating announcement:', error);

        if (error instanceof SyntaxError) {
          return NextResponse.json(
            { error: 'Invalid JSON in request body' },
            { status: 400 }
          );
        }

        return NextResponse.json(
          { message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }) as AuthRouteHandler
  ),
  { type: 'auth' }
);

/**
 * Returns all announcements with filtering and pagination
 * Route: GET /api/announcements
 * Auth Required: Yes
 * Rate Limit: 100 requests per 60 seconds per IP
 */
export const GET = withRateLimit(
  withAuth(
    (async (request, context, user) => {
      try {
        const searchParams = new URL(request.url).searchParams;
        const filters: Partial<AnnouncementFilter> = {
          search: searchParams.get('search') || undefined,
          sortBy: (searchParams.get('sortBy') as 'recent' | 'oldest') || 'recent',
          limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
          offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
        };

        const validatedFilters = AnnouncementFilterSchema.parse(filters);
        const result = await getAnnouncements(validatedFilters);

        return NextResponse.json(result, { status: 200 });
      } catch (error) {
        console.error('Error fetching announcements:', error);
        return NextResponse.json(
          { message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }) as AuthRouteHandler
  ),
  { type: 'general' }
);
