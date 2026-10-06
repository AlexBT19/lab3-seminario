#!/usr/bin/env node
// Autoverificación del Laboratorio 3. Ejecútalo desde tu clon del fork:
//
//   git switch develop && git pull
//   npm run verify
//
// Lee el estado de origin/main y origin/develop (no modifica nada) y muestra un
// checklist de lo que ya cumpliste. NO reemplaza la evaluación: es una guía.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { validateSubject } from './lib/conventional.mjs';

const FEATURES = ['discounts', 'tax', 'currency', 'receipt'];

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}
function tryGit(...args) {
  try {
    return git(...args);
  } catch {
    return null;
  }
}
const lines = (text) => (text ? text.split('\n').filter(Boolean) : []);

const results = [];
let section = '';
function title(text) {
  section = text;
  console.log(`\n── ${text}`);
}
function check(ok, message, hint) {
  results.push({ section, ok });
  console.log(`${ok ? '  ✓' : '  ✗'} ${message}`);
  if (!ok && hint) console.log(`      ↳ ${hint}`);
}

// ── Preparación ─────────────────────────────────────────────────────────────
if (tryGit('rev-parse', '--is-inside-work-tree') !== 'true') {
  console.error('Ejecuta este script dentro de tu clon del repositorio.');
  process.exit(2);
}
tryGit('fetch', '--all', '--prune', '--tags', '--quiet');

const hasMain = tryGit('rev-parse', '--verify', 'origin/main') !== null;
const hasDevelop = tryGit('rev-parse', '--verify', 'origin/develop') !== null;

title('1. Estructura de ramas (GitFlow)');
check(hasMain, 'existe origin/main', 'haz el fork desmarcando "Copy the main branch only"');
check(hasDevelop, 'existe origin/develop', 'git push origin develop (o recrea el fork con todas las ramas)');
if (!hasMain || !hasDevelop) {
  console.log('\nSin main y develop no se puede continuar la verificación.');
  process.exit(1);
}

const base =
  tryGit('rev-parse', '--verify', 'refs/tags/v1.0.0^{commit}') ??
  lines(git('rev-list', '--max-parents=0', 'origin/main'))[0];

// ── Features ────────────────────────────────────────────────────────────────
title('2. Features integradas en develop con PR (merge --no-ff)');
const developMerges = lines(
  git('log', '--first-parent', '--merges', '--reverse', '--format=%H%x09%s', `${base}..origin/develop`),
).map((l) => {
  const [hash, subject] = l.split('\t');
  return { hash, subject };
});

let lastIndex = -1;
let orderOk = true;
for (const name of FEATURES) {
  const index = developMerges.findIndex((m) => new RegExp(`feature/${name}\\b`).test(m.subject));
  const merge = developMerges[index];
  check(
    Boolean(merge),
    `feature/${name} fue integrada con un commit de merge`,
    'ábrelo como PR hacia develop y usa "Create a merge commit" (no squash ni rebase-merge)',
  );
  if (!merge) continue;
  if (index < lastIndex) orderOk = false;
  lastIndex = index;

  const [parent1, parent2] = git('rev-list', '--parents', '-n', '1', merge.hash).split(' ').slice(1);
  const range = `${parent1}..${parent2}`;
  const commits = lines(git('log', '--format=%s', range));
  const inner = lines(git('rev-list', '--merges', range));
  const invalid = commits.map((s) => [s, validateSubject(s)]).filter(([, p]) => p);

  check(commits.length >= 2, `   └ ${commits.length} commit(s) propios (mínimo 2)`);
  check(
    invalid.length === 0,
    '   └ todos los commits siguen Conventional Commits y no hay wip/fixup',
    invalid[0] ? `"${invalid[0][0]}" → ${invalid[0][1]}` : undefined,
  );
  check(inner.length === 0, '   └ sin commits de merge dentro de la rama (historia lineal)', 'usa rebase, no `git merge develop`, para actualizar tu rama');
  check(
    git('merge-base', parent1, parent2) === parent1,
    '   └ la rama estaba rebaseada sobre el develop más reciente al integrarse',
    'antes del PR: git fetch && git rebase origin/develop && git push --force-with-lease',
  );
}
check(orderOk, 'el orden de integración fue: discounts → tax → currency → receipt', 'respeta el turno indicado en el laboratorio');

// ── Integración funcional ───────────────────────────────────────────────────
title('3. Integración funcional (código de develop en tu carpeta de trabajo)');
const currentBranch = tryGit('rev-parse', '--abbrev-ref', 'HEAD');
check(currentBranch === 'develop', `estás en la rama develop (estás en ${currentBranch})`, 'git switch develop && git pull');

try {
  execFileSync(process.execPath, ['--test'], { stdio: 'pipe' });
  check(true, 'npm test pasa');
} catch {
  check(false, 'npm test pasa', 'ejecuta `npm test` y revisa qué falla (¿conflicto semántico?)');
}

