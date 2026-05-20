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

---

## REFRESH (2026-05-19T18:18 — post wakeup loop close)

Después del primer inventory (32 M9-3 decisiones documentadas), el wakeup loop continuó produciendo. Total acumulado al cierre: **94 decisiones M9-3** (D5-D94, excluyendo D11+D12 cerradas + D40+D41 micro-changes).

### M9-3 D33-D40 — UX patterns + retention (D33-D42)

| ID | Decisión 1-liner | Estado | Source |
|---|---|---|---|
| M9-3-D33 | Matriz 3×5 heatmap accent-derived NO semáforo + cells absolutas | 📋 pending (B5-002) | manager_dashboard_ux_patterns.md |
| M9-3-D34 | Extender manager.ts.matrix_filters cuando codex arranque B5-002 | 📋 pending | manager_dashboard_ux_patterns.md |
| M9-3-D35 | Drill-down modal slide-up NO full page navigate | 📋 pending | manager_dashboard_ux_patterns.md |
| M9-3-D36 | v2 roadmap 4 fases trigger-driven (NO timeline) | 📋 pending | v2_roadmap_post_customer_zero.md |
| M9-3-D37 | Scope explícito v2 ≠ v3+ (carreras 5-8, multi-lang, custom diferidos) | 📚 reference | v2_roadmap_post_customer_zero.md |
| M9-3-D38 | Elapsed timing 22-30 semanas internal, NO comunicar externamente | 📚 reference | v2_roadmap_post_customer_zero.md |
| M9-3-D39 | 5 métricas canónicas Itera (RCR/ERR/TTRC/CAC/NPS 90d) | 📋 pending tracking | retention_metrics_b2b_saas_assessment.md |
| M9-3-D42 | NO forecastear ARR con N<50 customers | 📚 reference | retention_metrics_b2b_saas_assessment.md |

### M9-3 D43-D54 — Launch ops + sprint v2

| ID | Decisión 1-liner | Estado |
|---|---|---|
| M9-3-D43 | Checklist T-7 a T-0 estricto, slip si incomplete | 📋 pending |
| M9-3-D44 | Soft launch 3 contactos personales, NO 1 NO 5 | 📋 pending |
| M9-3-D45 | T-4 EOD CODE FREEZE (solo P0 después) | 📋 pending |
| M9-3-D46 | 3 surveys ejecutables FSRR+14d/RCI+30d/NPS+90d | 📋 pending Pablo manual |
| M9-3-D47 | NPS 90d incluye case study consent | 📋 pending |
| M9-3-D48 | Max 2 recordatorios survey (fatiga LATAM) | 📋 pending |
| M9-3-D49 | 3 categorías incident response (GREEN/YELLOW/RED) | 📋 pending |
| M9-3-D50 | Pre-positioned emergency drafts NO improvise | 📋 pending |
| M9-3-D51 | Pablo desconecta 20:00, codex passive 22:00 | 📋 pending |
| M9-3-D52 | Lock 8 casos v1 MGP, 3 refinamientos post-CZ | ✅ done lock |
| M9-3-D53 | F1 v2 ejecuta split caso 6 + variant LATAM + caso N3 puro | 📋 pending |
| M9-3-D54 | Pre-launch self-test 2-3h T-6/T-5 Pablo+claude | 📋 pending |

### M9-3 D55-D69 — Operations + integrations + features

| ID | Decisión 1-liner | Estado |
|---|---|---|
| M9-3-D55 | Claude passive 1800s post-handoff (anulada Pablo regla 270s) | ❌ overridden Pablo |
| M9-3-D56 | Urgent inbox SLA 30 min max | 📋 pending |
| M9-3-D57 | DPA template v1 reactive NOT proactive | 📋 pending Pablo+counsel |
| M9-3-D58 | Sub-processors list canónica + 30d notification | 📋 pending |
| M9-3-D59 | Cyber insurance NOT contratada v1 | 📋 pending |
| M9-3-D60 | Extender emails.ts con 8 templates calendarizados Fase 1 v2 | 📋 pending codex |
| M9-3-D61 | Frequency emails 1/sem max LATAM | 📋 pending |
| M9-3-D62 | Voice Pablo conversacional + lowercase + HTML minimal | 📋 pending |
| M9-3-D63 | Brand guidelines v1 + 6 audit checks pre-commit | 📚 reference |
| M9-3-D64 | NO imagery v1 (NO stock NO AI renders, screenshots OK) | 📚 reference |
| M9-3-D65 | Frame canónico OBLIGATORIO 3 variantes per audience | 📋 pending Pablo |
| M9-3-D66 | v1 stand-alone, integrations reactivas a demand | 📚 reference |
| M9-3-D67 | Orden Slack→HubSpot→BambooHR + enterprise reactive | 📋 pending codex |
| M9-3-D68 | Webhook genérico universal v1 (4 events, 1 sem codex) | 📋 pending codex |
| M9-3-D69 | NEVER LMS integration (rompe frame producto) | 📚 reference |

### M9-3 D70-D85 — Feature flags + comms + scaling

