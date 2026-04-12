import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import { withRateLimit } from '@/middleware/rateLimiter';
import {
  CreateReplySchema,
  type CreateReply,
} from '@/schemas/reply';
import { createReply } from '@/services/reply.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Create a new reply to a query
 * Route: POST /api/queries/:id/reply
 * Auth Required: Yes
 * Rate Limit: 30 requests per 60 seconds per IP
 */
export const POST = withRateLimit(
  withAuth(
    (async (request, context, user) => {
      try {
        const { id } = context.params;
        const body = await request.json();

        // Add queryId from URL params
        const dataWithQuery = { ...body, queryId: id };
        const result = CreateReplySchema.safeParse(dataWithQuery);

        if (!result.success) {
          return NextResponse.json(
            {
              error: 'Validation failed',
              fields: result.error.flatten().fieldErrors,
            },
            { status: 422 }
          );
        }

        const data: CreateReply = result.data;
        const reply = await createReply(data, user.id, user.name);

        return NextResponse.json(
          { message: 'Reply posted successfully', reply },
          { status: 201 }
        );
      } catch (error) {
        console.error('Error creating reply:', error);

        if (error instanceof SyntaxError) {
          return NextResponse.json(
            { error: 'Invalid JSON in request body' },
            { status: 400 }
          );
        }

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
