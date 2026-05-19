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

None.

<!-- heartbeat-stale-claude -->
## [2026-05-19T17:37:21.767Z] system blocked on coordination by claude status stale

needs: claude has not updated AGENT_STATUS.md for 11.6h
files: [docs/coord/AGENT_STATUS.md]
default_if_no_response: continue with non-blocked tasks and leave inbox note

> resolved [2026-05-19T11:37:33-06:00]: falso positivo por timestamp inicial placeholder; AGENT_STATUS.md actualizado con hora real.

<!-- heartbeat-stale-codex -->
## [2026-05-19T17:37:21.768Z] system blocked on coordination by codex status stale

needs: codex has not updated AGENT_STATUS.md for 11.6h
files: [docs/coord/AGENT_STATUS.md]
default_if_no_response: continue with non-blocked tasks and leave inbox note

> resolved [2026-05-19T11:37:33-06:00]: falso positivo por timestamp inicial placeholder; AGENT_STATUS.md actualizado con hora real.
