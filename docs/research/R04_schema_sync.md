# R4 — sync de SCHEMA con la realidad post-pivote

> Estado del schema de contenido al 2026-04-22. Sincroniza la documentación con las **20 migrations aplicadas** y con [`LESSONS_v1.md`](../LESSONS_v1.md) **v2** (post-intro-drop).
>
> **Reemplaza** la versión previa de [`SCHEMA_v1.md`](../SCHEMA_v1.md) que aún hablaba de "22 secciones / 665 lecciones".

---

## 1. Realidad del repo — 20 migrations aplicadas

Listadas en orden filename (algunas comparten prefijo numérico — la `migration_history` real las aplica por timestamp/orden):

| Migration | Qué hace | Tablas/objetos afectados |
|---|---|---|
| `000_nuke_legacy.sql` | Drop CASCADE de 8 tablas viejas | lectures viejo, lecture_slides, education_system, education_system_vectorized, user_exercises, exercise_progress, checkpoint_submissions, video_progress |
| `001_init_content_schema.sql` | Schema central + función `set_updated_at` | `sections`, `lectures`, `slides` |
| `002_seed_sections.sql` | Seed 10 secciones (distribución v1: 2/12/10/10/12/12/14/10/8/10) | `sections` |
| `003_lecture_embeddings.sql` | Vector embeddings + helper view | `lecture_embeddings` (vector(1536) — OpenAI `text-embedding-3-small`), HNSW index, view `lecture_embedding_status` |
| `003_user_progress_and_analytics.sql` | Progreso + 4 views | `user_progress`, views `section_analytics` / `lecture_funnel` / `user_current_section` / `section_dropoffs` |
| `004_cleanup_and_fks.sql` | Drop legacy chat tables | `education_chats`, `n8n_chat_histories`, `n8n_chat_history` |
| `004_subscriptions.sql` | Columnas Stripe en `users` | `users.stripe_subscription_id`, `subscription_status`, `subscription_plan`, `current_period_end` |
| `005_payments_idempotency.sql` | UNIQUE en `payments` + cancel flag | `payments` UNIQUE(provider, provider_payment_id), `users.cancel_at_period_end` |
| `005_rls_policies_pre_launch.sql` | RLS en content + user_progress + security_invoker en views | `sections`, `lectures`, `slides`, `lecture_embeddings`, `user_progress` + 5 views |
| `006_stripe_webhook_events.sql` | Dedup-table para idempotencia de webhooks Stripe | `stripe_webhook_events` (PK `event_id`) |
| `006_user_stats_and_gamification.sql` | XP, racha, nivel + RPC + trigger | `user_stats`, fns `award_lecture_xp` / `recalculate_user_stats` / `handle_user_progress_complete`, trigger `on_user_progress_complete` |
| `006_welcome_email_sent_at.sql` | Idempotencia welcome email | `users.welcome_email_sent_at` |
| `007_award_xp_includes_drafted.sql` | Fix XP: contar `status != 'archived'` (no solo published) | redefinición `award_lecture_xp` |
| `008_publish_course_v1.sql` | UPDATE `status='published'` en sections/lectures/slides | filas masivas |
| `009_slide_flags.sql` | Tabla feedback por slide + RLS + view admin | `slide_flags`, view `slide_flags_admin` |
| `009b_telegram_lessons.sql` | Telegram bot infra (pg_net + pg_cron + sessions + RPC) | `telegram_sessions`, fn `get_next_lesson_for_user()`, extensions `pg_net`/`pg_cron` |
| `010_drop_mercadopago.sql` | Drop MP rails | `users.mercadopago_customer_id` (drop), `payments.provider` check ahora solo `'stripe'` |
| `010_telegram_daily_send_idempotency.sql` | Idempotencia daily-send + revoke RPC pub | `telegram_daily_sends` (PK `user_id,send_date`), revoke RPC a anon/auth |
| `011_global_engagement_view.sql` | KPI tile feed | view `global_engagement` |
| `012_slide_flags_admin_v2.sql` | Fix admin view + nueva agregación SQL-side | `slide_flags_admin` con `open_reasons`, view `open_flags_by_section` |

