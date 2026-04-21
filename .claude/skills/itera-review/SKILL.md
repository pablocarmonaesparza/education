---
name: itera-review
version: 1.0.0
description: |
  Revisa lecciones de Itera contra METODOLOGIA.md, aplica correcciones directamente,
  corre el linter, y sube a Supabase. Combina evaluator AI (fondo pedagógico) + linter
  (forma mecánica) en un loop hasta PASS. Auto-fix directo sin aprobación manual.
  Invócala con /itera-review [slug|--all|--section N].
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Agent
  - TodoWrite
---

# /itera-review — Revisión y auto-fix de lecciones Itera

Revisa contenido pedagógico contra la metodología **y el linter mecánico**, aplica correcciones, y re-valida hasta pasar.

## Qué revisa (combinado)

### Evaluator AI (fondo pedagógico)
Cosas que el linter NO puede detectar, basadas en `docs/METODOLOGIA.md`:

- **R12 — Engage adulto**: ¿El misconception del Engage MCQ pasa los dos tests (robustez técnica + adult-level)? ¿Un no-técnico de 2026 realmente lo cree?
- **Hypercorrection bien diseñada**: ¿La respuesta incorrecta es una creencia común, no una paja?
- **Arco 5E coherente**: Engage → Explore (concept) → Explain (concept + T/F) → Elaborate (3 slides variadas) → Evaluate (callback al Engage) → Celebration.
- **Explanation educa, no solo confirma**: Cada `explanation` enseña por qué, no solo "correcto".
- **Callback del Evaluate al Engage**: La última MCQ retoma al personaje del Engage con criterio nuevo.
- **R6.6 — character-in-concept**: Ningún personaje aparece en concept slides (son explicativos).
- **Consistencia de tono y voz**: Todo el paquete de la lección tiene la misma energía.
- **Scenario character uso apropiado**: Presente en Engage y Evaluate, ausente en explicaciones puras.

### Linter mecánico (forma)
`scripts/lint-lessons.py` ya corre:
- R5 body-length ≤ 250 chars / 45 words
- R6.5 setup-length ≤ 180 chars
- R6.8 capitalization consistency
- R6.9 tap-match term ≤ 30 chars y term ≤ def
- R9.1 abbreviation-intro (API, LLM, MCP, RAG, RLS, SDK, CRM)
- R13 markdown-scope (solo body/explanation)
- R16 currency-usd

## El loop

```
Para cada lección:
  1. EVALUATE (Agent tool, modelo sonnet)
     - Lee: JSON + metadata DB + METODOLOGIA.md
     - Emite feedback + aplica fixes DIRECTAMENTE al JSON con Edit
     - Itera hasta que el linter mecánico pase
     - Reporta qué cambió

  2. UPLOAD (scripts/upload-slides.py)
     - Si lint pasó → sube esa lección

  3. NEXT
```

Lecciones en paralelo: lanza hasta 10 agents concurrentes (Agent tool en batch).

## Uso

```
/itera-review                     # revisa TODAS las 100 lecciones
/itera-review nano-banana         # una lección específica
/itera-review --section 4         # solo una sección
/itera-review --dry-run           # reporta issues pero no aplica
```

## Prompt que el orquestador pasa a cada agent

El orquestador (este Claude) llama al Agent tool con este prompt self-contained:

```
Eres un evaluador pedagógico de Itera.

Revisa la lección en {path} contra docs/METODOLOGIA.md (LEE AMBOS).

Aplica las correcciones directamente con Edit/Write. Las reglas críticas que DEBES
cumplir son R12 (adult-level + robustez), R6.6 (no characters en concept), 5E arc,
explanation que educa, callback Engage↔Evaluate, linter mecánico PASS.

Flujo:
1. Lee METODOLOGIA.md (v0.11)
2. Lee el JSON
3. Identifica issues (fondo + forma)
4. Aplica fixes con Edit — uno por issue
5. Corre: python3 scripts/lint-lessons.py {path}
6. Si sigue fallando, fixea y repite (max 3 iteraciones)
7. Reporta: { "slug": "...", "issues_fixed": N, "lint_status": "PASS|FAIL", "notes": "..." }

NO modifiques: slug, section_id, order_in_lecture, kind, phase, correctId/correctIds,
answer, correctOrder, xp, emoji. Solo textos (prompt, statement, body, explanation,
title, options[].text, pairs[].term, pairs[].def, steps[], tokens[]).

Respeta R1 v0.11: gramática natural del español (no forzar todo minúsculas).
Respeta R5: bodies ≤ 250 chars / 45 words.
Respeta R6.5: setup de Engage ≤ 180 chars.
Respeta R6.9: tap-match term ≤ 30 chars Y term ≤ def.
Respeta R9.1: primera aparición de abreviación con expansión.
Respeta R13: markdown SOLO en body y explanation.
Respeta R16: montos en USD.
Respeta R6.6: ningún nombre del roster en concept/concept-visual.
```

## Criterios de PASS

Una lección pasa cuando:
1. `lint-lessons.py` reporta 0 violaciones para ese archivo
2. El evaluator confirma R12 + 5E + callback + explanations educativas

Si falla después de 3 iteraciones, mueve la lección a `content/lessons/_needs_review/`
con un `_issues.md` al lado explicando por qué.

## Output del orquestador

Al final emite resumen tipo:

```
ITERA-REVIEW REPORT
===================
100 lecciones procesadas
  ✓ 94 pasan (con fixes aplicados, total X cambios)
  ✗ 6 quedaron en _needs_review/
Linter final: 0 violaciones
Subida a Supabase: 94/100 (6 pendientes)
```
