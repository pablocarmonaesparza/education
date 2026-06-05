# STATUS — contrato_v0 (coordinación Claude/Codex)

> archivo en tiempo real. cada agente actualiza su columna después de cada commit. no editar la columna del otro.

última sincronización: 2026-05-20 (codex actualizando)

## reset de casos 2026-05-20

Pablo decidio retirar los 8 casos antiguos. No se usaran como base del
producto. El contrato activo queda reducido a un golden case nuevo para probar
el Case Factory:

- `sales_agent_followup_pipeline_v1`
- primary: `sales_agent_followup_pipeline__aurora_primary_v1`
- resim: `sales_agent_followup_pipeline__nova_resim_v1`
- rubric: `rubric_case_factory_v1@1.0.0`
- practice beats: 4

La meta inmediata es validar la estructura, no producir volumen.

## catálogo assembled (validado + deployado)

Aparte del golden de contrato, el track **assembled** (formato 5×5, 17 bloques de
ejercicio) está validado con gates deterministas + juez adversarial calibrado y
deployado en `origin/main`. Son los casos vivos en
`lib/simulador/cases-registry.generated.ts`, sembrados por organización en runtime:

- `vertiz_backlog_entregas_v1`
- `lumen_reactivacion_citas_v1`
- `marketing_dirty_data_relaunch_v1`

Reconciliación de catálogos (assembled vs contrato/leveled): decisión de producto
pendiente — cuál es el caso comercial V1. Ambos coexisten sin contradicción: el golden
de contrato prueba el Case Factory; los assembled son los casos jugables/deployados.

> nota: codex mantiene `coordinacion/`, `runtime/`, `schema/`; claude mantiene casos, rubricas, variantes, practice beats, copy y sprint package.

## estado por artefacto

