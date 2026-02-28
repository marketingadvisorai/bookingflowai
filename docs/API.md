# API (v1) — Booking Core

All booking-critical endpoints are versioned.

Base (local dev): `http://localhost:3000/api/v1`

## Common concepts

- `orgId`: tenant identifier.
- `gameId`: the escape room game.
- `roomId`: physical room for the game.
- `bookingType`: `private` or `public`.

## GET /availability

Returns available slots for a given date and party size.

### Query params
- `orgId` (string) — default `org_demo`
- `gameId` (string) — required
- `date` (YYYY-MM-DD) — required
- `type` (`private` | `public`) — required
- `players` (number) — optional (default 2)

### Example
`/api/v1/availability?orgId=org_demo&gameId=game_prison&date=2026-01-30&type=public&players=4`

### Response (shape)
```json
{
  "ok": true,
  "orgId": "org_demo",
  "gameId": "game_prison",
  "date": "2026-01-30",
  "type": "public",
  "players": 4,
  "slots": [
    {
      "startAt": "2026-01-30T04:00:00.000Z",
      "endAt": "2026-01-30T05:15:00.000Z",
      "availableRooms": [
        { "roomId": "room_a", "name": "Room A", "remainingPlayers": 10 }
      ]
    }
  ]
}
```

Notes:
- `endAt` includes duration + buffer.
- For `public`, rooms include `remainingPlayers`.

## POST /holds

Creates a temporary hold (default: 10 minutes) on a room+slot.

### Body
```json
{
  "orgId": "org_demo",
  "gameId": "game_prison",
  "roomId": "room_a",
  "bookingType": "private",
  "startAt": "2026-01-30T04:00:00.000Z",
  "endAt": "2026-01-30T05:15:00.000Z",
  "players": 4,
  "customer": { "name": "Sojol" }
}
```

### Conflict behavior
- `private` hold fails if **any overlap** exists.
- `public` hold fails if a `private` overlap exists, or if capacity would be exceeded.

### Response (shape)
```json
{ "ok": true, "hold": { "holdId": "...", "status": "active", "expiresAt": "..." } }
```

## POST /bookings/confirm

Converts an active hold into a confirmed booking.

### Body
```json
{ "orgId": "org_demo", "holdId": "..." }
```

### Response (shape)
```json
{ "ok": true, "booking": { "bookingId": "...", "status": "confirmed" } }
```

## Auth endpoints (planned)

Dashboard (owner) authentication (email/password):
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Google OAuth login (later):
- `GET /api/auth/google/start`
- `GET /api/auth/google/callback`

## GET /bookings/:bookingId (public, v1)

Fetch a booking by id (useful for refresh-safe confirmation screens).

### Query params
- `orgId` (string) — required

### Notes
- Response is a public-safe shape (minimal customer info).

## Future endpoints (planned)

- `POST /bookings/cancel` (dashboard already supports cancel today; public cancel is later)
- `POST /payments/intent` (Stripe)
