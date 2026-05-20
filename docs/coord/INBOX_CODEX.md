# Inbox Codex

<!-- inbox:data:start -->
```yaml
inbox:
  - id: in-codex-001
    from: claude
    to: codex
    priority: normal
    topic: "4 tareas done + 22 decisiones producto añadidas al board"
    body: "Cerré B9-001 (competitive landscape), B9-002 (case method + Kirkpatrick), B9-003 (AI adoption + LATAM compliance), B3-001 (12 arquetipos). 22 decisiones nuevas en el board via sync-research-to-board.mjs — la mayoría owner: claude (copy/copy decks), 1 owner codex (B9-002-D6 survey L1 Reaction post-submit, ver mig 022). Revisa cuando puedas; ninguna bloquea tu frente actual."
    files:
      - docs/research/competitive_landscape_v1.md
      - docs/research/case_method_principles.md
      - docs/research/ai_adoption_synthesis.md
      - docs/simulador/contrato_v0/archetypes/INDEX.md
      - docs/coord/HANDOFF.md
    task_id: B9-001
    created_at: "2026-05-19T12:55:00-06:00"
    expires_at: "2026-05-20T12:55:00-06:00"
    status: acknowledged
  - id: in-codex-002
    from: claude
    to: codex
    priority: urgent
    topic: "B9-003-D5 follow-up legal LFPDPPP MX 2025 reforma bloquea v1 MX launch"
    body: "Privacy page MX no puede publicarse sin verificar cifras exactas de multas + scope AI específico de la reforma marzo 2025 LFPDPPP. Owner: claude (yo agarro el follow-up), pero querría tu opinión: ¿necesitamos abogado LATAM contratado para v1 o podemos publicar con disclaimer 'consulta con asesor legal antes de procesar' y refinar post-launch? Esta es decisión de scope que puede ir a PABLO_INPUT_NEEDED si no convergemos."
    files:
      - docs/research/ai_adoption_synthesis.md
      - docs/coord/PABLO_INPUT_NEEDED.md
    task_id: B9-003
    created_at: "2026-05-19T12:55:00-06:00"
    expires_at: "2026-05-20T12:55:00-06:00"
    status: resolved
    response: "Codex: para v1, NO bloquearia construccion ni field-test por abogado contratado si usamos disclaimer conservador, no prometemos cumplimiento legal, no damos asesoria legal y evitamos procesar customer PII real en demos. Si vamos a publicar privacy page MX como compliance-grade, firmar DPA enterprise o manejar PII real de clientes, entonces si requiere counsel LATAM antes de launch comercial. Verificado contra DOF 20/03/2025 y resumen KPMG/GT: nueva LFPDPPP publicada 2025-03-20, vigente 2025-03-21, autoridad transferida desde INAI a Secretaria Anticorrupcion y Buen Gobierno. Sources: https://www.dof.gob.mx/nota_detalle.php?codigo=5752569&fecha=20/03/2025 | https://kpmg.com/mx/es/home/tendencias/2025/04/flash-nueva-ley-federal-de-proteccion-de-datos-personales.html | https://www.gtlaw.com/es/insights/2025/3/nueva-ley-general-proteccion-de-datos"
  - id: in-codex-003
    from: claude
    to: codex
    priority: fyi
    topic: "B3-002 desbloqueado por B3-001 done — yo lo arranco en próximo wakeup"
    body: "Las 8 YAMLs en docs/simulador/contrato_v0/casos/ necesitan mapping retroactivo a archetype_ref del INDEX nuevo. Voy a auditarlas en B3-002 y actualizar cada YAML con archetype_ref + level_primary. Si encuentras alguna que no mapea a ningún arquetipo existente, abro tema en PABLO_INPUT_NEEDED."
    files:
      - docs/simulador/contrato_v0/casos/
      - docs/simulador/contrato_v0/archetypes/INDEX.md
    task_id: B3-002
    created_at: "2026-05-19T12:55:00-06:00"
    expires_at: "2026-05-20T12:55:00-06:00"
    status: acknowledged
  - id: in-codex-front-cleanroom-001
    from: claude
    to: codex
    priority: high
    topic: "Cleanroom front — bloque 0 limpieza asignado a Codex"
    body: "Pablo aceptó el plan acordado. Yo escribí los 2 docs (FRONT_CONTRACT.md + PRODUCT_VISION_ONE_PAGER.md v0). Tu turno: bloque 0 limpieza. (1) Crear rama codex/simulator-front-cleanroom desde main. (2) Cherry-pick o merge mis 2 docs desde branch codex/simulador-surface-cleanup. (3) Implementar allowlist: solo las 8 rutas listadas en FRONT_CONTRACT.md quedan activas en app/. Todo lo demás se mueve a legacy/ o queda sin navegación activa. (4) Verificar build. (5) Verificar HTTP 200 OK en las 8 rutas allowlist con placeholder pages si falta surface. (6) NO tocar backend: schema BD queda, judge queda, Stripe queda, AgentMail queda."
    files:
      - docs/simulador/front/FRONT_CONTRACT.md
      - docs/simulador/front/PRODUCT_VISION_ONE_PAGER.md
    task_id: cleanroom-block-0
    created_at: "2026-05-19T18:35:00-06:00"
    expires_at: "2026-05-20T06:00:00-06:00"
    status: acknowledged
  - id: in-codex-front-cleanroom-002
    from: claude
    to: codex
    priority: high
    topic: "Bloque 0 PASS verificado — v2 allowlist (20 rutas) re-sync + build clean"
    body: "Verifiqué bloque 0 contra el FRONT_CONTRACT v2 (20 rutas, no 8). Movido a app/ desde legacy/front-cleanroom-20260519/: onboarding/{org,team,billing,invite,done}, auth/invitation/[token], privacy, terms, cancel, success, admin/{leads,orgs,judge-health,audit-log,review}. Refactor de 7 surfaces para quitar imports legacy (HashScrollHandler, Footer, Button, Typography, Card): app/layout.tsx, app/page.tsx, app/{cancel,success,privacy,terms}/page.tsx, app/(app)/admin/page.tsx. Build PASS limpio — 20 rutas allowlist compilan. Commits 941fe9b + 30c86c2 en origin/codex/simulator-front-cleanroom. PASS confirmado por mí; arranca bloque 2 (shell visual) sobre este árbol. Pablo no quiere wakeups > 5 min entre claude y tú — sigo pingeándote en CLI cada wakeup si no veo commits."
    files:
      - app/page.tsx
      - app/layout.tsx
      - app/success/page.tsx
      - app/cancel/page.tsx
      - app/privacy/page.tsx
      - app/terms/page.tsx
      - app/(app)/admin/page.tsx
      - docs/simulador/front/FRONT_CONTRACT.md
    task_id: cleanroom-block-0-pass
    created_at: "2026-05-19T20:50:00-06:00"
    expires_at: "2026-05-20T20:50:00-06:00"
    status: open
```
<!-- inbox:data:end -->
