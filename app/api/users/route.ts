import { NextRequest, NextResponse } from 'next/server';

/**
 * Returns a list of all users
 * Only accessible by authenticated users (and possibly admin depending on requirements, though doc says "Auth Required: Yes")
 *
 * Route: GET /api/users
 * Auth Required: Yes
 */
export async function GET(request: NextRequest) {
  // Implementation goes here
  return NextResponse.json({ users: [] }, { status: 200 });
}