**Tablas preservadas en el nuke 000** (no son contenido del curso): `users`, `payments`, `intake_responses`, `tutor_conversations`, `tutor_messages`, `telegram_link_codes`, `telegram_links`.

---

## 2. Estado del catálogo — qué hay en DB hoy

Confirmado post-008:

- **Sections:** 10 filas, todas `status='published'`.
- **Lectures:** 100 filas, todas `status='published'`, con metadata pedagógica completa (`learning_objective`, `bloom_verb`, `cognitive_route`, `concept_name`, `narrative_arc`, `scenario_character`).
- **Slides:** 1000 filas (10 por lección), todas `status='published'`.
- **Lecture embeddings:** depende de qué tantas lecciones se hayan embebido — query: `select status, count(*) from lecture_embedding_status group by status`.
- **User progress + stats:** vivos, alimentados por trigger 006.
- **Slide flags:** estructura lista, depende de UI para llenarse.

---

## 3. Inconsistencia conocida — distribución de secciones

[`LESSONS_v1.md`](../LESSONS_v1.md) está en **v2 (post-intro-drop)** y usa esta distribución:

| # | Sección v2 | Lecciones |
|---|---|---|
| 1 | Fundamentos | 12 |
| 2 | Asistentes | 10 |
| 3 | Contenido | 10 |
| 4 | Automatización | 12 |
| 5 | Bases de datos | 12 |
| 6 | API | 7 |
| 7 | MCP y Skills | 8 |
| 8 | Agentes | 10 |
| 9 | Vibe coding | 9 |
| 10 | Implementación | 10 |
| | **Total** | **100** |

Pero el seed `002_seed_sections.sql` cargó la distribución **v1**:

| # | Sección v1 (en DB) | est_lectures (v1) |
|---|---|---|
| 1 | introducción | 2 |
| 2 | fundamentos | 12 |
| 3 | asistentes | 10 |
| 4 | contenido | 10 |
| 5 | automatización | 12 |
| 6 | bases de datos | 12 |
| 7 | APIs, MCPs y skills | 14 |
| 8 | agentes | 10 |
| 9 | vibe coding | 8 |
| 10 | implementación | 10 |

**Cambios estructurales v1 → v2 que NO están en DB:**

- v1 tenía sección "Introducción" (eliminada en v2).
- v1 tenía sección 7 unificada "APIs, MCPs y skills"; v2 la dividió en sección 6 "API" (7 lecciones) y sección 7 "MCP y Skills" (8 lecciones).
- v2 reemplazó intro por +2 lecciones nuevas (Sec 2 L8 *Prompts adaptados por asistente*, Sec 9 L7 *Revisar código generado antes de aceptar*).

**Pero** las 100 lecciones reales en DB (post-008) sí están alineadas con v2 — fueron cargadas en commits posteriores al seed inicial. El seed solo controla las **filas de `sections`**; las lecciones se cargan con upload-slides scripts.

**Acción concreta:** decidir si:
1. **Opción A** (recomendada): escribir migration `013_resync_sections_v2.sql` (el slot `012` ya lo ocupa `012_slide_flags_admin_v2.sql`) que rename, dropea/inserta secciones para alinear con v2. Riesgo: requiere actualizar `lectures.section_id` también si los IDs cambian.
2. **Opción B**: dejar las filas viejas en DB (con names viejos) y actualizar solo `est_lectures`. Riesgo: el `name` mostrado en UI no coincide con el outline real.
3. **Opción C**: documentar la inconsistencia y vivir con ella hasta el próximo refactor mayor.

**Mi voto: A.** Pero requiere coordinación con cualquier código que asuma `sections.id = 1` significa "introducción".

---

## 4. Diferencias importantes vs SCHEMA_v1.md original

