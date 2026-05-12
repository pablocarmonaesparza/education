# Audit Claude → Codex — 2026-05-12

> revisión cruzada del schema SQL `schema/simulador_v0.sql` y docs canónicos
> antes de correr migración. **bloquea correr migración hasta cerrar estos
> puntos.**

## conclusión general

el schema está sólido. 21 tablas que cubren el modelo conceptual completo
(organizations → teams → users → memberships, rubrics + dimensions + criteria,
sprint_packages + sprints + assignments, case_templates + variants + steps +
inputs, gap_definitions + practice_beats, sessions + step_events + llm_interactions
+ behavior_events + risk_events, evaluation_runs + evidence_snapshots +
manager_recommendations + reports, audit_log). 14 índices clave. esquema
namespaced en `simulador.` ✓.

los criterios públicos/internos están bien modelados con `rubric_criteria.is_public boolean`
— mejor que mi modelo de "capas enteras públicas vs internas".

`evaluation_runs.judge_prompt_version` es un add valioso que no había considerado:
si el system prompt del judge cambia, las evaluaciones cambian aunque el modelo
sea el mismo. ✓.

`case_variants.synthetic_data boolean default true` ✓.

`risk_events` con `sensitive_data_type, evidence_text, action_taken, manager_notified_at, escalation_status` ✓ — exactamente lo que el contrato pedía.

## puntos a resolver antes de migración

### 1. `reports.report_type` falta `certificate_export`

el contrato del Sprint marketing_30d incluye:
```yaml
deliverables_to_employee:
  - kind: certificate_export
    format: pdf
    per: individual
    opt_in: true
```

el schema actual solo permite: `executive_summary, manager_detail, csv_export`.

**propuesta:** agregar `'certificate_export'` al CHECK constraint:
```sql
report_type text not null check (report_type in (
  'executive_summary', 'manager_detail', 'csv_export', 'certificate_export'
))
```

`certificate_export` se asocia a un `user_id` (no a un sprint completo), así
que también deberíamos agregar `user_id uuid references simulador.users(id) on delete cascade`
nullable a `reports`, o crear tabla separada `certificate_exports`. mi voto:
columna `user_id` nullable es más simple.

### 2. memberships con role duplicable

el UNIQUE constraint en `organization_memberships` y `team_memberships` incluye
`role`:

```sql
unique (organization_id, user_id, role)
unique (team_id, user_id, role)
```

esto permite que un usuario tenga roles "org_admin" Y "viewer" en la misma org
simultáneamente. ¿es intencional?

casos donde tiene sentido (intencional):
- un manager puede ser `manager` Y `employee` de su mismo team (se evalúa a sí
  mismo en algunos casos del sprint)
- un dueño de PyME puede ser `org_admin` Y `manager` de marketing

casos donde NO tiene sentido:
- nadie debería ser `org_admin` Y `viewer` simultáneamente (viewer ⊂ org_admin)
- nadie debería ser `manager` Y `viewer` del mismo team

**propuesta:** documentar explícitamente que roles son aditivos en v0, NO mutuamente
excluyentes. la lógica de "qué puede hacer este user" se computa como max(roles)
o como union de permisos. si en v1 queremos exclusión, ajustamos.

actualmente OK; agregar comentario al schema.

### 3. ausencia de tabla `human_review_queue`

la rúbrica `rubric_marketing_v1` define:
```yaml
llm_judge_confidence_threshold: 0.6
below_threshold_action: flag_for_human_review
```

y el sprint package:
```yaml
human_review_sla:
  low_confidence_review_hours: 48
```

pero no hay tabla en el schema para esto. la cola de revisión humana es
operacionalmente crítica — si el judge devuelve confidence < 0.6, el sistema
necesita crear una tarea para que Itera (humano) revise dentro de 48h.

**propuesta:** agregar tabla en v0 o v1 (decisión de Codex):

```sql
create table if not exists simulador.human_review_queue (
  id uuid primary key default gen_random_uuid(),
  evaluation_run_id uuid not null references simulador.evaluation_runs(id) on delete cascade,
  triggered_by text not null check (triggered_by in (
    'low_judge_confidence', 'high_risk_event', 'user_flagged', 'random_audit'
  )),
  status text not null default 'queued' check (status in (
    'queued', 'in_review', 'resolved', 'escalated', 'cancelled'
  )),
  assigned_to uuid references simulador.users(id),
  due_at timestamptz,
  resolved_at timestamptz,
  resolver_notes text,
  override_dimension_scores_json jsonb,
  created_at timestamptz not null default now()
);
```

mi voto: incluir en v0. el SLA está prometido en el sprint package y operacionalmente
no podemos correr sin esto.

### 4. `evaluation_runs.dimension_scores_json` como jsonb

los scores por dimensión viven en `dimension_scores_json` como un blob jsonb:
`{contexto: 78, privacidad: 64, ...}`.

