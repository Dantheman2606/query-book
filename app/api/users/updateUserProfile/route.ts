import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/requireAuth';
import { withRateLimit } from '@/middleware/rateLimiter';
import {
  UserProfileUpdateSchema,
  type UserProfileUpdate,
} from '@/schemas/user';
import { updateUserProfile } from '@/services/user.service';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Update current user's profile
 * Route: PUT /api/users/updateUserProfile
 * Auth Required: Yes
 * Rate Limit: 10 requests per 60 seconds per IP
 */
export const PUT = withRateLimit(
  withAuth(
    (async (request, context, user) => {
      try {
        const body = await request.json();
        const result = UserProfileUpdateSchema.safeParse(body);

        if (!result.success) {
          return NextResponse.json(
            {
              error: 'Validation failed',
              fields: result.error.flatten().fieldErrors,
            },
            { status: 422 }
          );
        }

        const data: UserProfileUpdate = result.data;
        const updatedUser = await updateUserProfile(user.id, data, user.id, user.role);

        return NextResponse.json(
          { message: 'Profile updated successfully', user: updatedUser },
          { status: 200 }
        );
      } catch (error) {
        console.error('Error updating profile:', error);

        if (error instanceof SyntaxError) {
          return NextResponse.json(
            { error: 'Invalid JSON in request body' },
            { status: 400 }
          );
        }

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
