---
type: decision
title: arquitectura v0 de "El Simulador" — acuerdo Claude/Codex
date: 2026-05-12
tags: [simulador, arquitectura, contrato, claude-codex, producto, runtime, schema-base]
dept: [producto, desarrollo, orquestador]
---

# arquitectura v0 de El Simulador

> contexto: post-pivote de curso a simulador de criterio IA, Pablo
> decidió arrancar el producto desde cero. Claude (CPO/producto) y
> Codex (eng/integración) convergieron durante el 2026-05-12 en un
> contrato base que vive en `docs/simulador/contrato_v0/`.

## decisión principal

el Simulador NO es la Itera anterior con otro diseño. es una versión
nueva organizada alrededor de un **loop**, no de pantallas:

```
simulación → diagnóstico → práctica → re-simulación → evidencia → acción del manager
```

dentro de "simulación" el sub-flujo del empleado es:
`caso → decisión → evaluación`

## separación de capas (clave)

| Capa | Qué es |
|---|---|
| `case_template` | definición reusable de un caso (steps, rúbrica, gaps, policy) |
| `case_variant` | render específico con `template_var_values` + `inputs_resolved` (incluye sintético: true) |
| `simulation_session` | intento real de un usuario sobre una variante |
| `simulation_step_events` | eventos granulares capturados durante la sesión |

NO mezclar capas en schema aunque el YAML canónico las muestre juntas.

## 5 step types v0 cerrados

- `data_scope` — decidir qué datos usar/anonimizar/bucketizar
- `llm_beat` — interacción controlada con IA real provista por Itera (max 2 turns)
- `artifact_review` — revisar output/documento y marcar problemas
- `decision_select` — elegir entre opciones cerradas
- `decision_open_short` — justificar en texto corto

`tool_pick` vive dentro de `decision_select` hasta que la heurística pida fragmentarlo.

## 5 dimensiones de scoring

| Dimensión | Definición pública |
|---|---|
| `contexto` | qué tan bien encuadras situación, audiencia, tono y restricciones al pedirle a la IA |
| `privacidad` | qué tan bien proteges datos personales y confidenciales en cada paso |
| `validacion` | qué tan rigurosamente verificas el output de la IA antes de usarlo |
| `juicio` | qué tan bien lees riesgos, autoridad y consecuencias antes de actuar |
| `decision` | qué tan clara, justificada y responsable es la acción final |

**riesgo NO es dimensión scoreable independiente.** vive en `risk_events`
y puede dispararse desde cualquier dimensión.

## 4 manager actions

`pilotar | entrenar | pausar | escalar`

reglas de selección documentadas en `contrato_v0/copy/manager_recommendation_templates.md`.

## 5 tipos de evidence v0

- `readiness_dimension_scores`
- `risk_events_detected`
- `decision_replay`
- `transfer_delta` (emitido cuando resim completado)
- `manager_recommendation`

**evidence NO es report.** evidence es data tipada; reports/exports/dashboards
son consumidores.

## decisiones cerradas v0

1. **ICP inicial:** jefe de área (Marketing Director, Head of Sales, Ops Manager), NO CHRO. CHRO llega después con evidencia.
2. **Unidad vendible:** Sprint de equipo (30 días, 8 casos, baseline + resim, reporte).
3. **Runtime:** flow lineal multipasos con inputs controlados + 1-2 LLM beats por caso.
4. **LLM provider v0:** Itera-provided, max 2 turns, no BYO key. Modelo: `itera_default_2026q2`.
5. **Scoring transparency:** dimensiones públicas, criterios + pesos internos. evita gaming sin ocultar qué se mide.
6. **Manager visibility:** agregados + gaps + risk events. NO transcripts individuales por default. excerpts anonimizados si risk_event high.
7. **Practice beat:** al final de la sesión en v0 (preserva narrativa del caso). mid-session = experimento futuro.
8. **Re-simulación:** core, no opcional. misma rúbrica + mismos pesos que primary para preservar comparabilidad.
9. **Datos sintéticos:** TODOS los inputs de ejemplo deben marcarse `synthetic: true`. prohibido data real de cliente en casos canónicos.
10. **Readiness scoring:** absoluto en v0 (banda + score 0-100). relativo a industria cuando haya ≥3 clientes mismo vertical.

## protocolo Claude/Codex

| Rol | Claude | Codex |
|---|---|---|
| área | producto: casos, rúbricas, narrativa, copy, tensión del comprador | implementación: schema, runtime, motor de eval, Supabase, migrations |
| edita | `docs/simulador/contrato_v0/{casos,variantes,rubricas,practice_beats,copy,sprints}/` + `docs/memory/` | `docs/simulador/contrato_v0/{coordinacion,runtime,schema}/` + `app/` + `lib/` + `supabase/migrations/` |

revisión cruzada **obligatoria** antes de:
- cerrar primer caso canónico
- cerrar rúbrica nueva
- correr primera migración SQL
- definir copy importante de manager/empleado
- decisión fuerte de comprador o pricing

revisión **no obligatoria** para: lint, refactors, estructura de carpetas, wiring menor, fixes locales.

## artefactos producidos por Claude en sesión 2026-05-12

- `casos/marketing_urgent_campaign_pii_v1.yaml`
- `variantes/marketing_urgent_campaign_pii__loop_saas_b2b_v1.yaml` (primary)
- `variantes/marketing_urgent_campaign_pii__loop_enterprise_us_resim_v1.yaml` (resim)
- `casos/marketing_copy_with_brand_voice_v1.yaml`
- `variantes/marketing_copy_with_brand_voice__loop_b2b_v1.yaml` (primary)
- `variantes/marketing_copy_with_brand_voice__nubefresh_b2c_resim_v1.yaml` (resim)
- `rubricas/rubric_marketing_v1.yaml` (público + interno con LLM-judge specs)
- `practice_beats/practice_{anonymize,validate,objection,spot_claims,prompt_with_voice_examples,spot_tone_drift,iterate_with_intent}_v1.yaml`
- `copy/manager_recommendation_templates.md`
- `copy/employee_runtime_strings.md`
- `sprints/sprint_marketing_30d.yaml`

## artefactos producidos por Codex en sesión 2026-05-12

- `README.md` (canónico)
- `coordinacion/HANDOFF.md`
- `runtime/FLUJO_RUNTIME_V0.md`
- `casos/CONTRATO_CASO.md`
- `schema/MODELO_DATOS_V0.md`
- `schema/simulador_v0.sql` (candidate; no aplicado)
- `coordinacion/AUDIT_CODEX_2026_05_12.md`
- estructura de carpetas: `casos/`, `variantes/`, `rubricas/`, `practice_beats/`, `copy/`, `sprints/`, `schema/`, `runtime/`, `coordinacion/`

## fuentes

- conversación Pablo↔Claude↔Codex 2026-05-12 (via copy/paste manual)
- previo: `decision_marketing_simulator_framing_v1.md`, `decision_tesis_concentracion_plataforma.md`
- comparables externos: R24 (Wharton, Section AI, Forage, Attensi, Mursion, Whatfix Mirror)

## próximo paso

1. Claude escribe los 6 casos canónicos restantes del Sprint marketing_30d (siguiente: `marketing_segment_with_sensitive_data`).
2. Codex implementa importer YAML -> SQL seed/candidate.
3. Codex implementa runtime mínimo + evaluador stub determinístico antes del LLM-as-judge.
4. La migración Supabase se prepara después, pero no se corre sin aprobación explícita de Pablo.
4. Pablo decide pricing definitivo (`commercial.pricing_band_usd` en sprint package es tentativo).
