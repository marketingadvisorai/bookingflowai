'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

type BookingData = {
  customerName?: string;
  customerEmail?: string;
  amountTotal?: number;
  currency?: string;
  paymentStatus?: string;
  holdId?: string;
  orgId?: string;
  gameName?: string;
  venueName?: string;
  timezone?: string;
  startAt?: string;
  endAt?: string;
  players?: number;
  bookingId?: string;
};

export function ConfirmationClient() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const holdId = params.get('holdId');
  const orgId = params.get('orgId');
  const stripeStatus = params.get('stripe');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [data, setData] = useState<BookingData | null>(null);

  useEffect(() => {
    if (stripeStatus === 'success' && holdId && orgId) {
      setData({ holdId, orgId });
      setStatus('success');
      return;
    }
    if (!sessionId) { setStatus('error'); return; }

    fetch(`/api/v1/stripe/checkout/status?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) { setData(json.data); setStatus('success'); }
        else setStatus('error');
      })
      .catch(() => setStatus('error'));
  }, [sessionId, holdId, orgId, stripeStatus]);

  return (
    <div className="bf-confirm-wrap">
      <style dangerouslySetInnerHTML={{ __html: confirmStyles }} />
      <div className="bf-confirm-card">
        {status === 'loading' && <LoadingState />}
        {status === 'success' && <SuccessState data={data} />}
        {status === 'error' && <ErrorState />}
      </div>
    </div>
  );
}

/* ---------- Loading ---------- */
function LoadingState() {
  return (
    <div className="bf-center">
      <div className="bf-spinner" />
      <p className="bf-text">Confirming your booking...</p>
    </div>
  );
}

/* ---------- Error ---------- */
function ErrorState() {
  return (
    <div className="bf-center">
      <div className="bf-icon-circle bf-icon-error">✗</div>
      <h1 className="bf-heading">Something went wrong</h1>
      <p className="bf-subtext">We could not confirm your booking. Please contact the venue directly.</p>
    </div>
  );
}

/* ---------- Success ---------- */
function SuccessState({ data }: { data: BookingData | null }) {
  const amount = data?.amountTotal
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency ?? 'usd' }).format(data.amountTotal / 100)
    : null;

  const startDate = data?.startAt ? new Date(data.startAt) : null;
  const endDate = data?.endAt ? new Date(data.endAt) : null;

  const formattedDate = startDate
    ? startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: data?.timezone ?? undefined })
    : null;
  const formattedTime = startDate
    ? `${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: data?.timezone ?? undefined })}${endDate ? ` – ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: data?.timezone ?? undefined })}` : ''}`
    : null;

  return (
    <>
      {/* Confetti */}
      {[...Array(20)].map((_, i) => (
        <div key={i} className="bf-confetti" style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 0.5}s`,
          animationDuration: `${2 + Math.random() * 2}s`,
          background: ['#FF4F00', '#16a34a', '#eab308', '#ec4899'][i % 4],
          borderRadius: i % 2 === 0 ? '50%' : '0',
        }} />
      ))}

      {/* Tracking data attributes */}
      <div
        data-order-value={data?.amountTotal ? (data.amountTotal / 100).toFixed(2) : ''}
        data-order-id={data?.bookingId ?? data?.holdId ?? ''}
        data-currency={data?.currency?.toUpperCase() ?? 'USD'}
        style={{ display: 'none' }}
      />

      <div className="bf-center">
        {/* Checkmark */}
        <div className="bf-check-wrap">
          <div className="bf-pulse-ring" />
          <div className="bf-icon-circle bf-icon-success bf-anim-check">✓</div>
        </div>

        <h1 className="bf-heading bf-anim-fade" style={{ animationDelay: '0.2s' }}>Booking Confirmed!</h1>
        <p className="bf-subtext bf-anim-fade" style={{ animationDelay: '0.3s' }}>
          {data?.customerEmail ? `A confirmation has been sent to ${data.customerEmail}.` : 'Your experience is booked.'}
        </p>

        {/* Amount */}
        {amount && <p className="bf-amount bf-anim-fade" style={{ animationDelay: '0.4s' }}>{amount} paid</p>}

        {/* Order Summary */}
        {(data?.gameName || formattedDate || data?.players) && (
          <div className="bf-summary bf-anim-fade" style={{ animationDelay: '0.5s' }}>
            {data?.gameName && <div className="bf-summary-row"><span className="bf-label">Game</span><span className="bf-value">{data.gameName}</span></div>}
            {data?.venueName && <div className="bf-summary-row"><span className="bf-label">Venue</span><span className="bf-value">{data.venueName}</span></div>}
            {formattedDate && <div className="bf-summary-row"><span className="bf-label">Date</span><span className="bf-value">{formattedDate}</span></div>}
            {formattedTime && <div className="bf-summary-row"><span className="bf-label">Time</span><span className="bf-value">{formattedTime}</span></div>}
            {data?.players && <div className="bf-summary-row"><span className="bf-label">Players</span><span className="bf-value">{data.players}</span></div>}
          </div>
        )}

        {/* Reference */}
        {data?.holdId && <p className="bf-ref bf-anim-fade" style={{ animationDelay: '0.55s' }}>Ref: {data.holdId.slice(0, 8).toUpperCase()}</p>}

        {/* Calendar Buttons */}
        {startDate && (
          <div className="bf-calendar-btns bf-anim-fade" style={{ animationDelay: '0.6s' }}>
            <CalendarButtons data={data} startDate={startDate} endDate={endDate} />
          </div>
        )}

        {/* Invite Friends */}
        <div className="bf-anim-fade" style={{ animationDelay: '0.7s' }}>
          <InviteFriends data={data} formattedDate={formattedDate} formattedTime={formattedTime} />
        </div>
      </div>
    </>
  );
}

