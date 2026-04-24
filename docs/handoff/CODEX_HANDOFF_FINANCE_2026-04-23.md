# Handoff: ITERA: FINANCE → Codex

**Fecha:** 2026-04-23
**Autor saliente:** ITERA: FINANCE (Claude Sonnet, multi-sesión)
**Receptor:** Codex (cualquier modelo, sin contexto previo)
**Status overall:** Production-ready pendiente 2 acciones humanas en Stripe Dashboard. E2E ya verificado.

> **Cómo leer este doc**
> Lee de arriba hacia abajo. Cada sección asume que leíste las anteriores. La sección 14 (QUICK-START) te dice qué hacer en orden si solo tienes 5 minutos. Si tienes dudas, revisa la sección 7 (DON'TS) antes de tocar cualquier archivo cross-domain.

---

## 1. CONTEXTO Y SCOPE

### 1.1. Qué es Itera

Plataforma educativa **B2B empresa-first** (no B2C). Vende **retención + ejecución**, no información — por eso el formato principal son ejercicios interactivos cortos, no videos. Audiencia objetivo: empresas LATAM no-técnicas que necesitan onboardear a su equipo en IA aplicada.

**Tesis no negociable:** la información de IA es gratis (YouTube, blogs). Lo que falta es un sistema que convierta esa información en ejecución real en las próximas 24 horas. Itera vende eso.

**Decisiones de posicionamiento que afectan Finance:**
- Stripe es el único procesador (USD único, target empresas con tarjeta corporativa internacional).
- Mercado Pago descartado definitivamente — sus rails Pix/OXXO/Boleto son B2C, no aplican.
- Pricing: gratis (catálogo) / mensual $19 / anual $199 (ahorro $29). Esto es B2C-pricing inicial; B2B será post-MVP.

Lecturas obligatorias antes de tomar decisiones de producto/copy/pricing:
- `docs/CONTEXT.md` (no-tech context)
- `docs/memory/gotcha_posicionamiento_empresa_vs_latam.md`
- `~/.claude/projects/-Users-pablocarmona-Desktop-Projects-Itera-Development-Web/memory/decision_mercado_pago_muerto.md`

### 1.2. Qué es ITERA: FINANCE

Agente especializado en pagos: integración Stripe, suscripciones, webhook, paywall, perfil-billing UI, billing portal, idempotencia, edge cases de eventos. **No** toca contenido pedagógico, gamification, education, mailing infra ni landing visual.

### 1.3. Las 12 conversaciones paralelas

Pablo opera con 12 agentes simultáneos. Cada uno tiene scope estricto. **Codex (tú) hereda solo Finance**. Otros scopes:

| Agente | Scope |
|---|---|
| **Backend** | TS errors preexistentes, RLS, schema base, infra rate limiting (P1.4) |
| **Components** | Design system tokens (`lib/design-tokens.ts`, `components/ui/*`), Typography |
| **Dashboard** | `/dashboard/*` UI, retos, lecture progress |
| **Education** | Lecciones, slides, `slide_flags`, `lib/analytics/`, RAG embeddings |
| **Finance** | ← **TÚ** |
| **Gamification** | Badges, XP, levels, racha, `user_stats`, perfil gamification UI |
| **Illustrations** | Recraft, mascota geométrica, ilustraciones |
| **Landing** | `app/page.tsx`, `components/landing/*`, hero, faq |
| **Mailing** | `lib/email/*`, `emails/*`, AgentMail, DKIM, transactional only |
| **Onboarding** | `/onboarding`, `/projectDescription`, `/projectContext`, `/courseCreation`, `/success` |
| **Research** | Research docs (R1, R6, R15, etc.) |
| **WhatsApp/Telegram** | `app/api/telegram-link/`, `supabase/functions/telegram-bot` |
| **Wish List** | Roadmap externo, `docs/WISHLIST.md` |

### 1.4. Archivos owned por Finance (full paths)

Todos los paths son relativos a `/Users/pablocarmona/Desktop/Projects/Itera/Development/Web/`.

```
app/api/stripe-webhook/route.ts                  576 líneas — webhook handler completo
app/api/stripe/create-checkout-session/route.ts   76 líneas — POST que crea Stripe Checkout Session
app/api/stripe/create-portal-session/route.ts     48 líneas — POST que crea Customer Portal session
lib/stripe/config.ts                              41 líneas — singleton stripe + STRIPE_PRICES + tier consts
lib/stripe/syncFromSession.ts                    129 líneas — race-fix usado por /success
app/paywall/page.tsx                             311 líneas — UI con 3 cards (gratis/mensual/anual)

supabase/migrations/004_subscriptions.sql       — cols stripe_*, subscription_*, current_period_end
supabase/migrations/005_payments_idempotency.sql — UNIQUE en payments + cancel_at_period_end col
supabase/migrations/006_stripe_webhook_events.sql— tabla dedup event_id PK
supabase/migrations/010_drop_mercadopago.sql    — drop columna MP + tighten provider check
```

### 1.5. Archivos cross-domain donde Finance tiene slice

Estos archivos NO los puedes editar libremente. Solo el slice de Finance está bajo tu control. **Si necesitas modificar fuera del slice, coordina con el agente owner — NUNCA lo hagas solo.**

| Archivo | Owner principal | Slice de Finance |
|---|---|---|
| `app/dashboard/perfil/page.tsx` | Dashboard | Lectura de `subscription_*` + `cancel_at_period_end`, sección "Mi suscripción", botones Gestionar/Mejorar plan |
| `app/auth/signup/page.tsx` | Onboarding | 4 líneas que capturan `?plan=monthly\|yearly` y guardan en sessionStorage como `preferredPlan` |
| `app/projectContext/page.tsx` | Onboarding | El `router.push('/paywall')` en `finishQuestionnaire` y `handleSkip` |
| `app/success/page.tsx` | Onboarding (O1) | Importa `syncSubscriptionFromSession` de `lib/stripe/syncFromSession` y consume sus reasons (`payment_pending`, `subscription_not_ready`, `no_user_id_in_session`) |
| `app/cancel/page.tsx` | Components | Solo el `href="/paywall"` del botón |
| `components/landing/PricingSection.tsx` | Landing | Estructura de `tiers` (gratis/mensual/anual), prices, `handleSelectPlan` con `?plan=` |
| `proxy.ts` | Backend | Si en algún momento agregas guard de `subscription_active`, esto va aquí |

---

## 2. DECISIONES TOMADAS (no se re-discuten)

| # | Decisión | Cuándo | Memoria |
|---|---|---|---|
| 1 | **Mercado Pago muerto.** Stripe único procesador. | 2026-04-23 (Pablo: "ya lo maté 400 veces") | `~/.claude/projects/.../memory/decision_mercado_pago_muerto.md` |
| 2 | **Free tier habilitado** en `/paywall` (no hard paywall) | 2026-04-23 | "Para que pueda enseñar a inversionistas sin paywall" — ver historial |
| 3 | **Currency único: USD** | Pre-existente | `docs/CONTEXT.md` |
| 4 | **Plans: gratis / $19 mensual / $199 anual** | 2026-04-22 | Confirmado por Pablo en historial |
| 5 | **Mode: subscription** (recurring), no payment one-off | 2026-04-22 | Codex flagueó si era subscription |
| 6 | **`allow_promotion_codes: true`** en checkout | 2026-04-22 | Para cupones de inversionistas |
| 7 | **Hard paywall deferido** | 2026-04-23 | "Eventualmente soft" — cuando ya se demos terminen, flippar |
| 8 | **`PAID_TIER='premium'`, `FREE_TIER='basic'`** | 2026-04-23 | Definido en `lib/stripe/config.ts`. `'personalized'` es para course mode, NO billing |
| 9 | **Paywall después de la encuesta**, no en landing | 2026-04-22 | Activation-first / sunk-cost. Ver historial |
| 10 | **`cancel_at_period_end` se respeta** (cancel "at period end" en portal mantiene activo hasta fin de periodo) | 2026-04-23 | Codex round 1 fix |

> **No re-discutas estas decisiones.** Si Pablo cambia una, debe llegar como instrucción explícita y guardada en memory antes de implementarla.

---

## 3. STATE OF CODE — qué está shipped y dónde

### 3.1. Webhook (`app/api/stripe-webhook/route.ts`)

576 líneas. Handlers:

- `checkout.session.completed` (~líneas 199-262): crea cliente Stripe, escribe `users` con `tier=premium`, `subscription_active=true`, etc. Solo escribe `stripe_customer_id` si Stripe lo manda (no sobrescribe con null).
- `customer.subscription.created|updated|paused|resumed` (~líneas 268-308): actualiza estado en `users`, `tier` derivado de `isActiveStatus(status)`, también escribe `stripe_customer_id` defensive.
- `customer.subscription.deleted` (~línea 313-330): revierte a `tier='basic'`, `subscription_active=false`, preserva `stripe_customer_id`.
- `customer.deleted` (~línea 335-355): unlinkea, nullea `stripe_customer_id` y `stripe_subscription_id`.
- `invoice.payment_succeeded` (~líneas 360-441): upsert en `payments` con `onConflict: 'provider,provider_payment_id'`, dispara `sendPaymentReceipt` solo si fresh insert (heurística 60s window).
- `invoice.payment_failed` (~líneas 446-525): upsert en `payments` (status=failed), dispara `sendFailedCharge`.

Helpers críticos:
- `markEventProcessed()` — dedup via `stripe_webhook_events` table; UNIQUE_VIOLATION = retry, devuelve `false`.
- `updateUserOrThrow()` — propaga errores de Supabase como Error → handler general → 500 → Stripe reintenta.
- `parsePlan()` — valida que `metadata.plan` sea `'monthly'` o `'yearly'`.
- `priceIdFromInvoice()` — workaround SDK 2025-11-17 clover (`line.pricing.price_details.price`).
- `subscriptionIdFromInvoice()` — lee de `invoice.parent.subscription_details.subscription` (clover) con fallback a `invoice.subscription` legacy.
- `invoiceUserIdFromMetadata()` — busca `user_id` en 3 candidatos de metadata (parent, legacy, root), no el primer objeto no-null.
- `resolveUserId()` — fallback metadata → `users.stripe_customer_id` lookup.

Orden de procesamiento: validar firma → check duplicate event_id → switch → en error, intentar borrar event_id de dedup table para permitir reintento.

### 3.2. Checkout Session (`app/api/stripe/create-checkout-session/route.ts`)

76 líneas. Validaciones en orden:
1. User autenticado (Supabase auth).
2. `plan` en body es `'monthly'` o `'yearly'`.
3. Price ID resuelto desde `STRIPE_PRICES[plan]` (env var, no del cliente).
4. Lee `users.stripe_customer_id` y `subscription_active` con error explícito (fail-closed si Supabase falla → 503).
5. Si `subscription_active=true` → 409 con mensaje "ya tienes una suscripción activa".
6. Crea session con `mode:'subscription'`, customer existente o `customer_email`, `client_reference_id: user.id`, `metadata: { user_id, plan }`, `subscription_data.metadata` idem, `allow_promotion_codes: true`, `success_url` con `{CHECKOUT_SESSION_ID}` template, `cancel_url`.

### 3.3. Portal Session (`app/api/stripe/create-portal-session/route.ts`)

48 líneas. Lee `stripe_customer_id`, devuelve 400 si no existe, llama a `stripe.billingPortal.sessions.create` con `return_url = ${origin}/dashboard/perfil`.

> ⚠️ El portal solo funciona si Pablo configuró el portal en Stripe Dashboard → Settings → Billing → Customer portal. Ver sección 10.

### 3.4. Sync from Session (`lib/stripe/syncFromSession.ts`)

129 líneas. Helper usado por `app/success/page.tsx` (Onboarding domain) para cerrar el race con el webhook. Es **idempotente** con el webhook — escribe los mismos campos y valores.

Reasons que devuelve si no hace ok:
- `stripe_secret_key_missing`
- `supabase_service_role_missing`
- `<error message>` si retrieve falla
- `no_user_id_in_session`
- `payment_pending`
- `subscription_not_ready` (sub null en mode=subscription)
- `supabase_update_failed: <msg>`

### 3.5. Paywall UI (`app/paywall/page.tsx`)

311 líneas. Client component con guard que:
1. Si no auth → `/auth/login?redirectedFrom=/paywall`.
2. Si no `projectIdea` en sessionStorage → `/projectDescription`.
3. Si `subscription_active=true` → `/courseCreation`.
4. Si nada → muestra 3 cards.

Soporta `?canceled=1` (banner amarillo "cancelaste el pago") y `?plan=monthly|yearly` (resalta esa card como "recomendado") y lee `sessionStorage.preferredPlan` como fallback.

CTAs:
- **Gratis** → `router.push('/courseCreation')` directo.
- **Mensual / Anual** → POST a `/api/stripe/create-checkout-session` con `plan`, redirect a `sessionUrl`.

### 3.6. Config (`lib/stripe/config.ts`)

```ts
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-11-17.clover', typescript: true });
export const STRIPE_PRICES = { monthly: process.env.STRIPE_PRICE_MONTHLY!, yearly: process.env.STRIPE_PRICE_YEARLY! } as const;
export type BillingPlan = keyof typeof STRIPE_PRICES;
export function planFromPriceId(priceId): BillingPlan | null { ... }
export const PAID_TIER = 'premium' as const;
export const FREE_TIER = 'basic' as const;
```

> ⚠️ **Siempre usa este singleton.** Si haces `new Stripe(...)` en otro lugar, el linter/Codex lo va a flagear. Si ves un duplicado, refactoriza al singleton.

### 3.6.bis. Semántica de cancelación + UI perfil (importante: NO confundir)

Hay tres estados de cancelación con campos DB distintos. La UI los discrimina solo por `subscription_active`.

| Acción del usuario | DB tras webhook | Lo que perfil renderiza |
|---|---|---|
| **Cancel "at period end"** desde portal | `subscription_active=true`, `subscription_status='active'`, `cancel_at_period_end=true`, resto de campos preservados, `tier='premium'` | "Plan mensual ($19/mes)" + "Se cancela el DD de MMM" |
| **Cancel "immediately"** desde portal o admin | `subscription_active=false`, `subscription_status='canceled'`, `cancel_at_period_end=false`, `subscription_plan` y `current_period_end` y `stripe_subscription_id` **PRESERVADOS** (residuales), `stripe_customer_id` preservado, `tier='basic'` | "Plan gratis — actualiza para desbloquear la ruta personalizada" |
| **Customer eliminado** en Stripe Dashboard | Mismo que cancel inmediato + `stripe_customer_id=null`, `stripe_subscription_id=null`, `subscription_plan=null`, `current_period_end=null`, `tier='basic'` | "Plan gratis…" + botón "Mejorar plan" (porque `hasStripeCustomer=false`) |

**Por qué residuales son intencionales (NO bug):** preservar `subscription_plan` y `current_period_end` después de un cancel inmediato sirve como *historial*: cuándo expiró, qué plan tenían. La UI **siempre** debe gatear por `subscription_active`, no por `subscription_plan`.

**Lógica del componente perfil ([app/dashboard/perfil/page.tsx](app/dashboard/perfil/page.tsx)):**
```tsx
{profile.subscriptionActive && profile.subscriptionPlan ? (
  // Activo: muestra "Plan mensual/anual" + fecha
  <>
    <p>Plan {plan === 'yearly' ? 'anual' : 'mensual'}</p>
    {currentPeriodEnd && (
      <p>{cancelAtPeriodEnd ? `Se cancela el ${date}` : `Próxima renovación: ${date}`}</p>
    )}
  </>
) : (
  // Cancelado o gratis: muestra invitación a upgrade
  <p>Plan gratis — actualiza para desbloquear la ruta personalizada</p>
)}
```

**Bug pattern a evitar:** si alguien cambia ese conditional a `subscription_plan ? ... : ...` (sin `subscription_active`), un user con sub cancelada inmediatamente seguirá viendo "Plan mensual" porque `subscription_plan` queda residual. **No tocar el conditional sin entender esto.**

**Cuándo limpiar los residuales:** nunca de oficio. Solo si Pablo lo pide explícitamente (ej. "para reactivar suscripción tras cancel inmediato, queremos UI vacía"). Mientras tanto, residuales = historial gratis.

### 3.7. Migrations aplicadas en Supabase live

| # | Archivo | Qué hace | Aplicada |
|---|---|---|---|
| 004 | `004_subscriptions.sql` | Añade a `users`: `stripe_subscription_id`, `subscription_status`, `subscription_plan`, `current_period_end` | ✓ |
| 005 | `005_payments_idempotency.sql` | UNIQUE `(provider, provider_payment_id)` en `payments` + col `cancel_at_period_end` en `users` | ✓ |
| 006 | `006_stripe_webhook_events.sql` | Crea tabla `stripe_webhook_events(event_id PK, event_type, processed_at)` | ✓ |
| 010 | `010_drop_mercadopago.sql` | Drop col `users.mercadopago_customer_id` + check constraint `payments.provider = 'stripe'` only | ✓ |

> Nota: existe `006_welcome_email_sent_at.sql` (Onboarding O3) que comparte número con la mía. **No es bug**, las dos están aplicadas. Si rebasas, solo respeta la suya.

---

## 4. STATE OF DB — verificar antes de tocar

### 4.1. `users` (cols Finance-relevant)

| col | type | nullable | default |
|---|---|---|---|
| `tier` | text | YES | `'basic'` |
| `stripe_customer_id` | text | YES | NULL |
| `stripe_subscription_id` | text | YES | NULL |
| `subscription_status` | text | YES | NULL |
| `subscription_plan` | text | YES | NULL |
| `subscription_active` | boolean | NO | false |
| `current_period_end` | timestamptz | YES | NULL |
| `cancel_at_period_end` | boolean | NO | false |

Constraints:
- `users_tier_check`: `tier IN ('basic', 'personalized', 'premium')`
- `users_subscription_status_check`: `subscription_status IN ('active','trialing','past_due','canceled','unpaid','incomplete','incomplete_expired','paused')`
- `users_subscription_plan_check`: `subscription_plan IN ('monthly','yearly')`

### 4.2. `payments`

| col | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | `uuid_generate_v4()` |
| `user_id` | uuid | YES | NULL |
| `amount` | integer | NO | NULL (cents) |
| `currency` | text | YES | `'USD'` |
| `provider` | text | NO | NULL |
| `provider_payment_id` | text | YES | NULL |
| `status` | text | YES | `'pending'` |
| `tier` | text | YES | NULL |
| `metadata` | jsonb | YES | NULL |
| `created_at` | timestamptz | YES | `now()` |
| `updated_at` | timestamptz | YES | `now()` |

Constraints:
- `payments_provider_check`: `provider = 'stripe'` (estrictamente, post-MP cleanup)
- `payments_provider_payment_unique`: UNIQUE `(provider, provider_payment_id)` ← idempotencia
- `payments_status_check`: `status IN ('pending','succeeded','failed','refunded')`
- `payments_tier_check`: `tier IN ('basic','personalized','premium')`

### 4.3. `stripe_webhook_events`

| col | type | nullable | default |
|---|---|---|---|
| `event_id` | text | NO | NULL (PK) |
| `event_type` | text | NO | NULL |
| `processed_at` | timestamptz | NO | `now()` |

Index: `stripe_webhook_events_processed_at_idx` (DESC).

### 4.4. Cómo verificar el state desde Codex

Ver sección 9.3 para queries SQL exactas.

---

## 5. VERIFICACIÓN E2E YA HECHA (no la re-corras a menos que sospeches regresión)

Ejecutado 2026-04-23 con Stripe CLI + Node SDK + tarjeta `pm_card_visa`. Todo PASS.

| # | Escenario | Esperado | Resultado |
|---|---|---|---|
| 1 | Crear customer + sub con metadata user_id+plan | sub activa, webhook dispara `subscription.created` + `invoice.payment_succeeded` | ✓ ambos 200 |
| 2 | DB `users` tras webhook | `tier=premium`, `subscription_active=true`, `subscription_plan='monthly'`, `stripe_customer_id` poblado, `current_period_end` 30d futuro | ✓ exacto |
| 3 | DB `payments` row | `amount=1900`, `status=succeeded`, `billing_reason=subscription_create` | ✓ |
| 4 | `stripe_webhook_events` | 2 filas distintas | ✓ |
| 5 | **Resend** mismo event_id | webhook 200 sin duplicar | ✓ `payments=1, dedup_events=1` |
| 6 | POST `/api/stripe/create-portal-session` | sessionUrl `billing.stripe.com` | ✓ |
| 7 | POST `/api/stripe/create-checkout-session` con sub activa | 409 `ya_tienes_suscripcion_activa` | ✓ |
| 8 | `subscription.update(cancel_at_period_end: true)` | DB con `cancel_at_period_end=true` + `subscription_active=true` | ✓ |
| 9 | `subscription.cancel()` (delete inmediato) | DB con `tier=basic`, `subscription_active=false`, `stripe_customer_id` preservado | ✓ |

Cleanup post-test:
- Test customer borrado de Stripe test mode
- Preview user reseteado en DB
- `payments` y `stripe_webhook_events` vaciadas
- `.env.local` byte-exacto restaurado a live mode (3351 bytes)
- `stripe listen` killed
- Preview server reiniciado con live env

> Ver sección 9.1 para replicar el E2E si dudas.

---

## 6. TODOS PENDIENTES — priorizados

### 🔴 Bloqueantes para primer pago real (acciones de Pablo, NO de Codex)

Ver sección 10. Codex no puede hacer estas — son UI-only en Stripe Dashboard.

### 🟠 Importantes que Codex puede hacer

**F6 · Hard paywall middleware**
- **Cuándo:** Cuando Pablo diga "ya terminamos demos a inversionistas, flippa hard". No antes.
- **Cómo:** En `proxy.ts`, agregar a `protectedRoutes` el check de `subscription_active`. Si `false` y la ruta es `/courseCreation` o `/dashboard*`, redirect a `/paywall?from=hard`. El query param `?from=hard` lo lee `/paywall/page.tsx` para esconder la card "gratis" (eso ya lo veremos en su momento).
- **Estimado:** 30 min código + tests. NO lo hagas hasta que Pablo lo apruebe explícitamente.

**P1.4 · Rate limiting en rutas Stripe**
- **Cuándo:** Cuando exista el módulo de Backend P1.4. Commit `6a3ed13 feat(ratelimit): módulo compartido P1.4 con @upstash/ratelimit` ya está en `main`.
- **Cómo:** Importar el rate limiter de Backend (probablemente `lib/ratelimit/...`) y aplicar a `/api/stripe/create-checkout-session` (~5 req/min/user) y `/api/stripe/create-portal-session` (~10 req/min/user). El webhook NO necesita rate limit (Stripe ya lo controla).
- **Estimado:** 15 min. Verifica primero el path real del módulo de Backend; mi info puede estar desactualizada.

**F13 · Verificar email triggers tras DKIM Mailing**
- **Cuándo:** Cuando Mailing termine M3 (DKIM/SPF/DMARC en `itera.la`).
- **Qué verificar:** Disparar un payment en test mode, confirmar que `sendPaymentReceipt` llega al inbox (no spam) con DKIM passing. Lo mismo con `sendFailedCharge`. Si los templates no se renderean bien, abrir issue a Mailing.
- **Estimado:** 20 min E2E.

### 🟡 Esperando decisiones de Pablo o Research

**F9 · Trial period**
- Bloqueado en Research R1 (pricing B2B LATAM). Si Pablo dice "agrega trial 7 días", el cambio es 1 línea: `subscription_data: { trial_period_days: 7, metadata: { ... } }` en `create-checkout-session`. El webhook ya maneja `status='trialing'` como activo.

**F10 · Cupones**
- `allow_promotion_codes: true` ya está activo. Pablo crea códigos manualmente en Stripe Dashboard → Products → Coupons cuando quiera. No requiere código tuyo.

### 🟢 Nice-to-have (low priority)

**Event-level ordering guard**
- Codex round 4 mencionó: si un `subscription.updated` viejo se reintenta DESPUÉS de un `deleted` nuevo, sobrescribe. Dedup actual cubre retries del mismo event_id pero no reordering entre event_ids distintos.
- Fix: comparar `event.created` vs `users.updated_at` antes de escribir.
- Solo vale la pena si vemos casos raros en prod.

**Upgrade flow desde dashboard free → pagado**
- Hoy `/paywall` requiere `projectIdea` en sessionStorage. Un free user en dashboard que clickea "Mejorar plan" rebota a `/projectDescription`.
- Fix: relajar el guard si query param es `?from=upgrade` (no requiere projectIdea, asume reuse de intake previo).
- Estimado: 15 min.

---

## 7. DON'TS — qué NO tocar

> Si el cambio que vas a hacer toca algo de esta lista, **detente y coordina con el agente owner** (sección 1.3) o pregúntale a Pablo. Modificar fuera de scope es la causa #1 de bugs cross-team.

| Archivo / dir | Owner | Por qué no tocar |
|---|---|---|
| `app/projectContext/page.tsx` | Onboarding | Pure encuesta UI. Tu único interés era el `router.push('/paywall')`, ya está. |
| `app/success/page.tsx` | Onboarding O1 | Solo importa tu sync. La UI y el flujo son de ellos. |
| `app/cancel/page.tsx` | Components | Design tokens de ellos. Tu único interés era el `href="/paywall"`. |
| `components/landing/PricingSection.tsx` | Landing | Estructura de copy y diseño es de ellos. Datos de plans + handler son tuyos pero ya están. |
| `app/dashboard/perfil/page.tsx` | Dashboard | Sección "Mi suscripción" es tuya. Todo lo demás (gamification, telegram, name edit, danger zone) NO. |
| `app/auth/signup/page.tsx` | Onboarding | Tu slice ya está (4 líneas captura `?plan=`). El form, OAuth, error handling son de ellos. |
| `lib/email/*` | Mailing | Tu webhook llama `sendPaymentReceipt` y `sendFailedCharge` desde ahí. NO modifiques los helpers; si necesitas un nuevo email, abre issue a Mailing. |
| `emails/*` | Mailing | Templates React Email. Out-of-scope. |
| `proxy.ts` | Backend | Solo agregas guard si Pablo aprueba F6 (hard paywall). |
| `components/ui/*`, `lib/design-tokens.ts` | Components | Usa los componentes/tokens, no los modifiques. |
| `app/dashboard/admin/*`, `app/dashboard/progress/*`, etc. | Dashboard / Education | Out-of-scope. |
| `supabase/functions/*` | Backend / WhatsApp | Edge functions Deno, otro tsconfig context. |
| `lib/gamification/*`, `components/dashboard/GamificationSummary` | Gamification | Out-of-scope. |
| `lib/lessons/*`, `lib/analytics/*` | Education / Backend | Out-of-scope. |
| `lib/onboarding/persistIntake.ts` | Onboarding | Solo lectura. |

**Regla de oro:** si no estás 100% seguro de quién owna un archivo, búscalo en sección 1.3 o no lo toques.

---

## 8. CROSS-TEAM COORDINATION

### Backend P1.4 — rate limiting

**Status:** Backend ya mergeó `6a3ed13 feat(ratelimit): módulo compartido P1.4 con @upstash/ratelimit`. El módulo está en `main`.

**Tu acción:** Cuando vayas a aplicar rate limit, verifica el path actual (puede ser `lib/ratelimit/index.ts` o similar) y úsalo en tus 2 routes Stripe. NO crees tu propia implementación.

### Mailing F13 / M3 — DKIM + email triggers

**Status:** Tu webhook ya importa `sendPaymentReceipt` y `sendFailedCharge` de `lib/email/send.ts`. Mailing termina M3 (DKIM/SPF/DMARC) cuando pueda. Hasta entonces, los emails se envían pero pueden caer en spam.

**Tu acción:** Después de DKIM, hacer E2E con tarjeta test → verificar que el correo llega al inbox no-spam. Si templates rotos, issue a Mailing.

### Onboarding O1 — race condition `/success`

**Status:** Resuelta. Tu `lib/stripe/syncFromSession.ts` se llama desde `app/success/page.tsx`. Si webhook llegó primero, `subscription_active` ya está true; si no, `syncFromSession` lo escribe. Idempotente porque escriben los mismos campos.

**Tu acción:** Ninguna. Solo no rompas la idempotencia (campos webhook = campos sync, salvo `stripe_customer_id` que ambos saltan si null).

### Onboarding O3 — welcome email idempotency

**Status:** Onboarding agregó `users.welcome_email_sent_at` (migration 006_welcome_email_sent_at.sql). Su `auth/callback/route.ts` y posiblemente tu webhook (en el `checkout.session.completed`) podrían disparar welcome.

**Tu acción:** **NO** dispares welcome desde tu webhook. Onboarding es dueño del welcome email logic. Si Pablo te lo pide, primero confirma con Onboarding antes de tocar.

---

## 9. TEST COMMANDS — copia y pega

### 9.1. E2E completo con Stripe CLI — script autocontenido

> ⚠️ Esto modifica `.env.local`. Pre-requisito: `stripe config --list` debe mostrar `live_mode_api_key` y `test_mode_api_key`.
>
> El script captura IDs en variables y siempre restaura el env aunque falle (`trap cleanup EXIT`). Es **copy-paste**.

```bash
#!/usr/bin/env bash
set -euo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
WEB=/Users/pablocarmona/Desktop/Projects/Itera/Development/Web
USER_ID=80c94eaa-2d72-4b2f-97b0-b120f340c62f
ENV_BACKUP=/tmp/itera-env-live-backup.env
LISTEN_LOG=/tmp/stripe-listen.log
cd "$WEB"
CUSTOMER_ID=""; SUB_ID=""

# Cleanup automático en cualquier exit (success o fail)
cleanup() {
  echo "→ cleanup"
  if [[ -n "$SUB_ID" ]]; then
    node --env-file=.env.local -e "
      const s = new (require('stripe'))(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' });
      Promise.allSettled([
        s.subscriptions.cancel('$SUB_ID'),
        s.customers.del('$CUSTOMER_ID')
      ]).then(() => console.log('stripe test objects cleaned'));
    " 2>/dev/null || true
  fi
  pkill -f "stripe listen" 2>/dev/null || true
  if [[ -f "$ENV_BACKUP" ]]; then
    cp "$ENV_BACKUP" "$WEB/.env.local"
    echo "→ .env.local restaurado a live"
  fi
  # Reiniciar preview server con env live:
  #   - En Claude Code: usa preview_stop + preview_start "Next.js Dev"
  #   - En bash directo:
  pkill -f "next dev" 2>/dev/null || true
  (cd "$WEB" && npm run dev > /tmp/next-dev.log 2>&1 &) ; sleep 5
}
trap cleanup EXIT

# 1) Backup live env (byte-exacto)
cp "$WEB/.env.local" "$ENV_BACKUP"

# 2) Swap env a test mode con sed (idempotente, BSD sed en macOS)
#    Comentas las 5 líneas live, descomentas las 5 test.
sed -i '' \
  -e '/^# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_/s/^# //' \
  -e '/^# STRIPE_SECRET_KEY=sk_test_/s/^# //' \
  -e '/^# STRIPE_WEBHOOK_SECRET=whsec_3db7d9e2/s/^# //' \
  -e '/^# STRIPE_PRICE_MONTHLY=price_1TOLaG/s/^# //' \
  -e '/^# STRIPE_PRICE_YEARLY=price_1TOLal/s/^# //' \
  -e '/^NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_/s/^/# /' \
  -e '/^STRIPE_SECRET_KEY=sk_live_/s/^/# /' \
  -e '/^STRIPE_WEBHOOK_SECRET=whsec_vXlci7s6/s/^/# /' \
  -e '/^STRIPE_PRICE_MONTHLY=price_1TOKuR/s/^/# /' \
  -e '/^STRIPE_PRICE_YEARLY=price_1TOKvW/s/^/# /' \
  "$WEB/.env.local"
echo "→ env swapped a test mode"

# 3) Start stripe listen en background
stripe listen --forward-to localhost:3000/api/stripe-webhook \
  --events 'checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed' \
  > "$LISTEN_LOG" 2>&1 &
sleep 3
grep -q "signing secret" "$LISTEN_LOG" || { echo "FAIL: stripe listen no arrancó"; exit 1; }

# 4) Restart preview server con env nuevo
pkill -f "next dev" 2>/dev/null || true
(cd "$WEB" && npm run dev > /tmp/next-dev.log 2>&1 &)
# Espera hasta que /api/stripe-webhook responda (signature inválida pero >=400)
for i in 1 2 3 4 5 6 7 8 9 10; do
  sleep 1
  curl -sf -o /dev/null -w "%{http_code}" http://localhost:3000/api/stripe-webhook -X POST -d '{}' -H 'content-type: application/json' 2>/dev/null | grep -qE "^[34][0-9]{2}$" && break
done
echo "→ dev server up"

# 5) Trigger sub creation y captura IDs
TRIG=$(node --env-file=.env.local -e "
const Stripe = require('stripe');
const s = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' });
(async () => {
  const c = await s.customers.create({ email: 'preview@itera.dev', name: 'Preview', metadata: { user_id: '$USER_ID' }, payment_method: 'pm_card_visa', invoice_settings: { default_payment_method: 'pm_card_visa' } });
  const sub = await s.subscriptions.create({ customer: c.id, items: [{ price: process.env.STRIPE_PRICE_MONTHLY }], metadata: { user_id: '$USER_ID', plan: 'monthly' }, off_session: true });
  console.log(JSON.stringify({ customerId: c.id, subId: sub.id, status: sub.status }));
})().catch(e => { console.error(JSON.stringify({ error: e.message })); process.exit(1); });
")
echo "$TRIG"
CUSTOMER_ID=$(echo "$TRIG" | python3 -c "import sys,json; print(json.loads(sys.stdin.read()).get('customerId',''))")
SUB_ID=$(echo "$TRIG" | python3 -c "import sys,json; print(json.loads(sys.stdin.read()).get('subId',''))")
[[ -z "$SUB_ID" ]] && { echo "FAIL: no se creó sub"; exit 1; }

# 6) Esperar webhook + verificar log
sleep 4
echo "--- listen log (últimas 6) ---"
tail -6 "$LISTEN_LOG"
grep -qE "<--  \[200\] POST" "$LISTEN_LOG" || { echo "FAIL: webhook no procesó eventos con 200"; exit 1; }

# 7) Verificar DB con Supabase service role (sin acción humana)
node --env-file=.env.local -e "
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const USER_ID = '$USER_ID';
(async () => {
  const fail = (msg) => { console.error('FAIL:', msg); process.exit(1); };
  const { data: u } = await s.from('users').select('tier,subscription_active,subscription_status,subscription_plan,stripe_customer_id,stripe_subscription_id,current_period_end,cancel_at_period_end').eq('id', USER_ID).single();
  console.log('users:', JSON.stringify(u));
  if (u.tier !== 'premium') fail('tier !== premium, got ' + u.tier);
  if (u.subscription_active !== true) fail('subscription_active !== true');
  if (u.subscription_plan !== 'monthly') fail('subscription_plan !== monthly');
  if (!u.stripe_customer_id) fail('no stripe_customer_id');

  const { data: pays } = await s.from('payments').select('amount,currency,status,tier').eq('user_id', USER_ID);
  console.log('payments:', JSON.stringify(pays));
  if (!pays || pays.length === 0) fail('0 payments rows');
  if (pays[0].amount !== 1900) fail('amount !== 1900');
  if (pays[0].status !== 'succeeded') fail('status !== succeeded');

  const { data: evs } = await s.from('stripe_webhook_events').select('event_id,event_type');
  console.log('events:', JSON.stringify(evs));
  if (!evs || evs.length < 2) fail('< 2 webhook events procesados');

  console.log('✓ DB asserts PASS');
})().catch(e => { console.error('FAIL exception:', e.message); process.exit(1); });
"

# 8) (opcional) reset de DB para baseline limpio post-test
node --env-file=.env.local -e "
const { createClient } = require('@supabase/supabase-js');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const USER_ID = '$USER_ID';
(async () => {
  await s.from('users').update({ stripe_customer_id: null, stripe_subscription_id: null, subscription_status: null, subscription_plan: null, subscription_active: false, current_period_end: null, cancel_at_period_end: false, tier: 'basic' }).eq('id', USER_ID);
  await s.from('payments').delete().eq('user_id', USER_ID);
  await s.from('stripe_webhook_events').delete().like('event_id', 'evt_%');
  console.log('✓ DB reseteada a baseline');
})();
"

# 9) trap cleanup() corre al exit (cancela sub, borra customer, restaura env, reinicia next)
echo "✓ E2E PASS — exit 0 dispara cleanup"
```

**Notas:**
- `sed -i ''` es BSD sed (macOS). Linux usa `sed -i` sin las comillas.
- Ajusta los patterns del sed si los prefijos en `.env.local` cambian (verifica primero con `grep -E '^(# )?STRIPE' .env.local`).
- Reset de DB: el paso 8 del script lo hace automáticamente al final del happy path (vía Supabase service role). Si quieres preservar el state para debug post-fail, comenta el bloque del paso 8.
- El **trap** (al exit) cancela sub + borra customer en Stripe + restaura `.env.local` + reinicia next dev. No toca la DB — eso es responsabilidad del paso 8.
- Si quieres correrlo paso a paso (debug), borra `set -e` y `trap cleanup EXIT`.

### 9.2. Verificar tsc Finance scope

```bash
cd /Users/pablocarmona/Desktop/Projects/Itera/Development/Web
npx tsc --noEmit 2>&1 | grep "error TS" | grep -vE "supabase/functions|app/api/dev/auto-login|components/(shared|ui)/Button|app/componentes/page.tsx" | head
# Esperado: vacío (0 errores Finance scope)
```

### 9.3. SQL queries para verificar DB state

> Usa Supabase MCP (`mcp__833a730c-...__execute_sql`) o el dashboard. Project ID: `mteicafdzilhxkawyvxw`.

**a) Estado preview user (debe estar `basic/false/null` antes de tests):**
```sql
SELECT tier, subscription_active, subscription_status, subscription_plan, stripe_customer_id, stripe_subscription_id, current_period_end, cancel_at_period_end
FROM users WHERE id='80c94eaa-2d72-4b2f-97b0-b120f340c62f';
```

