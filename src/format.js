/**
 * Da formato a un precio para mostrarlo al usuario.
 *
 * Reglas actuales:
 *  - Siempre se muestra en bolivianos (Bs).
 *  - Siempre con dos decimales.
 *  - Permite indicar un ancho para alinear el monto a la derecha.
 *
 * @param {number} amount Monto a formatear.
 * @param {{ width?: number }} options Opciones de formato.
 * @returns {string} Precio formateado.
 *
 * @example
 * formatPrice(10)             // 'Bs 10.00'
 * formatPrice(25.5)           // 'Bs 25.50'
 * formatPrice(10, { width: 12 }) // '     Bs 10.00'
 */
export function formatPrice(amount, { width = 0 } = {}) {
  const value = `Bs ${amount.toFixed(2)}`;

  return width > 0 ? value.padStart(width) : value;
}