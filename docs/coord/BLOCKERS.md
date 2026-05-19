# Blockers

Append-only. Si una tarea bloquea a otro agente, se registra aqui antes de cambiar de frente.

Formato:

```md
## [timestamp] <agent> blocked on <task_id> by <other_agent>

needs: <especifico>
files: [paths]
default_if_no_response: <accion por defecto>

> resolved [timestamp]: <como>
```

## open blockers

<!-- deploy-upstash-rate-limit -->
## [2026-05-19T12:05:00-06:00] codex blocked on B1-004 by missing production rate-limit env

needs: Vercel envs `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` or an explicit product/security decision to disable `FIELD_TEST_REQUIRE_RATE_LIMIT`
files: [lib/simulador/field-test/security.ts, docs/coord/PABLO_INPUT_NEEDED.md]
default_if_no_response: continue non-deploy work; do not open public production field-test without rate-limit guardrail

> resolved [2026-05-19T12:55:00-06:00]: Codex agrego fallback Supabase/Postgres (`simulador.consume_rate_limit`) y actualizo el guardrail para aceptar Upstash o Supabase service-role. No requiere proveedor nuevo.


<!-- heartbeat-stale-claude -->
## [2026-05-19T17:37:21.767Z] system blocked on coordination by claude status stale

needs: claude has not updated AGENT_STATUS.md for 11.6h
files: [docs/coord/AGENT_STATUS.md]
default_if_no_response: continue with non-blocked tasks and leave inbox note

> resolved [2026-05-19T11:37:33-06:00]: falso positivo por timestamp inicial placeholder; AGENT_STATUS.md actualizado con hora real.

<!-- vercel-deploy-limit-20260519 -->
## [2026-05-19T17:22:00-06:00] codex blocked on production deploy by Vercel account deployment limit

needs: Vercel project/account must allow another production deploy. `npx vercel deploy --prod --yes` returned `api-deployments-free-per-day` after B5-002 was pushed to main.
files: [docs/coord/PABLO_INPUT_NEEDED.md]
default_if_no_response: continue local/non-deploy work; do not claim B5-002 production smoke until deployment quota/account is fixed.

<!-- heartbeat-stale-codex -->
## [2026-05-19T17:37:21.768Z] system blocked on coordination by codex status stale

needs: codex has not updated AGENT_STATUS.md for 11.6h
files: [docs/coord/AGENT_STATUS.md]
default_if_no_response: continue with non-blocked tasks and leave inbox note

> resolved [2026-05-19T11:37:33-06:00]: falso positivo por timestamp inicial placeholder; AGENT_STATUS.md actualizado con hora real.

<!-- heartbeat-stale-claude-2026051923 -->
## [2026-05-19T23:27:54.202Z] system blocked on coordination by claude status stale

needs: claude has not updated AGENT_STATUS.md for 2.1h
files: [docs/coord/AGENT_STATUS.md]
default_if_no_response: continue with non-blocked tasks and leave inbox note

> resolved [2026-05-19T17:58:00-06:00]: Claude Code respondio reviews B9-002-D6 via CLI y Codex continuo con tareas no bloqueadas.