| artefacto | path | autor | claude | codex | observación |
|---|---|---|---|---|---|
| README contrato | `README.md` | codex | – | ✅ done | codex sobrescribió con versión canónica — claude no toca |
| STATUS coordinación | `STATUS.md` | claude | ✅ done | – | este archivo |
| case_template marketing #1 | `casos/marketing_urgent_campaign_pii_v1.yaml` | claude | ✅ done v1 | – | primer caso canónico — listo para audit; añadido `transfer_delta` a evidence; nota de scoring resim alineada con FLUJO_RUNTIME |
| variant primary #1 | `variantes/marketing_urgent_campaign_pii__loop_saas_b2b_v1.yaml` | claude | ✅ done v1 | – | render LATAM SaaS B2B con 8 sample rows |
| variant resim #1 | `variantes/marketing_urgent_campaign_pii__loop_enterprise_us_resim_v1.yaml` | claude | ✅ done v1 | – | render Enterprise US con 8 sample rows + behavior shift |
| rubrica marketing v1 | `rubricas/rubric_marketing_v1.yaml` | claude | ✅ done v1 | – | 5 dimensiones públicas + 7 gaps + capa interna completa para LLM-judge; weight_modulation_per_case desactivado para preservar comparabilidad primary↔resim |
| practice_beats catálogo | `practice_beats/*.yaml` | claude | ✅ done v1 | – | 4 stubs poblados: anonymize_keep_signal, validate_llm_output, objection_to_authority, spot_unverifiable_claims |
| copy manager | `copy/manager_recommendation_templates.md` | claude | ✅ done v1 | – | 4 acciones con reglas de selección, slots, posfacio, tonos a evitar |
| copy empleado | `copy/employee_runtime_strings.md` | claude | ✅ done v1 | – | onboarding sprint, strings por step type, errores, prueba de cordura |
| sprint marketing_30d | `sprints/sprint_marketing_30d.yaml` | claude | 🗄️ retirado 2026-05-20 | – | HISTÓRICO — retirado del contrato activo (ver «reset de casos» arriba). NO es SKU vendible; se conserva la fila como registro del trabajo previo |
| case_template marketing #2 | `casos/marketing_copy_with_brand_voice_v1.yaml` | claude | ✅ done v1 | – | tensión velocidad-vs-voz-de-marca; 5 steps incluyendo data_scope para contexto y artifact_review del output IA |
| variant primary #2 | `variantes/marketing_copy_with_brand_voice__loop_b2b_v1.yaml` | claude | ✅ done v1 | – | Loop B2B SaaS corporate-cálido, 5 ejemplos históricos sintéticos LATAM |
| variant resim #2 | `variantes/marketing_copy_with_brand_voice__nubefresh_b2c_resim_v1.yaml` | claude | ✅ done v1 | – | NubeFresh D2C tono irreverente gen z — contraste extremo para probar transferencia del PRINCIPIO de anclar tono |
| practice beats nuevos (pase 2) | `practice_beats/practice_{prompt_with_voice_examples,spot_tone_drift,iterate_with_intent}_v1.yaml` | claude | ✅ done v1 | – | 3 nuevos: anclar tono con ejemplos, detectar tone drift, iterar con intención |
| case_template marketing #3 | `casos/marketing_segment_with_sensitive_data_v1.yaml` | claude | ✅ done v1 | – | difficulty intermediate; tensión: enriquecer segmentación con IA sin discriminar ni exponer behavioral data; 9 gaps incluyendo bias_blindness, segment_too_small, deflection, dishonest_to_peer |
| variant primary #3 | `variantes/marketing_segment_with_sensitive_data__loop_latam_v1.yaml` | claude | ✅ done v1 | – | Loop LATAM régimen informal, CRM 8.4k leads, campaña a 5k, deadline 8h |
| variant resim #3 | `variantes/marketing_segment_with_sensitive_data__nordlinx_eu_resim_v1.yaml` | claude | ✅ done v1 | – | NordLinx EU GDPR strict con DPO + DPIA + RoPA, escala 10x a 62k CRM/50k campaña |
| practice beats nuevos (pase 3) | `practice_beats/practice_{spot_segmentation_bias,segment_size_protections,transparent_peer_response}_v1.yaml` | claude | ✅ done v1 | – | 3 nuevos: detectar bias en segmentación, regla k-anonimato light, respuesta transparente a peer |
| case_template marketing #4 | `casos/marketing_brief_to_agency_via_ia_v1.yaml` | claude | ✅ done v1 | – | tensión leak-de-estrategia en brief a vendor; 5 steps con data_scope para sections sensitive vs safe; 7 gaps incluyendo leak_strategy, over_redacted_brief, pretend_full_brief |
| variant primary #4 | `variantes/marketing_brief_to_agency_via_ia__loop_familiar_agency_v1.yaml` | claude | ✅ done v1 | – | agencia conocida 2 años, lanzamiento Q3 no público, deadline 3d |
| variant resim #4 | `variantes/marketing_brief_to_agency_via_ia__loop_new_freelancer_ma_resim_v1.yaml` | claude | ✅ done v1 | – | freelancer primera vez + M&A in progress (Continental Holdings ficticio) — stakes enterprise nivel insider trading |
| practice beats nuevos (pase 4) | `practice_beats/practice_{scrub_strategy_from_brief,brief_completeness}_v1.yaml` | claude | ✅ done v1 | – | 2 nuevos: filtro 3-capas para info en brief externo + checklist 6 elementos para brief completo sin overflow |
| case_template marketing #5 | `casos/marketing_ad_creative_with_competitor_research_v1.yaml` | claude | ✅ done v1 | – | difficulty intermediate; tensión plagio-inadvertido + claims no-verificables sobre competidores; 9 gaps incluyendo naive_plagiarism_dismissal, unlicensed_data_use |
| variant primary #5 | `variantes/marketing_ad_creative_with_competitor_research__loop_emerging_v1.yaml` | claude | ✅ done v1 | – | Loop LATAM emerging vs 3 competidores (Zendesk/Intercom/Konecta_AI), deadline 12h |
| variant resim #5 | `variantes/marketing_ad_creative_with_competitor_research__loop_us_mature_resim_v1.yaml` | claude | ✅ done v1 | – | Loop entrando US mature vs Sierra AI dominante, deadline 6h, legal litigious |
| practice beats nuevos (pase 5) | `practice_beats/practice_{spot_inadvertent_plagiarism,competitive_claim_verification}_v1.yaml` | claude | ✅ done v1 | – | 2 nuevos: detectar plagio inadvertido en output IA + verificar claims sobre competidores antes de publicar |
| case_template marketing #6 | `casos/marketing_attribution_reporting_to_cmo_v1.yaml` | claude | ✅ done v1 | – | difficulty intermediate; tensión attribution con IA puede alucinar correlaciones/causales; 10 gaps incluyendo causal_overclaim, fabricated_number, pretend_full_understanding |
| variant primary #6 | `variantes/marketing_attribution_reporting_to_cmo__loop_weekly_v1.yaml` | claude | ✅ done v1 | – | reporte semanal CMO 3 fuentes (HubSpot/Ads/Sales manual), deadline 4h |
| variant resim #6 | `variantes/marketing_attribution_reporting_to_cmo__loop_board_review_resim_v1.yaml` | claude | ✅ done v1 | – | reporte quarterly al board, 6 fuentes incl TikTok B2B + partner referrals, deadline 8h |
| practice beats nuevos (pase 6) | `practice_beats/practice_{correlation_not_causation,marketing_data_provenance}_v1.yaml` | claude | ✅ done v1 | – | 2 nuevos: distinguir correlación de causalidad + provenance completa de cada cifra |
| case_template marketing #7 | `casos/marketing_content_calendar_under_pressure_v1.yaml` | claude | ✅ done v1 | – | tensión velocidad vs curaduría editorial; 5 steps con artifact_review de 20 ideas calendar; 9 gaps incluyendo repetitive_calendar_blind, no_progression_storyline |
| variant primary #7 | `variantes/marketing_content_calendar_under_pressure__loop_q2_v1.yaml` | claude | ✅ done v1 | – | Loop Q2 awareness build 30 días con 10 piezas/semana, presupuesto $24k |
| variant resim #7 | `variantes/marketing_content_calendar_under_pressure__loop_q3_launch_resim_v1.yaml` | claude | ✅ done v1 | – | Loop Q3 launch 90 días con 25 piezas/semana multi-canal, $84k — escala 3x |
| practice beats nuevos (pase 7) | `practice_beats/practice_{spot_calendar_redundancy,content_progression_storytelling}_v1.yaml` | claude | ✅ done v1 | – | 2 nuevos: detectar redundancia disfrazada en calendar + estructurar en 4 actos (pain→deep dive→solution→social proof) |
| case_template marketing #8 | `casos/marketing_crisis_response_with_ia_v1.yaml` | claude | ✅ done v1 | – | difficulty advanced; crisis pública con IA, riesgo legal, tono humano y escalamiento |
| variant primary #8 | `variantes/marketing_crisis_response_with_ia__loop_viral_complaint_v1.yaml` | claude | ✅ done v1 | – | viral complaint público; presión reputacional y velocidad |
| variant resim #8 | `variantes/marketing_crisis_response_with_ia__loop_data_breach_resim_v1.yaml` | claude | ✅ done v1 | – | data breach / PII exposure; escalamiento legal obligatorio |
| practice beats nuevos (pase 8) | `practice_beats/practice_{crisis_approval_chain,crisis_tone_human}_v1.yaml` | claude | ✅ done v1 | – | 2 nuevos: cadena de aprobación en crisis + tono humano bajo presión |
| schema SQL v0 | `schema/simulador_v0.sql` | codex | ✅ audit passed | ✅ candidate | bloqueantes del audit Claude + Claude CLI resueltos: certificate_export, human_review_queue, versionado sprint_packages, pricing_json, metadata por caso del Sprint, assignment primary/resim, step_key estable y risk_events.dimension_key. **NO correr migracion sin OK explicito de Pablo** |
| modelo de datos doc | `schema/MODELO_DATOS_V0.md` | codex | – | ✅ done | separación template/variant/session/events/evidence — alineado con contrato |
| runtime lógico doc | `runtime/FLUJO_RUNTIME_V0.md` | codex | – | ✅ done | flujo empleado + manager, estados de sesión, event model, regla resim sin modular pesos |
| contrato caso doc | `casos/CONTRATO_CASO.md` | codex | – | ✅ done | 5 step types, 5 dimensiones, sintético: true, transparencia evaluación, practice beat al final |
| rubrica meta doc | `rubricas/RUBRICAS_V0.md` | codex | – | ✅ done | dimensiones públicas + criterios internos + versionado + riesgo en risk_events |
| sprint package meta doc | `sprints/SPRINT_PACKAGE_V0.md` | codex | – | ✅ done | sprint_package vs sprint, regla "venderse antes de UI" |
| handoff coordinación | `coordinacion/HANDOFF.md` | codex | – | ✅ done | reglas Claude↔Codex |
| audit claude → codex | `coordinacion/AUDIT_CLAUDE_2026_05_12.md` | claude | ✅ done v1 | – | revisión cruzada del schema y docs antes de correr migración |
| audit codex → claude | `coordinacion/AUDIT_CODEX_2026_05_12.md` | codex | – | ✅ done | revisión técnica de contrato completo + cambios aplicados |
| field test Fase A | `../field_test_v0/{README,0_experiment_protocol,9_decision_matrix}.md` | claude | ✅ done v1 | ✅ approved_with_fixes | lock experimental creado; Codex corrigio cells evaluables, varianza, completion sin ayuda, risk flags y timeline |
| audit field test Fase A | `coordinacion/AUDIT_FIELD_TEST_CODEX_2026_05_12.md` | codex | – | ✅ done | no hay bloqueo metodologico; no autoriza runtime ni Supabase |
| field test Fase B | `../field_test_v0/{1_participant_brief,2_response_form,3_rubric_human_simplified,4_manager_report_template,5_post_test_interview_protocol,6_calibration_sheet,7_outreach_script,8_judge_prompt_v0}.md` | claude | ✅ done v1 | ✅ approved_with_fixes | Codex corrigio severity critical/high, kappa ponderado, tiempo de outreach y model IDs actuales |
| reporte sintetico Grupo B | `../field_test_v0/manager_report_synthetic_v0.md` | claude | ✅ done v1 | ✅ reviewed | desbloquea buyer validity en paralelo; contiene disclaimer sintetico |
| confidentiality note | `../field_test_v0/confidentiality_note.md` | codex | – | ✅ done | texto ligero; no reemplaza NDA formal si una empresa lo pide |
| estructura operativa field test | `../field_test_v0/{sessions,managers,outreach_tracker.yaml}` | claude | ✅ done v1 | ✅ reviewed_with_fix | Codex anonimizó tracker: solo IDs, no nombres/empresas reales dentro del repo |
| audit field test packet completo | `coordinacion/AUDIT_FIELD_TEST_PACKET_CODEX_2026_05_12.md` | codex | – | ✅ done | pre-registro base en commit `1a522dd`; Pablo dio OK al packet; faltan operador fijo y evaluadores externos antes de sesiones |
| runtime motor mínimo | `lib/simulador/` + `scripts/simulador/validate-contracts.mjs` | codex | – | ✅ done | tipos, constantes, step_key estable, validador de contrato, importer YAML-objeto→seed rows, runtime de eventos/sesión + CLI `npm run simulador:validate`; validator cruza variants y practice beats |
| eval engine stub | `lib/simulador/runtime.ts` | codex | – | ✅ stub | evaluación determinística por gaps/risk_events; LLM-as-judge real queda pendiente antes de producción |

