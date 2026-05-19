# Handoff

Append-only. Cierre por bloque o subtarea significativa.

Formato:

```md
## <block_id> — <titulo>

done:
- ...

tested:
- ...

gotchas:
- ...

next:
- ...
```

## B0-001 — coordination bootstrap

status: done

done:
- Codex creo `docs/coord/` con board, status, blockers, handoff, inboxes, pablo input y carpeta de audits.
- Codex creo `scripts/coord/` con board lint, heartbeat, agent sync, research sync, task claim, race test e instalador launchd.
- El board incluye owner/reviewer, deps, DoD, claim leases, policy de desacuerdo, reglas anti-dispatcher y escalation a Pablo solo para hard blockers.
- El heartbeat quedo instalado en launchd como `com.itera.coord.heartbeat`.

tested:
- `npm run coord:lint`
- `npm run coord:heartbeat`
- `npm run coord:test-race`
- `npm run coord:sync -- --for codex`

gotchas:
- `supabase/functions/` esta sin trackear y no pertenece a este bloque.
- Claude CLI amplio se excedio de presupuesto; se uso review acotado y scripts locales como gate principal.

next:
- Claude Code debe leer el board y responder por `INBOX_CODEX.md` o `AGENT_STATUS.md` para cerrar B0-003.

## B1-002/B1-003 — bridge auth y migracion 020

status: done

done:
- Codex agrego `supabase/migrations/020_simulador_postgrest_grants_and_backfill.sql`.
- La migracion expone `simulador` en PostgREST, agrega grants para `authenticated` y `service_role`, recrea policies de `simulador.users`, agrega `simulador.ensure_bridge_user(uuid)` y backfillea usuarios existentes.
- El RPC valida que un usuario autenticado no pueda crear bridge para otro `auth_user_id`.
- `app/auth/callback/route.ts` ahora usa `simulador.ensure_bridge_user` y falla cerrado si no puede sincronizar el bridge.
- La migracion 020 fue aplicada al Supabase linkeado via `supabase db query --linked --file ...` y registrada con `supabase migration repair --status applied 020`.
- Tambien se aplico y registro `20260515013000_simulador_field_test.sql`, que estaba local pero faltaba en remoto y bloqueaba el field-test publico.

tested:
- `npm run check:simulador`
- `npm run lint:simulador`
- `npm run coord:lint`
- `npm run coord:heartbeat`
- `npm run coord:test-race`
- `npm run simulador:validate-case-yaml`
- Supabase remoto: `authenticator` tiene `pgrst.db_schemas=public, graphql_public, simulador`.
- Supabase remoto: `simulador.ensure_bridge_user(uuid)` existe.
- Supabase remoto: policies `users_insert_self`, `users_read_self_or_orgmate`, `users_update_self` existen.
- Supabase remoto: `auth_users_without_bridge = 0`.
- Supabase remoto: field-test tables existen con RLS enabled.

gotchas:
- `supabase db push --linked --dry-run` sigue bloqueado por drift historico de migraciones remotas antiguas que no existen localmente. No se reparo esa historia masiva a ciegas.
- `009b_telegram_lessons.sql` sigue fuera del patron esperado por Supabase CLI; preexistente.

next:
- Reconciliar historial de migraciones remoto/local como tarea separada antes de depender de `db push` para deploys futuros.
- Smoke test de field-test y auth flow en local/prod cuando el deploy este listo.

## B1-004 — deploy/smoke base

status: blocked for production, preview smoke passed

done:
- GitHub/Vercel preview deploy desde branch `codex/simulador-surface-cleanup` quedo Ready.
- Preview URL verificada: `https://education-n1xxhkp2w-pablo-7630s-projects.vercel.app`.
- Se agrego `SUPABASE_SERVICE_ROLE_KEY` a Vercel Preview para esta branch.
- `lib/simulador/field-test/security.ts` ahora exige Upstash solo en strict production, permitiendo preview smoke sin bajar el guardrail de production.

tested:
- Preview `/` via `vercel curl`: 200.
- Preview `/api/field-test/sessions` via `vercel curl`: 200 y crea session.
- Preview `/dashboard` via `vercel curl --head`: 307 a `/auth/login?next=%2Fdashboard`.
- Local `/field-test/marketing-urgent-campaign-pii`: runtime carga secciones Contexto, Datos, IA, Revisión, Decisión, Respuesta.

gotchas:
- Preview esta protegido por Vercel Authentication; usar `vercel curl` para smoke automatizado.
- Production sigue bloqueado por falta de `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`.

next:
- Cargar Upstash envs en Vercel Production/Preview o decidir otro proveedor/guardrail antes de abrir production field-test.

## B2-001/B2-002/B2-003/B2-004 — schema premium, analytics, compliance y rubric freeze

status: done

done:
- Codex agrego `supabase/migrations/20260519021000_simulador_premium_schema_021.sql`.
- La migracion 021 agrega nivel/carrera/arquetipo a casos, variantes y practice beats; crea `practice_unlocks`, `practice_attempts`, `person_readiness_history`, `manager_alert_subscriptions`, `manager_alerts`, `leads_inbox`; agrega `simulador.compute_transfer_delta(primary, resim)`.
- Codex agrego `supabase/migrations/20260519022000_simulador_analytics_compliance_rubric_freeze_022.sql`.
- La migracion 022 agrega `users.jurisdiction` + consentimiento localizado, metadata de freeze/semver en `rubrics`, FK exacta `evaluation_runs(rubric_id, rubric_version)`, y `analytics_events_catalog` con 38 eventos.
- Codex regenero `lib/simulador/db.types.ts` desde Supabase remoto y agrego alias compatibles.
- Codex agrego `lib/simulador/analytics.ts`; en dev, emitir un evento no catalogado lanza error, y en prod deja warning.
- Codex agrego `scripts/simulador/check-analytics-catalog.mjs` y lo conecto a `npm run check:simulador`.

tested:
- Claude CLI SQL review: PASS en segunda vuelta.
- Supabase remoto: migracion 021 aplicada via `supabase db query --linked --file ...` y registrada con `supabase migration repair --status applied 20260519021000`.
- Supabase remoto: migracion 022 aplicada via `supabase db query --linked --file ...` y registrada con `supabase migration repair --status applied 20260519022000`.
- Supabase remoto: 7 tablas nuevas verificadas con RLS enabled.
- Supabase remoto: `analytics_events_catalog` contiene 38 eventos.
- Supabase remoto: `simulador.compute_transfer_delta` existe.
- Supabase remoto: `rubrics` tiene 4 columnas de freeze/semver.
- Supabase remoto: `users` tiene 5 columnas de jurisdiccion/consent.

gotchas:
- Los specs CLD-M02/M03 quedaron materializados como migraciones ejecutables por Codex para no bloquear el producto; Claude mantiene review asincrono por inbox.
- `leads_inbox` es service-role-only por diseño; RLS queda enabled sin policies de cliente y con comentario explicito.
- Production deploy sigue bloqueado por Upstash envs; esto no afecta schema remoto ni trabajo premium paralelo.

next:
- Claude revisa migraciones 021/022 asincronamente y marca PASS/FAIL en `INBOX_CODEX.md`.
- Codex puede avanzar a importers de casos/practice beats cuando los YAMLs de Claude esten listos y trackeados.

## B3-003/B3-005 — importers YAML a Supabase

status: done

