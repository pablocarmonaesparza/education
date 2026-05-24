# Backend requirements — Case Factory

## Campos que debe soportar `case_templates`

- `level`: N1, N2, N3.
- `career_track`: marketing, sales, cs, ops, finance, hr, legal, product, leadership.
- `freshness_type`: evergreen, current, hybrid.
- `evergreen_weight`.
- `current_weight`.
- `estimated_minutes`.
- `decay_signal`.
- `last_verified_at`.
- `refresh_due_at`.
- `manager_outcome_json`.
  - debe incluir `primary_question`, `assignment_brief`, `business_metric`,
    `risk_metric` y `expected_signal`.
- `output_spec_json`.
- `failure_modes_json`.
- `criteria_weights_json`.
- `judge_prompt_ref`.
- `status`: draft, review, published, needs_refresh, deprecated.

## Tablas necesarias

- `case_tags`: tags por departamento, rol, industria, seniority, herramienta.
- `tool_registry`: herramientas, categoria, vigencia y fecha de revision.
- `case_prerequisites`: dependencias entre casos.
- `case_quality_reviews`: firma humana de calidad.
- `case_refresh_queue`: casos que requieren revision por vigencia.
- `case_judge_prompts`: prompts versionados por caso.
- `case_factory_runs`: historial de importacion/validacion.

## Validaciones de DB

- Pesos de criterios por caso suman 100.
- Caso current/hybrid tiene `refresh_due_at`.
- Caso publicado tiene al menos un primary y un resim.
- Caso publicado tiene al menos un practice mapping.
- Caso N3 tiene al menos un control de agente: permisos, monitoreo, fallback o escalation.

## Integracion con lo existente

El schema actual ya tiene parte de esto: templates, variants, sessions, reports,
risk events, practice beats, transfer delta, history y alerts. Esta capa agrega
la metadata necesaria para fabricar y mantener 50+ casos sin perder calidad.
