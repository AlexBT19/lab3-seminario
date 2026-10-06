#!/usr/bin/env node
// Escenarios de práctica de Git avanzado en repositorios desechables.
//
//   npm run sandbox -- <escenario>            crea (o recrea) el escenario
//   npm run sandbox -- <escenario> check      comprueba si lo resolviste
//   npm run sandbox -- list                   lista los escenarios
//
// Los repositorios se crean en ".sandbox/<escenario>" (ignorado por Git).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join, resolve } from 'node:path';

const ROOT = resolve('.sandbox');
const dirOf = (name) => join(ROOT, name);

function git(cwd, ...args) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'Sandbox',
      GIT_AUTHOR_EMAIL: 'sandbox@example.com',
      GIT_COMMITTER_NAME: 'Sandbox',
      GIT_COMMITTER_EMAIL: 'sandbox@example.com',
    },
  }).trim();
}

function tryGit(cwd, ...args) {
  try {
    return git(cwd, ...args);
  } catch {
    return null;
  }
}

function freshRepo(name) {
  const dir = dirOf(name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  git(dir, 'init', '-q', '-b', 'main');
  git(dir, 'config', 'core.autocrlf', 'false');
  git(dir, 'config', 'commit.gpgsign', 'false');
  return dir;
}

function commitFile(dir, file, content, message) {
  writeFileSync(join(dir, file), content);
  git(dir, 'add', file);
  git(dir, 'commit', '-q', '-m', message);
  return git(dir, 'rev-parse', 'HEAD');
}

const read = (dir, file) => readFileSync(join(dir, file), 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// Escenarios: cada uno tiene `setup` (prepara el repo) y `check` (devuelve
// una lista de [ok, mensaje]).
// ─────────────────────────────────────────────────────────────────────────────

const scenarios = {
  reflog: {
    title: 'Recuperar commits perdidos con git reflog',
    story: [
      'Un compañero ejecutó `git reset --hard` y "perdió" 3 commits de la rama main.',
      'Los commits siguen en la base de datos de Git, pero ninguna rama los apunta.',
      '',
      'TU MISIÓN:',
      '  1. Entra a la carpeta:  cd .sandbox/reflog',
      '  2. Usa `git reflog` para encontrar el commit más reciente que se perdió.',
      '  3. Crea una rama llamada "rescued" que apunte a ese commit.',
      '  4. Abre el archivo secret.txt de esa rama: contiene un TOKEN. Cópialo.',
      '  5. Verifica con:  npm run sandbox -- reflog check',
    ],
    setup() {
      const dir = freshRepo('reflog');
      const token = `TOKEN-${randomBytes(3).toString('hex').toUpperCase()}`;
      writeFileSync(join(ROOT, '.reflog-token'), token);
      commitFile(dir, 'README.md', '# Proyecto\n', 'chore: commit inicial');
      commitFile(dir, 'app.js', 'export const version = 1;\n', 'feat(app): agrega versión');
      commitFile(dir, 'utils.js', 'export const noop = () => {};\n', 'feat(utils): agrega noop');
      commitFile(dir, 'secret.txt', `${token}\n`, 'feat(secret): agrega el archivo secreto');
      git(dir, 'reset', '--hard', 'HEAD~3');
    },
    check() {
      const dir = dirOf('reflog');
      const token = readFileSync(join(ROOT, '.reflog-token'), 'utf8').trim();
      const rescued = tryGit(dir, 'show', 'rescued:secret.txt');
      return [
        [rescued !== null, 'existe la rama "rescued" con el archivo secret.txt'],
        [rescued === token, 'la rama "rescued" apunta al último commit perdido'],
        [
          tryGit(dir, 'log', '--oneline', 'rescued')?.split('\n').length === 4,
          'la rama "rescued" conserva los 4 commits del historial',
        ],
      ];
    },
    extra: () => `Tu token (para pegarlo en la respuesta del laboratorio): ${readFileSync(join(ROOT, '.reflog-token'), 'utf8').trim()}`,
  },

  'cherry-pick': {
    title: 'Traer UN solo commit con git cherry-pick',
    story: [
      'La rama "experimental" tiene 3 commits: dos son funciones inestables y uno',
      'corrige un bug real ("fix: corrige división por cero en average").',
      'Solo ese commit debe llegar a main. Hacer merge de la rama completa NO es una opción.',
      '',
      'TU MISIÓN:',
      '  1. Entra a la carpeta:  cd .sandbox/cherry-pick',
      '  2. Con `git log --oneline experimental` identifica el commit del fix.',
      '  3. Desde main ejecuta `git cherry-pick -x <hash>`.',
      '  4. Verifica con:  npm run sandbox -- cherry-pick check',
    ],
    setup() {
      const dir = freshRepo('cherry-pick');
      commitFile(dir, 'math.js', 'export const average = (a) => a.reduce((x, y) => x + y) / a.length;\n', 'feat(math): agrega average');
      commitFile(dir, 'README.md', '# Math\n', 'docs: agrega README');
      git(dir, 'switch', '-q', '-c', 'experimental');
      commitFile(dir, 'dark-mode.js', 'export const dark = true; // inestable\n', 'feat(ui): modo oscuro experimental');
      commitFile(
        dir,
        'math.js',
        'export const average = (a) => (a.length === 0 ? 0 : a.reduce((x, y) => x + y) / a.length);\n',
        'fix: corrige división por cero en average',
      );
      commitFile(dir, 'animations.js', 'export const spin = true; // inestable\n', 'feat(ui): animaciones experimentales');
      git(dir, 'switch', '-q', 'main');
    },
    check() {
      const dir = dirOf('cherry-pick');
      const onMain = tryGit(dir, 'log', '--format=%s', 'main') ?? '';
      const fixedMath = read(dir, 'math.js').includes('a.length === 0');
      return [
        [onMain.includes('fix: corrige división por cero en average'), 'main contiene el commit del fix'],
        [fixedMath, 'math.js en main ya maneja el arreglo vacío'],
        [!existsSync(join(dir, 'dark-mode.js')), 'main NO trajo dark-mode.js'],
        [!existsSync(join(dir, 'animations.js')), 'main NO trajo animations.js'],
        [
          (tryGit(dir, 'log', '-1', '--format=%B', 'main') ?? '').includes('cherry picked from commit'),
          'el commit tiene la referencia "(cherry picked from commit ...)" (usaste -x)',
        ],
      ];
    },
  },

  stash: {
    title: 'Interrupción urgente con git stash',
    story: [
      'Estás a mitad de una funcionalidad en la rama "feature/search" con cambios SIN commitear.',
      'Llega una urgencia: hay un error de ortografía en el README de main y debe corregirse YA.',
      'No puedes cambiar de rama con el trabajo a medias, pero tampoco quieres un commit "wip".',
      '',
      'TU MISIÓN:',
      '  1. Entra a la carpeta:  cd .sandbox/stash   (verás cambios sin commitear: git status)',
      '  2. Guarda tu trabajo con `git stash push -u -m "search a medias"`.',
      '  3. Cambia a main y crea la rama "hotfix/readme-typo".',
      '  4. Corrige "Bienvenidoss" por "Bienvenidos" en README.md y haz commit: fix(readme): corrige ortografía',
      '  5. Vuelve a "feature/search" y recupera tu trabajo con `git stash pop`.',
      '  6. Verifica con:  npm run sandbox -- stash check',
    ],
    setup() {
      const dir = freshRepo('stash');
      commitFile(dir, 'README.md', '# Bienvenidoss\n', 'docs: agrega README');
      git(dir, 'switch', '-q', '-c', 'feature/search');
      commitFile(dir, 'search.js', 'export function search() {\n  return [];\n}\n', 'feat(search): esqueleto de búsqueda');
      writeFileSync(join(dir, 'search.js'), 'export function search(term) {\n  // TODO: a medias\n  return [term];\n}\n');
      writeFileSync(join(dir, 'notes.txt'), 'ideas sueltas (archivo sin seguimiento)\n');
    },
    check() {
      const dir = dirOf('stash');
      const branch = tryGit(dir, 'rev-parse', '--abbrev-ref', 'HEAD');
      const hotfixMsgs = tryGit(dir, 'log', '--format=%s', 'main..hotfix/readme-typo');
      const hotfixReadme = tryGit(dir, 'show', 'hotfix/readme-typo:README.md');
      return [
        [branch === 'feature/search', 'estás de vuelta en feature/search'],
        [read(dir, 'search.js').includes('TODO: a medias'), 'tu trabajo a medias en search.js fue recuperado'],
        [existsSync(join(dir, 'notes.txt')), 'el archivo sin seguimiento notes.txt fue recuperado (stash -u)'],
        [(tryGit(dir, 'stash', 'list') ?? 'x') === '', 'la lista de stash quedó vacía (usaste pop)'],
        [hotfixMsgs === 'fix(readme): corrige ortografía', 'hotfix/readme-typo tiene exactamente 1 commit "fix(readme): corrige ortografía"'],
        [hotfixReadme === '# Bienvenidos', 'el README del hotfix está corregido'],
      ];
    },
  },

  onto: {
    title: 'Mover una rama con git rebase --onto',
    story: [
      'Creaste "feature-b" a partir de "feature-a" porque dependías de su código.',
      'Después, "feature-a" se integró a main con SQUASH MERGE: en main hay un commit nuevo',
      'con los mismos cambios, pero con otro hash. Si haces rebase normal sobre main, Git',
      'intentará reaplicar los commits de feature-a y creará duplicados o conflictos.',
      '',
      'TU MISIÓN:',
      '  1. Entra a la carpeta:  cd .sandbox/onto   (mira: git log --oneline --graph --all)',
      '  2. Mueve SOLO los 2 commits propios de feature-b a la punta de main:',
      '       git rebase --onto main feature-a feature-b',
      '  3. Verifica con:  npm run sandbox -- onto check',
    ],
    setup() {
      const dir = freshRepo('onto');
      commitFile(dir, 'README.md', '# App\n', 'chore: commit inicial');
      git(dir, 'switch', '-q', '-c', 'feature-a');
      commitFile(dir, 'a1.txt', 'a1\n', 'feat(a): primera parte de A');
      commitFile(dir, 'a2.txt', 'a2\n', 'feat(a): segunda parte de A');
      git(dir, 'switch', '-q', '-c', 'feature-b');
      commitFile(dir, 'b1.txt', 'b1\n', 'feat(b): primera parte de B');
      commitFile(dir, 'b2.txt', 'b2\n', 'feat(b): segunda parte de B');
      git(dir, 'switch', '-q', 'main');
      writeFileSync(join(dir, 'a1.txt'), 'a1\n');
      writeFileSync(join(dir, 'a2.txt'), 'a2\n');
      git(dir, 'add', '.');
      git(dir, 'commit', '-q', '-m', 'feat(a): funcionalidad A (squash)');
      git(dir, 'switch', '-q', 'feature-b');
    },
    check() {
      const dir = dirOf('onto');
      const own = tryGit(dir, 'log', '--format=%s', 'main..feature-b')?.split('\n').filter(Boolean) ?? [];
      return [
        [tryGit(dir, 'merge-base', '--is-ancestor', 'main', 'feature-b') !== null, 'feature-b parte de la punta actual de main'],
        [own.length === 2, `feature-b tiene exactamente 2 commits propios (tiene ${own.length})`],
        [!own.some((s) => s.includes('(a)')), 'feature-b no duplicó commits de feature-a'],
        [existsSync(join(dir, 'b2.txt')) && existsSync(join(dir, 'a1.txt')), 'feature-b conserva sus archivos y los de A (vía main)'],
      ];
    },
  },

  conflict: {
    title: 'Rebase con conflicto y git rerere',
    story: [
      'Dos ramas modificaron la MISMA función. Ya hay un rebase esperándote.',
      '',
      'TU MISIÓN:',
      '  1. Entra a la carpeta:  cd .sandbox/conflict',
      '  2. Activa rerere en este repo:  git config rerere.enabled true',
      '  3. Estás en feature/greeting. Ejecuta:  git rebase main',
      '  4. Resuelve el conflicto en greet.js CONSERVANDO ambas intenciones:',
      '       - el saludo con nombre ("Hola, <nombre>")   (rama feature/greeting)',
      '       - el signo de exclamación final "!"          (rama main)',
      '     Luego:  git add greet.js  &&  git rebase --continue',
      '  5. Deshaz el rebase para probar rerere:  git reset --hard ORIG_HEAD',
      '     Repite  git rebase main  y observa: "Resolved ... using previous resolution".',
      '     Haz  git add greet.js  &&  git rebase --continue',
      '  6. Verifica con:  npm run sandbox -- conflict check',
    ],
    setup() {
      const dir = freshRepo('conflict');
      commitFile(dir, 'greet.js', 'export function greet() {\n  return \'Hola\';\n}\n', 'feat(greet): saludo base');
      git(dir, 'switch', '-q', '-c', 'feature/greeting');
      commitFile(dir, 'greet.js', 'export function greet(name) {\n  return `Hola, ${name}`;\n}\n', 'feat(greet): saludo con nombre');
      git(dir, 'switch', '-q', 'main');
      commitFile(dir, 'greet.js', 'export function greet() {\n  return \'Hola!\';\n}\n', 'feat(greet): agrega exclamación');
      git(dir, 'switch', '-q', 'feature/greeting');
    },
    check() {
      const dir = dirOf('conflict');
      const content = read(dir, 'greet.js');
      const state = tryGit(dir, 'status', '--porcelain=v1', '--branch') ?? '';
      const inRebase = existsSync(join(dir, '.git', 'rebase-merge')) || existsSync(join(dir, '.git', 'rebase-apply'));
      return [
        [!inRebase, 'el rebase terminó (no queda ninguno en curso)'],
        [!/^(<<<<<<<|=======|>>>>>>>)/m.test(content), 'greet.js no tiene marcadores de conflicto'],
        [/Hola, \$\{name\}!/.test(content) || (/\$\{name\}/.test(content) && content.includes('!')), 'greet.js conserva el nombre y la exclamación'],
        [tryGit(dir, 'merge-base', '--is-ancestor', 'main', 'feature/greeting') !== null, 'feature/greeting está rebaseada sobre main'],
        [state.includes('feature/greeting'), 'sigues en la rama feature/greeting'],
        [(tryGit(dir, 'config', '--get', 'rerere.enabled') ?? '') === 'true', 'rerere está activado en este repositorio'],
        [existsSync(join(dir, '.git', 'rr-cache')), 'rerere registró tu resolución (carpeta .git/rr-cache)'],
      ];
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────

function printUsage() {
  console.log('Escenarios disponibles:\n');
  for (const [name, s] of Object.entries(scenarios)) {
    console.log(`  ${name.padEnd(12)} ${s.title}`);
  }
  console.log('\nUso:');
  console.log('  npm run sandbox -- <escenario>          crea el escenario');
  console.log('  npm run sandbox -- <escenario> check    verifica tu solución');
}

const [name, action] = process.argv.slice(2);

if (!name || name === 'list') {
  printUsage();
  process.exit(0);
}

const scenario = scenarios[name];
if (!scenario) {
  console.error(`Escenario desconocido: "${name}"\n`);
  printUsage();
  process.exit(1);
}

if (action === 'check') {
  if (!existsSync(dirOf(name))) {
    console.error(`Primero crea el escenario: npm run sandbox -- ${name}`);
    process.exit(1);
  }
  console.log(`\n${scenario.title}\n`);
  const results = scenario.check();
  for (const [ok, message] of results) console.log(`${ok ? '✓' : '✗'} ${message}`);
  const passed = results.every(([ok]) => ok);
  console.log(passed ? '\n¡Escenario resuelto!' : '\nAún no está resuelto. Revisa los puntos marcados con ✗.');
  if (passed && scenario.extra) console.log(scenario.extra());
  process.exit(passed ? 0 : 1);
}

mkdirSync(ROOT, { recursive: true });
scenario.setup();
console.log(`\n${scenario.title}\n`);
console.log(scenario.story.join('\n'));
console.log(`\n(Escenario creado en ${dirOf(name)})`);
