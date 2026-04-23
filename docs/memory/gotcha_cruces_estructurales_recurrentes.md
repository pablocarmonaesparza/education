---
type: gotcha
title: cruces estructurales que reaparecen entre conversaciones itera
date: 2026-04-22
tags: [arquitectura, cruces, deuda, coordinacion, orquestacion]
---

Durante la orquestación del 2026-04-22 aparecieron cruces estructurales que van a reaparecer cada vez que se hagan rondas de coordinación entre las 12 conversaciones (ver `metodologia_orquestacion_12_conversaciones.md`). Dejarlos documentados acelera la siguiente ronda.

**1. Stripe tier mismatch `personalized` vs `premium`.**
- `lib/stripe/config.ts:40` define `PAID_TIER = 'premium'`.
- `app/api/stripe-webhook/route.ts` escribe `tier: 'personalized'`.
- `personalized` en este codebase significa "modo de curso" (personalized vs full), NO billing tier.
- Fix canónico: alinear webhook a `PAID_TIER`. Dueño: Finance. Backend solo hace smoke test post-fix.

**2. UUID vs slug/numeric en progreso y retos.**
- `user_progress.lecture_id` es UUID (de tabla `lectures`).
- `generated_path.videos` usa `order` numérico / slug.
- Consecuencias: tutor cree que estás en la lección 1 siempre (`lib/tutor/context.ts` + `components/dashboard/TutorContent.tsx`); retos `isUnlocked` no matchea (`app/dashboard/page.tsx:919`).
- Fix estructural: unificar `generated_path` con UUIDs reales de `lectures`.
- Son **bugs independientes** aunque tengan el mismo patrón — se pueden arreglar por separado si la unificación total tarda.

**3. Path inconsistency Stripe.**
- `/api/stripe-webhook` (guión) vs `/api/stripe/create-checkout-session` (carpeta).
- Cosmético pero ensucia el grep. Mover uno u otro por consistencia cuando haya tiempo.

**4. Rate limiting definido en un solo lugar.**
- Múltiples rutas lo necesitan: `/api/tutor-chat`, `/api/generate-course`, rutas Stripe.
- Dueño: Backend (P1.4). Publica el pattern (upstash/ratelimit o Vercel nativo), los demás lo consumen.
- **No inventar uno por conversación** — coordinar en un módulo compartido `lib/rate-limit/` o equivalente.

**5. Analytics views compartidas (migración 003).**
- Views existentes: `section_analytics`, `lecture_funnel`, `user_current_section`, `section_dropoffs`, `lecture_embedding_status`.
- Education T1.2 las consume admin-facing (funnel interno, completion/dropoff por slide).
- Gamification P1.1 las consume user-facing (`/dashboard/progress`, heatmap, racha).
- Propuesta: `lib/analytics/` con query helpers. **Education crea el módulo base** (arranca antes; Gamification está bloqueada por migración 006). Gamification extiende con queries user-facing.

**6. Retos en estado ambiguo.**
- Gamification declaró retos deprecados: `/dashboard/retos` redirige al dashboard.
- Dashboard todavía tiene bugs flagged sobre retos (`isUnlocked`, tablas `user_exercises` / `exercise_progress` que no existen).
- Wish List #18 pregunta rebuild o eliminar.
- Bloquea: Dashboard #1 + #4, Gamification catálogo de badges (el badge "primer reto" existe solo si hay retos).
- **Decisión Pablo pendiente al 2026-04-22.**

**7. Mercado Pago — cerrado 2026-04-22.**
- Decisión Pablo: Itera solo usará Stripe. Rails Pix/OXXO/Boleto son B2C y no aplican.
- Backend ejecutó cleanup completo en migration `010_drop_mercadopago.sql`:
  - `DROP COLUMN users.mercadopago_customer_id`
  - `payments.provider CHECK` reducido a solo `'stripe'`
  - Files eliminados: `app/api/mercadopago/*`, `app/{cancel,pending,success}-mercadopago/page.tsx`
- Finance F8 (dual-rail) cancelado.
- Research R7 (dual-rail patterns) cancelado.

**8. Working tree compartido sin commitear.**
- Al 2026-04-22, Dashboard reportó archivos pendientes que no eran suyos: `components/landing/*.tsx`, `components/shared/Navbar.tsx`, `docs/memory/*`, `docs/GAMIFICATION_AUDIT.md`.
- Patrón: Pablo trabaja en paralelo con varias conversaciones que tocan el mismo working tree. Cada una ve el trabajo de las demás sin saber quién lo hizo.
- Regla: **commit por dominio, no en bloque.** Si una conversación ve archivos de otra en working tree, pregunta al dueño antes de modificar o commitear.

**9. CLAUDE.md desincronizado con `lib/design-tokens.ts`.**
- CLAUDE.md dice depth = `border-4 border-b-8 active:border-b-4 active:mt-[4px]` (4/8px).
- `lib/design-tokens.ts` real usa `border-2 border-b-4 active:border-b-2 active:mt-[2px]` (2/4px).
- CLAUDE.md es la fuente de verdad que todas las conversaciones leen en contexto. Mentira activa.
- Dueño: Components #3. Fix trivial, impacto alto.

**Por qué:** estos cruces son deuda estructural del codebase, no tareas del día. Aparecen cada vez que se hace una ronda de "¿qué pendientes tienes?" porque viven sin resolverse en el backlog de 2-3 conversaciones simultáneamente. Resolverlos reduce la carga cognitiva de cada orquestación futura.

**Cuándo aplicar:**
- Al orquestar (`metodologia_orquestacion_12_conversaciones.md`): antes de mapear cruces nuevos, chequear si lo identificado ya está en esta lista. Si sí, reusar la solución canónica y el dueño designado.
- Al detectar un cruce nuevo que reaparezca en 2+ rondas de orquestación, añadirlo aquí.
- Al resolver uno (ej. retos decidido, MP decidido, UUID unificado, tier alineado): marcar la entrada con `**cerrado YYYY-MM-DD**` y mover a sección "cerrados" al final. No borrar — el histórico es útil para entender por qué el codebase tiene las decisiones actuales.
