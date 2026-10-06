import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTax, addTax } from '../src/tax.js';

test('calcula IVA del 13%', () => {
  assert.equal(calculateTax(100), 13);
});

test('agrega IVA del 13%', () => {
  assert.equal(addTax(100), 113);
});

test('redondea correctamente el IVA', () => {
  assert.equal(calculateTax(25.5), 3.32);
});