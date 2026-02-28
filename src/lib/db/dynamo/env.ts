export type DynamoEnv = {
  orgsTable: string;
  gamesTable: string;
  roomsTable: string;
  schedulesTable: string;
  holdsTable: string;
  bookingsTable: string;
  usersTable: string;
  sessionsTable: string;
};

function req(name: string, fallback?: string): string {
  const v = process.env[name];
  if (v) return v;
  if (fallback) return fallback;
  throw new Error(`Missing env var: ${name}`);
}

export function getDynamoEnv(): DynamoEnv {
  // Defaults are the production table names from the CloudFormation stack.
  // We still prefer explicit env vars when present.
  return {
    orgsTable: req('BF_DDB_ORGS_TABLE', 'bf_orgs'),
    gamesTable: req('BF_DDB_GAMES_TABLE', 'bf_games'),
    roomsTable: req('BF_DDB_ROOMS_TABLE', 'bf_rooms'),
    schedulesTable: req('BF_DDB_SCHEDULES_TABLE', 'bf_schedules'),
    holdsTable: req('BF_DDB_HOLDS_TABLE', 'bf_holds'),
    bookingsTable: req('BF_DDB_BOOKINGS_TABLE', 'bf_bookings'),
    usersTable: req('BF_DDB_USERS_TABLE', 'bf_users'),
    sessionsTable: req('BF_DDB_SESSIONS_TABLE', 'bf_sessions'),
  };
}
