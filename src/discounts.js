import { round2 } from './money.js';

export const DISCOUNT_CODES = {
  SAVE10: 0.1,
  SAVE20: 0.2,
  BLACKFRIDAY: 0.3,
};

export function applyDiscount(amount, code) {
  const rate = DISCOUNT_CODES[String(code || '').toUpperCase()] ?? 0;
  return round2(amount * (1 - rate));
}