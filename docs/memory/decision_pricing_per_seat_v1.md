# Decisión de pricing — per-seat v1

**Fecha:** 2026-07-02 (reemplaza el modelo de fases/sprint del 2026-05-18).
**Decisión de Pablo** (AskUserQuestion durante el plan de lanzamiento): el pricing
público de Itera es **per-seat mensual/anual**, no el paquete de fases de $4-8K.

## Modelo vigente

Fuente única en código: `lib/simulador/billing.ts` → `SIMULADOR_TIERS`.

| Tier          | Personas | USD/persona/mes | Self-serve |
|---------------|----------|-----------------|------------|
| Team          | 1–19     | $149            | sí         |
| Business      | 20–49    | $129            | sí         |
| Business+     | 50–99    | $109            | sí         |
| Enterprise    | 100+     | $89 (floor)     | no (contacto) |

- **Anual:** se cobran 10 meses y se entregan 12 (`YEARLY_MONTHS_BILLED`); el decir
  comercial es "2 meses gratis" (~17% off).
- **Cobro:** USD vía Stripe. Renovación automática. Cancelación al fin del período
  pagado (mantiene acceso hasta la fecha; no corta sesiones en curso).
- **Reembolso:** primeros 7 días del primer cobro.

## Qué se retiró

- `SPRINT_META.pricing` (fase_1/fase_2 $4-8K/$8-15K) en `lib/simulador/config.ts` — el
  bloque describía el modelo viejo y contradecía el precio real. Retirado en F5.
- La landing (`components/simulador/LandingPage.tsx` §precio) ahora renderiza los tiers
  reales de `SIMULADOR_TIERS`.
- El TOS (`lib/simulador/copy/legal.ts` §2, §4, §6) reescrito al modelo per-seat.

## Regla

El pricing vive SOLO en `billing.ts`. Cualquier superficie que muestre precio importa de
ahí — nunca hardcodear cifras de precio en copy/landing/legal. Ver
[[decision_mercado_pago_muerto]] (solo Stripe).