## protocolo de revisión cruzada

obligatorio invocar al otro antes de cerrar:
- primer caso completo
- rúbrica nueva
- primera migración SQL
- copy importante de manager/empleado
- decisión de comprador/pricing

NO obligatorio:
- lint, refactors, estructura de carpetas, wiring técnico menor, fixes locales

## protocolo de bloqueo

si un agente está bloqueado:
1. anota el bloqueo en la sección "bloqueos vivos" abajo
2. continúa con otro artefacto no bloqueado
3. revisa archivos del otro periódicamente
4. cuando el bloqueo se libere, retoma

## bloqueos vivos

ninguno por ahora.

## decisiones cerradas (link a memoria)

- `docs/memory/decision_simulador_arquitectura_v0.md` — separación case_template/variant/session, 5 step types, 5 dimensiones, 4 acciones manager
- `docs/memory/decision_simulador_first_case_marketing.md` — primer caso es marketing_urgent_campaign_pii, ICP marketing_manager LATAM 50-500
- `docs/memory/decision_simulador_second_case_brand_voice.md` — segundo caso, tensión velocidad-vs-voz-de-marca, prueba que el simulador no depende solo de PII
- `docs/memory/decision_simulador_third_case_segmentation.md` — tercer caso difficulty intermediate, tensión bias predictivo en segmentación, primer caso con ambigüedad ética
- `docs/memory/decision_simulador_marketing_cases_4_7.md` — resumen de casos 4 a 7 y sus practice beats
- `docs/memory/decision_simulador_sprint_marketing_completo_v1.md` — cierre del Sprint marketing_30d con 8 casos, 16 variantes y 20 practice beats
- `docs/memory/decision_simulador_runtime_minimo_codex.md` — runtime mínimo en lib/simulador, importer a seed rows, event model y eval stub

