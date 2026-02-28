/** Dashboard tool handlers — all queries scoped to authenticated user's orgId */
import { getDb } from '@/lib/db';
import type { ToolResult } from './types';

/** Execute a dashboard tool with orgId scoping (CRITICAL for security) */
export async function executeDashboardTool(
  toolName: string,
  orgId: string,
  input: Record<string, unknown>
): Promise<ToolResult> {
  const handler = dashboardToolHandlers[toolName];
  if (!handler) {
    console.error(`[dashboard-tool-handlers] Unknown tool: ${toolName}`);
    return {
      tool: toolName,
      input,
      output: {
        error: 'unknown_tool',
        message: 'I tried to use a tool that doesn\'t exist. Please try rephrasing your request.',
      },
    };
  }
  try {
    const output = await handler(orgId, input);
    return { tool: toolName, input, output };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    console.error(`[dashboard-tool-handlers] Error in ${toolName}:`, { error: msg, input, orgId });
    return {
      tool: toolName,
      input,
      output: {
        error: 'tool_execution_failed',
        message: 'Something went wrong while getting that data. Please try again.',
      },
    };
  }
}

/** Parse date string (YYYY-MM-DD) */
function parseDate(dateStr: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
}

/** Format date as YYYY-MM-DD */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Get date range for a period */
function getDateRange(period: string): { from: Date; to: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'today':
      return { from: today, to: new Date(today.getTime() + 86400000) };
    case 'yesterday': {
      const yesterday = new Date(today.getTime() - 86400000);
      return { from: yesterday, to: today };
    }
    case 'week': {
      const weekAgo = new Date(today.getTime() - 7 * 86400000);
      return { from: weekAgo, to: new Date(today.getTime() + 86400000) };
    }
    case 'month': {
      const monthAgo = new Date(today.getTime() - 30 * 86400000);
      return { from: monthAgo, to: new Date(today.getTime() + 86400000) };
    }
    case 'year': {
      const yearAgo = new Date(today.getTime() - 365 * 86400000);
      return { from: yearAgo, to: new Date(today.getTime() + 86400000) };
    }
    default:
      return { from: today, to: new Date(today.getTime() + 86400000) };
  }
}

const dashboardToolHandlers: Record<
  string,
  (orgId: string, input: Record<string, unknown>) => Promise<unknown>
