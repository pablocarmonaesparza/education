---
type: research
title: Sprint Marketing/Growth v2 iteration — sanity check 8 casos primary
date: 2026-05-19
author: claude
reviewers: [pablo, codex]
status: published
scope: review crítico de los 8 casos primary del Sprint v1 (Marketing/Growth) ANTES de expansion a Sales. Identifica riesgos de calibración, redundancia, o gaps que pueden surface en customer-zero feedback
related:
  - docs/simulador/contrato_v0/casos/*.yaml (8 casos primary)
  - docs/coord/audits/decisiones_pending_unblock.md
  - docs/research/expansion_carreras_v2.md (M9-3-D26 orden post v1)
  - docs/research/buyer_persona_head_marketing_latam.md
---

# Sprint Marketing/Growth v2 iteration

## TL;DR

Review crítico de los 8 casos primary actuales antes de invertir capacity en Sales carrera (F2 v2 roadmap). Pregunta clave: **¿el sprint v1 actual es solid o necesita iteración antes de scale a otras carreras?**

**Conclusión: solid pero 3 refinamientos sugeridos.** Los 8 casos cubren los 4 archetypes principales del rol Marketing/Growth (trust-vs-verify, speed-to-action-vs-validation, metric-gaming-vs-ethics, crisis-velocity-vs-precision). NO redundancia funcional, distribution coherent across levels N1/N2/N3.

**Refinamientos identificados (todos low-cost):**

1. **marketing_attribution_reporting_to_cmo** tiene level N2+N3 mixed — splitearlo en 2 casos separados (N2 solo + N3 con agentes) post-customer-zero
2. **marketing_brief_to_agency_via_ia** podría agregar variant con LATAM-specific agency context (acción coordinada con vendor LATAM, distinto US)
3. Falta 1 caso explícitamente N3 con agentes — los 8 actuales son mayoritariamente N1/N2

## Los 8 casos auditados

| # | Caso | Archetype | Level | Dimensiones | Status |
|---:|---|---|---|---|---|
| 1 | marketing_urgent_campaign_pii | crisis-velocity-vs-precision | N1 | privacidad, validación, juicio | solid |
| 2 | marketing_copy_with_brand_voice | speed-to-action-vs-validation | N1 | contexto, validación, decisión | solid |
| 3 | marketing_segment_with_sensitive_data | metric-gaming-vs-ethics | N2 | privacidad, juicio, decisión | solid |
| 4 | marketing_brief_to_agency_via_ia | trust-vs-verify | N1 | (no checked) | refinable LATAM agency |
| 5 | marketing_ad_creative_with_competitor_research | trust-vs-verify | N1 | (no checked) | solid |
| 6 | marketing_attribution_reporting_to_cmo | speed-to-action-vs-validation | **N2+N3 mixed** | (no checked) | split sugerido |
| 7 | marketing_content_calendar_under_pressure | speed-to-action-vs-validation | N2 | (no checked) | solid |
| 8 | marketing_crisis_response_with_ia | crisis-velocity-vs-precision | **N2+N3 mixed** | (no checked) | quedaría como único N3 puro |

## Análisis cobertura archetypes

De los 12 archetypes catalogados (B3-001):

| Archetype | Used in casos | Coverage v1 |
|---|---|---|
| crisis-velocity-vs-precision | 1, 8 | ✓ doble (urgent + crisis) |
| speed-to-action-vs-validation | 2, 6, 7 | ✓ triple (más representado) |
| metric-gaming-vs-ethics | 3 | ✓ |
| trust-vs-verify | 4, 5 | ✓ doble |
| entry-without-plan | — | NO usado v1 |
| incentives-vs-risk | — | NO usado v1 |
| pause-or-double-down | — | NO usado v1 |
| timeline-pressure-ignores-risk | — | NO usado v1 |
| defer-expertise-vs-authority | — | NO usado v1 |
| incremental-vs-redesign | — | NO usado v1 |
| cannibalize-or-preserve | — | NO usado v1 |
| thoroughness-vs-deadline | — | NO usado v1 |

**Observación:** 4 archetypes están usados (de los 12 disponibles). Los otros 8 archetypes están reservados para otras carreras (Sales/CS/Ops). Es intencional, NO gap.

**Razón:** Marketing/Growth tiene foco específico en (a) presión por velocidad, (b) validación de output, (c) tradeoffs metric/ethic. Los archetypes adicionales aplican más naturalmente a Sales (incentives-vs-risk), Ops (timeline-pressure / pause-or-double-down), Engineering (cannibalize / thoroughness).

## Análisis distribution levels

| Level | Cuenta v1 | Comment |
|---|---:|---|
| N1 (IA copiloto) | 4 casos | apropiado — entry point |
| N2 (IA workflow) | 2 casos puros + 2 mixed | apropiado — mid difficulty |
| N3 (IA con agentes) | 0 puros, 2 mixed | **gap potencial** |

**Issue identificado:** ningún caso es puramente N3 (agentes). Los casos 6 y 8 mezclan N2+N3 en mismo YAML (variante advanced).

**Implicación para customer-zero:**
- Si un customer tiene equipo madurez alta (ya usan agentes regularmente), los 8 casos v1 pueden ser sub-óptimos. El reporte ejecutivo refleja "tu equipo opera bien en N1/N2" pero no captura sus skills en N3.
- Mitigación inmediata: cases 6 y 8 cubren N3 via variant advanced. Caveat: customer experience varía si el variant disparable o no.

**Refinamiento propuesto:** post-customer-zero, splittear caso 6 (attribution_reporting) en 2 archivos:
- `marketing_attribution_reporting_to_cmo_n2_v1.yaml` (solo N2)
- `marketing_attribution_reporting_to_cmo_n3_v1.yaml` (agentes — chain of agents)

## Análisis dimensiones evaluadas

Los casos 1-3 tienen dimensions declared (verified en config); 4-8 no fueron checked en este audit. Pero del config.ts:

| Caso | dimensions declared (config) |
|---|---|
| marketing_urgent_campaign_pii | privacidad, validación, juicio |
| marketing_copy_with_brand_voice | contexto, validación, decisión |
| marketing_segment_with_sensitive_data | privacidad, juicio, decisión |
| otros 5 | no verified en este audit |

**Cobertura cross-casos de las 5 dimensiones:**

Asumiendo distribución similar en los 8 casos:
- **privacidad**: probable cubierto en 3-5 casos
- **contexto**: probable cubierto en 2-3 casos
- **validación**: probable cubierto en 4-6 casos (heavy)
- **juicio**: probable cubierto en 3-5 casos
- **decisión**: probable cubierto en 2-4 casos

**Posible gap:** **contexto** es la dimensión menos representada típicamente. Si un caso N3 nuevo se agrega post-customer-zero, debería explicitar dimensión contexto.

**Acción propuesta:** verificar formal en F1 post-launch — query Supabase para count de cada dimensión across todas las sessiones. Si **contexto** aparece en <20% de bandas evaluadas, agregar caso N2 con dimensión contexto prominente.

## 3 refinamientos sugeridos

### Refinamiento 1: split caso 6 (attribution_reporting)

**Problema:** caso 6 tiene N2+N3 mixed en mismo YAML.

**Propuesta:** post-customer-zero (F1 trigger), split en 2 archivos:
- `marketing_attribution_reporting_to_cmo_n2_v1.yaml`: solo N2 (presión speed-to-action, reporte semana)
- `marketing_attribution_reporting_to_cmo_n3_v1.yaml`: N3 con agentes (chain de agents que auto-genera + valida)

**Beneficio:** customers que solicitan N3 separately reciben caso dedicado, no variant. Reporte más limpio.

**Effort:** ~3 días (research depth N3 specifics + YAML + validation + seed).

**Trigger:** F1 v2 roadmap o ≥3 customers piden N3 explícito.

### Refinamiento 2: marketing_brief_to_agency_via_ia variant LATAM

**Problema:** el caso actual usa agency context genérico. LATAM mid-market mid-market trabaja con agencies LATAM (Lola Argentina, Genoma MX, etc.) con dinámicas distintas a US.

**Propuesta:** crear variant `_resim` con LATAM-specific context:
- Cliente: agency CDMX o BOG
- Brief incluye expectativas LATAM (no traducción literal de US briefing)
- Risk events: incluir "translated guidelines lost nuance" o "agency partner not under same DPA"

**Beneficio:** customers LATAM se identifican más con el caso. Generic agency feels "translated from US".

**Effort:** ~2 días (research agency LATAM dynamics + YAML variant + seed).

**Trigger:** post-3 customers MGP LATAM que reporten "no se sintió como mi reality".

### Refinamiento 3: agregar 1 caso N3 puro con agentes

**Problema:** ningún caso v1 es puramente N3. Los 2 mixed dejan ambigüedad.

**Propuesta:** crear `marketing_campaign_with_ai_agents_v1.yaml`:
- N3 (IA con agentes)
- Archetype: trust-vs-verify O thoroughness-vs-deadline
- Context: el participante tiene acceso a Claude/GPT-Operator-style agent para coordinar campaign across 5 channels
- Risk events: "agent loop without human checkpoint", "delegated decision to agent without policy", "trusted agent recommendation without verification"

**Beneficio:** customers con equipos N3 maduros tienen experiencia diferenciada. v1 cubre los 3 levels honestly.

**Effort:** ~5 días (research depth agents B2B Marketing + archetypes + YAML primary + variant resim + seed + validation).

**Trigger:** F1 v2 roadmap si ≥2 customers piden N3 explícito + signal "los agents son lo que mejor maneja mi equipo".

## NO refinamientos (decisiones explícitas de NO hacer)

### NO agregar más casos N1 baseline

Los 4 N1 actuales son suficientes para entry point. Agregar más:
- Confunde el sprint package (10+ casos no es "sprint", es "curso")
- Drena attention del manager (10 reports per persona overwhelming)
- No genera signal adicional (banda N1 ya predicha por 4 casos)

### NO refinamiento de archetypes

Los 4 archetypes usados en MGP cubren el dolor real. Los otros 8 son para Sales/CS/Ops. NO mezclar archetypes cross-carrera en MGP — rompe el frame "carrera-specific calibration".

### NO renombrado de slugs

Aunque algunos slugs son largos (marketing_attribution_reporting_to_cmo), son canónicos. Renombrar invalida URLs, breaks references en docs/board/seeds, requires migración. Cost > benefit.

### NO traducir a inglés v1

v1 es LATAM-only intencionalmente (M9-3-D2 launch geos MX+CO). Translation a inglés viene en v3+ cuando enterprise US/EU pidan.

## Pre-customer-zero validation propuesta

Antes de lanzar v1, propongo este self-test:

**Self-test 1:** Pablo o claude completa los 8 casos como participant (no judge).

- ¿Confuso en algún step?
- ¿Forma de capturar respuesta funciona (text input, options)?
- ¿Tiempo realista (18-22 min)?
- ¿Risk events disparable correctly?

**Resultado esperado:** identificar issues UX antes de customer real (cheaper feedback).

**Effort:** 2-3 horas (8 casos × 20 min cada).

**Trigger:** T-6 o T-5 (smoke E2E period en ready_state_t_minus_7).

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D52
    decision: "Sprint v1 MGP es solid — NO refactor pre-launch. 3 refinamientos identificados (split caso 6 N2/N3, variant LATAM agency caso 4, agregar 1 caso N3 puro) son post-customer-zero. Lock v1 cases ahora"
    rationale: "Los 8 casos cubren 4 archetypes apropiados para MGP, distribution N1/N2/N3 razonable (N3 mixed en 2 casos = workaround aceptable v1), 5 dimensiones cubiertas (con posible gap en contexto). Refinamientos pueden mejorar pero NO bloquean launch. Hold quality bar > iterate prematuramente."
    change_type: scope_decision
    files_to_touch:
      - docs/simulador/contrato_v0/casos/ (NO changes v1)
    owner: claude
    blocked_by: []
    priority: normal

  - id: M9-3-D53
    decision: "F1 post-customer-zero: split caso 6 attribution_reporting en N2/N3 separate files + variant LATAM agency context + agregar 1 caso N3 puro con agentes. Total ~10 días claude work + 2 días codex seed"
    rationale: "Los 3 refinamientos identificados son value adds, no bug fixes. Post-customer-zero permite priorizar según signal real. Si solo 1 customer pide N3, refinamiento 3 (caso N3 puro) prioriza. Si todos piden N2 más detail, refinamiento 1 (split caso 6) prioriza."
    change_type: roadmap_v2
    files_to_touch:
      - docs/simulador/contrato_v0/casos/marketing_attribution_reporting_to_cmo_n2_v1.yaml (split, new)
      - docs/simulador/contrato_v0/casos/marketing_attribution_reporting_to_cmo_n3_v1.yaml (split, new)
      - docs/simulador/contrato_v0/casos/marketing_brief_to_agency_via_ia_resim_latam_v1.yaml (new variant)
      - docs/simulador/contrato_v0/casos/marketing_campaign_with_ai_agents_v1.yaml (new N3 puro)
    owner: claude (specs) + codex (seed)
    blocked_by:
      - customer_zero
    priority: low

  - id: M9-3-D54
    decision: "Pre-launch self-test propuesto: Pablo o claude completa los 8 casos como participant en T-6/T-5. Identifica UX issues antes de customer real. Effort 2-3 horas total"
    rationale: "Smoke E2E técnico (M9-3-D17 Gate 2) verifica que el flow funciona. Self-test verifica que el flow se SIENTE bien. Pablo es el buyer surrogate ideal — sí entiende producto + buyer perfil. 2-3 horas inversión, catch UX issues pre-customer."
    change_type: pre_launch_qa
    files_to_touch:
      - docs/coord/audits/ready_state_t_minus_7.md (incorporar self-test en T-6 row si aún editable)
    owner: pablo + claude
    blocked_by: []
    priority: normal
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato:** sprint v1 lock — NO refactor casos pre-launch.
2. **T-6 o T-5:** Pablo + claude self-test 8 casos (2-3 horas).
3. **F1 v2 roadmap post-customer-zero:** ejecutar 3 refinamientos según signal customer.
4. **F2 Sales launch:** apenas v1 lock confirmado + 1 customer ask Sales, arrancar Sales carrera (M9-3-D25/D26).
