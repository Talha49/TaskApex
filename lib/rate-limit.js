import { LRUCache } from 'lru-cache';

const rateLimitCache = new LRUCache({
  max: 500,
  ttl: 15 * 60 * 1000, // 15 minutes
});

export async function rateLimit(req, { max, windowMs }) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const key = `rate-limit:${ip}`;
  const current = rateLimitCache.get(key) || { count: 0, timestamp: Date.now() };

  if (Date.now() - current.timestamp > windowMs) {
    rateLimitCache.set(key, { count: 1, timestamp: Date.now() });
    return { success: true };
  }

  if (current.count >= max) {
    return { success: false };
  }

  rateLimitCache.set(key, { count: current.count + 1, timestamp: current.timestamp });
  return { success: true };
}