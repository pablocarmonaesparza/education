---
type: research
title: Feedback loop methodology — cómo procesar feedback de primeros 5 customers
date: 2026-05-19
author: claude
reviewers: [pablo, codex]
status: published
scope: define cómo Pablo + claude procesan feedback de los primeros 5 customers para iterate roadmap sin sobre-reactionar a single-customer signals. Anti-pattern: pivot por cada customer ask. Pro-pattern: pattern recognition cross-customers
related:
  - docs/research/post_customer_zero_survey_template.md (3 surveys ejecutables)
  - docs/research/retention_metrics_b2b_saas_assessment.md (5 métricas canónicas)
  - docs/strategy/v2_roadmap_post_customer_zero.md (4 fases roadmap)
  - docs/research/dispute_resolution_playbook.md (handling negative feedback)
---

# Feedback loop methodology — primeros 5 customers

## TL;DR

Cuando primeros 5 customers cierren, llega cascade de feedback (surveys + emails + Pablo calls + risk events). Sin metodología, hay 3 anti-patterns peligrosos:

1. **Pivot por cada customer ask** — feature creep destruye coherencia producto
2. **Ignore feedback "porque es solo 1 customer"** — pierde signal real
3. **Process emocional sin documentación** — patterns no emergen

**Methodology propuesta:** triage + categorize + identify patterns N≥2 + decide acción explícita en HANDOFF.md. Pablo + claude colaborativos.

**Output target:** cada 2 semanas durante customer-zero phase, un "feedback retro" doc que destila signal real → 1-3 decisiones accionables OR explicit "no action, signal weak".

## Por qué este loop importa

Los primeros 5 customers son **statistical small sample** pero **directional signal alto**. ChartMogul 2024: 70% de B2B SaaS startups fallaron en customer-zero phase por una de 3 razones:

