---
type: strategy
title: Pricing tiers v1 — Sprint Fase 1 + Fase 2
task_id: B9-001-D3
date: 2026-05-19
authors: [claude]
reviewers: [codex]
status: active
applies_to:
  - lib/simulador/copy/landing.ts.pricing
  - lib/simulador/copy/sales.ts.objections
  - lib/stripe/syncFromSession.ts (codex implementa)
  - app/(onboarding)/onboarding/billing/page.tsx (codex implementa)
---

# Pricing tiers v1 — Itera Sprint

## TL;DR

Itera v1 cobra **por sprint**, no por seat. Dos fases:

| Tier | Rango USD | Personas | Duración | Deliverables |
|---|---|---|---|---|
| **Fase 1** Diagnóstico | $4,000–$8,000 | 5–50 | 30 días | 8 casos · reportes individuales · dashboard manager · recomendaciones (pilotar/entrenar/pausar/escalar) |
| **Fase 2** Práctica + Re-sim | $8,000–$15,000 | 5–50 | 60-90 días | 20 practice beats + 16 variantes re-sim · transfer delta · histórico longitudinal · alertas Slack/email |

Bundle `Fase 1 + Fase 2 (continuous)` con 10% descuento total: $10,800–$20,700.

## Cálculo per-seat resultante (referencia interna, no público)

| Cohorte | Fase 1 USD | Per-seat | Fase 2 USD | Per-seat |
|---|---|---|---|---|
| 5 personas | $4,000 | $800 | $8,000 | $1,600 |
| 10 personas | $4,500 | $450 | $9,000 | $900 |
| 20 personas | $5,500 | $275 | $10,500 | $525 |
| 30 personas | $6,500 | $217 | $12,500 | $417 |
| 50 personas | $8,000 | $160 | $15,000 | $300 |

Per-seat baja con cohorte porque overhead operacional (judge LLM calls, dashboards, manager dispatch) escala sub-linealmente. El comprador ve **pricing por sprint** transparente; el per-seat es derivado.

## Anchors competitivos validados

| Competidor | Pricing público/leaked | Per-seat range | Idioma | Itera vs |
|---|---|---|---|---|
| Section AI Premium (individuos) | $62.50/mo × 12 = $750/year | $750/year | English | Itera para 50 ppl = $160-300/year vs $750. 2.5x-4.7x más eficiente. |
| Section AI Teams (small <1000 ppl) | Custom quote, mercado estimado $750-1500/seat/year | $750-1500 | English | Itera completamente fuera del rango anglo. Mid-market LATAM lane. |
| Whatfix Mirror (enterprise) | $31K-300K/year (Vendr/Guidde data) | $30-300/seat estimated | English | Whatfix enterprise scale. Itera mid-market 100-300 ppl. |
| Attensi (enterprise) | Quote-based, estimado $20-80/seat/year | $20-80 | EN/NO/DE/SE | Attensi compite por volumen frontline. Itera no es frontline. |
| Forage (employer-paid sims) | $60-150K/year por sim custom | n/a (custom) | English | Forage es career discovery. Itera post-hire upskilling. Diferente funnel. |

**Posición Itera:** premium accesible para mid-market LATAM. Más caro que Attensi (más subtle), más barato que Section AI (más targeted), single payment vs subscription (más simple para comprador first-time).

## Justificación del rango (no es arbitrario)

### Por qué $4,000 mínimo Fase 1

- 5 personas × 1 caso completo × judge LLM (Anthropic ~$2-4 per session) = $10-20 LLM cost
- Manager dispatch + dashboard + reports = ~$50-100 dev cost amortizado
- Sales touch (discovery call + scope + handoff) = 2-3 hours × $200/hr = $400-600
- Floor económico: $1,000-1,500 cost. $4,000 deja margen ~70% para reinversión + escala.
- Floor psicológico: <$4,000 se ve "demasiado barato para tomarme en serio" en B2B mid-market. $4,000 está debajo del threshold de procurement comité ($5K+ corporate) pero arriba del threshold de "trivial".

### Por qué $8,000 máximo Fase 1 (50 personas)

