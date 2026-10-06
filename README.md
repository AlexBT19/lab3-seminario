# Mini Tienda — Laboratorio 3: Git avanzado y GitFlow

Proyecto base del **Laboratorio 3** del Seminario de Sistemas. El código es pequeño a propósito:
lo importante no es la tienda, sino **cómo cuatro personas integran sus cambios sin pisarse**
usando GitFlow, rebase, Pull Requests, releases y hotfixes.

> Las instrucciones completas están en [`lab/laboratorio-03-git-flow.md`](lab/laboratorio-03-git-flow.md).
> Una hoja de comandos de apoyo está en [`lab/guia-comandos.md`](lab/guia-comandos.md).

## Requisitos

- Git 2.30 o superior
- Node.js 20 o superior (no hay dependencias que instalar)

```bash
node --version
git --version
npm test
```

## Estructura

```text
src/
  catalog.js     catálogo de productos y búsqueda
  money.js       utilidades de montos (round2)
  pricing.js     cálculo del total del carrito
  format.js      formato de precios
  index.js       barrel: reexporta todos los módulos
  cli.js         CLI: list, search (y receipt, que agregará el Estudiante 4)
test/            pruebas con node:test
scripts/
  verify-lab.mjs     autoverificación del laboratorio  (npm run verify)
  check-commits.mjs  valida Conventional Commits       (npm run check:commits)
  sandbox.mjs        escenarios de práctica            (npm run sandbox -- list)
lab/             instrucciones del laboratorio
.github/         CI y plantilla de Pull Request
```

## Comandos útiles

```bash
npm test                                   # ejecuta las pruebas
npm start -- list                          # lista productos
npm start -- search laptop                 # busca productos
npm run check:commits -- origin/develop..HEAD   # valida tus mensajes de commit
npm run verify                             # checklist del laboratorio
npm run sandbox -- list                    # escenarios de primeros auxilios
```

## Ramas (GitFlow)

| Rama | Rol |
|---|---|
| `main` | Código en producción. Cada commit de merge es un release o un hotfix, con tag. |
| `develop` | Rama de integración: aquí se juntan todas las features. |
| `feature/*` | Una rama por tarea, nace de `develop` y vuelve a `develop`. |
| `release/*` | Preparación de una versión: nace de `develop`, termina en `main` y `develop`. |
| `hotfix/*` | Corrección urgente: nace de `main`, termina en `main` y `develop`. |
