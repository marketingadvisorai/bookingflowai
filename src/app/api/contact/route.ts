import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { sendEmail } from '@/lib/email/ses';

/* ─── Schema ─── */
const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.email('Invalid email'),
  phone: z.string().max(50).optional().default(''),
  business: z.string().max(200).optional().default(''),
  message: z.string().max(5000).optional().default(''),
});

/* ─── Rate limit (in-memory, per-instance) ─── */
const rateMap = new Map<string, { count: number; reset: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + 3600_000 });
    return false;
  }
  entry.count++;
  return entry.count > 10;
}

/* ─── Build email ─── */
function buildEmail(data: z.infer<typeof ContactSchema>) {
  const text = [
    'New lead from BookingFlow landing page',
    '',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || '(not provided)'}`,
    `Business: ${data.business || '(not provided)'}`,
    `Message: ${data.message || '(not provided)'}`,
    '',
    `Submitted: ${new Date().toISOString()}`,
  ].join('\n');

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto">
      <h2 style="color:#111827;margin-bottom:24px">New BookingFlow Lead</h2>
      <table style="width:100%;border-collapse:collapse">
        ${[
          ['Name', data.name],
          ['Email', `<a href="mailto:${data.email}">${data.email}</a>`],
          ['Phone', data.phone || '<em>not provided</em>'],
          ['Business', data.business || '<em>not provided</em>'],
        ]
          .map(
            ([k, v]) =>
              `<tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;width:100px">${k}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827">${v}</td></tr>`,
          )
          .join('')}
      </table>
      ${data.message ? `<div style="margin-top:20px;padding:16px;background:#f9fafb;border-radius:8px"><strong style="color:#111827">Message:</strong><p style="color:#374151;margin:8px 0 0">${data.message.replace(/\n/g, '<br>')}</p></div>` : ''}
      <p style="margin-top:24px;font-size:13px;color:#9ca3af">Submitted ${new Date().toISOString()}</p>
    </div>`;

  return { text, html };
}

/* ─── Handler ─── */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = ContactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const { text, html } = buildEmail(data);

    await sendEmail({
      from: 'noreply@bookingflowai.com',
      to: 'tariqul.advisorppc@gmail.com',
      subject: `New BookingFlow Lead: ${data.name}${data.business ? ` from ${data.business}` : ''}`,
      text,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contact] Unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
