#!/usr/bin/env node
/**
 * Pre-commit guard contra imports huérfanos.
 *
 * Verifica que todos los imports (estáticos y dinámicos) de archivos staged
 * apunten a algo que existe en el git index (ya committed o también staged).
 * Si un archivo staged importa un módulo que solo vive en el working tree
 * como untracked, aborta el commit.
 *
 * Por qué: 12 agentes paralelos tocan el mismo working tree. Cada uno ve
 * archivos untracked de otros como si fueran "parte del repo". Los imports
 * viajan a main antes que los archivos referenciados → Vercel clone no los
 * tiene → build rompe. Ya pasó 4 veces en 72h. Este hook corta el patrón.
 *
 * Ver `docs/memory/gotcha_cruces_estructurales_recurrentes.md §8`.
 *
 * Bypass de emergencia: `git commit --no-verify` (solo si sabes lo que haces).
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
const ALL_EXTENSIONS = [...CODE_EXTENSIONS, '.json'];

// Import statements (estático) y dynamic import().
// Cubre:
//   import X from '...'
//   import { X } from '...'
//   import type { X } from '...'
//   import '...'
//   export { X } from '...'
//   export * from '...'
//   import('...')
const STATIC_IMPORT_RE =
  /(?:import\s+(?:type\s+)?(?:[\w*{}\s,]+\s+from\s+)?|export\s+(?:type\s+)?(?:\*|\{[^}]*\})\s+from\s+)['"]([^'"]+)['"]/g;
const DYNAMIC_IMPORT_RE = /import\(\s*['"]([^'"]+)['"]\s*\)/g;

function sh(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
}

function stagedCodeFiles() {
  // ACMR = Added, Copied, Modified, Renamed. No include deleted.
  const out = sh('git diff --cached --name-only --diff-filter=ACMR');
  return out
    .split('\n')
    .filter(Boolean)
    .filter((f) => CODE_EXTENSIONS.some((ext) => f.endsWith(ext)));
}

function indexedFiles() {
  // `git ls-files` devuelve HEAD + cualquier archivo staged (add/mod).
  // No incluye untracked ni deleted staged.
  const out = sh('git ls-files');
  return new Set(out.split('\n').filter(Boolean));
}

function extractImports(absPath) {
  let content;
  try {
    content = readFileSync(absPath, 'utf8');
  } catch {
    return [];
  }
  const out = [];
  let m;
  STATIC_IMPORT_RE.lastIndex = 0;
  while ((m = STATIC_IMPORT_RE.exec(content)) !== null) out.push(m[1]);
  DYNAMIC_IMPORT_RE.lastIndex = 0;
  while ((m = DYNAMIC_IMPORT_RE.exec(content)) !== null) out.push(m[1]);
  return out;
}

function toRel(absPath) {
  const prefix = ROOT + '/';
  return absPath.startsWith(prefix) ? absPath.slice(prefix.length) : absPath;
}

/**
 * Resuelve un import a un path absoluto candidato. Devuelve:
 *   { kind: 'external' }        → npm package, skip
 *   { kind: 'resolved', path }  → existe en el git index
 *   { kind: 'local_only', candidates } → existe solo en working tree untracked
 *   { kind: 'missing', candidates }    → no existe ni en disk ni en index
 */
function resolveImport(importPath, fromAbsFile, indexed) {
  // Externos (npm, node:). No tocamos.
  if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
    return { kind: 'external' };
  }

  let basePath;
  if (importPath.startsWith('@/')) {
    basePath = resolve(ROOT, importPath.slice(2));
  } else {
    basePath = resolve(dirname(fromAbsFile), importPath);
  }

  // Candidatos en orden de resolución de Node/TS:
  //   <path>           (si tiene extensión ya)
  //   <path>.ts/.tsx/.js/.jsx/.mjs/.cjs
  //   <path>/index.ts/.tsx/.js/...
  //   <path>.json (imports de data)
  const candidates = [
    basePath,
    ...ALL_EXTENSIONS.map((ext) => basePath + ext),
    ...CODE_EXTENSIONS.map((ext) => join(basePath, 'index' + ext)),
  ];

  // ¿Está en el git index?
  for (const c of candidates) {
    const rel = toRel(c);
    if (!rel) continue;
    if (indexed.has(rel)) {
      return { kind: 'resolved', path: rel };
    }
  }

  // ¿Existe en disk pero no en index? → huérfano.
  for (const c of candidates) {
    try {
      if (existsSync(c) && !statSync(c).isDirectory()) {
        return { kind: 'local_only', candidates: candidates.slice(0, 3).map(toRel) };
      }
    } catch {
      // ignore
    }
  }

  return { kind: 'missing', candidates: candidates.slice(0, 3).map(toRel) };
}

// ─── main ────────────────────────────────────────────────────────────────

const staged = stagedCodeFiles();
if (staged.length === 0) {
  process.exit(0);
}

const indexed = indexedFiles();
const violations = [];

for (const file of staged) {
  const absFile = resolve(ROOT, file);
  const imports = extractImports(absFile);
  for (const imp of imports) {
    const result = resolveImport(imp, absFile, indexed);
    if (result.kind === 'local_only' || result.kind === 'missing') {
      violations.push({ file, imp, result });
    }
  }
}

if (violations.length === 0) {
  process.exit(0);
}

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

console.error('');
console.error(`${RED}${BOLD}✗ Pre-commit rechazado: imports huérfanos${RESET}`);
console.error('');
console.error(
  `${YELLOW}Los siguientes archivos staged importan módulos que no están en el git index:${RESET}`,
);
console.error('');

for (const v of violations) {
  console.error(`  ${CYAN}${v.file}${RESET}`);
  console.error(`    → ${BOLD}${v.imp}${RESET}`);
  if (v.result.kind === 'local_only') {
    console.error(
      `    ${DIM}(existe untracked en disco — \`git add\` el archivo o pide al owner que lo commitee)${RESET}`,
    );
  } else {
    console.error(`    ${DIM}(no existe — revisa el import path o crea el archivo)${RESET}`);
  }
  console.error('');
}

console.error(`${YELLOW}Contexto:${RESET}`);
console.error(
  `  Este hook existe porque Vercel clona desde GitHub y no ve archivos untracked.`,
);
console.error(
  `  Commitear un import a un módulo untracked rompe el build (ver docs/memory/`,
);
console.error(`  gotcha_cruces_estructurales_recurrentes.md §8).`);
console.error('');
console.error(`${YELLOW}Bypass (solo si sabes lo que haces):${RESET}`);
console.error(`  git commit --no-verify`);
console.error('');

process.exit(1);
