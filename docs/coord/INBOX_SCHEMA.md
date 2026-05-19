# Inbox schema

Los inboxes viven en `INBOX_CLAUDE.md` y `INBOX_CODEX.md`. Cada archivo contiene un bloque YAML editable por scripts.

Campos:

```yaml
- id: in-001
  from: codex
  to: claude
  priority: blocker # blocker | urgent | normal | fyi
  topic: short title
  body: detail
  files: [paths]
  task_id: B0-001
  created_at: "2026-05-19T00:00:00-06:00"
  expires_at: "2026-05-19T12:00:00-06:00" # opcional
  status: open # open | acknowledged | resolved | escalated
```

Reglas:

- `priority: blocker` se procesa antes que la tarea actual.
- `expires_at` vencido se escala a `PABLO_INPUT_NEEDED.md` por `heartbeat.mjs`.
- Resolver no borra el item: cambia `status` y agrega nota si aplica.