**b) Tests pasaron (post-trigger sub):**
```sql
SELECT (SELECT count(*) FROM payments WHERE user_id='80c94eaa-2d72-4b2f-97b0-b120f340c62f') AS payments,
       (SELECT count(*) FROM stripe_webhook_events) AS events,
       (SELECT tier FROM users WHERE id='80c94eaa-2d72-4b2f-97b0-b120f340c62f') AS tier;
-- Esperado tras E2E: payments>=1, events>=2, tier='premium'
```

**c) Reset preview user (post-test):**
```sql
UPDATE users SET stripe_customer_id=NULL, stripe_subscription_id=NULL, subscription_status=NULL, subscription_plan=NULL, subscription_active=false, current_period_end=NULL, cancel_at_period_end=false, tier='basic'
WHERE id='80c94eaa-2d72-4b2f-97b0-b120f340c62f';
DELETE FROM payments WHERE user_id='80c94eaa-2d72-4b2f-97b0-b120f340c62f';
DELETE FROM stripe_webhook_events WHERE event_id LIKE 'evt_%';  -- Solo IDs de tests
```

**d) Verificar constraints (debe coincidir con sección 4):**
```sql
SELECT pg_get_constraintdef(oid) AS def, conname FROM pg_constraint
WHERE conname IN (
  'payments_provider_check', 'payments_provider_payment_unique', 'payments_status_check',
  'users_subscription_status_check', 'users_subscription_plan_check', 'users_tier_check'
);
```

