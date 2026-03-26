// Authentication middleware helper for API route handlers
// Pattern: wraps a Next.js route handler function
//
// Usage in a route file:
//   export const GET = withAuth(async (request, context, user) => { ... })
//
// Logic:
// - Call getCurrentUser() from lib/auth.ts
// - If no session or no user: return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
// - If valid: call the wrapped handler, passing request, context, and the user object
// - The user object shape: { id, email, role, name }