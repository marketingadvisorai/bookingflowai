export type WaiverTemplate = {
  orgId: string;
  waiverId: string;
  title: string;
  bodyHtml: string; // HTML content of the waiver
  version: number;
  requiredForBooking: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type SignedWaiver = {
  orgId: string;
  signatureId: string;
  waiverId: string;
  waiverVersion: number;
  bookingId?: string;
  signerName: string;
  signerEmail: string;
  signedAt: string; // ISO
  ipAddress?: string;
  /** Base64-encoded signature image, if applicable */
  signatureData?: string;
};
