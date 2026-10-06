# Guía rápida de comandos — Laboratorio 3

Hoja de consulta para el laboratorio [`laboratorio-03-git-flow.md`](laboratorio-03-git-flow.md).

## Ver el estado y la historia

```bash
git status
git log --oneline --graph --decorate --all     # el mapa completo
git log --oneline origin/develop..HEAD         # solo MIS commits sobre develop
git log --oneline HEAD..origin/develop         # lo que develop tiene y yo no
git diff --staged                              # lo que irá en el próximo commit
git show <hash>                                # un commit o un tag
```

## Ramas y remoto

```bash
git fetch origin                               # trae novedades sin tocar tu trabajo
git switch -c feature/x origin/develop         # crea una rama desde develop
git push -u origin feature/x                   # publica y enlaza la rama
git push --force-with-lease origin feature/x   # reescritura SEGURA de tu rama
git pull --ff-only                             # actualiza sin crear merges sorpresa
```

## Commits atómicos

```bash
git add -p [archivo]       # y = sí · n = no · s = dividir · e = editar · q = salir
git commit -m "feat(alcance): descripción en imperativo"
git commit --amend         # corrige el ÚLTIMO commit (solo si no lo has publicado)
```

### Conventional Commits

```text
tipo(alcance): descripción
```

| Tipo | Úsalo para |
|---|---|
| `feat` | funcionalidad nueva |
| `fix` | corrección de un error |
| `docs` | documentación / changelog |
| `test` | pruebas |
| `refactor` | cambiar código sin cambiar comportamiento |
| `chore` | tareas de mantenimiento (versión, configuración) |
| `ci`, `build`, `perf`, `style`, `revert` | según corresponda |

## Rebase

```bash
git rebase origin/develop       # re-aplica tus commits sobre develop
git rebase -i origin/develop    # edita tu historia (pick/reword/squash/fixup/drop)
git rebase --continue           # tras resolver un conflicto y hacer git add
git rebase --abort              # cancela todo
git rebase --onto <nueva-base> <base-vieja> <rama>
git commit --fixup <hash>       # prepara una corrección para un commit anterior
git rebase -i --autosquash origin/develop
```

### Resolver un conflicto

```text
<<<<<<< HEAD              ← lo que ya está en develop (en rebase: "ours")
=======
>>>>>>> abc123 (mi commit) ← mi commit que se re-aplica (en rebase: "theirs")
```

1. `git status` → lista de archivos en conflicto.
2. Edita el archivo, conserva ambas intenciones y borra los marcadores.
3. `git add <archivo>` → `git rebase --continue`.
4. **`npm test`** al terminar (puede haber conflictos que Git no vio).

```bash
git config rerere.enabled true      # recuerda tus resoluciones
git reset --hard ORIG_HEAD          # deshace un rebase recién terminado
```

## Rescate y herramientas de emergencia

```bash
git reflog                           # diario de TODO lo que movió HEAD
git branch rescued <hash>            # salva un commit "perdido"
git stash push -u -m "mensaje"       # guarda trabajo sin commitear (-u incluye archivos nuevos)
git stash list
git stash pop                        # recupera y borra el stash
git cherry-pick -x <hash>            # copia UN commit a la rama actual
```

## Release, tags y hotfix

```bash
git switch -c release/1.1.0                 # estando en develop actualizado
git switch -c hotfix/1.1.1 main            # el hotfix SIEMPRE nace de main
git tag -a v1.1.0 -m "Release 1.1.0"       # tag ANOTADO
git push origin v1.1.0
git tag -n                                  # lista tags con su mensaje
git merge --no-ff <rama>                    # merge con commit (así lo hace GitHub: "Create a merge commit")
```

### Versionado Semántico

`MAJOR.MINOR.PATCH` → **MAJOR** rompe compatibilidad · **MINOR** agrega funciones compatibles · **PATCH** corrige errores.

## Scripts del proyecto

```bash
npm test                                      # pruebas
npm run check:commits -- origin/develop..HEAD # valida Conventional Commits
npm run sandbox -- list                       # escenarios de primeros auxilios
npm run verify                                # checklist del laboratorio
```

## Reglas de oro (del artículo)

- **Nunca** reescribas commits de los que otros dependen.
- Usa `--force-with-lease`, nunca `--force`.
- Ramas cortas, PR pequeños, commits que expliquen el **porqué**.
- No desactives las protecciones de rama «solo por esta vez».
