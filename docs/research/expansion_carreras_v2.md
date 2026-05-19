---
type: research
title: Expansion carreras v2 — roadmap 9 carreras post-Marketing/Growth
date: 2026-05-19
author: claude
reviewers: [codex, pablo]
status: published
scope: roadmap priorizado de las 9 carreras restantes en el career_key enum (Sales/CS/Ops/Finance/Legal/HR/Product/Engineering + Growth tratado aparte). Definir orden, archetypes aplicables y casos prioritarios para post v1 launch
related:
  - supabase/migrations/20260519021000_simulador_premium_schema_021.sql (career_key enum)
  - docs/simulador/contrato_v0/archetypes/INDEX.md (12 archetypes)
  - docs/simulador/contrato_v0/casos/ (8 casos Marketing/Growth)
  - docs/research/buyer_persona_head_marketing_latam.md
---

# Expansion carreras v2 — roadmap post v1

## TL;DR

career_key enum tiene **10 carreras** definidas: marketing · growth · sales · cs · ops · finance · legal · hr · product · engineering.

**v1 cubre Marketing + Growth con 8 casos primary.** Post v1 launch + customer-zero (5+ customers), expandir en orden:

1. **Sales** (Q3 2026) — buyer overlap alto con CMO/VP Growth (mismo C-suite)
2. **Customer Success** (Q3 2026) — adjacencia natural a Marketing/Sales
3. **Operations** (Q4 2026) — buyer cambia a COO/Head of Ops
4. **Finance** (Q4 2026) — buyer CFO, regulatorio LATAM riesgo alto
5. **HR / People** (Q1 2027) — buyer CHRO, distinta motivación compra
6. **Legal** (Q1 2027) — buyer CLO/General Counsel, ciclo más largo
7. **Product** (Q2 2027) — buyer CPO, requiere casos N3 con agentes
8. **Engineering** (Q3 2027) — buyer CTO, technical buyer requiere depth

Cada carrera necesita 4-6 casos primary (mínimo 2 archetypes diferentes) + 8-12 practice beats. Esfuerzo ~3-4 semanas/carrera de research + 2 semanas/carrera de casos YAML.

## Por qué este orden

### Sales primero post-Marketing/Growth (Q3 2026)

**Buyer overlap:** VP Sales reporta al mismo C-suite que VP Marketing en mid-market LATAM. Cross-sell natural — si el primer customer compra Diagnóstico para Marketing/Growth, agregar Sales requiere convencer al mismo CRO/CEO.

**Dolor con IA paralelo:** "mi equipo de sales usa ChatGPT para emails de prospecting sin proceso de validación" es exactamente análogo a "mi equipo de marketing usa IA sin criterio". Misma estructura del wedge.

**Archetypes aplicables (de los 12 actuales):**
- `trust-vs-verify` → caso "venta cierra basado en proyección IA sin validar fuente"
- `speed-to-action-vs-validation` → caso "responder RFP urgente con output IA sin verify"
- `incentives-vs-risk` → caso "presión cierre fin de mes vs disclosure correcto"
- `defer-expertise-vs-authority` → caso "VP pide propuesta express, IA genera, sales rep entrega"

**Casos prioritarios Sales (4):**
1. `sales_proposal_to_enterprise_via_ia` — speed-to-action-vs-validation N1
2. `sales_quote_quarter_close_pressure` — incentives-vs-risk N2
3. `sales_competitor_intel_with_ai` — trust-vs-verify N1
4. `sales_objection_response_under_pressure` — defer-expertise-vs-authority N2

### Customer Success segundo (Q3 2026)

**Adjacencia natural:** CS reporta a Revenue ops (a veces mismo VP que sales). Buyer overlap con Sales/Marketing en ~60% casos mid-market LATAM.

**Dolor con IA:** "CS team responde tickets con AI sin entender contexto del customer" + "renewal forecasts con IA sin validar customer health real".

**Archetypes aplicables:**
- `crisis-velocity-vs-precision` → caso "ticket crítico de customer enterprise + AI sugiere respuesta sin context"
- `metric-gaming-vs-ethics` → caso "renewal score con AI overstates customer health"
- `incremental-vs-redesign` → caso "playbook CS con IA — same script vs custom per customer"
- `entry-without-plan` → caso "nuevo CSM con AI tool sin training estructurado"

