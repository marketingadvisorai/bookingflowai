/** Tool execution logic — calls existing DB/booking functions directly */
import { getDb } from '@/lib/db';
import { computeSlots } from '@/lib/booking/availability';
import { computeHoldPricing } from '@/lib/booking/pricing';
import { overlaps } from '@/lib/booking/time';
import { createId } from '@paralleldrive/cuid2';
import type { BookingType } from '@/lib/booking/types';
import type { ToolResult } from './types';

/** Sanitize and validate orgId (alphanumeric, hyphens, underscores only) */
function sanitizeOrgId(orgId: unknown): string | null {
  if (typeof orgId !== 'string') return null;
  if (!/^[a-zA-Z0-9_-]+$/.test(orgId)) return null;
  return orgId;
}

/** Validate date format YYYY-MM-DD */
function validateDate(date: unknown): { valid: boolean; error?: string } {
  if (typeof date !== 'string') return { valid: false, error: 'Date must be a string' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { valid: false, error: 'Date must be in YYYY-MM-DD format' };
  
  const [y, m, d] = date.split('-').map(Number);
  const parsed = new Date(y, (m ?? 1) - 1, d ?? 1);
  
  // Check if date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsed < today) return { valid: false, error: 'Date cannot be in the past' };
  
  return { valid: true };
}

/** Validate player count */
function validatePlayers(players: unknown): { valid: boolean; error?: string } {
  if (typeof players !== 'number') return { valid: false, error: 'Player count must be a number' };
  if (players < 1) return { valid: false, error: 'Player count must be at least 1' };
  if (players > 100) return { valid: false, error: 'Player count seems too high (max 100)' };
  if (!Number.isInteger(players)) return { valid: false, error: 'Player count must be a whole number' };
  return { valid: true };
}

export async function executeTool(
  toolName: string,
  input: Record<string, unknown>
): Promise<ToolResult> {
  const handler = toolHandlers[toolName];
  if (!handler) {
    console.error(`[tool-handlers] Unknown tool: ${toolName}`);
    return { 
      tool: toolName, 
      input, 
      output: { 
        error: 'unknown_tool',
        message: 'I tried to use a tool that doesn\'t exist. Please try rephrasing your request.'
      } 
    };
  }
  try {
    const output = await handler(input);
    return { tool: toolName, input, output };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    console.error(`[tool-handlers] Error in ${toolName}:`, { error: msg, input });
    return { 
      tool: toolName, 
      input, 
      output: { 
        error: 'tool_execution_failed',
        message: 'Something went wrong while processing your request. Please try again, or contact the venue directly if this continues.'
      } 
    };
  }
}

const toolHandlers: Record<string, (input: Record<string, unknown>) => Promise<unknown>> = {
  search_games: async (input) => {
    const orgId = sanitizeOrgId(input.orgId);
    if (!orgId) {
      return { 
        error: 'invalid_org_id', 
        message: 'There was an issue identifying your venue. Please refresh and try again.' 
      };
    }

    const db = getDb();
    const query = ((input.query as string) ?? '').toLowerCase().trim();
    
    try {
      const games = await db.listGames(orgId);
      
      if (games.length === 0) {
        return { 
          error: 'no_games_found',
          message: 'This venue doesn\'t have any games set up yet. Please contact them directly to book.'
        };
      }

      const filtered = query
        ? games.filter((g) => g.name.toLowerCase().includes(query))
        : games;

      if (query && filtered.length === 0) {
        return {
          error: 'no_matching_games',
          message: `I couldn't find any games matching "${query}". Here are all available games:`,
          allGames: games.map((g) => ({ name: g.name, minPlayers: g.minPlayers, maxPlayers: g.maxPlayers }))
        };
      }

      return filtered.map((g) => ({
        gameId: g.gameId,
        name: g.name,
        durationMins: g.durationMins,
        minPlayers: g.minPlayers,
        maxPlayers: g.maxPlayers,
        allowPrivate: g.allowPrivate,
        allowPublic: g.allowPublic,
        pricingTiers: g.pricingTiers,
        pricingCurrency: g.pricingCurrency ?? 'usd',
      }));
    } catch (err) {
      console.error('[search_games] Database error:', err);
      return {
        error: 'database_error',
        message: 'I\'m having trouble loading the game list. Please try again in a moment.'
      };
    }
  },

  check_availability: async (input) => {
    const orgId = sanitizeOrgId(input.orgId);
    if (!orgId) {
      return { 
        error: 'invalid_org_id', 
        message: 'There was an issue identifying your venue. Please refresh and try again.' 
      };
    }

    const dateValidation = validateDate(input.date);
    if (!dateValidation.valid) {
      return {
        error: 'invalid_date',
        message: dateValidation.error ?? 'Please provide a valid date in the future.'
      };
    }

    const playersValidation = validatePlayers(input.players);
    if (!playersValidation.valid) {
      return {
        error: 'invalid_players',
        message: playersValidation.error ?? 'Please provide a valid number of players.'
      };
    }

    const db = getDb();
    const gameId = input.gameId as string;
    const date = input.date as string;
    const players = input.players as number;
    const bookingType = (input.bookingType as BookingType) ?? 'public';

    try {
      const [game, rooms, schedules, holds, bookings] = await Promise.all([
        db.getGame(orgId, gameId),
        db.listRooms(orgId),
        db.listSchedules(orgId),
        db.listHoldsForGame(orgId, gameId),
        db.listBookingsForGame(orgId, gameId),
      ]);

      if (!game) {
        return { 
          error: 'game_not_found',
          message: 'I couldn\'t find that game. Please try searching for games first to see what\'s available.'
        };
      }

      // Validate player count against game limits
      if (players < game.minPlayers || players > game.maxPlayers) {
        return {
          error: 'invalid_player_count',
          message: `${game.name} is designed for ${game.minPlayers}-${game.maxPlayers} players. Your group of ${players} ${players === 1 ? 'person' : 'people'} ${players < game.minPlayers ? 'is too small' : 'is too large'}. Would you like to see games that fit your group size?`
        };
      }

      const gameRooms = rooms.filter((r) => r.gameId === gameId && r.enabled);
      if (gameRooms.length === 0) {
        return {
          error: 'no_rooms_available',
          message: 'This game doesn\'t have any rooms set up. Please contact the venue directly to book.'
        };
      }

      const schedule = schedules.find((s) => s.gameId === gameId);
      if (!schedule) {
        return { 
          error: 'no_schedule',
          message: 'This game doesn\'t have a schedule configured yet. Please contact the venue to check availability.'
        };
      }

      const bookingRecords = bookings
        .filter((b) => b.status === 'confirmed')
        .map((b) => ({
          roomId: b.roomId,
          startAt: b.startAt,
          endAt: b.endAt,
          bookingType: b.bookingType,
          players: b.players,
        }));

      const slots = computeSlots({
        game, rooms: gameRooms, schedule, date, bookingType, players, holds, bookings: bookingRecords,
      });

      if (slots.length === 0) {
        return {
          error: 'no_slots_available',
          message: `${game.name} is fully booked on ${date}. Would you like to check a different date?`,
          date,
          players,
          bookingType,
          slotsCount: 0,
          slots: []
        };
      }

      return { 
        success: true,
        date, 
        players, 
        bookingType, 
        slotsCount: slots.length, 
        slots: slots.slice(0, 20),
        message: slots.length === 1 
          ? `Found 1 available time slot for ${game.name} on ${date}.`
          : `Found ${Math.min(slots.length, 20)} available time slots for ${game.name} on ${date}.`
      };
    } catch (err) {
      console.error('[check_availability] Error:', { orgId, gameId, date, players, error: err });
      return {
        error: 'availability_check_failed',
        message: 'I\'m having trouble checking availability right now. Please try again in a moment.'
      };
    }
  },

  create_hold: async (input) => {
    const orgId = sanitizeOrgId(input.orgId);
    if (!orgId) {
      return { 
        error: 'invalid_org_id', 
        message: 'There was an issue identifying your venue. Please refresh and try again.' 
      };
    }

    const playersValidation = validatePlayers(input.players);
    if (!playersValidation.valid) {
      return {
        error: 'invalid_players',
        message: playersValidation.error ?? 'Please provide a valid number of players.'
      };
    }

    // Validate customer name and email
    const customerName = (input.customerName as string || '').trim();
    const customerEmail = (input.customerEmail as string || '').trim().toLowerCase();

    if (!customerName || customerName.length < 2) {
      return {
        error: 'invalid_customer_name',
        message: 'Please provide your full name to complete the booking.'
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return {
        error: 'invalid_customer_email',
        message: 'Please provide a valid email address so we can send you booking confirmation.'
      };
    }

    const db = getDb();
    const gameId = input.gameId as string;
    const roomId = input.roomId as string;
    const startAt = input.time as string;
    const players = input.players as number;
    const bookingType = (input.bookingType as BookingType) ?? 'public';

    try {
      const [org, game, room] = await Promise.all([
        db.getOrg(orgId),
        db.getGame(orgId, gameId),
        db.getRoom(orgId, roomId),
      ]);

      if (!game) {
        return { 
          error: 'game_not_found',
          message: 'I couldn\'t find that game. Please try checking availability again.'
        };
      }

      if (!room) {
        return { 
          error: 'room_not_found',
          message: 'That room isn\'t available. Please check availability again to see current options.'
        };
      }

      // Compute endAt from game duration
      const start = new Date(startAt);
      const end = new Date(start.getTime() + (game.durationMins + game.bufferMins) * 60_000);
      const endAt = end.toISOString();

      // Check conflicts
      const [holds, bookings] = await Promise.all([
        db.listHoldsForGame(orgId, gameId),
        db.listBookingsForGame(orgId, gameId),
      ]);

      const conflicts = [
        ...holds.filter((h) => h.roomId === roomId && h.status === 'active')
          .map((h) => ({ start: new Date(h.startAt), end: new Date(h.endAt), bookingType: h.bookingType, players: h.players })),
        ...bookings.filter((b) => b.roomId === roomId && b.status === 'confirmed')
          .map((b) => ({ start: new Date(b.startAt), end: new Date(b.endAt), bookingType: b.bookingType, players: b.players })),
      ].filter((x) => overlaps(start, end, x.start, x.end));

      if (bookingType === 'private' && conflicts.length > 0) {
        return { 
          error: 'slot_unavailable',
          message: 'Sorry, that time slot was just booked by someone else! Please check availability again for other times.'
        };
      }

      if (bookingType === 'public') {
        if (conflicts.some((c) => c.bookingType === 'private')) {
          return { 
            error: 'slot_unavailable',
            message: 'That time slot is reserved for a private booking. Please check availability for other times.'
          };
        }
        const used = conflicts.filter((c) => c.bookingType === 'public').reduce((a, c) => a + c.players, 0);
        const remaining = room.maxPlayers - used;
        if (players > remaining) {
          return { 
            error: 'slot_capacity_exceeded',
            message: `Only ${remaining} ${remaining === 1 ? 'spot' : 'spots'} left at that time for your group of ${players}. Please choose a different time or consider a private booking.`
          };
        }
      }

      const pricing = computeHoldPricing({ org, game, players });
      if (!pricing.ok) {
        return { 
          error: pricing.error,
          message: pricing.message ?? 'There was an issue calculating the price. Please contact the venue directly.'
        };
      }

      const hold = {
        orgId, holdId: createId(), gameId, roomId, bookingType, startAt, endAt, players,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
        currency: pricing.currency,
        subtotalCents: pricing.subtotalCents,
        processingFeeCents: pricing.processingFeeCents,
        totalCents: pricing.totalCents,
        processingFeeBps: pricing.processingFeeBps,
        processingFeeLabel: pricing.processingFeeLabel,
        customer: { name: customerName, email: customerEmail },
      };

      await db.putHold(orgId, hold);

      // Build checkout URL
      const hasStripe = org?.stripeAccountId && org.stripeChargesEnabled;
      
      const totalDollars = (hold.totalCents / 100).toFixed(2);
      
      return {
        success: true,
        holdId: hold.holdId,
        expiresAt: hold.expiresAt,
        totalCents: hold.totalCents,
        currency: hold.currency,
        checkoutUrl: hasStripe ? `/api/v1/stripe/checkout/create?holdId=${hold.holdId}` : null,
        message: hasStripe
          ? `Perfect! I've reserved your spot for ${game.name}. Total: $${totalDollars}. You have 10 minutes to complete payment. Click the checkout link to pay now.`
          : `Your booking for ${game.name} is confirmed! Someone from the venue will contact you at ${customerEmail} about payment. Confirmation ID: ${hold.holdId}`,
      };
    } catch (err) {
      console.error('[create_hold] Error:', { orgId, gameId, roomId, players, error: err });
      return {
        error: 'hold_creation_failed',
        message: 'I couldn\'t complete your booking right now. Please try again, or contact the venue directly for assistance.'
      };
    }
  },

  get_pricing: async (input) => {
    const orgId = sanitizeOrgId(input.orgId);
    if (!orgId) {
      return { 
        error: 'invalid_org_id', 
        message: 'There was an issue identifying your venue. Please refresh and try again.' 
      };
    }

    const playersValidation = validatePlayers(input.players);
    if (!playersValidation.valid) {
      return {
        error: 'invalid_players',
        message: playersValidation.error ?? 'Please provide a valid number of players.'
      };
    }

    const db = getDb();
    const gameId = input.gameId as string;
    const players = input.players as number;

    try {
      const [org, game] = await Promise.all([db.getOrg(orgId), db.getGame(orgId, gameId)]);
      
      if (!game) {
        return { 
          error: 'game_not_found',
          message: 'I couldn\'t find that game. Please try searching for games first.'
        };
      }

      const pricing = computeHoldPricing({ org, game, players });
      
      if (!pricing.ok) {
        return { 
          error: pricing.error,
          message: pricing.message ?? 'Pricing isn\'t configured for that group size. Please contact the venue for a quote.'
        };
      }

      const unitDollars = (pricing.unitAmountCents / 100).toFixed(2);
      const subtotalDollars = (pricing.subtotalCents / 100).toFixed(2);
      const feeDollars = (pricing.processingFeeCents / 100).toFixed(2);
      const totalDollars = (pricing.totalCents / 100).toFixed(2);

      return {
        success: true,
        currency: pricing.currency,
        unitAmountCents: pricing.unitAmountCents,
        subtotalCents: pricing.subtotalCents,
        processingFeeCents: pricing.processingFeeCents,
        totalCents: pricing.totalCents,
        players,
        message: `For ${players} ${players === 1 ? 'player' : 'players'}: $${unitDollars} per person = $${subtotalDollars} subtotal + $${feeDollars} booking fee = $${totalDollars} total.`
      };
    } catch (err) {
      console.error('[get_pricing] Error:', { orgId, gameId, players, error: err });
      return {
        error: 'pricing_lookup_failed',
        message: 'I\'m having trouble getting pricing right now. Please try again in a moment.'
      };
    }
  },
};