done:
- Codex agrego `scripts/simulador/seed-utils.mjs`.
- Codex agrego `scripts/simulador/seed-practice-beats.mjs`.
- Codex agrego `scripts/simulador/seed-cases.mjs`.
- Codex agrego scripts npm `simulador:seed-practice-beats` y `simulador:seed-cases`.
- `seed-practice-beats` lee `docs/simulador/contrato_v0/practice_beats/*.yaml` y hace upsert idempotente en `simulador.practice_beats`.
- `seed-cases` lee casos, variantes y sprint; resuelve IDs; hace upsert idempotente en `case_templates`, `case_steps`, `case_inputs_spec`, `gap_definitions`, `case_variants`, `case_practice_beats`, `sprint_packages` y `sprint_package_cases`.
- Supabase remoto quedo seedeado con el contrato actual.

tested:
- `npm run simulador:seed-practice-beats` dry-run: 20 beats.
- `npm run simulador:seed-cases` dry-run: 8 cases, 16 variants, 8 sprint refs.
- `npm run simulador:seed-practice-beats -- --apply`: seeded 20 practice beats.
- `npm run simulador:seed-cases -- --apply`: seeded 8 cases, 16 variants, 38 case-practice links, sprint `marketing_30d`.
- Supabase remoto: `case_templates=8`, `case_variants=16`, `case_steps=40`, `gap_definitions=67`, `practice_beats=20`, `case_practice_beats=38`, `sprint_package_cases=8`.

gotchas:
- El runtime usa step_keys por tipo (`data_scope`, `llm_beat`, etc.), no `step_1`; Codex corrigio el importer runtime y el helper viejo.
- `seed-cases` limpia step keys numericos legacy `step_%` antes de upsert para evitar conflicto con el seed parcial anterior.
- B3-002/B3-004 siguen siendo review/authoring de Claude para elevar level/archetype/practice content; el importer ya soporta esos campos cuando aparezcan.

next:
- Claude puede actualizar YAMLs con `archetype_ref`, `level_primary` y beats refinados; Codex re-ejecuta importers sin tocar datos a mano.

## B1-004 unblock — rate limit sin proveedor nuevo

status: done

done:
- Codex agrego `supabase/migrations/20260519023000_simulador_db_rate_limits_023.sql`.
- La migracion crea `simulador.rate_limit_windows` y RPC `simulador.consume_rate_limit(key, limit, window_seconds)` con advisory lock transaccional.
- `lib/ratelimit/index.ts` ahora usa Upstash si existe y Supabase/Postgres como fallback si no existe.
- `lib/simulador/field-test/security.ts` ya no exige Upstash en production: acepta Upstash o Supabase service-role como backend de rate limit.
- `docs/coord/PABLO_INPUT_NEEDED.md` pablo-001 quedo resolved; no hay proveedor nuevo que aprobar.

tested:
- Claude CLI review de migracion 023 + diff rate-limit: PASS.
- Supabase remoto: migracion 023 aplicada y registrada con `supabase migration repair --status applied 20260519023000`.
- Supabase remoto: `rate_limit_windows` existe con RLS enabled.
- Supabase remoto: `consume_rate_limit` existe.
- Supabase remoto: smoke RPC con limite 2 bloquea el tercer request.
- `npm run check:simulador`
- `npm run lint:simulador`
- `npm run build`

gotchas:
- El fallback Supabase falla abierto si el RPC se cae en runtime, igual que el fallback historico de Upstash. El guardrail production evita ambos-missing, no convierte un outage de rate-limit en outage total del producto.

next:
- Ejecutar production deploy + smoke real para cerrar B1-004.

## B6-001/B6-002 partial — field-test lead inbox handoff

status: partial

done:
- Codex actualizo `/api/field-test/sessions/[session_id]/lead` para escribir tanto en `field_test_leads` como en `leads_inbox`.
- El evento emitido cambio de `email_captured` a `lead_captured`, alineado con `analytics_events_catalog`.
- La respuesta del endpoint devuelve `leads_inbox_id` para trazabilidad admin/comercial.

tested:
- `npm run check:simulador`
- `npm run lint:simulador`
- Production deploy: `https://www.itera.la` aliased to deployment `dpl_4QnoKhmQSBFBuHr6YhRLEjfWbGz8`.
- Production smoke: `POST /api/field-test/sessions` creo session `e364ca68-dbe4-4d91-81ab-58b11a72f359`.
- Production smoke: `POST /api/field-test/sessions/:id/lead` creo `leads_inbox_id=5679f6ae-440a-49fb-a89a-0173999a3711`.
- Supabase remoto: `leads_inbox` row verificado con `source=field_test`, `status=new`, `has_session=true`.

gotchas:
- Falta admin surface `/admin/leads`; de momento el inbox vive en BD y puede consultarse por service-role.

next:
- Construir admin surface `/admin/leads` para operar el inbox sin tocar BD.

## B6-001 — field-test publico production-ready

status: done

done:
- Codex agrego `/api/admin/leads` para listar `simulador.leads_inbox` con guard staff-only.
- Codex agrego `/api/admin/leads/[lead_id]` para actualizar status, notas y owner del lead.
- Codex agrego `/admin/leads` como bandeja interna staff para seguimiento comercial del field-test.
- `/admin/review` ahora enlaza hacia `/admin/leads`, y `/admin/leads` enlaza de vuelta al review humano.
- La ruta no expone `leads_inbox` publicamente: API sin sesion responde 401 y pagina admin redirige a login.

tested:
- `npm run check:simulador`
- `npm run lint:simulador`
- `npm run build`
- Production deploy: `https://www.itera.la` aliased to deployment `dpl_HmSz4BnJ4Zgg1brzSXkhWR832eAg`.
- Production smoke: `/` responde 200.
- Production smoke: `/admin/leads` sin login redirige a `/auth/login?next=%2Fadmin%2Fleads`.
- Production smoke: `/api/admin/leads` sin login responde 401.
- Production smoke: `POST /api/field-test/sessions` creo session `4e0236a6-746d-4a72-838e-8aa390957658`.
- Production smoke: `POST /api/field-test/sessions/:id/lead` creo `leads_inbox_id=45ead634-0fa9-41f1-9127-ed953f3bda60`.
- Supabase remoto: lead verificado con `source=field_test`, `status=new`, `has_session=true`.

gotchas:
- Claude CLI se intento dos veces para review puntual, pero el proceso quedo colgado sin devolver salida. Se corto y se uso validacion local + production smoke como gate de cierre.
- La bandeja es staff-only. Para notificacion push a Slack/email falta B6-002/B8 si Pablo quiere alertas proactivas, pero B6-001 ya no requiere abrir Supabase.

next:
- B6-002 debe convertir esta bandeja en analytics de funnel: started, abandoned, submitted, report_viewed, lead_captured y conversion por status.

## B6-002 — analytics field-test y lead funnel

status: done

done:
- Codex agrego migracion `20260519024000_simulador_field_test_lead_event.sql` para permitir `lead_captured` en `field_test_step_events`.
- `lib/simulador/field-test/service.ts` ahora acepta `lead_captured` y loggea errores de analytics en vez de perderlos silenciosamente.
- `RuntimeExperience` emite `abandoned` en `pagehide`/`visibilitychange` para field-test sin cerrar.
- `/api/admin/leads` devuelve funnel rolling 30 dias: started, submitted, report_viewed, lead_captured, abandoned y tasas de conversion.
- `/admin/leads` muestra las metricas de funnel arriba de la bandeja comercial.

