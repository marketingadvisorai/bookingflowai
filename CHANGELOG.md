# Changelog

All notable changes to BookingFlow are documented in this file.

## [1.0.0] — 2026-02-24

### Features

- **Booking Engine** — Full game/room/schedule CRUD with availability calendar and time slot management
- **Booking Widget** — Embeddable booking widget with embed code generator for external sites
- **Stripe Connect Payments** — Destination charges with platform fee, refund support
- **User Authentication** — Email/password signup + Google OAuth integration
- **Password Reset Flow** — Token-based password reset with SES email delivery
- **User Profile** — Profile page with password change functionality
- **Dashboard Settings** — Organization settings, tracking pixels, payment configuration, promotions
- **Multi-Domain Middleware** — Routes `bookingflowai.com` (marketing + dashboard), `escapeboost.com` (separate brand)
- **DynamoDB Backend** — 9 tables (`bf_users`, `bf_sessions`, `bf_orgs`, `bf_games`, `bf_rooms`, `bf_schedules`, `bf_bookings`, `bf_holds`, `bf_password_resets`)
- **Contact Form** — Contact page with AWS SES email integration
- **Blog System** — Static blog with 5 starter posts
- **Brand Assets** — Calendar+card icon, `_bookingflow` wordmark, sparkle favicon
- **Hero Section** — HQ responsive hero image (AVIF/WebP/JPG) with float and twinkle animations
- **EscapeBoost** — Separate escape-room-focused brand site on its own domain
- **Marketing Site** — Zapier/ElevenLabs-inspired landing pages with pricing tiers

### Security

- CSRF protection on all state-changing endpoints
- Rate limiting on auth endpoints
- IDOR patches on dashboard API routes
- Secure session management with httpOnly cookies

### Infrastructure

- AWS Amplify auto-deploy from `main` branch
- CloudFront CDN for static assets
- Environment variables written to `.env.production` during build for SSR runtime
