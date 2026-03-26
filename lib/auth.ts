// Auth.js v5 configuration for Next.js
// Configure with Credentials provider:
//   - Accepts email and password
//   - Validates credentials against DB (find user by email, compare bcrypt hash)
//   - Returns user object on success, null on failure
// Callbacks:
//   - jwt callback: attach user.id, user.role, user.emailVerified to the token
//   - session callback: attach token.id, token.role to session.user
// Session strategy: JWT
// Export: auth, signIn, signOut, handlers (GET and POST for /api/auth/[...nextauth])
// Also export a helper getCurrentUser() that calls auth() and returns session.user or null