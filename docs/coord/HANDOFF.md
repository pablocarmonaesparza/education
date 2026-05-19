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
