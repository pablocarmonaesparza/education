---
type: decision
title: stripe-only + USD único + mercado pago descartado
date: 2026-04-24
tags: [billing, stripe, usd, mercado_pago, pricing, b2b]
dept: [cfo]
---

## decisión

itera procesa pagos **solo con stripe**. moneda única **USD**. mercado pago **descartado definitivamente**.

esta decisión es canónica y no se reabre sin nuevo análisis CFO formal.

## razones

### por qué stripe-only (no dual-rail latam)

- **B2B-first:** itera vende contratos a empresas, no checkouts individuales. los compradores corporativos latam ya operan en USD (cards corporativas, wire transfer, AP en USD).
- **un solo stack:** webhooks, dunning, dispute handling, tax (stripe tax), billing portal — todo en una sola integración.
- **menos overhead de reconciliación:** dual-rail (mp + stripe) implica dos sistemas de webhooks, dos formatos de eventos, dos conjuntos de fees, dos reportes de revenue.
- **stripe tax automático** para US/EU; mercado pago no resuelve tax automáticamente.

### por qué USD único (no MXN/COP/ARS local)

- audiencia b2b corporativa latam ya razona en USD para SaaS.
- evitar arbitraje cambiario y disputas de fx.
- pricing más estable (no re-pricing por devaluación local).
- simplicidad operativa: un libro contable, un revenue stream.

### por qué mercado pago descartado

- escala b2c-first, mejor para ecommerce minorista. itera no es ecommerce.
- documentación inferior, ecosistema sdk menos maduro.
- sin stripe tax equivalent.
- sin un solo país objetivo dominante (audiencia es latam pan-regional), MP no aporta ventaja local fuerte.
- stripe ya soporta pagos desde latam con cards locales para b2c residual si llegara.

## consecuencias operativas

| área | impacto |
|---|---|
| copy de pricing | siempre en USD, sin "$X MXN" ni equivalentes |
| stripe products | un solo precio por tier, en USD |
| webhook handling | un solo endpoint stripe, no dos rails |
| invoice templates | USD único, sin conversión |
| ar/ap report | USD único, sin fx adjustments mensuales |
| onboarding flow | sin selector de país-moneda |
| compliance | stripe tax cubre US, EU; latam sin tax automatizado por ahora |

## cuándo reabrir

solo si ocurre **una** de estas:

- pablo decide pivotar de b2b corporativo a b2c retail latam con volumen significativo (≥1k transacciones individuales/mes).
- itera entra en un país con prohibición regulatoria de cobrar en USD a empresas locales (improbable).
- stripe sale de un país clave de itera (descontinuación regional).

en cualquier otro caso, **no reabrir**. responder *"stripe-only, USD, MP descartado — ver `decision_cfo_stripe_only_usd_mp_descartado.md`"*.

## historial

- pre-2026-04-24: claude propuso varias veces dual-rail latam. cada propuesta fue rechazada.
- 2026-04-24: pablo formaliza rol CFO. decisión sale de memoria personal de claude y entra al repo como canónica.
