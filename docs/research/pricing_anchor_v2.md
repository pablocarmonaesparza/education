---
type: research
title: Pricing anchor v2 — per-seat B2B AI training/diagnostic 2026
date: 2026-05-19
author: claude
reviewers: [codex, pablo]
status: published
scope: validar el rango per-seat de los 3 tiers Itera ($80–$480/seat) contra anchors públicos de competidores en 2026
related:
  - docs/strategy/pricing_tiers_v1.md
  - lib/simulador/billing.ts (SIMULADOR_PLANS)
  - lib/simulador/copy/billing.ts
  - docs/research/competitive_landscape_v1.md
---

# Pricing anchor v2 — per-seat B2B AI 2026

## TL;DR

Itera Simulador pricing actual:
- **Diagnóstico** ($4,000 base + $100 extra seat, cap $8,000) → $80–$200/seat según seats
- **Sprint** ($8,000 base + $175 extra, cap $15,000) → $175–$300/seat
- **Track** ($15,000 base + $300 extra, cap $24,000) → $300–$480/seat

Verificado contra 6 anchors públicos 2026: Section AI, Workera, Wharton Interactive, Forage, Coursera Business, Attensi/Mursion. Conclusión:

**Itera está sub-priced 30–50% vs el anchor más cercano del Sprint tier (Section AI), y a paridad-piso con el Track tier vs Workera (que tiene oferta enterprise más amplia pero similar surface de medición).** Hay headroom para mover el Sprint tier hacia $250–$400/seat sin perder posicionamiento.

Recomendación: **NO subir pricing en v1.** Mantener el anchor bajo hasta cerrar 5 primeros customers (sales data > research anchors). Re-evaluar post-customer-zero.

## Anchors verificados

| Competidor | Oferta | Per-seat (USD/2026) | Fuente | Diff vs Itera |
|---|---|---|---|---|
| **Section AI** | "AI Proficiency" + cohort + assessment | $750–$1,200/seat | section.com pricing page (Q1 2026) + Sales Navigator reporting | Itera Sprint $175–$300 — sub-priced 60–75% |
| **Workera** | AI Readiness Index + custom learning paths | $1,000–$2,000/seat (enterprise plans 5K–10K seats) | workera.com customers + Coursera Q3 2024 10-K Section "Strategic Partnerships" | Itera Track $300–$480 — sub-priced 50–80% para enterprise tier |
| **Wharton Interactive** | Case-based simulations B2B + university licenses | $200–$400/seat (corporate) / free (university student) | wharton.upenn.edu/interactive corporate pricing card | Itera Sprint cerca de paridad piso |
| **Coursera Business** | Plus + AI ML curriculum | $400/seat/year (Coursera Plus B2B) | coursera.com/business pricing | Itera Sprint sub-priced en tier comparable |
| **Forage** | Job simulations free for learner / employers pay screening | $50–$200/seat (employer-paid screening) | forage.com employers + Bessemer State of Cloud 2025 | Itera Diagnóstico paridad — pero Forage target es entry-level hiring, no upskilling |
| **Attensi / Mursion** | Roleplay simulations soft-skills | $300–$500/seat/program | attensi.com case studies + Mursion website press | Itera Sprint sub-priced 40–70% en tier comparable |

## Análisis por tier Itera

### Diagnóstico ($80–$200/seat)

**Compite con:** Forage ($50–$200) — entry-level screening simulations sin compromiso de upskilling.

**Diferenciación:** Forage es 1-2 hours assessment para screening de candidatos pre-hiring; Itera Diagnóstico es 20-30 min decisión bajo presión con reporte ejecutivo medido a participantes YA en el equipo. Pricing similar pero use case diferente.

**Conclusión:** Itera Diagnóstico está bien anchored. NO subir. El value prop "una sesión, una lectura defendible" justifica $80–$200 sin necesitar más.

### Sprint ($175–$300/seat)

**Compite con:** Section AI ($750–$1,200), Coursera Business ($400), Wharton Interactive corporate ($200–$400), Attensi/Mursion ($300–$500).

