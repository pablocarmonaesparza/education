-- R-01 (docs/coord/RULES_LEDGER.md): el CHECK de subscriptions.tier quedó en el
-- modelo legacy por fases (017_simulador_v0.sql:106) mientras el código de billing
-- escribe los tiers per-seat vigentes (lib/simulador/billing.ts). Sin este fix, toda
-- compra cobra en Stripe y la activación local viola la constraint.
--
-- Remoto verificado con 0 filas en simulador.subscriptions (2026-07-02); el UPDATE
-- defensivo solo protege entornos locales sembrados con valores legacy.

-- Orden importa: soltar el CHECK viejo ANTES del UPDATE — el valor destino 'team'
-- no es válido bajo la constraint legacy todavía activa.
alter table simulador.subscriptions
  drop constraint if exists subscriptions_tier_check;

update simulador.subscriptions
  set tier = 'team'
  where tier in ('fase_0_research', 'fase_1_diagnostic', 'fase_2_sprint', 'fase_3_recurrente');

alter table simulador.subscriptions
  add constraint subscriptions_tier_check
  check (tier in ('team', 'business', 'business_plus', 'enterprise'));
