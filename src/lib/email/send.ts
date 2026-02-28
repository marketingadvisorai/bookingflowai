import { SendEmailCommand } from '@aws-sdk/client-sesv2';
import { getSesClient } from './ses-client';
import {
  bookingConfirmationTemplate,
  welcomeEmailTemplate,
} from './templates';
import type { BookingConfirmationData, EmailPayload, WelcomeEmailData } from './types';

const DEFAULT_FROM = 'BookingFlow <noreply@bookingflowai.com>';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Validates recipient email before sending (basic check)
 */
function validateRecipient(email: string): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  // Basic email validation (RFC 5322 simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
}

/**
 * Sleep helper for retry logic
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sends an email with retry logic for transient failures
 */
async function sendEmail(payload: EmailPayload): Promise<void> {
  if (!validateRecipient(payload.to)) {
    throw new Error(`Invalid recipient email: ${payload.to}`);
  }

  const ses = getSesClient();
  const cmd = new SendEmailCommand({
    FromEmailAddress: payload.from ?? DEFAULT_FROM,
    Destination: { ToAddresses: [payload.to] },
    Content: {
      Simple: {
        Subject: { Data: payload.subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: payload.html, Charset: 'UTF-8' },
          ...(payload.text ? { Text: { Data: payload.text, Charset: 'UTF-8' } } : {}),
        },
      },
    },
  });

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await ses.send(cmd);
      return; // Success
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const errorName = lastError.name || '';
      
      // Don't retry on permanent failures
      if (errorName === 'MessageRejected' || errorName === 'MailFromDomainNotVerified') {
        throw lastError;
      }
      
      // Retry on transient failures (throttling, service unavailable, etc.)
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt; // Exponential backoff
        console.warn(`[email] Retry ${attempt}/${MAX_RETRIES} after ${delay}ms:`, errorName);
        await sleep(delay);
      }
    }
  }
  
  // All retries exhausted
  throw lastError || new Error('Email send failed after retries');
}

/** Fire-and-forget wrapper — logs errors, never throws */
function fireAndForget(fn: () => Promise<void>, label: string): void {
  fn().catch((err) => {
    console.error(`[email:${label}] Failed to send:`, err);
  });
}

export function sendBookingConfirmation(data: BookingConfirmationData): void {
  const { subject, html, text } = bookingConfirmationTemplate(data);
  fireAndForget(
    () => sendEmail({ to: data.customerEmail, subject, html, text }),
    'booking-confirmation',
  );
}

export function sendWelcomeEmail(data: WelcomeEmailData): void {
  const { subject, html, text } = welcomeEmailTemplate(data);
  fireAndForget(
    () => sendEmail({ to: data.ownerEmail, subject, html, text }),
    'welcome',
  );
}

export { sendEmail };
