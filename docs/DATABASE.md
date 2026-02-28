# Database (AWS-only) — DynamoDB plan

This document describes the planned DynamoDB tables for the **booking core**.

Design goals:
- Near-zero idle cost
- High reliability
- Fast slot checks + safe holds
- Automatic hold expiration (TTL)

## Tables (v1)

### 0) Users (dashboard auth)
**Table:** `bf_users`
- PK: `userId`

Attributes:
- `email` (unique)
- `passwordHash` (bcrypt)
- `orgId`
- `role` (owner/admin)
- `createdAt`

Recommended indexes:
- GSI1PK: `email`
- GSI1SK: `userId`

### 0b) Sessions (optional)
If using server-stored sessions:
**Table:** `bf_sessions`
- PK: `sessionToken`

Attributes:
- `userId`
- `orgId`
- `expiresAtEpoch` (TTL)

If using JWT cookies instead, you may not need this table.

### 1) Organizations
**Table:** `bf_orgs`
- PK: `orgId`

Attributes:
- `name`
- `timezone`

### 2) Games
**Table:** `bf_games`
- PK: `orgId`
- SK: `gameId`

Attributes:
- `name`
- `durationMins`
- `bufferMins`
- `slotIntervalMins`
- `minPlayers`, `maxPlayers`
- `allowPrivate`, `allowPublic`

### 3) Rooms
**Table:** `bf_rooms`
- PK: `orgId`
- SK: `roomId`

Attributes:
- `gameId`
- `name`
- `maxPlayers`
- `enabled`

GSI (for listing rooms by game):
- GSI1PK: `orgId#gameId`
- GSI1SK: `roomId`

### 4) Schedules
**Table:** `bf_schedules`
- PK: `orgId`
- SK: `scheduleId`

Attributes:
- `gameId`
- `openingHours` (array)
- (later) exceptions/blackouts

GSI (schedule by game):
- GSI1PK: `orgId#gameId`
- GSI1SK: `scheduleId`

### 5) Holds (TTL)
**Table:** `bf_holds`
- PK: `orgId#roomId#YYYY-MM-DD`
- SK: `startAtISO#holdId`

Attributes:
- `holdId`
- `gameId`, `roomId`
- `bookingType`
- `startAt`, `endAt`
- `players`
- `status` (active/confirmed/expired/canceled)
- `expiresAtEpoch` (number)  ← DynamoDB TTL attribute

Notes:
- TTL deletes items after expiration automatically.
- We still treat holds as expired if `expiresAtEpoch < now` even before delete.

### 6) Bookings
**Table:** `bf_bookings`
- PK: `orgId#roomId#YYYY-MM-DD`
- SK: `startAtISO#bookingId`

Attributes:
- `bookingId`
- `holdId` (optional)
- `gameId`, `roomId`
- `bookingType`
- `startAt`, `endAt`
- `players`
- `status` (confirmed/canceled)
- `createdAt`

GSI (by org for reporting):
- GSI1PK: `orgId`
- GSI1SK: `createdAt#bookingId`

## Conflict checking strategy

For a requested (room, date):
1) Query `bf_bookings` for that partition and time range.
2) Query `bf_holds` for that partition and time range.
3) Apply the same deterministic overlap + capacity rules as the domain layer.

This keeps logic consistent across dev (memory) and prod (DynamoDB).