**Casos prioritarios CS (4):**
1. `cs_enterprise_ticket_crisis` — crisis-velocity-vs-precision N1
2. `cs_renewal_forecast_with_ai` — metric-gaming-vs-ethics N2
3. `cs_playbook_personalization` — incremental-vs-redesign N1
4. `cs_onboarding_new_csm` — entry-without-plan N1

### Operations tercero (Q4 2026)

**Cambio de buyer:** ya NO CMO/VP Sales — ahora COO o Head of Ops directo. Distinto perfil, distinto dolor.

**Dolor con IA:** "ops team automatiza workflows con AI sin governance" + "compliance check con AI bypassed sin escalation".

**Archetypes aplicables:**
- `pause-or-double-down` → caso "workflow AI roto en producción — pausar o seguir"
- `timeline-pressure-ignores-risk` → caso "rollout urgente de proceso con AI sin validation"
- `thoroughness-vs-deadline` → caso "audit con AI vs manual review — deadline mismatch"
- `cannibalize-or-preserve` → caso "automatizar proceso existente con AI — risk de breaking established flow"

**Casos prioritarios Ops (4):**
1. `ops_workflow_automation_governance` — pause-or-double-down N2
2. `ops_compliance_check_bypass` — timeline-pressure-ignores-risk N2
3. `ops_audit_automation` — thoroughness-vs-deadline N2
4. `ops_process_redesign_with_ai` — cannibalize-or-preserve N2+N3

### Finance cuarto (Q4 2026)

**Cambio dramático de buyer:** CFO. Skeptical-by-default. Regulatory exposure LATAM alta (SAT MX, DIAN CO).

**Dolor con IA:** "team usa AI para forecast pero no documenta assumptions" + "AI sugiere expense categorization sin audit trail".

**Archetypes aplicables:**
- `metric-gaming-vs-ethics` → "P&L close con AI summarization — overstate revenue"
- `defer-expertise-vs-authority` → "CFO pide explainability de output AI"
- `trust-vs-verify` → "expense classification AI vs human review"
- `entry-without-plan` → "new financial analyst with AI tool — risk control"

**Casos prioritarios Finance (4-5):**
1. `finance_quarterly_forecast_with_ai` — metric-gaming-vs-ethics N2
2. `finance_audit_trail_ai_classification` — trust-vs-verify N2
3. `finance_board_deck_with_ai` — defer-expertise-vs-authority N2
4. `finance_new_analyst_onboarding` — entry-without-plan N1
5. `finance_compliance_sat_dian_with_ai` (LATAM-specific) — timeline-pressure-ignores-risk N2

**Caveat:** Finance + LATAM tributario requiere counsel local antes de lanzar (B9-003-D5). NO antes de primer DPA enterprise.

### HR / People quinto (Q1 2027)

**Cambio buyer:** CHRO/VP People. Motivación compra distinta — privacy + bias riesgo dominantes.

**Dolor con IA:** "AI screening de candidates introduce bias" + "performance reviews con AI sin oversight" + "internal mobility recommendations con AI sin justificación".

**Archetypes aplicables:**
- `metric-gaming-vs-ethics` → "hiring score AI prioritizes wrong signals"
- `trust-vs-verify` → "performance review with AI summary — accept or reject"
- `defer-expertise-vs-authority` → "AI sugiere disciplinary action — manager decide"
- `incentives-vs-risk` → "AI suggests salary range — HR overrides or accepts"

**Casos prioritarios HR (4):**
1. `hr_candidate_screening_with_ai_bias` — metric-gaming-vs-ethics N2
2. `hr_performance_review_with_ai_summary` — trust-vs-verify N2
3. `hr_disciplinary_action_ai_suggestion` — defer-expertise-vs-authority N2+N3
4. `hr_internal_mobility_ai_recommendation` — incentives-vs-risk N2

**Caveat:** HR + bias requiere extra care con accuracy claims. Legal MX/CO con foco antidiscriminación (LFPRH MX 2022 + Ley 1257 CO).

### Legal sexto (Q1 2027)

