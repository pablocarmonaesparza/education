# Audit Codex -> Claude — 2026-05-12

> revision tecnica del contrato v0 completo despues del primer pase de Claude
> y del audit de schema. objetivo: dejar a Claude desbloqueado para el segundo
> caso y dejar el SQL listo como candidate, no aplicado.

## conclusion general

El contrato ya tiene estructura base suficiente para avanzar con runtime minimo:

- `case_template / case_variant / simulation_session / simulation_step_events` esta separado.
- Los ocho casos del sprint son ejecutables como contrato.
- Las 5 dimensiones son consistentes: `contexto`, `privacidad`, `validacion`, `juicio`, `decision`.
- Los 5 step types v0 estan cubiertos: `data_scope`, `llm_beat`, `artifact_review`, `decision_select`, `decision_open_short`.
- Las 4 acciones manager estan cerradas: `pilotar`, `entrenar`, `pausar`, `escalar`.
- El loop conserva la tesis: caso vivo -> evaluacion -> practice final -> re-sim -> evidencia -> accion manager.

## cambios aplicados por Codex

### 1. schema SQL candidate

Se resolvieron los bloqueantes del audit Claude:

- `reports.report_type` ahora acepta `certificate_export`.
- `reports` agrega `user_id` nullable para certificados individuales opt-in.
- Nueva tabla `human_review_queue` para baja confianza del judge, high risk, user flags y random audit.

Tambien se aplicaron recomendables:

- `sprint_packages.version` y `unique(slug, version)`.
- `evidence_snapshots.evidence_kind` restringido a los 5 evidence kinds v0.
- comentario explicito: memberships tienen roles aditivos en v0.
- indice para `human_review_queue(status, due_at)`.

### 2. re-simulacion

Se corrigio una frase en la variante enterprise US que decia que subia el peso
de `juicio`. Eso chocaba con la regla cerrada:

- primary y re-sim usan la misma rubrica y los mismos pesos.
- el cambio de contexto altera interpretacion cualitativa y risk_events, no la formula.

### 3. handoff y status

`HANDOFF.md`, `README.md` y `STATUS.md` quedan actualizados para reflejar:

- Claude completo el primer paquete de producto.
- Codex completo schema/runtime/modelo candidate.
- No hay bloqueo vivo para Claude.
- No se debe correr migracion remota sin aprobacion explicita de Pablo.

## audit tecnico del contrato producto

### caso #1: marketing_urgent_campaign_pii

`casos/marketing_urgent_campaign_pii_v1.yaml` esta bien estructurado para runtime:

- Cada step declara `type`, `capture`, `evaluates` y gap logic.
- El `llm_beat` respeta max 2 turns.
- `evidence_emitted` incluye `transfer_delta`.
- `authoring_meta.initial_review_pending` puede pasar a false cuando Claude acepte este audit.

### caso #2: marketing_copy_with_brand_voice

`casos/marketing_copy_with_brand_voice_v1.yaml` esta bien estructurado para runtime:

- No repite el mismo riesgo del caso #1; prueba contexto, validacion, juicio y decision desde voz de marca.
- Conserva los mismos 5 step types v0.
- Incluye `data_scope` sin PII para demostrar que el tipo tambien sirve para seleccionar contexto interno.
- La re-sim cambia de B2B corporate-calido a B2C irreverente Gen Z, lo que prueba transferencia del principio y no memorizacion del tono.
- Nuevos gaps y practice beats estan correctamente mapeados.

### caso #3: marketing_segment_with_sensitive_data

`casos/marketing_segment_with_sensitive_data_v1.yaml` esta bien estructurado para runtime:

- Sube a `difficulty: intermediate`, lo cual prueba matiz del judge y no solo deteccion mecanica.
- No repite el caso #1: el riesgo central es behavioral data + bias predictivo en segmentacion, no solo PII cruda.
- Incluye una respuesta a peer/compliance en step 5, util para evaluar transparencia organizacional.
- La re-sim EU/GDPR cambia regimen operativo sin cambiar pesos de rubrica.
- Nuevos gaps y practice beats estan correctamente mapeados.

### casos #4-#8

Detectados como ready en el contrato:

- `marketing_brief_to_agency_via_ia`
- `marketing_ad_creative_with_competitor_research`
- `marketing_attribution_reporting_to_cmo`
- `marketing_content_calendar_under_pressure`
- `marketing_crisis_response_with_ia`

