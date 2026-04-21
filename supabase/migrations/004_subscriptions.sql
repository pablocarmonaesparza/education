-- ============================================================================
-- Migration 004 — Columnas de suscripción Stripe en users
-- ----------------------------------------------------------------------------
-- Añade a `users` las columnas necesarias para reflejar el estado de la
-- suscripción Stripe del alumno. El webhook de Stripe escribe aquí.
--
-- Estado pre-migration (columnas relevantes que ya existen):
--   stripe_customer_id    text           — ya existe
--   subscription_active   boolean        — ya existe (not null, default false)
--   tier                  text           — ya existe (check basic|personalized|premium)
--
-- Columnas nuevas:
--   stripe_subscription_id   referencia al sub_xxx de Stripe
--   subscription_status      espejo del Stripe subscription status
--   subscription_plan        'monthly' | 'yearly' (null = sin suscripción)
--   current_period_end       cuándo expira el ciclo actual
--
-- Gate de acceso pagado: `subscription_active = true`. El webhook lo flipea
-- según los eventos de Stripe.
-- ============================================================================

alter table public.users
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status    text
    check (subscription_status in (
      'active','trialing','past_due','canceled','unpaid',
      'incomplete','incomplete_expired','paused'
    )),
  add column if not exists subscription_plan      text
    check (subscription_plan in ('monthly','yearly')),
  add column if not exists current_period_end     timestamptz;

create index if not exists users_stripe_subscription_id_idx
  on public.users(stripe_subscription_id);

create index if not exists users_subscription_status_idx
  on public.users(subscription_status);