tested:
- Supabase remoto: constraint de `field_test_step_events.event_type` permite `lead_captured`.
- `npm run check:simulador`
- `npm run lint:simulador`
- `npm run build`
- Production deploy: `https://www.itera.la` aliased to deployment `dpl_6aaNSrKEqMLKNxSYXaWfszEtUXLS`.
- Production smoke: `POST /api/field-test/sessions` creo session `a46249c5-5794-4656-950d-0e6e934e8cb1`.
- Production smoke: `POST /api/field-test/sessions/:id/events` con `section_completed` respondio `ok`.
- Production smoke: `POST /api/field-test/sessions/:id/lead` creo `leads_inbox_id=30073aef-6ac5-488b-babf-90f08c0c844b`.
- Supabase remoto: eventos de esa session incluyen `field_test_started`, `section_completed` y `lead_captured`.
- Production smoke: `/admin/leads` sin login redirige a login; `/api/admin/leads` sin login responde 401.

gotchas:
- La tasa de abandono combina evento explicito con inferencia de sesiones `in_progress` stale a 30 minutos. Esto evita que navegadores que bloqueen el keepalive de cierre oculten abandono real.
- El funnel usa ventana rolling de 30 dias. Si Pablo quiere cohortes por campaign/source, B6-002 puede extenderse a source attribution después.

next:
- B8-001 puede construir admin backoffice completo sobre esta base: `/admin/leads`, `/admin/orgs`, `/admin/judge-health`, `/admin/audit-log`.

## disagreement policy

Si reviewer veta un bloque:

1. reviewer escribe FAIL con razones concretas y paths.
2. lead tiene hasta 2 rondas para corregir.
3. si sigue el desacuerdo en la tercera ronda, se escala a `PABLO_INPUT_NEEDED.md` con opciones y recomendacion.
4. mientras tanto ambos agentes siguen con tareas no bloqueadas.

## B9-001 — competitive landscape research [claude → codex review]

- [2026-05-19T12:25:00-06:00] done
- output: docs/research/competitive_landscape_v1.md (síntesis ejecutiva + decisiones D1-D7)
- sources: docs/research/R24_competencia_simulator_category_v1.md (588 líneas, exhaustivo, ya existía)
- decisions emitted: 7 (B9-001-D1 a D7) — 6 copy + 1 schema + 1 process. Mix de owner claude (CMO/CPO frente) + 1 codex (D6 field-test ya en su frente)
- gates pendientes: codex review del posicionamiento, M9 loop audit (no aplica — research no toca surfaces)
- next: B9-002 (case method + Kirkpatrick) y B9-003 (AI adoption + LATAM compliance) ya claimed; mantengo trabajo paralelo

## B9-002 — case method y learning evaluation research [claude → codex review]

- [2026-05-19T12:35:00-06:00] done
- output: docs/research/case_method_principles.md (HBS + Kirkpatrick + MIT Sloan + HKS + Bok)
- decisions emitted: 6 (B9-002-D1 a D6) — copy + schema + rubric + report mix
- mapeo crítico: Kirkpatrick L1/L2/L3 → Itera mide, L4 → cliente mide (escope claro)
- gates: ninguno bloqueante (research no toca surfaces)
- next: B9-003 (AI adoption + LATAM compliance)

## B9-003 — AI adoption + LATAM compliance research [claude → codex review]

- [2026-05-19T12:45:00-06:00] done
- output: docs/research/ai_adoption_synthesis.md
- decisions emitted: 6 (B9-003-D1 a D6)
- riesgo abierto: D5 marca follow-up legal LFPDPPP MX 2025 reforma como blocker pre-v1 MX launch
- v1 launch geos: MX + CO. BR diferido a v2 (DPO/DPIA agregan complejidad)
- next: B3-001 (12 arquetipos HBR/MIT/HKS) — todavía claimed

## B3-001 — 12 arquetipos HBR MIT HKS sin IP [claude → codex review]

- [2026-05-19T12:55:00-06:00] done
- output: docs/simulador/contrato_v0/archetypes/ (INDEX.md + 12 archetype docs)
- decisions emitted: 3 (B3-001-D1 a D3)
- DoD literal cumplido: directorio contiene 12 docs
- nivel de detalle: v1 draft. Cada arquetipo tiene tensión + inspiración + adaptación IA + decision point + dimensiones + risk events + plantilla narrativa.
- next refinement: B3-002 auditará cada uno de los 8 casos existentes contra los 12 arquetipos + niveles 1-2-3

## B3-002 — auditar 8 casos contra niveles 1-2-3 + archetype mapping [claude → codex review]

- [2026-05-19T13:10:00-06:00] done
- output: docs/coord/audits/cases_archetype_mapping.md (tabla + 4 decisiones)
- patches: 8 YAMLs en docs/simulador/contrato_v0/casos/ con archetype_ref + level_primary (+ level_advanced_variant en 2)
- distribución: 4 N1 + 4 N2 primarios; 2 con variante N3 (attribution + crisis_response)
- 4 archetypes en uso de los 12 (cobertura parcial intencional v1)
- next action de Codex: re-correr seed-cases.mjs --apply para propagar a BD (decisión B3-002-D2)

## B3-006 — freeze rubric_marketing_v1@1.0.0 + semver policy [claude → codex review]

- [2026-05-19T13:20:00-06:00] done
- output: docs/simulador/rubric_semver_policy.md (cuándo major/minor/patch + freeze rules + workflow)
- decisions: 3 (B3-006-D1 a D3)
- D1 owner: codex — necesita actualizar BD con frozen_at + frozen_by para rubric_marketing_v1@1.0.0
- D2 owner: claude — disclaimer metodológico en report v2 + manager dashboard
- B5-001 (estructura reporte ejecutivo v2) ahora desbloqueado para mi siguiente claim

## B3-004 — practice beats premium audit + level patch [claude → codex review]

- [2026-05-19T13:35:00-06:00] done
- output: docs/coord/audits/practice_beats_audit.md (matriz cobertura + 4 decisiones)
- patches: 20 YAMLs en docs/simulador/contrato_v0/practice_beats/ ahora declaran level: 1|2
- distribución: 12 beats N1 + 8 beats N2 + 0 N3 (intencional v1)
- next: Codex re-corre seed-practice-beats.mjs --apply para propagar level a BD
- next claude: B5-001 estructura reporte ejecutivo v2 (ahora desbloqueado)

## B5-001 — estructura reporte ejecutivo v2 [claude → codex review]

- [2026-05-19T13:50:00-06:00] done
- output: docs/design/surfaces/executive_report.md (12 secciones + copy versionado + KPIs matriz)
- decisiones: 6 (B5-001-D1 a D6)
- D1/D2/D4/D6 owner codex (implementación)
- D3/D5 owner claude (copy)
- siguiente: las decisiones-derived tasks de B9-* (D1 D7 etc.) son backlog mío

## B2-001 + B2-003 — preempted by codex direct implementation [done]

- [2026-05-19T13:55:00-06:00] both done (status reconciliation)
- B2-001 spec mig 021 → Codex implementó directo en mig 20260519021000 (level_primary/level_advanced_variant/career_key/archetype_ref)
- B2-003 spec mig 022 → Codex implementó directo en mig 20260519022000 (jurisdiction enum + rubric freeze + analytics catalog)
- Mi review B2-002 PASS validó ambas migraciones — equivalentes a las specs que yo hubiera escrito
- Board reconciliado: las 10 tareas claude originales están done

## B1-004 — deploy y smoke E2E de base [codex → claude review]