**Buyer:** CLO / General Counsel. Skeptical-by-default. Ciclo de venta más largo (3-6 meses).

**Dolor con IA:** "lawyers use AI for contract review without checking citations" + "AI generates clause language that's not aligned with precedent" + "compliance scan AI misses jurisdiction nuance".

**Archetypes aplicables:**
- `trust-vs-verify` → "contract review with AI — accept clauses without verify"
- `thoroughness-vs-deadline` → "compliance scan deadline vs manual review"
- `defer-expertise-vs-authority` → "senior lawyer asks AI to draft — junior accepts"
- `metric-gaming-vs-ethics` → "AI summary of legal precedent — overstate certainty"

**Casos prioritarios Legal (4):**
1. `legal_contract_review_with_ai` — trust-vs-verify N2
2. `legal_compliance_scan_with_ai` — thoroughness-vs-deadline N2
3. `legal_clause_drafting_with_ai` — defer-expertise-vs-authority N2+N3
4. `legal_precedent_research_with_ai` — metric-gaming-vs-ethics N2

**Caveat:** Legal carrera tiene niche más estrecho. Vendible solo a orgs con CLO interno (50+ employees). Sub-segmento de v2.

### Product séptimo (Q2 2027)

**Buyer:** CPO / Head of Product. Receptivo a IA (uso diario probable), pero quiere medición.

**Dolor con IA:** "PMs use AI for spec generation without user research" + "feature prioritization with AI — gut feel + bias" + "user research synthesis with AI loses nuance".

**Archetypes aplicables:**
- `entry-without-plan` → "new PM uses AI to write PRD without process"
- `incremental-vs-redesign` → "feature prioritization framework with AI vs manual"
- `trust-vs-verify` → "user research synthesis AI vs read transcripts"
- `pause-or-double-down` → "experiment results inconclusive — AI suggests double down"

**Casos prioritarios Product (4):**
1. `product_prd_generation_with_ai` — entry-without-plan N2
2. `product_prioritization_with_ai` — incremental-vs-redesign N2
3. `product_user_research_synthesis` — trust-vs-verify N2
4. `product_experiment_decision_with_ai` — pause-or-double-down N3

**Requiere casos N3 con agentes:** Product es donde la madurez IA es más alta — N3 casos serán naturales (AI agents para spec / research / analytics).

### Engineering último (Q3 2027)

**Buyer:** CTO. Technical buyer requiere depth. Ciclo distinto — convence con producto, no con sales pitch.

**Dolor con IA:** "engineers use Copilot/Cursor without code review process" + "AI-generated code in production without security audit" + "AI suggests architecture without team buy-in".

**Archetypes aplicables:**
- `speed-to-action-vs-validation` → "AI-generated code into PR without review"
- `trust-vs-verify` → "AI suggests architecture decision — accept or design review"
- `cannibalize-or-preserve` → "refactor existing system using AI — risk vs reward"
- `thoroughness-vs-deadline` → "security audit AI-assisted vs manual"

**Casos prioritarios Engineering (4):**
1. `eng_code_review_with_ai_generated_pr` — speed-to-action-vs-validation N2
2. `eng_architecture_decision_with_ai` — trust-vs-verify N2+N3
3. `eng_refactor_legacy_with_ai` — cannibalize-or-preserve N3
4. `eng_security_audit_with_ai` — thoroughness-vs-deadline N3

**Requiere casos N3 con agentes:** Engineering es donde AI agents son más usados (Cursor, Devin, Copilot Workspace). N3 casos están casi obligatorios.

## Estructura del esfuerzo por carrera

Cada carrera nueva requiere ~5-6 semanas total:

**Semana 1-2:** Research depth (claude)
- Buyer persona específico carrera
- Dolor latente vs explícito
- Top 5 herramientas que usan + métricas que reportan
- Anti-patterns (qué NO les funciona)

**Semana 3:** Archetypes mapping (claude)
- Cuáles de los 12 archetypes aplican a la carrera
- Si se necesita archetype nuevo (ej. específico Legal "client-confidentiality-vs-efficiency")
- Esquema de 4-6 casos primary

