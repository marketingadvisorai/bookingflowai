# Architecture (BookingFlow Next)

Goal: build an **always-on embed booking widget** and a **booking core API** that stay reliable even if the owner dashboard is down.

This codebase starts as a single Next.js app for speed, but is structured so the booking core can be deployed on AWS (API Gateway + Lambda + DynamoDB) without rewriting domain logic.

## Components

### 1) Embed Widget (critical path)
- A small JS bundle customers embed on their websites.
- Served via CDN (S3 + CloudFront) from a stable domain:
  - `https://script.bookingflowai.com/v1/widget.js` (canonical; see `docs/DOMAINS.md`)
- The widget calls the **versioned Booking API**.

### 2) Booking API (critical path)
- Source of truth for:
  - availability
  - holds
  - bookings
  - pricing (later)
- Versioned endpoints:
  - `/api/v1/...` (Next.js today, AWS later)

### 3) Owner Dashboard (non-critical)
- Used by owners to configure:
  - games
  - rooms
  - schedules
  - users/access (auth)
  - pricing/policies (later)
- If dashboard is down, widget booking must continue.

### 4) Auth (owner access)
- Email + password signup/login (MVP)
- Session-based access control for `/dashboard/*`
- Google OAuth login later (planned)
- Auth is **not** in the critical booking path, but is required for secure operations.

## Layered design (module boundaries)

### Domain layer (pure logic)
- `src/lib/booking/*`
- Deterministic logic only:
  - slot generation
  - capacity rules
  - overlap checks
- No Next imports, no AWS imports.

### Data layer (storage adapters)
- `src/lib/db/*` (planned)
- Adapters:
  - `memory` (local dev)
  - `dynamo` (AWS production)

### API layer
- `src/app/api/v1/*`
- Thin handlers:
  1) validate input (zod)
  2) fetch/store data via adapter
  3) call domain logic
  4) return JSON

### UI layer
- `src/app/*` pages + `src/components/*`
- shadcn/ui components + Tailwind.

## Versioning strategy

We use **one stable domain** plus **versioned paths**.

- Keep `v1` stable:
  - bug fixes allowed
  - no breaking changes
- Breaking changes ship as `v2`:
  - new embed snippet URL
  - new API paths

This prevents one deploy from breaking all customer embeds.

## Escape-room model (today)

Escape rooms map to a general resource booking system:
- **Room** = resource
- **Game** = product
- **Slot/session** = scheduled start time window
- **Booking types**:
  - `private`: any overlap blocks
  - `public`: share capacity (players), but private blocks public

Future industries are supported by extending resources (staff, vehicles, equipment) while keeping the same core design.

## Reliability rules (non-negotiable)

- Embed widget must not depend on dashboard being up.
- Holds must expire automatically (DynamoDB TTL in AWS).
- Availability must be deterministic (AI can assist UX, not compute truth).
