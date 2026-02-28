export type UserRole = 'owner' | 'admin';

export type AuthProvider = 'password' | 'google';

export type User = {
  userId: string;
  orgId: string;
  email: string;
  /** Empty for OAuth-only users */
  passwordHash: string;
  role: UserRole;
  createdAt: string; // ISO
  authProvider?: AuthProvider;
  firstName?: string;
  lastName?: string;
  phone?: string;
  
  // Google OAuth profile data
  picture?: string; // Google profile photo URL
  locale?: string; // User's language preference (e.g., "en-US")
  
  // Login tracking
  lastLoginAt?: string; // ISO timestamp of last login
  loginCount?: number; // Total number of logins
};

export type Session = {
  sessionToken: string;
  userId: string;
  orgId: string;
  createdAt: string; // ISO
  expiresAt: string; // ISO
};
