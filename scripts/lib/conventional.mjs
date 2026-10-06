// Reglas de Conventional Commits usadas por `check-commits` (CI) y `verify-lab`.

export const TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
];

const CONVENTIONAL = new RegExp(`^(${TYPES.join('|')})(\\([a-z0-9-]+\\))?!?: \\S.{2,}$`);
const NOISE = /^(wip|fixup!|squash!|amend!|oops|fix typo|arreglo|cambios|update|prueba)\b/i;

/**
 * Valida el asunto (primera línea) de un commit.
 *
 * @param {string} subject
 * @returns {string | null} Motivo del rechazo, o null si es válido.
 */
export function validateSubject(subject) {
  if (NOISE.test(subject)) {
    return 'es un commit "ruidoso" (wip/fixup/oops...): límpialo con `git rebase -i`';
  }
  if (!CONVENTIONAL.test(subject)) {
    return 'no sigue Conventional Commits: `tipo(alcance): descripción`';
  }
  if (subject.length > 72) {
    return 'el asunto supera los 72 caracteres';
  }
  return null;
}
