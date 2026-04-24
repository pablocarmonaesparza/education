# HANDOFF — itera: backend

> Documento de transferencia para que un agente nuevo (Codex u otro) continúe operando como **ITERA: BACKEND** sin pérdida de contexto.
>
> Fecha: 2026-04-23 (fin del fin de semana). Self-contained — todo lo que necesitas para arrancar el lunes está aquí o referenciado con path exacto.
>
> Si una sección queda obsoleta, edítala. Si encuentras un patrón nuevo que volverá a morder, añade a `docs/memory/`.

---

## 1. identidad y scope

**Eres ITERA: BACKEND.** Una de 12 conversaciones-agente que trabajan en paralelo sobre el mismo working tree de `~/Desktop/Projects/Itera/Development/Web`.

**Owneas:**
- Schema de DB (`supabase/migrations/*.sql`) y RLS (`migration 005_rls_policies_pre_launch.sql`).
- Auth flow (`app/auth/*`, `lib/supabase/server.ts`, `lib/supabase/client.ts`, OAuth + email/password + cookies).
- Stripe end-to-end: webhook (`app/api/stripe-webhook/`), checkout (`app/api/stripe/create-checkout-session/`), portal (`app/api/stripe/create-portal-session/`), helper (`lib/stripe/`).
- Middleware `proxy.ts` (auth + subscription gate).
- Rate limiting compartido (`lib/ratelimit/`) — lo creó otro agente, tú lo aplicas a tus rutas premium.
- Gamification engine (server-side): tabla `user_stats`, RPCs `award_lecture_xp` + `recalculate_user_stats`, trigger `on_user_progress_complete`.
- Content publishing en DB (status enum `planned/drafted/in_review/published/archived` en `sections/lectures/slides`).
- Pre-commit hook anti-orphan-imports (`scripts/check-import-orphans.mjs`).

**No tocas:**
- UI de dashboard / lesson player → **Dashboard** + **Components**.
- Copy de landing, hero, pricing → **Landing**.
- Lecciones (JSON en `content/lessons/*.json`) → **Education**.
- Ilustraciones / Recraft → **Illustrations**.
- Marketing / pricing strategy → **Pablo + Marketing agent**.
- Templates de emails (`emails/*.tsx`) → **Mailing** dueña; tú llamas `lib/email/send.ts` desde el webhook si hay un trigger backend.

Si en duda: dueño = quien lo creó originalmente (`git log -- <file>` first commit). Si fuiste tú = es tuyo.

---

## 2. snapshot del repo (2026-04-23)

### stack

- **Framework**: Next.js 16.2.4 con Turbopack.
- **Runtime**: React 19.
- **DB**: Supabase Postgres (project `mteicafdzilhxkawyvxw`, org "Beta AI" `lhxcwfagdkyzvheqbzqy`, plan **Free**).
- **Pagos**: Stripe (live + test keys).
- **Email**: AgentMail (`agentmail` npm + React Email templates).
- **Hosting**: Vercel (project `prj_b6OTP1wI7rM7FzdYvh7xe6j6YFL4`, team `team_2pi8uVFJuWYazgbCAg9p35Rz`).
- **Vector store**: pgvector con HNSW para `lecture_embeddings`.
- **Rate limit infra**: Upstash Redis (env vars `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`).

### URLs producción

- `https://itera.la` (apex, redirect 307 a www)
- `https://www.itera.la` (canonical)
- `https://education-pi-six.vercel.app` (vercel default)
- Branch alias: `education-git-main-pablo-7630s-projects.vercel.app` — **alias protegido por Vercel auth (responde 401 público)**, solo usar para tooling autenticado (`mcp__vercel__web_fetch_vercel_url` o sesión browser de Pablo). Para verificar prod desde curl, usar `https://www.itera.la`.

### git head main al cierre

```
6353114 docs(wishlist): reformular #18 (Opción 4) + audit empírico Evaluate slides + SEO audit con P0 cerrados
```

Verificar al arrancar: `git fetch origin main && git log --oneline origin/main -1`.

### working tree (caótico — esperarlo)

Al cierre del 23-abr **118 archivos** en working tree (modified/untracked) de otros agentes en paralelo. **No tocar archivos de otros agentes sin coordinación**. El pre-commit hook te protege contra commitear imports a módulos untracked, pero no contra mover archivos de otros.

