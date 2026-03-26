// Faculty role guard — wraps withAuth
// Usage: export const POST = withFaculty(async (request, context, user) => { ... })
//
// Logic:
// - First applies withAuth to ensure user is authenticated
// - Then checks user.role === 'FACULTY' || user.role === 'ADMIN'
// - ADMIN users pass this check (admins can do everything faculty can)
// - If neither: return NextResponse.json({ error: 'Forbidden: Faculty access required' }, { status: 403 })
// - If allowed: call the wrapped handler