export type BookingConfirmationData = {
  customerName: string;
  customerEmail: string;
  gameName: string;
  date: string; // formatted, e.g. "Saturday, March 1, 2026"
  time: string; // formatted, e.g. "3:00 PM"
  players: number;
  confirmationId: string;
  venueName: string;
  venueAddress?: string;
  totalFormatted?: string; // e.g. "$45.00"
};

export type WelcomeEmailData = {
  ownerName: string;
  ownerEmail: string;
  venueName: string;
};

export type HoldReminderData = {
  customerName: string;
  customerEmail: string;
  gameName: string;
  date: string;
  time: string;
  players: number;
  expiresAt: string; // formatted
  holdId: string;
  bookingUrl?: string;
};

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string; // defaults to noreply@bookingflowai.com
};
