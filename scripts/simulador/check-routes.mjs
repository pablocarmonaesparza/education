#!/usr/bin/env node

/**
 * check-routes — gate de drift entre el código y FRONT_CONTRACT (R-21).
 *
 * Compara cada `app/**​/page.tsx` real contra las rutas nombradas en
 * docs/simulador/front/FRONT_CONTRACT.md. Si aparece una página que el
 * contrato no menciona (o el contrato nombra una productiva que ya no existe),
 * falla. Así el contrato deja de ser un doc que se desincroniza en silencio:
 * agregar/quitar una pantalla obliga a tocar el contrato en el mismo PR.
 *
 * Normalización: los grupos de rutas `(app)` se quitan; los params dinámicos
 * `[case_id]`/`[slug]`/`[token]` se colapsan a `[]` en ambos lados (el nombre
 * del param no importa, solo la posición).
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, "app");
const CONTRACT = path.join(
  ROOT,
  "docs/simulador/front/FRONT_CONTRACT.md",
);

function fail(lines) {
  for (const l of lines) console.error(`check-routes: ${l}`);
  process.exit(1);
}

/** file path de una page.tsx → ruta URL normalizada. */
function fileToRoute(file) {
  const rel = path.relative(APP_DIR, path.dirname(file));
  const segments = rel
    .split(path.sep)
    .filter((s) => s && !/^\(.*\)$/.test(s)) // quita route groups (app)/(onboarding)
    .map((s) => s.replace(/\[[^\]]+\]/g, "[]")); // params → []
  return "/" + segments.join("/");
}

/** Recorre app/ y junta todas las page.tsx. */
function collectPages(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Saltar node_modules o assets si existieran bajo app.
      collectPages(full, out);
    } else if (entry.name === "page.tsx") {
      out.push(full);
    }
  }
  return out;
}

function normalizeRoute(route) {
  let r = route.trim().replace(/\/+$/, ""); // sin trailing slash
  r = r.replace(/\[[^\]]+\]/g, "[]");
  return r === "" ? "/" : r;
}

// 1. Rutas reales.
const actualRoutes = new Set(
  collectPages(APP_DIR).map(fileToRoute).map(normalizeRoute),
);

// 2. Rutas nombradas en el contrato (cualquier code span `/...`).
const contractText = fs.readFileSync(CONTRACT, "utf8");
const mentioned = new Set();
for (const m of contractText.matchAll(/`(\/[^`]*)`/g)) {
  // Un span puede traer varias rutas separadas por coma dentro del backtick.
  for (const piece of m[1].split(/[,\s]+/)) {
    if (piece.startsWith("/")) mentioned.add(normalizeRoute(piece));
  }
}

// 3. Drift: páginas reales que el contrato no menciona.
const undocumented = [...actualRoutes].filter((r) => !mentioned.has(r)).sort();

if (undocumented.length > 0) {
  fail([
    `${undocumented.length} página(s) existen en app/ pero NO están en FRONT_CONTRACT.md:`,
    ...undocumented.map((r) => `  ${r}`),
    "",
    "Agrégalas a la tabla de rutas del contrato (o su sección dev-only/prohibida)",
    "en el mismo cambio. El contrato es la fuente única de rutas (R-21).",
  ]);
}

console.log(
  `routes OK (${actualRoutes.size} páginas, todas en FRONT_CONTRACT)`,
);
