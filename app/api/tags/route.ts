import { NextRequest, NextResponse } from 'next/server';

/**
 * Creates a new tag
 * Only accessible by Admin (Admin Required: Yes)
 * Validates request body for tag name and properties
 * Returns the created tag object
 *
 * Route: POST /api/tags
 * Auth Required: Yes
 * Admin Required: Yes
 */
export async function POST(request: NextRequest) {
  // Implementation goes here
  return NextResponse.json({ tag: 'new_tag' }, { status: 201 });
}

/**
 * Returns all tags in the system
 * Can include query params for filtering
 * Only accessible by Admin (Admin Required: Yes)
 *
 * Route: GET /api/tags
 * Auth Required: Yes
 * Admin Required: Yes
 */
export async function GET(request: NextRequest) {
  // Implementation goes here
  return NextResponse.json({ tags: [] }, { status: 200 });
}