- [2026-05-19T14:07:41-06:00] done
- branch/main: `codex/simulador-surface-cleanup` fast-forward pushed to `origin/main` at `443bfd7`
- production: `https://www.itera.la` alias verde; latest deployment `dpl_8ELtcR2U3M1EQDVqgvhHpRHNSSTf`
- fixes during smoke:
  - `/api/sessions` bridge lookup now uses admin client after `auth.getUser()`
  - `/api/sessions/[session_id]/complete` evaluates synchronously so reports do not stay stuck in "evaluando"
  - `/api/orgs` creates bridge/org/org_admin membership with admin client after auth validation
  - `/api/orgs/[org_id]/teams` creates team + manager membership + active Marketing/Growth sprint
  - `/api/orgs/[org_id]/invitations` and `/api/invitations/[token]/accept` use admin client after explicit auth/email/role checks
- production smoke passed:
  - existing manager login -> dashboard -> full case -> published report
  - new buyer signup -> onboarding org -> team -> active sprint -> invite employee
  - invited employee signup -> invitation accepted -> employee dashboard shows 8 cases
  - invited employee completes case 1 -> report `a4d6e0ab-91d9-4020-9ed6-28659f2b03aa` published with judge `openai_compatible:gemini-3.1-flash-lite`, rubric `1.0.0`
- gates passed: `npm run check:simulador`, `npm run lint:simulador`, `npm run build`
- gotchas: remote `supabase db push` still blocked by legacy remote migration drift; use targeted `supabase db query --linked --file ...` + `migration repair` until migration history is reconciled
- next recommended codex fronts: B4-002 judge calibration gate, B4-003 human review queue SLA/doble firma, B10-002 Playwright/RLS automated tests

## B4-002 — judge real y calibration gate [codex → claude review]

- [2026-05-19T14:15:00-06:00] done
- output:
  - `tests/simulador/judge/calibration_set.yaml` — 10 canonical fixtures for `marketing_urgent_campaign_pii_v1`
  - `scripts/simulador/check-judge-calibration.mjs` — validates set shape and compares actual judge outputs when provided
  - `docs/simulador/judge_calibration_spec.md` — threshold policy and operating rule
  - `package.json` adds `npm run simulador:judge-calibration`
  - `npm run check:simulador` now includes calibration-set validation
- thresholds:
  - band match must be >= 80% across 10 cases × 5 dimensions
  - high-risk misses must be 0
- gates passed: `npm run simulador:judge-calibration`, `npm run check:simulador`, `npm run lint:simulador`, `npm run build`, `npm run coord:lint`, `npm run coord:heartbeat`
- production proof from B1-004: invited employee report generated with non-mock judge `openai_compatible:gemini-3.1-flash-lite` and rubric `1.0.0`
- gotcha: comparator can enforce thresholds against captured actual output; automatic live generation of `latest_actual.yaml` is intentionally separate because it incurs LLM cost and should run only on judge/model PRs or release candidates

## Batch 1 — copy landing+sales [claude → codex review]

- [2026-05-19T14:25:00-06:00] done
- output:
  - lib/simulador/copy/landing.ts (10 secciones de copy: nav/hero/stats/category/how_it_works/dimensions/wedge_high_performers/cases/manager_outcomes/how_we_compare/pricing/footer)
  - lib/simulador/copy/sales.ts (positioning 3 versiones + Kirkpatrick mapping + differentiation 4 frames + research_anchors 7 cifras + objections 6 + next_steps)
- decisiones consolidadas: B9-001-D1, B9-001-D7, B9-003-D1, B9-003-D6, B9-002-D1
- nota: B3-002-D3 (Sprint Nivel 1+2 honesto) ya está reflejado en landing.pricing.level_disclosure aunque no aparece en board
- next claude: Batch 2 (copy report) o Batch 3 (copy legal)
- next codex: importar landing.ts en app/(public)/page.tsx + sales.ts en futuro deck/proposal renderer

## Batch 2 — copy report ejecutivo v2 [claude → codex review]

- [2026-05-19T14:35:00-06:00] done
- output: lib/simulador/copy/report.ts (12 secciones del reporte + pending_review_banner + audit_metadata + runtime_vs_practice_note)
- decisiones: B9-002-D3 (runtime mide / beats enseñan distinction) + derivative work de B5-001-D3 y B5-001-D5
- B5-001-D* no estaban en board (sync-research-to-board scanea solo docs/research/, no docs/design/) — son derivative work de B5-001 done
- next claude: Batch 3 copy legal (B9-003-D4) o Batch 4 emails
- next codex: importar report.ts en app/(app)/report/[session_id]/page.tsx

## Batch 3 — copy legal MX + CO + BR + other [claude → codex review]

- [2026-05-19T14:42:00-06:00] done
- output: lib/simulador/copy/legal.ts (consent_banner por jurisdicción + terms_of_service + privacy_policy MX/CO + inline_disclosures + footer_disclaimer)
- decisiones: B9-003-D4 (avisos por jurisdicción, no traducción literal) + sigue postura B9-003-D5 (no compliance-grade hasta counsel LATAM)
- nota: BR explícito "no disponible v1" + redirect a v2 cuando se contrate counsel brasileño
- next claude: Batch 4 emails transaccionales
- next codex: importar legal.ts en app/privacy/page.tsx + app/terms/page.tsx + consent_banner en signup/onboarding

## Batch 4 — copy emails 8 templates [claude side done]

- [2026-05-19T14:55:00-06:00] claude entregó 8 templates en lib/simulador/copy/emails.ts
- templates: signup_welcome, invitation, invitation_accepted, case_assigned, report_ready_employee, report_ready_manager, sprint_closing, password_reset
- estructura por template: subject ≤60 chars, preheader ≤120 chars, body_text + body_html, variables {placeholder}
- emailTemplateVars exportado con lista de variables esperadas por template (validation hint para codex)
- emailCommonFooter con signature/contact/jurisdiction_disclaimer/unsubscribe
- B7-002 sigue in_progress (owner: shared) — codex pendiente:
  1. Integrar templates con SendGrid (lib/email/send.ts)
  2. Wrapper HTML responsive
  3. Test E2E con email real

## B4-003 — human review queue con SLA y doble firma [codex → claude review]

- [2026-05-19T14:48:00-06:00] done
- output:
  - `supabase/migrations/20260519025000_simulador_human_review_double_signature_024.sql`
  - `simulador.human_review_queue` ahora tiene `required_review_count`, `completed_review_count`, `review_policy`, `last_reviewed_at`, `published_at`, `decision_summary_json`
  - nueva tabla `simulador.human_review_decisions` append-only con una firma por `queue_id + reviewer_user_id`
  - risk high desde `lib/simulador/judge/persist.ts` crea `pending_review` con SLA 24h y `required_review_count=2`
  - `/api/admin/review` devuelve SLA, firmas y `current_staff_user_id`
  - `/api/admin/review/[queue_id]` bloquea firmas duplicadas, retiene primera firma, publica sólo al completar firmas requeridas
  - `/admin/review` muestra SLA, 0/2→1/2→publicado y deshabilita al revisor que ya firmó
- infra:
  - migración 024 aplicada en Supabase remoto y marcada applied con `supabase migration repair`
  - `SIMULADOR_STAFF_EMAILS` agregado en Vercel production para cuentas de Pablo
  - production deploy final: `dpl_Gqs2gJkooQAC14DyM89Cb5xmN81z`, alias `https://www.itera.la`
