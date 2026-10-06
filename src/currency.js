import { round2 } from './money.js';

export const CURRENCIES = {
  BOB: { symbol: 'Bs', rate: 1 },
  USD: { symbol: '$', rate: 0.145 },
  EUR: { symbol: '€', rate: 0.133 },
};

export function getCurrency(code) {
  const currency = CURRENCIES[String(code || '').toUpperCase()];

  if (!currency) {
    throw new Error(`Moneda no soportada: ${code}`);
  }

  return currency;
}

export function convert(amount, code = 'BOB') {
  const { rate } = getCurrency(code);
  return round2(amount * rate);
}