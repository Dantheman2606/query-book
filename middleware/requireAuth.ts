import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return handler(request, context, user);
  };
}