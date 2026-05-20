---
type: contract
title: Front contract — scope del producto visible v2 cleanroom
date: 2026-05-19
authors: [claude]
reviewers: [codex, pablo]
status: published-draft
scope: define qué surfaces existen, qué rutas son activas, qué ve cada rol, qué datos consume cada pantalla, qué acciones puede hacer cada usuario. Sirve como cerca clara entre el simulador corporativo y cualquier residuo histórico
---

# Front contract — scope visible

## TL;DR

Producto v2 tiene **20 rutas productivas allowlist**, **4 rutas utilitarias permitidas** y **8 shells**. Este contrato es la cerca: si una pantalla no está aquí, no existe.

## Rutas activas productivas (allowlist)

| Ruta | Rol que la ve | Layout | Auth required |
|---|---|---|---|
| `/` | visitante | PublicNav | ❌ |
| `/auth/login` | visitante | AuthLayout | ❌ |
| `/auth/signup` | visitante | AuthLayout | ❌ |
| `/auth/invitation` | empleado invitado | AuthLayout | ❌ / token |
| `/onboarding/org` | manager | OnboardingShell | ✓ |
| `/onboarding/team` | manager | OnboardingShell | ✓ |
| `/onboarding/invite` | manager | OnboardingShell | ✓ |
| `/onboarding/billing` | manager | OnboardingShell | ✓ |
| `/onboarding/done` | manager | OnboardingShell | ✓ |
| `/field-test/marketing-urgent-campaign-pii` | visitante | RuntimeLayout (no-auth variant) | ❌ |
| `/dashboard` | empleado / manager | AppShell + RoleNav | ✓ |
| `/case/[case_id]` | empleado | RuntimeLayout | ✓ |
| `/report/[session_id]` | empleado (su propio) / manager (su team) | ReportLayout | ✓ |
| `/admin/leads` | admin Itera staff | AdminShell | ✓ admin role |
| `/admin/review` | admin Itera staff | AdminShell | ✓ admin role |
| `/admin/orgs` | admin Itera staff | AdminShell | ✓ admin role |
| `/admin/judge-health` | admin Itera staff | AdminShell | ✓ admin role |
| `/admin/audit-log` | admin Itera staff | AdminShell | ✓ admin role |
| `/privacy` | visitante / usuario | PublicShell legal | ❌ |
| `/terms` | visitante / usuario | PublicShell legal | ❌ |

**Total: 20 rutas productivas.** Cualquier otra ruta queda fuera del producto activo salvo las rutas utilitarias explícitas abajo.

## Rutas utilitarias permitidas

| Ruta | Uso | Layout | Auth required |
|---|---|---|---|
| `/success` | retorno Stripe / estado de compra | PublicShell result | ❌ |
| `/cancel` | retorno Stripe cancelado | PublicShell result | ❌ |
| `/admin` | entrada staff; puede redirigir a `/admin/review` | AdminShell | ✓ admin role |
| `/maintenance` | ventana controlada de deploy/mantenimiento | PublicShell result | ❌ |

Estas rutas existen por operación/funnel, no cuentan como surfaces principales de producto.

## Shells activos

1. `PublicShell` — landing, legal, field-test entry/result.
2. `AuthShell` — login, signup, invitation.
3. `OnboardingShell` — org, team, invite, billing, done.
4. `EmployeeShell` — dashboard empleado y reportes propios.
5. `ManagerShell` — dashboard manager y reportes de equipo.
6. `RuntimeShell` — caso vivo autenticado y público.
7. `ReportShell` — reporte individual/agregado, PDF/share.
8. `AdminShell` — backoffice Itera.

### Decisión de implementación — dashboard por rol

- Fecha: 2026-05-20
- Decisión: `/dashboard` permanece como **una sola ruta role-aware**. El API entrega `viewer_role` y la pantalla renderiza la vista de empleado o manager según permisos.
- Razón: mantiene una entrada simple post-login, evita duplicar navegación y respeta RLS/server-side filtering. `EmployeeShell` y `ManagerShell` son shells conceptuales de experiencia, no URLs separadas.
- Implicación: si en v2 se separan rutas (`/me`, `/team`, etc.), debe hacerse con migración explícita de navegación y redirects; no por proliferación ad-hoc.

## Rutas prohibidas (NO aparecen en navegación, NO se linkean, NO se mantienen)

- `/simulator-design` y subroutes (mockup viejo)
- `/courseCreation`, `/lecture`, `/slides`, `/intake`, `/onboarding-system` (Itera Courses legacy)
- `/projectContext`, `/projectDescription`, `/conferencias` (legacy)
- `/experimentllm`, `/tutor-chat`, `/experimentAlpha` (experiments)
- `/dashboardAlpha`, `/dashboard` (versión vieja), `/homeAlt` (legacy)
- `/legacy-v2-cursos`, `/legacy` (residuos)
- `/componentes`, `/componentesPrueba`, `/landingPrueba` (test pages)