1. **Premature scaling** (sin signal, hire/build/launch fast)
2. **Insufficient iteration** (signal recibido pero ignored or under-weighted)
3. **Wrong customer selection** (Bull's-eye target hit pero signal extrapolated indebidamente)

Feedback loop methodology aborda los 3 — categoriza signal + identifies patterns + decide accionable.

## Sources de feedback (donde escuchar)

| Source | Frequency | Audience | Method |
|---|---|---|---|
| **Survey FSRR +14d** (M9-3-D46) | per customer post-sprint | manager | Google Form |
| **Survey RCI +30d** (M9-3-D46) | per customer post-sprint | manager | Google Form |
| **Survey NPS +90d** (M9-3-D41) | per customer post-sprint | manager | Google Form |
| **Demo call notes** | per sales call | prospects + customers | Pablo log en HANDOFF.md |
| **Sales-assisted calls** | per high-touch onboarding | enterprise customers | Pablo log |
| **Inbound emails ventas@** | daily | mixed (leads + customers) | Pablo triage |
| **Inbound emails soporte@** | daily | customers + participantes | Pablo triage |
| **LinkedIn comments + DMs** | daily | broad public + leads | Pablo respond |
| **Quality disputes** (M9-3-D77) | reactive | customers | hybrid review humano |
| **NPS detractor follow-up** (M9-3-D41) | per NPS <7 | customers | Pablo 1:1 call |
| **Risk events high in production** | reactive | system signal | codex + claude review |
| **Behavior events analytics** (M9-3-D40) | post-50 sessions | aggregate | DB query |

**Discipline:** Pablo o claude logean TODO feedback observed en HANDOFF.md (categorized, not interpreted) cada touch.

## Categorías de feedback

### Categoría A: Bug / technical issue

**Examples:** caso vivo crashea, reporte no genera, email no llega, Stripe error.

**Action:** P0/P1/P2 priority en codex. Fix dentro de 24h-1 semana.

**Signal for roadmap:** NO direct (es ruido técnico, no signal de fit).

### Categoría B: UX friction sin bug

**Examples:** "El paso 3 fue confuso", "no entendí qué era el risk event", "el dashboard no mostraba lo que esperaba".

**Action:**
- N=1 customer: document, NO action immediate (could be Pablo's customer specific)
- N=2 customers same friction: investigar + considerar copy refinement
- N=3+ customers same friction: priority refactor copy o flow

**Signal for roadmap:** strong cuando ≥2 customers report same friction.

### Categoría C: Feature request

**Examples:** "Queremos integration con Slack", "necesitamos export PDF custom-branded", "agreguen carrera Sales".

**Action:**
- Log en HANDOFF.md "feature_requests" section
- DO NOT promise timeline al customer
- Re-evaluate cada 2 semanas — si pattern N≥3 mismo request, agregar a roadmap v2 con trigger

**Signal for roadmap:** strong cuando N≥3. Agrega a M9-3-D67 (integrations) o M9-3-D26 (carreras) según category.

### Categoría D: Pricing feedback

**Examples:** "esperaba pagar más", "es caro para mi tamaño", "preferiría suscripción anual con descuento".

**Action:** documentar en spreadsheet con context (org size, tier, sentiment).

**Signal for roadmap:**
- "Esperaba pagar más" N≥3 → activate M9-3-D6 pricing upgrade evaluation
- "Caro para mi tamaño" N≥3 → considerar Diagnóstico Lite tier (sub-$4K) si signal validates lower segment
- "Suscripción anual" N≥3 → evaluate annual contract structure (M9-3-D6 puede inform)

### Categoría E: Positioning / framing feedback

**Examples:** "no entendí qué hacían hasta el segundo call", "lo confundí con cohort training", "competimos con [X] competidor que no se mencionó".

**Action:** signal alto sobre messaging.

**Signal for roadmap:**
- N=1: signal débil, document
- N≥2 mismos comentarios: refactor landing copy o sales playbook
- N≥3 mismo competitor mentioned: actualizar competitive_pulse + sales playbook responses

### Categoría F: Quality dispute (reporte/banda incorrecta)

**Examples:** ver dispute_resolution_playbook Categoría 5.

**Action:** hybrid review humano gratis (M9-3-D77).

**Signal for roadmap:**
- N=1: investigation case-by-case
- N≥2 same dimension challenged: review rubric calibration + ajuste M9-3-D29 trigger (Sonnet vs Opus)
- N≥3: alarma — judge methodology needs deep review

### Categoría G: Process praise (positive)

**Examples:** "el reporte fue mejor que esperaba", "el demo call sí me cerró el deal", "comparado con cohort de Wharton fue mucho mejor".

**Action:** save as testimonials candidates (con consent — M9-3-D47 NPS case study question).

**Signal for roadmap:**
- N≥2 same praise: validation de current positioning. NO change needed.
- N=1 strong praise: testimonial candidate. Pablo follows up para case study consent.

## Bi-weekly feedback retro

Cada 2 semanas durante customer-zero phase (semanas 2, 4, 6, 8, 10, 12 post-launch), Pablo + claude colaborativos producen:

### Doc estructura — `docs/coord/audits/feedback_retro_t_plus_<N>.md`

```markdown
---
type: audit
title: Feedback retro T+<N> — primeros <N>customers
date: <ISO date>
authors: [claude, pablo]
status: published
scope: feedback recibido de customers + leads durante últimas 2 semanas
---

## TL;DR

<3 frases máximo summary>

## Sources processed

- N customers cerrados hasta hoy
- N demo calls realizadas
- N inbound emails (ventas + soporte)
- N surveys received (FSRR/RCI/NPS)
- N LinkedIn DMs

## Patterns identificados (N≥2)

| Pattern | Categoría | N occurrences | Action propuesta |
|---|---|---:|---|
| [example] "step 3 confuso" | B (UX friction) | 3 | refactor copy onboarding.ts.step3 |
| [example] "esperaba pagar más" | D (pricing) | 4 | activate M9-3-D6 pricing upgrade evaluation |

## Singletons (N=1, NO action yet — track)

- [pattern1]
- [pattern2]

## Decisiones tomadas

<list de decisiones documentadas con M9-3-D<N> ID nuevo si aplica>

## Próximo retro

<date>
```

### Trigger del retro

NO depende de timing alone. Si ≥3 customers cerrados o ≥10 demo calls completadas o ≥3 surveys received, retro happens.

## Anti-patterns identificados

### ❌ Anti-pattern 1: pivot por feature request

Customer A pide Slack integration. Pablo agrega Slack al sprint codex roadmap inmediato sin esperar pattern.

**Por qué malo:** N=1 signal weak. Customer A puede ser outlier. ChartMogul 2024: 60% de features built en customer-zero quedan sin uso por otros customers.

**Pro-pattern:** log feature request, NO commit timeline, re-evaluate cuando N≥3.

### ❌ Anti-pattern 2: ignore feedback "porque es solo 1"

Customer B dice "Itera me confundió con Section AI los primeros 2 calls". Pablo asume es outlier.

**Por qué malo:** quizás Customer B refleja friction más broad (M9-3-D14 buyer perfil overlap). Singleton N=1 STILL deserves track (no action, pero documented).

**Pro-pattern:** log singleton en "Singletons section" del retro. Track until N≥2.

### ❌ Anti-pattern 3: emotional reaction to negative feedback

Customer C da NPS 4/10 con razón "no me sirvió". Pablo reacciona offering free Sprint extension + custom build.

**Por qué malo:** sin understanding root cause, free extensions don't fix. Promise sin context aliena other customers.

**Pro-pattern:** dispute_resolution_playbook Categoría 7 — personal outreach para understanding antes de offering anything.

### ❌ Anti-pattern 4: confirmation bias

Pablo lee feedback con lens "esto valida mi roadmap". Ignora signal contrario.

**Por qué malo:** roadmap puede tener bug invisible. Feedback contrario es exactly what's needed.

**Pro-pattern:** claude reviewes feedback retro doc independiente. Cualquier "estoy seguro que esto es ruido" es escalated to careful review.

### ❌ Anti-pattern 5: paralysis por overprocessing

Pablo crea spreadsheet con 50 columns, codifica every nuance, never reaches action.

**Por qué malo:** overprocessing es la otra cara de pivot-por-feature. Same outcome: no action.

**Pro-pattern:** retro doc tiene structure fijo (sources/patterns/singletons/decisiones). Pattern matching ≥2 → action. No análisis additional needed v1.

## Decision-making framework

Cuando N≥3 confirms pattern, decisión format:

```
DECISIÓN: <accionable>
EVIDENCIA: <N customers, dates, categories>
ACCIÓN: <what claude/codex/pablo do>
TIMING: <when execute>
M9-3-D<N>: <new decision ID if needed>
```

Example:

```
DECISIÓN: Refactor onboarding.ts step 3 (invite flow) con UX más claro
EVIDENCIA: 3 customers (Acme MX, Beta CO, Gamma AR) report "no entendí
si el email iba a llegar a los empleados o a mí" en survey FSRR +14d
ACCIÓN: claude rewrite step3_invite copy + agregar preview screenshot
en wizard
TIMING: F1 v2 sprint (post 5 customers)
M9-3-D83 (nueva)
```

## Limits operacionales

- **Bi-weekly retro:** max 1-3 actionable decisiones per retro. Más es overprocessing.
- **Feature requests log:** keep < 20 active items en cualquier momento. Después de N=3 lifetime sin upgrade, archive.
- **Singletons section:** keep < 10. Si singleton sits sin partner ≥4 retros (~8 semanas), archive como "weak signal".
- **Pablo time:** ≤2 horas/retro. Más es overprocessing (anti-pattern 5).

## Cuándo abandonar la methodology

Post 20 customers cerrados, este methodology lite v1 se vuelve insufficient. Triggers para upgrade:

- **20+ customers:** retro doc se vuelve overwhelming. Move to spreadsheet + tagged categorization tool (Notion, Coda, etc.)
- **Specific carrera launches:** F2 (Sales), F3 (CS/Ops), F4 — feedback per carrera distinto, needs split docs
- **Customer Success hire:** dedicated person who processes feedback en lieu de Pablo (Pablo focuses sales)

**Trigger explícito:** post 10+ customers + bi-weekly retro consistently >2h Pablo time, upgrade.

## Output expectations (qué pasa con el feedback)

Pablo + Pablo + claude collaborate. Output per retro:

| Outcome | Where landed |
|---|---|
| Decisión accionable | `docs/coord/audits/feedback_retro_t_plus_<N>.md` + HANDOFF.md + posiblemente new M9-3-D entry |
| Copy refactor needed | claude updates relevant copy file con commit ref retro |
| Codex feature/bug | task created en BUILD_BOARD.yaml con priority |
| Roadmap shift | update v2_roadmap_post_customer_zero.md |
| No action (singleton or weak signal) | track en Singletons section, recheck next retro |

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D83
    decision: "Feedback loop methodology: bi-weekly retro durante customer-zero phase (semanas 2/4/6/8/10/12), categorizando feedback A-G, pattern recognition N≥2 (action) vs singletons (track), output 1-3 decisiones accionables max per retro"
    rationale: "Customer-zero phase requires structured feedback processing para evitar 3 anti-patterns (pivot por feature, ignore singleton, emotional reaction). Bi-weekly cadence + structured doc + N≥2 threshold balance signal sensitivity vs noise filtering."
    change_type: process
    files_to_touch:
      - docs/research/feedback_loop_methodology.md
      - docs/coord/audits/feedback_retro_t_plus_<N>.md (template)
    owner: claude + pablo
    blocked_by:
      - customer_zero
    priority: normal

  - id: M9-3-D84
    decision: "5 anti-patterns identificados como guardrails: pivot por feature N=1, ignore singleton, emotional reaction to negative, confirmation bias, paralysis por overprocessing. Pablo + claude review against estos antes de commit decisión"
    rationale: "Without explicit anti-patterns, instinct dominates. Guardrails permite Pablo (founder bias) y claude (research bias) ambos sanity check antes de action. Cross-review pattern previene single-perspective drift."
    change_type: process_guardrails
    files_to_touch:
      - docs/research/feedback_loop_methodology.md
    owner: claude + pablo
    blocked_by: []
    priority: normal

  - id: M9-3-D85
    decision: "Trigger upgrade methodology post 20+ customers o bi-weekly retro >2h Pablo time: move to spreadsheet + tagged tool (Notion/Coda), considerar Customer Success hire para process feedback en lieu de Pablo"
    rationale: "Methodology v1 lite trabaja hasta volumen específico. 20+ customers o sustained >2h/retro signal sobrecarga — upgrade infrastructure antes que process colapse. CS hire libera Pablo focus a sales (M9-3-D81)."
    change_type: scaling_trigger
    files_to_touch:
      - docs/research/feedback_loop_methodology.md
      - docs/research/scaling_constraints_v1.md (cross-ref Bottleneck 1)
    owner: pablo
    blocked_by:
      - 20_customers OR bi-weekly_>2h
    priority: low
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Pre-customer-zero:** methodology ready. NO retro hasta customer #1 cierre.
2. **Customer #3 cerrado o T+14 post-launch (lo que llegue primero):** primer retro doc.
3. **Bi-weekly cadence:** retro semana 2, 4, 6, 8, 10, 12 post-launch (during customer-zero phase).
4. **Post 5 customers:** review methodology effectiveness, refine if needed.
5. **Post 20 customers o retro >2h sostenido:** trigger upgrade (M9-3-D85).
