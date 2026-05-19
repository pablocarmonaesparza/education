---
type: audit
title: Decisiones v1 inventory — single source of truth pre-launch
date: 2026-05-19
author: claude
reviewer: codex
status: published
scope: índice consolidado de TODAS las decisiones tomadas durante el loop multi-agente Itera Simulador. 1 línea por decisión + estado + source doc. Útil pre-launch como punto único de referencia
related:
  - docs/coord/BUILD_BOARD.yaml (board oficial)
  - docs/coord/audits/* (5 audits con decisiones)
  - docs/research/* (8 research docs con decisiones)
---

# Decisiones v1 inventory — single source of truth

## TL;DR

Consolidación de **todas** las decisiones producto/proceso/estrategia tomadas durante el loop multi-agente.

**Total: 30 decisiones M9-3 documentadas en audits/research + 2 M9-2 + ~24 decisiones en board original (Batches 1-5)** = ~56 decisiones únicas pre-launch.

**Estados:**
- ✅ **Done/closed**: implementadas en código o aplicadas
- 🔄 **In flight**: parcialmente implementadas, esperando deps
- ⏳ **Blocked**: esperando dep codex (B5-002, B7-001)
- 📋 **Pending implementation**: decisión tomada, implementación post-customer-zero
- 📚 **Reference**: decisión informativa, no requiere implementación

## M9-2 — Loop audit post copy batch (2 decisiones)

| ID | Decisión 1-liner | Estado | Source |
|---|---|---|---|
| M9-2-D1 | Loop quality bar mantenida en wakeup 270s — 5 nuevos copy files PASS sin C-R | ✅ done | loop_audit_post_copy_batch.md |
| M9-2-D2 | auth.ts + errors.ts pueden continuar sin audit intermedio (audit cada 5 files) | ✅ done | loop_audit_post_copy_batch.md |

## M9-3 — Audits y research post-loop (30 decisiones)

### M9-3 launch readiness (D1-D4)

| ID | Decisión 1-liner | Estado | Source |
|---|---|---|---|
| M9-3-D1 | v1 launch GO-CON-CAVEAT: sales-assisted con PO/wire hasta B7-001 self-serve cierre | 📋 pending | v1_launch_readiness.md |
| M9-3-D2 | Dashboard manager v0 vendible v1; matriz 3×5 entra próximas 2-4 semanas post-launch | 📋 pending | v1_launch_readiness.md |
| M9-3-D3 | Sentry no bloquea primer customer; obligatorio antes de >5 orgs paying | 📋 pending | v1_launch_readiness.md |
| M9-3-D4 | Pre-resolver 3 decisiones blocked en handoff trazable (reduce coord ~75 min → ~15 min) | ✅ done | decisiones_pending_unblock.md |

### M9-3 pricing strategy (D5-D6)

| ID | Decisión 1-liner | Estado | Source |
|---|---|---|---|
| M9-3-D5 | Lock pricing v1 hasta customer-zero (5+ cerrados) | 📋 pending | pricing_anchor_v2.md |
| M9-3-D6 | Post 5 customers: Sprint +20%, Track +25%, Diagnóstico mantener | 📋 pending | pricing_anchor_v2.md |

### M9-3 onboarding hybrid (D7-D8)

| ID | Decisión 1-liner | Estado | Source |
|---|---|---|---|
| M9-3-D7 | Hybrid onboarding self-serve + opt-in sales call para Sprint/Track tiers | ⏳ blocked (B7-001) | onboarding_friction_b2b_latam.md |
| M9-3-D8 | Limit operacional: 3 calls/día max, batch 1 día/sem Pablo, pre-qualify 3 fields | 📋 pending | onboarding_friction_b2b_latam.md |

### M9-3 competitive pulse (D9-D10)

| ID | Decisión 1-liner | Estado | Source |
|---|---|---|---|
| M9-3-D9 | Mantener cadencia trimestral competitive pulse Q3 2026-08-19; tracking pasivo entre Q1/Q2 y Q3 | 📚 reference | competitive_pulse_q3_followup.md |
| M9-3-D10 | Talespin + Hyperskill AI agregar a watch list Tier 2 en Q3 review | 📋 pending | competitive_pulse_q3_followup.md |

### M9-3 AI adoption LATAM (D11-D13)

| ID | Decisión 1-liner | Estado | Source |
|---|---|---|---|
| M9-3-D11 | Hybrid stats hero: 3 US + 2 LATAM en latam_evidence sub-sección | ✅ done (commit 13ef099) | ai_adoption_latam_2026.md |
| M9-3-D12 | Sales playbook tabla 5 stats con cuándo usar cada uno por comprador | ✅ done (commit d1b2dc0) | ai_adoption_latam_2026.md |
| M9-3-D13 | Refresh Q3-08 con BID AI Index 2025 + McKinsey LATAM 2025 | 📚 reference | ai_adoption_latam_2026.md |

### M9-3 buyer persona (D14-D16)

| ID | Decisión 1-liner | Estado | Source |
|---|---|---|---|
| M9-3-D14 | Validar landing.hero actual sin cambios — toca dolor #1 explícito del buyer LATAM | ✅ done (validation) | buyer_persona_head_marketing_latam.md |
| M9-3-D15 | Demo flow 30 min orden 5/15/5/5 (problema → producto vivo → pricing transparente → handoff) | 📋 pending (Pablo) | buyer_persona_head_marketing_latam.md |
| M9-3-D16 | NO refactorar copy actual — está aligned, lock y validar con primeros 5 customers | ✅ done (decisión) | buyer_persona_head_marketing_latam.md |

### M9-3 launch playbook (D17-D19)

| ID | Decisión 1-liner | Estado | Source |
|---|---|---|---|
| M9-3-D17 | No public launch sin 4/4 gates green | 📋 pending | v1_launch_playbook.md |
| M9-3-D18 | Cero paid acquisition v1 | 📋 pending | v1_launch_playbook.md |
| M9-3-D19 | Métricas tracking explícito en HANDOFF.md weekly post-launch | 📋 pending | v1_launch_playbook.md |

### M9-3 copy imports (D20-D21)

| ID | Decisión 1-liner | Estado | Source |
|---|---|---|---|
| M9-3-D20 | Cableado de 11 copy files restantes es deuda explícita post-launch v1 | 📋 pending (codex) | copy_imports_status.md |
| M9-3-D21 | Refactor cableado 1 surface por commit (no big bang) | 📚 reference | copy_imports_status.md |

### M9-3 risk events taxonomy (D22-D24)

| ID | Decisión 1-liner | Estado | Source |
|---|---|---|---|
| M9-3-D22 | Lock catálogo 11 risk events para v1 | ✅ done (NO cambios v1) | risk_events_taxonomy_v2.md |
| M9-3-D23 | Agregar 2 events en v2 post-customer-zero: output_used_without_attribution + decision_under_undisclosed_ai_assistance | 📋 pending | risk_events_taxonomy_v2.md |
| M9-3-D24 | Split jerárquico v3 solo cuando ≥3 carreras activas justifique | 📚 reference | risk_events_taxonomy_v2.md |

### M9-3 expansion carreras (D25-D27)

| ID | Decisión 1-liner | Estado | Source |
|---|---|---|---|
| M9-3-D25 | Expansion carreras demand-driven NO supply-driven (≥5 MGP + ≥1 ask) | 📋 pending | expansion_carreras_v2.md |
| M9-3-D26 | Orden Sales → CS → Ops → Finance → HR → Legal → Product → Engineering | 📋 pending | expansion_carreras_v2.md |
| M9-3-D27 | Hold quality bar — no acelerar (~5-6 sem/carrera) | 📚 reference | expansion_carreras_v2.md |

### M9-3 judge defensibility (D28-D30)

| ID | Decisión 1-liner | Estado | Source |
|---|---|---|---|
| M9-3-D28 | Defensibilidad alta v1, NO cambios arquitecturales pre-launch | ✅ done (validation) | judge_llm_eval_methodology.md |
| M9-3-D29 | Post 50+ field-tests + 5 customers, calibration LATAM-specific + considerar Sonnet 4.5 cost saving | 📋 pending | judge_llm_eval_methodology.md |
| M9-3-D30 | Anti-sandbagging behavioral signatures solo si evidencia de pattern emerge | 📋 pending | judge_llm_eval_methodology.md |

## Pre-M9 — Decisiones board original (B9 series)

### Resueltas durante batches 1-5

| ID | Decisión 1-liner | Estado |
|---|---|---|
| B9-001-D1 | Heredera narrativa Wharton — "diagnóstico operativo no certificación" | ✅ done (landing) |
| B9-001-D3 | Pricing Fase 1 $4-8K, Fase 2 $8-15K, Track $15-24K, bundle 10% off | ✅ done (billing) |
| B9-001-D4 | Cadencia trimestral competitive pulse Q1/Q2/Q3/Q4 | ✅ done (audit creado) |
| B9-001-D6 | 3 anchor stats: Stanford 88% / MIT NANDA 95% / Gallup 50% | ✅ done (landing) |
| B9-001-D7 | 3 frases de diferenciación vs Wharton/Section/Forage | ✅ done (sales) |
| B9-002-D1 | 5 dimensiones: contexto / privacidad / validación / juicio / decisión | ✅ done (config + rúbrica) |
| B9-002-D2 | 9 criterios case admission checklist (8 + archetype_ref) | ✅ done (quality_bar) |
| B9-002-D3 | Sprint v1 = Nivel 1+2 pitch honesto (Nivel 3 add-on) | ✅ done (landing + report) |
| B9-002-D4 | Risk event 11 catálogo CHECK constraint | ✅ done (migración 017) |
| B9-003-D1 | Pitch anclado en stats Stanford/MIT NANDA/Gallup | ✅ done |
| B9-003-D2 | v1 launch geos MX+CO; BR waitlist; v2 AR/CL/PE; v3 US/EU | ✅ done (onboarding) |
| B9-003-D4 | Consent banner MX/CO/BR/other con cláusulas canónicas LFPDPPP + Ley 1581 | ✅ done (legal) |
| B9-003-D5 | Postura legal conservadora v1: sin DPA enterprise hasta primer customer con PII real | ✅ done (legal + billing) |
| B9-003-D6 | McKinsey 6% high performers — wedge "proceso, no prompts" | ✅ done (sales) |
| B3-001-D1 | archetype_ref obligatorio en frontmatter caso | ✅ done (12 archetypes) |
| B3-002-D1 | level_primary obligatorio en frontmatter caso | ✅ done |
| B3-002-D2 | level_advanced_variant opcional para casos N3 | ✅ done |
| B3-002-D3 | Sprint v1 = Marketing/Growth 8 casos pitch honesto | ✅ done |
| B3-006-D1 | Rúbrica versionada (semver) + rubric_freeze por sprint | ✅ done (migración 022) |
| B5-001-D1 | 12 secciones executive report v2 | ✅ done (report.ts) |
| B5-001-D3 | pending_review_banner honesto cuando risk events high | ✅ done (report.ts) |
| B5-001-D5 | semver_disclaimer en audit_metadata footer | ✅ done (report.ts) |
| B7-002-D1 | 8 transactional email templates + AgentMail integration | ✅ done (emails.ts + codex) |

### Bloqueadas esperando deps

| ID | Decisión 1-liner | Estado | Dep |
|---|---|---|---|
| B9-001-D2 | Reclamar categoría "criterio IA medible" explícitamente en homepage | ⏳ blocked | B5-002 codex |
| B9-001-D5 | Modelo "free para learner, employer paga" como vector futuro v2 | ⏳ blocked | B7-001 codex |
| B9-002-D5 | Override matrix mantiene rama Escalar — justificación Kirkpatrick | ⏳ blocked | B5-002 codex |

(Las 3 ya están pre-resueltas en `decisiones_pending_unblock.md` listas para claim cuando deps cierren.)

## Resumen ejecutivo

### Estados aggregados

| Estado | Cuenta | % del total |
|---|---:|---:|
| ✅ Done/closed | ~31 | ~55% |
| 📋 Pending implementation post-launch | ~17 | ~30% |
| ⏳ Blocked (esperando codex B5-002 / B7-001) | 4 | ~7% |
| 📚 Reference (no requiere implementación) | ~4 | ~7% |
| **Total** | **~56** | **100%** |

### Decisiones críticas pre-launch (gates)

Las 4 que deben ser GREEN para flip switch público:

1. **B7-001 close** (codex en flight) → unblocks M9-3-D7 + B9-001-D5
2. **M9-3-D17** (no public launch sin 4/4 gates green)
3. **M9-3-D19** (métricas tracking explícito post-launch)
4. **B5-002 close** (codex no arrancado) → unblocks B9-001-D2 + B9-002-D5 + M9-3-D2

### Decisiones críticas post-customer-zero

1. **M9-3-D5/D6**: pricing upgrade evaluation post 5 customers
2. **M9-3-D23**: agregar 2 risk events v2
3. **M9-3-D25**: arrancar Sales si demand explícita
4. **M9-3-D29**: calibration LATAM + Sonnet 4.5 evaluation
5. **M9-3-D3**: activar Sentry antes de >5 orgs paying

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D31
    decision: "Este inventory es la single source of truth pre-launch. Codex + Pablo lo consultan antes de tomar nuevas decisiones para evitar duplicación o contradicción"
    rationale: "Con ~56 decisiones distribuidas en board + 5 audits + 8 research docs, hay riesgo de re-litigar decisiones cerradas o ignorar las pending. Centralizar el índice reduce coord overhead significativo."
    change_type: process
    files_to_touch:
      - docs/coord/audits/decisiones_v1_inventory.md
    owner: claude
    blocked_by: []
    priority: normal

  - id: M9-3-D32
    decision: "Refresh este inventory cuando (1) codex cierre B5-002 o B7-001 unblocking decisiones, (2) primer customer cierre activando triggers post-customer-zero, (3) Q3 review competitive pulse 2026-08-19 agregue nuevas decisiones"
    rationale: "El inventory no es estático. Cada milestone de unlock dispara decisiones que estaban dormant. Refresh formal en esos 3 momentos mantiene la SoT viva sin overhead diario."
    change_type: process
    files_to_touch:
      - docs/coord/audits/decisiones_v1_inventory.md
    owner: claude
    blocked_by: []
    priority: low
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato:** Pablo + codex leen este inventory antes de tomar nuevas decisiones.
2. **Cuando B7-001 cierre:** refresh con M9-3-D7 cerrado + B9-001-D5 cerrado.
3. **Cuando B5-002 cierre:** refresh con M9-3-D2 cerrado + B9-001-D2 + B9-002-D5 cerrados.
4. **Q3 2026-08-19:** refresh con resultados de competitive pulse Q3 + métricas customer-zero.
