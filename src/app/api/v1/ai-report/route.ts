import { NextResponse } from 'next/server';
import { getObservationSummary, listObservations } from '@/lib/chatbot/observer';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  const apiKey = process.env.BF_ADMIN_API_KEY;

  if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const summary = await getObservationSummary();
  const critical = await listObservations({ severity: 'critical', resolved: false, limit: 20 });

  return NextResponse.json({
    ok: true,
    summary: {
      total: summary.total,
      unresolved: summary.unresolved,
      bySeverity: summary.bySeverity,
      byType: summary.byType,
    },
    critical,
    recent: summary.recent,
  });
}
