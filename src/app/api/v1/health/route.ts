/**
 * Lambda warmer health endpoint
 * Prevents cold starts by providing a simple endpoint for periodic pings
 */
export async function GET() {
  return Response.json({ ok: true, ts: Date.now() });
}