/* ---------- Calendar Buttons ---------- */
function CalendarButtons({ data, startDate, endDate }: { data: BookingData | null; startDate: Date; endDate: Date | null }) {
  const title = data?.gameName ? `${data.gameName}${data.venueName ? ` at ${data.venueName}` : ''}` : 'Escape Room Booking';
  const end = endDate ?? new Date(startDate.getTime() + 60 * 60_000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(startDate)}/${fmt(end)}&details=${encodeURIComponent(`Players: ${data?.players ?? '?'}`)}`;

  const handleIcs = () => {
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
      `DTSTART:${fmt(startDate)}`, `DTEND:${fmt(end)}`,
      `SUMMARY:${title}`, `DESCRIPTION:Players: ${data?.players ?? '?'}`,
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'booking.ics';
    a.click();
  };

  return (
    <>
      <a href={gcalUrl} target="_blank" rel="noopener noreferrer" className="bf-btn bf-btn-outline">
        📅 Google Calendar
      </a>
      <button onClick={handleIcs} className="bf-btn bf-btn-outline">
        🍎 Apple Calendar
      </button>
    </>
  );
}

/* ---------- Invite Friends ---------- */
function InviteFriends({ data, formattedDate, formattedTime }: { data: BookingData | null; formattedDate: string | null; formattedTime: string | null }) {
  const [emails, setEmails] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [sent, setSent] = useState(false);

  const addEmail = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed && trimmed.includes('@') && !emails.includes(trimmed)) {
      setEmails((prev) => [...prev, trimmed]);
      setInput('');
    }
  }, [input, emails]);

  const removeEmail = (email: string) => setEmails((prev) => prev.filter((e) => e !== email));

  const sendInvites = () => {
    // Stub: invites logged in dev only until email is configured
    if (process.env.NODE_ENV === 'development') {
      const msg = `You've been invited to play ${data?.gameName ?? 'an escape room'} on ${formattedDate ?? 'TBD'} at ${formattedTime ?? 'TBD'}${data?.venueName ? ` at ${data.venueName}` : ''}!`;
      console.log('[BookingFlow] Invite emails:', emails, 'Message:', msg);
    }
    setSent(true);
  };

  return (
    <div className="bf-invite-section">
      <h3 className="bf-invite-title">👥 Invite Friends</h3>
      {sent ? (
        <p className="bf-subtext">Invitations sent! Your friends will receive an email soon.</p>
      ) : (
        <>
          <div className="bf-invite-input-row">
            <input
              type="email"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
              placeholder="friend@email.com"
              className="bf-input"
            />
            <button onClick={addEmail} className="bf-btn bf-btn-sm">Add</button>
          </div>
          {emails.length > 0 && (
            <div className="bf-email-chips">
              {emails.map((email) => (
                <span key={email} className="bf-chip">
                  {email} <button onClick={() => removeEmail(email)} className="bf-chip-x">×</button>
                </span>
              ))}
            </div>
          )}
          {emails.length > 0 && (
            <button onClick={sendInvites} className="bf-btn bf-btn-primary">Send {emails.length} Invite{emails.length > 1 ? 's' : ''}</button>
          )}
        </>
      )}
    </div>
  );
}

