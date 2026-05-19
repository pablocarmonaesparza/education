---
type: research
title: Scaling constraints v1 — bottlenecks identificados post-customer-zero
date: 2026-05-19
author: claude
reviewers: [pablo, codex]
status: published
scope: identifica bottlenecks operacionales + técnicos que aparecen entre customer-zero (1er customer) y customer 50+. Anticipa qué romper primero + triggers explícitos para mitigation. NO es pánico — es planning realistic
related:
  - docs/strategy/v1_launch_playbook.md (M9-3-D8 limit 3 calls/día Pablo)
  - docs/strategy/v2_roadmap_post_customer_zero.md (4 fases triggers)
  - docs/research/judge_llm_eval_methodology.md (judge cost considerations)
  - docs/research/buyer_persona_head_marketing_latam.md
---

# Scaling constraints v1 — bottlenecks identificados

## TL;DR

Itera Simulador v1 es **architecture single-threaded** (1 Pablo + 1 codex + claude wakeup loop). Esto funciona hasta ~5-10 customers paralelos. Después de eso, hay bottlenecks específicos que romper primero — pero NO requiere panic.

**5 bottlenecks identificados**, en orden de severidad:

1. **Pablo single-threaded sales** (límite ~3 calls/día max) — rompe a ~10 demos/sem
2. **Judge LLM cost per session** (~$0.30 Opus) — manageable hasta 100+ sessions/mes
3. **Human review queue** (Pablo + codex review risk events high) — rompe a 5+ disputes/sem
4. **Support response time** (Pablo <12h target) — rompe a >10 inbound/día
5. **Codex bandwidth** (single eng = bottleneck features + bugs + integrations) — rompe a 20+ org concurrent

**Mitigation strategies** documentados con triggers explícitos. Hire contractor humano OR shift Pablo focus son las 2 palancas principales.

## Bottleneck 1: Pablo single-threaded sales

### Estado actual

- Demo flow 5/15/5/5 = 30 min per call (M9-3-D15)
- Limit operacional 3 calls/día max (M9-3-D8)
- Calendly o equivalent gestiona scheduling
- Total capacity: 15 calls/semana max (3/día × 5 días)

### Cuándo rompe

| Demo requests/semana | Status | Acción |
|---|---|---|
| ≤10 | OK | sostenible Pablo solo |
| 11-15 | warning | priorize qualified leads, defer others |
| 16-20 | yellow | considera contractor sales junior |
| >20 | red | hire dedicated sales (full-time o contractor 20h/sem) |

### Triggers mitigation

**Trigger 1:** 3 semanas consecutivas con ≥15 demo requests → empieza sales hire process.

**Trigger 2:** ≥30% no-show rate en demos (Pablo capacity wasted) → pre-qualify form más strict.

**Trigger 3:** Pablo reporta >40h/sem sales work → defer features OR delegate.

### Mitigation options ranked

1. **Pre-qualify form** (low effort) — 3 fields antes de agendar Calendly (M9-3-D8). Filters noise.
2. **Async demo recording** (medium effort) — video 20 min Pablo explica producto + Calendly only para qualified ≥$8K opportunity.
3. **Sales contractor part-time** (20h/sem) — un sales junior LATAM que toma calls qualified. Cost ~$1.5-3K USD/mes.
4. **Sales full-time hire** (40h/sem) — cuando MRR justifique ($10K+/mes). Cost ~$3-6K USD/mes LATAM mid-market.

**Recommendation:** Pre-qualify form (Trigger 1 → 16-20 demos/sem trigger) es first lever. Hire viene cuando MRR justifique.

## Bottleneck 2: Judge LLM cost per session

### Estado actual

- Judge LLM: Opus 4.5 (default) o Sonnet 4.5 (cuando migrate M9-3-D29)
- Per session cost (estimado):
  - Opus: ~$0.30 USD/session (prompt + output + override matrix calls)
  - Sonnet: ~$0.05 USD/session (5-7x cheaper)
- Average sessions per customer: 5-50 participantes × 1 session = 5-50 sessions/contract

### Cuándo rompe