Para ver qué es tuyo vs ajeno: `git log --author="$(git config user.name)" --since="X days ago" --name-only | sort -u`.

### migrations aplicadas en prod (en orden)

```
20260115003734  create_tutor_tables
20260210181512  add_education_system_select_policy_and_tutor_messages_delete
20260210210157  create_telegram_links
20260210210210  create_telegram_link_codes
20260210210221  add_telegram_fields_to_conversations
20260227193201  add_whatsapp_phone_support
20260228235131  rls_allow_anon_select_by_phone
20260303012459  add_subscription_active_to_users
20260303180019  enable_rls_public_tables
20260303180030  fix_function_search_paths
20260304224623  update_education_system_schema
20260304224929  add_concept_name_column
20260304233229  add_youtube_url_column
20260306005557  create_education_system_vectorized
20260306005834  update_education_system_vectorized
20260306012100  fix_vectorized_id_autoincrement
20260306174317  reset_education_system_vectorized_sequence
20260306190352  reset_education_system_vectorized_sequence_again
20260306192001  truncate_and_reset_education_system_vectorized
20260320174156  fix_search_videos_hybrid_use_vectorized_table
20260418063647  create_lectures_table
20260418063702  create_lecture_slides_table
20260420195702  init_content_schema
20260420201055  user_progress_and_analytics
20260420201453  split_name_into_proper_and_display
20260421012238  004_subscriptions
20260422005947  005_rls_policies_pre_launch
20260422205535  006_user_stats_and_gamification
20260422205902  007_award_xp_includes_drafted
20260422215016  008_publish_course_v1
20260423043805  welcome_email_sent_at
20260423044207  009_slide_flags
20260423045628  010_drop_mercadopago
20260423051546  011_global_engagement_view
20260423052153  012_slide_flags_admin_v2
20260423154729  009_telegram_sessions_and_scheduling
20260423155843  010_telegram_daily_send_idempotency
20260423161108  005_payments_idempotency
20260423161115  006_stripe_webhook_events
20260423202427  013_badges_catalog_and_evaluator
20260423213408  014_badge_xp_persistence
```

**Notas críticas sobre migrations**:

- **Prefijos duplicados** (`005_*`, `006_*`, `009_*`, `010_*`) por agentes paralelos creando archivos con misma numeración. Supabase los aplica con timestamp así que no hay conflicto en prod. **Cuando crees una nueva migration**, salta a `015_*` o superior.
- **Archivo `009b_telegram_lessons.sql` local NO está aplicado en prod** — su nombre rompe el patrón regex que Supabase CLI espera (`^[0-9]+_`). Si lo quieres aplicar, renombrar a `015_telegram_lessons.sql` (o número libre) o aplicar a mano via `mcp__supabase__apply_migration`.
- **`supabase migration list --linked` muestra todas las locales `000..014` como "not applied"** porque el CLI usa nombres del filesystem mientras Supabase remote usa timestamps. Es esperado, no es bug. Para saber qué está realmente aplicado en prod usar `mcp__supabase__list_migrations`.

### tablas relevantes (public schema)

- `auth.users` (Supabase managed) — referenciada por todo.
- `users` — perfil + `tier`, `stripe_customer_id`, `subscription_active`, `cancel_at_period_end`, `welcome_email_sent_at`.
- `intake_responses` — onboarding answers + `generated_path` JSONB.
- `payments` — UNIQUE `(provider, provider_payment_id)`, CHECK `provider = 'stripe'` (MP muerto).
- `stripe_webhook_events` — dedup table, PK `event_id`.
- `sections` (10 rows), `lectures` (100 rows), `slides` (1000 rows), `lecture_embeddings` (100 rows) — todos `status='published'`.
- `user_progress` — PK `(user_id, lecture_id)`, fuente de verdad de completion.
- `user_stats` — agregado por user (XP, racha, level, lessons_completed). Escrito SOLO por trigger.
- `slide_flags` + `slide_flags_admin` view — feedback loop por slide.
- `tutor_conversations`, `tutor_messages` — chat history.
- `telegram_*` — sessions + scheduling.
- `badges`, `user_badges` — catalog + earned (migrations 013/014).

### views

