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

Producto v2 tiene **35 rutas productivas**, **4 utilitarias** (incluye `/dashboard`, ahora redirect por rol), **8 dev-only** (no indexan, fuera de nav) y **8 shells**. La tabla de abajo se **deriva del código real** (`app/`, 47 `page.tsx` + 2 route handlers de auth) y es la fuente única: si una pantalla no está aquí, no existe; si está, su columna **estado** dice qué es. Última sync con código: 2026-07-01.

## Tabla única de rutas (derivada de `app/`)

Estados: **productiva** (user-facing viva) · **utilitaria** (operación/funnel) · **dev-only** (lab/demo, no indexa, fuera de nav) · **ambigua** (existe y funciona, pero hay decisión de producto pendiente — ver "Duplicados / ambigüedades") · **legacy-resolver** (duplicado a archivar, ver más abajo) · **fantasma** (la nombraba el contrato viejo pero no existe en el árbol).

### Público / Auth / Legal

| Ruta | Rol / uso | Layout | Auth | Estado |
|---|---|---|---|---|
| `/` | visitante — landing | PublicNav | ❌ | productiva |
| `/auth/login` | visitante | AuthShell | ❌ | productiva |
| `/auth/signup` | visitante | AuthShell | ❌ | productiva |
| `/auth/invitation/[token]` | empleado invitado | AuthShell | ❌ / token | productiva |
| `/auth/callback`, `/auth/confirm` | OAuth / magic link (route handlers) | — | ❌ | productiva |
| `/privacy`, `/terms` | visitante / usuario | PublicShell legal | ❌ | productiva |

### Onboarding (manager, post-signup)

| Ruta | Uso | Layout | Auth | Estado |
|---|---|---|---|---|
| `/onboarding/org` | identidad de la org | OnboardingShell | ✓ | productiva |
| `/onboarding/team` | crear equipo | OnboardingShell | ✓ | productiva |
| `/onboarding/invite` | invitar miembros | OnboardingShell | ✓ | productiva |
| `/onboarding/context` | perfil de empresa pre-pago | OnboardingShell | ✓ | productiva |
| `/onboarding/billing` | pago Stripe | OnboardingShell | ✓ | productiva |
| `/onboarding/done` | confirmación | OnboardingShell | ✓ | productiva |

### Post-login (role-aware)

| Ruta | Uso | Layout | Auth | Estado |
|---|---|---|---|---|
| `/dashboard` | destino post-login; **redirect server-side por rol** → `/staff` (manager) o `/team` (empleado); sin membership → `/onboarding/org` | — (redirect) | ✓ | utilitaria |

### Empleado (participante)

| Ruta | Uso | Layout | Auth | Estado |
|---|---|---|---|---|
| `/team` | home empleado (hero + glance + leaderboard + casos recomendados) | EmployeeShell | ✓ | productiva |
| `/casos` | catálogo de casos con filtros | EmployeeShell | ✓ | productiva |
| `/case/[case_id]` | **runtime único** (config-driven, 5 secciones × 5 slides, `RuntimeExperienceV2`). Lo linkean `CaseCard`, `/dashboard`, `/staff`. `/jugar` se eliminó (F6, 2026-06-30): era la misma cosa bajo otra URL. | RuntimeShell | ✓ | productiva |
| `/practica/[beat_slug]` | player de practice beats — runtime **educativo** productivo (carga el beat activo de `simulador.practice_beats`; mismo shape formativo que validó `/aprender-demo`) | RuntimeShell | ✓ | productiva |
| `/reportes` | reporte personal glance (score/banda/dimensiones) | EmployeeShell | ✓ | productiva |
| `/report/[session_id]` | reporte ejecutivo de una sesión (propio / del team) | ReportShell | ✓ | productiva |
| `/perfil` | cuenta: perfil, org/team, idioma, notificaciones, logout | EmployeeShell | ✓ | productiva |

### Manager

