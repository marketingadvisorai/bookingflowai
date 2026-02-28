# BookingFlow

A SaaS booking platform for escape rooms and experience-based businesses. Manage games, rooms, schedules, and payments from a single dashboard. Embed a booking widget on any website.

## Live

- **Marketing & Dashboard:** [bookingflowai.com](https://bookingflowai.com)
- **Widget CDN:** [script.bookingflowai.com](https://script.bookingflowai.com)

## Tech Stack

- **Framework:** Next.js 16 / TypeScript / Tailwind CSS
- **Database:** AWS DynamoDB (9 tables)
- **Auth:** Custom sessions (bcrypt + cookies) + Google OAuth
- **Payments:** Stripe Connect (destination charges)
- **Email:** AWS SES
- **Hosting:** AWS Amplify (auto-deploy from `main`)
- **CDN:** CloudFront

## Quick Start

```bash
# Clone and install
cd web
npm install

# Set up environment
cp .env.example .env.local
# Fill in required vars (see below)

# Run locally
npm run dev
# → http://localhost:3000
```

## Environment Variables

| Variable | Description |
|---|---|
| `BF_DDB_USERS` | DynamoDB users table name |
| `BF_DDB_SESSIONS` | DynamoDB sessions table name |
| `BF_DDB_ORGS` | DynamoDB orgs table name |
| `BF_DDB_GAMES` | DynamoDB games table name |
| `BF_DDB_ROOMS` | DynamoDB rooms table name |
| `BF_DDB_SCHEDULES` | DynamoDB schedules table name |
| `BF_DDB_BOOKINGS` | DynamoDB bookings table name |
| `BF_DDB_HOLDS` | DynamoDB holds table name |
| `BF_DDB_PASSWORD_RESETS` | DynamoDB password resets table name |
| `BF_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `BF_GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `BF_PUBLIC_BASE_URL` | Public base URL for the app |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `AWS_REGION` | AWS region |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |

## Features

- **Game & Room Management** — Create and manage escape room experiences with photos, descriptions, pricing, difficulty, and capacity
- **Schedule Builder** — Define time slots with day-of-week patterns and date overrides
- **Booking Widget** — Embeddable widget with calendar, time picker, and checkout; generate embed code from the dashboard
- **Stripe Connect** — Onboard venues with Stripe Connect, process payments with platform fee
- **Multi-Domain Routing** — Middleware routes traffic to dashboard, marketing site, or EscapeBoost based on hostname
- **Auth System** — Email/password with bcrypt, Google OAuth, session cookies, password reset via SES
- **Dashboard Settings** — Tracking pixels, payment configuration, promotional codes
- **Contact Form** — Public contact form with SES delivery

## Deployment

Pushing to `main` triggers an automatic build and deploy on AWS Amplify.

```bash
# Check build status
source secrets/.env.bookingflow-aws
aws amplify list-jobs --app-id d3krnmozy8tczj --branch-name main --max-items 1
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup
│   ├── (marketing)/     # Landing, features, pricing, blog
│   ├── dashboard/       # Protected dashboard pages
│   ├── api/             # API routes (auth, v1, dashboard)
│   ├── widget/          # Embeddable booking widget
│   └── book/            # Standalone booking page
├── components/ui/       # Shared UI components
├── lib/
│   ├── db/              # DynamoDB interface
│   ├── auth/            # Session and password helpers
│   ├── email/           # SES email sender
│   └── http/            # CSRF, rate limiting
└── middleware.ts         # Domain routing
```

## License

Proprietary. All rights reserved.
