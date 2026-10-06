import test from 'node:test';
import assert from 'node:assert/strict';

import { buildReceipt } from '../src/receipt.js';

test('genera un recibo con los productos', () => {
  const items = [
    {
      sku: 'MOU-002',
      name: 'Mouse Inalámbrico',
      price: 25.5,
      quantity: 2,
    },
    {
      sku: 'LIB-003',
      name: 'Libro: Pro Git',
      price: 40,
      quantity: 1,
    },
  ];

  const receipt = buildReceipt(items);

  assert.match(receipt, /=== MINI TIENDA ===/);
  assert.match(receipt, /Mouse Inalámbrico x2/);
  assert.match(receipt, /Libro: Pro Git x1/);
  assert.match(receipt, /TOTAL/);
  assert.match(receipt, /Bs 91\.00/);
});

test('genera un recibo vacío con total cero', () => {
  const receipt = buildReceipt([]);

  assert.match(receipt, /=== MINI TIENDA ===/);
  assert.match(receipt, /TOTAL/);
  assert.match(receipt, /Bs 0\.00/);
});