# legacy freeze plan — qué se archiva, retiene, reposiciona o entra al core v0

> [!important] tesis vigente
> itera **no es escuela de IA**. itera es un sistema de simulación que **detecta brechas de criterio, prescribe práctica mínima y demuestra mejora operativa**.

## filtro único

para cada asset (ruta, componente, migración, copy, página notion):

> **¿ayuda a cerrar una brecha detectada por simulación y demostrar mejora?**

- **sí** → `core` o `retain` o `reposition`
- **no** → `archive` o `forbidden`

## las 5 categorías

| categoría | qué significa | reversible | criterio de salida |
|---|---|---|---|
| **core** | en uso activo en simulador v0 | n/a (es el producto) | sale solo si la tesis cambia |
| **retain** | motor invisible (infra, marca, decisiones), no se toca | sí pero raro | reemplazo técnico, no estratégico |
| **reposition** | rol cambia, contenido se reusa para nuevo propósito | sí, post-field-test | no entrega valor cuando se conecta |
| **archive** | apagado del producto, código se queda | sí — pero con owner + razón documentada | nueva razón clara post-v0 |
| **forbidden v0** | prohibido reintroducir en el simulador v0 | sí post-validation | producto v1 valida que sí aporta |

**regla dura**: archivado no se desarchiva sin (a) owner asignado, (b) razón documentada nueva, (c) revisión del orquestador. si no, contaminación vuelve por la puerta de atrás.

---

## tabla granular por superficie

### app/ — routes y páginas

| ruta | categoría | razón |
|---|---|---|
| `app/page.tsx` (landing actual "ai de 0 a 100") | `archive` | hero shader + pricing + faq actuales son educación-flavored; landing v2 (Hero/Pricing/Compare/Empresas) reemplaza |
| `app/empresas/` | `reposition` | base correcta B2B; refactor con narrativa simulador (no "cursos para tu empresa") |
| `app/onboarding/` | `archive` | flow "qué quieres aprender" mata el simulador; nuevo onboarding entra como core post-field-test |
| `app/intake/` | `archive` | similar a onboarding, formato educación |
| `app/courseCreation/` | `archive` | "armar tu curso" — opuesto a la tesis |
| `app/projectDescription/`, `app/projectContext/` | `archive` | inputs del curso personalizado |
| `app/lecture/[slug]/` | `archive` | renderer de lecciones tradicionales |
| `app/experiment/`, `app/experimentAlpha/`, `app/experimentllm/` | `archive` | playgrounds de experimentación educativa |
| `app/dashboard/` (perfil + progress + lesson stats) | `archive` | dashboard alumno, no aplica |
| `app/dashboardAlpha/` | `archive` | iteración alterna del dashboard alumno |
| `app/home/`, `app/homeAlt/` | `archive` | iteraciones de home alumno |
| `app/conferencias/` | `archive` | catálogo de contenido pasivo |
| `app/about/`, `app/privacy/`, `app/terms/` | `retain` | páginas legales/marca, aplican igual |
| `app/auth/` | `retain` | infra de autenticación, no cambia |
| `app/cancel/`, `app/success/`, `app/paywall/` | `retain` | infra de billing, sin cambios |
| `app/legacy/` | `retain` | ya existe como bucket de archivado; usar como destino canónico |
| `app/componentes/`, `app/componentesPrueba/`, `app/landingPrueba/` | `archive` | playgrounds de UI, no producto |
| `app/simulator-design/` | `archive` | prototipo conversacional descartable (ver `decision_tesis_concentracion_plataforma.md` 9-may) |
| **`app/simulator/`** (no existe aún) | `core` | crear como home del producto v0 |
| **`app/manager/`** (no existe aún) | `core` post-field-test | dashboard B2B con evidence + competency matrix |

### app/api — endpoints

| endpoint | categoría | razón |
|---|---|---|
| `api/auth/` (incl. email-hook) | `retain` | infra |
| `api/stripe`, `api/stripe-webhook` | `retain` | infra billing |
| `api/email` | `retain` | transaccional only |
| `api/empresas-lead` | `retain` | captura B2B sirve igual al simulador |
| `api/generate-course`, `api/generate-course-full` | `archive` | genera cursos, opuesto a la tesis |
| `api/validate-idea` | `archive` | valida idea de curso personalizado |
| `api/tutor-chat` | `reposition` | el "tutor" puede convertirse en evaluator del simulador post-step |
| `api/slides/[id]` (slide_flags) | `reposition` | feedback de slide → feedback de practice beat |
| `api/telegram-link` | `archive` | bot educativo |
| `api/tiktok` | `reposition` | content marketing, no producto |
| `api/claude`, `api/dev` | `retain` | infra de modelos |
| `api/experiment/curso-personalizado` | `archive` | curso personalizado |
| `api/dashboard` | `archive` | endpoints del dashboard alumno |
| **`api/simulator/*`** (no existe) | `core` | endpoints del runtime simulador |