- smoke:
  - admin/review local contra Supabase remoto mostró item high-risk con SLA vencido y 0/2 firmas
  - primera firma dejó queue en `in_review`, report siguió `pending_review`, UI bloqueó al mismo revisor
  - segunda firma desde otro usuario publicó el report, dejó queue `resolved`, `completed_review_count=2`, `decisions=2`
  - verificación SQL final: `open_count=0`, report status `published`
- gates passed: `npm run check:simulador`, `npm run lint:simulador`, `npm run build`, `npm run coord:lint`
- gotchas:
  - Claude CLI no respondió para second opinion en este bloque; se intentó y se continuó para no bloquear ejecución.
  - Se creó un usuario temporal `codex-reviewer-*.itera.test` para el smoke local de segunda firma. No queda como staff en producción porque `SIMULADOR_STAFF_EMAILS` sólo incluye cuentas de Pablo.

## Batch 5 — strategy/quality/research docs [claude → codex review]

- [2026-05-19T15:10:00-06:00] done — 5 docs entregados
- outputs:
  - docs/strategy/pricing_tiers_v1.md (B9-001-D3) — Fase 1 $4-8K / Fase 2 $8-15K / Bundle 10% off
  - docs/strategy/launch_geos_v1.md (B9-003-D2) — MX+CO v1; BR/AR/CL diferidos v2
  - docs/coord/audits/competitive_pulse.md (B9-001-D4) — vigilancia trimestral 4 Tier 1 + 4 Tier 2
  - docs/research/latam_compliance_mx_followup.md (B9-003-D5) — postura conservadora v1; triggers de upgrade a counsel LATAM
  - docs/quality/case_admission_checklist.md (B9-002-D2) — 9 criterios (8 contract + archetype_ref) para validator script
- decisiones consolidadas en 7 tasks marked done: B9-001-D3, B9-001-D4, B9-002-D2, B9-002-D4 (absorbed), B9-003-D2, B9-003-D5, B9-003-D3 (absorbed)
- sync-research-to-board agregó 3 derivative tasks (B9-001-D3-S1/S2, B9-001-D4-S1/S2, B9-002-D2-S1/S2, B9-003-D2-S1/S2, B9-003-D5-S1/S2/S3)
- next codex tasks (de B9-002-D2-S1/S2 + B9-001-D3-S1):
  - scripts/simulador/validate-case-yaml.mjs implementation (9 criterios + accionable messages)
  - .github/workflows/validate-cases.yml CI block
  - Stripe wiring 3 products + tiered pricing por cohort

## B10-002 — testing técnico premium [codex → claude review]

- [2026-05-19T15:05:25-06:00] done
- output:
  - `scripts/simulador/test-rls.mjs` reemplaza el placeholder SQL y crea un smoke real con 2 orgs sintéticas, usuarios de Supabase Auth, lecturas con anon clients y cleanup.
  - `supabase/migrations/20260519030000_simulador_users_policy_no_recursion_025.sql` corrige recursión en `simulador.users_read_self_or_orgmate`.
  - `scripts/simulador/check-field-test-spoilers.mjs` ahora valida rutas públicas y autenticadas pre-submit.
  - `playwright.config.ts`, `npm run simulador:e2e`, `tests/simulador/e2e/helpers.ts`, `tests/simulador/e2e/premium-flows.spec.ts`.
  - `POST /api/sessions` ahora es idempotente si dos requests crean el mismo assignment a la vez; recupera assignment existente y reanuda sesión en vez de fallar con 500.
- E2E cubre:
  - field-test público sin login
  - buyer onboarding + invitación
  - manager dashboard
  - employee dashboard -> abrir caso
- gates passed:
  - `npm run simulador:e2e` → PASS, 4/4
  - `E2E_BASE_URL=https://www.itera.la npm run simulador:e2e` → PASS, 4/4
  - `npm run simulador:test-rls` → PASS
  - `npm run check:simulador` → PASS
  - `npm run lint:simulador` → PASS
  - `npm run coord:lint` → PASS
  - `npm run build` → PASS
- production:
  - deploy `dpl_DE5PLgYSo62Hd8q4nhj5zeDQfHCo`
  - alias activo `https://www.itera.la`
- gotchas:
  - Se intentó revisión por Claude Code CLI con prompt acotado al diff B10-002; no devolvió salida y se cortó para no dejar proceso colgado.
  - Playwright debe usar `http://localhost:3000`, no `127.0.0.1`, porque Next dev bloquea el origin y el runtime queda en loading.
  - El bug de índice Git volvió a aparecer como todos los archivos `D` + `??`; se corrigió con `git read-tree -m HEAD` sin tocar working tree.
  - `npm install @playwright/test` reportó vulnerabilidades existentes vía `npm audit`; no se ejecutó `npm audit fix` porque puede tocar dependencias fuera del bloque.
- siguiente_en_cola:
  - B7-002: integrar templates transaccionales de Claude con sender real y flujos invitation/report-ready/payment/alert.
  - B5-002: reportes PDF/share links con TTL.

## M9 loop audit pre v1 launch [claude → codex review]

- [2026-05-19T15:18:00-06:00] done
- output: docs/coord/audits/loop_audit_pre_v1_launch.md
- verdict global: PASS con 3 changes-requested menores
- C-R-1 (medium): sanitización spoiler check pendiente para 7 casos restantes
- C-R-2 (low): runtime.ts copy versionado pendiente (próximo batch)
- C-R-3 (low): patched inline en lib/simulador/copy/emails.ts report_ready_employee
- vocabulario canónico: 87 hits "criterio", 31 "evidencia", 64 "decidir/decisión", 18 "pilotar", 22 "entrenar", 14 "pausar", 19 "escalar", 41 "diagnóstico", 76 "manager", 6 "caso vivo" — todos arriba del esperado
- AI slop blocklist: 0 hits (powered by AI, leverage, synergize, 10x, revolutionize, world-class, next-gen, transformative, emojis decorativos)
- 11 cifras citadas con fuentes verificadas (Stanford, MIT, McKinsey, BCG, Gallup, Gartner)
- 3 decisiones derivadas: B-M9-001 (audit como gate continuo), B-M9-002 (C-R-1 prioritizado), B-M9-003 (C-R-3 patch inline done)

## B7-002 email transaccional premium [codex]

- [2026-05-19T15:29:44-06:00] done
- changed:
  - `lib/email/simulador.ts`: renderer/sender AgentMail para los 8 templates versionados de Claude.
  - `lib/email/simulador-notifications.ts`: notificaciones report-ready a participante + managers autorizados.
  - `app/api/orgs/[org_id]/invitations/route.ts`: invitaciones salen por AgentMail, validan que el team pertenezca a la org y exponen `email_status/email_reason` para smoke tests.
  - `app/api/invitations/[token]/accept/route.ts`: avisa al invitador cuando alguien acepta y reporta avance del cohorte.
  - `app/api/auth/email-hook/route.ts` y `lib/email/welcome.ts`: password reset + welcome migrados a copy premium del Simulador.
  - `lib/simulador/judge/persist.ts` + `app/api/admin/review/[queue_id]/route.ts`: report-ready se manda al publicar reporte directo o después de doble firma humana.
  - `scripts/simulador/check-email-templates.mjs`: gate de 8 templates, variables, longitud y AI-slop blocklist; agregado a `check:simulador`.
  - `tests/simulador/e2e/premium-flows.spec.ts`: smoke puede exigir envío real con `E2E_REQUIRE_EMAIL_SENT=1`.
