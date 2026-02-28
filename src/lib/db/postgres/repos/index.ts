import type { Db } from '@/lib/db/types';
import type { DrizzleDb } from '../client';
import { createOrgRepo } from './org-repo';
import { createGameRepo } from './game-repo';
import { createRoomRepo } from './room-repo';
import { createScheduleRepo } from './schedule-repo';
import { createBookingRepo } from './booking-repo';
import { createUserRepo } from './user-repo';
import { createGiftCardRepo } from './gift-card-repo';
import { createGiftCardTransactionRepo } from './gift-card-transaction-repo';

export function createRepos(db: DrizzleDb): Db {
  const orgRepo = createOrgRepo(db);
  const gameRepo = createGameRepo(db);
  const roomRepo = createRoomRepo(db);
  const scheduleRepo = createScheduleRepo(db);
  const bookingRepo = createBookingRepo(db);
  const userRepo = createUserRepo(db);
  const giftCardRepo = createGiftCardRepo(db);
  const giftCardTransactionRepo = createGiftCardTransactionRepo(db);

  return {
    // orgs
    listOrgs: orgRepo.listOrgs,
    getOrg: orgRepo.getOrg,
    putOrg: orgRepo.putOrg,
    scanAllOrgs: orgRepo.scanAllOrgs,

    // games
    listGames: gameRepo.listGames,
    getGame: gameRepo.getGame,
    putGame: gameRepo.putGame,
    deleteGame: gameRepo.deleteGame,

    // rooms
    listRooms: roomRepo.listRooms,
    getRoom: roomRepo.getRoom,
    putRoom: roomRepo.putRoom,
    deleteRoom: roomRepo.deleteRoom,

    // schedules
    listSchedules: scheduleRepo.listSchedules,
    getSchedule: scheduleRepo.getSchedule,
    putSchedule: scheduleRepo.putSchedule,
    deleteSchedule: scheduleRepo.deleteSchedule,

    // holds
    listHoldsForGame: bookingRepo.listHoldsForGame,
    getHold: bookingRepo.getHold,
    putHold: bookingRepo.putHold,
    extendHoldTTL: bookingRepo.extendHoldTTL,

    // bookings
    listBookingsForGame: bookingRepo.listBookingsForGame,
    getBooking: bookingRepo.getBooking,
    putBooking: bookingRepo.putBooking,
    getRecentBookings: bookingRepo.getRecentBookings,
    countBookingsForOrg: bookingRepo.countBookingsForOrg,
    getTotalRevenue: bookingRepo.getTotalRevenue,
    countAllBookings: bookingRepo.countAllBookings,

    // users
    getUserByEmail: userRepo.getUserByEmail,
    getUserById: userRepo.getUserById,
    putUser: userRepo.putUser,
    scanAllUsers: userRepo.scanAllUsers,

    // sessions
    getSession: userRepo.getSession,
    putSession: userRepo.putSession,
    deleteSession: userRepo.deleteSession,
    deleteSessionsForUser: userRepo.deleteSessionsForUser,

    // gift cards
    createGiftCard: giftCardRepo.create,
    getGiftCardByCode: giftCardRepo.getByCode,
    getGiftCardById: giftCardRepo.getById,
    listGiftCardsByOrg: giftCardRepo.listByOrg,
    updateGiftCardBalance: giftCardRepo.updateBalance,
    updateGiftCardStatus: giftCardRepo.updateStatus,
    redeemGiftCard: giftCardRepo.redeem,

    // gift card transactions
    listGiftCardTransactions: giftCardTransactionRepo.list,
    createGiftCardTransaction: giftCardTransactionRepo.create,
    
    // hold cleanup
    expireStaleHolds: bookingRepo.expireStaleHolds,
    countActiveHolds: bookingRepo.countActiveHolds,
  };
}
