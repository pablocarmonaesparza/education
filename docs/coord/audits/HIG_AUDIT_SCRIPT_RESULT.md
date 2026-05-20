# HIG audit script — resultado ejecución

> Auditor: claude · Fecha: 2026-05-20 · Branch tip: a745aff
> Script: `scripts/simulador/hig-audit.mjs` (creado por codex en b02ab74)

## Comando ejecutado

```
node scripts/simulador/hig-audit.mjs
```

## Resultado

```
HIG audit OK (50 files checked).
```

## Status: **PASS ✅**

## Cobertura del script

El script `hig-audit.mjs` revisa archivos en estos directorios:
- `app/(app)/` — surfaces autenticadas
- `app/(onboarding)/` — wizard 5 steps
- `app/auth/` — login/signup/callback/confirm/invitation
- `app/field-test/` — demo público
- `components/simulador/` — Apple wrappers + Shells + RuntimeExperience + Nav components

Extensiones chequeadas: `.tsx`, `.ts`, `.css`

## Reglas validadas (asumido por implementación)

Basado en lectura del script (lines 1-30):
- Hex inline detection (excepto en `simulador.css` y patrones permitidos como Google OAuth icon mark)
- Patterns como `fill="#..."` y `stroke="#..."` aceptados solo en SVG inline justificado

## Implicación

50 archivos del cleanroom v2 cumplen las reglas técnicas que el audit script puede detectar automáticamente:
- HIG-RULES-COLOR-03 (no hex inline fuera de tokens)
- Coherencia design tokens del simulador.css

## Reglas que el script NO valida (requieren audit manual)

- A11Y-01 contraste WCAG (requiere axe-core o Lighthouse runtime)
- A11Y-02 hit target 44×44 (requiere DOM analysis runtime)
- A11Y-04 prefers-reduced-motion (requiere ejecutar test)
- A11Y-06 keyboard nav (requiere test interactivo)
- A11Y-07 aria-label / semantic HTML (parcial — grep podría agregar)
- TYPO-04 letter-spacing en displays (requiere computed styles)
- MOTION-01..06 motion timing (requiere ejecución animations)
- WRITE-01 voz Itera (requiere review manual del copy)
- BTN-01..07 button best practices (requiere DOM analysis)

Estas son las que requieren:
- Lighthouse a11y/perf
- axe-core runtime audit
- Playwright E2E con interaction
- Visual regression screenshots

## Próximos checks pendientes (codex)

1. Ejecutar Lighthouse en las 20 rutas
2. Ejecutar axe-core runtime
3. Playwright E2E 3 flows
4. Visual regression screenshots por breakpoint

## Conclusión

**Validación estática PASS** en 50 archivos. Lo que el script puede detectar mecánicamente está limpio. Reglas dinámicas (contraste runtime, motion, keyboard) requieren tooling adicional que codex incluye en Bloque 14 QA.

## Anexo · Build local verify

Comando: `bun run build`

Resultado: **PASS limpio** — 20 rutas v2 allowlist compilan + system pages (maintenance, error, not-found) + opengraph + robots + sitemap.

Rutas compiladas:
- Static (○): `/`, `/auth/login`, `/auth/signup`, `/auth/invitation`, `/cancel`, `/field-test/marketing-urgent-campaign-pii`, `/icon.png`, `/maintenance`, `/privacy`, `/robots.txt`, `/sitemap.xml`, `/terms`
- Dynamic (ƒ): `/auth/callback`, `/auth/confirm`, `/case/[case_id]`, `/dashboard`, `/onboarding/{org,team,billing,invite,done}`, `/opengraph-image`, `/report/[session_id]`, `/success`, `/admin/*` (5 subroutes), all API endpoints

Build PASS confirma que no hay imports rotos post-refactor a Apple wrappers.

— claude · 2026-05-20 · hig-audit script execution + build verify
