import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from './requireAuth';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Higher-order function that wraps a Next.js API route handler with admin authorization.
 * First checks authentication via withAuth, then verifies the user has ADMIN role.
 *
 * @param handler - The original route handler function
 * @returns A wrapped handler that checks both authentication and admin role
 *
 * @example
 * export const DELETE = withAdmin(async (request, context, user) => {
 *   // user is guaranteed to be authenticated and have ADMIN role
 *   return NextResponse.json({ deleted: true });
 * });
 */
export function withAdmin(handler: AuthRouteHandler) {
  return withAuth(async (request, context, user) => {
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    return handler(request, context, user);
  });
}