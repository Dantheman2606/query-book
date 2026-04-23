import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/middleware/requireAdmin';
import { withRateLimit } from '@/middleware/rateLimiter';
import { getAdminAuditLogs } from '@/services/admin.service';
import type { AuthRouteHandler } from '@/types/middleware';

export const GET = withRateLimit(
  withAdmin(
    (async (request: NextRequest) => {
      try {
        const searchParams = new URL(request.url).searchParams;
        const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit') || 100)));
        const offset = Math.max(0, Number(searchParams.get('offset') || 0));
        const search = searchParams.get('search') || undefined;

        const result = await getAdminAuditLogs({ limit, offset, search });
        return NextResponse.json(result, { status: 200 });
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
