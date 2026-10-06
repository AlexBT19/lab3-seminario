---
id: seminario-git-flow-03
title: Laboratorio 3 - Git avanzado y GitFlow en equipo
subject: Seminario de Sistemas
version: 1
duration: 180
points: 100
status: draft
---

{{repository
  id="base-repository"
  provider="github"
  url="https://github.com/Ditmar/lab3-seminario"
  branch="main"
}}

# Laboratorio 3 — Git avanzado y GitFlow en equipo

## Objetivo

Aplicar en equipo las estrategias de **Git avanzado** y el flujo de trabajo **GitFlow**: trabajar en paralelo en ramas `feature/*`, limpiar la historia, integrar con **rebase**, resolver **conflictos reales**, revisar código mediante Pull Requests, publicar un **release** versionado y corregir un error urgente con un **hotfix**.

El proyecto es una pequeña tienda en Node.js. El código es lo de menos: las cuatro tareas fueron diseñadas para que **se pisen entre sí** y aparezcan los problemas que un equipo real enfrenta todos los días.

Al finalizar el laboratorio deberás poder:

- explicar el rol de `main`, `develop`, `feature/*`, `release/*` y `hotfix/*`;
- escribir commits atómicos con **Conventional Commits** y usar `git add -p`;
- limpiar tu historia con `git rebase -i` (`reword`, `fixup`, reordenar) y `--autosquash`;
- actualizar tu rama con `git rebase` y publicar con `git push --force-with-lease`;
- resolver conflictos de texto **y** conflictos semánticos (los que Git no detecta pero rompen las pruebas);
- reutilizar resoluciones con `git rerere`;
- rescatar trabajo con `git reflog`, `git stash`, `git cherry-pick` y `git rebase --onto`;
- publicar un release con **tags anotados** y **Versionado Semántico**;
- aplicar un hotfix y propagarlo de vuelta a `develop` (back-merge);
- comparar estrategias de merge (merge commit, squash, fast-forward, rebase + fast-forward).

> Este laboratorio se basa en el artículo **Git avanzado y gestión profesional de cambios**.
> Idea central del artículo: *«Git administra la historia de las decisiones técnicas»*.
> Cuando el historial es limpio, cada commit explica **por qué** cambió algo y se puede revertir con seguridad.

---

## Cómo funciona este laboratorio

Se trabaja en **equipos de 4 personas**. El equipo comparte **un único fork** del repositorio base, y cada integrante trabaja en **su propia rama** `feature/*`.

```text
  Ditmar/lab3-seminario          ← repositorio base (solo lectura para ustedes)
          │  Fork
          ▼
  <dueño>/lab3-seminario         ← fork del EQUIPO (el dueño agrega a los otros 3 como colaboradores)
     ▲      ▲      ▲      ▲
     │      │      │      │       cada uno clona el MISMO fork y empuja sus propias ramas
   Est.1  Est.2  Est.3  Est.4
```

### Roles y tareas

El estudiante que hace el fork es el **Estudiante 1**. Los otros tres se ordenan **alfabéticamente por su usuario de GitHub** y toman los números 2, 3 y 4.

| Estudiante | Rama | Tarea | Archivo compartido que modifica | Release/Hotfix |
|---|---|---|---|---|
| **1** (dueño del fork) | `feature/discounts` | Códigos de descuento | `src/pricing.js` | **Release Manager**: crea `release/1.1.0` |
| **2** | `feature/tax` | Impuesto IVA 13 % | `src/pricing.js` | Crea el `hotfix/1.1.1` |
| **3** | `feature/currency` | Monedas (BOB, USD, EUR) | `src/format.js` | Back-merge del release a `develop` |
| **4** | `feature/receipt` | Recibo imprimible + comando CLI | `src/format.js`, `src/cli.js` | Back-merge del hotfix a `develop` |

**Orden de integración a `develop` (obligatorio):** 1 → 2 → 3 → 4.

Las tareas 1 y 2 modifican **la misma función**. Las tareas 3 y 4 modifican **la misma firma**. Y las cuatro agregan una línea en `src/index.js` y en `CHANGELOG.md` **en el mismo lugar**. Los conflictos no son un accidente: son el objetivo del laboratorio.

### Línea de tiempo sugerida (180 min)

| Fase | Qué se hace | Tiempo |
|---|---|---:|
| 0 | Preparación: fork, colaboradores, clon, configuración | 20 |
| 1 | Actividades 1 y 2: GitFlow y entorno | 15 |
| 2 | Desarrollo **en paralelo** de tu feature (Actividad 3) | 35 |
| 3 | **Cola de integración** 1 → 2 → 3 → 4 (Actividades 4, 5 y 6). Mientras esperas tu turno haces la Actividad 7 | 50 |
| 4 | Release 1.1.0 (Actividad 9) | 15 |
| 5 | Hotfix 1.1.1 (Actividad 10) | 15 |
| 6 | Actividades 8, 11 y 12: historial, verificación y reflexión | 30 |

### Reglas del juego

1. **Nadie hace commit directo a `main` ni a `develop`.** Todo entra por Pull Request.
2. **Nadie hace `git merge develop` dentro de su feature.** Para actualizar tu rama se usa `git rebase`.
3. **Nunca uses `git push --force`.** Si necesitas reescribir tu rama, usa `--force-with-lease`.
4. Tu rama `feature/*` es **solo tuya**: nadie más empuja a ella (por eso reescribirla es seguro).
5. Los commits que lleguen a `develop` deben seguir **Conventional Commits** y no pueden contener `wip`, `fixup!` ni similares.
6. Los PR de feature se integran con **Create a merge commit** (equivale a `--no-ff`).
7. Antes de cada `push` o PR, ejecuta `npm test`.

---

## Preparación

### Paso 0 — Requisitos

```bash
git --version     # 2.30 o superior
node --version    # 20 o superior
npm --version
```

No hay dependencias que instalar: el proyecto usa solo Node.js.

### Paso 1 — Fork del equipo (solo el Estudiante 1)

Repositorio base:

https://github.com/Ditmar/lab3-seminario

1. Haz clic en **Fork**.
2. **Desmarca** la casilla **«Copy the `main` branch only»**. Si no lo haces, el fork no tendrá la rama `develop` y GitFlow no podrá empezar.
3. Crea el fork.

Si olvidaste desmarcarla, no pasa nada: clona el fork y ejecuta

```bash
git remote add upstream https://github.com/Ditmar/lab3-seminario.git
git fetch upstream
git push origin upstream/develop:refs/heads/develop
git push origin --tags
```

### Paso 2 — Agregar colaboradores (Estudiante 1)

Antes de agregar a alguien necesitas su **usuario de GitHub**. Pídelo por el chat del grupo.

