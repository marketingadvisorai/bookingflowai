/**
 * Behavior event tracker for the AI nudge system.
 * Lightweight, passive, entirely wrapped in try/catch.
 * Sends events to /api/v1/nudge for AI-powered nudge suggestions.
 */

export type BehaviorEvent = {
  type:
    | 'page_view'
    | 'click'
    | 'scroll'
    | 'hover'
    | 'hesitation'
    | 'form_focus'
    | 'form_blur'
    | 'game_view'
    | 'date_select'
    | 'time_select'
    | 'form_start'
    | 'form_abandon'
    | 'checkout_start'
    | 'checkout_abandon'
    | 'scroll_depth'
    | 'back_navigation'
    | 'price_view'
    | 'repeated_action';
  target?: string;
  value?: string;
  duration?: number;
  timestamp: number;
};

export type NudgeResponse = {
  show: boolean;
  message?: string;
  type?: 'tooltip' | 'toast' | 'banner' | 'suggestion';
  position?: 'bottom-right' | 'top-center' | 'inline';
  delay?: number;
};

const MAX_BUFFER = 20;
const MIN_SEND_INTERVAL = 10_000; // 10 seconds
const HESITATION_THRESHOLD = 15_000; // 15 seconds no mouse movement

type NudgeCallback = (nudge: NudgeResponse) => void;

export class BehaviorTracker {
  private buffer: BehaviorEvent[] = [];
  private lastSentAt = 0;
  private sendTimer: ReturnType<typeof setTimeout> | null = null;
  private hesitationTimer: ReturnType<typeof setTimeout> | null = null;
  private lastMouseMove = Date.now();
  private currentSection = '';
  private onNudge: NudgeCallback | null = null;
  private apiBase: string;
  private orgId: string;
  private pageType: string;
  private destroyed = false;

  // Scroll depth tracking
  private scrollDepthReported = new Set<number>();

  // Repeated action tracking
  private actionCounts = new Map<string, number>();

  // Session-level rate limiting
  private nudgesShown = 0;
  private lastNudgeAt = 0;
  private static readonly NUDGE_COOLDOWN = 30_000;
  private static readonly MAX_NUDGES_PER_SESSION = 5;

  constructor(opts: { apiBase: string; orgId: string; pageType?: string; onNudge?: NudgeCallback }) {
    this.apiBase = opts.apiBase.replace(/\/$/, '');
    this.orgId = opts.orgId;
    this.pageType = opts.pageType || 'widget';
    this.onNudge = opts.onNudge ?? null;

    try {
      this.setupListeners();
      this.track({ type: 'page_view', value: this.pageType, timestamp: Date.now() });
    } catch {
      // silently ignore
    }
  }

  /** Push an event into the buffer */
  track(event: BehaviorEvent): void {
    try {
      if (this.destroyed) return;
      this.buffer.push(event);
      if (this.buffer.length > MAX_BUFFER) {
        this.buffer = this.buffer.slice(-MAX_BUFFER);
      }

      // Track repeated actions for confusion detection
      if (event.type === 'click' && event.target) {
        const key = `click:${event.target}`;
        const count = (this.actionCounts.get(key) || 0) + 1;
        this.actionCounts.set(key, count);
        if (count >= 3) {
          this.buffer.push({
            type: 'repeated_action',
            target: event.target,
            value: String(count),
            timestamp: Date.now(),
          });
          this.actionCounts.delete(key);
        }
      }

      const significant = [
        'checkout_start',
        'checkout_abandon',
        'form_abandon',
        'game_view',
        'back_navigation',
        'repeated_action',
      ];
      if (significant.includes(event.type)) {
        this.maybeSend();
      } else if (!this.sendTimer) {
        this.sendTimer = setTimeout(() => this.maybeSend(), MIN_SEND_INTERVAL);
      }
    } catch {
      // silently ignore
    }
  }

