import { z } from 'zod';

export const bookingTypeSchema = z.enum(['private', 'public']);

export const availabilityQuerySchema = z.object({
  orgId: z.string().min(1),
  gameId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: bookingTypeSchema,
  players: z.coerce.number().int().min(1).max(100).default(2),
});

export const createHoldBodySchema = z.object({
  orgId: z.string().min(1),
  gameId: z.string().min(1),
  roomId: z.string().min(1),
  bookingType: bookingTypeSchema,
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  players: z.number().int().min(1).max(100),
  customer: z.object({
    firstName: z.string().min(1, 'First name is required').optional(),
    lastName: z.string().optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('A valid email is required').optional(),
  }),
});

export const confirmBookingBodySchema = z.object({
  orgId: z.string().min(1),
  holdId: z.string().min(1),
  promoCode: z.string().min(1).max(64).optional(),
  customer: z
    .object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email('A valid email is required'),
    })
    .optional(),
});

// ── Validation Functions ──

/**
 * Validates orgId: alphanumeric + underscore + hyphen, max 64 chars
 */
export function validateOrgId(id: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof id !== 'string') {
    return { ok: false, error: 'orgId must be a string' };
  }
  
  const trimmed = id.trim();
  
  if (trimmed.length === 0) {
    return { ok: false, error: 'orgId cannot be empty' };
  }
  
  if (trimmed.length > 64) {
    return { ok: false, error: 'orgId too long (max 64 characters)' };
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return { ok: false, error: 'orgId contains invalid characters (allowed: a-z, A-Z, 0-9, _, -)' };
  }
  
  return { ok: true, value: trimmed };
}

/**
 * Validates email: proper format, max 254 chars (RFC 5321)
 */
export function validateEmail(email: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof email !== 'string') {
    return { ok: false, error: 'Email must be a string' };
  }
  
  const trimmed = email.trim().toLowerCase();
  
  if (trimmed.length === 0) {
    return { ok: false, error: 'Email cannot be empty' };
  }
  
  if (trimmed.length > 254) {
    return { ok: false, error: 'Email too long (max 254 characters)' };
  }
  
  // Basic email validation (RFC 5322 simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { ok: false, error: 'Invalid email format' };
  }
  
  return { ok: true, value: trimmed };
}

/**
 * Validates player count: positive integer, max 100
 */
export function validatePlayerCount(count: unknown): { ok: true; value: number } | { ok: false; error: string } {
  if (typeof count !== 'number' || !Number.isFinite(count)) {
    return { ok: false, error: 'Player count must be a number' };
  }
  
  if (!Number.isInteger(count)) {
    return { ok: false, error: 'Player count must be an integer' };
  }
  
  if (count < 1) {
    return { ok: false, error: 'Player count must be at least 1' };
  }
  
  if (count > 100) {
    return { ok: false, error: 'Player count too large (max 100)' };
  }
  
  return { ok: true, value: count };
}

/**
 * Validates date: ISO format (YYYY-MM-DD), not in past, not more than 90 days ahead
 */
export function validateDate(date: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof date !== 'string') {
    return { ok: false, error: 'Date must be a string' };
  }
  
  const trimmed = date.trim();
  
  // Check ISO date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { ok: false, error: 'Date must be in ISO format (YYYY-MM-DD)' };
  }
  
  const parsed = new Date(trimmed + 'T00:00:00Z');
  
  if (isNaN(parsed.getTime())) {
    return { ok: false, error: 'Invalid date' };
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const requestedDate = new Date(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate());
  
  if (requestedDate < today) {
    return { ok: false, error: 'Date cannot be in the past' };
  }
  
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 90);
  
  if (requestedDate > maxDate) {
    return { ok: false, error: 'Date too far in the future (max 90 days ahead)' };
  }
  
  return { ok: true, value: trimmed };
}

/**
 * Validates promo code: alphanumeric, max 32 chars
 */
export function validatePromoCode(code: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof code !== 'string') {
    return { ok: false, error: 'Promo code must be a string' };
  }
  
  const trimmed = code.trim().toUpperCase();
  
  if (trimmed.length === 0) {
    return { ok: false, error: 'Promo code cannot be empty' };
  }
  
  if (trimmed.length > 32) {
    return { ok: false, error: 'Promo code too long (max 32 characters)' };
  }
  
  if (!/^[A-Z0-9]+$/.test(trimmed)) {
    return { ok: false, error: 'Promo code contains invalid characters (allowed: A-Z, 0-9)' };
  }
  
  return { ok: true, value: trimmed };
}

/**
 * Sanitizes text input: trims whitespace, limits length
 */
export function sanitizeText(text: unknown, maxLength: number = 255): string {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, maxLength);
}

/**
 * Validates URL: proper format, https only for production
 */
export function validateUrl(
  url: unknown,
  options?: { requireHttps?: boolean }
): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof url !== 'string') {
    return { ok: false, error: 'URL must be a string' };
  }
  
  const trimmed = url.trim();
  
  if (trimmed.length === 0) {
    return { ok: false, error: 'URL cannot be empty' };
  }
  
  if (trimmed.length > 2048) {
    return { ok: false, error: 'URL too long (max 2048 characters)' };
  }
  
  try {
    const parsed = new URL(trimmed);
    
    if (options?.requireHttps && parsed.protocol !== 'https:') {
      return { ok: false, error: 'URL must use HTTPS protocol' };
    }
    
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { ok: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
    
    return { ok: true, value: trimmed };
  } catch {
    return { ok: false, error: 'Invalid URL format' };
  }
}

/**
 * Validates phone number: basic format check, max 50 chars
 */
export function validatePhone(phone: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof phone !== 'string') {
    return { ok: false, error: 'Phone must be a string' };
  }
  
  const trimmed = phone.trim();
  
  if (trimmed.length === 0) {
    return { ok: false, error: 'Phone cannot be empty' };
  }
  
  if (trimmed.length > 50) {
    return { ok: false, error: 'Phone too long (max 50 characters)' };
  }
  
  // Allow digits, spaces, hyphens, parentheses, plus sign
  if (!/^[\d\s\-()+ ]+$/.test(trimmed)) {
    return { ok: false, error: 'Phone contains invalid characters' };
  }
  
  return { ok: true, value: trimmed };
}
