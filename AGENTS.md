# AGENTS.md (BookingFlow Next)

This repository is designed to be worked on by humans and coding agents.

## File size & quality rules

- Target **150–200 lines per file**.
- Hard cap **400 lines per file** (split if you exceed).
- Prefer small, cohesive modules over large “god files”.

## Architecture boundaries (must follow)

### Domain layer (pure logic)
- Location: `src/lib/booking/*`
- **No** Next.js imports.
- **No** AWS/DynamoDB imports.
- Deterministic business rules only (availability, capacity, validation helpers).

### Data layer (storage adapters)
- Location: `src/lib/db/*` (to be added)
- Adapters for `memory` (dev) and `dynamo` (prod).
- Returns domain objects; does not contain UI logic.

### API layer
- Location: `src/app/api/v1/*`
- Keep route handlers thin:
  - parse/validate input
  - call domain logic
  - call data adapter
  - return response

### UI layer
- Location: `src/app/(dashboard)/*`, `src/components/*`
- Pages compose components; complex logic goes into hooks/services.

## API versioning

- Public widget + API are versioned.
- Do not break `v1` contracts; ship breaking changes under `v2`.

## Testing & checks

Before committing:
- `npm run lint`
- If UI changed: run `npm run dev` and spot-check the page.

## Security notes

- Never hardcode secrets.
- For AWS-only production, holds must expire via DynamoDB TTL.
