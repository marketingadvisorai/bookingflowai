/** Tool definitions for the booking assistant (Anthropic SDK) */
import type Anthropic from '@anthropic-ai/sdk';

export const chatbotTools: Anthropic.Tool[] = [
  {
    name: 'search_games',
    description: 'Search available games/experiences at the venue.',
    input_schema: {
      type: 'object' as const,
      properties: {
        orgId: { type: 'string', description: 'Organization ID' },
        query: { type: 'string', description: 'Optional search query' },
      },
      required: ['orgId'],
    },
  },
  {
    name: 'check_availability',
    description: 'Check available time slots for a game on a date.',
    input_schema: {
      type: 'object' as const,
      properties: {
        orgId: { type: 'string', description: 'Organization ID' },
        gameId: { type: 'string', description: 'Game ID' },
        date: { type: 'string', description: 'Date (YYYY-MM-DD)' },
        players: { type: 'number', description: 'Number of players' },
        bookingType: { type: 'string', enum: ['public', 'private'] },
      },
      required: ['orgId', 'gameId', 'date', 'players'],
    },
  },
  {
    name: 'create_hold',
    description: 'Create a temporary hold on a time slot (10 min expiry).',
    input_schema: {
      type: 'object' as const,
      properties: {
        orgId: { type: 'string' },
        gameId: { type: 'string' },
        roomId: { type: 'string' },
        date: { type: 'string', description: 'Date (YYYY-MM-DD)' },
        time: { type: 'string', description: 'Start time (ISO string)' },
        players: { type: 'number' },
        bookingType: { type: 'string', enum: ['public', 'private'] },
        customerName: { type: 'string' },
        customerEmail: { type: 'string' },
      },
      required: ['orgId', 'gameId', 'roomId', 'date', 'time', 'players', 'customerName', 'customerEmail'],
    },
  },
  {
    name: 'get_pricing',
    description: 'Get pricing for a game based on number of players.',
    input_schema: {
      type: 'object' as const,
      properties: {
        orgId: { type: 'string' },
        gameId: { type: 'string' },
        players: { type: 'number' },
      },
      required: ['orgId', 'gameId', 'players'],
    },
  },
];