1. En tu fork: **Settings → Collaborators → Add people**.
2. Agrega a los otros tres compañeros con permiso de **escritura (Write)**.
3. Cada compañero debe **aceptar la invitación** (llega por correo y en <https://github.com/notifications>).

### Paso 3 — Habilitar CI (Estudiante 1)

Los forks tienen GitHub Actions desactivado por defecto.

1. Abre la pestaña **Actions** del fork.
2. Pulsa **«I understand my workflows, go ahead and enable them»**.

El flujo `.github/workflows/ci.yml` ejecutará `npm test` en Node 20 y 22, y validará que los commits de cada PR sigan Conventional Commits.

### Paso 4 — Proteger `main` y `develop` (Estudiante 1, recomendado)

En **Settings → Branches → Add branch ruleset** (o *Add classic branch protection rule*), para **`main`** y para **`develop`**:

- ✅ Require a pull request before merging
- ✅ Require approvals: **1**
- ✅ Require status checks to pass (agrégalos cuando ya hayan corrido una vez: `test (Node 20)`, `test (Node 22)`, `conventional commits`)
- ⛔ **No** actives *Require linear history* (en GitFlow los merges con commit son parte del diseño)

Según el artículo, las protecciones de rama son lo que impide el *«solo por esta vez»* que termina rompiendo `main`.

### Paso 5 — Clonar y configurar (los cuatro)

```bash
git clone https://github.com/USUARIO-DEL-FORK/lab3-seminario.git
cd lab3-seminario
npm test
```

Configura tu identidad (si aún no lo hiciste) y estas opciones, que usaremos durante todo el laboratorio:

```bash
git config user.name  "Tu Nombre"
git config user.email "tu-correo@ejemplo.com"

git config pull.ff only          # git pull nunca crea merges sorpresa
git config rerere.enabled true   # recuerda cómo resolviste los conflictos
git config core.autocrlf false   # el repo ya normaliza saltos de línea (.gitattributes)
```

### Paso 6 — Conocer el estado inicial

```bash
git branch -a
git log --oneline --graph --decorate --all
git tag
```

Deberías ver `main`, `develop` y el tag `v1.0.0`. Prueba la aplicación:

```bash
npm start -- list
npm start -- search Laptop
```

### Mapa de GitFlow

Así debe verse la historia al terminar:

```text
main      ●─────────────────────────────────●───────────────●────
         v1.0.0                              ▲ v1.1.0         ▲ v1.1.1
                                             │                │
release                          ●───────────┘                │
                                /                             │
hotfix                         │                     ●────────┘  (nace de main)
                               │                    /
develop   ●──────●────●────●───●───────────────────●──────────●──
           \    /\   /\   /                       (back-merge) (back-merge)
feature     ●──●  ●─●  ●─●     ← una rama por tarea, siempre desde develop
```

---

## Actividad 1 — GitFlow en tus propias palabras

Según el artículo, existen tres estrategias de ramas: **GitFlow**, **GitHub Flow** y **Trunk-Based Development**.

1. Explica el propósito de cada rama de GitFlow: `main`, `develop`, `feature/*`, `release/*` y `hotfix/*` (de dónde nace y a dónde regresa cada una).
2. ¿Por qué existe `develop`? ¿Qué problema evita respecto a trabajar todos directamente sobre `main`?
3. El artículo dice: *«Cuanto más tiempo vive una rama separada de main, más costosa es la integración»*. Explica cómo se relaciona esta frase con el laboratorio y qué estrategia (GitFlow, GitHub Flow o Trunk-Based) elegirías para un equipo que despliega varias veces al día, y por qué.

{{answer
  id="gitflow-concepts"
  type="textarea"
  points="6"
  evaluator="ai"
  placeholder="Describe el rol de cada rama, para qué sirve develop y compara GitFlow con GitHub Flow / Trunk-Based..."
}}

{{rubric for="gitflow-concepts"}}
Debe describir correctamente:

- main: código en producción, versionado con tags;
- develop: integración continua de las features;
- feature/*: nace de develop y vuelve a develop;
- release/*: nace de develop, se estabiliza y termina en main y develop;
- hotfix/*: nace de main, corrige algo urgente y termina en main y develop.

Debe explicar que develop evita que main reciba trabajo a medio terminar y permite integrar antes de liberar.

Debe relacionar la frase del artículo con el costo de integrar ramas largas (más conflictos, más divergencia) y justificar una estrategia razonable para despliegue continuo (GitHub Flow o Trunk-Based con feature flags) frente a GitFlow, pensado para releases planificados.

No exigir lenguaje exacto del artículo.
{{/rubric}}

---

## Actividad 2 — Equipo y entorno

Pega en la respuesta:

1. la URL del fork del equipo;
2. los usuarios de GitHub de los cuatro integrantes, indicando quién es el Estudiante 1, 2, 3 y 4;
3. la salida de estos comandos en **tu** máquina:

```bash
git remote -v
git branch -a
git tag
git config --get rerere.enabled
git config --get pull.ff
```

{{answer
  id="team-setup"
  type="textarea"
  points="4"
  evaluator="ai"
  placeholder="URL del fork, integrantes con su número de estudiante y la salida de los comandos..."
}}

{{rubric for="team-setup"}}
Debe incluir:

- URL de un fork (no del repositorio base);
- cuatro usuarios con su rol/número;
- git remote -v mostrando origin apuntando al fork;
- ramas remotas origin/main y origin/develop;
- el tag v1.0.0;
- rerere.enabled = true y pull.ff = only.

Restar proporcionalmente por cada elemento faltante.
{{/rubric}}

---

## Tus tareas

Cada estudiante realiza **solo su tarea**. Lee primero la tuya completa, y luego lee la del compañero que te revisará.

### Reglas de negocio compartidas (contrato)

Estas reglas existen en cualquier combinación de tareas. Cuando integres, **tu código debe respetarlas aunque tu rama no las conozca todavía**:

1. `calculateTotal(items, options)` aplica **primero el descuento y luego el impuesto**.
   `100 → descuento SAVE10 → 90 → IVA 13 % → 101.70`
2. Todo monto se redondea a 2 decimales con `round2` (ya existe en `src/money.js`).
3. **Lo que ya está en `develop` manda.** Si tu cambio choca con algo ya integrado, **tú te adaptas** y no rompes la API de quien llegó antes.
4. El comportamiento anterior se conserva: `calculateTotal(items)` y `formatPrice(10)` siguen funcionando igual sin argumentos extra.

### Estudiante 1 — `feature/discounts`

**Archivo nuevo `src/discounts.js`:**

```js
export const DISCOUNT_CODES = { SAVE10: 0.1, SAVE20: 0.2, BLACKFRIDAY: 0.3 };
export function applyDiscount(amount, code) { /* ... */ }
```

- `applyDiscount(100, 'SAVE10')` → `90`.
- El código no distingue mayúsculas (`'save10'` funciona).
- Un código desconocido o `undefined` devuelve el monto sin cambios.
- Redondea con `round2`.

**Cambios en archivos existentes:**

- `src/pricing.js`: `calculateTotal(items, { discountCode } = {})` aplica el descuento al subtotal. Actualiza también el comentario JSDoc (agrega `@param` y un `@example`).
- `src/index.js`: exporta `./discounts.js` debajo del comentario indicado.
- `CHANGELOG.md`: agrega una viñeta en `### Added` de la sección `Unreleased`, **justo debajo del encabezado**.

**Pruebas:** archivo nuevo `test/discounts.test.js`.

### Estudiante 2 — `feature/tax`

**Archivo nuevo `src/tax.js`:**

```js
export const TAX_RATE = 0.13;
export function calculateTax(amount) { /* ... */ }
export function addTax(amount) { /* ... */ }
```

- `addTax(100)` → `113`; `calculateTax(100)` → `13`.
- Redondea con `round2`.

**Cambios en archivos existentes:**

