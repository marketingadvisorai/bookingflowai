import type { BookingConfirmationData, HoldReminderData, WelcomeEmailData } from './types';

const ACCENT = '#FF4F00';
const UNSUBSCRIBE_URL = 'https://bookingflowai.com/unsubscribe';

function layout(title: string, body: string, unsubscribeLink: boolean = false): string {
  const unsubscribe = unsubscribeLink 
    ? `<p style="margin:8px 0 0;font-size:11px;color:#999;"><a href="${UNSUBSCRIBE_URL}" style="color:#999;text-decoration:underline;">Unsubscribe</a> from marketing emails</p>`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Inter,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;"><tr><td style="background:${ACCENT};padding:20px 24px;text-align:center;"><span style="color:#ffffff;font-size:20px;font-weight:700;text-decoration:none;">BookingFlow</span></td></tr><tr><td style="padding:32px 24px;">${body}</td></tr><tr><td style="padding:16px 24px;text-align:center;border-top:1px solid #eee;"><p style="margin:0;font-size:12px;color:#999;">Powered by <a href="https://bookingflowai.com" style="color:${ACCENT};text-decoration:none;">BookingFlow</a></p>${unsubscribe}</td></tr></table></td></tr></table></body></html>`;
}

function textLayout(title: string, body: string, unsubscribeLink: boolean = false): string {
  const unsubscribe = unsubscribeLink 
    ? `\n\nUnsubscribe from marketing emails: ${UNSUBSCRIBE_URL}`
    : '';
  return `${title}\n${'='.repeat(title.length)}\n\n${body}\n\n---\nPowered by BookingFlow (https://bookingflowai.com)${unsubscribe}`;
}

function h(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:22px;color:#201515;">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 12px;font-size:15px;color:#333;line-height:1.6;">${text}</p>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:8px 0;font-size:14px;color:#666;width:140px;">${label}</td><td style="padding:8px 0;font-size:14px;color:#201515;font-weight:600;">${value}</td></tr>`;
}

export function bookingConfirmationTemplate(d: BookingConfirmationData) {
  const address = d.venueAddress ? row('Venue', d.venueAddress) : '';
  const total = d.totalFormatted ? row('Total', d.totalFormatted) : '';
  const body = `${h('Booking Confirmed! 🎉')}${p(`Hi ${d.customerName}, your booking at <strong>${d.venueName}</strong> is confirmed.`)}<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">${row('Confirmation', d.confirmationId)}${row('Game', d.gameName)}${row('Date', d.date)}${row('Time', d.time)}${row('Players', String(d.players))}${total}${address}</table>${p('See you there!')}`;
  
  const textBody = `Hi ${d.customerName}, your booking at ${d.venueName} is confirmed.\n\nConfirmation: ${d.confirmationId}\nGame: ${d.gameName}\nDate: ${d.date}\nTime: ${d.time}\nPlayers: ${d.players}${d.totalFormatted ? `\nTotal: ${d.totalFormatted}` : ''}${d.venueAddress ? `\nVenue: ${d.venueAddress}` : ''}\n\nSee you there!`;
  
  return {
    subject: `Booking Confirmed — ${d.gameName}`,
    html: layout('Booking Confirmed', body, false),
    text: textLayout('Booking Confirmed', textBody, false),
  };
}

export function welcomeEmailTemplate(d: WelcomeEmailData) {
  const steps = [
    'Add your first game in the dashboard',
    'Set up rooms and schedules',
    'Embed the booking widget on your website',
    'Start accepting bookings!',
  ];
  const list = steps.map((s, i) => `<li style="margin:0 0 8px;font-size:15px;color:#333;line-height:1.6;"><strong>${i + 1}.</strong> ${s}</li>`).join('');
  const body = `${h(`Welcome to BookingFlow, ${d.ownerName}! 👋`)}${p(`Your venue <strong>${d.venueName}</strong> is all set up. Here\'s how to get started:`)}<ul style="padding-left:16px;margin:16px 0;">${list}</ul>${p('Need help? Reply to this email or visit our <a href="https://bookingflowai.com" style="color:' + ACCENT + ';">documentation</a>.')}`;
  
  const textBody = `Hi ${d.ownerName},\n\nYour venue ${d.venueName} is all set up. Here's how to get started:\n\n1. Add your first game in the dashboard\n2. Set up rooms and schedules\n3. Embed the booking widget on your website\n4. Start accepting bookings!\n\nNeed help? Reply to this email or visit https://bookingflowai.com`;
  
  return {
    subject: `Welcome to BookingFlow — Let's get started`,
    html: layout('Welcome', body, true),
    text: textLayout('Welcome to BookingFlow', textBody, true),
  };
}

export function holdReminderTemplate(d: HoldReminderData) {
  const cta = d.bookingUrl
    ? `<a href="${d.bookingUrl}" style="display:inline-block;background:${ACCENT};color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;margin:16px 0;">Complete Booking</a>`
    : '';
  const body = `${h('Your hold is expiring soon ⏰')}${p(`Hi ${d.customerName}, your hold for <strong>${d.gameName}</strong> on ${d.date} at ${d.time} expires at <strong>${d.expiresAt}</strong>.`)}${p('Complete your booking before it expires!')}${cta}`;
  
  const textBody = `Hi ${d.customerName},\n\nYour hold for ${d.gameName} on ${d.date} at ${d.time} expires at ${d.expiresAt}.\n\nComplete your booking before it expires!${d.bookingUrl ? `\n\n${d.bookingUrl}` : ''}`;
  
  return {
    subject: `Your hold for ${d.gameName} is expiring soon`,
    html: layout('Hold Reminder', body, false),
    text: textLayout('Hold Reminder', textBody, false),
  };
}
