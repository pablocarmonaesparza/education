# Simulador MVP — Runbook operativo

Status: shipped W1-W7 (Fase 0 vendible). Diagnóstico operativo de criterio
en uso de IA. B2B, USD vía Stripe (W6 deferred), comprador Head/VP de
Marketing/Growth/Operations.

Estructura del repo en orden de lectura:
- `app/(public)/page.tsx` — landing copy para Head/VP.
- `app/field-test/marketing-urgent-campaign-pii/page.tsx` — muestra pública
  sin login del caso 1.
- `app/(onboarding)/onboarding/{org,team,invite}/page.tsx` — flow buyer.
- `app/(app)/case/[case_id]/page.tsx` — runtime empleado (5 steps).
- `app/(app)/dashboard/page.tsx` — vista manager.
- `app/(app)/report/[session_id]/page.tsx` — reporte ejecutivo.
- `app/(app)/admin/review/page.tsx` — cola review humano (staff Itera).
- `app/api/sessions/*` — backend del runtime.
- `app/api/field-test/sessions/*` — backend público token-scoped del caso de
  muestra. No usa Supabase anonymous auth ni tablas B2B.
- `app/api/dashboard` — agregación team.
- `app/api/admin/review/*` — staff queue endpoints.
- `lib/simulador/judge/*` — pipeline judge (Anthropic primario, DeepSeek/Gemini
  fallback real + override matrix).
- `lib/simulador/{config,db.types,is-staff,use-session,use-step-patch}.ts`
- `supabase/migrations/017_simulador_v0.sql` — schema canónico.
- `supabase/migrations/018_drop_courses_legacy.sql` — limpieza pre-MVP.
- `supabase/migrations/019_simulador_rls.sql` — RLS multi-tenant.
- `supabase/migrations/20260515013000_simulador_field_test.sql` — tablas
  separadas para field-test público
  (`field_test_sessions/events/reports/leads`).

## Variables de entorno requeridas

