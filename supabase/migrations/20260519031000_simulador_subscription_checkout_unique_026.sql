-- Migration 026 — Idempotencia para checkout B2B del simulador.
--
-- Stripe puede entregar checkout.session.completed al mismo tiempo que el buyer
-- regresa a /onboarding/done. Ambos caminos llaman el mismo sync helper. Este
-- índice hace que checkout_session_id sea una llave real, no solo una búsqueda
-- best-effort sobre metadata.

begin;

create unique index if not exists idx_simulador_subscriptions_checkout_session_unique
  on simulador.subscriptions ((metadata->>'checkout_session_id'))
  where metadata ? 'checkout_session_id';

commit;
