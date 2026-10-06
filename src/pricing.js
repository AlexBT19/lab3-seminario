import { round2 } from './money.js';
import { applyDiscount } from './discounts.js';
import { addTax } from './tax.js';

/**
 * Calcula el total de un carrito de compras.
 *
 * @param {Array<{price: number, quantity: number}>} items Items del carrito.
 * @param {{discountCode?: string, includeTax?: boolean}} options Opciones.
 * @returns {number} Total del carrito.
 */
export function calculateTotal(
  items,
  { discountCode, includeTax = false } = {}
) {
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const discounted = applyDiscount(subtotal, discountCode);

  if (includeTax) {
    return addTax(discounted);
  }

  return round2(discounted);
}