### 9.4. Stripe CLI auth check

```bash
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
stripe config --list
# Verifica que aparezcan: live_mode_api_key, test_mode_api_key, account_id=acct_1OqhKKJeqJcWonQS
```

---

## 10. CHECKLIST HUMANO PENDIENTE (Pablo, no Codex)

### a) Stripe Dashboard → Customer Portal config (10 min)

URL: https://dashboard.stripe.com/settings/billing/portal

- [ ] Activar el portal (toggle ON).
- [ ] **Business information**: nombre "Itera", legal name, URL `https://itera.la`.
- [ ] **Features → Subscription cancellation**: ON. Modo: `at period end`. (El código ya soporta `cancel_at_period_end`.)
- [ ] **Features → Subscription update**: ON. Selecciona ambos price IDs (mensual + anual). Prorations: `Prorate subscription updates`.
- [ ] **Features → Payment method update**: ON.
- [ ] **Features → Invoice history**: ON.
- [ ] Click **Save**.

### b) Stripe Dashboard → Webhook events (5 min)

URL: https://dashboard.stripe.com/webhooks/we_1TOLTwJeqJcWonQScSXrHqEP

Endpoint live ya creado: `we_1TOLTwJeqJcWonQScSXrHqEP` → `https://itera.la/api/stripe-webhook`. Eventos a habilitar:

