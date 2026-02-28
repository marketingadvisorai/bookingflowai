import type { Db } from '@/lib/db/types';
import { createDynamoDb } from '@/lib/db/dynamo/db';
import { memoryDbSingleton } from '@/lib/db/memory/db';
import { createPostgresDb } from '@/lib/db/postgres';

let SINGLETON: Db | null = null;

function resolveDriver(): string {
  const explicit = process.env.DB_DRIVER ?? process.env.BF_DB_PROVIDER ?? null;
  if (explicit) return explicit;
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) return 'postgres';
  if (process.env.NODE_ENV === 'production') return 'dynamo';
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

  if (driver === 'dynamo') {
    SINGLETON = createDynamoDb();
    return SINGLETON;
  }

  throw new Error(`Unsupported DB_DRIVER: ${driver}`);
}
