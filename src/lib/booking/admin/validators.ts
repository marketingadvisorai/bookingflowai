import { z } from 'zod';

export const orgIdSchema = z.string().min(1);

export const createGameSchema = z.object({
  orgId: orgIdSchema,
  gameId: z.string().min(1),
  name: z.string().min(1),
  durationMins: z.coerce.number().int().min(15).max(240),
  bufferMins: z.coerce.number().int().min(0).max(120).default(0),
  slotIntervalMins: z.coerce.number().int().min(5).max(180),
  minPlayers: z.coerce.number().int().min(1).max(100),
  maxPlayers: z.coerce.number().int().min(1).max(100),
  allowPrivate: z.coerce.boolean().default(true),
  allowPublic: z.coerce.boolean().default(true),

  heroImageUrl: z.string().min(1).optional(),
  previewVideoUrl: z.string().min(1).optional(),
  galleryImageUrls: z.array(z.string().min(1)).max(12).optional(),
});

export const updateGameSchema = createGameSchema.partial().extend({ orgId: orgIdSchema });

export const createRoomSchema = z.object({
  orgId: orgIdSchema,
  roomId: z.string().min(1),
  gameId: z.string().min(1),
  name: z.string().min(1),
  maxPlayers: z.coerce.number().int().min(1).max(100),
  enabled: z.coerce.boolean().default(true),
});

export const updateRoomSchema = createRoomSchema.partial().extend({ orgId: orgIdSchema });

export const openingHoursSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});

export const createScheduleSchema = z.object({
  orgId: orgIdSchema,
  scheduleId: z.string().min(1),
  gameId: z.string().min(1),
  openingHours: z.array(openingHoursSchema).min(1),
});

export const updateScheduleSchema = createScheduleSchema.partial().extend({ orgId: orgIdSchema });
