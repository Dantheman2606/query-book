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
 * Create a nested reply (reply to a reply)
 * Route: POST /api/replies/:id/reply-to-reply
 * Auth Required: Yes
 * Rate Limit: 30 requests per 60 seconds per IP
 */
export const POST = withRateLimit(
  withAuth(
    (async (request, context, user) => {
      try {
        const { id } = context.params;
        const body = await request.json();

        // Validate input
        if (!body.queryId) {
          return NextResponse.json(
            { error: 'queryId is required in request body' },
            { status: 400 }
          );
        }

        // Add parent reply ID
        const dataWithParent = { ...body, parentId: id };
        const result = CreateReplySchema.safeParse(dataWithParent);

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
          { message: 'Nested reply created successfully', reply },
          { status: 201 }
        );
      } catch (error) {
        console.error('Error creating nested reply:', error);

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
