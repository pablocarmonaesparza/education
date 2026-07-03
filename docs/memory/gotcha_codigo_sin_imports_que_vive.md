---
type: gotcha
title: codigo "sin imports" que sí está vivo — falsos positivos de knip/grep
date: 2026-06-12
tags: [refactor, knip, dead-code, deps]
dept: [desarrollo]
---

En este repo hay cuatro clases de código que knip/depcheck/grep reportan como "unused" pero están vivas. Borrarlas rompe build o tooling:

1. `lib/simulador/analytics.ts` — ningún runtime lo importa, pero `scripts/simulador/check-analytics-catalog.mjs` (encadenado en `npm run check:simulador`) lo lee **como texto** para comparar el catálogo de eventos.
2. `scripts/simulador/gen/*` — knip los marca unused, pero el endpoint `/api/orgs/[org_id]/cases/generate` los ejecuta vía `child_process`; `next.config.js` los empaqueta con `outputFileTracingIncludes`.
3. `lib/simulador/copy/*` — 7 de 12 módulos no tienen importers. Son artefactos autorales canónicos del flujo Claude→Codex (staging de copy versionado), no código muerto.
4. `@x402/fetch` en `optionalDependencies` — cero imports first-party, pero `agentmail` lo resuelve en bundle (`lib/email/agentmail.ts` → email-hook). Quitarlo rompe `npm run build` con module-not-found.

**Por qué:** en el refactor integral del 2026-06-12 borré `@x402/fetch` confiando en el scan "0 imports" y el build reventó; `analytics.ts` y `gen/*` se salvaron solo por verificación manual previa. El borrado masivo verificado con grep de imports NO basta: hay consumo por texto, por child_process y por bundler.

**Cuándo aplicar:** antes de borrar "código muerto" o dependencias en Itera — verifica también: lectura como texto desde scripts (`grep <nombre> scripts/`), `outputFileTracingIncludes` de next.config, y dependencias transitivas de paquetes (correr `npm run build` antes de dar por bueno).