## handoff actual

claude completó pase 8 del contrato:
- 8 case_templates ready + 16 variantes (primary + resim por caso)
- 1 rúbrica versionada con LLM-judge specs
- 20 practice_beats poblados
- 2 archivos de copy (manager + empleado)
- 1 sprint package marketing_30d con 8 casos ready (🗄️ RETIRADO 2026-05-20 del contrato activo — histórico, NO vendible; el contrato activo es el golden `sales_agent_followup_pipeline_v1` + el track assembled)
- 7 memorias en docs/memory/ indexadas: arquitectura + primeros 3 casos + casos 4-7 + caso 8 + runtime Codex

codex completó:
- schema SQL candidate con bloqueantes del audit Claude resueltos
- fixes post-audit Claude CLI: pricing_json, sprint_package_cases completo, assignments primary/resim, step_key estable, dimension explicita en risk_events
- runtime lógico y modelo de datos
- runtime técnico mínimo en `lib/simulador/`
- audit técnico cruzado
- actualización de handoff/readme/status durante los pases activos

próximo paso natural:
1. Pablo activa reclutamiento, evaluadores externos y operador wizard-of-oz fijo
2. Claude ayuda a preparar scheduling y uso de scripts existentes, sin crear estructura nueva
3. NO construir runtime, seed SQL, LLM-judge ni Supabase hasta que la fase 0 pase la decision matrix
