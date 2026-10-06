#!/usr/bin/env node

import {
  products,
  searchProducts,
  findProductBySku,
  formatPrice,
  buildReceipt,
} from './index.js';

const commands = {
  list() {
    for (const product of products) {
      console.log(
        `${product.sku}  ${product.name.padEnd(28)} ${formatPrice(product.price)}`
      );
    }
  },

  search(...terms) {
    const results = searchProducts(terms.join(' '));

    if (results.length === 0) {
      console.log('Sin resultados.');
      return;
    }

    for (const product of results) {
      console.log(`${product.sku}  ${product.name}`);
    }
  },

  // Los comandos nuevos se registran debajo de esta línea
  receipt(...items) {
    const receiptItems = [];

    for (const item of items) {
      const [sku, quantityText] = item.split(':');
      const quantity = Number(quantityText);

      const product = findProductBySku(sku);

      if (!product || !Number.isInteger(quantity) || quantity <= 0) {
        console.log(`Formato inválido: ${item}`);
        return;
      }

      receiptItems.push({
        ...product,
        quantity,
      });
    }

    console.log(buildReceipt(receiptItems));
  },
};

const [, , name, ...args] = process.argv;

if (!name || !commands[name]) {
  console.log(`Uso: node src/cli.js <comando> [argumentos]`);
  console.log(`Comandos disponibles: ${Object.keys(commands).join(', ')}`);
  process.exit(name ? 1 : 0);
}

commands[name](...args);
