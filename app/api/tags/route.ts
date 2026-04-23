import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/middleware/requireAdmin';
import { withRateLimit } from '@/middleware/rateLimiter';
import {
  CreateTagSchema,
  TagFilterSchema,
  type CreateTag,
  type TagFilter,
} from '@/schemas/tag';
import {
  createTag,
  getTags,
} from '@/services/tag.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Create a new tag (Admin only)
 * Route: POST /api/tags
 * Auth Required: Yes | Admin Required: Yes
 * Rate Limit: 10 requests per 60 seconds per IP
 */
export const POST = withRateLimit(
  withAdmin(
    (async (request, context, user) => {
      try {
        const body = await request.json();
        const result = CreateTagSchema.safeParse(body);

        if (!result.success) {
          return NextResponse.json(
            {
              error: 'Validation failed',
              fields: result.error.flatten().fieldErrors,
            },
            { status: 422 }
          );
        }

        const data: CreateTag = result.data;
        const tag = await createTag(data);

        return NextResponse.json(
          { message: 'Tag created successfully', tag },
          { status: 201 }
        );
      } catch (error) {
        console.error('Error creating tag:', error);

        if (error instanceof SyntaxError) {
          return NextResponse.json(
            { error: 'Invalid JSON in request body' },
            { status: 400 }
          );
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        const status = message.includes('already') ? 409 : 500;

        return NextResponse.json(
          { message: 'Server error', error: message },
          { status }
        );
      }
    }) as AuthRouteHandler
  ),
  { type: 'auth' }
);

/**
 * Get all tags (Admin only)
 * Supports filtering, searching, and pagination
 * Route: GET /api/tags
 * Auth Required: Yes | Admin Required: Yes
 * Rate Limit: 100 requests per 60 seconds per IP
 */
export const GET = withRateLimit(
  withAdmin(
    (async (request, context, user) => {
      try {
        const searchParams = new URL(request.url).searchParams;
        const filters: Partial<TagFilter> = {
          search: searchParams.get('search') || undefined,
          sortBy: (searchParams.get('sortBy') as 'name' | 'popularity') || 'name',
          limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
          offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
        };

        const validatedFilters = TagFilterSchema.parse(filters);
        const result = await getTags(validatedFilters);

        return NextResponse.json(result, { status: 200 });
      } catch (error) {
        console.error('Error fetching tags:', error);
        return NextResponse.json(
          { message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }) as AuthRouteHandler
  ),
  { type: 'general' }
);
