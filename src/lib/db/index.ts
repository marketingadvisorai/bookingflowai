import type { Db } from '@/lib/db/types';
import { memoryDbSingleton } from '@/lib/db/memory/db';
import { createPostgresDb } from '@/lib/db/postgres';

let SINGLETON: Db | null = null;

function resolveDriver(): string {
  const explicit = process.env.DB_DRIVER ?? process.env.BF_DB_PROVIDER ?? null;
  if (explicit) return explicit;
  if (process.env.DATABASE_URL) return 'postgres';
  return 'memory';
}

export function getDb(): Db {
  const driver = resolveDriver();

  if (driver === 'memory') return memoryDbSingleton;

  if (SINGLETON) return SINGLETON;

  if (driver === 'postgres') {
    SINGLETON = createPostgresDb();
    return SINGLETON;
  }

  throw new Error(`Unsupported DB_DRIVER: ${driver}. Only 'postgres' and 'memory' are supported.`);
}
