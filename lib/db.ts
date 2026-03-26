// Prisma client singleton for Next.js
// Next.js hot reload in dev creates multiple Prisma instances — prevent this by
// attaching the client to globalThis and reusing it across reloads
// In production, always create a fresh instance
// Use Neon serverless adapter (@prisma/adapter-neon) initialised with DATABASE_URL
// Export the single instance as `db`