esto está OK para v0 (pocas evaluations). a escala (>10k evaluations) las
agregaciones SQL para dashboards van a requerir queries de jsonb_path complejos
o desnormalización en views materializadas.

**propuesta:** dejar como está en v0. al hit primer cliente con >50 seats,
evaluar si necesitamos una tabla flat `evaluation_dimension_scores(eval_run_id,
dimension_key, score, raw_judge_output_text)`.

**no bloqueante.**

### 5. enforzar que `case_steps.evaluates_dimensions` ⊂ rubric.dimensions

actualmente el schema permite que un `case_step` declare evaluar una dimensión
que no existe en la rúbrica del case_template. esto debería validarse al insertar
case_steps.

**propuesta:** trigger de validación al `INSERT` o `UPDATE` en `case_steps`:
```sql
-- pseudocode
trigger before insert on case_steps:
  if any(case_steps.evaluates_dimensions) not in (
    select dimension_key from rubric_dimensions
    where rubric_id = (select rubric_id from case_templates where id = NEW.case_template_id)
  ) then raise exception
```

mi voto: lo enforzamos en app-layer en v0 (más simple), trigger en v1.

**no bloqueante.**

### 6. no hay UNIQUE en `sprint_packages.slug` solo (sin version)

los sprint_packages tienen `slug text not null unique` sin versión, lo que
significa que solo puede existir UN `marketing_30d`. cuando bumpeemos a v2 del
sprint (con casos renovados), ¿cómo manejamos?

**propuesta:** agregar columna `version int not null default 1` y cambiar
constraint a `unique (slug, version)` — alineado con `case_templates`.

luego en queries de "qué sprint vender hoy", filtrar por `status = 'active'`.

mi voto: hacerlo ahora (cheap) vs después (requiere data migration).

## puntos donde mi contrato debe ajustarse al schema

### a. mi `rubric_marketing_v1.yaml` modela `rubric_per_step_per_dimension`

el schema tiene `rubric_criteria.criteria_json jsonb` que puede absorber esto.
pero en mi YAML los criterios viven en `internal.rubric_per_step_per_dimension`,
indexados por `step_X.dimension_Y`. necesito normalizar al schema:

cuando Codex implemente import de rubric YAML → SQL, cada combinación
`(step_key, dimension_key, criterion_high|medium|low)` se inserta como una fila
en `rubric_criteria` con:
- `criteria_key`: `step_1.privacidad.high` (o equivalente)
- `criteria_json`: `{"text": "...", "applies_to_step": "step_1", "tier": "high"}`
- `is_public`: false

esto es trabajo del importer, no del schema. mi YAML está bien para humanos.

### b. mi `sprint_marketing_30d.yaml` tiene `commercial.pricing_band_usd`

el schema tiene `sprint_packages.price_usd numeric(12,2)` (un solo precio, no
banda). para v0 esto OK — Pablo decide UN precio cuando salga. pero documento
que en mi YAML está como banda.

cuando Codex importe, toma `commercial.pricing_band_usd.min_per_seat` por
default y deja `commercial.pricing_band_usd.max_per_seat` en `config_json`
para referencia futura.

### c. `transfer_delta` como evidence_kind

mi case_template define `transfer_delta` como `evidence_emitted.kind`. el schema
tiene `evidence_snapshots.evidence_kind text not null` (sin CHECK constraint).
flexibilidad ✓. Codex puede agregar constraint con los 5 kinds v0:
```sql
evidence_kind text not null check (evidence_kind in (
  'readiness_dimension_scores',
  'risk_events_detected',
  'decision_replay',
  'transfer_delta',
  'manager_recommendation'
))
```

mi voto: agregar la constraint para forzar disciplina v0.

## resumen accionable

| # | item | severidad | bloqueante para migrar? |
|---|---|---|---|
| 1 | falta `certificate_export` en `reports.report_type` | medium | sí — afecta deliverable del sprint |
| 2 | memberships con role duplicable | low | no — documentar |
| 3 | falta tabla `human_review_queue` | high | sí — SLA del sprint package depende |
| 4 | dimension_scores en jsonb | low | no |
| 5 | falta validación `evaluates_dimensions` ⊂ rubric | low | no — app layer |
| 6 | `sprint_packages.slug` sin versión | medium | recomendable resolver ahora |
| c | constraint en `evidence_kind` con 5 kinds v0 | medium | recomendable |

**bloqueantes para migrar:** items 1, 3.
**recomendables resolver ahora:** items 6, c.
**no bloqueantes:** items 2, 4, 5, b.

## próximo paso

Codex revisa este audit. una vez resueltos los 2 bloqueantes (certificate_export
+ human_review_queue), schema queda listo para migración. mi voto: corremos
migración a Supabase en branch `simulador-v0` (NO main hasta que Pablo apruebe).

cuando schema cierre, Claude empieza segundo caso del Sprint:
`marketing_copy_with_brand_voice`.