**Acción de limpieza:** estas carpetas quedan eliminadas del árbol activo. NO se referencian en navegación nueva.

## Roles + lo que cada uno ve

### Visitante (no autenticado)

**Qué ve:**
- `/` landing pública con value prop, hero, stats, casos, pricing, footer
- `/auth/login` y `/auth/signup`
- `/field-test/marketing-urgent-campaign-pii` (1 caso público sin login)

**Qué puede hacer:**
- Leer la landing
- Completar field-test (sin login)
- Recibir mini-reporte preliminar al terminar field-test
- Submit lead form (email + org name) para recibir reporte completo
- Crear cuenta o iniciar sesión

**Qué NO puede hacer:**
- Acceder al dashboard real
- Ver reportes de otros
- Acceder a admin

**Navegación:**
- PublicNav: logo + Producto + Casos + Pricing + Contacto + [Login / Crear cuenta]

### Empleado autenticado (participante)

**Qué ve:**
- `/dashboard` — lista de casos asignados, estado de cada uno (no iniciado / en progreso / completado), CTA a reporte si existe
- `/case/[case_id]` — runtime del caso vivo (6 secciones)
- `/report/[session_id]` — su propio reporte ejecutivo

**Qué puede hacer:**
- Empezar o continuar un caso vivo asignado
- Completar las 6 secciones del runtime: Contexto → Datos → IA → Revisión → Decisión → Respuesta
- Pausar y retomar
- Ver su reporte una vez completado
- Logout

**Qué NO puede hacer:**
- Ver reportes de otros participantes
- Ver agregado del team
- Modificar su reporte después de submitted
- Acceder a admin

**Navegación:**
- RoleNav empleado: logo + Mis casos + Mi reporte + [Avatar → Logout]

### Manager (manager de team)

**Qué ve:**
- `/dashboard` — vista agregada del team:
  - Lista de participantes con estado + banda promedio
  - KPI strip: progreso del sprint, banda promedio, eventos de riesgo
  - Matriz 3×5 (bandas × dimensiones) cuando esté implementada
  - Recomendaciones agregadas (pilotar/entrenar/pausar/escalar)
- `/report/[session_id]` — reporte de cualquier participante de SU team
- Banners: review pendiente / sprint cerrando / no sessions completadas

**Qué puede hacer:**
- Drill-down en participantes individuales
- Abrir reportes de su team
- Ver evidencia textual + risk events
- Exportar reportes / compartir con stakeholders
- Logout

**Qué NO puede hacer:**
- Ver reportes de OTROS teams (RLS enforced)
- Ver detalles internos del judge (confidence raw, prompt-builder)
- Acceder a admin Itera staff
- Modificar bandas o reportes

**Navegación:**
- RoleNav manager: logo + Dashboard equipo + Reportes + [Avatar → Logout]

### Admin Itera staff (Pablo + codex + claude internal)

**Qué ve:**
- `/admin` — entrada simple con submenu:
  - Leads (capturados via field-test)
  - Human review queue (risk events high pendientes)
  - Orgs activas (overview)
  - Judge health (calibration status)
  - Funnel 30d (analytics)

**Qué puede hacer:**
- Operar leads_inbox
- Confirmar/dismiss human reviews
- Ver health checks
- Ver orgs activas + sus métricas
- Acceso solo si `simulador.users.is_staff = true`

**Qué NO puede hacer:**
- Modificar judge output sin sign-off (M9-3-D77 hybrid review requires double signature)
- Eliminar customer data sin process formal (M9-3-D91)
- Override DPA o compliance settings sin counsel

**Navegación:**
- AdminShell: logo + Leads + Review queue + Orgs + Funnel + Health + [Logout]

## Datos mínimos por pantalla

### `/` landing pública (visitante)

Datos hardcoded en `app/(public)/page.tsx` durante fase visual:
- Hero copy + stats (3 US anchors + 2 LATAM proof points — ya en `lib/simulador/copy/landing.ts.stats`)
- Lista 3-5 casos featured (slug + title + tension) — desde `lib/simulador/copy/landing.ts.cases`
- Pricing card (3 tiers — desde `lib/simulador/billing.ts.SIMULADOR_PLANS`)
- Footer copy

**Backend connection:** ninguna durante fase visual. Sólo después: link a `/field-test` y `/auth/signup`.

### `/auth/login` + `/auth/signup`

Datos: ninguno hardcoded. Forms vacíos.

**Backend connection inmediata (auth no se congela):**
- POST a Supabase Auth con email + password
- POST a Google OAuth si user usa esa opción
- Redirect a `/dashboard` post-auth

### `/field-test/marketing-urgent-campaign-pii` (visitante)

