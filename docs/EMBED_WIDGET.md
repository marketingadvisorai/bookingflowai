# Embed Widget (v1) — Contract

The widget is served from a **stable domain** with **versioned paths**.

Example:
- `https://embed.bookingflowai.com/v1/widget.js`

## Why versioned paths

- Customers embed `v1` and it keeps working.
- Breaking changes ship as `v2`.
- CDN caching becomes safe and predictable.

## Embed snippet (v1)

```html
<script
  src="https://embed.bookingflowai.com/v1/widget.js"
  async
></script>

<div
  id="bookingflow-widget"
  data-org-id="org_demo"
  data-game-id="game_prison"
  data-theme="dark"
></div>
```

## Configuration (data attributes)

Required:
- `data-org-id`
- `data-game-id`

Optional:
- `data-theme`: `dark | light | auto` (default: `dark`)
- `data-primary-color`: CSS color string (future)

## Runtime behavior

Widget flow:
1) Load config (orgId, gameId)
2) Call availability API:
   - `GET /api/v1/availability?orgId=...&gameId=...&date=...&type=...&players=...`
3) User selects slot + room → create hold:
   - `POST /api/v1/holds`
4) Confirm booking:
   - `POST /api/v1/bookings/confirm`

## Error handling requirements

- If API is down, show a friendly fallback and retry.
- Never show a blank widget.
- Do not guess availability.

## Backward compatibility

- `v1` must keep accepting the same config keys.
- New optional features must be additive.
