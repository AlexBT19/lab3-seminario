import { formatPrice } from './format.js';
// Genera el recibo de compra.
export function buildReceipt(items) {
  const lines = ['=== MINI TIENDA ==='];

  let total = 0;

  for (const item of items) {
    const label = `${item.name} x${item.quantity}`.padEnd(28);
    const itemTotal = item.price * item.quantity;

    lines.push(`${label}${formatPrice(itemTotal, { width: 12 })}`);

    total += itemTotal;
  }

  lines.push(`TOTAL${formatPrice(total, { width: 12 })}`);

  return lines.join('\n');
}