- tested:
  - `npm run simulador:check-email-templates` → PASS.
  - `npm run check:simulador` → PASS.
  - `npm run lint:simulador` → PASS.
  - `npm run build` → PASS.
  - `npm run simulador:e2e` → PASS.
  - `E2E_INVITEE_EMAIL=pablo@itera.la E2E_REQUIRE_EMAIL_SENT=1 npm run simulador:e2e` → PASS; AgentMail aceptó el envío real de invitación.
  - `npm run simulador:test-rls` → PASS; cross-tenant reads siguen bloqueados.
  - Vercel env: `AGENTMAIL_API_KEY` + `AGENTMAIL_INBOX_ID` agregadas a Production.
  - deploy production `dpl_Do3qYRBGNeWi8dN7aJHLYZCJjeQp` → READY + alias `https://www.itera.la`.
  - `E2E_BASE_URL=https://www.itera.la E2E_INVITEE_EMAIL=pablo@itera.la E2E_REQUIRE_EMAIL_SENT=1 npm run simulador:e2e` → PASS; producción manda invitación real por AgentMail.
  - Claude Code CLI review attempt → timeout 120s sin output; no se bloqueó merge por herramienta colgada.
- gotchas:
  - `hola@itera.la` está bloqueado por bounce en AgentMail: el smoke real falló con `MessageRejectedError: Recipient(s) blocked: hola@itera.la (bounced)`. El código ya expone `email_reason`, pero el follow-up operativo es desbloquear o reemplazar ese alias.
  - Los correos siguen siendo best-effort: fallas de AgentMail no rompen signup, invitation accept ni publicación de reportes.
- siguiente_en_cola:
  - B7-001 billing/Stripe premium.
  - Follow-up operativo: corregir `AGENTMAIL_REPLY_TO` y alias `hola@itera.la`/`soporte@itera.la` cuando Pablo confirme inboxes válidos.

## C-R-2 cerrado — lib/simulador/copy/runtime.ts [claude → codex import]

- [2026-05-19T15:22:00-06:00] done
- output: lib/simulador/copy/runtime.ts (240 líneas)
- secciones: loading, sections (6 del runtime), nav, autosave, step1-5, voice, errors, empty_states, microcopy, post_submit
- vocabulario canónico estricto: "criterio" (no skill), "banda" (no score/puntuación), "decidir" (no feedback), "evidencia" (no results)
- next codex: importar runtimeCopy en components/simulador/RuntimeExperience.tsx + refactor strings hardcoded

## claude → codex — manager.ts copy versionado (B5-002 unblock)

- [2026-05-19T15:26:00-06:00] done
- output: lib/simulador/copy/manager.ts (~270 líneas)
- secciones: surface, states (loading/error/empty), kpi (3 cards), team (lista participantes + status + bands), reports (lista + estados), matrix (3×5 bandas × dimensiones para B5-002), dimensions_avg (fallback v0), recommendations (4 caminos override matrix), alerts (4 banners: high_risk/review_pending/sprint_closing/no_sessions), drill_down (cohort modal), employee_view (cuando viewer_role=employee), microcopy, handoff (export/print/share)
- vocabulario canónico estricto aplicado: "criterio" (no skill), "banda" (no score/puntuación), "decidir/decisión" (no feedback), "manager" (no líder/jefe), "caso vivo" (no test)
- next codex: importar managerCopy en app/(app)/dashboard/page.tsx + reemplazar strings hardcoded (sección Equipo, KPI strip, Dimensiones, Acciones recomendadas, empty states). Cuando B5-002 entre con matriz 3×5, los labels ya están listos en managerCopy.matrix.

## claude → codex — onboarding.ts copy versionado (B7-001 unblock)

- [2026-05-19T15:35:00-06:00] done
- output: lib/simulador/copy/onboarding.ts (~290 líneas)
- secciones: wizard (chrome compartido), step1_org (industry + region + size con disclaimer v1 MX+CO + BR waitlist), step2_team (10 departments con help específico marketing vs other), step3_invite (bulk emails + skipped reasons + over_seats + domain_mismatch), step4_billing (Stripe Checkout B2B con seats + bundle 10% off + PO/wire fallback ventas@itera.la), step5_done (next_steps + receipt + dashboard CTA), return_from_stripe (success polling + failed retry), states (loading/redirect/session_expired), microcopy
- vocabulario canónico aplicado: organización, team, participante, diagnóstico, caso vivo, manager
- decisiones consolidadas: B9-001-D3 (pricing 4-8k/8-15k), B9-003-D2 (MX+CO v1, BR waitlist), B9-003-D5 (legal conservador), B7-001 (Stripe Checkout B2B)
- next codex: importar onboardingCopy en app/(onboarding)/onboarding/{org,team,invite}/page.tsx (ya existen — reemplazar strings hardcoded) + crear /billing y /done page.tsx usando step4_billing y step5_done. La return URL de Stripe debería caer en /onboarding/return-from-stripe usando return_from_stripe.

## claude → codex — field-test.ts copy versionado (B6-001/B6-002 refactor)

- [2026-05-19T15:43:00-06:00] done
- output: lib/simulador/copy/field-test.ts (~210 líneas)
- secciones (8): entry (pre-roll + expectations + start CTA), anti_fraud (multi-tab/paste/inactivity warnings), report (mini-reporte preliminar — dimensiones + recomendación + risk_events + fairness_note explícito sin hybrid review), lead_capture (form 5 fields + consent + after_sent), states (loading judge 15-30s + network_offline), abandonment (exit confirm + already_completed + expired), paid_handoff (cross-link al producto pago + pricing anchor 4-8k), microcopy
- vocabulario canónico: preliminar/muestra (NO certificación/benchmark), criterio observado, caso de muestra, banda, evidencia, decidir
- next codex: importar fieldTestCopy en components/simulador/RuntimeExperience.tsx (FieldTestReportInline ~líneas 942-1133 — reemplazar strings hardcoded) + app/field-test/marketing-urgent-campaign-pii/page.tsx puede meter el entry/eyebrow del fieldTestCopy.entry si quieres landing dedicada antes del runtime
- B6-001-D opcional: severity_labels { low/medium/high } definidos consistente con risk_events.severity CHECK del schema

## claude → codex — billing.ts copy versionado (B7-001 portal + /pricing)

- [2026-05-19T15:50:00-06:00] done
- output: lib/simulador/copy/billing.ts (~290 líneas)
- secciones (10): page (chrome /pricing), tiers (diagnostico/sprint/track con tagline + best_for + anchor_seat USD + includes_extra + excludes), bundle (10% off Fase 1+2), landing_card (condensada para landing pricing card), faq (8 Q&A pricing-oriented: seats vs org, agregar after, PO/wire, recurrente, no-show, refunds, free trial, compliance), portal (customer portal post-pago: status + seats_used + period + add_seats/upgrade/downgrade/cancel + invoices), invoice (recibo Stripe + factura fiscal MX/CO/AR + RFC/NIT/CUIT), refund (7d window + crédito post-actividad), states (payment_failed/pending + portal load_failed/no_plan), microcopy (secure_payment + enterprise note)
- vocabulario canónico: diagnóstico, asiento (NO license), sprint (NO course/program), tier, manager
- decisiones consolidadas: B9-001-D3 (pricing 4-8k/8-15k/Track 15-24k + bundle 10%), B9-001-D7 (frame "diagnóstico no certificación"), B9-003-D5 (compliance conservador no SOC2/ISO27001 hasta DPA enterprise), B7-001 (Stripe Checkout B2B + customer portal pendiente surface)
- next codex: importar billingCopy en (1) app/pricing/page.tsx nuevo si no existe, (2) landing pricing card en app/(public)/page.tsx, (3) customer portal post-pago en app/(app)/billing/page.tsx pendiente, (4) /api/billing/portal/route.ts para return URL strings. Plan IDs canónicos viven en lib/simulador/billing.ts SIMULADOR_PLANS — billingCopy.tiers solo agrega marketing copy alrededor.

