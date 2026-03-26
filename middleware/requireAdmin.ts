// Admin role guard — wraps withAuth
// Usage: export const GET = withAdmin(async (request, context, user) => { ... })
//
// Logic:
// - First applies withAuth to ensure user is authenticated
// - Then checks user.role === 'ADMIN'
// - If not admin: return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
// - If admin: call the wrapped handler with request, context, user