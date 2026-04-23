import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import { withRateLimit } from '@/middleware/rateLimiter';
import {
  CreateQuerySchema,
  QueryFilterSchema,
  type CreateQuery,
  type QueryFilter,
} from '@/schemas/query';
import {
  createQuery,
  getQueries,
} from '@/services/query.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Create a new query (question)
 * Route: POST /api/queries
 * Auth Required: Yes
 * Rate Limit: 20 requests per 60 seconds per IP
 */
export const POST = withRateLimit(
  withAuth(
    (async (request, context, user) => {
      try {
        const body = await request.json();
        const result = CreateQuerySchema.safeParse(body);

        if (!result.success) {
          return NextResponse.json(
            {
              error: 'Validation failed',
              fields: result.error.flatten().fieldErrors,
            },
            { status: 422 }
          );
        }

        const data: CreateQuery = result.data;
        const query = await createQuery(data, user.id, user.name);

        return NextResponse.json(
          { message: 'Query posted successfully', query },
          { status: 201 }
        );
      } catch (error) {
        console.error('Error creating query:', error);

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
 * Get all queries with filtering and pagination
 * Route: GET /api/queries
 * Auth Required: Yes
 * Rate Limit: 100 requests per 60 seconds per IP
 */
export const GET = withRateLimit(
  withAuth(
    (async (request, context, user) => {
      try {
        const searchParams = new URL(request.url).searchParams;
        const filters: Partial<QueryFilter> = {
          search: searchParams.get('search') || undefined,
          tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
          sortBy: (searchParams.get('sortBy') as 'recent' | 'popular' | 'trending') || 'recent',
          limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
          offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
        };

        const validatedFilters = QueryFilterSchema.parse(filters);
        const result = await getQueries(validatedFilters);

        return NextResponse.json(result, { status: 200 });
      } catch (error) {
        console.error('Error fetching queries:', error);
        return NextResponse.json(
          { message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }) as AuthRouteHandler
  ),
  { type: 'general' }
);
