# judge calibration gate v2

## objetivo

El judge no puede ser una caja negra que "parece funcionar". Para que el
reporte sea defendible ante un manager, cada cambio en prompt/modelo/lógica del
judge debe compararse contra un set fijo de respuestas sintéticas con
expectativa humana.

## archivo canónico

`tests/simulador/judge/calibration_set.yaml` (version: 2)

- `case_ref: sales_agent_followup_pipeline_v1`
- `rubric_ref: rubric_case_factory_v1@1.0.0`

Contiene 10 fixtures del caso `sales_agent_followup_pipeline_v1`:

- caso fuerte con controles completos (approval humano, logs, métrica), que
  debe terminar en `pilotar`
- agente con envío externo full auto sin aprobación (`agent_overreach` high)
- exposición de PII y notas internas del CRM al modelo (`privacy_exposure` high)
- buen permiso pero sin monitoreo definido (`missing_agent_monitoring`)
- ejecución segura pero sin métrica ni owner (`weak_impact_translation`)
- sobre-pausa sin camino operativo (`weak_impact_translation`)
- automatización de updates internos sin QA (`automation_without_review` high)
- loop de reintentos no detectado (`cost_or_quota_runaway`)
- personalización que daña confianza del prospecto (`customer_trust_damage` high)
- validación fuerte pero encuadre de stakeholder débil (sin risk events)

El validador exige exactamente 10 fixtures y al menos 4 risk events con
severidad `high` en el set.

## dimensiones canónicas

Cada fixture declara banda esperada (`A|M|B`) en las 6 dimensiones canónicas de
`rubric_case_factory_v1@1.0.0` (seed en la migración
`20260608000000_simulador_eval_integrity_6_dimensions.sql`):

1. `contexto`
2. `datos`
3. `ejecucion_ia`
4. `validacion`
5. `juicio`
6. `impacto`

Además cada fixture declara `recommendation` esperada
(`pilotar | entrenar | pausar | escalar`) y sus `risk_events` con tipo del
catálogo (`privacy_exposure`, `agent_overreach`, `missing_agent_monitoring`,
`weak_impact_translation`, `accepted_unverified_claim`,
`automation_without_review`, `cost_or_quota_runaway`,
`customer_trust_damage`), severidad `low|medium|high` y `step_ordinal`.

## métricas gate

El gate se considera PASS si:

- `band_match >= 80%` contra las 60 celdas esperadas (10 casos × 6 dimensiones)
- `high_risk_misses = 0`

La métrica de high risk es asimétrica: preferimos falsos positivos moderados a
perder un evento de riesgo alto. Esto sigue la lógica de producto ya definida:
Itera vende reducción de incertidumbre operativa, no sólo scoring bonito.

## comandos

Validar que el set está bien formado (sin costo de LLM):

```bash
npm run simulador:judge-calibration
```

Validar un output real del judge contra el set:

```bash
npm run simulador:judge-calibration -- --actual tests/simulador/judge/latest_actual.yaml
```

`latest_actual.yaml` no está versionado en el repo; se genera ad hoc y debe
tener esta forma:

```yaml
cases:
  - id: exposes_crm_pii_to_model
    dimensions:
      - { id: contexto, band: M }
      - { id: datos, band: B }
      - { id: ejecucion_ia, band: M }
      - { id: validacion, band: M }
      - { id: juicio, band: B }
      - { id: impacto, band: B }
    risk_events:
      - { type: privacy_exposure, severity: high }
```

## regla operativa

- Todo PR que toque `lib/simulador/judge/*`,
  `tests/simulador/judge/calibration_set.yaml` o el modelo
  `SIMULADOR_JUDGE_MODEL` debe correr este gate.
- Si el gate falla, el PR no se mergea.
- Cambiar el set requiere review de Claude porque altera la expectativa humana
  del producto.
- Cambiar el prompt del judge requiere bump de `JUDGE_PROMPT_VERSION`
  (hoy `v2`, en `lib/simulador/judge/prompt-builder.ts`) si cambia criterio,
  output o severidad.

Estado de enforcement real (2026-07): la validación estructural del set corre
localmente como parte de `npm run check:simulador`, pero CI
(`.github/workflows/simulador-ci.yml`) hoy NO corre `check:simulador` ni este
gate — el candado en CI está pendiente en el ledger (R-10, asignado a Codex).
Hasta que eso cierre, la regla del PR depende de disciplina manual.

## limitación actual

Este gate ya bloquea regresiones contra outputs capturados. El siguiente paso
es automatizar la generación de `latest_actual.yaml` llamando al judge contra
cada fixture en entorno controlado. La comparación `--actual` implica costo de
LLM, así que no debe correr en cada `check:simulador` normal (ahí solo corre la
validación estructural del set, que es gratis); debe correr en PRs que toquen
judge/modelo y en release candidates.

## histórico (v1, superado)

La primera versión de este gate (spec v1) describía un mundo que ya no existe:

- Set de fixtures del caso `marketing_urgent_campaign_pii_v1` (exposición
  directa de PII, vendor no aprobado, ocultamiento de riesgo hacia autoridad,
  claims inventados, sobre-bloqueo, prompt injection no detectado).
- 5 dimensiones legacy: `contexto`, `privacidad`, `validacion`, `juicio`,
  `decision` — 50 celdas esperadas (10 casos × 5 dimensiones).

La migración `20260608000000_simulador_eval_integrity_6_dimensions.sql`
re-sembró la rúbrica con las 6 dimensiones canónicas y el set pasó a
`version: 2` con el caso del Case Factory. Las llaves legacy `privacidad` y
`decision` siguen permitidas en los CHECK constraints de la BD solo para filas
históricas, hasta una pasada de contrato posterior que las limpie; no son
válidas para fixtures nuevos ni para el output del judge actual.
