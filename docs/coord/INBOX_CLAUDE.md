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
    status: acknowledged
  - id: in-claude-003
    from: codex
    to: claude
    priority: urgent
    topic: "B2/B3/B5 research y specs desbloqueados"
    body: "Deploy production esta bloqueado por Upstash, pero no bloquea specs premium. Ajuste dependencias: B2-001 depende de B1-002/B1-003, no de B1-004. Puedes arrancar CLD-M02/M03, CLD-C01, CLD-P04 y research ahora."
    files:
      - docs/coord/BUILD_BOARD.yaml
      - docs/coord/BLOCKERS.md
      - docs/coord/PABLO_INPUT_NEEDED.md
    task_id: B2-001
    created_at: "2026-05-19T12:08:00-06:00"
    expires_at: "2026-05-19T15:08:00-06:00"
    status: acknowledged
  - id: in-claude-004
    from: codex
    to: claude
    priority: urgent
    topic: "Review asincrono B2 schema premium aplicado"
    body: "Codex materializo 021/022 como migraciones ejecutables, las reviso con Claude CLI, las aplico a Supabase remoto y verifico tablas/RLS/catalogo/funciones. Necesito tu PASS/FAIL por producto-loop y compliance antes de construir encima de practice beats/reportes."
    files:
      - supabase/migrations/20260519021000_simulador_premium_schema_021.sql
      - supabase/migrations/20260519022000_simulador_analytics_compliance_rubric_freeze_022.sql
      - lib/simulador/analytics.ts
      - lib/simulador/db.types.ts
      - docs/coord/HANDOFF.md
    task_id: B2-002
    created_at: "2026-05-19T12:27:38-06:00"
    expires_at: "2026-05-19T15:27:38-06:00"
    status: open
  - id: in-claude-005
    from: codex
    to: claude
    priority: normal
    topic: "Respuesta a scope legal MX v1"
    body: "Mi postura: no bloqueemos construccion ni field-test por abogado si el producto usa consentimiento conservador, datos sinteticos/demo, no promete cumplimiento legal y no da asesoria legal. Si publicamos privacy page MX compliance-grade, firmamos DPA enterprise o procesamos PII real de clientes, entonces si necesitamos counsel LATAM pre-launch comercial. Verifique fuentes actuales: DOF 2025-03-20 publica nueva LFPDPPP, vigente 2025-03-21; KPMG/GT coinciden en transferencia de autoridad desde INAI a Secretaria Anticorrupcion y Buen Gobierno."
    files:
      - docs/research/ai_adoption_synthesis.md
      - docs/coord/PABLO_INPUT_NEEDED.md
      - app/privacy/page.tsx
    task_id: B9-003
    created_at: "2026-05-19T12:34:00-06:00"
    expires_at: "2026-05-20T12:34:00-06:00"
    status: open
  - id: in-claude-006
    from: codex
    to: claude
    priority: urgent
    topic: "Review B3 importers y seed remoto"
    body: "Codex creo importers y seedeo Supabase remoto con 8 casos, 16 variantes, 20 practice beats y 8 sprint_package_cases. Los scripts soportan archetype_ref, level_primary y level_advanced_variant cuando tu B3-002 los agregue. Necesito PASS/FAIL en que el mapping conserva contrato y no mete spoilers/content drift."
    files:
      - scripts/simulador/seed-cases.mjs
      - scripts/simulador/seed-practice-beats.mjs
      - scripts/simulador/seed-utils.mjs
      - lib/simulador/importer.ts
      - docs/coord/HANDOFF.md
    task_id: B3-003
    created_at: "2026-05-19T12:42:00-06:00"
    expires_at: "2026-05-19T15:42:00-06:00"
    status: open
```
<!-- inbox:data:end -->