- [ ] `checkout.session.completed` ✓ (probablemente ya está)
- [ ] `customer.subscription.created` ✓
- [ ] `customer.subscription.updated` ✓
- [ ] `customer.subscription.deleted` ✓
- [ ] `customer.subscription.paused` ← **agregar**
- [ ] `customer.subscription.resumed` ← **agregar**
- [ ] `customer.deleted` ← **agregar**
- [ ] `invoice.payment_succeeded` ← **agregar (crítico para historial)**
- [ ] `invoice.payment_failed` ← **agregar**

---

## 11. GLOSARIO + REFERENCIAS

### 11.1. Migrations (qué hace cada una)

- **004_subscriptions.sql**: cols subscription en `users`. Ya estaban `stripe_customer_id` y `subscription_active` antes; esta agregó `stripe_subscription_id`, `subscription_status`, `subscription_plan`, `current_period_end`.
- **005_payments_idempotency.sql**: UNIQUE `(provider, provider_payment_id)` en `payments` + col `cancel_at_period_end` boolean en `users` con default false.
- **006_stripe_webhook_events.sql**: tabla nueva, `event_id` PK, `event_type`, `processed_at`. Index DESC en `processed_at`.
- **010_drop_mercadopago.sql**: dropea col `mercadopago_customer_id` de `users`, dropea check de `payments.provider` viejo, agrega nuevo check `provider = 'stripe'`. Tiene self-verification DO block.