  destroy(): void {
    try {
      this.destroyed = true;
      if (this.sendTimer) clearTimeout(this.sendTimer);
      if (this.hesitationTimer) clearTimeout(this.hesitationTimer);
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('scroll', this.handleScroll);
      }
    } catch {
      // silently ignore
    }
  }

  private setupListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.startHesitationDetection();
  }

  private handleMouseMove = (): void => {
    try {
      this.lastMouseMove = Date.now();
    } catch {
      // silently ignore
    }
  };

  private handleScroll = (): void => {
    try {
      const scrollPercent = Math.round(
        (window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)) * 100,
      );

      this.track({
        type: 'scroll',
        value: `${scrollPercent}%`,
        timestamp: Date.now(),
      });

      // Track scroll depth milestones
      for (const milestone of [25, 50, 75, 100]) {
        if (scrollPercent >= milestone && !this.scrollDepthReported.has(milestone)) {
          this.scrollDepthReported.add(milestone);
          this.track({
            type: 'scroll_depth',
            value: `${milestone}%`,
            timestamp: Date.now(),
          });
        }
      }
    } catch {
      // silently ignore
    }
  };

  private startHesitationDetection(): void {
    const check = () => {
      try {
        if (this.destroyed) return;
        const elapsed = Date.now() - this.lastMouseMove;
        if (elapsed >= HESITATION_THRESHOLD) {
          this.track({
            type: 'hesitation',
            target: this.currentSection || 'page',
            duration: elapsed,
            timestamp: Date.now(),
          });
        }
      } catch {
        // silently ignore
      }
      if (!this.destroyed) {
        this.hesitationTimer = setTimeout(check, 5000);
      }
    };
    this.hesitationTimer = setTimeout(check, HESITATION_THRESHOLD);
  }

  /** Set which section the user is currently viewing (for hesitation context) */
  setSection(section: string): void {
    this.currentSection = section;
  }

  /** Notify the tracker that the user navigated back */
  trackBackNavigation(from: string, to: string): void {
    this.track({
      type: 'back_navigation',
      target: to,
      value: `from:${from}`,
      timestamp: Date.now(),
    });
  }

  /** Notify the tracker that the user saw a price */
  trackPriceView(price: string, game?: string): void {
    this.track({
      type: 'price_view',
      target: game,
      value: price,
      timestamp: Date.now(),
    });
  }

  private async maybeSend(): Promise<void> {
    try {
      if (this.destroyed) return;
      if (this.sendTimer) {
        clearTimeout(this.sendTimer);
        this.sendTimer = null;
      }

      const now = Date.now();
      if (now - this.lastSentAt < MIN_SEND_INTERVAL) {
        this.sendTimer = setTimeout(
          () => this.maybeSend(),
          MIN_SEND_INTERVAL - (now - this.lastSentAt),
        );
        return;
      }

      if (this.buffer.length === 0) return;

      this.lastSentAt = now;
      const events = [...this.buffer];

      const res = await fetch(`${this.apiBase}/api/v1/nudge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: this.orgId, events, pageType: this.pageType }),
      });

      if (!res.ok) return;

      const nudge: NudgeResponse = await res.json();
      if (nudge.show && this.onNudge && this.canShowNudge()) {
        const delay = nudge.delay ?? 0;
        if (delay > 0) {
          setTimeout(() => {
            if (!this.destroyed && this.canShowNudge()) {
              this.recordNudgeShown();
              this.onNudge?.(nudge);
            }
          }, delay);
        } else {
          this.recordNudgeShown();
          this.onNudge(nudge);
        }
      }
    } catch {
      // silently ignore
    }
  }

  private canShowNudge(): boolean {
    const now = Date.now();
    if (this.nudgesShown >= BehaviorTracker.MAX_NUDGES_PER_SESSION) return false;
    if (now - this.lastNudgeAt < BehaviorTracker.NUDGE_COOLDOWN) return false;

    try {
      const stored = sessionStorage.getItem('bf_nudge_count');
      if (stored && parseInt(stored, 10) >= BehaviorTracker.MAX_NUDGES_PER_SESSION) return false;
    } catch {
      // sessionStorage unavailable
    }

    return true;
  }

  private recordNudgeShown(): void {
    this.nudgesShown++;
    this.lastNudgeAt = Date.now();
    try {
      const count = parseInt(sessionStorage.getItem('bf_nudge_count') || '0', 10);
      sessionStorage.setItem('bf_nudge_count', String(count + 1));
    } catch {
      // sessionStorage unavailable
    }
  }
}