- `section_analytics`, `section_dropoffs`, `lecture_funnel`, `user_current_section`, `lecture_embedding_status` — todas `SECURITY INVOKER` (migration 005).
- `slide_flags_admin`, `open_flags_by_section` — admin dashboard.
- `global_engagement_view` (migration 011).

### advisors supabase

`mcp__supabase__get_advisors` esperado: 0 ERROR-level. Si aparece uno, es nuevo — investigar.

---

## 3. to-dos backend pendientes (priorizados)

### P0 — bloqueando monetización real

1. **Smoke test E2E Stripe (manual con browser)**. Runbook: `docs/STRIPE_E2E_TEST.md`. ~15 min con tarjeta `4242 4242 4242 4242`. Verificar que webhook escribe DB correctamente (users.subscription_active, tier='premium', payments row, etc.). Sin esto Pablo no tiene confianza de cobrar.
2. **Tutor reactivation**. Hoy en placeholder offline (commit `dc2f307`, mensaje "no disponible en este momento"). Pablo dijo "dame chance" — esperando su green light. Cuando arranques: revertir `dc2f307` + verificar que providers (OpenAI/Anthropic/Google) responden + meter rate limit (P1.4).
3. **HIBP (leaked password protection)**. Bloqueado por Supabase Free plan. Requiere upgrade a Pro $25/mes. Decisión Pablo. Si dice sí → activar vía Management API: `PATCH /v1/projects/{ref}/config/auth {"password_hibp_enabled":true}`.

### P1 — antes de tráfico real

4. **Tutor rate limit**. Cuando reactives `/api/tutor-chat`, meter `lib/ratelimit.ai` (5 req/1m) en el handler. Módulo ya existe (commit `6a3ed13` otro agente).
5. **Defensa en profundidad rate limit**. Aplicar `lib/ratelimit.checkout` a `/api/stripe/create-checkout-session` y `lib/ratelimit.standard` a `/api/slides/[id]/flag` y endpoints similares.

### P2 — deuda tranquila

6. **~22 errores TS preexistentes** (ejemplo, no exhaustivo — al iniciar sesión correr `npx tsc --noEmit 2>&1 | grep "error TS" | wc -l` para baseline real):
   - `app/api/dev/auto-login/route.ts` — Supabase generic.
   - `components/shared/Button.tsx`, `components/ui/Button.tsx` — polymorphic-as Anchor type mismatch.
   - `supabase/functions/telegram-bot/index.ts`, `supabase/functions/tg-daily-send/index.ts` — Deno runtime types (esperado, no afecta build).
   - `.next/types/**` duplicados eventualmente.
   Turbopack los ignora en build pero son humo. Resolver de a uno cuando tengas slot. Si tu PR aumenta el contador → es regresión tuya, fíjala antes de push.
7. **Event tracking** (PostHog según Research R15 — ver `docs/research/R15_analytics_stack.md`). Implementación pendiente: instalar `@posthog/nextjs`, wire en root layout, eventos clave (signup, lesson_start, lesson_complete, checkout_initiated, subscription_active).
8. **Level curve progresiva**. Hoy `level = floor(total_xp / 100) + 1` (lineal, en migration 006). Cuando haya métricas reales de retention podrías curvar (ej. cada nivel requiere 20 XP más que el anterior).
9. **Path inconsistency**: `/api/stripe-webhook` (guión) vs `/api/stripe/create-checkout-session` (carpeta). Cosmético, mover uno a la convención del otro.
10. **Pre-commit hook robustez**. `scripts/check-import-orphans.mjs` usa regex heurístico para detectar imports. Tiene false positives en JSDoc con ejemplos de `import X from ...` y false negatives potenciales en template literals con `/* */` que envuelven imports reales. Si los false positives molestan, migrar a `es-module-lexer` (AST real).

---

## 4. decisiones de Pablo pendientes (que destraban scope)

Lista consolidada al 23-abr (orden de impacto decreciente). Revisa `docs/memory/decision_*.md` antes de asumir que algo sigue pendiente — Pablo cierra decisiones sin avisar.

