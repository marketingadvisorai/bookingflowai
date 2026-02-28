import { eq } from 'drizzle-orm';
import type { DrizzleDb } from '../client';
import { users, sessions } from '../schema';
import type { User } from '@/lib/auth/types';
import type { Session } from '@/lib/auth/types';

function toUser(r: typeof users.$inferSelect): User {
  const u: User = {
    userId: r.userId, orgId: r.orgId, email: r.email,
    passwordHash: r.passwordHash, role: r.role as User['role'],
    createdAt: r.createdAt,
  };
  if (r.authProvider) u.authProvider = r.authProvider as User['authProvider'];
  if (r.firstName) u.firstName = r.firstName;
  if (r.lastName) u.lastName = r.lastName;
  if (r.phone) u.phone = r.phone;
  if (r.picture) u.picture = r.picture;
  if (r.locale) u.locale = r.locale;
  if (r.lastLoginAt) u.lastLoginAt = r.lastLoginAt;
  if (r.loginCount != null) u.loginCount = r.loginCount;
  return u;
}

function fromUser(u: User) {
  return {
    userId: u.userId, orgId: u.orgId, email: u.email,
    passwordHash: u.passwordHash, role: u.role, createdAt: u.createdAt,
    authProvider: u.authProvider ?? null, firstName: u.firstName ?? null,
    lastName: u.lastName ?? null, phone: u.phone ?? null,
    picture: u.picture ?? null, locale: u.locale ?? null,
    lastLoginAt: u.lastLoginAt ?? null, loginCount: u.loginCount ?? null,
  };
}

function toSession(row: typeof sessions.$inferSelect): Session {
  return row as Session;
}

export function createUserRepo(db: DrizzleDb) {
  return {
    async getUserByEmail(email: string): Promise<User | null> {
      const rows = await db.select().from(users).where(eq(users.email, email));
      return rows[0] ? toUser(rows[0]) : null;
    },
    async getUserById(userId: string): Promise<User | null> {
      const rows = await db.select().from(users).where(eq(users.userId, userId));
      return rows[0] ? toUser(rows[0]) : null;
    },
    async putUser(user: User): Promise<void> {
      const values = fromUser(user);
      const { userId: _, ...updateValues } = values;
      await db.insert(users).values(values)
        .onConflictDoUpdate({ target: users.userId, set: updateValues });
    },
    async scanAllUsers(): Promise<User[]> {
      return (await db.select().from(users)).map(toUser);
    },
    async getSession(sessionToken: string): Promise<Session | null> {
      const rows = await db.select().from(sessions).where(eq(sessions.sessionToken, sessionToken));
      const ses = rows[0] ? toSession(rows[0]) : null;
      if (!ses) return null;
      if (new Date(ses.expiresAt).getTime() <= Date.now()) return null;
      return ses;
    },
    async putSession(session: Session): Promise<void> {
      await db.insert(sessions).values(session)
        .onConflictDoUpdate({ target: sessions.sessionToken, set: session });
    },
    async deleteSession(sessionToken: string): Promise<void> {
      await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
    },
    async deleteSessionsForUser(userId: string): Promise<void> {
      await db.delete(sessions).where(eq(sessions.userId, userId));
    },
  };
}
