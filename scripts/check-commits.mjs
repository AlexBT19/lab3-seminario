#!/usr/bin/env node
// Uso: node scripts/check-commits.mjs [rango]
// Ejemplos:
//   node scripts/check-commits.mjs origin/develop..HEAD
//   npm run check:commits -- origin/develop..HEAD
import { execFileSync } from 'node:child_process';
import { validateSubject } from './lib/conventional.mjs';

const range = process.argv[2] ?? 'origin/develop..HEAD';

let output;
try {
  output = execFileSync('git', ['log', '--no-merges', '--format=%h%x09%s', range], {
    encoding: 'utf8',
  });
} catch {
  console.error(`No se pudo leer el rango "${range}". ¿Hiciste "git fetch"?`);
  process.exit(2);
}

const commits = output.split('\n').filter(Boolean);
let failures = 0;

for (const line of commits) {
  const [hash, subject] = line.split('\t');
  const problem = validateSubject(subject);
  if (problem) {
    failures += 1;
    console.error(`✗ ${hash} ${subject}\n    → ${problem}`);
  } else {
    console.log(`✓ ${hash} ${subject}`);
  }
}

console.log(`\n${commits.length} commit(s) revisados en ${range}.`);
if (failures > 0) {
  console.error(`${failures} commit(s) no cumplen las reglas.`);
  process.exit(1);
}
