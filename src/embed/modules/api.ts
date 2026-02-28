import { fetchWithRetry, pickError, readJson } from '../api/http';
import type { BookingType, CatalogGame, Slot, APIResponse } from './types';

export class WidgetAPI {
  constructor(private apiBase: string, private orgId: string) {}

  async loadCatalog(): Promise<APIResponse<{ games: CatalogGame[] }>> {
    try {
      const url = `${this.apiBase}/api/v1/catalog?orgId=${encodeURIComponent(this.orgId)}`;
      const response = await fetchWithRetry(url, { method: 'GET' });
      const data = await readJson(response);
      
      if (!response.ok) {
        return { ok: false, error: pickError(data) || 'Failed to load games' };
      }
      
      return { ok: true, data: { games: (data as any).games || [] } };
    } catch (error) {
      return { ok: false, error: 'Network error while loading games' };
    }
  }

  async loadAvailability(
    gameId: string,
    date: string,
    type: BookingType,
    players: number
  ): Promise<APIResponse<{ slots: Slot[] }>> {
    try {
      const params = new URLSearchParams({
        orgId: this.orgId,
        gameId,
        date,
        type,
        players: String(players)
      });
      
      const url = `${this.apiBase}/api/v1/availability?${params.toString()}`;
      const response = await fetchWithRetry(url, { method: 'GET' });
      const data = await readJson(response);
      
      if (!response.ok) {
        return { ok: false, error: pickError(data) || 'Failed to load availability' };
      }
      
      return { ok: true, data: { slots: (data as any).slots || [] } };
    } catch (error) {
      return { ok: false, error: 'Network error while loading availability' };
    }
  }

  async createHold(payload: {
    gameId: string;
    roomId: string;
    bookingType: BookingType;
    startAt: string;
    endAt: string;
    players: number;
    customer: {
      name: string;
      email: string;
      phone?: string;
    };
  }): Promise<APIResponse<{ holdId: string; expiresAt: string; [key: string]: any }>> {
    try {
      const url = `${this.apiBase}/api/v1/holds`;
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: this.orgId,
          ...payload
        })
      });
      
      const data = await readJson(response);
      
      if (!response.ok) {
        return { ok: false, error: pickError(data) || 'Failed to create hold' };
      }
      
      return { ok: true, data: (data as any).hold };
    } catch (error) {
      return { ok: false, error: 'Network error while creating hold' };
    }
  }

  async validatePromoCode(code: string): Promise<APIResponse<{ valid: boolean; message?: string }>> {
    try {
      const url = `${this.apiBase}/api/v1/stripe/promo/validate`;
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: this.orgId, code })
      });
      
      const data = await readJson(response);
      
      if (!response.ok) {
        return { ok: false, error: pickError(data) || 'Failed to validate promo code' };
      }
      
      return { ok: true, data: data as any };
    } catch (error) {
      return { ok: false, error: 'Network error while validating promo code' };
    }
  }

  async createCheckoutSession(holdId: string): Promise<APIResponse<{ url: string }>> {
    try {
      const url = `${this.apiBase}/api/v1/stripe/checkout/create`;
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: this.orgId,
          holdId,
          returnUrl: window.location.href
        })
      });
      
      const data = await readJson(response);
      
      if (!response.ok) {
        return { ok: false, error: pickError(data) || 'Failed to create checkout session' };
      }
      
      return { ok: true, data: data as any };
    } catch (error) {
      return { ok: false, error: 'Network error while creating checkout session' };
    }
  }

  async confirmBooking(holdId: string, promoCode?: string): Promise<APIResponse<{ bookingId: string }>> {
    try {
      const url = `${this.apiBase}/api/v1/bookings/confirm`;
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: this.orgId,
          holdId,
          promoCode: promoCode?.trim() || undefined
        })
      });
      
      const data = await readJson(response);
      
      if (!response.ok) {
        return { ok: false, error: pickError(data) || 'Failed to confirm booking' };
      }
      
      return { ok: true, data: (data as any).booking };
    } catch (error) {
      return { ok: false, error: 'Network error while confirming booking' };
    }
  }
}