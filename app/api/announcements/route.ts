import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import { withFaculty } from '@/middleware/requireFaculty';
import { withRateLimit } from '@/middleware/rateLimiter';
import { db } from '@/lib/db';
import {
  CreateAnnouncementSchema,
  AnnouncementFilterSchema,
  type CreateAnnouncement,
  type AnnouncementFilter,
} from '@/schemas/announcement';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Creates a new announcement
 * Only accessible by Faculty (Faculty Required: Yes)
 * Validates title and content
 * Returns created announcement with user details
 *
 * Route: POST /api/announcements
 * Auth Required: Yes
 * Faculty Required: Yes
 * Rate Limit: 10 requests per 60 seconds per IP
 */
export const POST = withRateLimit(
  withFaculty(
    (async (request, context, user) => {
      try {
        // Parse and validate request body
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

        // Create announcement in database
        const announcement = await db.announcement.create({
          data: {
            title: data.title,
            content: data.content,
            postedBy: user.name,
            userId: user.id,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        });

        return NextResponse.json(
          { message: 'Announcement posted successfully', announcement },
          { status: 201 }
        );
      } catch (error) {
        console.error('Error creating announcement:', error);

        // Handle JSON parse errors
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
 * Returns all announcements
 * Supports filtering, searching, and sorting
 * Accessible by any authenticated user
 *
 * Query Parameters:
 * - search: Search in title/content (optional)
 * - sortBy: 'recent' or 'oldest' (default: 'recent')
 * - limit: Number of results (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
 *
 * Route: GET /api/announcements
 * Auth Required: Yes
 * Faculty Required: No
 * Rate Limit: 100 requests per 60 seconds per IP
 */
export const GET = withRateLimit(
  withAuth(
    (async (request, context, user) => {
      try {
        // Parse query parameters
        const searchParams = new URL(request.url).searchParams;
        const filters: Partial<AnnouncementFilter> = {
          search: searchParams.get('search') || undefined,
          sortBy: (searchParams.get('sortBy') as 'recent' | 'oldest') || 'recent',
          limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
          offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
        };

        // Validate query parameters
        const validatedFilters = AnnouncementFilterSchema.parse(filters);

        // Build query filters
        const where: any = {};
        if (validatedFilters.search) {
          where.OR = [
            { title: { contains: validatedFilters.search, mode: 'insensitive' } },
            { content: { contains: validatedFilters.search, mode: 'insensitive' } },
          ];
        }

        // Fetch announcements
        const announcements = await db.announcement.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            datePosted: validatedFilters.sortBy === 'recent' ? 'desc' : 'asc',
          },
          take: validatedFilters.limit,
          skip: validatedFilters.offset,
        });

        // Get total count for pagination
        const total = await db.announcement.count({ where });

        return NextResponse.json(
          {
            announcements,
            pagination: {
              total,
              limit: validatedFilters.limit,
              offset: validatedFilters.offset,
              hasMore: validatedFilters.offset + validatedFilters.limit < total,
            },
          },
          { status: 200 }
        );
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
