---
title: GStack gates como Definition of Done
date: 2026-05-19
owner: codex
status: active
---

# GStack gates como Definition of Done

Este documento convierte los gates acordados en reglas operativas. La regla es simple: un bloque no se cierra en `docs/coord/BUILD_BOARD.yaml` si no deja evidencia de los gates que le aplican en `docs/coord/HANDOFF.md`.

## Gates disponibles

| Gate | Cuándo aplica | Evidencia mínima |
|---|---|---|
| `review` | Todo PR o bloque con código, SQL o lógica de negocio. | Resultado PASS o lista P0/P1/P2 resuelta. |
| `qa` | Toda superficie user-facing. | Flujo probado con usuario real/sintético y resultado documentado. |
| `design-review` | Toda superficie visual nueva o rediseño relevante. | Screenshot/revisión visual y fixes críticos cerrados. |
| `cso` | Auth, RLS, pagos, PII, tokens, service-role, webhooks o deploy prod. | Hallazgos P0/P1 cerrados o explicitados como blocker. |
| `canary` | Todo deploy producción. | Ventana post-deploy observada, errores y rollback path documentados. |
| `retro` | Revisión quincenal o cierre de fase grande. | Qué se shippeó, qué se rompió, qué cambia en el proceso. |
| `autoplan` | Bloques grandes de arquitectura antes de tocar varias capas. | Plan con dependencias, riesgos, DoD y no-go list. |
| `benchmark` | Cambios con posible impacto en performance o Core Web Vitals. | Comparación antes/después o justificación de no aplicar. |
| `health` | Cierre semanal o antes de launch. | Estado de typecheck, lint, tests, dead code y smoke principal. |

## Matriz por tipo de bloque

| Tipo de bloque | Gates obligatorios |
|---|---|
| Migración BD | `review`, `cso` si toca RLS/auth/PII/service-role. |
| Backend/API/judge | `review`, `cso` si toca auth/RLS/tokens/PII, calibration si toca judge. |
| Surface visual | `review`, `qa`, `design-review`; `cso` si muestra datos sensibles. |
| Runtime/caso | `review`, `qa`, spoiler-leak check, loop audit de Claude. |
| Contenido casos/beats | case validator, loop audit, copy voice checklist. |
| Reporte ejecutivo/PDF/share | `review`, `qa`, `cso` si hay link público o evidencias sensibles. |
| Billing/email/webhooks | `review`, `qa`, `cso`, smoke con proveedor real o sandbox. |
| Admin/ops | `review`, `qa`, `cso`; staff-only verificado. |
| Pre-deploy producción | `health`, `cso`, smoke E2E, `canary` post-deploy. |

## Formato obligatorio en HANDOFF

Cada cierre debe incluir:

```md
- gates:
  - review: PASS (fuente: Claude CLI / GStack / Codex review)
  - qa: PASS (`npm run simulador:e2e`, manual smoke, o razón de no aplicar)
  - cso: PASS / no aplica (razón)
  - build: PASS (`npm run build`)
```

Si un gate no aplica, se escribe `no aplica` con una frase. Si aplica y no pasó, el bloque queda `blocked`, no `done`.

## Comandos base actuales

Estos comandos son el mínimo técnico antes de cerrar cualquier bloque del Simulador:

```bash
npm run check:simulador
npm run lint:simulador
npm run build
npm run simulador:e2e
node scripts/coord/board-lint.mjs
```

Los skills GStack se usan como capa adicional cuando el bloque lo amerita; no reemplazan los checks del repo.