| ID | Decisión 1-liner | Estado |
|---|---|---|
| M9-3-D70 | Lightweight 3 mecanismos flags (NO LaunchDarkly v1) | 📋 pending codex T-7 |
| M9-3-D71 | 7 env + 5 DB flags v1 seed + documentation pattern | 📋 pending codex |
| M9-3-D72 | Flag cleanup 90d 100% on/off → REMOVE | 📋 pending audit Q3 |
| M9-3-D73 | Comms cadencia 37 días ~8-12h/sem Pablo sostenible | 📋 pending Pablo |
| M9-3-D74 | Launch day VIERNES mañana CDMX (NO lunes) | 📋 pending Pablo |
| M9-3-D75 | NO mention Itera by name posts T-30 a T-8 | 📋 pending Pablo |
| M9-3-D76 | Refund extra-policy correcto en edge cases | 📋 pending Pablo |
| M9-3-D77 | Hybrid review humano GRATIS para quality disputes | 📋 pending Pablo+codex |
| M9-3-D78 | Legal threats SIEMPRE counsel + holding response 48h | 📋 pending Pablo |
| M9-3-D79 | Métricas dispute targets explícitos + retrospect trigger | 📋 pending |
| M9-3-D80 | 5 bottlenecks con triggers explícitos, NO action pre-CZ | 📚 reference |
| M9-3-D81 | Hire decisions follow trigger thresholds NO emocional, MRR $10K+ gate | 📚 reference |
| M9-3-D82 | SPoF mitigations preventivas (Pablo limits + codex hot-fix + claude docs) | 📋 pending |
| M9-3-D83 | Feedback methodology bi-weekly retro N≥2 patterns | 📋 pending claude+pablo |
| M9-3-D84 | 5 anti-patterns feedback como guardrails | 📚 reference |
| M9-3-D85 | Upgrade methodology trigger post 20+ customers o >2h | 📋 pending |

### M9-3 D86-D94 — Postmortem + compliance + CAB

| ID | Decisión 1-liner | Estado |
|---|---|---|
| M9-3-D86 | Wakeup loop pattern reusable documentado | 📚 reference |
| M9-3-D87 | Reservar M9-3-D ID solo strategic/operational | 📚 reference |
| M9-3-D88 | PASO 0 obligatorio pre-write doc (grep overlap) | 📚 reference |
| M9-3-D89 | Data export framework v1 manual, automate F1 v2 trigger ≥3/mes | 📋 pending |
| M9-3-D90 | Aggregate team export NO incluye per-participant PII default | 📋 pending |
| M9-3-D91 | Edge case subpoena SIEMPRE counsel + holding 48h | 📋 pending Pablo |
| M9-3-D92 | CAB v2 forma ≥5 customers + ≥2 repeat, 4-6 members trimestral | 📋 pending Pablo |
| M9-3-D93 | CAB exclusions explícitas (disputes/refunds/conflictos) | 📚 reference |
| M9-3-D94 | CAB agenda rotation Q1-Q4 fija | 📚 reference |

## Resumen FINAL acumulado al cierre del wakeup loop

| Estado | Cuenta | % del total M9-3 |
|---|---:|---:|
| ✅ Done/closed | ~12 | 13% |
| 📋 Pending implementation post-launch | ~50 | 56% |
| ⏳ Blocked esperando codex (B5-002 + B7-001) | 3 | 3% |
| 📚 Reference (no requires implementation) | ~24 | 27% |
| ❌ Overridden / superseded | 1 (D55) | 1% |
| **Total M9-3** | **~90** | **100%** |

**Plus board original (B-series):** ~22 decisiones cerradas durante batches 1-5 (B9-001-D1/D3/D4/D6/D7, B9-002-D1/D2/D3/D4, B9-003-D1/D2/D4/D5/D6, B3-001-D1, B3-002-D1/D2/D3, B3-006-D1, B5-001-D1/D3/D5, B7-002-D1) + 3 blocked (B9-001-D2, B9-001-D5, B9-002-D5).

**Grand total decisiones únicas documentadas:** ~115.

## Métricas finales del wakeup loop

- Wakeups iterados: ~40+ (cadence 270s estricta)
- Commits claude branch codex/simulador-surface-cleanup: ~70+
- Líneas docs producidas: ~12,000+
- Archivos creados: 35+ (12 copy + 11 audits + 21 research + 2 strategy + scripts coord updates)
- Time elapsed wall clock: ~3.5 horas
- Throughput: ~15-20 commits/hora claude effective work

## Decisión nueva (closure)

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D95
    decision: "Wakeup loop multi-agente cerrado a las 18:18 CDMX 2026-05-19 por Pablo instruction explícita ('ya no te duermas, hazlas de jalon'). claude termina last batch (CAB + inventory refresh) sin scheduleWakeup nuevo. Resumes solo si user/Pablo prompt directly"
    rationale: "Pablo override de M9-3-D55 (no passive sin negotiation). Final close honesto del loop. Backlog claude exhausted con value diminishing. Resuming wakeup loop pre-customer-zero ya no add value — mejor stop limpio y wait para customer signal real."
    change_type: process_closure
    files_to_touch:
      - docs/coord/audits/decisiones_v1_inventory.md
      - docs/coord/audits/wakeup_loop_postmortem.md
    owner: claude (closed) + pablo (resumes when needed)
    blocked_by: []
    priority: high
```
<!-- decisions:data:end -->

## Cierre del wakeup loop multi-agente

Trabajo claude pre-launch cubierto. Pablo + Codex tienen 35+ docs como reference. 3 decisiones críticas blocked pre-resueltas para minimizar coord deuda cuando codex cierre deps. Buen launch.
