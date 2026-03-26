// Upstash Redis sliding window rate limiter
// Two limiters to create:
//   generalLimiter: 100 requests per 60 seconds per IP
//   authLimiter: 10 requests per 60 seconds per IP (stricter, for auth routes)
//
// Usage: export const POST = withRateLimit(handler, { type: 'auth' })
//        export const GET  = withRateLimit(handler, { type: 'general' })
//
// Logic:
// - Extract IP from request.headers.get('x-forwarded-for') or fallback to '127.0.0.1'
// - Choose limiter based on options.type
// - Call limiter.limit(ip)
// - If blocked: return NextResponse.json({ error: 'Too many requests', retryAfter: result.reset }, { status: 429 })
// - Set response headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
// - If allowed: call the wrapped handler