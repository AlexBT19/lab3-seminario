import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotal } from '../src/index.js';

test('un carrito vacío vale 0', () => {
  assert.equal(calculateTotal([]), 0);
});

test('suma precio por cantidad', () => {
  assert.equal(calculateTotal([{ price: 10, quantity: 2 }]), 20);
});

test('suma varios ítems y redondea a 2 decimales', () => {
  assert.equal(
    calculateTotal([
      { price: 25.5, quantity: 2 },
      { price: 40, quantity: 1 },
    ]),
    91,
  );
});
