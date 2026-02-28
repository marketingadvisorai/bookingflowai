import type { Booking, Game, Hold, Org, Room, Schedule } from '@/lib/booking/types';
import type { Session, User } from '@/lib/auth/types';
import type { GiftCard } from '@/lib/db/postgres/repos/gift-card-repo';
import type { GiftCardTransaction } from '@/lib/db/postgres/repos/gift-card-transaction-repo';

export type Db = {
  listOrgs(orgId?: string): Promise<Org[]>;
  getOrg(orgId: string): Promise<Org | null>;
  putOrg(org: Org): Promise<void>;

  // games
  listGames(orgId: string): Promise<Game[]>;
  getGame(orgId: string, gameId: string): Promise<Game | null>;
  putGame(orgId: string, game: Game): Promise<void>;
  deleteGame(orgId: string, gameId: string): Promise<void>;

  // rooms
  listRooms(orgId: string): Promise<Room[]>;
  getRoom(orgId: string, roomId: string): Promise<Room | null>;
  putRoom(orgId: string, room: Room): Promise<void>;
  deleteRoom(orgId: string, roomId: string): Promise<void>;

  // schedules
  listSchedules(orgId: string): Promise<Schedule[]>;
  getSchedule(orgId: string, scheduleId: string): Promise<Schedule | null>;
  putSchedule(orgId: string, schedule: Schedule): Promise<void>;
  deleteSchedule(orgId: string, scheduleId: string): Promise<void>;

  // holds
  listHoldsForGame(orgId: string, gameId: string): Promise<Hold[]>;
  getHold(orgId: string, holdId: string): Promise<Hold | null>;
  putHold(orgId: string, hold: Hold): Promise<void>;
  extendHoldTTL(orgId: string, holdId: string, newExpiresAt: string): Promise<void>;

  // bookings
  listBookingsForGame(orgId: string, gameId: string): Promise<Booking[]>;
  getBooking(orgId: string, bookingId: string): Promise<Booking | null>;
  putBooking(orgId: string, booking: Booking): Promise<void>;
  
  // dashboard stats
  getRecentBookings(orgId: string, limit: number): Promise<Booking[]>;
  countBookingsForOrg(orgId: string): Promise<number>;
  getTotalRevenue(orgId: string): Promise<number>;

  // users (dashboard auth)
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(userId: string): Promise<User | null>;
  putUser(user: User): Promise<void>; // create/update

  // sessions (dashboard auth)
  getSession(sessionToken: string): Promise<Session | null>;
  putSession(session: Session): Promise<void>;
  deleteSession(sessionToken: string): Promise<void>;
  deleteSessionsForUser(userId: string): Promise<void>;

  // gift cards
  createGiftCard(card: Omit<GiftCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<GiftCard>;
  getGiftCardByCode(code: string): Promise<GiftCard | null>;
  getGiftCardById(id: string): Promise<GiftCard | null>;
  listGiftCardsByOrg(orgId: string): Promise<GiftCard[]>;
  updateGiftCardBalance(id: string, newBalance: number): Promise<void>;
  updateGiftCardStatus(id: string, status: GiftCard['status']): Promise<void>;
  redeemGiftCard(cardId: string, amountCents: number, bookingId: string, note?: string): Promise<{ success: boolean; newBalance: number }>;
  
  // gift card transactions
  listGiftCardTransactions(giftCardId: string): Promise<GiftCardTransaction[]>;
  createGiftCardTransaction(tx: Omit<GiftCardTransaction, 'id' | 'createdAt'>): Promise<GiftCardTransaction>;

  // admin
  scanAllUsers(): Promise<User[]>;
  scanAllOrgs(): Promise<Org[]>;
  countAllBookings(): Promise<number>;
};