try {
  const api = await import(pathToFileURL(resolve('src/index.js')).href);
  const total = api.calculateTotal?.([{ price: 100, quantity: 1 }], { discountCode: 'SAVE10', includeTax: true });
  check(total === 101.7, 'calculateTotal aplica el descuento ANTES del impuesto (100 → 90 → 101.70)', `obtuve ${total}`);
  check(api.formatPrice?.(100, 'USD') === '$ 14.50', "formatPrice(100, 'USD') === '$ 14.50'", `obtuve ${JSON.stringify(api.formatPrice?.(100, 'USD'))}`);
  check(api.formatPrice?.(5, 'BOB', { width: 12 }) === '     Bs 5.00', "formatPrice(5, 'BOB', { width: 12 }) conserva moneda Y ancho", `obtuve ${JSON.stringify(api.formatPrice?.(5, 'BOB', { width: 12 }))}`);
  const receipt = api.buildReceipt?.([{ name: 'Laptop', price: 100, quantity: 1 }], {
    discountCode: 'SAVE10',
    includeTax: true,
    currency: 'BOB',
  });
  check(
    typeof receipt === 'string' && receipt.includes('TOTAL') && receipt.includes('Bs 101.70'),
    'buildReceipt usa descuento + impuesto + moneda',
    'actualiza receipt.js después de rebasear sobre las otras features',
  );
} catch (error) {
  check(false, 'se pudo cargar src/index.js', error.message);
}

// ── Release ─────────────────────────────────────────────────────────────────
title('4. Release 1.1.0');
const mainMerges = lines(
  git('log', '--first-parent', '--merges', '--reverse', '--format=%H%x09%s', `${base}..origin/main`),
).map((l) => l.split('\t')[1]);
const tagType = (tag) => tryGit('cat-file', '-t', `refs/tags/${tag}`);
const isAncestor = (a, b) => tryGit('merge-base', '--is-ancestor', a, b) !== null;

check(mainMerges.some((s) => /release\/1\.1\.0\b/.test(s)), 'release/1.1.0 se integró a main con merge commit');
check(tagType('v1.1.0') === 'tag', 'existe el tag ANOTADO v1.1.0', 'git tag -a v1.1.0 -m "Release 1.1.0" && git push origin v1.1.0');
check(
  tagType('v1.1.0') === 'tag' && isAncestor('v1.1.0', 'origin/main'),
  'v1.1.0 está en el historial de main',
);

const mainChangelog = tryGit('show', 'origin/main:CHANGELOG.md') ?? '';
const section110 = mainChangelog.split(/^## \[/m).find((s) => s.startsWith('1.1.0]')) ?? '';
const bullets110 = section110.split('\n').filter((l) => l.startsWith('- ')).length;
check(bullets110 >= 4, `CHANGELOG tiene la sección [1.1.0] con las 4 features (${bullets110} viñetas)`);
const unreleased = mainChangelog.split(/^## \[/m).find((s) => s.startsWith('Unreleased]')) ?? '';
check(
  !unreleased.split('\n').some((l) => l.startsWith('- ')),
  'la sección [Unreleased] quedó vacía después del release',
);

// ── Hotfix ──────────────────────────────────────────────────────────────────
title('5. Hotfix 1.1.1 y back-merge');
check(mainMerges.some((s) => /hotfix\/1\.1\.1\b/.test(s)), 'hotfix/1.1.1 se integró a main con merge commit');
check(tagType('v1.1.1') === 'tag', 'existe el tag ANOTADO v1.1.1');
const hotfixCommits =
  tagType('v1.1.1') === 'tag' && tagType('v1.1.0') === 'tag'
    ? lines(git('log', '--no-merges', '--format=%s', 'v1.1.0..v1.1.1'))
    : [];
check(hotfixCommits.some((s) => s.startsWith('fix')), 'hay un commit fix(...) entre v1.1.0 y v1.1.1');
check(
  (tryGit('show', 'origin/main:package.json') ?? '').includes('"version": "1.1.1"'),
  'package.json en main tiene version 1.1.1',
);
check(
  tagType('v1.1.0') === 'tag' && isAncestor('v1.1.0', 'origin/develop'),
  'develop contiene el release 1.1.0 (back-merge #1)',
);
check(
  tagType('v1.1.1') === 'tag' && isAncestor('v1.1.1', 'origin/develop'),
  'develop contiene el hotfix 1.1.1 (back-merge #2)',
  'si no, el bug reaparecerá en el próximo release',
);
try {
  const api = await import(pathToFileURL(resolve('src/index.js')).href);
  check(api.searchProducts('laptop').length === 1, "searchProducts('laptop') ya no distingue mayúsculas (en tu carpeta actual)");
} catch {
  check(false, 'se pudo probar searchProducts');
}

// ── Higiene general ─────────────────────────────────────────────────────────
title('6. Higiene del historial');
for (const ref of ['origin/develop', 'origin/main']) {
  const bad = lines(git('log', '--no-merges', '--format=%h%x09%s', `${base}..${ref}`))
    .map((l) => l.split('\t'))
    .filter(([, s]) => validateSubject(s));
  check(bad.length === 0, `todos los commits de ${ref} siguen Conventional Commits`, bad[0] ? `${bad[0][0]} "${bad[0][1]}"` : undefined);
}

// ── Resumen ─────────────────────────────────────────────────────────────────
const passed = results.filter((r) => r.ok).length;
console.log(`\nResultado: ${passed}/${results.length} comprobaciones superadas.`);
process.exit(passed === results.length ? 0 : 1);