> = {
  query_bookings: async (orgId, input) => {
    const db = getDb();
    
    // Parse date range
    const now = new Date();
    const today = formatDate(now);
    const weekFromNow = formatDate(new Date(now.getTime() + 7 * 86400000));
    
    const dateFrom = (input.dateFrom as string) || today;
    const dateTo = (input.dateTo as string) || weekFromNow;
    const status = input.status as string | undefined;
    const gameId = input.gameId as string | undefined;
    const limit = Math.min((input.limit as number) || 20, 100);
    
    const fromDate = parseDate(dateFrom);
    const toDate = parseDate(dateTo);
    
    if (!fromDate || !toDate) {
      return {
        error: 'invalid_date',
        message: 'Please provide dates in YYYY-MM-DD format.',
      };
    }
    
    // Get all games, then query bookings
    const games = await db.listGames(orgId);
    const gamesToQuery = gameId ? games.filter((g) => g.gameId === gameId) : games;
    
    const bookingLists = await Promise.all(
      gamesToQuery.map((g) => db.listBookingsForGame(orgId, g.gameId))
    );
    
    let allBookings = bookingLists.flat();
    
    // Filter by date range and status
    allBookings = allBookings.filter((b) => {
      const bookingDate = new Date(b.startAt);
      const inRange = bookingDate >= fromDate && bookingDate < toDate;
      const matchesStatus = !status || b.status === status;
      return inRange && matchesStatus;
    });
    
    // Sort by startAt descending and limit
    const bookings = allBookings
      .sort((a, b) => b.startAt.localeCompare(a.startAt))
      .slice(0, limit);
    
    // Build game name lookup
    const gameMap = new Map(games.map((g) => [g.gameId, g.name]));
    
    return {
      success: true,
      count: bookings.length,
      total: allBookings.length,
      bookings: bookings.map((b) => ({
        bookingId: b.bookingId,
        gameName: gameMap.get(b.gameId) || 'Unknown',
        date: b.startAt.split('T')[0],
        time: new Date(b.startAt).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        players: b.players,
        customerName: b.customer?.name || 'Unknown',
        customerEmail: b.customer?.email || 'Unknown',
        status: b.status,
        totalCents: b.totalCents || 0,
        currency: b.currency || 'usd',
      })),
    };
  },

  query_games: async (orgId, input) => {
    const db = getDb();
    
    // Parse date range for stats
    const now = new Date();
    const thirtyDaysAgo = formatDate(new Date(now.getTime() - 30 * 86400000));
    const today = formatDate(now);
    
    const dateFrom = (input.dateFrom as string) || thirtyDaysAgo;
    const dateTo = (input.dateTo as string) || today;
    
    const fromDate = parseDate(dateFrom);
    const toDate = parseDate(dateTo);
    
    if (!fromDate || !toDate) {
      return {
        error: 'invalid_date',
        message: 'Please provide dates in YYYY-MM-DD format.',
      };
    }
    
    const games = await db.listGames(orgId);
    
    // Get bookings for each game and calculate stats
    const gameStats = await Promise.all(
      games.map(async (game) => {
        const bookings = await db.listBookingsForGame(orgId, game.gameId);
        
        // Filter by date range and confirmed status
        const relevantBookings = bookings.filter((b) => {
          const bookingDate = new Date(b.startAt);
          return (
            bookingDate >= fromDate &&
            bookingDate < toDate &&
            b.status === 'confirmed'
          );
        });
        
        const totalBookings = relevantBookings.length;
        const totalRevenue = relevantBookings.reduce(
          (sum, b) => sum + (b.totalCents || 0),
          0
        );
        const totalPlayers = relevantBookings.reduce(
          (sum, b) => sum + b.players,
          0
        );
        
        return {
          gameId: game.gameId,
          name: game.name,
          durationMins: game.durationMins,
          minPlayers: game.minPlayers,
          maxPlayers: game.maxPlayers,
          stats: {
            totalBookings,
            totalRevenue,
            totalPlayers,
            avgGroupSize: totalBookings > 0 ? totalPlayers / totalBookings : 0,
          },
        };
      })
    );
    
    // Sort by total bookings descending
    gameStats.sort((a, b) => b.stats.totalBookings - a.stats.totalBookings);
    
    return {
      success: true,
      dateFrom,
      dateTo,
      games: gameStats,
    };
  },

  query_rooms: async (orgId) => {
    const db = getDb();
    
    const [rooms, games] = await Promise.all([
      db.listRooms(orgId),
      db.listGames(orgId),
    ]);
    
    const gameMap = new Map(games.map((g) => [g.gameId, g.name]));
    
    // Get recent booking activity for each room
    const roomStats = await Promise.all(
      rooms.map(async (room) => {
        const bookings = await db.listBookingsForGame(orgId, room.gameId);
        
        const roomBookings = bookings.filter(
          (b) => b.roomId === room.roomId && b.status === 'confirmed'
        );
        
        // Count bookings in last 7 days
        const weekAgo = new Date(Date.now() - 7 * 86400000);
        const recentBookings = roomBookings.filter(
          (b) => new Date(b.startAt) >= weekAgo
        );
        
        return {
          roomId: room.roomId,
          name: room.name,
          gameName: gameMap.get(room.gameId) || 'Unknown',
          maxPlayers: room.maxPlayers,
          enabled: room.enabled,
          recentBookings: recentBookings.length,
          totalBookings: roomBookings.length,
        };
      })
    );
    
    return {
      success: true,
      rooms: roomStats,
    };
  },

  query_revenue: async (orgId, input) => {
    const db = getDb();
    
    const period = (input.period as string) || 'today';
    const { from, to } = getDateRange(period);
    
    // Get all bookings
    const games = await db.listGames(orgId);
    const bookingLists = await Promise.all(
      games.map((g) => db.listBookingsForGame(orgId, g.gameId))
    );
    
    const allBookings = bookingLists.flat();
    
    // Filter confirmed bookings in the period
    const periodBookings = allBookings.filter((b) => {
      const bookingDate = new Date(b.startAt);
      return (
        bookingDate >= from &&
        bookingDate < to &&
        b.status === 'confirmed'
      );
    });
    
    const totalRevenue = periodBookings.reduce((sum, b) => sum + (b.totalCents || 0), 0);
    const totalBookings = periodBookings.length;
    
    // Compare to previous period
    const periodLength = to.getTime() - from.getTime();
    const prevFrom = new Date(from.getTime() - periodLength);
    const prevTo = from;
    
    const prevPeriodBookings = allBookings.filter((b) => {
      const bookingDate = new Date(b.startAt);
      return (
        bookingDate >= prevFrom &&
        bookingDate < prevTo &&
        b.status === 'confirmed'
      );
    });
    
    const prevRevenue = prevPeriodBookings.reduce((sum, b) => sum + (b.totalCents || 0), 0);
    const prevBookings = prevPeriodBookings.length;
    
    const revenueChange = prevRevenue > 0 
      ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 
      : 0;
    const bookingsChange = prevBookings > 0 
      ? ((totalBookings - prevBookings) / prevBookings) * 100 
      : 0;
    
    return {
      success: true,
      period,
      revenue: {
        current: totalRevenue,
        previous: prevRevenue,
        change: revenueChange,
      },
      bookings: {
        current: totalBookings,
        previous: prevBookings,
        change: bookingsChange,
      },
    };
  },

  query_schedules: async (orgId, input) => {
    const db = getDb();
    
    const gameId = input.gameId as string | undefined;
    const days = Math.min((input.days as number) || 7, 30);
    
    const [schedules, games] = await Promise.all([
      db.listSchedules(orgId),
      db.listGames(orgId),
    ]);
    
    const gameMap = new Map(games.map((g) => [g.gameId, g]));
    
    // Filter by gameId if provided
    const relevantSchedules = gameId
      ? schedules.filter((s) => s.gameId === gameId)
      : schedules;
    
    const scheduleInfo = relevantSchedules.map((s) => {
      const game = gameMap.get(s.gameId);
      return {
        scheduleId: s.scheduleId,
        gameId: s.gameId,
        gameName: game?.name || 'Unknown',
        durationMins: game?.durationMins || 0,
        openingHours: s.openingHours,
      };
    });
    
    return {
      success: true,
      days,
      schedules: scheduleInfo,
    };
  },

  query_analytics: async (orgId, input) => {
    const db = getDb();
    
    // Parse date range
    const now = new Date();
    const thirtyDaysAgo = formatDate(new Date(now.getTime() - 30 * 86400000));
    const today = formatDate(now);
    
    const dateFrom = (input.dateFrom as string) || thirtyDaysAgo;
    const dateTo = (input.dateTo as string) || today;
    
    const fromDate = parseDate(dateFrom);
    const toDate = parseDate(dateTo);
    
    if (!fromDate || !toDate) {
      return {
        error: 'invalid_date',
        message: 'Please provide dates in YYYY-MM-DD format.',
      };
    }
    
    // Get all bookings
    const games = await db.listGames(orgId);
    const bookingLists = await Promise.all(
      games.map((g) => db.listBookingsForGame(orgId, g.gameId))
    );
    
    const allBookings = bookingLists.flat();
    
    // Filter by date range
    const periodBookings = allBookings.filter((b) => {
      const bookingDate = new Date(b.startAt);
      return bookingDate >= fromDate && bookingDate < toDate;
    });
    
    // Calculate analytics
    const confirmedBookings = periodBookings.filter((b) => b.status === 'confirmed');
    const canceledBookings = periodBookings.filter((b) => b.status === 'canceled');
    
    // Popular times
    const hourCounts: Record<number, number> = {};
    confirmedBookings.forEach((b) => {
      const hour = new Date(b.startAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    const sortedHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    const popularTimes = sortedHours.map(([hour, count]) => ({
      hour: parseInt(hour, 10),
      bookings: count,
    }));
    
    // Busiest days
    const dayCounts: Record<number, number> = {};
    confirmedBookings.forEach((b) => {
      const day = new Date(b.startAt).getDay();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const busiestDays = Object.entries(dayCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([day, count]) => ({
        day: dayNames[parseInt(day, 10)],
        bookings: count,
      }));
    
    // Average group size
    const totalPlayers = confirmedBookings.reduce((sum, b) => sum + b.players, 0);
    const avgGroupSize = confirmedBookings.length > 0 
      ? totalPlayers / confirmedBookings.length 
      : 0;
    
    // Cancellation rate
    const cancellationRate = periodBookings.length > 0
      ? (canceledBookings.length / periodBookings.length) * 100
      : 0;
    
    return {
      success: true,
      dateFrom,
      dateTo,
      analytics: {
        totalBookings: periodBookings.length,
        confirmedBookings: confirmedBookings.length,
        canceledBookings: canceledBookings.length,
        cancellationRate,
        avgGroupSize,
        popularTimes,
        busiestDays,
      },
    };
  },

  suggest_actions: async (orgId) => {
    const db = getDb();
    
    // Get recent bookings and analytics
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);
    
    const games = await db.listGames(orgId);
    const bookingLists = await Promise.all(
      games.map((g) => db.listBookingsForGame(orgId, g.gameId))
    );
    
    const allBookings = bookingLists.flat();
    const recentBookings = allBookings.filter(
      (b) => new Date(b.createdAt) >= weekAgo && b.status === 'confirmed'
    );
    const monthBookings = allBookings.filter(
      (b) => new Date(b.createdAt) >= monthAgo && b.status === 'confirmed'
    );
    
    const suggestions: string[] = [];
    
    // Low booking volume
    if (recentBookings.length < 5) {
      suggestions.push(
        'Your booking volume is low this week. Consider running a promotion or updating your marketing.'
      );
    }
    
    // Slow days
    const dayCounts: Record<number, number> = {};
    monthBookings.forEach((b) => {
      const day = new Date(b.startAt).getDay();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const slowDays = Object.entries(dayCounts)
      .filter(([, count]) => count < monthBookings.length / 7 * 0.5) // Less than 50% of average
      .map(([day]) => dayNames[parseInt(day, 10)]);
    
    if (slowDays.length > 0) {
      suggestions.push(
        `${slowDays.join(', ')} ${slowDays.length > 1 ? 'are' : 'is'} your slowest ${slowDays.length > 1 ? 'days' : 'day'}. Try offering a weekday discount.`
      );
    }
    
    // Game performance
    const gameBookingCounts = new Map<string, number>();
    monthBookings.forEach((b) => {
      gameBookingCounts.set(b.gameId, (gameBookingCounts.get(b.gameId) || 0) + 1);
    });
    
    const gameMap = new Map(games.map((g) => [g.gameId, g.name]));
    const sortedGames = Array.from(gameBookingCounts.entries())
      .sort(([, a], [, b]) => b - a);
    
    if (sortedGames.length > 1) {
      const [topGameId, topCount] = sortedGames[0];
      const [bottomGameId, bottomCount] = sortedGames[sortedGames.length - 1];
      
      if (topCount > bottomCount * 3) {
        suggestions.push(
          `${gameMap.get(topGameId)} is your star performer with ${topCount} bookings. Consider promoting ${gameMap.get(bottomGameId)} which has only ${bottomCount}.`
        );
      }
    }
    
    // High cancellation rate
    const canceled = allBookings.filter(
      (b) => new Date(b.createdAt) >= monthAgo && b.status === 'canceled'
    );
    
    const cancellationRate = monthBookings.length > 0
      ? (canceled.length / (monthBookings.length + canceled.length)) * 100
      : 0;
    
    if (cancellationRate > 15) {
      suggestions.push(
        `Your cancellation rate is ${cancellationRate.toFixed(1)}%. Consider implementing a stricter cancellation policy or sending reminder emails.`
      );
    }
    
    return {
      success: true,
      suggestions,
    };
  },
};