### components/landing — UI

| archivo | categoría | razón |
|---|---|---|
| `v2/Hero.tsx`, `v2/HeroDemo.tsx` | `reposition` | base estructural sirve; copy/visual refactor al simulador |
| `v2/Pricing.tsx` | `reposition` | tier individual $19 baja prioridad, B2B sube |
| `v2/Empresas.tsx` | `reposition` | sección B2B, refactor con narrativa simulador |
| `v2/Compare.tsx`, `v2/Como.tsx`, `v2/Problema.tsx`, `v2/CtaCierre.tsx`, `v2/Testimonios.tsx`, `v2/FAQ.tsx`, `v2/Navbar.tsx`, `v2/Mascota.tsx` | `reposition` | estructura útil, copy se reescribe |
| `NewHeroSection.tsx`, `NewHeroSectionAlt.tsx`, `HeroShader.tsx` | `archive` | landing v1, ya reemplazada por v2 |
| `AvailableCoursesSection.tsx`, `CapacitacionSection.tsx`, `CourseStructureSection.tsx`, `CursosSection.tsx`, `HowItWorksSection.tsx`, `ProjectIdeaSection.tsx`, `ProjectInputSection.tsx`, `bento-grid.tsx`, `AnimatedBackground.tsx`, `FAQSection.tsx`, `PricingSection.tsx`, `NextSectionIndicator.tsx` | `archive` | secciones de la era "curso de IA" |

### lib/ — módulos

| módulo | categoría | razón |
|---|---|---|
| `lib/auth/` | `retain` | infra |
| `lib/email/` | `retain` | transaccional |
| `lib/stripe/` | `retain` | billing |
| `lib/supabase/` | `retain` | DB client |
| `lib/llm/`, `lib/openai/`, `lib/anthropic/` (si existe) | `retain` | clientes IA |
| `lib/ratelimit/` | `retain` | infra |
| `lib/hooks/`, `lib/utils/` | `retain` | helpers |
| `lib/analytics/` | `retain` | infra de tracking |
| `lib/design-tokens.ts` | `retain` | DS (mascota/paleta/depth) |
| `lib/maintenance.ts` | `retain` | infra |
| `lib/lessons/` | `reposition` | renderer + queries → adaptar a practice_beats. el código de carga de lessons sirve para cargar beats. |
| `lib/course-generation/` | `archive` | genera cursos. opuesto a la tesis. |
| `lib/gamification.ts`, `lib/gamification-rarity.ts` | `archive` | XP/badges/streaks como motor; en v0 no aplica. UI decorativa puede seguir vía DS, pero la lógica de motor sale. |
| `lib/experiment/` | `archive` | playgrounds educación |
| `lib/onboarding/` | `archive` | onboarding alumno |
| `lib/tutor/` | `reposition` | tutor.providers puede ser evaluator del simulador |
| **`lib/simulador/`** | `core` | runtime mínimo implementado por Codex |

### supabase/migrations — schema

| migración | categoría | razón |
|---|---|---|
| `000_nuke_legacy.sql` → `002_seed_sections.sql` | `reposition` | `sections/lectures/slides` se convierten en `principles_library` para el motor de remediación |
| `003_lecture_embeddings.sql` | `reposition` | embeddings + cohere rerank → matcher de `gap → practice_beat` |
| `003_user_progress_and_analytics.sql` | `reposition` | `user_progress` se adapta a sessions del simulador |
| `004_cleanup_and_fks.sql`, `004_subscriptions.sql` | `retain` | constraints + subs |
| `005_payments_idempotency.sql`, `005_rls_policies_pre_launch.sql` | `retain` | billing + RLS |
| `006_*` (stripe_webhook_events, user_stats_and_gamification, welcome_email_sent_at) | mixto | webhook + welcome `retain`; user_stats + gamification → `archive` (no motor en v0) |
| `007_award_xp_includes_drafted.sql` | `archive` | XP motor |
| `008_publish_course_v1.sql` | `reposition` | publishing flow puede servir para case_templates |
| `009_slide_flags.sql`, `012_slide_flags_admin_v2.sql` | `reposition` | flagging → feedback de beats |
| `009b_telegram_lessons.sql`, `010_telegram_daily_send_idempotency.sql` | `archive` | telegram lecciones |
| `010_drop_mercadopago.sql` | `retain` | decisión financiera |
| `011_global_engagement_view.sql` | `archive` | métricas alumno |
| `013_badges_catalog_and_evaluator.sql`, `014_badge_xp_persistence.sql` | `archive` | gamification viral |
| `015_harden_security_definer_execute_grants.sql` | `retain` | seguridad |
| `016_enterprise_leads.sql` | `retain` | B2B captura |
| `20260428192212_harden_stripe_webhook_events_rls.sql` | `retain` | seguridad |
| **`017_simulador_schema.sql`** (no existe aún) | `core` | crear: `case_template / variant / session / evidence` |