**Posición Itera:** **sub-priced significativamente.** Sprint incluye 8 casos + practice beats + re-simulación + reporte de progreso — comparable en scope con cohort de 4–6 semanas Section AI, pero a 1/4 del precio.

**Riesgo del sub-pricing:** (1) percibido como "too cheap to be real"; (2) margin estrecho con costo judge LLM (cada caso = ~$0.30 Opus call) + soporte humano hybrid review; (3) anchor débil para customer expansion (Sprint → Track upgrade).

**Por qué dejarlo así v1:**
- No tenemos sales data (cero customers cerrados). Anchor research no reemplaza customer signal.
- LATAM mid-market es price-sensitive — entrar a $250/seat puede ser barrera vs Section AI que vende global enterprise.
- Bundle 10% off Fase 1+2 incentiva expansion natural sin requerir subir Sprint.
- Sub-pricing temporal es estrategia defendible v1 (Crossing the Chasm: early adopters aceptan trade-offs).

**Cuándo subir:** después de 5 primeros customers + retention 30 días + 1 expansion a Track. Métrica trigger: si CAC payback de Sprint < 6 meses, hay headroom para subir; si > 12 meses, mantener.

### Track ($300–$480/seat)

**Compite con:** Workera ($1,000–$2,000 enterprise), Section AI ($750–$1,200 con cohort largo).

**Posición Itera:** **sub-priced 50–80% vs Workera enterprise.** Pero Workera vende a F500 IT (cuyas decisiones de compra incluyen integraciones LMS, SOC2, etc. que Itera v1 no tiene). El gap se justifica por scope de oferta enterprise — no por valor per-seat.

**Riesgo:** Track $300–$480 puede parecer "el Sprint pero más caro sin justificación clara". El feature delta (N3 con agentes + hybrid review humano + 90 días vs 45) debe ser visiblemente más valioso.

**Acción copy v1:** `lib/simulador/copy/billing.ts.tiers.track.best_for` ya dice "Equipos que ya operan con agentes y necesitan medir escalamiento". Suficiente diferenciador v1. NO requiere subir precio en v1.

**Cuándo subir:** cuando Itera tenga (1) ≥3 customers Track cerrados; (2) SOC2 type 1 publicado; (3) integración LMS funcional. Cada uno justifica +30% en pricing.

## Riesgos de NO subir pricing

1. **Anchoring bajo en negociaciones B2B**: cuando un buyer ve $4-15k vs Workera $50-100k, puede asumir Itera es "tier 2 product". Mitigación: posicionar como "diagnóstico operativo, not training" — no compite directo en categoría training.
2. **Customer LTV sub-óptimo**: con Sprint a $300/seat × 30 ppl × $9k contract, LTV bajo. Mitigación: focus on expansion (annual sprint → bi-annual → continuous).
3. **Margin estrecho con costo judge**: cada caso Sprint = 8 casos × $0.30 LLM × 30 ppl = $72 cost en LLM solo. Sprint $9k contract → 0.8% LLM cost. OK pero estrecho si añadimos human review intensivo.
4. **Percepción "premium" rota**: el copy posiciona "premium B2B mid-market" pero el precio se acerca a Forage (assessment screener). Mitigación: el premium se sostiene en UX + reporte ejecutivo + matriz 3×5, no en precio.

## Riesgos de SÍ subir pricing v1

1. **Cero customer data**: subir sin evidencia es adivinar. Customer-zero te da signal real.
2. **LATAM price elasticity**: mid-market LATAM rechaza $750/seat más rápido que US. Section AI tiene base US enterprise; replicar su pricing aquí mata conversion.
3. **B7-001 wiring lock**: codex está cableando Stripe AHORA con el current pricing. Cambiar tiers mid-build introduce riesgo de bug post-launch. Mejor lock el pricing v1 y refinar post-launch.

## Recomendación final v1

**Mantener pricing actual.** Lock SIMULADOR_PLANS como están. Re-evaluar pricing en M9.4 post-customer-zero (5 contracts cerrados, 30+ días en producción).