1. **HIBP $25/mes Supabase Pro** sí/no — destraba Backend P1.5.
2. **Tutor reactivation** sí/no — destraba Backend P0.2 + diferenciador del pitch.
3. **`experimento_how_it_works_visual`** Remotion / screenshots / ilustraciones — destraba Landing + Components.
4. **Illustrations**: piel realista LATAM diversa + ropa plana monocolor sí/no.
5. **Landing**: CTA "cómo funciona →", tier gratis canibalización, textarea hero, badge popular.
6. **WhatsApp/Telegram demo**: tamaño mensajes, quiz nativo, inline vs reply keyboards.
7. **Wish List**: 5 aclaraciones abiertas (#12, items desaparecidos, #18 retos cerrado opción 4 — verificar status, #13 UX, "retomar dashboard").

### ya cerradas (no las relistes como pendientes)

- **Mailing scope transaccional-only**: ✓ Pablo confirmó. Ver `docs/memory/decision_mailing_scope_transaccional_only.md` y `docs/memory/decision_mailing_transaccional_only.md`.
- **Mercado Pago**: ✓ eliminado (commit `ff504f5` + migration 010). Ver `docs/memory/gotcha_cruces_estructurales_recurrentes.md §7`.
- **Retos feature**: ✓ eliminado en commit `d146ed7`. Wish List #18 cerró opción 4.
- **Research order**: ✓ R4 + R15 ya cerrados. R1, R6, R3, R2 progresando — no bloquean Backend a corto plazo.

Si Pablo te las da por chunks, escríbelas a `docs/memory/decision_*.md` con fecha. Las que son backend-related ejecútalas tú directo (no le pidas que entre al dashboard de Supabase).

---

## 5. patrón estructural crítico — imports huérfanos cross-agente

**Esto rompió Vercel 4 veces en 72h** (incidentes documentados en commits `ca70a94`, `c6e70aa`, `475a379`).

### qué es

12 agentes paralelos comparten el working tree. Cada uno ve archivos de los demás como untracked. Si commiteas un archivo que tiene `import X from '@/lib/foo/bar'` pero `lib/foo/bar.ts` está untracked en el working tree (no en git index), Vercel clone solo ve lo committeado → `Module not found: Can't resolve '@/lib/foo/bar'` → build ERROR.

**Por qué tu typecheck local NO lo detecta**: `tsc --noEmit` lee del filesystem (donde sí existe el archivo untracked). Vercel solo ve git index.

### mitigación activa

`.husky/pre-commit` corre `node scripts/check-import-orphans.mjs` antes de cada commit. Verifica que cada import en archivos staged apunte a un archivo en git index (committeado o también staged).

Hook activo desde commit `4ea8fc7` (22-abr).

### qué hacer

- **NUNCA uses `git commit --no-verify`** para bypassear esto. Si el hook te bloquea, significa que metiste un import a algo untracked.
- Cuando el hook reporta huérfano: opciones:
  - **(a)** El módulo es tuyo → `git add` el archivo y reintenta.
  - **(b)** El módulo es de otro agente → coordina (avisa al owner que commitee primero, o tú lo absorbes en tu commit con nota en el body explicando "absorbed from {agent}'s working tree").
  - **(c)** El import es accidental (regresión, refactor mal) → quítalo.
- Cuando hagas `git add` masivo: revisa `git diff --cached --name-only` antes de commit y verifica que ningún staged file importa algo no incluido.

### casos típicos donde te puede morder

- Stage `app/paywall/page.tsx` modificado por Finance → importa `@/lib/onboarding/persistIntake` de Onboarding untracked.
- Stage `app/api/stripe-webhook/route.ts` reescrito → importa `@/lib/email/send` de Mailing untracked.
- Stage `components/experiment/ExperimentLesson.tsx` modificado por Dashboard → importa `./SlideFlagButton` de Education untracked.

Doc completo: `docs/memory/gotcha_cruces_estructurales_recurrentes.md §8`.

---

## 6. convenciones de Pablo

Lectura obligatoria al inicio de sesión: `docs/memory/INDEX.md` + sus archivos. Resumen de las críticas:

- **Minúsculas en UI/copy**, excepto nombres propios. Heredado del contrato pedagógico.
- **Moneda siempre USD**. Nada de MXN, ARS, COP — Itera vende en USD.
- **"Espera todo lo que me pides puedes hacerlo tu directamente"** (Pablo, literal). Si tienes MCP/CLI/API para ejecutar algo (Supabase, Vercel, GitHub, Stripe), hazlo. NO pidas a Pablo que entre al dashboard. Excepción: acciones que requieren billing approval (Pro plan, cobrar tarjeta, etc.).
- **Stripe es el único procesador**. MercadoPago muerto en commit `ff504f5` + migration 010. Si ves `mercadopago` en código nuevo, es bug — eliminar.
- **Itera es B2B empresa-first** (no B2C latam). Descarta mecánicas virales (hearts limitadas, ligas, leaderboards, viral referrals). Ver `docs/memory/decision_gamification_duolingo_b2b.md` y `docs/memory/gotcha_posicionamiento_empresa_vs_latam.md`.
- **Lecciones**: contrato pedagógico estricto en `docs/METODOLOGIA.md`. Tú no creas/editas lecciones (es Education). Si tocas DB de slides, respeta el shape JSONB.

### docs canónicos (fuente de verdad)

- `CLAUDE.md` — design system, depth tokens, paleta, tipografía, prohibiciones.
- `docs/CONTEXT.md` — qué es Itera, audiencia, modelo, pricing, roadmap.
- `docs/METODOLOGIA.md` — contrato pedagógico de lecciones.
- `docs/LESSONS_v1.md` — outline de las 100 lecciones.
- `docs/SCHEMA_v1.md` — schema reference. **Heads up**: dice 22 secciones, son 10 — Research R4 lo va a sincronizar.

### memoria cross-sesión

- `docs/memory/` — markdown files con decisiones, gotchas, copy, experimentos.
- `docs/memory/INDEX.md` — índice agrupado por tipo.
- Skills: `/itera-memory-load` al inicio de sesión, `/itera-memory-save` al cierre con cambios significativos.

---

## 7. gotchas técnicos backend

### Supabase CLI / Management API

Tu PAT vive en macOS Keychain (auto-guardado por `supabase login`). Para usarlo programáticamente sin volver a pedirle a Pablo:

```bash
TOKEN=$(security find-generic-password -s "Supabase CLI" -a "supabase" -w | sed 's/^go-keyring-base64://' | base64 -d)
curl -H "Authorization: Bearer $TOKEN" https://api.supabase.com/v1/projects/mteicafdzilhxkawyvxw/config/auth
```

Doc: `docs/memory/gotcha_supabase_pat_desde_keychain.md`.

### Supabase OAuth allow_list

Cuando OAuth (Google/etc) cae en URL equivocada con `?code=...`, el problema casi siempre es que `redirectTo` no matchea el allow_list. Supabase falla silencioso a `site_url`.

Config canónica (project actual):

```
site_url = "https://itera.la"
uri_allow_list = "http://127.0.0.1:3000/**,http://localhost:3000/**,https://itera.la/**,https://*.itera.la/**,https://*.vercel.app/**"
```

**Los `/**` son obligatorios**. Doc: `docs/memory/gotcha_supabase_oauth_allow_list.md`.

### Stripe — tier source of truth

- `lib/stripe/config.ts` define `PAID_TIER = 'premium'` y `FREE_TIER = 'basic'`.
- Webhook escribe `users.tier = active ? PAID_TIER : FREE_TIER` (commit `89b9f6c`).
- **No uses `tier` para gates**. Es enum y puede tener mismatch transitorio. **Usa `subscription_active` (bool)** — fuente de verdad escrita por webhook + `syncFromSession`.
- Si encuentras código nuevo que escribe `tier='personalized'`, es regresión — alinear a `PAID_TIER`.

### Stripe — idempotencia doble

Webhook (`app/api/stripe-webhook/route.ts`) usa dos capas:
1. `markEventProcessed()` al entrar — INSERT a `stripe_webhook_events` (PK event_id). UNIQUE_VIOLATION → ya procesado, exit 200 sin re-ejecutar.
2. `payments` upserts con `onConflict: 'provider,provider_payment_id'` — para reintentos del mismo invoice.

Si el handler lanza, el catch intenta DELETE del event_id para permitir retry de Stripe. Si el DELETE también falla → `console.error('[CRITICAL] ...')` — visibilidad para triage manual (no hay recuperación auto).

### Stripe — SDK 2025-11-17 (clover) workarounds

La SDK movió campos en invoices:
- `invoice.lines.data[0].price.id` → `invoice.lines.data[0].pricing.price_details.price`.
- `invoice.subscription` → `invoice.parent.subscription_details.subscription`.

Helpers `priceIdFromInvoice()` y `subscriptionIdFromInvoice()` en webhook.ts ya manejan ambas. Si SDK actualiza otra vez, ajustar ahí.

### gamification trigger

`on_user_progress_complete` trigger (migration 006/007) corre AFTER INSERT/UPDATE de `is_completed` en `user_progress`. Llama:
- `award_lecture_xp(user_id, lecture_id)` — suma `slides.xp` filtrado por `is_scoreable=true AND status != 'archived'`. **NO filtra por `published`** (migration 007) — alineado con `fetchLectureSlides` del frontend.
- `recalculate_user_stats(user_id)` — agrega `user_progress`, calcula streak con `row_number() over (order by date)`, upsertea `user_stats`.

Si añades un nuevo evento de gamification (ej. badges al subir nivel), extiende `handle_user_progress_complete()`. Mantén el trigger atómico.

### React — "Maximum update depth exceeded"

Patrón: cuando aparece en múltiples componentes a la vez (XpBar, useTutorChat, dashboard), **hay un solo loop infinito real**; los demás errores son colaterales porque React reporta cada setState durante el render ciclo.

Buscar `useEffect` con dependencias que sean objetos/arrays creados inline en el render (sin `useMemo`). Fix: memoizar la dep.

Doc: `docs/memory/gotcha_max_update_depth_react_un_root_cause.md`.

### Edge Functions Deno (telegram-bot)

`supabase/functions/telegram-bot/index.ts` corre en Deno runtime, no Node. Importa `npm:@supabase/supabase-js@2`. TypeScript local reporta error porque no entiende `npm:` prefix ni `Deno` global. **Es esperado** — esos errores son preexistentes y no afectan build.

---

## 8. mapa de coordinación (12 agentes)

Doc maestro: `docs/memory/metodologia_orquestacion_12_conversaciones.md`. Resumen al 23-abr:

| Agente | Owna | Status | Bloqueo con backend |
|---|---|---|---|
| **Components** | `lib/design-tokens.ts`, `components/ui/*` (primitives) | activo | sync `CLAUDE.md` con tokens reales |
| **Dashboard** | `app/dashboard/*`, lesson player UI | activo | persistencia escrita en su flow + admin (`lib/auth/`, `lib/supabase/admin.ts` en working tree pendiente commit) |
| **Education** | `content/lessons/*.json`, `slide_flags`, T1.1 | activo | views analytics ya pobladas |
| **Finance** | Stripe code | sprint cerrado en `89b9f6c` | tier mismatch resuelto, smoke test E2E pendiente |
| **Gamification** | UI gamification, badges UI | activo (badges P2) | trigger + RPC backend ya listos |
| **Illustrations** | Recraft + preset itera-flat-v1 | activo | ninguno (no DB) |
| **Landing** | `components/landing/*`, hero | activo | ninguno |
| **Mailing** | `lib/email/`, `emails/*.tsx` | sprint cerrado en `89b9f6c` | DKIM/SPF/DMARC pendiente Pablo decide ESP |
| **Onboarding** | `lib/onboarding/persistIntake.ts`, `app/projectDescription/`, `app/projectContext/`, admin dashboard | activo | sus archivos siguen modified en working tree, esperando su commit |
| **Research** | `docs/research/*` | activo | bloquea backend P2.7 (event tracking) |
| **WhatsApp/Telegram** | `supabase/functions/telegram-bot/`, scheduling | activo | telegram_sessions y daily_send migrations 009/010 (timestamps) ya aplicadas |
| **Wish List** | `docs/WISHLIST.md`, priorización | activo | retos #18 cerrado opción 4 (commit 6353114) |

**Cómo trabajar con ellos**:
- Si tu commit toca un archivo que también tienen modified, lee su diff antes de stage. Si conflicta, coordina: `git stash` el tuyo, ellos commitean primero, rebase y push.
- Si necesitas un módulo de otro agente para que tu código funcione, **espera a que ellos commiteen** o absorbe su archivo en tu commit con nota explícita en el body.
- Cuando absorbas trabajo ajeno, el commit body debe decir: "Absorbed from {agent}'s working tree because dependency required for {feature}." → respeta autoría, evita duplicación.

---

## 9. comandos clave para arrancar la sesión

Pega esto al iniciar como backend:

```bash
# Estado del repo
cd ~/Desktop/Projects/Itera/Development/Web
git fetch origin main
git log --oneline origin/main -10                          # commits recientes
git status -s | head -30                                   # working tree (esperar caos)
git status -s | wc -l                                      # contador (típico: 50-150)

# Mis cambios potenciales en working tree
git diff --name-only HEAD                                  # archivos modificados que no commiteé yo

# Migrations en prod vs locales
ls supabase/migrations/                                    # locales
# Y ejecutar mcp__supabase__list_migrations para comparar con prod

# Vercel deploy actual
# Ejecutar mcp__vercel__get_deployment con idOrUrl="education-git-main-pablo-7630s-projects.vercel.app"

# Typecheck — primero baseline numérico, luego inspección
npx tsc --noEmit 2>&1 | grep "error TS" | wc -l                # baseline (~22 al cierre 23-abr)
npx tsc --noEmit 2>&1 | grep "error TS" | head -20             # primeros errores

# Si vas a hacer un commit grande, manual check antes:
node scripts/check-import-orphans.mjs                      # exit 0 = todo bien
```

### MCPs típicos

- `mcp__supabase__execute_sql` — queries directos a prod.
- `mcp__supabase__apply_migration` — aplicar migration nuevas (preferir sobre execute_sql para DDL).
- `mcp__supabase__list_migrations`, `mcp__supabase__list_tables`, `mcp__supabase__get_advisors`.
- `mcp__vercel__list_deployments`, `mcp__vercel__get_deployment`, `mcp__vercel__get_deployment_build_logs`, `mcp__vercel__get_runtime_logs`.

### Codex review

Tú eres Codex (en este handoff). Pero igual: el patrón Ralph Wiggum dice "Codex review is NOT optional" sobre cualquier código que vayas a push. Como sucesor, tu protocolo es:

- Self-review riguroso antes de commit (revisión adversarial mental).
- Si dudas, lanzar una segunda instancia de Codex CLI (`codex exec "Review {desc}. PASS o FAIL"`) o un Agent con `model: haiku` para review independiente.
- NUNCA commitees algo que no pase tu propia review más estricta.

PATH para Codex CLI:
```bash
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/Users/pablocarmona/.npm-global/bin:$PATH"
```

---

## 10. resumen del fin de semana (qué se shippeó)

### gamification engine real

- Migration 006: tabla `user_stats`, RPCs `award_lecture_xp` + `recalculate_user_stats`, trigger.
- Migration 007: filter del trigger ajustado a `status != 'archived'` (defense en profundidad).
- Smoke test confirmó: 95 XP otorgados por lección de ejemplo.
- UI: `lib/gamification.ts`, `StatsPills.tsx`, progress page, perfil con stats, level-up modal.
- Migration 013/014: badges catalog + evaluator + xp persistence (otro agente).

### stripe end-to-end

- Webhook re-escrito con idempotencia doble (event_id + provider_payment_id).
- 7 eventos manejados.
- Customer portal endpoint.
- `syncFromSession` cierra race con webhook en `/success`.
- Workarounds SDK clover.
- Tier mismatch resuelto (PAID_TIER='premium' coherente).

### mailing transaccional

- AgentMail singleton + dispatcher.
- 7 templates React Email (welcome, password reset, first lesson, payment receipt, failed charge, auth action, _shared).
- Webhooks dispara `sendPaymentReceipt` + `sendFailedCharge`.

### subscription gate

- `proxy.ts` middleware: auth layer + premium layer (`/api/generate-course` only).
- Defense en profundidad en handler `app/api/generate-course/route.ts`.
- 402 JSON para rutas API, redirect a /paywall para pages.

### content publicación

- Migration 008: 10 sections + 100 lectures + 1000 slides → `published`.
- Filter del trigger gamification reverted a `!= archived` (defense en profundidad equivalente con todo published).

### cleanups

- Retos eliminados (commit `d146ed7`, -1818 líneas).
- MercadoPago muerto (commit `ff504f5` + migration 010).
- Pre-commit hook anti-orphan-imports activo (commit `4ea8fc7` otro agente).

### rescates de vercel

- `ca70a94` ConfettiEffect huérfano.
- `c6e70aa` SlideFlagButton huérfano.
- `475a379` persistIntake huérfano (este lo metí yo absorbiendo trabajo de Onboarding).

### memoria persistente añadida

`docs/memory/` ganó entradas sobre:
- gamification B2B decision (sin hearts mecánicos).
- posicionamiento empresa-first.
- patrones cross-agente recurrentes.
- decision: mailing scope transaccional-only (Pablo confirmó).

---

## 11. checklist primer commit como backend nuevo

Antes de tu primer commit:

1. [ ] Leer este doc completo.
2. [ ] `git fetch origin main && git log --oneline -10` — ver lo nuevo.
3. [ ] `git status -s | head -30` — ver el caos.
4. [ ] `mcp__supabase__list_migrations` — confirmar migrations en prod.
5. [ ] `mcp__vercel__get_deployment` con alias prod — confirmar último deploy READY.
6. [ ] `npx tsc --noEmit | head` — ver errores preexistentes (no debería haber nuevos).
7. [ ] Cargar memoria: invocar `/itera-memory-load` para traer contexto cross-sesión.
8. [ ] Identificar tu primera tarea (P0 de §3 o lo que Pablo te pida).
9. [ ] Antes de stage: `git diff <archivo>` para ver tu cambio aislado.
10. [ ] Antes de commit: `node scripts/check-import-orphans.mjs` (manual sanity).
11. [ ] Commit con body descriptivo (qué, por qué, side effects, verificación).
12. [ ] Push: `git push origin main`.
13. [ ] Verificar Vercel deploy READY: `mcp__vercel__list_deployments` recientes.
14. [ ] Si algo se rompió en deploy, leer build logs y arreglar — el patrón #5 vuelve.
15. [ ] Al cerrar sesión significativa: `/itera-memory-save` con cambios destacables.

---

## 12. contacto y escalación

- **Pablo (founder)**: pablocarmonaesparza@gmail.com / pablo@b-ta.ai. Spanish, lowercase, prefiere acción directa sobre preguntas.
- **GitHub repo**: github.com/pablocarmonaesparza/education (privado pero accesible vía MCP).
- **Vercel dashboard**: vercel.com/pablo-7630s-projects/education.
- **Supabase dashboard**: supabase.com/dashboard/project/mteicafdzilhxkawyvxw.

Si algo se cae en producción (Vercel ERROR, advisors nuevos, payments rotos):
1. **Diagnóstico rápido** — read logs primero, no asumir.
2. **Rollback si es destructivo** — Vercel tiene rollback button, Supabase migrations son tipicamente forward-only pero puedes escribir revert migration.
3. **Notificar a Pablo** con resumen: qué pasó, qué hiciste, qué falta.

---

## 13. valores y principios

Heredados de mi sesión:

- **Verdad sobre comodidad**: si Pablo asume algo y está mal, dilo claramente.
- **Datos sobre opinión**: antes de afirmar X, ejecuta el query/comando que lo confirma.
- **Acción sobre delegación**: si tienes el tool, ejecuta. Pablo no quiere que le pidas pasos manuales.
- **Atomicidad sobre velocidad**: commits pequeños y reversibles ganan a sprints grandes con todo.
- **Coordinación sobre solo**: 12 agentes paralelos = comunicar lo que tocas. Memoria cross-sesión es el canal.
- **Pragma sobre pureza**: si una migration legacy queda con prefijo duplicado pero funciona, no la renombres por estética.

---

Buena suerte el lunes.

**Primer paso recomendado del lunes**: smoke test E2E Stripe siguiendo `docs/STRIPE_E2E_TEST.md` (~15 min con browser y tarjeta `4242 4242 4242 4242`). Sin esto Pablo no tiene confianza de que el flujo de cobro funciona end-to-end. Es el menor esfuerzo / mayor unblock del backlog.

**Después del smoke test**:
1. Esperar green light de Pablo para tutor reactivation.
2. Limpiar working tree pendiente cuando otros agentes commiteen lo suyo (rate limit en `/api/tutor-chat` cuando exista).
3. PostHog event tracking (R15 ya cerrado) — instalación + primeros eventos.

— el agente backend que cierra el 23-abr.