- `src/pricing.js`: `calculateTotal(items, { includeTax = false } = {})` suma el IVA cuando `includeTax` es `true`. Actualiza el JSDoc.
- `src/index.js` y `CHANGELOG.md`: igual que el Estudiante 1 (una línea nueva).

**Pruebas:** archivo nuevo `test/tax.test.js`.

### Estudiante 3 — `feature/currency`

**Archivo nuevo `src/currency.js`:**

```js
export const CURRENCIES = {
  BOB: { symbol: 'Bs', rate: 1 },
  USD: { symbol: '$',  rate: 0.145 },
  EUR: { symbol: '€',  rate: 0.133 },
};
export function getCurrency(code) { /* lanza Error('Moneda no soportada: XXX') si no existe */ }
export function convert(amount, code = 'BOB') { /* amount * rate, con round2 */ }
```

**Cambios en archivos existentes:**

- `src/format.js`: nueva firma **`formatPrice(amount, currency = 'BOB')`**.
  - `formatPrice(100, 'USD')` → `'$ 14.50'`
  - `formatPrice(10)` → `'Bs 10.00'` (como antes)
  - una moneda desconocida lanza un error.
  - Actualiza el JSDoc.
- `src/index.js` y `CHANGELOG.md`: una línea nueva.

**Pruebas:** archivo nuevo `test/currency.test.js`.

### Estudiante 4 — `feature/receipt`

**Archivo nuevo `src/receipt.js`:**

```js
export function buildReceipt(items) { /* devuelve un string de varias líneas */ }
```

Cada ítem es `{ name, price, quantity }`. Ejemplo de salida:

```text
=== MINI TIENDA ===
Mouse Inalámbrico x2        Bs 51.00
TOTAL                       Bs 51.00
```

- La columna de la etiqueta mide **28** caracteres (`padEnd(28)`).
- Los montos se alinean a la derecha con un ancho de **12**.

**Cambios en archivos existentes:**

- `src/format.js`: **tu rama** agrega un segundo parámetro para el ancho: `formatPrice(amount, { width = 0 } = {})`, que rellena a la izquierda (`padStart`). Actualiza el JSDoc.
- `src/cli.js`: nuevo comando `receipt SKU:CANTIDAD ...`, por ejemplo `npm start -- receipt MOU-002:2 LIB-003:1`.
- `src/index.js` y `CHANGELOG.md`: una línea nueva.

**Pruebas:** archivo nuevo `test/receipt.test.js`.

> ⚠️ **Tu tarea tiene un paso extra** que solo podrás hacer **después** del rebase: cuando las features 1, 2 y 3 estén en `develop`, el recibo deberá aceptar `buildReceipt(items, { discountCode, includeTax, currency })` y mostrar el total con descuento, impuesto y moneda. Además, tu firma de `formatPrice` **chocará** con la del Estudiante 3. Recuerda la regla 3: **lo que ya está en `develop` manda**.

---

## Actividad 3 — Desarrollo de tu feature: commits atómicos y limpieza de historia

Esta actividad se hace **en paralelo**: los cuatro trabajan a la vez, cada uno en su rama, **sin mirar** lo que hacen los demás. Así se reproduce una situación real: mientras tú programas, otros ya están cambiando el mismo código.

> Del artículo: un buen commit representa **un cambio lógico**, compila, pasa las pruebas y explica el **porqué**.
> `git add -p` permite elegir **fragmentos (hunks)** de un archivo en vez del archivo entero.

### Paso 1 — Crea tu rama desde `develop`

```bash
git fetch origin
git switch -c feature/TU-RAMA origin/develop     # discounts, tax, currency o receipt
git push -u origin feature/TU-RAMA               # publica la rama (todavía sin PR)
```

### Paso 2 — Trabaja y comitea **mal a propósito** (guion obligatorio)

Vas a crear una historia "sucia" tal como ocurre cuando uno programa de prisa, y después la vas a limpiar. Haz estos cinco commits **con estos mensajes exactos**:

| # | Mensaje | Qué incluye |
|---|---|---|
| 1 | `wip` | El módulo nuevo (`src/discounts.js`, `tax.js`, `currency.js` o `receipt.js`) |
| 2 | `tests` | Tu archivo de pruebas nuevo en `test/` |
| 3 | `fix typo` | Un pequeño retoque en tu módulo nuevo (un comentario, un nombre, un espacio) |
| 4 | `arreglo` | **Solo la lógica** del archivo compartido (`pricing.js` o `format.js`) + la línea de `src/index.js` (+ `cli.js` si eres el Estudiante 4) |
| 5 | `docs` | **Solo el JSDoc** del archivo compartido + la viñeta de `CHANGELOG.md` |

Los commits 4 y 5 tocan **el mismo archivo** (`pricing.js` / `format.js`): uno por la lógica y otro por la documentación. Para separarlos usa `git add -p`:

```bash
git add src/index.js
git add -p src/pricing.js        # (o src/format.js)
```

Git te mostrará cada fragmento y preguntará qué hacer:

| Tecla | Acción |
|---|---|
| `y` | incluir este fragmento en el commit |
| `n` | no incluirlo (queda para el siguiente commit) |
| `s` | dividir el fragmento en otros más pequeños |
| `e` | editar el fragmento manualmente |
| `q` | salir |

Si Git muestra la lógica y el JSDoc en **un solo** fragmento, usa `s` para dividirlo. Comprueba lo que quedó en el área de preparación antes de comitear:

```bash
git diff --staged
```

### Paso 3 — Limpia tu historia con `git rebase -i`

Tu historia debe terminar así (**3 commits**, o 4 si eres el Estudiante 4 después del rebase):

```text
feat(<alcance>): <descripción de la funcionalidad>     ← módulo + lógica + export
test(<alcance>): <qué pruebas agregaste>
docs(<alcance>): <documentación y changelog>
```

Donde `<alcance>` es `discounts`, `tax`, `currency` o `receipt`.

```bash
git rebase -i origin/develop
```

Se abrirá el editor con una lista parecida a esta (el más antiguo arriba):

```text
pick a1b2c3d wip
pick e4f5a6b tests
pick c7d8e9f fix typo
pick 0a1b2c3 arreglo
pick d4e5f6a docs
```

Reordénala y cambia las acciones así:

```text
reword a1b2c3d wip            ← cambia el mensaje a "feat(...): ..."
fixup  c7d8e9f fix typo       ← se fusiona con el commit de arriba y descarta su mensaje
fixup  0a1b2c3 arreglo        ← idem
reword e4f5a6b tests          ← cambia el mensaje a "test(...): ..."
reword d4e5f6a docs           ← cambia el mensaje a "docs(...): ..."
```

| Acción | Qué hace |
|---|---|
| `pick` | conserva el commit tal cual |
| `reword` | conserva el commit pero te deja cambiar el mensaje |
| `squash` | lo fusiona con el anterior y te deja combinar los mensajes |
| `fixup` | lo fusiona con el anterior y descarta su mensaje |
| `drop` | elimina el commit |

Si te equivocas en medio del proceso: `git rebase --abort` vuelve todo al estado anterior.

Valida el resultado:

```bash
git log --oneline origin/develop..HEAD
npm test
npm run check:commits -- origin/develop..HEAD
```

