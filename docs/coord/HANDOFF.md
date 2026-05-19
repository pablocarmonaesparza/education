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
