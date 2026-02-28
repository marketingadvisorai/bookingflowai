import Redis from 'ioredis';

let client: Redis | null = null;

function getClient(): Redis {
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

/** Get cached value, or compute + cache it. TTL in seconds. */
export async function cached<T>(
  key: string,
  ttlSec: number,
  compute: () => Promise<T>,
): Promise<T> {
  try {
    const redis = getClient();
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit) as T;

    const value = await compute();
    // Fire-and-forget cache write
    redis.set(key, JSON.stringify(value), 'EX', ttlSec).catch(() => {});
    return value;
  } catch {
    // Cache down? Just compute directly.
    return compute();
  }
}

/** Invalidate a specific key or pattern. */
export async function invalidate(key: string): Promise<void> {
  try {
    const redis = getClient();
    if (key.includes('*')) {
      const keys = await redis.keys(key);
      if (keys.length) await redis.del(...keys);
    } else {
      await redis.del(key);
    }
  } catch {
    // Cache down, nothing to invalidate
  }
}

/** Invalidate all keys for an org. */
export async function invalidateOrg(orgId: string): Promise<void> {
  await invalidate(`bf:${orgId}:*`);
}