/* ---------- Styles ---------- */
const confirmStyles = `
@keyframes confetti-fall { 0% { transform: translateY(-100%) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(360deg); opacity: 0; } }
@keyframes check-scale { 0% { transform: scale(0) rotate(-45deg); opacity: 0; } 50% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
@keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }
@keyframes fade-up { 0% { transform: translateY(12px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
@keyframes spin { to { transform: rotate(360deg); } }

.bf-confirm-wrap { min-height: 100vh; background: #FFFDF9; display: flex; align-items: center; justify-content: center; padding: 24px; font-family: Inter, system-ui, sans-serif; }
.bf-confirm-card { background: #fff; border-radius: 16px; padding: 48px 32px; max-width: 520px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.06); position: relative; overflow: hidden; }
.bf-center { text-align: center; }
.bf-confetti { position: fixed; width: 8px; height: 8px; top: -10px; animation: confetti-fall 3s linear forwards; z-index: 1000; pointer-events: none; }
.bf-check-wrap { position: relative; display: inline-block; margin-bottom: 16px; }
.bf-pulse-ring { position: absolute; inset: -8px; border-radius: 50%; background: #dcfce7; animation: pulse-ring 1.5s cubic-bezier(0.4,0,0.6,1) infinite; }
.bf-icon-circle { width: 64px; height: 64px; border-radius: 50%; font-size: 32px; display: inline-flex; align-items: center; justify-content: center; position: relative; }
.bf-icon-success { background: #dcfce7; color: #16a34a; }
.bf-icon-error { background: #fee2e2; color: #dc2626; }
.bf-anim-check { animation: check-scale 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
.bf-anim-fade { animation: fade-up 0.5s cubic-bezier(0.175,0.885,0.32,1.275) backwards; }
.bf-heading { font-size: 24px; font-weight: 700; color: #201515; margin: 0 0 8px; }
.bf-subtext { font-size: 15px; color: #6b7280; margin: 0 0 16px; line-height: 1.5; }
.bf-amount { font-size: 22px; font-weight: 600; color: #FF4F00; margin: 0 0 16px; }
.bf-ref { font-size: 13px; color: #9ca3af; margin: 0 0 20px; }
.bf-text { font-size: 15px; color: #6b7280; }
.bf-spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #FF4F00; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }

.bf-summary { background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 16px 20px; margin: 0 0 16px; text-align: left; }
.bf-summary-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f5f5f4; }
.bf-summary-row:last-child { border-bottom: none; }
.bf-label { font-size: 13px; color: #9ca3af; }
.bf-value { font-size: 14px; color: #201515; font-weight: 500; }

.bf-calendar-btns { display: flex; gap: 8px; justify-content: center; margin-bottom: 24px; flex-wrap: wrap; }
.bf-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; font-family: inherit; transition: all 0.15s; }
.bf-btn-outline { background: transparent; border: 1px solid #e7e5e4; color: #201515; }
.bf-btn-outline:hover { border-color: #FF4F00; color: #FF4F00; }
.bf-btn-primary { background: #FF4F00; color: #fff; width: 100%; justify-content: center; margin-top: 8px; }
.bf-btn-primary:hover { background: #e54500; }
.bf-btn-sm { padding: 8px 14px; font-size: 13px; background: #FF4F00; color: #fff; border-radius: 8px; }
.bf-btn-sm:hover { background: #e54500; }

.bf-invite-section { border-top: 1px solid #e7e5e4; padding-top: 24px; margin-top: 24px; }
.bf-invite-title { font-size: 16px; font-weight: 600; color: #201515; margin: 0 0 12px; }
.bf-invite-input-row { display: flex; gap: 8px; }
.bf-input { flex: 1; padding: 10px 14px; border: 1px solid #e7e5e4; border-radius: 8px; font-size: 14px; font-family: inherit; outline: none; }
.bf-input:focus { border-color: #FF4F00; box-shadow: 0 0 0 2px rgba(255,79,0,0.1); }
.bf-email-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.bf-chip { display: inline-flex; align-items: center; gap: 4px; background: #fff7ed; color: #FF4F00; padding: 4px 10px; border-radius: 16px; font-size: 13px; }
.bf-chip-x { background: none; border: none; color: #FF4F00; cursor: pointer; font-size: 16px; padding: 0; line-height: 1; }

@media (prefers-color-scheme: dark) {
  .bf-confirm-wrap { background: #0c0a09; }
  .bf-confirm-card { background: #1c1917; box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
  .bf-heading, .bf-value, .bf-invite-title { color: #fafaf9; }
  .bf-subtext, .bf-text { color: #a8a29e; }
  .bf-ref, .bf-label { color: #78716c; }
  .bf-summary { background: #292524; border-color: #44403c; }
  .bf-summary-row { border-color: #44403c; }
  .bf-btn-outline { border-color: #44403c; color: #fafaf9; }
  .bf-btn-outline:hover { border-color: #FF4F00; color: #FF4F00; }
  .bf-input { background: #292524; border-color: #44403c; color: #fafaf9; }
  .bf-input:focus { border-color: #FF4F00; }
  .bf-chip { background: #431407; }
  .bf-invite-section { border-color: #44403c; }
  .bf-icon-success { background: #052e16; color: #4ade80; }
  .bf-pulse-ring { background: #052e16; }
}

@media (max-width: 480px) {
  .bf-confirm-card { padding: 32px 20px; }
  .bf-calendar-btns { flex-direction: column; }
  .bf-btn { width: 100%; justify-content: center; }
}
`;
