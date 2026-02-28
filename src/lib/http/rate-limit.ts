import Redis from 'ioredis';

let client: Redis | null = null;

function getRedis(): Redis {
  if (!client) {
    const url = process.env.CACHE_URL ?? 'redis://localhost:6380';
    client = new Redis(url, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
      connectTimeout: 3000,
    });
    client.on('error', () => {}); // Swallow — cache is optional
  }
  return client;
}

export function getClientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) {
    const first = xf.split(',')[0]?.trim();
    if (first) return first;
  }
  const xr = req.headers.get('x-real-ip');
  if (xr) return xr;
  return 'unknown';
}

/**
 * Valkey/Redis-backed rate limiter using INCR + EXPIRE (fixed window).
 * Falls back to in-memory if Valkey is unavailable, and to allow-all
 * if both fail (fail-open to avoid blocking legitimate users).
 */
export async function rateLimit(opts: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<{ ok: boolean; remaining: number; resetAt: number }> {
  const windowSec = Math.ceil(opts.windowMs / 1000);
  const redisKey = `bf:rl:${opts.key}`;

  try {
    const redis = getRedis();
    const count = await redis.incr(redisKey);

    // First request in window — set expiry
    if (count === 1) {
      await redis.expire(redisKey, windowSec);
    }

    const ttl = await redis.ttl(redisKey);
    const resetAt = Date.now() + (ttl > 0 ? ttl * 1000 : opts.windowMs);

    if (count > opts.limit) {
      return { ok: false, remaining: 0, resetAt };
    }

    return { ok: true, remaining: Math.max(0, opts.limit - count), resetAt };
  } catch {
    // Valkey down — fall back to in-memory
    console.warn('[rate-limit] Valkey unavailable, using in-memory fallback');
    return memoryRateLimit(opts);
  }
}

// In-memory fallback
type Bucket = { resetAt: number; count: number };
const BUCKETS = new Map<string, Bucket>();

function memoryRateLimit(opts: { key: string; limit: number; windowMs: number }) {
  const now = Date.now();
  for (const [k, b] of BUCKETS) {
    if (b.resetAt <= now) BUCKETS.delete(k);
  }

  const b = BUCKETS.get(opts.key);
  if (!b || b.resetAt <= now) {
    BUCKETS.set(opts.key, { resetAt: now + opts.windowMs, count: 1 });
    return { ok: true, remaining: opts.limit - 1, resetAt: now + opts.windowMs };
  }

  b.count += 1;
  if (b.count > opts.limit) {
    return { ok: false, remaining: 0, resetAt: b.resetAt };
  }

  return { ok: true, remaining: Math.max(0, opts.limit - b.count), resetAt: b.resetAt };
}