| Variable                         | Uso                                              |
| -------------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`       | Cliente browser + SSR + admin.                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Cliente browser.                                 |
| `SUPABASE_SERVICE_ROLE_KEY`      | Admin client (route handlers).                   |
| `ANTHROPIC_API_KEY`              | Judge LLM primario (W5). En dev sin key → mock heurístico; field-test prod puede usar fallback real. |
| `SIMULADOR_JUDGE_MODEL`          | Override del modelo (default `claude-opus-4-5`). |
| `SIMULADOR_JUDGE_FALLBACK_MODEL` | Fallback (default `claude-sonnet-4-5`).          |
| `SIMULADOR_STAFF_EMAILS`         | Allowlist comma-separated para `/admin/review`.  |
| `SENDGRID_API_KEY`               | Invitaciones (W3).                               |
| `STRIPE_SECRET_KEY`              | (W6 deferred).                                   |
| `UPSTASH_REDIS_REST_URL/_TOKEN`  | Rate limits prod (fail-open en dev).             |
| `DEEPSEEK_API_KEY`               | LLM beat real + judge fallback en field-test. En prod requerido. |
| `GEMINI_API_KEY`                 | Fallback real para LLM beat + judge field-test. En prod requerido. |
| `FIELD_TEST_REQUIRE_REAL_LLM`    | Default real en prod. `false` solo emergency.    |
| `FIELD_TEST_REQUIRE_RATE_LIMIT`  | Default exige Upstash en prod. `false` emergency.|

## Flujo end-to-end (manual smoke test)

0. **Field-test público**
   - `/field-test/marketing-urgent-campaign-pii` crea/resume una sesión con
     cookie httpOnly `itera_field_test`.
   - Persistencia separada: `simulador.field_test_sessions`,
     `field_test_step_events`, `field_test_reports`, `field_test_leads`.
   - Cada PATCH va por `/api/field-test/sessions/[id]/responses`.
   - El LLM beat usa DeepSeek/Gemini vía `lib/llm/client.ts`; en producción no
     puede caer a mock si falta credencial.
   - Submit → `/api/field-test/sessions/[id]/complete` → judge compartido
     (`scoreSubmission`) → mini-reporte inline. Email opcional después del
     reporte, nunca antes.

1. **Buyer onboarding**
   - `/auth/signup` (Google OAuth) → callback crea bridge user en
     `simulador.users`.
   - `/onboarding/org` POST `/api/orgs` crea organization + memberships.
   - `/onboarding/team` crea team.
   - `/onboarding/invite` POST `/api/orgs/[id]/invitations` envía emails.

2. **Invitee join**
   - Email contiene link `/auth/invitation/[token]`.
   - Si no está logueado → redirect a `/auth/signup?next=...`.
   - Si está logueado → POST `/api/invitations/[token]/accept` crea
     org_membership + team_membership.

3. **Employee runtime**
   - `/case/marketing_urgent_campaign_pii` → useSession hook POST
     `/api/sessions { case_slug }`. La API resuelve case_template +
     case_variant, crea/resume sprint "Fase 0 — Diagnóstico standalone"
     (admin client), assignment + simulation_session.
   - Cada cambio de respuesta dispara PATCH debounced (800ms) a
     `/api/sessions/[id]/responses` — append-only en
     `simulation_step_events`.
   - Botón final → flush + POST `/api/sessions/[id]/complete` → marca
     status='submitted' + dispara judge en background via Next 16
     `after()`.

4. **Judge LLM (background)**
   - `evaluateAndPersist(session_id)` carga case+rubric+events, llama a
     Anthropic (Opus 4.5 default, Sonnet fallback) con tool_use forzado
     al `submit_evaluation` schema.
   - Aplica override matrix TS (cap a pausar si risk high, etc.).
   - Inserta `evaluation_runs` + `risk_events` + `reports`.
   - Si hay risk severity=high → `reports.status='pending_review'` +
     push a `human_review_queue` (status='queued').
   - Si no → `reports.status='published'`.

5. **Report**
   - `/report/[session_id]` → polling cada 4s `/api/sessions/[id]/report`
     hasta que llegue status published o pending_review.
   - Si pending: banner "en revisión humana".
   - Manager también puede llegar via `/dashboard` → click member card.

6. **Admin review (staff Itera only)**
   - `/admin/review` lista pending. Cada card muestra bandas + risk events
     + recomendación del judge.
   - Click recomendación distinta → POST `/api/admin/review/[queue_id]`
     con override → publica el report.

## Endurecimiento aplicado

- Rate limit en `/api/sessions/[id]/evaluate` (5 req/min/user vía
  `rateLimiters.ai`). Background trigger desde `/complete` es interno
  (no rate-limited).
- Field-test público usa token opaco en cookie + tablas separadas + rate limit
  por IP/cookie. No toca RLS del runtime autenticado.
- `scripts/simulador/check-field-test-spoilers.mjs` bloquea leaks obvios de
  rúbrica/risk-events en APIs pre-submit y textos contaminantes del runtime.
- Idempotencia del judge: `evaluateAndPersist` chequea existencia previa
  de evaluation_run y skipea con `{ skipped: true, reason }`. Para
  forzar re-evaluación pasar `?force=1`.
- `simulador.compute_recommendation(session_id)` SQL function disponible
  para auditoría offline (mismo override matrix que TS).
- RLS multi-tenant en todas las tablas relevantes (ver
  `019_simulador_rls.sql`); `audit_log` + `human_review_queue` con
  deny-all + service_role only.

## Riesgos conocidos / TODO

- **Stripe (W6 deferred)**: no hay paywall. `/onboarding/org` actualmente
  no requiere pago. Cuando se conecte, agregar step
  `/onboarding/billing` con Stripe Checkout B2B (quantity = seats).
- **Demo seed**: no hay seed automático de orgs/teams/sessions para
  investor demo. Pablo puede crear 3 cuentas test manualmente.
- **Auth callback bridge**: crea `simulador.users` row en primer login.
  Para los 8 auth users existentes pre-W3 que no se han re-logueado,
  no tienen bridge user todavía → primer hit a `/api/sessions` o
  `/api/orgs` les dará error "Bridge user no inicializado".
- **Judge after()**: depende de Next.js mantener el process vivo después
  del response. En Vercel está soportado (5min budget). En self-hosted
  con muchas concurrent requests podría haber jitter; W7+ post-MVP
  considerar pg-boss o cola dedicada.
- **Sin Playwright E2E**: tests automatizados no implementados. Smoke
  test manual cubre los 3 flows críticos (buyer/employee/manager).
- **Field-test no es calibración estadística**: la muestra pública sirve para
  adquisición, completion y face-validity direccional. No usar sus resultados
  como benchmark, pricing proof ni claim de mercado.

## Smoke test rápido (5 min)

```bash
# Local
export SUPABASE_SERVICE_ROLE_KEY=...
export ANTHROPIC_API_KEY=...
export DEEPSEEK_API_KEY=...
export GEMINI_API_KEY=...
export SIMULADOR_STAFF_EMAILS=pablocarmonaesparza@gmail.com
bun dev

# 1. Visita http://localhost:3000 — landing debe cargar con copy nuevo.
# 2. Click "Probar 1 caso" → /field-test/marketing-urgent-campaign-pii.
# 3. Completa el caso sin login y verifica mini-reporte inline + lead opcional.
# 4. Verifica que /case/marketing_urgent_campaign_pii sigue pidiendo auth.
# 5. Signup con Google.
# 6. Visita /onboarding/org — crea Demo Co, industry SaaS, region MX.
# 7. /onboarding/team — Marketing.
# 8. /onboarding/invite — invitar email-test@.
# 9. Visita /case/marketing_urgent_campaign_pii.
# 10. Click "Continuar" en cada slide hasta llegar al final.
# 11. Submit final → loading "Evaluando…" → redirect a /report/[session_id].
# 12. Espera ~30s mientras el judge corre.
# 13. Verifica payload: 5 dimensions + risk_events + recommendation.
# 14. /dashboard — vista manager con 1 member completado.
# 15. /admin/review (solo si NODE_ENV=development con allowlist vacía o
#     SIMULADOR_STAFF_EMAILS incluye tu email).
```