### docs/ — contenido y memoria

| sección | categoría | razón |
|---|---|---|
| `docs/CONTEXT.md` | `reposition` | reescribir tesis: simulador, no curso. mantener stack, posicionamiento, decisiones. |
| `docs/METODOLOGIA.md` (5E + hypercorrection) | `retain` | motor cognitivo, transferible. agregar sección "5E aplicado al simulador". |
| `docs/LESSONS_v1.md` | `reposition` | inventario de principios → `principles_library`. mapear cada lección a 1-3 practice beats. |
| `docs/SCHEMA_v1.md` | `reposition` | documentar schema viejo como principles_library + agregar schema simulador |
| `docs/OUTLINE_2026.md` | `archive` | legacy (ya señalado en INDEX como "ya no es fuente de verdad") |
| `docs/WISHLIST.md` | `retain` | mantener como single source of truth de scope |
| `docs/IDENTIDAD_VISUAL.md` | `retain` | mascota/paleta sirven igual |
| `docs/EMAIL_*` | `retain` | infra transaccional |
| `docs/GAMIFICATION_AUDIT.md` | `archive` | auditoría de gamification viral |
| `docs/STRIPE_E2E_TEST.md` | `retain` | infra billing |
| `docs/memory/`, `docs/research/`, `docs/handoff/`, `docs/growth/` | `retain` | activo crítico post-pivot, nunca borrar |
| `docs/simulador/` | `core` | toda la carpeta es el nuevo producto |
| `docs/marketing/POSICIONAMIENTO.md` | `reposition` | refactor: simulador, no "curso de IA" |
| `docs/marketing/landing-empresa-copy.md`, `tiktok-scripts-v1.md` | `reposition` | reescritura de copy |

### notion / external

| asset | categoría | razón |
|---|---|---|
| database "Departamentos" + páginas de dominio | `retain` | mantener; crear páginas faltantes (Fundraising, Desarrollo, Orquestador, Ventas) |
| "To-Do's" / "Pending" con Itera Syllabus (dic 2025) | `archive` | legacy del syllabus pre-simulador |
| obsidian vault `Itera/` (recién construido) | `core` | espejo del repo + Notion |
| obsidian `99 — Legacy/Syllabus`, `Website` | `archive` | preservados pero no editables |

---

## prohibiciones explícitas en v0 (`forbidden`)

reintroducir cualquiera de éstas en simulador v0 = contaminación de tesis. requiere razón nueva post-validación para regresar:

- catálogo de cursos como navegación principal
- copy con "curso", "lección", "alumno", "clase" en superficies públicas (interno legacy ok)
- pricing "$19/mes individual" como flagship
- email engagement / lifecycle / drip
- gamification viral (rachas como motor, leaderboards, hearts, vidas)
- bot de lecciones diarias
- onboarding tipo "qué quieres aprender hoy"
- dashboard alumno como superficie principal
- generación automática de "tu curso personalizado"

---

## reglas de operación

1. **archivado se mueve a `app/legacy/` o subcarpeta `_archive/`**, no se borra del git. routes deshabilitadas vía flag de config o redirect a 404.
2. **una vez archivado**, no se desarchiva sin (a) owner asignado, (b) razón documentada nueva, (c) revisión del orquestador. el filtro único aplica.
3. **al introducir asset nuevo**, clasificar en la tabla antes de mergear. si no entra en `core` o `retain` o `reposition`, no entra.
4. **memoria + research nunca se tocan**. son contexto crítico, no producto.
5. **legacy_freeze_plan.md** se actualiza cuando algo cambia de categoría. cada cambio es un commit.

---

## la pregunta que reemplaza al filtro único, en una frase

> **¿esto sirve para detectar una brecha, prescribir práctica o demostrar mejora?**
> si no → archive o forbidden.

---

## next steps (post-aprobación)

1. crear `app/simulator/` route + landing page del simulador v0
2. crear `app/legacy/_archive/` y mover ahí lo de `archive` (en orden: routes primero, después components/landing)
3. correr field test v0 (`docs/simulador/field_test_v0/`) con cases canónicos
4. evaluar decision matrix
5. si pasa → migración 017 (schema simulador) + endpoints `api/simulator/*` + `app/manager/` (B2B)
6. si no pasa → revisar tesis antes de continuar build

cuándo se revisa este documento: post-field-test + post-decision-matrix. cada vez que un asset cambia de categoría, commit nuevo.

---

## relacionados

- [tesis core — simulador](../memory/decision_tesis_concentracion_plataforma.md)
- [arquitectura v0 del Simulador](../memory/decision_simulador_arquitectura_v0.md)
- [field test v0](./field_test_v0/README.md)
- [sprint marketing_30d completo](../memory/decision_simulador_sprint_marketing_completo_v1.md)