| Ruta | Uso | Layout | Auth | Estado |
|---|---|---|---|---|
| `/staff` | dashboard equipo (KPI strip, grid, matriz, recomendaciones) | ManagerShell | ✓ | productiva |
| `/staff/casos` | catálogo de casos del sprint (contexto manager) | ManagerShell | ✓ | productiva |
| `/staff/casos/[slug]` | **caso revisión (manager)**: quién de su equipo lo completó (banda + link al reporte), fortalezas observadas, y recorrido read-only de las slides (`CaseReviewWalkthrough`) | ManagerShell | ✓ | productiva |
| `/staff/equipo` | miembros del equipo + settings | ManagerShell | ✓ | productiva |
| `/staff/matriz` | matriz dimensión × banda del equipo (cuántas personas cayeron en cada banda por dimensión) | ManagerShell | ✓ | productiva |
| `/staff/recomendaciones` | acciones recomendadas por persona: los cuatro caminos (pilotar/entrenar/pausar/escalar) con counts | ManagerShell | ✓ | productiva |
| `/staff/reportes` | reportes agregados del equipo | ManagerShell | ✓ | productiva |
| `/empresa` | settings de org (identidad, plan/billing, miembros) | ManagerShell | ✓ | productiva |

### Admin Itera staff

| Ruta | Uso | Layout | Auth | Estado |
|---|---|---|---|---|
| `/admin` | entrada staff (submenu) | AdminShell | ✓ staff | productiva |
| `/admin/leads` | leads de field-test / comercial | AdminShell | ✓ staff | productiva |
| `/admin/review` | cola de human review (risk events) | AdminShell | ✓ staff | productiva |
| `/admin/orgs` | orgs activas + métricas | AdminShell | ✓ staff | productiva |
| `/admin/captacion` | pipeline propio de captación (DuckDB): prospectos públicos + score IA | AdminShell | ✓ staff | productiva |
| `/admin/cases` | casos del simulador (bespoke + global): lifecycle, dueño, uso | AdminShell | ✓ staff | productiva |
| `/admin/cases/[slug]` | **caso revisión (staff/admin)**: efectividad across orgs (orgs que lo usan, completions, distribución de bandas) + recorrido read-only de las slides (`CaseReviewWalkthrough`) | AdminShell | ✓ staff | productiva |
| `/admin/lecciones` | lecciones educativas (practice beats): estado + completion | AdminShell | ✓ staff | productiva |
| `/admin/judge-health` | calibración del judge | AdminShell | ✓ staff | productiva |
| `/admin/audit-log` | log de acciones staff | AdminShell | ✓ staff | productiva |

### Utilitarias (operación / funnel)

| Ruta | Uso | Layout | Auth | Estado |
|---|---|---|---|---|
| `/success`, `/cancel` | retorno Stripe | PublicShell result | ❌ | utilitaria |
| `/maintenance` | ventana de deploy/mantenimiento | PublicShell result | ❌ | utilitaria |

### Dev-only (no indexan, no van en nav productiva, se conservan)

Mecanismo: las rutas dev-only viven en `internalReviewRoutes` de `proxy.ts` — en prod responden 404 salvo con dev bypass activo.

| Ruta | Uso | Estado |
|---|---|---|
| `/design` | editor de tokens en vivo | dev-only |
| `/design/components` | **galería = espejo del design system** (fuente única de componentes) | dev-only |
| `/dev` | hub interno de QA (lista rutas, bypass de auth, override de tema) | dev-only |
| `/exercise-lab` | catálogo de bloques de ejercicio | dev-only |
| `/case-demo` | **demo público del sistema**: caso jugable sin login que termina con el reporte de cierre. Reachable en prod, noindex (robots). Entrada desde la landing ("Ver el demo"). | demo-público |
| `/case-template` | estructura de caso (referencia de diseño) | dev-only |
| `/aprender-demo` | **demo público del motor educativo**: módulo formativo jugable sin login (responde → Revisar → feedback). Reachable en prod, noindex (robots). Enlazado desde el cierre del demo operativo. | demo-público |
| `/motores` | consola de lectura: cómo está organizado cada motor (educativo + operativo) | dev-only (en `internalReviewRoutes` de `proxy.ts` desde 2026-07-02 — 404 en prod) |

