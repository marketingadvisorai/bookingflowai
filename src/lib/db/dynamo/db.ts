import type { Booking, Game, Hold, Org, Room, Schedule } from '@/lib/booking/types';
import type { Db } from '@/lib/db/types';
import type { Session, User } from '@/lib/auth/types';
import { createDynamoDocClient } from '@/lib/db/dynamo/client';
import { getDynamoEnv } from '@/lib/db/dynamo/env';
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  TransactWriteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

function pk(orgId: string) {
  return `ORG#${orgId}`;
}

function sk(entity: string, id: string) {
  return `${entity}#${id}`;
}

function slotLockSk(roomId: string, startAt: string) {
  // Keep deterministic + safe for Dynamo keys.
  return `SLOTLOCK#${roomId}#${encodeURIComponent(startAt)}`;
}

function bookingSlotSk(roomId: string, startAt: string) {
  return `SLOT#${roomId}#${encodeURIComponent(startAt)}`;
}

// IMPORTANT: This is a simple implementation that matches our current API needs.
// We keep separate tables per entity (per docs/DATABASE.md).
// All items use PK=ORG#<orgId>, SK=<ENTITY>#<id>.
// For holds/bookings we also include a GSI for listing by game.

export function createDynamoDb(): Db {
  const ddb = createDynamoDocClient();
  const env = getDynamoEnv();

  return {
    async listOrgs(orgId) {
      if (orgId) {
        const o = await this.getOrg(orgId);
        return o ? [o] : [];
      }
      // Listing all orgs isn't needed for MVP; return empty.
      return [];
    },
    async getOrg(orgId) {
      const res = await ddb.send(
        new GetCommand({
          TableName: env.orgsTable,
          Key: { pk: 'ORG', sk: orgId },
        })
      );
      return (res.Item?.data as Org) ?? null;
    },
    async putOrg(org: Org) {
      await ddb.send(
        new PutCommand({
          TableName: env.orgsTable,
          Item: { pk: 'ORG', sk: org.orgId, data: org },
        })
      );
    },

    async listGames(orgId) {
      const res = await ddb.send(
        new QueryCommand({
          TableName: env.gamesTable,
          KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
          ExpressionAttributeValues: { ':pk': pk(orgId), ':sk': 'GAME#' },
        })
      );
      return (res.Items ?? []).map((it) => it.data as Game);
    },
    async getGame(orgId, gameId) {
      const res = await ddb.send(
        new GetCommand({
          TableName: env.gamesTable,
          Key: { pk: pk(orgId), sk: sk('GAME', gameId) },
        })
      );
      return (res.Item?.data as Game) ?? null;
    },
    async putGame(orgId, game) {
      await ddb.send(
        new PutCommand({
          TableName: env.gamesTable,
          Item: { pk: pk(orgId), sk: sk('GAME', game.gameId), data: game },
        })
      );
    },
    async deleteGame(orgId, gameId) {
      await ddb.send(
        new DeleteCommand({
          TableName: env.gamesTable,
          Key: { pk: pk(orgId), sk: sk('GAME', gameId) },
        })
      );
    },

    async listRooms(orgId) {
      const res = await ddb.send(
        new QueryCommand({
          TableName: env.roomsTable,
          KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
          ExpressionAttributeValues: { ':pk': pk(orgId), ':sk': 'ROOM#' },
        })
      );
      return (res.Items ?? []).map((it) => it.data as Room);
    },
    async getRoom(orgId, roomId) {
      const res = await ddb.send(
        new GetCommand({
          TableName: env.roomsTable,
          Key: { pk: pk(orgId), sk: sk('ROOM', roomId) },
        })
      );
      return (res.Item?.data as Room) ?? null;
    },
    async putRoom(orgId, room) {
      await ddb.send(
        new PutCommand({
          TableName: env.roomsTable,
          Item: { pk: pk(orgId), sk: sk('ROOM', room.roomId), data: room },
        })
      );
    },
    async deleteRoom(orgId, roomId) {
      await ddb.send(
        new DeleteCommand({
          TableName: env.roomsTable,
          Key: { pk: pk(orgId), sk: sk('ROOM', roomId) },
        })
      );
    },

    async listSchedules(orgId) {
      const res = await ddb.send(
        new QueryCommand({
          TableName: env.schedulesTable,
          KeyConditionExpression: 'pk = :pk and begins_with(sk, :sk)',
          ExpressionAttributeValues: { ':pk': pk(orgId), ':sk': 'SCHEDULE#' },
        })
      );
      return (res.Items ?? []).map((it) => it.data as Schedule);
    },
    async getSchedule(orgId, scheduleId) {
      const res = await ddb.send(
        new GetCommand({
          TableName: env.schedulesTable,
          Key: { pk: pk(orgId), sk: sk('SCHEDULE', scheduleId) },
        })
      );
      return (res.Item?.data as Schedule) ?? null;
    },
    async putSchedule(orgId, schedule) {
      await ddb.send(
        new PutCommand({
          TableName: env.schedulesTable,
          Item: { pk: pk(orgId), sk: sk('SCHEDULE', schedule.scheduleId), data: schedule },
        })
      );
    },
    async deleteSchedule(orgId, scheduleId) {
      await ddb.send(
        new DeleteCommand({
          TableName: env.schedulesTable,
          Key: { pk: pk(orgId), sk: sk('SCHEDULE', scheduleId) },
        })
      );
    },

    async listHoldsForGame(orgId, gameId) {
      const res = await ddb.send(
        new QueryCommand({
          TableName: env.holdsTable,
          IndexName: 'gsi1',
          KeyConditionExpression: 'gsi1pk = :pk and begins_with(gsi1sk, :sk)',
          ExpressionAttributeValues: { ':pk': `ORG#${orgId}#GAME#${gameId}`, ':sk': 'HOLD#' },
        })
      );
      return (res.Items ?? []).map((it) => it.data as Hold);
    },
    async getHold(orgId, holdId) {
      const res = await ddb.send(
        new GetCommand({
          TableName: env.holdsTable,
          Key: { pk: pk(orgId), sk: sk('HOLD', holdId) },
        })
      );
      return (res.Item?.data as Hold) ?? null;
    },
    async putHold(orgId, hold) {
      // DynamoDB TTL = expiresAt + 24 hours so holds survive for Stripe webhook processing
      // even after the hold logically expires
      const expiresAtEpoch = Math.floor(new Date(hold.expiresAt).getTime() / 1000) + 86400;

      // Concurrency hardening (private bookings):
      // Create a short-lived slot lock item that prevents another private hold
      // from being created for the same room+startAt.
      if (hold.bookingType === 'private' && hold.status === 'active') {
        await ddb.send(
          new TransactWriteCommand({
            TransactItems: [
              {
                Put: {
                  TableName: env.holdsTable,
                  Item: {
                    pk: pk(orgId),
                    sk: slotLockSk(hold.roomId, hold.startAt),
                    ttl: expiresAtEpoch,
                    data: { orgId, roomId: hold.roomId, startAt: hold.startAt, type: 'hold_lock' },
                  },
                  ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
                },
              },
              {
                Put: {
                  TableName: env.holdsTable,
                  Item: {
                    pk: pk(orgId),
                    sk: sk('HOLD', hold.holdId),
                    gsi1pk: `ORG#${orgId}#GAME#${hold.gameId}`,
                    gsi1sk: `HOLD#${hold.holdId}`,
                    ttl: expiresAtEpoch,
                    data: hold,
                  },
                  ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
                },
              },
            ],
          })
        );
        return;
      }

      // Concurrency hardening (public bookings):
      // Use a transactional write with a capacity counter item per room+slot
      // to prevent overselling. The counter tracks total held players atomically.
      if (hold.bookingType === 'public' && hold.status === 'active') {
        const capacityKey = `PUBCAP#${hold.roomId}#${encodeURIComponent(hold.startAt)}`;
        await ddb.send(
          new TransactWriteCommand({
            TransactItems: [
              {
                // Atomically increment public player count, fail if over maxPlayers.
                // We pass maxPlayers via the route handler on hold.maxPlayersForSlot.
                Update: {
                  TableName: env.holdsTable,
                  Key: { pk: pk(orgId), sk: capacityKey },
                  UpdateExpression: 'SET #players = if_not_exists(#players, :zero) + :add, #ttl = :ttl',
                  ConditionExpression: 'if_not_exists(#players, :zero) + :add <= :max',
                  ExpressionAttributeNames: { '#players': 'usedPlayers', '#ttl': 'ttl' },
                  ExpressionAttributeValues: {
                    ':zero': 0,
                    ':add': hold.players,
                    ':max': (hold as unknown as Record<string, number>).maxPlayersForSlot ?? 999,
                    ':ttl': expiresAtEpoch,
                  },
                },
              },
              {
                Put: {
                  TableName: env.holdsTable,
                  Item: {
                    pk: pk(orgId),
                    sk: sk('HOLD', hold.holdId),
                    gsi1pk: `ORG#${orgId}#GAME#${hold.gameId}`,
                    gsi1sk: `HOLD#${hold.holdId}`,
                    ttl: expiresAtEpoch,
                    data: hold,
                  },
                  ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
                },
              },
            ],
          })
        );
        return;
      }

      // For updates (confirm/expire/cancel), we must allow overwriting the existing hold item.
      // For creates, we still use a conditional write to avoid accidental overwrites.
      const isCreate = hold.status === 'active';

      await ddb.send(
        new PutCommand({
          TableName: env.holdsTable,
          Item: {
            pk: pk(orgId),
            sk: sk('HOLD', hold.holdId),
            gsi1pk: `ORG#${orgId}#GAME#${hold.gameId}`,
            gsi1sk: `HOLD#${hold.holdId}`,
            ttl: expiresAtEpoch,
            data: hold,
          },
          ...(isCreate ? { ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)' } : {}),
        })
      );
    },

    async extendHoldTTL(orgId, holdId, newExpiresAt) {
      const ttl = Math.floor(new Date(newExpiresAt).getTime() / 1000);
      await ddb.send(
        new UpdateCommand({
          TableName: env.holdsTable,
          Key: { pk: pk(orgId), sk: sk('HOLD', holdId) },
          UpdateExpression: 'SET #ttl = :ttl, #data.#exp = :exp',
          ExpressionAttributeNames: { '#ttl': 'ttl', '#data': 'data', '#exp': 'expiresAt' },
          ExpressionAttributeValues: { ':ttl': ttl, ':exp': newExpiresAt },
          ConditionExpression: 'attribute_exists(pk)',
        })
      );
    },

    async listBookingsForGame(orgId, gameId) {
      const res = await ddb.send(
        new QueryCommand({
          TableName: env.bookingsTable,
          IndexName: 'gsi1',
          KeyConditionExpression: 'gsi1pk = :pk and begins_with(gsi1sk, :sk)',
          ExpressionAttributeValues: { ':pk': `ORG#${orgId}#GAME#${gameId}`, ':sk': 'BOOKING#' },
        })
      );
      return (res.Items ?? []).map((it) => it.data as Booking);
    },
    async getBooking(orgId, bookingId) {
      const res = await ddb.send(
        new GetCommand({
          TableName: env.bookingsTable,
          Key: { pk: pk(orgId), sk: sk('BOOKING', bookingId) },
        })
      );
      return (res.Item?.data as Booking) ?? null;
    },
    async putBooking(orgId, booking) {
      // Create is conditional; cancel/update overwrites.
      const isCreate = booking.status === 'confirmed';

      // Concurrency hardening (private bookings):
      // Create a permanent slot lock item so two bookings can't confirm the same room+startAt.
      if (isCreate && booking.bookingType === 'private') {
        await ddb.send(
          new TransactWriteCommand({
            TransactItems: [
              {
                Put: {
                  TableName: env.bookingsTable,
                  Item: {
                    pk: pk(orgId),
                    sk: bookingSlotSk(booking.roomId, booking.startAt),
                    data: { orgId, roomId: booking.roomId, startAt: booking.startAt, type: 'booking_lock' },
                  },
                  ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
                },
              },
              {
                Put: {
                  TableName: env.bookingsTable,
                  Item: {
                    pk: pk(orgId),
                    sk: sk('BOOKING', booking.bookingId),
                    gsi1pk: `ORG#${orgId}#GAME#${booking.gameId}`,
                    gsi1sk: `BOOKING#${booking.bookingId}`,
                    data: booking,
                  },
                  ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)',
                },
              },
            ],
          })
        );
        return;
      }

      await ddb.send(
        new PutCommand({
          TableName: env.bookingsTable,
          Item: {
            pk: pk(orgId),
            sk: sk('BOOKING', booking.bookingId),
            gsi1pk: `ORG#${orgId}#GAME#${booking.gameId}`,
            gsi1sk: `BOOKING#${booking.bookingId}`,
            data: booking,
          },
          ...(isCreate ? { ConditionExpression: 'attribute_not_exists(pk) AND attribute_not_exists(sk)' } : {}),
        })
      );
    },

    async getRecentBookings(orgId, limit) {
      // Get all games first, then query bookings for each game
      const games = await this.listGames(orgId);
      const lists = await Promise.all(games.map((g) => this.listBookingsForGame(orgId, g.gameId)));
      const allBookings = lists.flat();
      
      // Sort by createdAt descending and take the limit
      return allBookings
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, limit);
    },

    async countBookingsForOrg(orgId) {
      const games = await this.listGames(orgId);
      const lists = await Promise.all(games.map((g) => this.listBookingsForGame(orgId, g.gameId)));
      const allBookings = lists.flat();
      return allBookings.length;
    },

    async getTotalRevenue(orgId) {
      const games = await this.listGames(orgId);
      const lists = await Promise.all(games.map((g) => this.listBookingsForGame(orgId, g.gameId)));
      const allBookings = lists.flat();
      
      // Sum totalCents for confirmed bookings
      return allBookings
        .filter((b) => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.totalCents ?? 0), 0);
    },

    // users
    async getUserByEmail(email: string) {
      const res = await ddb.send(
        new GetCommand({
          TableName: env.usersTable,
          Key: { pk: 'EMAIL', sk: email.toLowerCase() },
        })
      );
      return (res.Item?.data as User) ?? null;
    },
    async getUserById(userId: string) {
      const res = await ddb.send(
        new GetCommand({
          TableName: env.usersTable,
          Key: { pk: 'USER', sk: userId },
        })
      );
      return (res.Item?.data as User) ?? null;
    },
    async putUser(user: User) {
      // Store two items to support unique email lookups without scans.
      await ddb.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Put: {
                TableName: env.usersTable,
                Item: { pk: 'USER', sk: user.userId, data: user },
              },
            },
            {
              Put: {
                TableName: env.usersTable,
                Item: { pk: 'EMAIL', sk: user.email.toLowerCase(), data: user },
              },
            },
          ],
        })
      );
    },

    // sessions
    async getSession(sessionToken: string) {
      const res = await ddb.send(
        new GetCommand({
          TableName: env.sessionsTable,
          Key: { pk: 'SESSION', sk: sessionToken },
        })
      );
      const ses = (res.Item?.data as Session) ?? null;
      if (!ses) return null;
      if (new Date(ses.expiresAt).getTime() <= Date.now()) return null;
      return ses;
    },
    async putSession(session: Session) {
      const ttl = Math.floor(new Date(session.expiresAt).getTime() / 1000);
      await ddb.send(
        new PutCommand({
          TableName: env.sessionsTable,
          Item: {
            pk: 'SESSION',
            sk: session.sessionToken,
            gsi1pk: `USER#${session.userId}`,
            gsi1sk: `SESSION#${session.sessionToken}`,
            ttl,
            data: session,
          },
        })
      );
    },
    async deleteSession(sessionToken: string) {
      await ddb.send(
        new DeleteCommand({
          TableName: env.sessionsTable,
          Key: { pk: 'SESSION', sk: sessionToken },
        })
      );
    },
    async deleteSessionsForUser(userId: string) {
      // Query by USER#<userId> via GSI and delete all sessions.
      const res = await ddb.send(
        new QueryCommand({
          TableName: env.sessionsTable,
          IndexName: 'gsi1',
          KeyConditionExpression: 'gsi1pk = :pk AND begins_with(gsi1sk, :sk)',
          ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':sk': 'SESSION#',
          },
        })
      );

      const items = (res.Items ?? []) as Array<{ pk: string; sk: string }>;
      await Promise.all(
        items.map((it) =>
          ddb
            .send(
              new DeleteCommand({
                TableName: env.sessionsTable,
                Key: { pk: it.pk, sk: it.sk },
              })
            )
            .catch(() => null)
        )
      );
    },
    // admin scans
    async scanAllUsers() {
      const items: User[] = [];
      let lastKey: Record<string, unknown> | undefined;
      do {
        const res = await ddb.send(
          new ScanCommand({
            TableName: env.usersTable,
            FilterExpression: 'pk = :pk',
            ExpressionAttributeValues: { ':pk': 'USER' },
            ...(lastKey ? { ExclusiveStartKey: lastKey } : {}),
          })
        );
        for (const it of res.Items ?? []) {
          items.push(it.data as User);
        }
        lastKey = res.LastEvaluatedKey as Record<string, unknown> | undefined;
      } while (lastKey);
      return items;
    },
    async scanAllOrgs() {
      const items: Org[] = [];
      let lastKey: Record<string, unknown> | undefined;
      do {
        const res = await ddb.send(
          new ScanCommand({
            TableName: env.orgsTable,
            FilterExpression: 'pk = :pk',
            ExpressionAttributeValues: { ':pk': 'ORG' },
            ...(lastKey ? { ExclusiveStartKey: lastKey } : {}),
          })
        );
        for (const it of res.Items ?? []) {
          items.push(it.data as Org);
        }
        lastKey = res.LastEvaluatedKey as Record<string, unknown> | undefined;
      } while (lastKey);
      return items;
    },
    async countAllBookings() {
      let count = 0;
      let lastKey: Record<string, unknown> | undefined;
      do {
        const res = await ddb.send(
          new ScanCommand({
            TableName: env.bookingsTable,
            FilterExpression: 'begins_with(sk, :sk)',
            ExpressionAttributeValues: { ':sk': 'BOOKING#' },
            Select: 'COUNT',
            ...(lastKey ? { ExclusiveStartKey: lastKey } : {}),
          })
        );
        count += res.Count ?? 0;
        lastKey = res.LastEvaluatedKey as Record<string, unknown> | undefined;
      } while (lastKey);
      return count;
    },

    // Gift cards (not supported in DynamoDB - PostgreSQL only)
    async createGiftCard() {
      throw new Error('Gift cards not supported in DynamoDB mode');
    },
    async getGiftCardByCode() {
      throw new Error('Gift cards not supported in DynamoDB mode');
    },
    async getGiftCardById() {
      throw new Error('Gift cards not supported in DynamoDB mode');
    },
    async listGiftCardsByOrg() {
      throw new Error('Gift cards not supported in DynamoDB mode');
    },
    async updateGiftCardBalance() {
      throw new Error('Gift cards not supported in DynamoDB mode');
    },
    async updateGiftCardStatus() {
      throw new Error('Gift cards not supported in DynamoDB mode');
    },
    async redeemGiftCard() {
      throw new Error('Gift cards not supported in DynamoDB mode');
    },
    async listGiftCardTransactions() {
      throw new Error('Gift cards not supported in DynamoDB mode');
    },
    async createGiftCardTransaction() {
      throw new Error('Gift cards not supported in DynamoDB mode');
    },
    
    // Hold cleanup - uses DynamoDB scan with filter
    async expireStaleHolds(): Promise<number> {
      const nowIso = new Date().toISOString();
      // DynamoDB: scan for active holds with expired timestamps
      // This is expensive but holds table is typically small
      const { Items } = await ddb.send(new ScanCommand({
        TableName: env.holdsTable,
        FilterExpression: '#status = :active AND expires_at < :now',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':active': 'active',
          ':now': nowIso,
        },
      }));
      
      if (!Items || Items.length === 0) return 0;
      
      // Update each expired hold
      let count = 0;
      for (const item of Items) {
        const itemPk = item.pk as string | undefined;
        const itemSk = item.sk as string | undefined;
        if (!itemPk || !itemSk) continue;
        
        await ddb.send(new UpdateCommand({
          TableName: env.holdsTable,
          Key: { pk: itemPk, sk: itemSk },
          UpdateExpression: 'SET #status = :expired',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: { ':expired': 'expired' },
        }));
        count++;
      }
      return count;
    },
    
    async countActiveHolds(): Promise<number> {
      const nowIso = new Date().toISOString();
      const { Count } = await ddb.send(new ScanCommand({
        TableName: env.holdsTable,
        FilterExpression: '#status = :active AND expires_at >= :now',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':active': 'active',
          ':now': nowIso,
        },
        Select: 'COUNT',
      }));
      return Count ?? 0;
    },
  } satisfies Db;
}
