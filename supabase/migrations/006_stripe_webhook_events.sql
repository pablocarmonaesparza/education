-- ============================================================================
-- Migration 006 — Idempotencia por event_id de Stripe webhooks
-- ----------------------------------------------------------------------------
-- Stripe reintenta un mismo webhook hasta 3 días si respondemos ≠ 2xx.
-- También puede entregar eventos desordenados (ej. un `subscription.updated`
-- atrasado llega después de un `subscription.deleted` procesado).
--
-- Estrategia: dedup-table con `event_id` como primary key. El handler
-- intenta `insert` al entrar; si ON CONFLICT (ya procesamos ese event_id),
-- sale early y devuelve 200. Así:
--   - reintentos del mismo event_id no re-ejecutan handlers
--   - los upserts internos (payments, users update) no corren dos veces
--   - el webhook sigue siendo 200 rápido en reintentos (no trabaja de más)
--
-- No guardamos payload — solo el event_id + timestamp. El payload completo
-- vive en Stripe Dashboard, accesible con el event_id para debug.
-- ============================================================================

create table if not exists public.stripe_webhook_events (
  event_id        text primary key,
                  -- ej. "evt_1TOLTwJeqJcWonQSxYz..."
  event_type      text not null,
                  -- ej. "invoice.payment_succeeded"
  processed_at    timestamptz not null default now()
);

create index if not exists stripe_webhook_events_processed_at_idx
  on public.stripe_webhook_events(processed_at desc);
