---
type: aprendizaje
title: pipeline de review de lecciones con evaluator + linter + auto-fix en batches paralelos
date: 2026-04-21
tags: [lecciones, review, metodologia, agents]
dept: [cpo, cto]
---

Para revisar las 100 lecciones contra la metodología, lo que funcionó fue el skill `/itera-review` con esta forma:

1. **Evaluator AI** lee `docs/METODOLOGIA.md` y cada JSON de lección y genera un diagnóstico concreto (qué regla rompe, dónde).
2. **Linter mecánico** (reglas regex-grade) detecta violaciones objetivas: R1 (gramática natural), R5 (longitud body), R6.5 (setup), R9.1 (abreviaciones sin intro), R13 (markdown scope), etc.
3. **Auto-fix loop** aplica los fixes donde el linter puede arreglar sin cambiar pedagogía; el evaluator hace los cambios semánticos.
4. **Batches paralelos** — 10 agentes en paralelo, cada uno ~10 lecciones. Total: 100 lecciones, ~590 fixes aplicados en una sola corrida.

Clave del éxito: el evaluator NO reescribe libremente — solo edita lo que rompe reglas verificables. Y el linter reduce el trabajo del LLM a las violaciones semánticas reales.

**Por qué:** hacer review manual de 100 lecciones era infactible. Hacer solo linter dejaba violaciones de 5E, hypercorrection, R12 (misconceptions adultos). El combo cubre lo objetivo (linter rápido) + lo subjetivo (evaluator costoso pero preciso).

**Cuándo aplicar:**
- Al añadir lecciones nuevas (batch parcial).
- Al actualizar `docs/METODOLOGIA.md` con reglas nuevas (re-correr sobre las 100).
- Al detectar un patrón de bug en 5+ lecciones (crear regla de linter primero, después correr).

El skill vive en `.claude/skills/itera-review/SKILL.md`.
