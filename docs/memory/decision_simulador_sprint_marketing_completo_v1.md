---
type: decision
title: Sprint marketing_30d completo — 8 casos canónicos del Simulador v0
date: 2026-05-12
tags: [simulador, sprint-completo, marketing, contrato-v0, 8-casos]
dept: [producto, marketing, desarrollo, orquestador]
---

# Sprint marketing_30d completo — cierre v0

## qué es

`sprint_marketing_30d_v1` es el primer SKU vendible completo del
Simulador. 8 case_templates ready, 16 case_variants (primary + resim
por caso), 20 practice_beats, 1 rúbrica versionada (rubric_marketing_v1),
2 archivos de copy (manager + empleado), 1 sprint package operacional.

todo vive en `docs/simulador/contrato_v0/`. todo `synthetic: true` —
ningún dato real de cliente.

## los 8 casos del Sprint

| # | id | tensión | dimensiones | difficulty |
|---|---|---|---|---|
| 1 | marketing_urgent_campaign_pii | velocidad vs privacidad | privacidad, validación, juicio | baseline |
| 2 | marketing_copy_with_brand_voice | velocidad vs voz de marca | contexto, validación, decisión | baseline |
| 3 | marketing_segment_with_sensitive_data | enriquecer segmentación sin discriminar | privacidad, juicio, decisión | intermediate |
| 4 | marketing_brief_to_agency_via_ia | leak de estrategia a vendor | contexto, decisión, juicio | baseline |
| 5 | marketing_ad_creative_with_competitor_research | plagio inadvertido + claims | validación, juicio, decisión | intermediate |
| 6 | marketing_attribution_reporting_to_cmo | attribution IA alucinada | validación, contexto, decisión | intermediate |
| 7 | marketing_content_calendar_under_pressure | volumen vs curaduría | contexto, juicio, decisión | baseline |
| 8 | marketing_crisis_response_with_ia | velocidad vs approval chain | juicio, privacidad, decisión | advanced |

## distribución de dimensiones (balance del Sprint)

cada dimensión aparece como "emphasized" en al menos 3 casos:

- **contexto:** casos 2, 4, 6, 7 (4×)
- **privacidad:** casos 1, 3, 8 (3×) — peso bajo en otros casos
- **validación:** casos 1, 2, 5, 6 (4×)
- **juicio:** casos 1, 3, 4, 5, 7, 8 (6×) — dimensión más recurrente
- **decisión:** casos 2, 3, 4, 5, 6, 7, 8 (7×)

balance permite que reporte agregado del Sprint sea significativo en
todas las dimensiones. `juicio` es la más recurrente porque es la
habilidad transversal — saber cuándo escalar, cuándo objetar, cuándo
verificar.

## distribución de difficulty

- baseline: 4 casos (1, 2, 4, 7)
- intermediate: 3 casos (3, 5, 6)
- advanced: 1 caso (8)

curva progresiva que termina con crisis response — el escenario más
alto stakes del Sprint, donde el empleado tiene que aplicar TODO lo
aprendido.

## las 16 variantes (primary + resim por caso)

contrastes diseñados para probar **transferencia del principio**, no
memorización de respuesta:

- caso 1: LATAM SaaS B2B → Enterprise US con DPO
- caso 2: B2B corporate-cálido → B2C gen z irreverente
- caso 3: LATAM informal → EU GDPR strict con DPO
- caso 4: agencia conocida 2 años → freelancer nuevo + M&A
- caso 5: emerging LATAM 3 competidores → US mature 1 dominante
- caso 6: weekly CMO 3 fuentes → quarterly board 6 fuentes
- caso 7: Q2 awareness 30d/10pcs → Q3 launch 90d/25pcs multi-canal
- caso 8: viral complaint medium → data breach existential

todas las resims usan **misma rúbrica + mismos pesos** (regla v0:
no modular pesos para preservar comparabilidad de `transfer_delta`).

## los 20 practice_beats

20 microbeats correctivos (≤2 min cada uno), disparados por gaps
específicos:

| pase | beat | dimensión | trigger |
|---|---|---|---|
| 1 | anonymize_keep_signal_v1 | privacidad | expose_pii |
| 1 | validate_llm_output_v1 | validación | accept_output_no_validation |
| 1 | objection_to_authority_v1 | juicio | no_risk_flag_upward |
| 1 | spot_unverifiable_claims_v1 | juicio | weak_artifact_review |
| 2 | prompt_with_voice_examples_v1 | contexto | ignore_brand_guide |
| 2 | spot_tone_drift_v1 | juicio | accept_tone_drift |
| 2 | iterate_with_intent_v1 | decisión | excessive_iteration |
| 3 | spot_segmentation_bias_v1 | juicio | bias_blindness |
| 3 | segment_size_protections_v1 | privacidad | segment_too_small_individual_id |
| 3 | transparent_peer_response_v1 | juicio | deflection / dishonest_to_peer |
| 4 | scrub_strategy_from_brief_v1 | juicio | leak_strategy |
| 4 | brief_completeness_v1 | decisión | over_redacted_brief |
| 5 | spot_inadvertent_plagiarism_v1 | validación | inadvertent_plagiarism |
| 5 | competitive_claim_verification_v1 | validación | unverifiable_competitor_claim |
| 6 | correlation_not_causation_v1 | validación | causal_overclaim |
| 6 | marketing_data_provenance_v1 | validación | hide_source_disagreement |
| 7 | spot_calendar_redundancy_v1 | juicio | repetitive_calendar_blind |
| 7 | content_progression_storytelling_v1 | juicio | no_progression_storyline |
| 8 | crisis_approval_chain_v1 | juicio | bypass_approval / silence_amplifies_crisis |
| 8 | crisis_tone_human_v1 | juicio | off_tone_corporate / defensive_blame |

practice_beats son reusables entre casos. ejemplos: `validate_llm_output_v1`
del caso 1 se reusa en casos 5, 6, 7. `transparent_peer_response_v1` del
caso 3 se reusa en caso 6.

## qué falta para correr el Sprint real

- migración Supabase aplicada (Codex tiene `schema/simulador_v0.sql`
  candidate listo, esperando aprobación de Pablo)
- importer YAML → seed rows DB (Codex tiene runtime mínimo en `lib/simulador/`)
- LLM-judge integrado contra rúbrica
- runtime motor de sesión (5 step types ejecutables)
- UI mínima (post-validación de producto)
- 1 design partner para validar el flujo end-to-end

## decisiones aún abiertas para Pablo

1. **pricing band del Sprint marketing_30d:** tentativo $79-199
   per_seat_per_sprint, team_minimum 5 seats. requiere validación
   con design partners. ver `commercial.pricing_band_usd` en
   `sprints/sprint_marketing_30d.yaml`.

2. **diseño visual:** zero pendiente. Pablo dijo "primero quiero
   validar el producto, después UX/UI". el contrato vive en YAML/MD.

3. **launch como SKU:** sprint_marketing_30d puede correrse en modo
   "design partner" con 1-3 casos para validar maquinaria. el precio
   full requiere 8 casos ready (ya tenemos).

4. **segundo Sprint a producir:** sugerencia inicial — `ops_30d`
   (Sprint para Head of Operations). dimensiones que faltarían por
   reforzar en el contrato y casos a generar después.

## colaboración Claude/Codex en este Sprint

- Claude (producto): 8 case_templates + 16 variantes + 1 rúbrica +
  20 practice_beats + 2 archivos de copy + sprint package + 5 archivos
  de memoria. todo en `docs/simulador/contrato_v0/` (excepto memoria).
- Codex (eng): schema SQL candidate + runtime lógico + modelo de datos
  + audit técnico + runtime motor mínimo (`lib/simulador/`).
- 8 pases discretos de commit + push, cada uno con auditoría
  bidireccional implícita (Codex refinó archivos de Claude
  inline cuando detectó inconsistencias técnicas).

## fuentes

- contrato completo: `docs/simulador/contrato_v0/`
- arquitectura general: `decision_simulador_arquitectura_v0.md`
- 3 memorias específicas previas: `decision_simulador_first_case_marketing.md`,
  `decision_simulador_second_case_brand_voice.md`, `decision_simulador_third_case_segmentation.md`
- tesis: `decision_tesis_concentracion_plataforma.md`
- categoría + ICP: `decision_marketing_simulator_framing_v1.md`

## próximo paso recomendado

1. Pablo revisa el contrato completo, aprueba migración SQL.
2. Codex aplica migración + importer + runtime mínimo.
3. Pablo identifica 1 design partner (Marketing Manager LATAM SaaS B2B
   mid-market) para correr el Sprint real.
4. iteramos rúbrica + casos con feedback del design partner.
5. después de 2-3 design partners, decidir si producir Sprint #2
   (ops, sales, content, support, etc.).