### 11.2. Memory files relevantes

| Path | Contenido |
|---|---|
| `~/.claude/projects/-Users-pablocarmona-Desktop-Projects-Itera-Development-Web/memory/decision_mercado_pago_muerto.md` | MP descartado, Stripe único. Bloquea futuras preguntas. |
| `~/.claude/projects/-Users-pablocarmona-Desktop-Projects-Itera-Development-Web/memory/MEMORY.md` | Index global de memoria del usuario. |
| `docs/memory/gotcha_posicionamiento_empresa_vs_latam.md` | Por qué B2B empresa-first → no rails B2C. |
| `docs/CONTEXT.md` | Tesis general, audiencia, pricing, roadmap. |
| `CLAUDE.md` | Reglas del design system + reglas de operación. |

### 11.3. Stripe live IDs

| Resource | ID |
|---|---|
| Account | `acct_1OqhKKJeqJcWonQS` |
| Webhook endpoint live | `we_1TOLTwJeqJcWonQScSXrHqEP` → `https://itera.la/api/stripe-webhook` |
| Price mensual live ($19/mes) | `price_1TOKuRJeqJcWonQSJI2CerVT` (product `prod_UN54ivc9S1pdca`) |
| Price anual live ($199/año) | `price_1TOKvWJeqJcWonQSMQffb0kU` (product `prod_UN55yaitpIh5Q0`) |

