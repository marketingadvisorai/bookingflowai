import { NextResponse } from 'next/server';

export async function GET() {
  const env = process.env;
  const hasDynamoEnv =
    !!env.BF_DDB_USERS_TABLE &&
    !!env.BF_DDB_SESSIONS_TABLE &&
    !!env.BF_DDB_GAMES_TABLE &&
    !!env.BF_DDB_ROOMS_TABLE &&
    !!env.BF_DDB_SCHEDULES_TABLE &&
    !!env.BF_DDB_HOLDS_TABLE &&
    !!env.BF_DDB_BOOKINGS_TABLE;

  return NextResponse.json({
    ok: true,
    service: 'bookingflow-next',
    ts: new Date().toISOString(),
    dbProvider: env.BF_DB_PROVIDER ?? null,
    hasDynamoEnv,
  });
}

// Also expose the MVP booking endpoints:
// GET  /api/v1/availability?orgId=org_demo&gameId=game_prison&date=2026-01-30&type=private&players=4
// POST /api/v1/holds
// POST /api/v1/bookings/confirm