Finalmente actualiza tu rama remota. Como reescribiste commits **ya publicados** (los del `git push -u`), un `git push` normal será rechazado:

```bash
git push --force-with-lease origin feature/TU-RAMA
```

> `--force-with-lease` solo sobrescribe si la rama remota está **exactamente como tú la conoces**. Si alguien más empujó algo que tú no has visto, se detiene y te protege. `--force` no hace esa comprobación: **está prohibido en este laboratorio**.

### Entregable de la actividad

Pega en la respuesta:

1. la salida de `git log --oneline` **antes** de limpiar (los 5 commits sucios);
2. la salida de `git log --oneline origin/develop..HEAD` **después** de limpiar;
3. la salida de `git diff --staged` (o una descripción) del commit 4, mostrando que solo incluía la lógica y no el JSDoc;
4. una explicación breve: ¿por qué usaste `fixup` para unos commits y `reword` para otros? ¿qué ventaja tiene que cada commit sea atómico?

{{answer
  id="atomic-commits"
  type="textarea"
  points="8"
  evaluator="ai"
  placeholder="Pega el log antes y después de limpiar, el diff staged del commit 4 y tu explicación..."
}}

{{rubric for="atomic-commits"}}
Debe mostrar evidencia de los cinco commits sucios iniciales (wip, tests, fix typo, arreglo, docs) y del resultado limpio con mensajes Conventional Commits (feat/test/docs con alcance).

Debe evidenciar el uso de git add -p (diff staged con solo algunos fragmentos del archivo compartido).

Debe explicar:
- fixup descarta el mensaje y fusiona cambios menores en un commit existente;
- reword solo mejora el mensaje;
- commits atómicos facilitan revisión, revert, bisect y comprensión del historial.

No premiar historias donde sigan existiendo wip, fix typo o arreglo.
{{/rubric}}

---

## Cola de integración (Actividades 4, 5 y 6)

Llegó la hora de juntar el trabajo en `develop`. **Es un trabajo por turnos**: 1 → 2 → 3 → 4.

```text
 turno 1: Est.1 integra   →  develop avanza
 turno 2: Est.2 se rebasea sobre ese develop (¡conflictos!), integra
 turno 3: Est.3 se rebasea sobre develop, integra
 turno 4: Est.4 se rebasea sobre develop, integra
```

### Protocolo de cada turno

Cuando es **tu turno** (el compañero anterior avisó por el chat que ya integró):

```bash
# 1. Trae el estado actual del remoto y ubícate en tu rama
git fetch origin
git switch feature/TU-RAMA

# 2. Mira cuánto avanzó develop sin ti
git log --oneline --graph HEAD..origin/develop

# 3. Rebasea sobre el develop más reciente
git rebase origin/develop
```

Si Git se detiene con `CONFLICT`, **no entres en pánico**: sigue la sección de la Actividad 4.

```bash
# 4. Cuando el rebase termine: SIEMPRE prueba
npm test

# 5. Publica (la rama cambió de base, hay que reescribirla)
git push --force-with-lease origin feature/TU-RAMA

# 6. Abre el Pull Request: feature/TU-RAMA  →  develop
```

### Mientras esperas tu turno

Haz estas dos cosas:

- la **Actividad 7** (primeros auxilios), que es individual;
- la **revisión de código** (Actividad 6) del PR del compañero que va justo antes que tú.

---

## Actividad 4 — Rebase, conflictos y `rerere`

### Qué es un conflicto de rebase

`git rebase origin/develop` toma **tus commits uno por uno** y los vuelve a aplicar encima de `develop`. Si Git no puede aplicar uno de ellos porque otro compañero cambió las mismas líneas, se detiene y te deja el archivo así:

```text
<<<<<<< HEAD
   ... lo que ya está en develop (lo de tus compañeros) ...
=======
   ... lo que intenta aplicar TU commit ...
>>>>>>> a1b2c3d (feat(tax): agrega impuesto IVA 13%)
```

> ⚠️ **En un rebase, `ours` y `theirs` están al revés** que en un merge:
> - `HEAD` / `--ours` = la base sobre la que estás rebaseando (**`develop`**, lo de tus compañeros);
> - `--theirs` = **tu** commit que se está re-aplicando.
>
> Por eso conviene resolver **leyendo el código**, no con `checkout --ours/--theirs` a ciegas.

### Procedimiento para resolver

1. Mira qué archivos están en conflicto:

   ```bash
   git status
   ```

2. Abre cada archivo y responde tres preguntas (el artículo lo llama *entender los tres lados*):
   - ¿Qué había **originalmente**?
   - ¿Qué quería lograr **el que llegó antes** (`develop`)?
   - ¿Qué quiero lograr **yo**?

3. Escribe la versión final que **conserve ambas intenciones** y respete el contrato de la sección «Reglas de negocio compartidas». Elimina **todos** los marcadores `<<<<<<<`, `=======` y `>>>>>>>`.

4. Marca como resuelto y continúa:

   ```bash
   git add RUTA/DEL/ARCHIVO
   git rebase --continue
   ```

5. Un rebase de varios commits puede detenerse **varias veces** (una por cada commit que choque). Repite hasta ver `Successfully rebased`.

6. Otras opciones:

   ```bash
   git rebase --abort     # cancela y vuelve al estado anterior
   git rebase --skip      # descarta el commit actual (casi nunca es lo correcto)
   ```

### Conflictos que debes esperar

| Estudiante | Conflictos esperados | Pista |
|---|---|---|
| **1** | Ninguno (eres el primero) | Haz el escenario `conflict` del sandbox (ver abajo) |
| **2** | `src/pricing.js`, `src/index.js`, `CHANGELOG.md` | Dos funciones queriendo el mismo parámetro: combínalos y recuerda el orden descuento → impuesto |
| **3** | `src/index.js`, `CHANGELOG.md` | Conflictos «de texto»: ambos lados deben quedarse |
| **4** | `src/format.js`, `src/index.js`, `CHANGELOG.md` **y un conflicto que Git NO detecta** | Tus pruebas fallarán **después** de un rebase «exitoso» |

### El conflicto semántico (Estudiante 4)

Cuando termines el rebase y ejecutes `npm test`, algo fallará aunque Git no marcó ningún conflicto en `src/receipt.js`. ¿Por qué? Porque ese archivo es **nuevo**, y Git solo detecta choques en líneas que ambos tocaron. Pero `receipt.js` llama a `formatPrice(x, { width: 12 })` con **tu** firma, y la firma que quedó en `develop` es otra.

Aprende esta lección: **un rebase sin conflictos no significa que el código funcione. Siempre ejecuta `npm test`.** Esta es exactamente la clase de problema que una *merge queue* (cola de integración) del artículo detecta automáticamente probando cada PR contra el estado real de `main`.

Después de adaptar `receipt.js`, completa el paso extra de tu tarea (`discountCode`, `includeTax`, `currency`) y haz un commit adicional:

```text
fix(receipt): adapta el recibo a la nueva firma de formatPrice
```

### Reutilizar resoluciones con `git rerere`

Ya activaste `rerere` en la preparación. **REuse REcorded REsolution** guarda cómo resolviste cada conflicto y lo vuelve a aplicar solo si el mismo conflicto reaparece (por ejemplo, si tienes que rebasear de nuevo).

Pruébalo **antes de hacer push**, justo después de terminar tu rebase con conflictos:

