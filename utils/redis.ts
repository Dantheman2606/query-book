import { createClient } from 'redis';

/**
 * Redis client for rate limiting
 * Uses REDIS_URL when provided, otherwise falls back to local Redis.
 */
export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redis.connect().catch((err) => {
  console.error('Failed to connect to Redis:', err);
});