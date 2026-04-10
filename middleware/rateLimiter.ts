import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/utils/redis';
import type { RouteHandler, LimiterType } from '@/types/middleware';

// Rate limiters configuration
const generalLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '60 s'),
  analytics: true,
});

const authLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true,
});

/**
 * Higher-order function that wraps a Next.js API route handler with rate limiting.
 * Protects endpoints from abuse by limiting requests per IP per time window.
 *
 * @param handler - The original route handler function
 * @param options - Configuration options { type: 'auth' | 'general' }
 * @returns A wrapped handler that enforces rate limits
 *
 * @example
 * export const POST = withRateLimit(handler, { type: 'auth' })
 * export const GET = withRateLimit(handler, { type: 'general' })
 */
export function withRateLimit(handler: RouteHandler, options: { type: LimiterType }) {
  return async (request: NextRequest, context?: any) => {
    // Extract client IP from headers
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // Select appropriate limiter
    const limiter = options.type === 'auth' ? authLimiter : generalLimiter;

    // Check rate limit
    const { success, limit, remaining, reset } = await limiter.limit(ip);

    // Create response headers
    const headers = new Headers({
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(reset).toISOString(),
    });

    // If rate limit exceeded
    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter,
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Call the handler and attach rate limit headers to response
    const response = await handler(request, context);
    
    // Copy rate limit headers to response
    headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    return response;
  };
}