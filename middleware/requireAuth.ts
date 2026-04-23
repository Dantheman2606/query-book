import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { recordApiRequest, recordAuthFailure } from '@/lib/adminTelemetry';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Higher-order function that wraps a Next.js API route handler with authentication.
 * Ensures the user is authenticated before allowing the handler to execute.
 *
 * @param handler - The original route handler function
 * @returns A wrapped handler that checks authentication
 *
 * @example
 * export const GET = withAuth(async (request, context, user) => {
 *   // user is guaranteed to exist here
 *   return NextResponse.json({ user });
 * });
 */
export function withAuth(handler: AuthRouteHandler) {
  return async (request: NextRequest, context?: any) => {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const user = await getCurrentUser(request);

    if (!user) {
      recordAuthFailure({
        method: request.method,
        path: request.nextUrl.pathname,
        ip,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authUser = user as { id: string; role: string };

    try {
      const response = await handler(request, context, user);

      recordApiRequest({
        method: request.method,
        path: request.nextUrl.pathname,
        statusCode: response.status,
        userId: authUser.id,
        userRole: authUser.role,
        ip,
      });

      return response;
    } catch (error) {
      recordApiRequest({
        method: request.method,
        path: request.nextUrl.pathname,
        statusCode: 500,
        userId: authUser.id,
        userRole: authUser.role,
        ip,
      });
      throw error;
    }
  };
}