### 11.4. Stripe test mode IDs

| Resource | ID |
|---|---|
| Price mensual test | `price_1TOLaGJeqJcWonQSjOPk44mB` |
| Price anual test | `price_1TOLalJeqJcWonQSsz5vx2nW` |
| Webhook signing secret (CLI persistente) | `whsec_3db7d9e2c5604aa4f08b30f8e1da24103c2fd03df7ef01bbc08dd845a7765722` |

### 11.5. Preview user para tests

```
ID:    80c94eaa-2d72-4b2f-97b0-b120f340c62f
email: preview@itera.dev
auto-login: GET /api/dev/auto-login (en NODE_ENV=development sin secret)
```

### 11.6. Supabase project

```
project_id: mteicafdzilhxkawyvxw
URL:        https://mteicafdzilhxkawyvxw.supabase.co
```

---

## 12. ESTADO DEL ENV LOCAL

`.env.local` actual (como de 2026-04-23 19:00):

- **LIVE mode activo.** Las 5 vars `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY` apuntan a live.
- **TEST mode comentado.** Las mismas 5 vars con `pk_test_...`/`sk_test_...`/`whsec_3db7d9e2.../price_1TOLa.../price_1TOLal...` están en líneas 16-20, prefijadas con `#`. Para activar test, descomentar y comentar las live (o usar el script de la sección 9.1).
- **No hay vars Mercado Pago.** Las 2 vacías que estaban (`NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY`, `MERCADO_PAGO_ACCESS_TOKEN`) fueron eliminadas el 2026-04-23.
- **Backup live disponible** en `/tmp/itera-env-live-backup.env` (3351 bytes, byte-exacto).

