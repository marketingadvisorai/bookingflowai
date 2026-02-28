/** Dashboard AI tools — query venue owner's data (Anthropic SDK) */
import type Anthropic from '@anthropic-ai/sdk';

export const dashboardTools: Anthropic.Tool[] = [
  {
    name: 'query_bookings',
    description: 'Search bookings by date range, status, or game. Returns recent bookings with customer details.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dateFrom: { type: 'string', description: 'Start date (YYYY-MM-DD). Defaults to today if not provided.' },
        dateTo: { type: 'string', description: 'End date (YYYY-MM-DD). Defaults to 7 days from start if not provided.' },
        status: { type: 'string', enum: ['confirmed', 'pending', 'cancelled', 'completed'], description: 'Filter by booking status.' },
        gameId: { type: 'string', description: 'Filter by specific game ID' },
        limit: { type: 'number', description: 'Max number of bookings to return (default: 20, max: 100)' },
      },
      required: [],
    },
  },
  {
    name: 'query_games',
    description: 'List all games with booking stats (total bookings, revenue). Useful for performance analysis.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dateFrom: { type: 'string', description: 'Start date for stats calculation (YYYY-MM-DD). Defaults to 30 days ago.' },
        dateTo: { type: 'string', description: 'End date for stats calculation (YYYY-MM-DD). Defaults to today.' },
      },
      required: [],
    },
  },
  {
    name: 'query_rooms',
    description: 'List all rooms with availability info and recent booking activity.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'query_revenue',
    description: 'Get revenue summary with trends. Includes today, this week, this month, and comparisons.',
    input_schema: {
      type: 'object' as const,
      properties: {
        period: { type: 'string', enum: ['today', 'yesterday', 'week', 'month', 'year'], description: 'Time period for revenue summary. Defaults to "today".' },
      },
      required: [],
    },
  },
  {
    name: 'query_schedules',
    description: 'Get upcoming schedules with capacity info. Shows what times are available.',
    input_schema: {
      type: 'object' as const,
      properties: {
        gameId: { type: 'string', description: 'Filter by specific game ID' },
        days: { type: 'number', description: 'Number of days ahead to show (default: 7, max: 30)' },
      },
      required: [],
    },
  },
  {
    name: 'query_analytics',
    description: 'Get analytics insights: popular times, busiest days, avg group size, cancellation rate, trends.',
    input_schema: {
      type: 'object' as const,
      properties: {
        dateFrom: { type: 'string', description: 'Start date for analysis (YYYY-MM-DD). Defaults to 30 days ago.' },
        dateTo: { type: 'string', description: 'End date for analysis (YYYY-MM-DD). Defaults to today.' },
      },
      required: [],
    },
  },
  {
    name: 'suggest_actions',
    description: 'Generate proactive suggestions based on data patterns (slow days, pricing opportunities, etc.).',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];
