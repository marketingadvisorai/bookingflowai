export type BookingType = 'private' | 'public';
export type Step = 'game' | 'date' | 'time' | 'participants' | 'checkout' | 'done';

export type Slot = {
  startAt: string;
  endAt: string;
  availableRooms: { roomId: string; name: string; remainingPlayers?: number }[];
};

export type CatalogGame = {
  gameId: string;
  name: string;
  durationMins: number;
  bufferMins: number;
  slotIntervalMins: number;
  minPlayers: number;
  maxPlayers: number;
  allowPrivate: boolean;
  allowPublic: boolean;
  heroImageUrl?: string;
  heroImageThumbUrl?: string;
  previewVideoUrl?: string;
  galleryImageUrls?: string[];
  pricingCurrency?: string;
  startingUnitAmountCents?: number | null;
};

export type Config = {
  apiBase: string;
  orgId: string;
  gameId?: string;
  theme?: {
    accent?: string;
    mode?: 'dark' | 'light';
    layout?: 'wizard' | 'classic';
  };
};

export type WidgetState = {
  step: Step;
  games: CatalogGame[];
  selectedGame: CatalogGame | null;
  bookingType: BookingType;
  players: number;
  currentMonth: Date;
  selectedDate: Date | null;
  availableSlots: Slot[];
  selectedSlot: Slot | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  promoCode: string;
  loading: boolean;
  error: string | null;
  holdId: string | null;
  holdExpiresAt: Date | null;
};

export type APIResponse<T = any> = {
  ok: boolean;
  error?: string;
  data?: T;
};