```bash
git reset --hard ORIG_HEAD      # deshace el rebase (ORIG_HEAD apunta a tu rama antes de rebasear)
git rebase origin/develop       # vuelve a rebasear
```

Observa los mensajes `Recorded resolution` (la primera vez) y `Resolved '...' using previous resolution` (la segunda). Git ya aplicó tu solución; solo verifica con `git diff`, haz `git add` y `git rebase --continue`.

> Estudiante 1: tu rebase real no tiene conflictos. Haz **todo** lo anterior en el escenario `conflict` del sandbox:
>
> ```bash
> npm run sandbox -- conflict
> cd .sandbox/conflict
> # sigue las instrucciones que se imprimen
> npm run sandbox -- conflict check      # desde la raíz del proyecto
> ```

### Entregable A: explicación

Describe:

1. qué archivos tuvieron conflicto en **cada parada** del rebase (o en el sandbox, si eres el Estudiante 1);
2. qué intentaba lograr cada lado y qué decisión tomaste;
3. qué ocurrió al ejecutar `npm test` después del rebase (¿falló algo? ¿por qué?);
4. qué mostró `rerere` al repetir el rebase;
5. por qué en este laboratorio actualizas tu rama con `rebase` y no con `git merge develop`.

{{answer
  id="rebase-conflicts-explanation"
  type="textarea"
  points="8"
  evaluator="ai"
  placeholder="Describe los conflictos, tus decisiones, el resultado de npm test, lo que mostró rerere y por qué usaste rebase..."
}}

{{rubric for="rebase-conflicts-explanation"}}
Debe identificar archivos concretos en conflicto y explicar qué quería cada lado (develop vs su commit).

Debe justificar decisiones respetando el contrato: descuento antes de impuesto; develop manda; compatibilidad hacia atrás.

Para el Estudiante 4 debe reconocer el conflicto semántico (receipt.js usa la firma antigua de formatPrice) detectado por npm test, no por Git.

Debe mencionar los mensajes de rerere (Recorded resolution / Resolved ... using previous resolution).

Sobre rebase vs merge: historia lineal sin commits de merge «de mantenimiento», cada commit se reescribe sobre la base actual, PR más fáciles de leer; y la advertencia de no rebasear commits compartidos.

Para el Estudiante 1 se acepta que la evidencia provenga del escenario conflict del sandbox.
{{/rubric}}

### Entregable B: tu resolución final

Pega el **código final** de la pieza conflictiva más importante, **ya resuelta**:

- Estudiante 1: el contenido de `greet.js` del escenario `conflict`.
- Estudiante 2: la función `calculateTotal` completa de `src/pricing.js`.
- Estudiante 3: el contenido de `src/index.js` (los `export`).
- Estudiante 4: la función `formatPrice` completa de `src/format.js`.

{{answer
  id="resolved-code"
  type="code"
  language="javascript"
  points="6"
  evaluator="ai"
}}

{{rubric for="resolved-code"}}
El código no debe contener marcadores de conflicto.

Estudiante 1: greet conserva el nombre («Hola, ${name}») Y el signo de exclamación.
Estudiante 2: calculateTotal acepta discountCode e includeTax; aplica el descuento primero y el impuesto después; redondea con round2; sigue funcionando sin opciones.
Estudiante 3: index.js conserva TODOS los export de los compañeros y el propio.
Estudiante 4: formatPrice conserva la firma ya integrada (amount, currency = 'BOB') y agrega el ancho como tercer parámetro opcional, sin romper formatPrice(10) ni formatPrice(100, 'USD').

Penalizar si se perdió el trabajo de un compañero.
{{/rubric}}

---

## Actividad 5 — Pull Request de tu feature

Con tu rama rebaseada, probada y publicada con `--force-with-lease`:

1. Abre un Pull Request **desde `feature/TU-RAMA` hacia `develop`** en **el fork del equipo**. Cuidado: GitHub puede proponerte abrirlo hacia el repositorio base `Ditmar/lab3-seminario`; **cámbialo** al fork del equipo.
2. Completa la plantilla del PR (propósito, checklist, notas sobre conflictos).
3. Espera a que el CI pase en verde (✅ `test` y `conventional commits`).
4. Espera la revisión de tu compañero (Actividad 6).
5. Cuando esté aprobado, usa **Create a merge commit** (no *Squash* ni *Rebase and merge*).
6. Avisa por el chat que terminó tu turno.

Antes de pedir revisión, comprueba:

```bash
npm test
npm run check:commits -- origin/develop..HEAD
git log --oneline --graph origin/develop..HEAD     # historia lineal, sin merges
```

Pega aquí la URL de tu Pull Request:

{{answer
  id="feature-pr"
  type="github-pr"
  source="base-repository"
  points="25"
  evaluator="ai"
  required="true"
}}

{{rubric for="feature-pr"}}
Evalúa principalmente el diff entre el commit base del laboratorio (v1.0.0) y el commit entregado.

NO otorgues mérito por código que ya existía en el repositorio base.

La rama indica la tarea del estudiante:
- feature/discounts: src/discounts.js, calculateTotal con discountCode;
- feature/tax: src/tax.js, calculateTotal con includeTax;
- feature/currency: src/currency.js, formatPrice(amount, currency);
- feature/receipt: src/receipt.js, formatPrice con ancho, comando receipt en cli.js.

Distribución (25 puntos):

Funcionalidad según la tarea — 8 puntos
- implementa la API exacta indicada (nombres, firma, resultados de los ejemplos);
- conserva el comportamiento anterior sin argumentos extra;
- para receipt: tras el rebase acepta discountCode, includeTax y currency, y usa la firma de formatPrice ya integrada.

Historial limpio — 7 puntos
- commits atómicos con Conventional Commits y alcance;
- sin wip, fixup!, fix typo ni arreglo;
- el JSDoc y la lógica del archivo compartido están en commits distintos (evidencia de git add -p);
- mínimo 2 commits propios.

Rebase y estado de la rama — 4 puntos
- la rama está basada en la punta de develop al momento del PR;
- no hay commits de merge dentro de la rama (se usó rebase, no merge);
- el PR apunta a develop del fork, no a main ni al repositorio base.

Pruebas — 3 puntos
- archivo de pruebas nuevo con casos significativos (caso feliz y casos borde);
- las pruebas existentes siguen pasando.

Integración con el resto del proyecto — 3 puntos
- exporta el módulo nuevo desde src/index.js sin perder los export de los demás;
- agrega la viñeta en CHANGELOG.md bajo Unreleased/Added sin borrar las de los compañeros.

Usa archivos concretos del diff como evidencia de la evaluación.
{{/rubric}}

---

## Actividad 6 — Code review

El artículo recomienda que los Pull Request faciliten la **conversación y el aprendizaje**, no solo la fusión de código: revisar **corrección, diseño, seguridad, pruebas y mantenibilidad**, y comentar **el código, no a la persona**.

### Quién revisa a quién

| Autor | Revisor |
|---|---|
| Estudiante 1 | Estudiante 2 |
| Estudiante 2 | Estudiante 3 |
| Estudiante 3 | Estudiante 4 |
| Estudiante 4 | Estudiante 1 |

### Como revisor

En la pestaña **Files changed** del PR de tu compañero:

