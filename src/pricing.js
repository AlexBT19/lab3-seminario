import { applyDiscount } from './discounts.js';

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
 */
export function calculateTotal(items, { discountCode } = {}) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  return applyDiscount(subtotal, discountCode);
}