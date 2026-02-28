import { eq, and } from 'drizzle-orm';
import type { DrizzleDb } from '../client';
import { games } from '../schema';
import type { Game } from '@/lib/booking/types';

function toGame(row: typeof games.$inferSelect): Game {
  const g: Game = {
    orgId: row.orgId, gameId: row.gameId, name: row.name,
    durationMins: row.durationMins, bufferMins: row.bufferMins,
    slotIntervalMins: row.slotIntervalMins,
    minPlayers: row.minPlayers, maxPlayers: row.maxPlayers,
    allowPrivate: row.allowPrivate, allowPublic: row.allowPublic,
  };
  if (row.pricingModel) g.pricingModel = row.pricingModel as Game['pricingModel'];
  if (row.pricingCurrency) g.pricingCurrency = row.pricingCurrency;
  if (row.pricingTiers) g.pricingTiers = row.pricingTiers as Game['pricingTiers'];
  if (row.heroImageUrl) g.heroImageUrl = row.heroImageUrl;
  if (row.heroImageThumbUrl) g.heroImageThumbUrl = row.heroImageThumbUrl;
  if (row.previewVideoUrl) g.previewVideoUrl = row.previewVideoUrl;
  if (row.galleryImageUrls) g.galleryImageUrls = row.galleryImageUrls as string[];
  return g;
}

function fromGame(orgId: string, game: Game) {
  return {
    orgId, gameId: game.gameId, name: game.name,
    durationMins: game.durationMins, bufferMins: game.bufferMins,
    slotIntervalMins: game.slotIntervalMins,
    minPlayers: game.minPlayers, maxPlayers: game.maxPlayers,
    allowPrivate: game.allowPrivate, allowPublic: game.allowPublic,
    pricingModel: game.pricingModel ?? null,
    pricingCurrency: game.pricingCurrency ?? null,
    pricingTiers: (game.pricingTiers as unknown as Record<string, unknown>) ?? null,
    heroImageUrl: game.heroImageUrl ?? null,
    heroImageThumbUrl: game.heroImageThumbUrl ?? null,
    previewVideoUrl: game.previewVideoUrl ?? null,
    galleryImageUrls: (game.galleryImageUrls as unknown) ?? null,
  };
}

export function createGameRepo(db: DrizzleDb) {
  return {
    async listGames(orgId: string): Promise<Game[]> {
      const rows = await db.select().from(games).where(eq(games.orgId, orgId));
      return rows.map(toGame);
    },
    async getGame(orgId: string, gameId: string): Promise<Game | null> {
      const rows = await db.select().from(games)
        .where(and(eq(games.orgId, orgId), eq(games.gameId, gameId)));
      return rows[0] ? toGame(rows[0]) : null;
    },
    async putGame(orgId: string, game: Game): Promise<void> {
      const values = fromGame(orgId, game);
      await db.insert(games).values(values)
        .onConflictDoUpdate({ target: [games.orgId, games.gameId], set: values });
    },
    async deleteGame(orgId: string, gameId: string): Promise<void> {
      await db.delete(games).where(and(eq(games.orgId, orgId), eq(games.gameId, gameId)));
    },
  };
}