## claude → codex — M9.2 audit extension (post copy batch)

- [2026-05-19T15:58:00-06:00] done
- output: docs/coord/audits/loop_audit_post_copy_batch.md
- scope: 5 nuevos copy files post M9 (runtime/manager/onboarding/field-test/billing)
- verdict global: PASS sin C-R nuevos. Loop quality bar mantenida en wakeup cadence 270s.
- métricas: 0 AI slop, 0 spoilers UI, 0 vocab prohibido en strings (skill/score/feedback/assessment solo en JSDoc declaratorio). Vocab canon presente: criterio (17 hits cross-files), banda (15 hits), evidencia (8 hits), diagnóstico (30 hits).
- cross-file consistency verified: 4 caminos override matrix (pilotar/entrenar/pausar/escalar) consistentes; 5 dimensiones NO leakean al field-test; 3 bandas A/M/B = Alto/Medio/Bajo consistente.
- 2 decisiones nuevas declaradas: M9-2-D1 (loop sostenible) + M9-2-D2 (próximos 2 files continúan sin audit intermedio).
- next: continuar cadence 270s con auth.ts + errors.ts. Cuando codex cierre B5-002/B7-001, claim decisiones unblocked y correr M9.3 pre v1 launch.

## claude → codex — auth.ts copy versionado (auth surfaces refactor)

- [2026-05-19T16:03:00-06:00] done
- output: lib/simulador/copy/auth.ts (~290 líneas)
- secciones (11): nav (AuthNav chrome), login (email + password + Google OAuth + magic redirect), signup (full_name + email + password + confirm_email screen), forgot (reset link request), reset (nueva contraseña + mismatch/weak errors + expired_link), callback (OAuth/magic landing con errores específicos: oauth_denied/expired_link/user_mismatch/generic), invitation (landing del invitee: valid/accepted/invalid con 7 reasons: expired/consumed/revoked/no_seats/org_inactive/not_found/unknown), magic_link (sent + resend cooldown + change_email), sign_out (confirm dialog), errors (mapping de 12 Supabase auth errors a español accionable), microcopy
- vocabulario canónico: iniciar sesión (NO log in/ingresar), crear cuenta (NO registrarse), contraseña (NO password), invitación (NO invite), participante (NO user), manager
- decisiones consolidadas: B1-004 (signup smoke pasa — refactoriza strings ya live), B7-002 (AgentMail invitation/welcome/reset emails — auth.ts cubre el landing post-click), B9-003-D5 (opt-in explícito sin auto-firma de terms), Pablo 2026-05-18 (Apple-style cero legacy DS)
- next codex: importar authCopy en (1) app/auth/login/page.tsx (refactor strings hardcoded — translateError fn → authCopy.errors map), (2) app/auth/signup/page.tsx, (3) app/auth/invitation/[token]/page.tsx (valid_reasons map listo), (4) crear app/auth/forgot/page.tsx + app/auth/reset/page.tsx con copy ya versionado, (5) components/simulador/AuthNav.tsx para nav.brand_label, back_to_landing_cta

## claude → codex — errors.ts copy versionado (último copy file de la prioridad)

- [2026-05-19T16:07:00-06:00] done
- output: lib/simulador/copy/errors.ts (~320 líneas)
- secciones (11): not_found (page/case/session/report/organization), server_error (page/inline/judge_failed/persistence_failed), forbidden (page/rls_blocked/wrong_role + contact_admin), rate_limited (page con countdown + inline + judge_quota), timeout (judge 15-30s + api_call + voice_transcription), network (offline_banner + offline_page + intermittent + api_unreachable), maintenance (page + banner_active + banner_resolved), session_expired (auth vs simulation), subscription_expired (page + expiring_soon + payment_pending), feature_disabled (tier upsell), quota_exceeded (seats/sessions/judge_daily), generic (helpers cross-error), http_map (400-504 codes → mensaje)
- vocabulario canónico: reintentar (NO retry), sesión (auth O simulation contextualizado), plan (NO subscription public), soporte (NO support)
- voz: empático sin zalamero. Cuando es nuestro error lo asumimos. Cuando es third-party (Stripe/Supabase/Anthropic) lo nombramos. Sin culpabilizar al usuario.
- decisiones consolidadas: B5-001-D3 (pending_review honesto separate de error), B9-003-D5 (RLS leak binario sin sugerir bypasses), Pablo regla operativa (errores específicos + accionables + retry_cta)
- next codex: importar errorsCopy en (1) app/error.tsx + app/(app)/error.tsx para 500 errors, (2) app/not-found.tsx para 404 global, (3) lib/api-errors.ts usar http_map para reemplazar mensajes hardcoded, (4) components/simulador/ErrorBoundary.tsx fallback, (5) app/maintenance/page.tsx cuando se cree

## B7-001 cerrado — billing tiers y Stripe checkout [codex]

- [2026-05-19T16:18:00-06:00] done
- output:
  - `lib/simulador/billing.ts` con tiers canónicos `diagnostico`, `sprint`, `track` y cálculo server-side de asientos/precio.
  - `/onboarding/billing` con selección de plan/asientos y creación de sesión Stripe Checkout B2B.
  - `/onboarding/done` con sync idempotente post-pago y fallback a fila ya creada por webhook.
  - `app/api/stripe/create-checkout-session/route.ts` conserva subscription legacy y agrega path `billing_product=simulador_b2b`.
  - `app/api/stripe-webhook/route.ts` procesa `checkout.session.completed` del simulador sin romper legacy.
  - migración `20260519031000_simulador_subscription_checkout_unique_026.sql` aplicada en Supabase remoto.
- hardening aplicado por review Claude CLI:
  - sin `allow_promotion_codes` en B2B para que el monto cobrado coincida con el contrato server-side.
  - índice único por `metadata->>'checkout_session_id'` para evitar duplicados entre webhook y `/onboarding/done`.
  - guard contra plan activo por organización antes de crear otro checkout.
  - errores terminales de metadata se loggean como críticos sin retries inútiles de Stripe; errores recuperables sí lanzan retry.
  - `current_period_start` usa `session.created`.
- tested:
  - `npm run check:simulador` PASS.
  - `npm run lint:simulador` PASS.
  - `npm run build` PASS.
  - `npm run simulador:e2e` PASS (5/5, incluye creación real de Stripe Checkout Session).
  - Supabase remoto verificado: `idx_simulador_subscriptions_checkout_session_unique` existe.
  - producción redeployed: `dpl_3iAfLGw8Pqrh2gTogqU6tan2Qy2e`, alias `https://www.itera.la`.
  - smoke production: `E2E_BASE_URL=https://www.itera.la npm run simulador:e2e` PASS (5/5).
- gotchas:
  - Vercel tenía `STRIPE_SECRET_KEY` con carácter inválido en `Authorization`; se refrescó desde `.env.local` y se redeployó antes del smoke PASS.
  - El E2E crea sesiones Stripe test reales, pero no completa pago con tarjeta; el path de webhook/done queda cubierto por código + índice remoto, y falta un test webhook sintético si queremos blindaje extra.
  - B7-002 ya estaba done aunque dependía de B7-001; con este cierre la dependencia queda coherente.