1. Deja **al menos un comentario en una línea concreta** del código (icono `+` junto al número de línea). Debe ser un comentario constructivo: una pregunta, una sugerencia o un posible caso borde.
2. Pide **un cambio pequeño y concreto** (por ejemplo, un nombre más claro, un caso borde sin probar o un mensaje de commit mejorable).
3. Envía la revisión con **Request changes**.
4. Cuando el autor lo corrija, vuelve a revisar y pulsa **Approve**.

Revisa también la salida del CI y si la historia del PR es limpia.

### Como autor: aplicar la corrección con `fixup` y `--autosquash`

No agregues un commit llamado «arreglo review». Aplica la corrección **dentro del commit que corresponde**:

```bash
# 1. Haz el cambio pedido y prepáralo
git add -p

# 2. Crea un commit "fixup" apuntando al commit original que debe corregirse
git log --oneline origin/develop..HEAD          # copia el hash del commit objetivo
git commit --fixup <hash-del-commit-objetivo>

# 3. Fusiona automáticamente el fixup en su commit
git rebase -i --autosquash origin/develop       # solo guarda y cierra el editor

# 4. Prueba y publica
npm test
git push --force-with-lease origin feature/TU-RAMA
```

Pega en la respuesta:

1. la URL de **la revisión que tú hiciste** al PR de tu compañero (el enlace al comentario o a la revisión);
2. qué comentaste y qué cambio pediste;
3. qué cambio te pidieron a ti y la salida de `git log --oneline origin/develop..HEAD` **después** del `--autosquash` (demostrando que no quedó ningún commit `fixup!`).

{{answer
  id="code-review"
  type="textarea"
  points="4"
  evaluator="ai"
  placeholder="URL de tu review, qué comentaste, qué te pidieron y el log tras --autosquash..."
}}

{{rubric for="code-review"}}
Debe incluir un enlace a una revisión/comentario real en el PR de un compañero.

El comentario debe ser constructivo, específico (una línea o caso concreto) y centrado en el código.

Debe mostrar que el cambio recibido se aplicó con git commit --fixup y git rebase -i --autosquash, sin commits fixup! restantes ni commits tipo «arreglo review».

Debe mencionar el uso de --force-with-lease para publicar.
{{/rubric}}

---

## Actividad 7 — Primeros auxilios con Git (sandbox)

Esta actividad es **individual** y se hace mientras esperas tu turno. El proyecto incluye un generador de escenarios de práctica en repositorios desechables (carpeta `.sandbox/`, ignorada por Git).

```bash
npm run sandbox -- list
```

Haz estos **cuatro** escenarios. Cada uno imprime una historia y una misión. Al terminar, valida con `npm run sandbox -- <escenario> check`.

### 7.1 `reflog` — «Perdí mis commits»

```bash
npm run sandbox -- reflog
```

Un `git reset --hard` dejó commits huérfanos. Usa `git reflog` para encontrarlos y crea una rama `rescued`. Al resolverlo, el comando `check` imprimirá un **TOKEN**. Cópialo.

> Del artículo: *«el reflog permite recuperar estados anteriores; es muy difícil perder datos en Git»*.

### 7.2 `cherry-pick` — «Solo quiero ese arreglo»

```bash
npm run sandbox -- cherry-pick
```

Trae **un único commit** de la rama `experimental` a `main` con `git cherry-pick -x`.

### 7.3 `stash` — «Interrupción urgente»

```bash
npm run sandbox -- stash
```

Guarda tu trabajo a medias con `git stash push -u`, corrige el hotfix del README en otra rama y recupera tu trabajo con `git stash pop`.

### 7.4 `onto` — «Mi rama quedó colgada de otra»

```bash
npm run sandbox -- onto
```

La rama `feature-a` ya se integró con *squash*; `feature-b` nació de ella. Muévela con `git rebase --onto main feature-a feature-b`.

### Entregable

Pega en la respuesta:

1. la salida de `npm run sandbox -- reflog check`, **incluyendo el TOKEN**;
2. la salida de `git reflog` que usaste para encontrar el commit perdido;
3. las salidas de `check` de los otros tres escenarios;
4. para cada herramienta (`reflog`, `cherry-pick`, `stash`, `rebase --onto`), **una frase** explicando en qué situación real de un equipo la usarías.

{{answer
  id="first-aid"
  type="textarea"
  points="10"
  evaluator="ai"
  placeholder="Pega las salidas de check de los 4 escenarios, el reflog, el TOKEN y tus explicaciones..."
}}

{{rubric for="first-aid"}}
Debe incluir los cuatro escenarios con todas las comprobaciones en ✓ (reflog, cherry-pick, stash, onto).

Debe incluir el TOKEN generado por el escenario reflog (formato TOKEN-XXXXXX) y fragmentos reales de git reflog.

Explicaciones esperadas:
- reflog: recuperar commits tras reset --hard, rebase o borrado de ramas;
- cherry-pick: llevar un único arreglo (por ejemplo un hotfix) sin traer el resto de la rama;
- stash: guardar trabajo no commiteado para atender una interrupción sin crear commits wip;
- rebase --onto: mover una rama que dependía de otra ya integrada (especialmente con squash merge) sin duplicar commits.

Dos puntos por escenario aprobado y dos por la calidad de las explicaciones.
{{/rubric}}

---

## Actividad 8 — Historial integrado y estrategias de merge

Cuando las **cuatro** features estén en `develop`, actualiza tu copia y genera el gráfico del historial:

```bash
git fetch origin
git switch develop
git pull
git log --graph --oneline --decorate -n 30
```

Debes ver cuatro commits de merge, uno por feature, y cada rama con sus commits **en línea recta** (porque se rebaseó antes de integrar).

El artículo describe **cuatro estrategias de merge**:

| Estrategia | Resultado en el historial |
|---|---|
| **Merge commit** (`--no-ff`) | Preserva el contexto completo: se ve qué commits pertenecían a qué feature |
| **Squash merge** | Un solo commit por PR; la historia queda muy limpia pero se pierden los commits originales |
| **Fast-forward** | Historia lineal cuando la rama destino no avanzó |
| **Rebase + fast-forward** | Historia lineal conservando los commits individuales |

Pega en la respuesta:

1. la salida de tu `git log --graph --oneline --decorate -n 30`;
2. una explicación de **por qué** usamos merge commit para integrar las features (y no squash);
3. cómo se vería **este mismo historial** si se hubiera usado squash merge, y qué se habría perdido;
4. cuándo **sí** usarías squash o rebase + fast-forward en un proyecto real.

{{answer
  id="history-and-merge-strategies"
  type="textarea"
  points="6"
  evaluator="ai"
  placeholder="Pega el grafo y compara merge commit, squash, fast-forward y rebase + fast-forward con ejemplos de este laboratorio..."
}}

{{rubric for="history-and-merge-strategies"}}
Debe incluir un grafo real con cuatro commits de merge (Merge pull request ... feature/discounts, tax, currency, receipt) y ramas con commits lineales.

Debe explicar que el merge commit preserva el agrupamiento por feature y la trazabilidad (se puede revertir una feature completa con un solo git revert -m 1).

Debe describir correctamente squash: un único commit por feature en develop, perdiendo atomicidad (feat/test/docs) y el rastro de la rama.