### Duplicados / ambigüedades a resolver (decisión de Codex + producto, **NO borrado mecánico**)

Verificado con grep de referencias el 2026-06-07 — cada candidato a "borrar" está conectado o es ambiguo:

| Caso | Realidad (links reales) | Pendiente |
|---|---|---|
| `/case/[case_id]` vs `/jugar/[case_id]` | **Resuelto 2026-06-30 (F6).** Ganó el motor config-driven (`RuntimeExperienceV2`); se sirve bajo `/case/[case_id]` (la URL ya conectada — no se repuntaron los catálogos, se movió el motor). El componente legacy de 5 pasos y la ruta `/jugar` se eliminaron del repo. | cerrado. |
| `/dashboard` vs `/team` + `/staff` | **Resuelto 2026-07-02 (F3).** `/dashboard` deja de renderizar una tercera vista (era un fork duplicado del dashboard del manager). Ahora es un **redirect server-side por rol**: manager/org_admin/billing_admin → `/staff`, empleado → `/team`, sin membership → `/onboarding/org`. Sigue siendo el destino post-login. | cerrado. |
| `/field-test/marketing-urgent-campaign-pii` | **no existe** en `app/`; el demo público hoy vive en `/case-demo`. | decisión de producto: implementar un field-test con lead capture propio, o dejarlo en `/case-demo` y quitar la ruta del lenguaje del producto. |

> **Autoridad:** esta tabla es la fuente única de rutas. Las secciones siguientes (roles, datos por pantalla, navegación) describen comportamiento y a veces citan nombres previos; cuando lo hagan, la ruta canónica es la de esta tabla — entrada de empleado `/team`, de manager `/staff`, runtime único `/case/[case_id]`.

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

- Fecha: 2026-07-02 (revisa la decisión previa del 2026-05-20).
- Decisión: `/dashboard` es un **redirect server-side por rol**, no una vista. La superficie real por rol ya existe y es canónica: empleado → `/team`, manager → `/staff`. `/dashboard` resuelve el rol (`team_memberships.role`; fallback a `organization_memberships.role`) y hace `redirect()`.
- Razón: la vista role-aware original terminó siendo un fork duplicado de `/staff` (mismo dashboard de manager, 875 líneas espejo). Mantener una tercera vista era deuda; el redirect mantiene la entrada única post-login sin duplicar UI ni navegación.
- Implicación: los links a `/dashboard` (auth/error/success) siguen funcionando — aterrizan en la superficie correcta por rol. `EmployeeShell`/`ManagerShell` siguen siendo shells conceptuales realizados en `/team` y `/staff`.

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
- `/case/[case_id]` — runtime del caso vivo (5 secciones × 5 slides)
- `/report/[session_id]` — su propio reporte ejecutivo

**Qué puede hacer:**
- Empezar o continuar un caso vivo asignado
- Completar las 5 secciones del runtime (5 slides cada una): contexto → datos → ia → revision → cierre (autoridad: `docs/simulador/case_factory/CASE_ASSEMBLY_SCHEMA.yaml`)
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
- 5 secciones × 5 slides del runtime
- Mini-reporte template post-completion

**Backend connection (no se congela):**
- POST events a `/api/field-test/sessions/[sessionId]/events`
- POST prompts a `/api/field-test/sessions/[sessionId]/llm`
- POST lead a `/api/field-test/sessions/[sessionId]/lead`
- GET reporte preliminar al terminar

### `/team` (empleado — dashboard)

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

### `/staff` (manager — dashboard)

Datos hardcoded durante fase visual:
- Mock team: nombre, 10-15 participantes con nombres + bandas + estados
- KPI strip: 60% progreso, banda promedio M, 3 risk events
- Matriz 3×5 con cuentas mock
- 4 recomendaciones mock (pilotar/entrenar/pausar/escalar)

**Backend connection final:**
- GET `/api/dashboard` → team aggregate

### `/case/[case_id]` (runtime empleado)

Datos hardcoded durante fase visual:
- Case content: brief, dataset, 5 secciones × 5 slides
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
- Una de las 35 rutas productivas o 3 utilitarias permitidas lo necesita
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
