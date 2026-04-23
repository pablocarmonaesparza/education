# Stripe — Runbook de Test E2E local

Procedimiento para validar el flujo completo de checkout + webhook + portal
contra Stripe en **modo test**. Antes de cada release o cuando se toque algo
del flujo, repetir.

## Pre-requisitos

- Stripe CLI instalado (`brew install stripe/stripe-cli/stripe`).
- Login al Stripe de Itera: `stripe login`.
- Usuario de prueba creado en Supabase (email + password, puede ser el
  "preview user" dev o uno real).

## Paso 1 — Switch a test keys

Editar `.env.local` y **comentar** las keys live, **descomentar** las test:

```bash
# ─── LIVE MODE (Vercel envs, prod) ───
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_WEBHOOK_SECRET=whsec_...  (live)
# STRIPE_PRICE_MONTHLY=price_... (live monthly)
# STRIPE_PRICE_YEARLY=price_... (live yearly)

# ─── LOCAL DEV: TEST MODE ───
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51OqhKK...
STRIPE_SECRET_KEY=sk_test_51OqhKK...
STRIPE_PRICE_MONTHLY=price_1TOLaGJeqJcWonQSjOPk44mB
STRIPE_PRICE_YEARLY=price_1TOLalJeqJcWonQSsz5vx2nW
# STRIPE_WEBHOOK_SECRET viene del comando stripe listen (paso 2)
```

**No commitear este cambio — solo para test local.** Después del test,
revertir.

## Paso 2 — Stripe listen

En una terminal aparte:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

Stripe CLI imprime una línea tipo:

```
Ready! Your webhook signing secret is whsec_abc123...
```

Copiar ese `whsec_...` a `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_abc123...
```

Reiniciar el dev server (Turbopack no siempre re-lee .env on write).

## Paso 3 — Flujo checkout

1. Ir a `/paywall` (autenticado).
2. Click en "empezar mensual" (o anual).
3. En el Stripe Checkout hosted page usar la tarjeta de test:
   - Número: `4242 4242 4242 4242`
   - Expiración: cualquier fecha futura (ej. `12/30`)
   - CVC: cualquier 3 dígitos (ej. `123`)
   - Código postal: `12345`
4. Submit. Debe redirigir a `/success`.
5. En `/success` debe mostrar "pago exitoso" + botón "generar mi ruta".

### Eventos esperados en `stripe listen`

```
→ customer.created
→ customer.subscription.created
→ invoice.created
→ invoice.finalized
→ invoice.paid
→ invoice.payment_succeeded          [poblar tabla payments]
→ payment_intent.succeeded
→ charge.succeeded
→ checkout.session.completed          [update users]
```

Los que escribimos:
- `checkout.session.completed` → update `users` (tier, plan, customer_id, etc.)
- `customer.subscription.created/updated` → update `users` (status, period_end)
- `invoice.payment_succeeded` → insert en `payments`

## Paso 4 — Verificar en Supabase

```sql
-- El usuario debe tener la sub activa
select id, email, tier, subscription_active, subscription_plan,
       subscription_status, current_period_end,
       stripe_customer_id, stripe_subscription_id
from users
where email = 'tu-email@test.com';

-- Debe existir el registro de pago
select amount, currency, provider, status, tier, metadata
from payments
where user_id = '<uuid del user>'
order by created_at desc;
```

Estado correcto:
- `tier = 'premium'`
- `subscription_active = true`
- `subscription_plan = 'monthly'` o `'yearly'`
- `subscription_status = 'active'`
- `stripe_customer_id` y `stripe_subscription_id` poblados
- Fila en `payments` con `amount = 1900` (mensual) o `19900` (anual) cents,
  `currency = 'usd'`, `provider = 'stripe'`, `status = 'succeeded'`

## Paso 5 — Customer Portal

1. Ir a `/dashboard/perfil`.
2. Scroll a "Mi suscripción". Debe mostrar plan + próxima renovación.
3. Click "Gestionar". Redirige al portal Stripe hosted.
4. Probar cancelar. Al volver, la DB debe reflejar:
   - `subscription_status = 'canceled'` (al final del período) o
     `'active'` con `cancel_at_period_end = true` (si se cancela suave).
   - Evento recibido: `customer.subscription.updated` (cancel scheduled) o
     `customer.subscription.deleted` (cancelación inmediata).

## Paso 6 — Fallo de pago

Para simular una tarjeta que falla:

```bash
stripe trigger invoice.payment_failed
```

O en checkout usar la tarjeta de fallo: `4000 0000 0000 0341` (decline after
attaching).

Estado correcto:
- `subscription_status = 'past_due'` o `'unpaid'`
- `subscription_active = false`
- Fila en `payments` con `status = 'failed'`

## Paso 7 — Cleanup

1. Stop `stripe listen` (`Ctrl+C`).
2. Revertir `.env.local`: comentar test keys, descomentar live.
3. Reiniciar dev server.
4. En Stripe Dashboard (test mode) borrar el customer de prueba si se quiere.

## Gotchas

- **`stripe listen` debe estar corriendo antes del checkout** — sin eso, los
  eventos no llegan al webhook local y la DB queda desincronizada. El helper
  `syncSubscriptionFromSession` en `/success` cubre el race, pero no emula
  todos los eventos (ej. no registra en `payments`, no maneja fallos).
- **Turbopack cachea .env** — al cambiar keys o webhook secret, reiniciar
  con `mcp__Claude_Preview__preview_stop` + `preview_start`.
- **Si el webhook devuelve 400** (signature fail), revisar que el
  `STRIPE_WEBHOOK_SECRET` en `.env.local` sea **el del comando stripe listen**
  (test), no el live.
- **test mode vs live mode prices son IDs distintos** — por eso los price
  IDs están en `.env.local` separados. Si ves un error "price not found",
  probablemente estás mezclando modos.

## Referencias

- Stripe test cards: https://stripe.com/docs/testing#cards
- Stripe CLI: https://stripe.com/docs/stripe-cli
- Stripe webhook events: https://stripe.com/docs/api/events/types
