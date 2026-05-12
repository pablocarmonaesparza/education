# STATUS — contrato_v0 (coordinación Claude/Codex)

> archivo en tiempo real. cada agente actualiza su columna después de cada commit. no editar la columna del otro.

última sincronización: 2026-05-12 (claude actualizando)

> nota: codex creó carpetas `coordinacion/`, `runtime/`, `schema/` (vacías por ahora). claude no las toca.

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
| sprint marketing_30d | `sprints/sprint_marketing_30d.yaml` | claude | ✅ done v1 | – | SKU vendible: 8 casos (1 ready + 7 planned), pricing tentativo $79-199, deliverables manager+empleado |
| schema SQL v0 | `schema/simulador_v0.sql` | codex | 🟡 audit | ✅ draft | claude auditó: 2 bloqueantes (certificate_export en reports + human_review_queue), 2 recomendables (sprint_packages.version + evidence_kind constraint). detalle en `coordinacion/AUDIT_CLAUDE_2026_05_12.md` |
| modelo de datos doc | `schema/MODELO_DATOS_V0.md` | codex | – | ✅ done | separación template/variant/session/events/evidence — alineado con contrato |
| runtime lógico doc | `runtime/FLUJO_RUNTIME_V0.md` | codex | – | ✅ done | flujo empleado + manager, estados de sesión, event model, regla resim sin modular pesos |
| contrato caso doc | `casos/CONTRATO_CASO.md` | codex | – | ✅ done | 5 step types, 5 dimensiones, sintético: true, transparencia evaluación, practice beat al final |
| rubrica meta doc | `rubricas/RUBRICAS_V0.md` | codex | – | ✅ done | dimensiones públicas + criterios internos + versionado + riesgo en risk_events |
| sprint package meta doc | `sprints/SPRINT_PACKAGE_V0.md` | codex | – | ✅ done | sprint_package vs sprint, regla "venderse antes de UI" |
| handoff coordinación | `coordinacion/HANDOFF.md` | codex | – | ✅ done | reglas Claude↔Codex |
| audit claude → codex | `coordinacion/AUDIT_CLAUDE_2026_05_12.md` | claude | ✅ done v1 | – | revisión cruzada del schema y docs antes de correr migración |
| runtime motor | `app/simulator-system/` o `lib/simulador/` | codex | – | ⏳ pending | ejecuta steps + captura eventos |
| eval engine | `lib/simulador/evaluation/` | codex | – | ⏳ pending | LLM-as-judge contra rúbrica |

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

## handoff actual

claude completó pase 1 del contrato:
- 1 case_template + 2 variantes (primary + resim)
- 1 rúbrica versionada con LLM-judge specs
- 4 practice_beats poblados
- 2 archivos de copy (manager + empleado)
- 1 sprint package vendible (marketing_30d)
- 2 memorias en docs/memory/

ajustes hechos post-audit de archivos Codex (HANDOFF + FLUJO_RUNTIME + CONTRATO_CASO):
- renombrado caso a `_v1.yaml` para alinear convención
- `synthetic: true` agregado a `inputs_resolved` en ambas variantes
- `transfer_delta` agregado a evidence_emitted
- nota de scoring resim alineada (no modular pesos)
- copy del manager incluye reglas de visibilidad + excerpts anonimizados

próximo paso natural cuando codex esté listo:
1. revisión cruzada de Codex sobre el contrato completo (audit del primer caso, rúbrica, sprint)
2. Codex deriva schema SQL del contrato (no correr migración sin revisión cruzada de claude)
3. Claude empieza segundo caso del sprint: `marketing_copy_with_brand_voice`
