import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export type DrizzleDb = ReturnType<typeof createDrizzle>;

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

export function createDrizzle() {
  return drizzle(getPool(), { schema });
}

let drizzleInstance: DrizzleDb | null = null;

export function getPostgresClient(): DrizzleDb {
  if (!drizzleInstance) {
    drizzleInstance = createDrizzle();
  }
  return drizzleInstance;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