Debe dar un caso razonable para squash (ramas con muchos commits de ruido, equipos que priorizan un historial simple) y para rebase + fast-forward (historia estrictamente lineal, proyectos con trunk-based).

Valorar que relacione con el escenario onto del sandbox (squash obliga a rebase --onto en ramas dependientes).
{{/rubric}}

---

## Actividad 9 — Release 1.1.0

> **GitFlow:** una rama `release/*` nace de `develop`, **solo admite correcciones y preparación de versión** (nada de features nuevas), y termina fusionada en `main` **y** en `develop`.

### Versionado Semántico

El artículo explica `MAJOR.MINOR.PATCH`:

| Parte | Cuándo sube | Ejemplo |
|---|---|---|
| `MAJOR` | cambios que **rompen** la compatibilidad | `1.x.x → 2.0.0` |
| `MINOR` | funcionalidad **nueva compatible** | `1.0.0 → 1.1.0` |
| `PATCH` | corrección **compatible** de errores | `1.1.0 → 1.1.1` |

Nuestras cuatro features agregan funciones sin romper las existentes, así que el release es **`1.1.0`**.

### Reparto de roles

| Quién | Qué hace |
|---|---|
| **Estudiante 1** (Release Manager) | Crea la rama `release/1.1.0`, abre el PR hacia `main` y crea el tag |
| Cualquier otro | Revisa y aprueba el PR del release |
| **Estudiante 3** | Hace el back-merge `main → develop` |

### Paso a paso (Estudiante 1)

Primero verifica que `develop` tenga las cuatro features y que `npm test` pase:

```bash
git fetch origin
git switch develop
git pull
npm test
```

Crea la rama del release:

```bash
git switch -c release/1.1.0
```

En esa rama:

1. cambia `"version"` en `package.json` a `"1.1.0"`;
2. en `CHANGELOG.md`, **mueve** las viñetas de `[Unreleased]` a una nueva sección `## [1.1.0] - AAAA-MM-DD` (deja `[Unreleased]` vacía);
3. comitea:

```bash
npm test
git commit -am "chore(release): prepara la versión 1.1.0"
git push -u origin release/1.1.0
```

Abre un PR **`release/1.1.0` → `main`** en el fork. Cuando esté aprobado e integrado con **Create a merge commit**, crea el **tag anotado** sobre `main`:

```bash
git fetch origin
git switch main
git pull --ff-only
git tag -a v1.1.0 -m "Release 1.1.0"
git push origin v1.1.0
git show v1.1.0
```

> Un tag **anotado** guarda autor, fecha y mensaje. Un tag *ligero* es solo un puntero. Para versiones publicadas usa siempre `-a`.

### Back-merge (Estudiante 3)

`main` ahora tiene un commit (el merge del release) que `develop` no tiene. Si no se devuelve, el próximo release volverá a pelear con ese cambio. Abre un PR **`main` → `develop`** con el título `chore: back-merge release 1.1.0` e intégralo con merge commit.

Tras el back-merge, **todos** actualizan su copia:

```bash
git fetch origin --tags
git switch develop && git pull
git switch main && git pull
```

### Entregable

Pega en la respuesta:

1. la URL del PR del release y la del PR del back-merge;
2. la salida de `git show v1.1.0 --stat` (se debe ver que es un tag **anotado** con tagger y mensaje);
3. el contenido de la sección `## [1.1.0]` de `CHANGELOG.md` en `main`;
4. una explicación: ¿por qué `1.1.0` y no `2.0.0` ni `1.0.1`? ¿por qué el release se fusiona en `main` **y** en `develop`?

{{answer
  id="release"
  type="textarea"
  points="8"
  evaluator="ai"
  placeholder="URLs de los PR, salida de git show v1.1.0, sección del CHANGELOG y tu explicación de SemVer..."
}}

{{rubric for="release"}}
Debe incluir URL de un PR release/1.1.0 → main y un PR main → develop (back-merge) en el fork del equipo.

git show v1.1.0 debe evidenciar un tag anotado (Tagger, fecha y mensaje), no un tag ligero.

El CHANGELOG de main debe tener ## [1.1.0] con las cuatro features y [Unreleased] vacía.

Debe justificar con SemVer: MINOR por funcionalidad nueva compatible (no MAJOR porque no se rompió compatibilidad; no PATCH porque hay features).

Debe explicar el doble merge: main refleja lo liberado; develop debe recibir los cambios hechos en el release (versión, changelog, correcciones) para que no se pierdan.
{{/rubric}}

---

## Actividad 10 — Hotfix 1.1.1 y back-merge

> **GitFlow:** un `hotfix/*` nace de **`main`** (no de `develop`, que puede tener trabajo sin liberar), corrige un problema urgente en producción y termina fusionado en `main` **y** en `develop`.

### El reporte del bug

Llega un correo de soporte:

> «Desde que instalamos la versión 1.1.0, buscar `laptop` en la CLI dice *Sin resultados*, pero buscar `Laptop` sí funciona. La documentación dice que la búsqueda no distingue mayúsculas.»

Compruébalo:

```bash
git switch main && git pull
npm start -- search laptop       # Sin resultados  ← el bug
npm start -- search Laptop       # LAP-001  Laptop Pro 14
```

### Reparto de roles

| Quién | Qué hace |
|---|---|
| **Estudiante 2** | Crea `hotfix/1.1.1`, corrige, abre el PR hacia `main` y crea el tag |
| Cualquier otro | Revisa y aprueba el PR |
| **Estudiante 4** | Hace el back-merge `main → develop` |

### Paso a paso (Estudiante 2)

```bash
git switch main && git pull --ff-only
git switch -c hotfix/1.1.1
```

Sigue el ciclo profesional **primero la prueba, después el arreglo**:

1. En `test/catalog.test.js` agrega una prueba que **falle** con el bug (`searchProducts('laptop')` debe devolver 1 producto). Ejecuta `npm test` y comprueba que falla.
2. Corrige `src/catalog.js` (pista: compara en minúsculas ambos lados).
3. Ejecuta `npm test` y comprueba que pasa.
4. Haz **dos commits atómicos** (usa `git add -p` si hace falta):

```bash
git commit -m "fix(catalog): búsqueda sin distinguir mayúsculas"
git commit -m "test(catalog): cubre búsqueda en minúsculas"
```

5. Sube la versión a `1.1.1` en `package.json` y agrega al `CHANGELOG.md` una sección arriba de la `[1.1.0]`:

```text
## [1.1.1] - AAAA-MM-DD

### Fixed
- La búsqueda de productos ya no distingue mayúsculas de minúsculas.
```

```bash
git commit -am "chore(release): prepara la versión 1.1.1"
git push -u origin hotfix/1.1.1
```

Abre el PR **`hotfix/1.1.1` → `main`**, intégralo con merge commit y crea el tag:

```bash
git switch main && git pull --ff-only
git tag -a v1.1.1 -m "Hotfix 1.1.1: búsqueda sin distinguir mayúsculas"
git push origin v1.1.1
```

### Back-merge (Estudiante 4)

Abre un PR **`main` → `develop`** con el título `chore: back-merge hotfix 1.1.1` e intégralo con merge commit. Sin este paso, el bug **reaparecería** en el próximo release, porque `develop` nunca recibió la corrección.

Cuando termine, todos actualizan y ejecutan:

