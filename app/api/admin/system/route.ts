import { NextResponse } from 'next/server';
import { withAdmin } from '@/middleware/requireAdmin';
import { withRateLimit } from '@/middleware/rateLimiter';
import { getAdminSystemMetrics } from '@/services/admin.service';
import type { AuthRouteHandler } from '@/types/middleware';

export const GET = withRateLimit(
  withAdmin(
    (async () => {
      try {
        const metrics = await getAdminSystemMetrics();
        return NextResponse.json({ metrics }, { status: 200 });
      } catch (error) {
        return NextResponse.json(
          {
            message: 'Server error',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 }
        );
      }
    }) as AuthRouteHandler
  ),
  { type: 'general' }
);