`.env.local.example` está limpio (no menciona MP, no tiene los precios ni whsec — solo placeholders).

Stripe CLI:
- Autenticada en cuenta `acct_1OqhKKJeqJcWonQS` (Beta AI).
- Tiene tokens de live mode y test mode (ambos válidos hasta 2026-07-19).
- Device name: `MacBook-Pro-3.local`.

---

## 13. RIESGOS Y FLAGS

### a) Codex CLI MCP server problems

Cuando ejecutas `codex exec`, varios MCP servers pueden fallar al iniciar (notion, supabase, MCP_DOCKER, perplexity, apify, supermemory). **No es bloqueante** — Codex sigue funcionando con `figma`/`supermemory` activos. Los errores aparecen como `mcp: <name> failed: ...` al principio del output. Ignóralos a menos que necesites uno específico para tu task.

Si Codex hangea por más de 5 min, mátalo (`pkill -f codex`) y considera fallback a `Agent` con `model: haiku` para review adversarial (ver Ralph Wiggum protocol).

### b) Supabase MCP a veces se cae

`mcp__833a730c-...__execute_sql` a veces devuelve `Stream closed`. Si pasa:
1. Reintenta 1-2 veces.
2. Si sigue cayendo, aplica migrations manualmente vía Supabase Dashboard → SQL editor.
3. Si solo necesitas leer, usa `psql` directo con la connection string (require service role key del `.env.local`).

