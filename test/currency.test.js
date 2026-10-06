import test from 'node:test';
import assert from 'node:assert/strict';
import { getCurrency, convert } from '../src/currency.js';
import { formatPrice } from '../src/format.js';

test('BOB mantiene el mismo valor', () => {
  assert.equal(convert(100, 'BOB'), 100);
});

test('convierte BOB a USD', () => {
  assert.equal(convert(100, 'USD'), 14.5);
});

test('convierte BOB a EUR', () => {
  assert.equal(convert(100, 'EUR'), 13.3);
});

test('obtiene una moneda válida', () => {
  assert.equal(getCurrency('USD').symbol, '$');
});

test('rechaza una moneda no soportada', () => {
  assert.throws(() => getCurrency('XYZ'), /Moneda no soportada/);
});

test('formatea precios en USD', () => {
  assert.equal(formatPrice(100, 'USD'), '$ 14.50');
});

test('formatea precios en EUR', () => {
  assert.equal(formatPrice(100, 'EUR'), '€ 13.30');
});