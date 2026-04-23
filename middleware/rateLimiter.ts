import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/utils/redis';
import { recordRateLimitCheck } from '@/lib/adminTelemetry';
import type { RouteHandler, LimiterType } from '@/types/middleware';

/**
 * Simple rate limiter using Redis counter with TTL
 */
async function checkRateLimit(
  key: string,
  limit: number,
  window: number
): Promise<{ success: boolean; remaining: number; reset: number; hadError: boolean }> {
  const now = Date.now();
  const resetTime = now + window * 1000;

  try {
    // Increment the counter for this key
    const current = await redis.incr(key);

    // Set expiration on first request
    if (current === 1) {
      await redis.expire(key, window);
    }

    // Get the TTL to calculate reset time
    const ttl = await redis.ttl(key);
    const reset = now + (ttl > 0 ? ttl * 1000 : window * 1000);

    if (current <= limit) {
      return {
        success: true,
        remaining: Math.max(0, limit - current),
        reset,
        hadError: false,
      };
    }

    return {
      success: false,
      remaining: 0,
      reset,
      hadError: false,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Allow request if Redis fails
    const reset = now + window * 1000;
    return {
      success: true,
      remaining: limit - 1,
      reset,
      hadError: true,
    };
  }
}

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

    // Select rate limit parameters
    const limits = {
      auth: { limit: 10, window: 60 },
      general: { limit: 100, window: 60 },
    };
    const { limit, window } = limits[options.type];

    // Check rate limit
    const rateLimitKey = `ratelimit:${options.type}:${ip}`;
    const { success, remaining, reset, hadError } = await checkRateLimit(rateLimitKey, limit, window);

    recordRateLimitCheck({
      method: request.method,
      path: request.nextUrl.pathname,
      ip,
      exceeded: !success,
      hadError,
    });

    // Create response headers
    const headers = new Headers({
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': Math.max(0, remaining).toString(),
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