1. **22 secciones → 10 secciones.** Pivote completo (commit `a1f91a9`).
2. **665 lecciones estimadas → 100 reales en producción.**
3. **NO hay tipos `enum` PostgreSQL.** Las columnas `status`, `bloom_verb`, `cognitive_route`, `source`, `kind`, `phase` son `text` con `CHECK` constraints (no `CREATE TYPE ... AS ENUM`). Esta diferencia importa para queries que asuman comparaciones tipo enum, para introspection con pg, y para futuras migrations.
4. **Pedagogy obligatoria.** `sections.pedagogy` es `not null`.
5. **Status enum 5 valores** (text+CHECK): `planned`, `drafted`, `in_review`, `published`, `archived`.
6. **`prereq_ids` es `not null default '{}'`** (no nullable como decía el doc viejo).
7. **`lectures` y `slides` ya creadas** con campos pedagógicos nullable hasta `published`. Doc original solo describía `sections`.
8. **`lecture_embeddings` YA existe** con `vector(1536)` para OpenAI `text-embedding-3-small`. **NO es tabla pendiente.** Ver R6 para la decisión sobre ese stack.
9. **`slide_flags` YA existe** (migration 009). **NO es tabla pendiente.**
10. **`user_stats` y RPCs de XP/racha YA existen** (migration 006).
11. **Mercado Pago infrastructure ELIMINADA** (migration 010). Itera es B2B empresa-first; Stripe es el único procesador.
12. **RLS habilitado** en todas las tablas user-facing. Service role bypassa para uploads.

---

## 5. Tablas siguientes pendientes — enumeradas, no diseñadas

Lo que sí queda por construir, sin diseño detallado:

| Tabla | Para qué | Cuándo |
|---|---|---|
| `concepts` | Catalogar las ~50-80 ideas nombrables del curso, normalizar `lectures.concept_name`, habilitar spaced retrieval cross-lección | Cuando ≥30 lecciones tengan tracking real de qué conceptos repiten y se vea la duplicación |
| `badges` + `user_badges` | Catálogo de badges + asignaciones; trigger evaluator dentro del trigger `handle_user_progress_complete` | Gamification team M0-M3 (ver Gamification P2.4-P2.7) |
| `b2b_organizations` + `b2b_seats` | Estructura para cuentas empresariales (admin owner + N seats) | Pre-Phase 2 distribución (R2), M3-M6 |

---

## 6. Acciones concretas sugeridas

1. **Renombrar el SCHEMA_v1.md viejo a `SCHEMA_v1_legacy.md`** y dejar este como nueva fuente de verdad.
2. **Resolver §3** (sync de seed con v2 — voto Opción A con migration 013 — el slot 012 ya está ocupado).
3. **Documentar en CLAUDE.md** que el stack de embeddings es OpenAI `text-embedding-3-small` (no Cohere), porque ya está decidido en código.
4. **Actualizar [`docs/CONTEXT.md`](../CONTEXT.md) §5** que menciona "OpenAI embeddings + Cohere rerank" — confirmar que rerank con Cohere se mantiene como add-on, o eliminar la referencia.
5. **Education T1.1 puede usar `slide_flags`** ya. La tabla y view admin existen.

---

## 7. Fuentes (verificables localmente)

- `supabase/migrations/000_nuke_legacy.sql` ... `012_slide_flags_admin_v2.sql` (20 archivos en total)
- [`docs/LESSONS_v1.md`](../LESSONS_v1.md) v2
- [`docs/METODOLOGIA.md`](../METODOLOGIA.md) v0.11 (regla 14 — autocontención)
- [`docs/CONTEXT.md`](../CONTEXT.md)
- Commit `a1f91a9` (2026-04-20) — pivote completo a 10×100

---

**Versión 3** — sync corregido tras review (20 migrations listadas, slot 013 como próximo libre para resync de secciones). Próxima iteración cuando se aplique migration 013 (sync v2) o cuando se diseñen `concepts` / `b2b_organizations`.