### c) Naming collision migrations 006

Hay dos archivos: `006_stripe_webhook_events.sql` (mío) y `006_welcome_email_sent_at.sql` (Onboarding). **Ambos están aplicados en live.** No es bug, solo mala convención de naming. No los renames sin coordinar — pueden romper history si Pablo usa la CLI de Supabase para aplicar local.

### d) tsc errors pre-existentes (NO son tuyos)

`npx tsc --noEmit` devuelve ~4-5 errors fuera de Finance scope:
- `app/api/dev/auto-login/route.ts` (Backend)
- `components/shared/Button.tsx`, `components/ui/Button.tsx` (Components)
- `app/componentes/page.tsx` (Components)
- A veces `lib/email/agentmail.ts` (si Mailing tiene WIP)
- A veces `supabase/functions/*` (Deno, otro tsconfig)

**Ignóralos.** Si tu cambio agrega errores nuevos en Finance scope, sí debes arreglarlos antes de shippear.

### e) Order of webhook delivery

Stripe NO garantiza orden de entrega. Tu webhook ya maneja:
- `subscription.created/updated/paused/resumed` antes que `checkout.session.completed` (vía `metadata.user_id` fallback, ya que `stripe_customer_id` puede no estar en DB todavía).
- Reintentos del mismo `event_id` (vía `stripe_webhook_events` dedup).

Lo que **NO** maneja:
- Reordering entre `event_id`s distintos. Ej. un `subscription.updated` viejo reintenado DESPUÉS de un `subscription.deleted` nuevo sobrescribiría. Es nice-to-have (sección 6 🟢) — improbable en práctica.

### f) Live keys en `.env.local`

`.env.local` tiene `sk_live_...`. Cuidado al pegar logs / commit. NUNCA agregues `.env.local` a git (está en `.gitignore`, verifica con `git check-ignore .env.local`).

---

## 14. QUICK-START PARA CODEX (5 minutos)

Si solo tienes 5 minutos antes de empezar:

1. **Lee memory (60s):**
   ```
   cat ~/.claude/projects/-Users-pablocarmona-Desktop-Projects-Itera-Development-Web/memory/decision_mercado_pago_muerto.md
   cat docs/memory/gotcha_posicionamiento_empresa_vs_latam.md
   ```

2. **Verifica state actual de DB (60s):**
   Run query 9.3.a (estado preview user). Debe ser `basic/false/null`.

3. **Verifica state actual de código (60s):**
   ```bash
   cd /Users/pablocarmona/Desktop/Projects/Itera/Development/Web
   git log --oneline -5
   wc -l app/api/stripe-webhook/route.ts app/api/stripe/create-checkout-session/route.ts app/paywall/page.tsx
   # Esperado: 576, 76, 311 líneas (sección 1.4)
   ```

4. **Verifica tsc Finance scope (60s):**
   Run query 9.2. Esperado: 0 errores.

5. **Identifica qué TODOs trabajar (60s):**
   - Si Pablo te asignó algo específico, hazlo.
   - Si no, prioriza por sección 6: 🟠 antes de 🟡 antes de 🟢.
   - **NO toques** nada de la sección 7.

**Antes de cualquier commit:**
- Si tu cambio toca crossrover (sección 1.5), confirma con Pablo o el agente owner.
- Corre Codex review con la skill `/codex` o `codex exec ...`.
- Verifica tsc + preview test.

**Si encuentras un bug en mi código:**
- Es probable. Codex iteró 4 rounds y aun pueden quedar edge cases.
- Repórtalo con repro + fix sugerido. NO asumas que mi código es correcto sin verificar.

---

## Cierre

Este doc cubre Finance hasta 2026-04-23 19:00 local. Si pasaron días desde que lo leas:
- Verifica `git log --oneline -20` por commits recientes que modifiquen `app/api/stripe*`, `lib/stripe/*`, `app/paywall/*`.
- Verifica memory por nuevas decisions de Pablo.
- Verifica el matrix de las 12 conversaciones — pueden haber shipped cambios cross-domain que afectan Finance.

Buena suerte. — ITERA: FINANCE
