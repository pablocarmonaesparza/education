---
type: quality_bar
title: Case admission checklist — 8 criterios pre-import a BD
task_id: B9-002-D2
date: 2026-05-19
authors: [claude]
reviewers: [codex]
status: active
applies_to:
  - scripts/simulador/validate-case-yaml.mjs
  - docs/simulador/contrato_v0/casos/*.yaml
  - docs/simulador/contrato_v0/archetypes/INDEX.md
---

# Case admission checklist — 8 criterios obligatorios

## TL;DR

Ningún caso entra a `simulador.case_templates` sin pasar los 8 criterios de este checklist. Script `scripts/simulador/validate-case-yaml.mjs` (owner: codex) los enforce automáticamente. CI block si falla.

Origen: contrato §7 + §8 + HKS Case Program principles + B9-002-D2 hard rule.

## Los 8 criterios

### 1. Mide criterio, no conocimiento

**Qué chequea:** el caso NO pide al participante "definir qué es PII" o "explicar prompting". Pide ejecutar decisiones bajo presión.

**Validator implementation:**
- Cada `step.type` debe ser uno de: `data_scope` · `llm_beat` · `artifact_review` · `decision_select` · `decision_open_short`. NO permitir `quiz_mcq`, `knowledge_check`, `multiple_choice`.
- `expected_action` declarado no-trivial (i.e., NO solo "leer el dataset"; SI "decidir qué campos transformar y por qué").
- Setup del caso no menciona "te enseñamos cómo hacer X" o "para hacer Y, recuerda Z".

**Failure message:** `caso {slug}: step "{step_key}" parece de conocimiento (step.type={type}). Reescribir como decision_*`.

### 2. Tiene presión real

**Qué chequea:** hay deadline / autoridad / restricción que fuerza tradeoff.

**Validator implementation:**
- Frontmatter declara `tension: <string>` no-vacío.
- `expected_signals` incluye al menos uno de: `tight_deadline_*`, `authority_pressure_*`, `governance_unclear`, `stakeholder_conflict`, `crisis_severity_*`.
- Setup del caso menciona timestamp/hora específica (e.g., "jueves 4:30 PM", "deadline mañana 9 AM") O autoridad nombrada (e.g., "VP", "CMO", "Camila").

**Failure message:** `caso {slug}: sin tensión declarada en frontmatter o sin signals de presión. Agregar tension + expected_signals.`

### 3. Tiene datos / artefacto

**Qué chequea:** el caso provee al participante un dataset, brief, o output del modelo para que decida sobre. Sin esto, es solo opinión.

**Validator implementation:**
- Frontmatter declara `data_artifacts: [...]` con al menos 1 entry.
- Cada entry tiene `kind: dataset | doc | model_output | brief` y `content_template_ref` o `sample_rows_ref`.
- Los refs apuntan a archivos existentes en `docs/simulador/contrato_v0/inputs/` o equivalente.

**Failure message:** `caso {slug}: sin data_artifacts. Agregar al menos 1 dataset/doc/brief/model_output.`

### 4. Tiene decisión observable

**Qué chequea:** el caso culmina en un step donde el participante toma una acción (no solo "lee y comprende").

**Validator implementation:**
- El último step (mayor `ordinal`) debe ser type `decision_select` o `decision_open_short`.
- Tiene `capture: [...]` con campos específicos (NO solo `freeform_text`).

**Failure message:** `caso {slug}: último step no es decision_*. Reescribir final step como decision point claro.`

### 5. Tiene riesgo extractivo posible

**Qué chequea:** el caso tiene al menos 2 risk events que pueden dispararse según la decisión del participante.

**Validator implementation:**
- Frontmatter o algún step declara `gap_trigger_logic:` con al menos 2 referencias a risk event types del catálogo `simulador.risk_events.event_type` (CHECK constraint).
- Los risk types referenciados existen (lookup contra schema o lista hardcoded en validator).

**Failure message:** `caso {slug}: sin gap_trigger_logic o solo 0-1 risk events. Mínimo 2 risk events extractivos posibles.`

### 6. Tiene re-sim mapeado (cuando aplique)

**Qué chequea:** si el caso es `variant_role: primary`, existe un variant `resim` con mismo `archetype_ref` pero dataset/personajes/datos diferentes.

**Validator implementation:**
- Si frontmatter declara `variant_role: primary` (default), buscar archivo en mismo dir con `_resim.yaml` suffix o frontmatter `variant_role: resim` apuntando al primary.
- El resim debe tener mismo `archetype_ref` y mismo `level_primary`.

**Failure message:** `caso {slug}: variant primary sin resim correspondiente. Crear {slug}_resim_v*.yaml.`

### 7. Tiene practice beat asociado

**Qué chequea:** las dimensiones que el caso evalúa tienen practice beats que se desbloquean si el participante saca banda B/M.

**Validator implementation:**
- Frontmatter declara `evaluates_dimensions: [...]` con al menos 3 dimensiones.
- Para cada dimensión, debe existir al menos 1 practice beat en `docs/simulador/contrato_v0/practice_beats/*.yaml` con `dimension: <esa>` y `level: <level_primary del caso>`.

**Failure message:** `caso {slug}: dimension "{dim}" no tiene practice beat de nivel {level}. Crear practice beat o degradar dimensión evaluada.`

### 8. No revela la rúbrica al participante

**Qué chequea:** ningún UI element en el caso muestra al participante qué dimensión se está evaluando ni cuál es la "respuesta correcta".

**Validator implementation:**
- Setup, prompts, options NO contienen las palabras `evalúa`, `rubric`, `criterio correcto`, `respuesta esperada`, nombres de dimensiones en displayed UI strings.
- Options de `decision_select` NO tienen `signal: correct` o `signal: gap_*` visibles al participante (deben estar en `_internal_signal` o similar, oculto al render).
- `evaluates_dimensions` solo accesible al judge, NO renderizado.

**Failure message:** `caso {slug}: spoiler detectado en step "{step_key}" — string "{matched}" reveala rúbrica al participante. Reescribir.`

## Adicional: archetype_ref obligatorio

Cubierto por B3-002-D1 + B3-001-D1. Validator chequea:

- Frontmatter declara `archetype_ref: <slug>`.
- El slug existe en `docs/simulador/contrato_v0/archetypes/<slug>.md`.
- `level_primary` está declarado y es 1, 2 o 3.

**Failure message:** `caso {slug}: archetype_ref "{ref}" no existe en INDEX, o level_primary no declarado/inválido.`

## Spec del validator script

`scripts/simulador/validate-case-yaml.mjs` (owner: codex):

### Input
- Sin args: valida todos los YAMLs en `docs/simulador/contrato_v0/casos/`.
- Con arg `--file <path>`: valida solo ese.
- Con arg `--ci`: exit code 1 si cualquiera falla (para usar en GitHub Action / pre-commit).

### Output
- Por archivo procesado, output:
  - `OK <slug>` si pasa los 9 criterios (8 + archetype_ref).
  - `FAIL <slug>: <criterio_id>: <failure_message>` por cada criterio que falla.
- Footer: `validate-case-yaml: <total> files, <passed> OK, <failed> FAIL`.

### Exit codes
- `0` si todos pasan.
- `1` si cualquiera falla.
- `2` si error de parseo (yaml inválido).

### Integración CI
- Pre-commit hook: `husky` o equivalent ejecuta sobre los YAMLs cambiados.
- GitHub Action `validate-cases.yml` corre `--ci` sobre todos en PR.
- Codex también lo invoca antes de `seed-cases.mjs --apply` para evitar import de YAMLs inválidos.

## Por qué este checklist es hard rule (no soft)

- Cumple HKS Case Program principle: "good cases are built with documentary research and interviews".
- Cumple B3-001-D1: archetype_ref obligatorio.
- Cumple B5-001 contrato §7 "no enseñar antes de medir".
- Sin enforcement automático, los YAMLs degeneran cuando agreguemos casos para Sales/Ops/CS/Finance — perdería identidad pedagógica del producto.

## Decisiones producto (derivadas)

<!-- decisions:data:start -->
```yaml
decisions:
  - id: B9-002-D2-S1
    decision: "validate-case-yaml.mjs ENFORCEs los 9 criterios (8 + archetype_ref) con exit code 1 en CI"
    rationale: "Sin enforcement, los criterios son soft y degeneran. CI block evita imports de YAMLs inválidos."
    change_type: rubric
    files_to_touch:
      - scripts/simulador/validate-case-yaml.mjs
      - .github/workflows/validate-cases.yml
      - .husky/pre-commit (or equivalent)
    owner: codex
    blocked_by: []
    priority: high

  - id: B9-002-D2-S2
    decision: "Cada criterio que falla regresa mensaje accionable + cita del contrato §7/§8"
    rationale: "Validator no ayuda si solo dice FAIL. Mensaje debe decir QUÉ está mal Y CÓMO arreglarlo, con referencia al contrato si aplica."
    change_type: rubric
    files_to_touch:
      - scripts/simulador/validate-case-yaml.mjs
    owner: codex
    blocked_by: []
```
<!-- decisions:data:end -->