Datos:
- Case YAML completo (desde `docs/simulador/contrato_v0/casos/marketing_urgent_campaign_pii_v1.yaml`)
- 6 secciones del runtime
- Mini-reporte template post-completion

**Backend connection (no se congela):**
- POST events a `/api/field-test/sessions/[sessionId]/events`
- POST prompts a `/api/field-test/sessions/[sessionId]/llm`
- POST lead a `/api/field-test/sessions/[sessionId]/lead`
- GET reporte preliminar al terminar

### `/dashboard` (empleado)

Datos hardcoded durante fase visual:
- Mock user: nombre, email, avatar
- Mock casos asignados:
  - 1 caso "in_progress" con timestamp última actividad
  - 1 caso "completed" con link a reporte
  - 0-1 casos "not_started"
- Mock duración estimada per caso

**Backend connection final:**
- GET `/api/sessions?user_id=X` → casos asignados + statuses
- GET `/api/sessions/[id]/last_step` → para resume

### `/dashboard` (manager)

Datos hardcoded durante fase visual:
- Mock team: nombre, 10-15 participantes con nombres + bandas + estados
- KPI strip: 60% progreso, banda promedio M, 3 risk events
- Matriz 3×5 con cuentas mock
- 4 recomendaciones mock (pilotar/entrenar/pausar/escalar)

**Backend connection final:**
- GET `/api/dashboard` → team aggregate

### `/case/[case_id]` (runtime empleado)

Datos hardcoded durante fase visual:
- Case content: brief, dataset, 6 secciones
- Mock LLM responses (no Anthropic call yet — usar respuestas pre-generadas)
- Estado local: respuestas del usuario por step

**Backend connection final:**
- GET `/api/sessions/[id]` → state
- PATCH `/api/sessions/[id]/responses` → guardar por step
- POST `/api/sessions/[id]/llm` → call Anthropic
- POST `/api/sessions/[id]/complete` → trigger evaluate

### `/report/[session_id]` (empleado o manager)

Datos hardcoded durante fase visual:
- Mock reporte: 5 dimensiones con bandas + evidencia textual
- 2-3 risk events mock con severity + evidence_text
- Recomendación mock (pilotar/entrenar/pausar/escalar)
- Next 7-day actions mock

**Backend connection final:**
- GET `/api/sessions/[id]/report` → reporte completo

### `/admin` (Itera staff)

Datos hardcoded durante fase visual:
- Mock 5 leads
- Mock 2 risk events en review queue
- Mock 3 orgs activas
- Mock funnel data 30d

**Backend connection final:**
- GET `/api/admin/leads`
- GET `/api/admin/review-queue`
- GET `/api/admin/orgs`
- GET `/api/admin/funnel`

## Navegación contextual (NO hay 1 navbar global)

Cada layout tiene su propia nav:

- **PublicNav** (`/`, `/auth/*`, `/field-test/*`)
- **RoleNav empleado** (`/dashboard`, `/case/*`, `/report/*` cuando viewer = participant)
- **RoleNav manager** (`/dashboard`, `/report/*` cuando viewer = manager)
- **AdminShell** (`/admin/*`)

NO global navbar. NO link a "/simulator-design" desde ninguna parte. NO links cross-rol (manager NO ve "Mis casos como participante").

## Datos faltantes / consideraciones críticas

1. **Auth detection role:** el dashboard depende de detectar si el viewer es empleado o manager. Esto se resuelve con `viewer_role` del API endpoint `/api/dashboard` que ya existe. Durante fase visual, hardcoded.

2. **Multi-team manager:** v1 asume 1 team por manager. Multi-team es v2+.

3. **Empleado en múltiples orgs:** v1 NO soporta. Si pasa, mostrar la primera org como default.

4. **Field-test → signup conversion:** lead form en mini-reporte field-test no crea cuenta automáticamente. Solo captura email. Lead aparece en `/admin/leads` para outreach Pablo.

5. **Reports compartibles:** `/shared/report/[token]` queda fuera de esta versión visible. Si manager quiere compartir, descarga PDF (M9-3-D89 data export framework).

## Reglas de "está / no está en v2"

✅ Está en v2 si:
- Una de las 20 rutas productivas o 3 utilitarias permitidas lo necesita
- Es navegación de uno de los 4 roles definidos
- Es dato consumido por surface activa

❌ NO está en v2 si:
- Es ruta de Itera Courses legacy
- Es preview / mockup / experiment
- Es feature avanzada (multi-team, multi-language, custom branding)
- Es admin advanced (data export UI, billing portal con upgrade — fuera de esta versión visible hasta F1 v2 roadmap)

## Próximos pasos

1. **Codex** implementa shell visual usando este contrato + `APPLE_HIG_RULES_FOR_ITERA.md`.
2. **Claude** audita copy/HIG/no-LMS por surface.
3. **Pablo** solo decide excepciones donde Apple HIG o este contrato no cubran el caso.