**Semana 4-5:** Casos YAML (claude)
- 4-6 casos primary con archetype_ref + level_primary
- 4-6 variantes resim (mismo archetype, dataset distinto)
- Validación con `scripts/simulador/validate-case-yaml.mjs`

**Semana 6:** Seed + smoke (codex + claude)
- Codex corre `seed-cases.mjs` para nueva carrera
- Smoke E2E: empleado dummy completa caso → reporte genera
- Validación de copy en runtime (no spoilers)

**Esfuerzo total expansion v2 (8 carreras):** ~40-48 semanas claude + ~10 semanas codex = ~12 meses ~50% velocity dual.

## NO expandir prematuramente

**Anti-pattern:** lanzar 3-4 carreras simultáneamente antes de tener customer-zero en Marketing/Growth.

**Por qué:** sin signal de customer real (qué casos resonaron, qué bandas predijeron behavior, qué risk events fueron útiles), expandir a Sales/CS/Ops es adivinar. Mejor ship v1 sólido + cerrar 5 customers Marketing/Growth + USAR ese signal para refinar lo que se expande.

**Trigger explícito para arrancar Sales:** ≥5 customers Marketing/Growth cerrados + ≥1 customer pide "¿tienen Sales?" sin que Pablo lo proactivamente venda.

**Trigger explícito para arrancar Ops:** ≥3 customers Sales cerrados + ≥1 pide Ops específicamente.

Demand-driven expansion > supply-driven expansion.

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D25
    decision: "Expansion de carreras es demand-driven NO supply-driven. v1 = Marketing/Growth. Arrancar Sales solo cuando ≥5 customers MGP cerrados + ≥1 pida Sales sin push proactivo. Ops solo cuando ≥3 Sales + demand explícita"
    rationale: "Sin customer signal, expansion es adivinar. Sales/CS/Ops/Finance/HR/Legal/Product/Eng todos plausibles pero ROI distinto. Mejor invertir en customer-zero + retention de Marketing/Growth, luego expandir donde el dolor real surge."
    change_type: roadmap
    files_to_touch:
      - docs/research/expansion_carreras_v2.md
    owner: claude
    blocked_by:
      - customer_zero_marketing_growth
    priority: low

  - id: M9-3-D26
    decision: "Orden de expansion priorizado: Sales (Q3-26) → CS (Q3-26) → Ops (Q4-26) → Finance (Q4-26 con caveat legal LATAM) → HR (Q1-27) → Legal (Q1-27 niche) → Product (Q2-27) → Engineering (Q3-27, technical buyer)"
    rationale: "Buyer overlap más alto (MGP → Sales → CS) primero porque cross-sell natural mismo C-suite. Operations cambia buyer pero adyacente. Finance/HR/Legal son specialized verticals con ciclos venta más largos y caveats regulatorios LATAM. Product/Engineering requieren casos N3 con agentes (madurez más alta) — last."
    change_type: roadmap
    files_to_touch:
      - docs/research/expansion_carreras_v2.md
    owner: claude
    blocked_by:
      - 5_customers_mgp
    priority: low

  - id: M9-3-D27
    decision: "Esfuerzo por carrera ~5-6 semanas (research + archetypes + casos YAML + seed/smoke). 8 carreras restantes = ~40-48 semanas claude work. Si dual velocity codex/claude se mantiene, 12 meses elapsed. NO acelerar — calidad de cada carrera > velocidad de expansion"
    rationale: "Casos genéricos para llenar enum NO sirven. Cada carrera necesita research depth + archetypes específicos + validación. Acelerar resulta en casos shallow que rompen el wedge 'diagnóstico operativo no certificación'. Hold quality bar."
    change_type: capacity_planning
    files_to_touch:
      - docs/research/expansion_carreras_v2.md
    owner: claude
    blocked_by: []
    priority: low
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato:** ninguno. v1 es Marketing/Growth — lock.
2. **Post 5 customers MGP:** evaluar señal real de demand para Sales/CS/Ops.
3. **Q3 2026:** arrancar Sales si demand confirmada.
4. **Q4 2026 - Q3 2027:** expansion 7 carreras restantes en orden definido.
5. **Refresh anual:** Q1 2027 review del roadmap con customer feedback acumulado.
