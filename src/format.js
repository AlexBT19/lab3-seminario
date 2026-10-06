/**
 * Da formato a un precio para mostrarlo al usuario.
 *
 * Reglas actuales:
 *  - Siempre se muestra en bolivianos (Bs).
 *  - Siempre con dos decimales.
 *
 * @param {number} amount Monto a formatear.
 * @returns {string} Precio formateado.
 *
 * @example
 * formatPrice(10)    // 'Bs 10.00'
 * formatPrice(25.5)  // 'Bs 25.50'
 * formatPrice(0)     // 'Bs 0.00'
 */
export function formatPrice(amount) {
  return `Bs ${amount.toFixed(2)}`;
}
