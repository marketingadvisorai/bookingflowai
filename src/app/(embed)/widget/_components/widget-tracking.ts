export type BFEventName =
  | 'widget_view'
  | 'availability_request'
  | 'availability_loaded'
  | 'availability_error'
  | 'game_selected'
  | 'slot_selected'
  | 'hold_created'
  | 'hold_error'
  | 'checkout_started'
  | 'booking_confirm_clicked'
  | 'booking_confirmed'
  | 'booking_error'
  | 'promo_code_entered';

/** Events that also get a typed `bf:<name>` postMessage to the parent. */
const TYPED_EVENTS = new Set<BFEventName>([
  'game_selected',
  'slot_selected',
  'booking_confirmed',
  'checkout_started',
]);

function getParentOrigin(): string {
  try {
    const ref = document.referrer;
    if (ref) return new URL(ref).origin;
  } catch { /* ignore */ }
  return '*';
}

export function emitBFEvent(name: BFEventName, payload: Record<string, unknown>) {
  try {
    const detail = { name, ...payload };
    const targetOrigin = getParentOrigin();

    // Generic event for all listeners.
    window.parent?.postMessage({ type: 'bf:event', ...detail }, targetOrigin);

    // Typed postMessage for key integration events (easier filtering).
    if (TYPED_EVENTS.has(name)) {
      window.parent?.postMessage({ type: `bf:${name}`, ...payload }, targetOrigin);
    }

    // Local custom event.
    window.dispatchEvent(new CustomEvent('bf:event', { detail }));

    // GTM dataLayer push.
    const w = window as unknown as { dataLayer?: unknown[] };
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event: 'bf_event', bf_name: name, ...payload });
    }
  } catch { /* best-effort */ }
}
