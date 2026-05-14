---
type: decision
title: runtime minimo del Simulador implementado por Codex
date: 2026-05-12
tags: [simulador, desarrollo, runtime, importer, schema, evaluation-stub]
dept: [desarrollo, producto]
---

# runtime minimo del Simulador

Codex implemento el primer nucleo tecnico en `lib/simulador/` para que el
contrato v0 pueda bajar a runtime sin depender de UI.

## que incluye

- tipos canonicos: dimensiones, step types, evidence kinds, manager actions,
  case templates, variants, sprint packages, events y evaluation result.
- guards/constantes para validar valores cerrados del contrato.
- validador de templates, variants, practice beats y sprint package.
- importer que convierte contratos ya parseados a seed rows compatibles con
  `docs/simulador/contrato_v0/schema/simulador_v0.sql`.
- runtime puro para crear sesiones, capturar events, behavior_events,
  risk_events, decision replay y evaluation stub.
- CLI `npm run simulador:validate` que lee los YAML reales y valida el contrato.

## que no incluye todavia

- importer YAML -> DB ejecutado.
- seed SQL generado automaticamente.
- escritura en Supabase.
- LLM-as-judge real.
- UI.

## validacion

El modulo compila aislado:

```bash
npx tsc --noEmit --pretty false --strict --skipLibCheck --module esnext --moduleResolution bundler --target ES2017 lib/simulador/*.ts
```

El typecheck global del repo sigue fallando por errores previos fuera del modulo
(`app/api/dev/auto-login`, prototipo `app/simulator-system`, Buttons y funciones
Deno de Supabase). No se arreglaron porque no pertenecen a esta tarea.

El contrato completo tambien valida:

```bash
npm run simulador:validate
```

Resultado: 8 casos ready, 16 variantes, 20 practice beats, rubrica
`rubric_marketing_v1@1.0.0`.

## siguiente paso tecnico

Conectar parser/importer real contra YAML o generar seed SQL revisable. Despues,
reemplazar `createEvaluationStub` por LLM-as-judge versionado contra
`rubric_marketing_v1`.

## actualizacion 2026-05-12 — fixes post-audit Claude CLI

Claude CLI marco bloqueantes antes de migrar: pricing band no podia perderse
en `price_usd`, `sprint_package_cases` necesitaba status + metadata por caso,
assignments debia separar primary/resim, `step_key` necesitaba convencion
estable y `risk_events` no debia inferir dimension solo por strings.

Codex resolvio esos puntos en SQL, runtime, importer y validator:

- `pricing_json` guarda el commercial completo del Sprint.
- `sprint_package_cases` conserva refs primary/resim, dimensiones enfatizadas,
  dificultad y tension.
- `assignments.assignment_kind` + `parent_assignment_id` modelan re-sim.
- `toStepKey()` normaliza YAML `id: 1` a DB `step_1`.
- `risk_events.dimension` / `dimension_key` queda explicito.
- el CLI valida refs de variantes y cruza practice beats entre casos, catalogo
  del Sprint y archivos reales.
