---
type: policy
title: Rúbrica semver policy — Itera Simulador
task_id: B3-006
date: 2026-05-19
authors: [claude]
reviewers: [codex]
status: active
applies_to:
  - simulador.rubrics
  - simulador.rubric_dimensions
  - simulador.rubric_criteria
  - docs/simulador/contrato_v0/rubricas/*.yaml
---

# Rúbrica semver policy — cuándo bump major / minor / patch

## TL;DR

La rúbrica `rubric_marketing_v1` se freezea en `1.0.0` cuando se hace el primer commercial release. **Todo report emitido se ata exact a la versión de rúbrica usada en el momento del judge run.** No re-evaluamos reports históricos. La rúbrica nueva sólo aplica a sessions nuevas post-freeze.

## Cuándo bump cada nivel

### Major (1.0.0 → 2.0.0) — invalidación de comparabilidad

Cambias mathematics de la evaluación. Reports históricos quedan incomparables con los nuevos.

Triggers:
- Cambias el **número** de bandas (e.g., A/M/B → A/M/B/C).
- Cambias el **número** de dimensiones (e.g., 5 → 6 con "transparencia" agregada).
- Cambias el **significado** de una banda (e.g., "Alto" deja de incluir lo que antes incluía).
- Cambias **threshold cutoff** que reasigna bandas (e.g., A era >75 ahora es >80).
- Cambias **scoring formula** que afecta agregados.

Acción post-bump:
- Reports históricos NO se invalidan, pero se marcan visualmente "v1 rúbrica — no comparable con v2".
- Manager dashboard muestra warning si compara cohort v1 vs v2.
- Marketing/sales NO debe pitchear "mejora" cohort-over-cohort si las versiones de rúbrica difieren.

### Minor (1.0.0 → 1.1.0) — extensión sin invalidación

Agregas criteria/penalties/thresholds nuevos que **refinan** sin invalidar versiones anteriores.

Triggers:
- Agregas un nuevo `rubric_criteria` row a una dimensión existente.
- Agregas un `penalty` específico (e.g., "exposed_pii_to_model con jurisdiction MX → -10").
- Agregas un peso interno (`internal_weight`) a un criterio nuevo.
- Documentas un edge case que el judge antes no detectaba.

Acción post-bump:
- Reports v1.0.x y v1.1.x coexisten. Manager dashboard puede compararlos con disclaimer leve ("añadidos refinamientos en v1.1").
- Casos antiguos (`rubric_version_used: 1.0.0`) NO se re-evalúan. Casos nuevos se evalúan con 1.1.0.

### Patch (1.0.0 → 1.0.1) — clarificación sin cambio matemático

Cambias copy/texto sin afectar lo que el judge mide ni cómo lo agrega.

Triggers:
- Refinás `public_definition` de una dimensión (e.g., "Privacidad" texto más claro pero mismo significado).
- Corregís typo en `internal_label` de un criterio.
- Mejorás copy del reporte ejecutivo en cómo describe cada banda.
- Agregás referencias documentales o ejemplos sin cambiar lo evaluado.

Acción post-bump:
- Reports v1.0.0 y v1.0.1 son **comparables sin disclaimer**.
- Sessions corriendo durante el bump pueden hacer auto-upgrade a 1.0.1 sin re-evaluación.

## Reglas de freeze

1. **Una vez una rúbrica está en uso comercial (≥1 sprint pagado o ≥1 design partner con report publicado), `frozen_at` se setea en BD y la fila se vuelve inmutable.**
2. Para "cambiar" una rúbrica freezada → crear una versión nueva con semver bump (no editar la freezada).
3. La columna `simulador.rubrics.frozen_by` registra qué agente/persona aprobó el freeze (auditoría).
4. Mig 022 ya agregó `frozen_at` y `frozen_by` columnas — usarlas.

## Mapping de versión actual

| Slug | Version | Status | Frozen |
|---|---|---|---|
| `rubric_marketing_v1` | 1.0.0 | active | **a freezar después de B3-006 review** |

## Workflow de bump (futuro)

```
# 1. Decide qué nivel de bump
# 2. Copia el YAML actual a una nueva versión
cp rubric_marketing_v1.yaml rubric_marketing_v1.1.yaml

# 3. Edita el archivo nuevo con tu cambio
# 4. Bump version field
# 5. Re-correr seed para insertar nueva rubric row (no overwrite)
node scripts/simulador/seed-rubric.mjs --apply rubric_marketing_v1.1.yaml

# 6. La rúbrica antigua queda con frozen_at populated; la nueva queda active sin freeze
#    hasta que tenga ≥1 sprint comercial.
```

## Decisiones producto

<!-- decisions:data:start -->
```yaml
decisions:
  - id: B3-006-D1
    decision: "Freeze rubric_marketing_v1@1.0.0 en BD con frozen_at = primera fecha de uso comercial; frozen_by = 'claude_initial_freeze'"
    rationale: "Sin freeze, cualquier edición posterior invalida reports previos sin trail de versionado. Mig 022 ya provee las columnas. Owner Codex porque toca BD producción."
    change_type: schema
    files_to_touch:
      - supabase/migrations/20260519022000_simulador_analytics_compliance_rubric_freeze_022.sql
      - scripts/simulador/freeze-rubric.mjs
    owner: codex
    blocked_by: []
    priority: high

  - id: B3-006-D2
    decision: "Reports históricos se renderean con metadata 'rúbrica v1.0.0 (frozen 2026-MM-DD)' en footer + dashboard manager muestra disclaimer cuando compara cohort v1 vs v2"
    rationale: "Sin disclaimer visible, manager puede comparar cohort de hace 6 meses con cohort hoy y atribuir mejora a entrenamiento cuando la diferencia viene de rúbrica nueva. Es honestidad metodológica."
    change_type: copy
    files_to_touch:
      - lib/simulador/copy/report.ts
      - lib/simulador/copy/manager.ts
      - docs/design/surfaces/manager_dashboard.md
    owner: claude
    blocked_by:
      - B5-001
    priority: high

  - id: B3-006-D3
    decision: "Política de bump documentada en este archivo + linkeable desde Pablo's CLAUDE.md sección 'memoria producto' para evitar drift de criterio cuando se agregue rúbrica para otras carreras"
    rationale: "Cuando agreguemos rubric_sales_v1, rubric_ops_v1, etc., cada una usa el mismo semver policy. Documentar aquí para que cualquier agente futuro (claude, codex, otro) tenga la regla canónica."
    change_type: process
    files_to_touch:
      - docs/simulador/rubric_semver_policy.md
      - CLAUDE.md
    owner: claude
    blocked_by: []
    priority: low
```
<!-- decisions:data:end -->
