-- ============================================================================
-- Migration 005 — Idempotencia en payments + cancel_at_period_end en users
-- ----------------------------------------------------------------------------
-- Dos cambios para blindar la integración Stripe:
--
-- 1. UNIQUE (provider, provider_payment_id) en `payments`.
--    Stripe puede reintentar el mismo webhook hasta 3 días. Sin esta restricción
--    acabamos con filas duplicadas por cada reintento. El webhook usa upsert
--    con on_conflict para tratar reintentos como idempotentes.
--
--    Filas existentes con provider_payment_id NULL no chocan (NULL ≠ NULL en
--    unique constraints). No limpiamos históricas — no las hay aún.
--
-- 2. `users.cancel_at_period_end` boolean.
--    Cuando el usuario cancela desde el Customer Portal con "at period end",
--    Stripe mantiene subscription_active=true hasta current_period_end pero
--    marca cancel_at_period_end=true. Guardarlo permite que la UI muestre
--    "se cancela el DD de MMM" sin llamar a Stripe cada vez.
--
--    Default false — la mayoría de subs no están canceladas.
-- ============================================================================

alter table public.payments
  add constraint payments_provider_payment_unique
  unique (provider, provider_payment_id);

alter table public.users
  add column if not exists cancel_at_period_end boolean not null default false;
