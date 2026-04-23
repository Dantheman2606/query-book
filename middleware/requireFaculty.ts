import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from './requireAuth';
import type { AuthRouteHandler } from '@/types/middleware';

/**
 * Higher-order function that wraps a Next.js API route handler with faculty authorization.
 * First checks authentication via withAuth, then verifies the user has FACULTY or ADMIN role.
 * Admin users are implicitly allowed (admins can perform all faculty actions).
 *
 * @param handler - The original route handler function
 * @returns A wrapped handler that checks both authentication and faculty/admin role
 *
 * @example
 * export const POST = withFaculty(async (request, context, user) => {
 *   // user is guaranteed to be authenticated and have FACULTY or ADMIN role
 *   return NextResponse.json({ created: true });
 * });
 */
export function withFaculty(handler: AuthRouteHandler) {
  return withAuth(async (request, context, user) => {
    if (user.role !== 'faculty' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Faculty access required' },
        { status: 403 }
      );
    }

    return handler(request, context, user);
  });
}