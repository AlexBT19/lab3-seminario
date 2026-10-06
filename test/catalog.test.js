import test from 'node:test';
import assert from 'node:assert/strict';
import { findProductBySku, searchProducts, products } from '../src/index.js';

test('findProductBySku devuelve el producto existente', () => {
  assert.equal(findProductBySku('LIB-003').name, 'Libro: Pro Git');
});

test('findProductBySku devuelve undefined si no existe', () => {
  assert.equal(findProductBySku('XXX-999'), undefined);
});

test('searchProducts encuentra productos por parte del nombre', () => {
  assert.deepEqual(
    searchProducts('Laptop').map((p) => p.sku),
    ['LAP-001'],
  );
});

test('el catálogo tiene productos', () => {
  assert.ok(products.length > 0);
});