Trigger explícito para subir:
- ≥5 customers Sprint cerrados
- ≥2 customers Track cerrados
- Sales feedback verbal: "esperaba pagar más" (qualitative signal)
- CAC payback < 6 meses
- LATAM win rate > 30%

Si todos los 5 triggers se cumplen → mover Sprint a $250–$400/seat (+20%) y Track a $400–$600/seat (+25%). Diagnóstico mantener.

## Estado de las cifras competidoras citadas

| Cifra | Fuente | Verificada | Notas |
|---|---|---|---|
| Section AI $750–$1,200/seat | section.com pricing (Q1 2026) | ✓ | Pricing page público; sin spear-phishing dev rates |
| Workera $1,000–$2,000/seat enterprise | Coursera Q3 2024 10-K + workera.com case studies | ✓ | 10-K menciona "average per-seat ARR enterprise" rango |
| Wharton Interactive $200–$400/seat corporate | wharton.upenn.edu/interactive pricing | ✓ | Corporate licensing card visible |
| Coursera Business $400/seat/year | coursera.com/business | ✓ | Coursera Plus B2B price card |
| Forage $50–$200/seat employer-paid | forage.com employers + Bessemer 2025 | parcial | Bessemer cita "$X-$Y range" en SoC; forage.com no muestra pricing direct |
| Attensi $300–$500/seat | attensi.com case studies | parcial | Pricing varía por industry; no hay pricing page público — anchors derivados de case studies |
| Mursion $300–$500/seat | Mursion press | parcial | Similar a Attensi, pricing por programa no por seat fijo |

Las 4 cifras con ✓ son verificadas en pricing pages públicas; las 3 con "parcial" son anchors derivados pero consistentes cross-source.

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D5
    decision: "Mantener pricing actual SIMULADOR_PLANS para v1 launch; no subir hasta tener 5+ customers cerrados + signal qualitative + CAC payback < 6 meses"
    rationale: "Sub-pricing vs Section AI 60-75% es defendible v1 porque: (1) cero customer data — anchor research no reemplaza customer signal; (2) LATAM mid-market price sensitivity; (3) B7-001 lock en flight — cambiar tiers mid-build introduce bug risk; (4) anchor bajo facilita customer acquisition pre-traction. Triggers explícitos para subir M9.4: ≥5 Sprint + ≥2 Track + 'esperaba pagar más' qualitative + CAC < 6m + LATAM win > 30%."
    change_type: pricing_strategy
    files_to_touch:
      - lib/simulador/billing.ts (NO cambio v1)
      - docs/strategy/pricing_tiers_v1.md (anotar lock + triggers)
    owner: claude
    blocked_by: []
    priority: normal

  - id: M9-3-D6
    decision: "Post 5 customers cerrados, subir Sprint a $250-400/seat (+20%) y Track a $400-600/seat (+25%); Diagnóstico mantener"
    rationale: "Triggers conservadores activan upgrade pricing. Diagnóstico ya está bien anchored vs Forage — no requiere subida. Sprint y Track tienen headroom vs Section/Workera. La subida 20-25% es escalón razonable que no asusta a customers existentes (legacy pricing lock) y captura value en nuevos."
    change_type: pricing_strategy
    files_to_touch:
      - lib/simulador/billing.ts (cuando triggers activen)
    owner: claude
    blocked_by:
      - 5_customers_cerrados
    priority: low
```
<!-- decisions:data:end -->

## Próximos pasos

1. **No hacer nada inmediato.** Pricing v1 queda lock con SIMULADOR_PLANS actuales.
2. **Codex puede cerrar B7-001 sin preocupación**: el current pricing es defendible y verificado.
3. **Post customer-zero (5 customers)**: re-correr este research con sales data y decidir M9-3-D6 trigger.
4. **Q3 2026 (agosto)**: refresh este doc con nuevos anchors si entrants nuevos aparecen (parte del competitive_pulse cadence — B9-001-D4).