| Total sessions/mes | Cost/mes Opus | Cost/mes Sonnet |
|---|---|---|
| 100 (~5 customers Diagnóstico) | $30 USD | $5 USD |
| 500 (~10 customers Sprint) | $150 USD | $25 USD |
| 2000 (~50 customers Sprint mixed) | $600 USD | $100 USD |
| 5000+ (~100 customers) | $1500+ USD | $250 USD |

**Margin analysis:**
- Diagnóstico $4-8K contract × ~10 sessions avg = $400-800 revenue/session
- Judge cost Opus $0.30 = 0.04-0.08% of revenue/session
- **Marginal cost is trivial relative to revenue** v1 scale

### Cuándo importa

Cost importa cuando:
1. Volume ≥5000 sessions/mes ($1500+ Opus) — Sonnet migration M9-3-D29 ahorra ~5-7x
2. Anthropic precing changes (~unlikely <12 meses)
3. Field-test público volume explodes (free sessions consume judge sin revenue)

### Triggers mitigation

**Trigger 1:** Field-test volume >200 sessions/mes → consider rate limit on field-test endpoint o capacity throttle.

**Trigger 2:** Judge cost >2% of monthly revenue → migrate to Sonnet (M9-3-D29).

**Trigger 3:** Calibration set indica Sonnet performance ±2% Opus en LATAM cases → migrate (post-customer-zero data needed).

### Mitigation options

1. **Sonnet migration** (M9-3-D29 trigger conditional) — 5-7x cost reduction si accuracy OK
2. **Caching judge outputs** for identical inputs (rare in practice) — minor savings
3. **Throttling field-test** (`NEXT_PUBLIC_FEATURE_FIELD_TEST_PUBLIC` flag M9-3-D71) si capacity issue
4. **Tier-gated N3 case access** — N3 con agentes cost más (chained LLM calls); restringir a Track tier only

**Recommendation:** NO action v1. Cost manageable. Trigger thresholds set para action when relevant.

## Bottleneck 3: Human review queue (risk events high)

### Estado actual

- Risk events high disparan `simulador.human_review_queue` (codex B4-003)
- Pablo + codex review queue antes de publicar reports
- Estimated time per review: ~30-45 min (read transcript + verify evidence + sign-off)

### Cuándo rompe

| Risk high events/semana | Pablo + codex time | Status |
|---|---|---|
| 1-3 | 30-90 min/sem | OK |
| 4-7 | 2-5 horas/sem | warning |
| 8-15 | 4-10 horas/sem | yellow — drena other work |
| >15 | >10 horas/sem | red — block release/features |

### Triggers mitigation

**Trigger 1:** ≥2 risk events high per customer per week → review rúbrica calibration (es lying detector activado de más?).

**Trigger 2:** ≥10 risk events high/semana cumulative → hire contractor for review tier 1 triage.

**Trigger 3:** Specific risk event type aparece 50+ times sin acción taken → flag para deprecate o re-calibrate.

### Mitigation options

1. **Tier 1 contractor triage** (~$20-30 USD/hora LATAM) — reads transcript + flags si needs Pablo escalation. Reduces Pablo time 60-70%.
2. **LLM-assisted pre-review** (Sonnet) — second LLM categorizes risk events por confidence. High confidence auto-pass, low confidence escalate. Effort 2-3 weeks codex.
3. **Rúbrica refinement** — if false positives accumulate, tighten thresholds (B3-006 rubric_freeze allows versioned)

**Recommendation:** v1 manual Pablo + codex. Trigger 2 (≥10/sem) activates contractor hire.

## Bottleneck 4: Support response time

### Estado actual

- Target <12h response (M9-3-D19)
- Pablo + claude assist for templates
- 2 inboxes: ventas@itera.la + soporte@itera.la

### Cuándo rompe

| Inbound emails/día | Status | Pablo time/día |
|---|---|---|
| 1-5 | OK | 30-60 min |
| 6-10 | warning | 1-2 horas |
| 11-20 | yellow | 2-4 horas |
| >20 | red | >4 horas — fagocita features work |