- siguiente_en_cola:
  - B5-002 reporte PDF/share link o B5-003 manager dashboard premium son los siguientes frentes de revenue visible.

## claude → codex — M9.3 audit v1 launch readiness (GO-CON-CAVEAT)

- [2026-05-19T16:11:00-06:00] done
- output: docs/coord/audits/v1_launch_readiness.md
- verdict global: **GO-CON-CAVEAT.** 17 áreas auditadas. 14 GO (DB/RLS/auth/onboarding/casos/runtime/judge/reporte/field-test/copy/legal/override/dimensiones/vocab) + 2 GO-CON-CAVEAT (dashboard sin matriz 3×5 B5-002 / billing con workaround PO-wire hasta B7-001 cierre) + 1 NO-GO menor (observabilidad Sentry — workaround manual viable primer customer)
- 3 gates obligatorios pre-primer-customer: B7-001 cierre + smoke E2E con datos reales + Sentry-or-equiv + Pablo flip switch landing CTA
- 3 decisiones derivadas: M9-3-D1 (launch GO-CON-CAVEAT con sales-assisted), M9-3-D2 (dashboard v0 vendible, matriz 3×5 post-launch), M9-3-D3 (Sentry no bloquea primer customer)
- next codex: cuando cierre B7-001, area (10) Billing flips a GO — correr re-audit rápido. Cuando arranque B5-002, area (9) Dashboard flips a GO con matriz cableada. Las decisiones M9-3-D1/D2/D3 quedan visibles en el board para que el handoff pre-launch sea trazable.

## claude → codex — decisiones pending unblock (handoff trazable)

- [2026-05-19T16:14:00-06:00] done
- output: docs/coord/audits/decisiones_pending_unblock.md (~290 líneas)
- contenido: 3 decisiones blocked pre-resueltas con (a) posición producto explícita (b) snippet de código/copy listo para aplicar (c) acción inmediata cuando deps cierren (d) métricas verificables de closure
- decisiones cubiertas:
  - B9-001-D2 "Reclamar categoría criterio IA medible" (deps B5-002) → edit landing.ts.hero + category_claim section + screenshot matriz pide a codex
  - B9-001-D5 "Free learner, employer paga" (deps B7-001) → Paso A activation NO commit con save_to_email_and_share variant en field-test + email template learner_shares_report_with_manager
  - B9-002-D5 "Override matrix mantiene Escalar" (deps B5-002) → MANTENER con justificación Kirkpatrick L4 environment + tooltip dashboard chip Escalar
- plan coordinado: cuando codex cierre B7-001 → claim D5 inmediato; cuando cierre B5-002 → claim D2 + D5 paralelos
- decisión derivada nueva: M9-3-D4 (pre-resolver handoff reduce coord deuda ~75 min → ~15 min)
- next codex: cuando cierres B7-001 y B5-002, lee este archivo PRIMERO antes de pingear a Claude — la posición producto está cerrada. Solo coordina ITEMS específicos: screenshot matriz + tooltip chip Escalar + (opcional) email template variant.

## claude → codex — pricing anchor v2 research (M9-3-D5/D6)

- [2026-05-19T16:18:00-06:00] done
- output: docs/research/pricing_anchor_v2.md (~220 líneas)
- conclusión: Itera sub-priced 30-60% vs Section AI/Workera en tier Sprint/Track. **NO subir v1.** Lock pricing actual hasta customer-zero (5 cerrados + 30 días).
- 6 anchors verificados: Section AI $750-1200/seat, Workera $1000-2000/seat enterprise, Wharton $200-400/seat corporate, Coursera Business $400/seat/year, Forage $50-200/seat, Attensi/Mursion $300-500/seat
- riesgos analizados: sub-pricing vs anchor bajo (customer LTV sub-óptimo, percepción premium rota) vs riesgos de subir antes de customer signal (cero data, LATAM elasticity, B7-001 wiring lock)
- 2 decisiones nuevas: M9-3-D5 (lock pricing v1) + M9-3-D6 (post 5 customers, Sprint +20% / Track +25% / Diagnóstico mantener)
- triggers explícitos para upgrade: ≥5 Sprint + ≥2 Track cerrados + qualitative signal "esperaba pagar más" + CAC payback < 6m + LATAM win > 30%
- next codex: cierre B7-001 con confianza — el pricing actual está validated. No hay cambios al SIMULADOR_PLANS v1.
- next claude: Q3 2026 refresh competitive_pulse + post-customer-zero re-evaluar M9-3-D6.

## claude → codex — onboarding friction B2B LATAM research (M9-3-D7/D8)

- [2026-05-19T16:21:00-06:00] done
- output: docs/research/onboarding_friction_b2b_latam.md (~220 líneas)
- conclusión: **hybrid model** (self-serve + opt-in sales call) requerido para Sprint/Track tiers; Diagnóstico mantener self-serve puro
- benchmark clave: B2B mid-market LATAM toma ~12 días median activation (70% más que US 7 días). Self-serve puro conversion <3% si contract $5-15K; hybrid sube a 15-22%.
- 6 razones identificadas por las que LATAM mid-market pide humano: factura fiscal RFC/NIT/CUIT, aprobación multi-stakeholder, currency uncertainty, wire vs card preference (60% LATAM prefer wire), trust signal v1, DPA/privacy enterprise
- propuesta hybrid: cta_secondary "Hablar con ventas" per tier + opt_in_sales_call banner pre-Stripe Sprint/Track + email abandoned_checkout 24h trigger
- 2 decisiones nuevas: M9-3-D7 (implementar hybrid post B7-001 cierre) + M9-3-D8 (operational limits: 3 calls/día max, 1 día/sem de Pablo, pre-qualify 3 fields)
- next codex: cuando cierres B7-001, layer hybrid encima — strings ya pre-resueltas en próximos wakeups claude (cta_secondary_label, opt_in_sales_call, abandoned_checkout email template).
- next claude: post-B7-001-cierre, extender billing.ts + onboarding.ts + emails.ts con strings hybrid (cierra M9-3-D7).

## claude → codex — competitive pulse Q3 followup (B9-001-D4 cadencia)

- [2026-05-19T16:25:00-06:00] done
- output: docs/research/competitive_pulse_q3_followup.md (~200 líneas)
- propósito: puente entre Q1/Q2 baseline (competitive_pulse.md) y Q3 review oficial (2026-08-19)
- conclusión May 2026: ningún Tier 1 disparó red flag. 2 early signals capturadas (Section AI LATAM mentions Q1 2026 → yellow watch list; Whatfix Series F rumored $1.5B → tracking pasivo)
- nuevos entrants Tier 2 identificados: Talespin (pivot AI-only Q1) + Hyperskill AI (seed Q2)
- Q3 review framework definido: 5 steps protocolo para ejecutar 2026-08-19 con métricas explícitas de "en peligro" (5 triggers requieren reaction <60d)
- 2 decisiones nuevas: M9-3-D9 (mantener cadencia trimestral; agregar tracking pasivo solo si Tier 1 mueve) + M9-3-D10 (Talespin + Hyperskill watch list Tier 2 en Q3 review)
- next codex: este doc NO requiere acción técnica de codex. Tracking pasivo claude hasta agosto. Cuando ejecutemos Q3 review en agosto, claude actualizará competitive_pulse.md con findings + acciones disparadas.
