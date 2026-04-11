import { createClient } from 'redis';

/**
 * Redis client for rate limiting
 * Connects to local Docker Redis service on localhost:6379
 */
export const redis = createClient({
  url: 'redis://localhost:6379',
});

redis.connect().catch((err) => {
  console.error('Failed to connect to Redis:', err);
});