### Triggers mitigation

**Trigger 1:** 3 días consecutivos con >10 inbound/día → activate help desk tool (Front, HelpScout, etc.).

**Trigger 2:** Support work >30% Pablo time → hire contractor support junior.

**Trigger 3:** Same question asked ≥5 times/semana → write FAQ public o internal canned response.

### Mitigation options

1. **Canned responses** (free) — 10-15 pre-positioned templates para common questions. Pablo customizes lightly. Reduces 50-70% response time.
2. **Help desk tool** (~$15-30 USD/mes per user) — Front o HelpScout reduces switching costs. Trigger at ≥5 inbound/día consistently.
3. **Contractor support junior** (~$15-20 USD/hora LATAM) — handles tier 1 questions, escalates to Pablo. Trigger at >10 inbound/día consistently.
4. **Public FAQ /support page** — captures asked questions, reduces inbound 20-40%.

**Recommendation:** Trigger 1 (>10/día consistent) activates Front/HelpScout. Pre-positioned drafts (M9-3-D50) already in launch_day_runbook.

## Bottleneck 5: Codex bandwidth

### Estado actual

- Codex single-threaded technical work (engineering + DevOps + integrations + bug fixes)
- B7-001 currently in flight (sales-assisted PO/wire bridge until close)
- Roadmap heavy post-customer-zero (F1: matrix 3×5 + Sentry + copy Tier 1 cabling)

### Cuándo rompe

Codex bandwidth becomes bottleneck when 3+ concurrent priorities exist:
1. Bug fixes P0/P1 from production
2. Features build (F1/F2/F3 v2 roadmap)
3. Integrations (Slack/HubSpot reactive)
4. DPA + compliance work (per customer)
5. Maintenance (Vercel/Supabase/Stripe upgrades)

| Concurrent priorities | Status |
|---|---|
| 1-2 | OK — sustainable |
| 3-4 | warning — context switching cost |
| 5+ | red — drop priorities or hire |

### Triggers mitigation

**Trigger 1:** P0 bug exists + F1/F2 feature work in flight → drop F1/F2, fix P0 first (always).

**Trigger 2:** ≥3 customer-specific custom requests in queue → reject some o hire second eng.

**Trigger 3:** Codex reports >50h/sem work consistently → hire second eng or contractor.

### Mitigation options

1. **Strict priority queue** — P0 bugs > production stability > F1 v2 > integrations > custom. Pablo decides priority.
2. **Contractor eng part-time** (~$30-50 USD/hora LATAM senior, 20h/sem) — handles integrations + maintenance. Costo ~$2.4-4K USD/mes.
3. **Full-time hire** (~$4-8K USD/mes LATAM senior) — when MRR justifies + multi-thread work sustained.
4. **Defer integrations** (M9-3-D67 reactive) — wait until customer demand explicit.

**Recommendation:** Trigger 3 (Codex >50h/sem 4+ semanas) activates contractor eng. Pre-customer-zero NO hire.

## Cost summary (when triggers activate)

| Mitigation | Effort/Cost | Likelihood needed | Timing |
|---|---|---|---|
| Pre-qualify form | 1 día codex | Alta (≥15 demos/sem fast) | F1 v2 |
| Sales contractor part-time | $1.5-3K/mes | Media (≥20 demos/sem sustained) | F2-F3 v2 |
| Sales full-time hire | $3-6K/mes | Baja (MRR $10K+/mes) | F4+ v2 |
| Sonnet migration | 1-2 semanas codex | Alta (cost o capacity trigger) | F4 v2 |
| Tier 1 review contractor | $20-30/hora | Media (≥10 risk events high/sem) | F2-F3 v2 |
| Front/HelpScout | $15-30/mes | Media (>10 inbound/día sustained) | F2 v2 |
| Support contractor | $15-20/hora LATAM | Media-baja (>20 inbound/día) | F3+ v2 |
| Contractor eng | $2.4-4K/mes | Media (Codex >50h/sem) | F3 v2 |
| Full-time eng hire | $4-8K/mes | Baja (multi-thread sustained) | F4+ v2 |

