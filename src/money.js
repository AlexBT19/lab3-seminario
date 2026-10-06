/**
 * Redondea un monto a 2 decimales (centavos).
 *
 * @param {number} value
 * @returns {number}
 */
export function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
