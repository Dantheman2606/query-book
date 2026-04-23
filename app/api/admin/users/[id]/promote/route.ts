import { NextResponse } from 'next/server';
import { withAdmin } from '@/middleware/requireAdmin';
import { withRateLimit } from '@/middleware/rateLimiter';
import { promoteStudentToFaculty } from '@/services/admin.service';
import type { AuthRouteHandler } from '@/types/middleware';

export const PUT = withRateLimit(
  withAdmin(
    (async (request, context, user) => {
      try {
        const { id } = context.params;
        const updatedUser = await promoteStudentToFaculty(id, user.id);

        return NextResponse.json(
          {
            message: 'User role updated successfully',
            user: updatedUser,
          },
          { status: 200 }
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const status = message.includes('not found') ? 404 : 400;

        return NextResponse.json(
          {
            message: 'Unable to update role',
            error: message,
          },
          { status }
        );
      }
    }) as AuthRouteHandler
  ),
  { type: 'auth' }
);
