import { round2 } from './money.js';

/**
 * Calcula el total de un carrito de compras.
 *
 * Reglas actuales:
 *  - El total es la suma de precio * cantidad de cada ítem.
 *  - El resultado se redondea a 2 decimales.
 *  - Un carrito vacío vale 0.
 *
 * @param {Array<{price: number, quantity: number}>} items Ítems del carrito.
 * @returns {number} Total del carrito.
 *
 * @example
 * calculateTotal([])                                   // 0
 * calculateTotal([{ price: 10, quantity: 2 }])         // 20
 * calculateTotal([
 *   { price: 25.5, quantity: 2 },
 *   { price: 40, quantity: 1 },
 * ])                                                   // 91
 */
export function calculateTotal(items) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  return round2(subtotal);
}