No hay bloqueo estructural para runtime: usan los mismos step types, dimensiones, evidencia y patron primary/resim. Requieren audit fino de producto antes de marcarlos como cerrados para venta, pero tecnicamente caben en el contrato v0.

### variantes

Las variantes primary/resim de los casos 1-6 estan listas:

- caso #1 primary: LATAM SaaS B2B, PII de customer feedback, gobierno informal.
- caso #1 resim: enterprise US, sales pipeline sensible, DPO disponible.
- caso #2 primary: Loop B2B, tono corporate-calido, audiencia ops managers.
- caso #2 resim: NubeFresh B2C, tono irreverente Gen Z, audiencia D2C.
- caso #3 primary: Loop LATAM, CRM 8.4k leads, regimen informal.
- caso #3 resim: NordLinx EU/GDPR, CRM 62k leads, DPO + DPIA.

Ambas marcan `inputs_resolved.synthetic: true`.

### rubrica

`rubric_marketing_v1.yaml` esta alineada con el schema:

- capa publica e interna separadas.
- pesos versionados.
- deterministic overrides antes del LLM judge.
- confidence threshold conectado a `human_review_queue`.

Nota tecnica: el importer debera normalizar `rubric_per_step_per_dimension`
a filas de `rubric_criteria`.

### sprint package

`sprint_marketing_30d.yaml` queda como SKU draft:

- 8 casos planeados, 8 ready.
- pricing band es tentativo y queda en producto, no en schema como decision final.
- deliverables manager/empleado ya estan cubiertos por `reports` y `evidence_snapshots`.

## no bloqueantes para v0

- `dimension_scores_json` puede seguir como jsonb. Si hay volumen real, se desnormaliza despues.
- Validar que `case_steps.evaluates_dimensions` pertenezca a la rubrica puede vivir en app-layer v0.
- No hace falta tabla separada de `certificate_exports` todavia.

## siguiente trabajo recomendado

### Claude

Puede pasar a audit fino del sprint completo:

- coherencia narrativa de los 8 casos
- redundancia entre gaps/practice beats
- progresion de dificultad baseline -> intermediate -> advanced
- fuerza del paquete para comprador

### Codex

1. generar seed SQL revisable desde el importer.
2. reemplazar eval stub con LLM-as-judge versionado.
3. preparar migracion Supabase solo cuando Pablo lo apruebe.
4. no aplicar nada remoto todavia.

## validacion automatizada agregada

Codex agrego `npm run simulador:validate`.

Resultado actual:

```text
simulador contract OK
cases: 8 (8 ready, 0 planned)
variants: 16
practice_beats: 20
rubric: rubric_marketing_v1@1.0.0
```

## estado final

Sin bloqueo tecnico para continuar. Schema candidate listo para segunda revision cruzada antes de convertirse en migracion.

## addendum post-audit Claude CLI

Claude CLI hizo una segunda revision tecnica y marco cinco bloqueantes antes de migrar. Codex los resolvio asi:

- `sprint_packages` conserva `price_usd` como minimo operativo y agrega `pricing_json` para no perder el pricing band tentativo.
- `sprint_package_cases` ahora modela `status`, `primary_variant_id`, `resim_variant_id`, `dimensions_emphasized`, `difficulty` y `tension`.
- `assignments` distingue `assignment_kind` (`primary` | `resimulation`) y `parent_assignment_id`.
- `case_steps.step_key` usa formato estable `step_<id>` desde `lib/simulador/contracts.ts`.
- `risk_events` guarda `dimension_key` en SQL y `dimension` en runtime.

Tambien se corrigio el orden del SQL: `sprint_package_cases` se crea despues de `case_variants` porque referencia variantes por UUID.

El validador ahora cruza:

- variants primary/resim del Sprint contra archivos reales;
- status/dimensiones/dificultad/tension por caso ready;
- practice beats mapeados en casos contra el catalogo del Sprint;
- catalogo del Sprint contra archivos reales de practice beats.

Resultado local despues del fix:

```text
simulador contract OK
cases: 8 (8 ready, 0 planned)
variants: 16
practice_beats: 20
rubric: rubric_marketing_v1@1.0.0
```
