import { NextRequest, NextResponse } from 'next/server';

/**
 * Returns all selectable tags available for users/queries
 * Does not require Admin role
 *
 * Route: GET /api/tags/selectable
 * Auth Required: Yes
 * Admin Required: No
 */
export async function GET(request: NextRequest) {
  // Implementation goes here
  return NextResponse.json({ tags: [] }, { status: 200 });
}
