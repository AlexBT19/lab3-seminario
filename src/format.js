import { getCurrency, convert } from './currency.js';

/**
 * Da formato a un precio para mostrarlo al usuario.
 *
 * Reglas actuales:
 *  - Por defecto se muestra en bolivianos (Bs).
 *  - Se puede indicar una moneda: BOB, USD o EUR.
 *  - Siempre con dos decimales.
 *
 * @param {number} amount Monto a formatear.
 * @param {string} currency Código de moneda.
 * @returns {string} Precio formateado.
 *
 * @example
 * formatPrice(10)          // 'Bs 10.00'
 * formatPrice(25.5)        // 'Bs 25.50'
 * formatPrice(100, 'USD')  // '$ 14.50'
 */
export function formatPrice(amount, currency = 'BOB') {
  const { symbol } = getCurrency(currency);
  return `${symbol} ${convert(amount, currency).toFixed(2)}`;
}