```bash
git fetch origin --tags
git switch develop && git pull
npm test
npm start -- search laptop       # ahora debe devolver LAP-001
git log --graph --oneline --decorate -n 25
```

### Comparación con `cherry-pick`

Podrías haber copiado solo el commit del fix a `develop` con `git cherry-pick -x <hash>`. En un hotfix real también se cambia la versión y el changelog, y el equipo quiere que `develop` herede **toda la historia del hotfix**, así que el back-merge es más seguro. Cherry-pick es ideal cuando solo quieres **ese** commit y nada más (como en el escenario del sandbox).

### Entregable

Pega en la respuesta:

1. las URL de los PR del hotfix y del back-merge;
2. la salida de `git log --graph --oneline --decorate -n 25` mostrando los tags `v1.1.0` y `v1.1.1` y ambos merges;
3. el output de `npm start -- search laptop` en tu `develop` actualizado;
4. una explicación: ¿qué habría pasado si el hotfix hubiera nacido de `develop` en lugar de `main`? ¿y si nadie hubiera hecho el back-merge?

{{answer
  id="hotfix"
  type="textarea"
  points="8"
  evaluator="ai"
  placeholder="URLs de los PR, grafo con los tags, resultado de la búsqueda y tu explicación..."
}}

{{rubric for="hotfix"}}
Debe incluir URLs de un PR hotfix/1.1.1 → main y de un PR main → develop.

El grafo debe mostrar v1.1.0 y v1.1.1, el merge del hotfix en main y el back-merge en develop.

La búsqueda en minúsculas debe devolver LAP-001 en develop.

Debe explicar:
- si el hotfix naciera de develop, arrastraría trabajo no liberado (features incompletas) hacia producción;
- sin back-merge, el bug se perdería en main pero seguiría existiendo en develop y reaparecería en el siguiente release.

Valorar que mencione el patrón «prueba que falla primero, luego el arreglo» y el bump de PATCH (1.1.1) según SemVer.
{{/rubric}}

---

## Actividad 11 — Autoverificación

El proyecto incluye un script que revisa el estado de tu fork y muestra un checklist: ramas, merges con `--no-ff`, historia lineal en cada feature, Conventional Commits, orden de integración, regla de negocio descuento → impuesto, tags anotados, `CHANGELOG`, hotfix y back-merges.

```bash
git fetch origin --tags
git switch develop
git pull
npm run verify
```

Cada línea con ✗ trae una pista de cómo corregirla. **No** se evalúa con este script: es una guía para que llegues a la entrega con todo en orden.

Pega la salida completa de `npm run verify` de tu máquina.

{{answer
  id="verify-output"
  type="textarea"
  points="3"
  evaluator="ai"
  placeholder="Pega aquí la salida completa de npm run verify..."
}}

{{rubric for="verify-output"}}
La salida debe corresponder a un fork con las secciones 1 a 6 evaluadas.

Otorgar el puntaje completo si todas las comprobaciones están en ✓.

Si quedan ✗, otorgar proporcionalmente según el porcentaje de comprobaciones superadas, y descontar si el estudiante no menciona qué falta ni por qué.
{{/rubric}}

---

## Actividad 12 — Reflexión final

Responde con tus propias palabras, usando **ejemplos de lo que viviste en este laboratorio**:

1. **Reescribir historia.** ¿Por qué `git rebase` es seguro en tu `feature/*` pero peligroso en `develop`? ¿Qué diferencia hay entre `git push --force` y `git push --force-with-lease`? ¿Qué le habría pasado a un compañero si hubieras reescrito `develop`?
2. **Conflictos.** El conflicto semántico del Estudiante 4 no lo detectó Git, sino las pruebas. ¿Qué herramienta del artículo (CI, protección de ramas, *merge queue*) lo habría detectado **antes** de integrar, y cómo?
3. **Elección de flujo.** Si tu equipo desplegara a producción diez veces al día, ¿seguirías usando GitFlow? ¿Qué cambiarías?
4. **Errores comunes.** Menciona dos de los «errores típicos» del artículo (ramas largas, mensajes sin sentido, force push en ramas compartidas, PR gigantes, desactivar protecciones «solo por esta vez») que este laboratorio te mostró cómo evitar y qué práctica concreta los evita.

{{answer
  id="final-reflection"
  type="textarea"
  points="4"
  evaluator="ai"
  placeholder="Responde las cuatro preguntas con ejemplos concretos del laboratorio..."
}}

{{rubric for="final-reflection"}}
1. Rebase reescribe commits; en una rama personal nadie depende de ellos, en develop sí. --force pisa cambios remotos sin verificar; --force-with-lease solo si el remoto coincide con lo que el estudiante conoce. Reescribir develop obligaría a los compañeros a reconciliar historias divergentes y podría perder commits.

2. Una merge queue (o CI que pruebe la combinación con el estado real de la rama destino) habría ejecutado las pruebas del PR sobre develop actualizado y detectado el fallo antes de integrar. También se acepta CI obligatorio con la rama actualizada (require branches to be up to date).

3. Debe reconocer que GitFlow es pesado para despliegue continuo; proponer GitHub Flow o Trunk-Based con ramas muy cortas, feature flags y CI sólido.

4. Debe elegir al menos dos errores del artículo y conectarlos con prácticas concretas del laboratorio (rebase frecuente, commits atómicos y Conventional Commits, PR pequeños, protecciones de rama, --force-with-lease).

Valorar ejemplos propios y no frases copiadas.
{{/rubric}}

---

## Evaluación

| Actividad | Puntos |
|---|---:|
| 1. GitFlow en tus propias palabras | 6 |
| 2. Equipo y entorno | 4 |
| 3. Commits atómicos y limpieza de historia | 8 |
| 4. Rebase, conflictos y `rerere` (explicación 8 + código 6) | 14 |
| 5. Pull Request de tu feature | 25 |
| 6. Code review | 4 |
| 7. Primeros auxilios (sandbox) | 10 |
| 8. Historial integrado y estrategias de merge | 6 |
| 9. Release 1.1.0 | 8 |
| 10. Hotfix 1.1.1 y back-merge | 8 |
| 11. Autoverificación | 3 |
| 12. Reflexión final | 4 |
| **TOTAL** | **100** |

---

## Idea principal

Git no es un lugar donde se guardan archivos: es el **registro de las decisiones técnicas** de un equipo.

Un historial profesional cumple tres cosas:

1. **Cada commit cuenta una sola historia** y explica el porqué.
2. **Cada rama vive poco** y se integra con frecuencia, porque integrar tarde cuesta más.
3. **Cada versión es reproducible**: tiene un tag, un changelog y un número que comunica su impacto.

Antes de este laboratorio, tu historia habría sido:

```text
wip → tests → fix typo → arreglo → docs → arreglo review → Merge branch 'develop' into ...
```

Después:

```text
feat(tax): agrega impuesto IVA 13%
test(tax): prueba impuesto
docs(tax): documenta impuesto en el changelog
          └── integrados en develop con un único merge commit trazable
```

Y el equipo completo avanzó así:

```text
feature/* ──► develop ──► release/1.1.0 ──► main ──► tag v1.1.0
                 ▲                           │
                 └──── back-merge ◄──────────┤
                                             ▼
                             hotfix/1.1.1 ──► main ──► tag v1.1.1
                                   └─────────► back-merge a develop
```