- 50 personas × judge LLM ≈ $100-200 cost
- Dashboard agregado + matrix N1×N2 + cohort benchmarks = mismo dev cost
- Per-seat $160 está debajo de Section AI Premium ($750) por 4.7x — defensible "premium accesible LATAM"
- Techo psicológico: <$10K sin procurement enterprise en mid-market LATAM 100-300 ppl

### Por qué $8K-15K Fase 2

- 30 practice beats × 20 personas × 2-3 intentos = ~$200-500 LLM cost (judge en re-sim también)
- Build de 16 variantes re-sim + transfer delta + histórico longitudinal = mayor lift técnico amortizado
- Mayor valor entregado (transfer delta = Kirkpatrick L3 evidencia, no solo L2 readiness)
- 2x del rango Fase 1 refleja 2x del valor

## Pricing transparencia (B9-001-D3 racionalizado)

Itera publica el rango en landing (`lib/simulador/copy/landing.ts.pricing`). El competidor más cercano (Section AI) publica $62.50/mo individuos pero esconde teams. Itera transparente = wedge competitivo en mid-market LATAM (alérgico al "request demo").

**Excepción:** cotización exacta requiere discovery call de 30 min (¿cuántas personas? ¿qué team? ¿Fase 1 sola o Bundle?). La transparencia es del **rango**, no del precio final cerrado.

## Add-on Nivel 3 (variantes advanced)

Casos 6 (attribution_reporting) y 8 (crisis_response) tienen `level_advanced_variant: 3`. Para equipos que ya operan IA agentic, módulo opcional:

- Sólo accesible con Fase 1 o Fase 2 contratada
- $1,500 add-on (no separable)
- Activa las 2 variantes N3 + practice beats N3 (v2 expansion)

**Decisión:** mantener simple en v1 — solo Fase 1 / Fase 2 / Bundle. Add-on N3 vive en pricing page con "consulta" hasta tener 3+ design partners reales pidiéndolo.

## Stripe wiring (owner: codex)

Codex implementa:

1. **3 Stripe Products:**
   - `itera_fase_1_diagnostico` con tiered pricing por cohorte (price metadata: `cohort_size`)
   - `itera_fase_2_practica_resim`
   - `itera_bundle_fase_1_2` (10% off)

2. **Onboarding flow `/onboarding/billing`:**
   - Form: cohort size (5/10/20/30/50) + sprint type (Fase 1 / Fase 2 / Bundle)
   - Stripe Checkout B2B con company tax ID + invoice via Stripe Tax
   - Webhook → `subscriptions` table + Sprint activation

3. **`lib/stripe/syncFromSession.ts`:**
   - Lee Stripe session metadata
   - Activa sprint correspondiente para `simulador.organizations`
   - Asigna seats al team

## Refund + cancellation policy

Cancelación antes de iniciar Sprint (no há sessions started) → reembolso 100% menos $200 transaction fee.
Cancelación después de iniciar Sprint → no reembolso (sprint en curso, no rollback de evidencia).
Cancelación de renewal automático Bundle → respetada para próximo ciclo.

## Decisiones producto (derivadas)

<!-- decisions:data:start -->
```yaml
decisions:
  - id: B9-001-D3-S1
    decision: "Stripe wiring 3 products + tiered pricing por cohort_size en checkout"
    rationale: "Pricing por sprint NO por seat permite checkout simple sin sales-led negotiation para deals <$8K. Tiered por cohort_size mantiene transparencia del rango."
    change_type: schema
    files_to_touch:
      - lib/stripe/syncFromSession.ts
      - app/(onboarding)/onboarding/billing/page.tsx
      - supabase/migrations/0XX_stripe_products.sql
    owner: codex
    blocked_by:
      - B7-001
    priority: high

  - id: B9-001-D3-S2
    decision: "Add-on Nivel 3 diferido a v2 con 'consulta' hasta tener 3+ design partners pidiéndolo"
    rationale: "v1 simple = Fase 1 / Fase 2 / Bundle. Add-on N3 confunde la conversación comercial. Solo agregar cuando hay demanda validada."
    change_type: process
    files_to_touch:
      - lib/simulador/copy/landing.ts
      - lib/simulador/copy/sales.ts
    owner: claude
    blocked_by: []
```
<!-- decisions:data:end -->
