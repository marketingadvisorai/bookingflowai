// Gift card code generator - format: BKGF-XXXX-XXXX
// No ambiguous chars: excludes 0/O, 1/I/L

const CODE_CHARS = '234567' + '89ABCDEFGHJKMNPQRSTUVWXYZ';

export function generateGiftCardCode(): string {
  let code = 'BKGF';
  for (let i = 0; i < 2; i++) {
    code += '-';
    for (let j = 0; j < 4; j++) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
  }
  return code;
}

export function validateGiftCardCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const normalized = code.trim().toUpperCase().replace(/\s+/g, '');
  return /^BKGF-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/.test(normalized);
}

export function normalizeGiftCardCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, '');
}
