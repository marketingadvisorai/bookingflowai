import type { Db } from '@/lib/db/types';
import { createDrizzle } from './client';
import { createRepos } from './repos';

export function createPostgresDb(): Db {
  const drizzle = createDrizzle();
  return createRepos(drizzle);
}

export { closePool } from './client';
