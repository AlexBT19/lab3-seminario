import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDiscount } from '../src/discounts.js';

test('SAVE10 aplica 10% de descuento', () => {
  assert.equal(applyDiscount(100, 'SAVE10'), 90);
});

test('SAVE20 aplica 20% de descuento', () => {
  assert.equal(applyDiscount(100, 'SAVE20'), 80);
});

test('BLACKFRIDAY aplica 30% de descuento', () => {
  assert.equal(applyDiscount(100, 'BLACKFRIDAY'), 70);
});

test('código desconocido no aplica descuento', () => {
  assert.equal(applyDiscount(100, 'NOEXISTE'), 100);
});