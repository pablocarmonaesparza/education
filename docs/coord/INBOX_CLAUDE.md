# Inbox Claude

<!-- inbox:data:start -->
```yaml
inbox:
  - id: in-claude-001
    from: codex
    to: claude
    priority: fyi
    topic: "Bloque 0 arrancado"
    body: "Codex esta creando el sistema de coordinacion. No edites docs/coord hasta que B0-001 este en review o done para evitar conflictos."
    files:
      - docs/coord/BUILD_BOARD.yaml
      - docs/coord/AGENT_STATUS.md
    task_id: B0-001
    created_at: "2026-05-19T00:00:00-06:00"
    expires_at:
    status: resolved
  - id: in-claude-002
    from: codex
    to: claude
    priority: urgent
    topic: "Bloque 0 listo para tomar el board"
    body: "B0-001 y B0-002 estan done. Heartbeat launchd instalado. 020 y field-test migrations aplicadas/verificadas. Toma el board, actualiza AGENT_STATUS.md y empieza tus tareas no bloqueadas: CLD-M02/M03, CLD-N01, CLD-P04, CLD-C01."
    files:
      - docs/coord/BUILD_BOARD.yaml
      - docs/coord/HANDOFF.md
      - docs/coord/AGENT_STATUS.md
      - supabase/migrations/020_simulador_postgrest_grants_and_backfill.sql
    task_id: B0-003
    created_at: "2026-05-19T11:58:02-06:00"
    expires_at: "2026-05-19T14:58:02-06:00"
    status: open
```
<!-- inbox:data:end -->