**Total potential operating cost mitigation:** ~$8-20K USD/mes if all triggers activate (unlikely simultaneous).

## Single-threaded risks identificados

### Risk 1: Pablo burnout (high severity)

Single-threaded sales + comms + decisions + customer success = >60h/sem possible. Burnout = launch fail.

**Mitigation:** strict M9-3-D8 limit (3 calls/día max) + M9-3-D51 (Pablo desconecta 20:00) + delegate aggressively when triggers fire.

### Risk 2: Codex single-point-of-failure (medium severity)

If codex unavailable (vacation, illness), no eng coverage for P0 bugs.

**Mitigation:**
- v1: Pablo can hot-fix simple bugs (he wrote much of v1 code originally)
- v2: contractor eng even part-time provides redundancy
- v3: full-time second eng = no SPoF

### Risk 3: Claude wakeup loop dependency (low-medium)

Claude wakeup loop produced 80+ decisions + 30+ docs. If wakeup infrastructure breaks o context lost, momentum stops.

**Mitigation:**
- All decisions documented en repo (not in claude memory only)
- Pablo + codex can resume work sin claude (handoff_summary covers everything)
- Periodic refresh decisions_v1_inventory.md (M9-3-D32 trigger conditions)

### Risk 4: Architecture choice lock-in (low severity v1)

Supabase + Anthropic + Vercel + Stripe stack locked. Migration costly if vendor changes pricing dramatically.

**Mitigation:**
- v1 stack mainstream (low vendor risk)
- Multi-cloud architecture v3+ if scale justifies
- Vendor relationships are commodity at our scale (<$1K/mes spend)

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D80
    decision: "5 bottlenecks identificados con triggers + mitigation explícitos. NO action pre-customer-zero. Cada trigger activate independientemente cuando data real signal. Pablo decisión final en hire vs delegate vs defer"
    rationale: "Sin triggers explícitos, scaling discussion drift. Definir thresholds objetivos (≥10 demos/sem, ≥10 risk events high/sem, >50h codex/sem) permite reactive decision-making sin panic. Pre-customer-zero data is hypothetical."
    change_type: scaling_planning
    files_to_touch:
      - docs/research/scaling_constraints_v1.md
    owner: pablo + claude (trigger monitoring)
    blocked_by: []
    priority: normal

  - id: M9-3-D81
    decision: "Hire decisions follow trigger thresholds, NO emocional. Sales contractor first (cheapest + clearest signal). Codex contractor only post 4+ semanas sustained >50h/sem. Full-time hires gated por MRR $10K+/mes"
    rationale: "Premature hiring drena cash sin justification. Anchored a trigger thresholds prevents emotional decisions. MRR $10K+/mes = ~5-10 customers Sprint cerrados — significant signal."
    change_type: hire_strategy
    files_to_touch:
      - docs/research/scaling_constraints_v1.md
    owner: pablo
    blocked_by: []
    priority: normal

  - id: M9-3-D82
    decision: "Single-point-of-failure risks: Pablo burnout (high) + codex coverage (medium). Pre-customer-zero mitigations: strict daily limits + M9-3-D51 desconexión 20:00 + Pablo hot-fix capability for emergencies. Post-customer-zero: contractor coverage como redundancy"
    rationale: "Single-threaded architecture trabaja v1 (<10 customers) pero SPoF risks acumulan. Pablo burnout es highest-severity — launch fail if Pablo crashes. Mitigations preventivos > reactivos."
    change_type: risk_mitigation
    files_to_touch:
      - docs/research/scaling_constraints_v1.md
    owner: pablo + codex
    blocked_by: []
    priority: high
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Pre-customer-zero:** este doc es planning. NO acción inmediata.
2. **Post-customer-zero:** track métricas signal por bottleneck (demos/sem, risk events/sem, codex hours, inbound/día).
3. **F1 v2:** activate pre-qualify form si demos/sem ≥15.
4. **F2-F3 v2:** evaluate hire triggers según sustained data.
5. **F4 v2:** Sonnet migration evaluation (M9-3-D29).
