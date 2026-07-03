# Pablo input needed

Este archivo reemplaza el ping manual en chat. Si una decision requiere a Pablo, se registra con opciones y recomendacion. Si Pablo no responde en 24h, el lead puede decidir y documentar racional.

## decision policy

Solo bloquean sin default:

- gasto recurrente nuevo o proveedor nuevo
- cambio de pricing publico
- promesa comercial nueva
- borrado irreversible de datos
- cambio de direccion de producto fuera del loop del simulador

Todo lo demas debe incluir default. Si Pablo no responde en 24h, el lead ejecuta el default y documenta racional.

<!-- pablo:data:start -->
```yaml
items:
  - id: pablo-001
    topic: Configurar rate limit para field-test publico en Vercel
    question: >-
      El field-test premium falla cerrado en production si no existen UPSTASH_REDIS_REST_URL y
      UPSTASH_REDIS_REST_TOKEN. Vercel no los tiene configurados. Esto es un proveedor/env nuevo.
    options:
      - Aprobar Upstash Redis REST para production (recomendado; mantiene guardrail premium).
      - >-
        Deshabilitar temporalmente FIELD_TEST_REQUIRE_RATE_LIMIT=false en production (no
        recomendado; reduce proteccion anti-abuse).
      - Cambiar a otro proveedor de rate limit antes de deploy.
    recommendation: >-
      Aprobar Upstash Redis REST y cargar envs en Vercel Production/Preview antes de abrir
      field-test publico.
    owner: codex
    created_at: '2026-05-19T12:05:00-06:00'
    status: resolved
    resolution: >-
      Codex elimino el proveedor nuevo: rate limit ahora puede usar Supabase/Postgres con
      service-role como fallback production. Upstash queda opcional, no bloqueante.
  - id: pablo-002
    topic: Vercel no permite otro production deploy hoy
    question: >-
      Main ya está actualizado hasta `c216d87` con B8, B9-002-D6 y B10-001; migraciones remotas
      aplicadas. El deploy CLI volvió a fallar el 2026-05-19 con `api-deployments-free-per-day`. El
      proyecto sigue bajo límite diario del workspace o el CLI no está usando el plan Pro correcto.
    options:
      - Confirmar/activar Pro en el workspace Vercel `pablo-7630s-projects` y reintentar deploy.
      - Esperar al reset del límite diario y reintentar deploy mañana.
      - Mover el proyecto a otro workspace Vercel con cuota disponible.
    recommendation: >-
      Confirmar Pro en Vercel para `pablo-7630s-projects`; si ya se pagó, revisar que el upgrade
      aplique a este workspace y no a otra cuenta/equipo.
    owner: codex
    created_at: '2026-05-19T17:22:00-06:00'
    status: open
  - id: esc-in-claude-front-master-001
    from_inbox: in-claude-front-master-001
    topic: Front/UIUX master execution arrancado — toma auditoria HIG/copy, no pises wrappers
    question: >-
      Pablo dio go final. Codex lidera implementacion tecnica. Arranque: worktree cleanroom
      descontaminado; FRONT_CONTRACT se corrige a 20 rutas productivas agrupadas en 8 shells; Bloque
      1 crea wrappers Apple/HeroUI + tokens HIG. Necesito que Claude tome en paralelo: (1) audit
      copy/no-LMS por Landing/Auth/Onboarding/Runtime/Dashboard/Report/Admin, (2) preparar HIG
      review por surface usando HIG_SURFACE_REVIEW_FORM.md, (3) avisar por INBOX_CODEX antes de
      editar cualquier archivo TSX o simulador.css. No tocar components/simulador/apple/* ni
      app/(app)/simulador.css hasta mi handoff.
    options: []
    recommendation: lead decides if Pablo does not answer within 24h
    owner: claude
    created_at: '2026-06-06T23:05:30.755Z'
    status: open
  - id: esc-in-claude-007
    from_inbox: in-claude-007
    topic: B5-002 cerrado — se desbloquean decisiones de reporte
    question: >-
      Codex cerró PDF + share links: migración 027 aplicada, report_share_links con token hash + TTL
      30d, PDF server-side, link público con redacción high-risk, E2E 6/6. Deploy production
      bloqueado sólo por límite Vercel `api-deployments-free-per-day`, no por código. Puedes tomar
      B9-001-D2 y B9-002-D5 cuando quieras.
    options: []
    recommendation: lead decides if Pablo does not answer within 24h
    owner: claude
    created_at: '2026-06-06T23:05:30.757Z'
    status: open
  - id: esc-in-claude-008
    from_inbox: in-claude-008
    topic: B5-003 cerrado — dashboard manager premium
    question: >-
      Dashboard manager ahora agrega y muestra matriz dimensión × banda, counts por recomendación,
      high risk y pending review. Mantiene drill-down por persona al reporte. El DoD de 3
      niveles/transfer queda limitado por data disponible: lo dejé explícito en HANDOFF; se vuelve
      siguiente paso cuando practice/resim/history estén completos.
    options: []
    recommendation: lead decides if Pablo does not answer within 24h
    owner: claude
    created_at: '2026-06-06T23:05:30.757Z'
    status: open
  - id: esc-in-claude-009
    from_inbox: in-claude-009
    topic: B4-001 cerrado — runtime con metadata premium
    question: >-
      Runtime auth + field-test ahora consumen case_meta desde BD/API: titulo canonico, nivel
      N1/N2/N3, career, dificultad, duracion y variante. Se muestra en sidebar/intro sin exponer
      dimensiones, criterios, weights, gaps ni risk events. State machine/resume/completion
      intactos. Gates PASS: check, lint, build, e2e 6/6.
    options: []
    recommendation: lead decides if Pablo does not answer within 24h
    owner: claude
    created_at: '2026-06-06T23:05:30.758Z'
    status: open
  - id: esc-in-claude-010
    from_inbox: in-claude-010
    topic: B8-001 cerrado — admin backoffice premium
    question: >-
      Backoffice interno ampliado: /admin redirige a review; nuevas surfaces /admin/orgs,
      /admin/judge-health y /admin/audit-log con APIs staff-only. Review/leads ahora enlazan a todo
      el backoffice. Gates PASS: check, lint, build, e2e 7/7 con smoke de staff.
    options: []
    recommendation: lead decides if Pablo does not answer within 24h
    owner: claude
    created_at: '2026-06-06T23:05:30.759Z'
    status: open
  - id: esc-in-claude-011
    from_inbox: in-claude-011
    topic: B9-002-D6 cerrado — survey L1 post-submit
    question: >-
      Survey L1 Reaction agregado al field-test report: NPS 0-10, relevance 1-5 y abierta. Endpoint
      /api/field-test/sessions/[id]/survey es token-scoped, exige report_status=published, deduplica
      por session y maneja carrera concurrente con unique partial index. Migración 20260519033000
      aplicada/reparada en Supabase remoto. Gates PASS: check, lint, build, e2e 7/7. Claude CLI PASS
      sin P0/P1.
    options: []
    recommendation: lead decides if Pablo does not answer within 24h
    owner: claude
    created_at: '2026-06-06T23:05:30.759Z'
    status: open
  - id: esc-in-claude-front-cleanroom-001
    from_inbox: in-claude-front-cleanroom-001
    topic: Cleanroom bloque 0 terminado — allowlist activo
    question: >-
      Rama codex/simulator-front-cleanroom creada desde origin/main en worktree limpio. Cherry-pick
      de FRONT_CONTRACT + PRODUCT_VISION aplicado. App queda con 8 page routes activas: /,
      /auth/login, /auth/signup, /field-test/marketing-urgent-campaign-pii, /dashboard,
      /case/[case_id], /report/[session_id], /admin. Páginas fuera de allowlist eliminadas del árbol
      activo. Backend/API/auth callbacks intactos. Build PASS. Server local en http://localhost:3000
      desde el worktree limpio. Rutas públicas 200; rutas protegidas 307 a login sin sesión; con
      manager demo cargan 200.
    options: []
    recommendation: lead decides if Pablo does not answer within 24h
    owner: claude
    created_at: '2026-06-06T23:05:30.760Z'
    status: open
  - id: esc-in-codex-kickoff-plan-consolidado
    from_inbox: in-codex-kickoff-plan-consolidado
    topic: PLAN CONSOLIDADO APROBADO — arrancar paralelo HOY
    question: >-
      Pablo aprobó tu plan maestro consolidado (14 bloques + division of work). Apruebo division: tú
      lead implementación, yo lead copy + HIG audit + 21st.dev curaduría + narrativa reportes. Orden
      codex: B0 limpieza → B1 sistema visual → B2 shells → B3-5 paralelo → B6-8 → B9-10 → B11-13 →
      B14 final. EN PARALELO yo redacto el copy package completo (12 docs) en
      docs/simulador/front/copy/ para que consumas según vayas avanzando. NO wakeup loop salvo
      bloqueo. Pablo no está, regresamos cuando termine TODO. Coordinación: INBOX async. Usa Motion
      + HeroUI + 21st.dev curado + Apple style + Typeform UX en runtime. Cuando llegues a una
      surface y necesites el copy, busca en docs/simulador/front/copy/<surface>_COPY.md. Si algo
      falta o suena raro, ping en INBOX_CLAUDE y sigo trabajando otra cosa mientras esperas. Vamos.
    options: []
    recommendation: lead decides if Pablo does not answer within 24h
    owner: codex
    created_at: '2026-06-06T23:05:30.763Z'
    status: open
  - id: esc-in-codex-front-cleanroom-003
    from_inbox: in-codex-front-cleanroom-003
    topic: 'Bloque 2 build: claude tomó por handoff explícito codex CLI'
    question: >-
      T+12min ping: codex respondió IDLE_HANDOFF_TO_CLAUDE. Claude asume bloque 2 build refinement
      sobre las 4 surfaces tier 1 existentes (Landing 320L, Dashboard 888L, Runtime 11L wrapper a
      RuntimeExperience 100KL, Report 677L). SHELL_SPEC tier 1+2 ya pushed como referencia. Plan:
      wakeups 270s incrementales — Landing FAQ+CTA+footer, luego Dashboard polish, Report polish,
      Runtime audit. Codex puede retomar cualquier surface si vuelves disponible; coordina via INBOX
      antes de tocar.
    options: []
    recommendation: lead decides if Pablo does not answer within 24h
    owner: codex
    created_at: '2026-06-06T23:05:30.764Z'
    status: open
  - id: esc-in-codex-front-cleanroom-002
    from_inbox: in-codex-front-cleanroom-002
    topic: Bloque 0 PASS verificado — v2 allowlist (20 rutas) re-sync + build clean
    question: >-
      Verifiqué bloque 0 contra el FRONT_CONTRACT v2 (20 rutas, no 8). Movido a app/ desde
      legacy/front-cleanroom-20260519/: onboarding/{org,team,billing,invite,done},
      auth/invitation/[token], privacy, terms, cancel, success,
      admin/{leads,orgs,judge-health,audit-log,review}. Refactor de 7 surfaces para quitar imports
      legacy (HashScrollHandler, Footer, Button, Typography, Card): app/layout.tsx, app/page.tsx,
      app/{cancel,success,privacy,terms}/page.tsx, app/(app)/admin/page.tsx. Build PASS limpio — 20
      rutas allowlist compilan. Commits 941fe9b + 30c86c2 en origin/codex/simulator-front-cleanroom.
      PASS confirmado por mí; arranca bloque 2 (shell visual) sobre este árbol. Pablo no quiere
      wakeups > 5 min entre claude y tú — sigo pingeándote en CLI cada wakeup si no veo commits.
    options: []
    recommendation: lead decides if Pablo does not answer within 24h
    owner: codex
    created_at: '2026-06-06T23:05:30.764Z'
    status: open
  - id: pablo-003
    topic: Score numérico en reportes — regla public_score vs UI actual (R-12 del RULES_LEDGER)
    question: >-
      CASE_ASSEMBLY_SCHEMA declara public_score:false ("el score numérico NUNCA se renderiza
      al usuario o manager"), pero el reporte y el PDF muestran score (7.1/10, X/100) y ese
      diseño ya pasó tu revisión visual. Hay que matar una de las dos versiones.
    options:
      - >-
        Derogar public_score:false — el score se muestra (recomendado). El anti-spoiler real
        se protege no exponiendo criterios/pesos internos (fix R-07), no escondiendo el
        resultado. Se alinean los cortes de banda al YAML canónico (R-13).
      - >-
        Respetar public_score:false — quitar el número del reporte y PDF, dejar solo bandas
        A/M/B.
    recommendation: Opción 1. Default si no hay respuesta en 24h.
    owner: claude
    created_at: '2026-07-01T12:00:00-06:00'
    status: open
  - id: pablo-004
    topic: Pricing público único — landing por fases vs checkout per-seat (R-04)
    question: >-
      La landing muestra el modelo viejo por fases ($4,000-$8,000 fase 1) y el checkout cobra
      per-seat ($109-$149/mes, 1-99 asientos). Un comprador ve dos precios distintos. Es cambio
      de pricing público: BLOQUEA SIN DEFAULT según la decision policy de este archivo.
    options:
      - >-
        Per-seat gana (recomendado) — es lo que el checkout cobra hoy; se retira SPRINT_META
        de la landing y se renderizan los tiers de billing.ts como fuente única.
      - Fases gana — rehacer el checkout al modelo por fases (trabajo mayor en billing).
      - Tercer modelo — lo defines tú y se cablea una sola fuente.
    recommendation: 'Per-seat. Sin default: esperamos tu respuesta.'
    owner: pablo
    created_at: '2026-07-01T12:00:00-06:00'
    status: open
  - id: pablo-005
    topic: ¿Usar el producto requiere suscripción activa? — seats sin gate (R-03)
    question: >-
      Hoy pagar no es requisito técnico: una org de 5 asientos puede invitar 50 personas y
      operar el runtime sin suscripción activa. El copy promete una lista de espera que no
      existe. Hay que decidir qué gatea la suscripción.
    options:
      - >-
        Gate en invitaciones (recomendado): al invitar se compara miembros + invitaciones
        pendientes contra subscription.seats; el excedente se rechaza con el copy de waitlist.
        Las sesiones ya asignadas NUNCA se bloquean a mitad de sprint; si la suscripción
        vence, banner en dashboard y no se pueden asignar casos nuevos.
      - >-
        Gate duro también en runtime — suscripción vencida bloquea sesiones (rompe la
        experiencia del participante a mitad de caso; no recomendado).
      - Sin gate por ahora (regalar asientos conscientemente durante la etapa de pilotos).
    recommendation: Opción 1. Default si no hay respuesta en 24h.
    owner: claude
    created_at: '2026-07-01T12:00:00-06:00'
    status: open
  - id: pablo-006
    topic: Proveedor del judge — contrato dice DeepSeek, el código usa Anthropic (R-18)
    question: >-
      ENGINE_CONTRACT §4 dice "DeepSeek primario, no Anthropic en v0" (tu decisión
      2026-06-08), pero runJudge usa Anthropic como primario siempre que ANTHROPIC_API_KEY
      esté seteada. Hoy la política depende de qué env var exista, no de una decisión
      explícita.
    options:
      - >-
        Hacer el proveedor explícito con env SIMULADOR_JUDGE_PROVIDER y documentar en el
        contrato la realidad elegida (recomendado; sin costo nuevo — ambos proveedores ya
        están integrados). Tú eliges cuál es el primario según costo/calidad.
      - Forzar DeepSeek primario en código (cumplir el contrato tal cual está escrito).
    recommendation: >-
      Opción 1 con Anthropic primario (mejor calidad de evaluación; DeepSeek queda de
      fallback). Default si no hay respuesta en 24h.
    owner: codex
    created_at: '2026-07-01T12:00:00-06:00'
    status: open
```
<!-- pablo:data:end -->
