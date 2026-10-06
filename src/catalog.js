export const products = [
  { sku: 'LAP-001', name: 'Laptop Pro 14', price: 1200, category: 'tecnologia' },
  { sku: 'MOU-002', name: 'Mouse Inalámbrico', price: 25.5, category: 'tecnologia' },
  { sku: 'LIB-003', name: 'Libro: Pro Git', price: 40, category: 'libros' },
  { sku: 'CAF-004', name: 'Café de Los Yungas 500g', price: 18, category: 'alimentos' },
];

/**
 * Busca un producto por su SKU.
 *
 * @param {string} sku
 * @returns {{sku: string, name: string, price: number, category: string} | undefined}
 */
export function findProductBySku(sku) {
  return products.find((product) => product.sku === sku);
}

/**
 * Busca productos cuyo nombre contenga el término indicado.
 *
 * @param {string} term
 * @returns {Array<{sku: string, name: string, price: number, category: string}>}
 */
export function searchProducts(term) {
  return products.filter((product) => product.name.includes(term));
}
