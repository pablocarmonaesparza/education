---
type: strategy
title: v2 roadmap post customer-zero — consolidación 17 decisiones triggered
date: 2026-05-19
author: claude
reviewers: [pablo, codex]
status: published
scope: roadmap ejecutable v2 que consolida todas las decisiones M9-3 (+ algunas board) que disparan después de cerrar primeros 5 customers de v1. Define orden + dependencias + métricas de transición v1→v2
related:
  - docs/coord/audits/decisiones_v1_inventory.md (SoT pre-launch)
  - docs/strategy/v1_launch_playbook.md
  - docs/research/* (8 research docs como specs)
---

# v2 roadmap post customer-zero

## TL;DR

Después de cerrar 5 customers v1 (Marketing/Growth Diagnóstico/Sprint $4-15K en MX+CO), Itera entra en **v2**. Este doc consolida las 17 decisiones M9-3 que estaban "pending implementation post-launch" en un roadmap ejecutable con orden + dependencias.

**Estructura v2 (4 fases, ~6 meses elapsed):**

| Fase | Trigger | Duración estimada | Foco |
|---|---|---|---|
| **F1** Post-customer-zero validate | 5 customers cerrados | 4-6 semanas | Validate pricing + Sentry + matrix 3×5 + first expansion ask |
| **F2** Sales carrera launch | F1 done + Sales ask explícita | 6-8 semanas | Build Sales casos + scale ops 5+ orgs |
| **F3** CS + Ops add-ons | F2 done | 8-10 semanas | Expand to 3 carreras simultáneas |
| **F4** Pricing + judge optimization | F3 done | 4-6 semanas | Pricing upgrade + Sonnet 4.5 migration + observability mature |

**Total elapsed estimado:** ~22-30 semanas (5-7 meses) desde primer customer hasta v2 maduro.

## Fase 1 — Post-customer-zero validate (4-6 semanas)

### Trigger

≥5 customers v1 cerrados + ≥30 días de uso en producción.

### Decisiones que disparan F1

| ID | Acción | Owner | Dependencies |
|---|---|---|---|
| M9-3-D2 | Implementar matriz 3×5 manager dashboard (B5-002) | codex | strings ya en manager.ts |
| M9-3-D3 | Activar Sentry o equivalente observability | codex | DevOps work |
| M9-3-D5 | Revisar lock pricing v1 (decisión upgrade o mantener) | claude + pablo | métricas customer-zero |
| M9-3-D19 | Métricas tracking explícito en HANDOFF.md weekly | pablo | already established v1 |
| M9-3-D20 | Cablear copy files Tier 1 (auth + errors + legal) | codex | strings ya en lib/simulador/copy/ |
| M9-3-D14 | Validar landing.hero con customer feedback real | claude | survey customers |
| M9-3-D16 | Lock final copy o iterate based en learnings | claude | survey customers |

### Métricas de cierre F1

| Métrica | Target verde |
|---|---|
| Customers v1 onboarded sin bugs críticos | ≥4 de 5 |
| Sentry/observability activo + 0 alerts críticos no atendidos | ✓ |
| Matrix 3×5 visible en producción | ✓ |
| Survey customer-zero respondido por ≥3 customers | ✓ |
| Pricing decisión tomada (mantener o upgrade) documentada | ✓ |

### Riesgos F1

- **Bug crítico en matrix 3×5 affects manager dashboard**: rollback al v0 dashboard hasta fix
- **Customer cancela pre-30 días**: investigate root cause (producto vs ops vs expectativas)
- **Sentry no detecta error real que customer reporta**: blind spot, fix con custom alerts

## Fase 2 — Sales carrera launch (6-8 semanas)

### Trigger

F1 done + **≥1 customer pide Sales sin push proactivo** (M9-3-D25 condition).

### Decisiones que disparan F2

| ID | Acción | Owner | Dependencies |
|---|---|---|---|
| M9-3-D25 | Confirmar demand Sales con ≥1 customer ask | pablo | F1 customer interaction |
| M9-3-D26 | Build Sales casos (4 primary + 4 resim + 8 practice beats) | claude (specs) | research depth Sales |
| M9-3-D27 | Hold quality bar — 5-6 semanas dedicadas a Sales carrera | claude + codex | no parallel carreras |
| M9-3-D8 | Limit operacional: aún 3 calls/día max | pablo | scaling concern |
| M9-3-D23 | Considerar agregar 2 events v2 catálogo (output_used_without_attribution + decision_under_undisclosed_ai_assistance) | claude (specs) + codex (migración) | trade-off entre Sales casos vs catálogo expansion |

### Métricas de cierre F2

| Métrica | Target verde |
|---|---|
| Sales casos seedeados en BD (4 primary + 4 resim) | ✓ |
| ≥1 customer Sales cerrado | ≥1 |
| Sales onboarding wizard funciona sin bugs | ✓ |
| MGP customers no se rompen al agregar Sales | ✓ regression test |
| Pablo capacity sostenible (no >5 calls/sem) | ✓ |

### Riesgos F2

- **Sales casos shallow**: si rushamos sin research depth, pierde el wedge "diagnóstico operativo no certificación"
- **Pablo overwhelmed**: limit operational (3 calls/día) ya saturado en F1. F2 puede requerir hire o contractor.
- **MGP retention drops por focus en Sales**: balance attention

## Fase 3 — CS + Ops add-ons (8-10 semanas)

### Trigger

F2 done + **≥3 customers Sales cerrados** + **≥1 pide CS o Ops**.

### Decisiones que disparan F3

| ID | Acción | Owner | Dependencies |
|---|---|---|---|
| M9-3-D26 | Build CS casos (4 primary) según orden roadmap expansion | claude | research depth CS |
| M9-3-D26 | Build Ops casos (4 primary) según orden roadmap | claude | research depth Ops (cambia buyer a COO) |
| M9-3-D32 | Refresh decisiones_v1_inventory con states actualizados | claude | bookkeeping |
| M9-3-D9 | Q3 competitive pulse review (si timing aligna agosto 2026) | claude | Q3 2026-08-19 |

### Métricas de cierre F3

| Métrica | Target verde |
|---|---|
| CS casos en producción | ✓ |
| Ops casos en producción | ✓ |
| ≥10 customers total (5 MGP + 3 Sales + 2 CS/Ops mix) | ≥10 |
| Refund rate sostenido ≤5% | ✓ |
| LATAM win rate sostenido ≥30% | ✓ |

### Riesgos F3

- **Sin operational capacity**: 3 carreras simultáneas active requiere staff additional (Pablo no scale)
- **Catálogo casos shallow**: si producimos casos genéricos para llenar enum, perdemos wedge
- **Customer expectations diverge**: Sales/CS/Ops buyers tienen distinto perfil que MGP — onboarding flow puede necesitar branching

## Fase 4 — Pricing + judge optimization (4-6 semanas)

### Trigger

F3 done + ≥10 customers total + signal qualitative "esperaba pagar más" en ≥3 customer conversations.

### Decisiones que disparan F4

| ID | Acción | Owner | Dependencies |
|---|---|---|---|
| M9-3-D6 | Pricing upgrade: Sprint +20%, Track +25% | claude (decision) + codex (Stripe update) | qualitative signal |
| M9-3-D29 | Migration evaluation: Opus → Sonnet 4.5 si accuracy diff <2% en LATAM | claude (analysis) + codex (run experiment) | ≥50 field-tests data |
| M9-3-D23 | Implementar 2 risk events v2 (output_used_without_attribution + decision_under_undisclosed_ai_assistance) | claude + codex | catálogo expansion |
| M9-3-D24 | Evaluar split jerárquico universal vs career-specific | claude | only if confusion emerges |
| M9-3-D30 | Anti-sandbagging behavioral signatures (solo si evidencia pattern emerge) | codex | trigger condition |

### Métricas de cierre F4

| Métrica | Target verde |
|---|---|
| Pricing upgraded sin customer churn | ≥90% retention pre-upgrade customers |
| Sonnet 4.5 migration if applicable | accuracy maintained ±2% |
| 2 nuevos risk events disparando en production | ≥5 hits combined en primeros 30 días |
| Compliance LATAM mature (DPA si requested) | ≥1 customer enterprise DPA cerrado |

### Riesgos F4

- **Pricing upgrade aliena customers**: legacy pricing lock evita esto pero customer perceives as bait-and-switch
- **Sonnet accuracy drop in LATAM**: rollback automático con feature flag si calibration set fails
- **Risk events v2 son redundantes**: si los 2 nuevos no disparan en 30+ días, deprecate

## Decisiones que NO entran en v2 (deferred a v3+)

| ID | Razón |
|---|---|
| M9-3-D24 | Split jerárquico universal/career-specific — solo si ≥3 carreras activas confusion. Aún no. |
| Carreras 5-8 (HR/Legal/Product/Engineering) | Solo si demand explícita post F3. Por defecto post-12 meses. |
| Field-test public para todas las carreras | v3 — actualmente solo Marketing/Growth field-test público |
| Multi-language (English) | v3 — primer enterprise contract con English speakers triggers |
| Custom cases bespoke per customer | v4 — high-touch ops capacity required |

## Cronograma indicativo

```
T+0 (primer customer cerrado)
│
├─── F1 (4-6 semanas) → T+6w
│    └ matrix 3×5 + Sentry + pricing review + copy Tier 1 cabling
│
├─── F2 (6-8 semanas) → T+14w
│    └ Sales casos + risk events v2 decisión
│
├─── F3 (8-10 semanas) → T+24w
│    └ CS + Ops casos + 10 customers total
│
└─── F4 (4-6 semanas) → T+30w (~7 meses)
     └ Pricing upgrade + Sonnet 4.5 + risk events v2 prod
```

## Cómo cada Fase afecta los 3 surfaces clave

### Landing public

- **F1**: validate hero copy con customer feedback (M9-3-D14)
- **F2**: agregar Sales mention (cuidado de no atomizar mensaje)
- **F3**: hero copy puede agregar tagline "Marketing · Sales · CS · Ops"
- **F4**: pricing tier update visible

### Dashboard manager

- **F1**: matriz 3×5 live (B5-002 close → M9-3-D2)
- **F2**: split por carrera (manager con MGP + Sales ve filter por carrera)
- **F3**: cohort comparison cross-carrera
- **F4**: percentile vs benchmark LATAM (post 50+ customers data)

### Onboarding wizard

- **F1**: tier copy hybrid (sales-assisted CTA visible)
- **F2**: department options expanded
- **F3**: industry-specific case recommendation
- **F4**: pricing transparent con upgrade messaging

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D36
    decision: "v2 roadmap es 4 fases secuenciales con triggers explícitos (NO timeline-driven). F1 post-customer-zero validate, F2 Sales launch demand-driven, F3 CS+Ops expansion, F4 pricing+judge optimization"
    rationale: "Triggers por evento (customer cerrado, ask explícita) > triggers por tiempo (semana N). Producto v1 puede tardar más de lo esperado en cerrar 5 customers; forzar timeline lleva a shipping shallow. Fases secuenciales mantienen quality bar."
    change_type: roadmap
    files_to_touch:
      - docs/strategy/v2_roadmap_post_customer_zero.md
    owner: claude
    blocked_by:
      - 5_customers_v1
    priority: normal

  - id: M9-3-D37
    decision: "v2 explícitamente NO incluye: split jerárquico catálogo (D24), carreras 5-8 (HR/Legal/Product/Eng), field-test multi-carrera, multi-language EN, custom cases bespoke. Estos son v3+"
    rationale: "Defer items requires explicit deferral, not silent forgetting. v2 está focused en MGP + Sales + CS + Ops + pricing optimization. Más items expand scope sin signal — anti-pattern."
    change_type: scope_explicit
    files_to_touch:
      - docs/strategy/v2_roadmap_post_customer_zero.md
    owner: claude
    blocked_by: []
    priority: low

  - id: M9-3-D38
    decision: "v2 elapsed estimado 22-30 semanas (5-7 meses) desde primer customer. NO comunicar este timing externamente — es trabajo internal. Externamente: 'estamos building cuidadosamente'"
    rationale: "Customers no quieren ver Gantt charts internos. Mostrar timeline puede generar expectativa que rompemos si delay. Internal planning > external promise."
    change_type: comms_strategy
    files_to_touch:
      - docs/strategy/v2_roadmap_post_customer_zero.md
    owner: pablo
    blocked_by: []
    priority: normal
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato (v1 launch):** este roadmap es referencia. NO afecta v1.
2. **Cuando 1er customer cierra:** start tracking F1 triggers en HANDOFF.md.
3. **Cuando 5 customers cierran:** F1 oficialmente arranca. Pablo revisa este doc.
4. **Refresh trimestral:** Q3/Q4 2026 actualizar con learnings reales.
