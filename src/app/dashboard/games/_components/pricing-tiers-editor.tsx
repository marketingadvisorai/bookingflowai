'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type PricingTierDraft = {
  minPlayers: number;
  maxPlayers?: number;
  unitAmountDollars: string;
  label?: string;
};

function parseDollarsToCents(s: string): number | null {
  const n = Number(String(s).trim());
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function toApiPricingTiers(drafts: PricingTierDraft[]) {
  return drafts
    .map((t) => ({
      minPlayers: t.minPlayers,
      ...(t.maxPlayers ? { maxPlayers: t.maxPlayers } : {}),
      unitAmountCents: parseDollarsToCents(t.unitAmountDollars) ?? 0,
      ...(t.label ? { label: t.label } : {}),
    }))
    .filter((t) => t.unitAmountCents > 0);
}

const OPTIONAL_TYPES = ['Child', 'Senior', 'Veteran', 'Student', 'Military', 'Custom'];

function PriceInput({ value, onChange, placeholder = '0.00', size = 'lg' }: { value: string; onChange: (v: string) => void; placeholder?: string; size?: 'lg' | 'sm' }) {
  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-muted-foreground">$</span>
      <Input className={`pl-8 font-medium ${size === 'lg' ? 'h-12 text-lg' : 'h-10 text-sm'}`} type="number" step="0.01" min={0} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function PricingTiersEditor({
  value,
  onChange,
}: {
  value: PricingTierDraft[];
  onChange: (next: PricingTierDraft[]) => void;
}) {
  // First tier is always Adult (required)
  const adultTier = value[0] ?? { minPlayers: 1, unitAmountDollars: '', label: 'Adult' };
  const optionalTiers = value.slice(1);

  const updateAdult = (price: string) => {
    const next = [{ ...adultTier, label: 'Adult', unitAmountDollars: price }, ...optionalTiers];
    onChange(next);
  };

  const updateOptional = (idx: number, patch: Partial<PricingTierDraft>) => {
    const next = [adultTier, ...optionalTiers];
    next[idx + 1] = { ...next[idx + 1], ...patch };
    onChange(next);
  };

  const removeOptional = (idx: number) => {
    const next = [adultTier, ...optionalTiers.filter((_, i) => i !== idx)];
    onChange(next);
  };

  const addOptional = () => {
    const used = new Set(value.map((t) => t.label));
    const preset = OPTIONAL_TYPES.find((t) => !used.has(t)) ?? 'Custom';
    onChange([...value, { minPlayers: 1, unitAmountDollars: '', label: preset }]);
  };

  return (
    <div className="grid gap-5">
      {/* Adult price — always visible, required */}
      <div className="grid gap-2">
        <Label className="text-sm font-semibold">
          Price per person (Adult) <span className="text-[#FF4F00]">*</span>
        </Label>
        <div className="max-w-[220px]">
          <PriceInput value={adultTier.unitAmountDollars} onChange={updateAdult} placeholder="35.00" size="lg" />
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">Optional customer types</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Optional tiers */}
      {optionalTiers.map((tier, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm font-medium flex-shrink-0 w-[120px]"
            value={OPTIONAL_TYPES.includes(tier.label ?? '') ? tier.label : 'Custom'}
            onChange={(e) => updateOptional(idx, { label: e.target.value })}
          >
            {OPTIONAL_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {tier.label === 'Custom' && (
            <Input
              className="h-10 text-sm w-[100px] flex-shrink-0"
              placeholder="Name"
              value={!OPTIONAL_TYPES.includes(tier.label ?? '') ? tier.label : ''}
              onChange={(e) => updateOptional(idx, { label: e.target.value || 'Custom' })}
            />
          )}
          <div className="flex-1 min-w-[100px]">
            <PriceInput value={tier.unitAmountDollars} onChange={(v) => updateOptional(idx, { unitAmountDollars: v })} placeholder="25.00" size="sm" />
          </div>
          <button
            type="button"
            className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors text-lg"
            onClick={() => removeOptional(idx)}
            aria-label="Remove"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Add button */}
      <button
        type="button"
        className="h-10 rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-[#FF4F00] hover:border-[#FF4F00]/40 transition-colors"
        onClick={addOptional}
      >
        + Add customer type
      </button>
    </div>
  );
}
