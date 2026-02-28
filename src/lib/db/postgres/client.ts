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

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
