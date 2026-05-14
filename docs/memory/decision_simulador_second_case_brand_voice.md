---
type: decision
title: segundo caso canonico del Simulador — marketing_copy_with_brand_voice
date: 2026-05-12
tags: [simulador, segundo-caso, marketing, brand-voice, copy, contrato]
dept: [producto, marketing]
---

# segundo caso canonico del Simulador

## que es

`marketing_copy_with_brand_voice_v1` es el segundo caso canonico del Sprint
`marketing_30d`. Vive en `docs/simulador/contrato_v0/casos/marketing_copy_with_brand_voice_v1.yaml`.

La tension ya no es privacidad/PII. La tension es **velocidad vs voz de marca**:
usar IA para producir copy rapido sin sonar generico, sin diluir el tono y sin
aceptar output "bien escrito" pero off-brand.

## por que va segundo

1. **Valida que el Simulador no depende solo de privacidad.** El primer caso
   prueba datos sensibles; este prueba criterio de marketing puro: contexto,
   validacion, juicio y decision.
2. **Entrena una habilidad que los equipos ya sufren.** En 2026 la pregunta no
   es "puedo generar copy con IA"; es "puedo generar copy que suene a mi marca".
3. **Produce artefactos visibles.** El empleado manipula piezas de copy, detecta
   tone drift, decide que entregar, que editar y que reescribir.
4. **La re-sim prueba transferencia real.** Cambia de B2B corporate-calido a B2C
   irreverente Gen Z. Si el usuario aprendio el principio de anclar tono, mejora;
   si memorizo un tono, falla.

## estructura del caso

1. `data_scope` — elegir inputs para anclar tono: guide summary, ejemplos historicos, brief, audiencia.
2. `llm_beat` — redactar prompt con ejemplos de voz y pedir 5 piezas.
3. `artifact_review` — marcar tone drift, generic positioning, off-target audience, on-brand.
4. `decision_open_short` — decidir cuales piezas entregar, editar o reescribir.
5. `decision_select` — decidir como entregar al equipo/brand lead.

## gaps nuevos

| gap | dimension | severidad |
|---|---|---|
| `ignore_brand_guide` | contexto | high |
| `excessive_context` | contexto | low |
| `accept_tone_drift` | validacion | medium |
| `generic_positioning_blind` | juicio | medium |
| `excessive_iteration` | decision | low |
| `weak_artifact_review` | juicio | low |
| `weak_communication` | decision | low |
| `accept_output_no_validation` | validacion | medium |

## practice beats agregados

- `practice_prompt_with_voice_examples_v1`
- `practice_spot_tone_drift_v1`
- `practice_iterate_with_intent_v1`

## variantes

- primary: `marketing_copy_with_brand_voice__loop_b2b_v1`
  - Loop SaaS B2B
  - tono corporate-calido consultor
  - audiencia ops managers / heads of customer service

- resim: `marketing_copy_with_brand_voice__nubefresh_b2c_resim_v1`
  - NubeFresh D2C ecommerce ficticio
  - tono irreverente casual Gen Z
  - audiencia joven urbana

Ambas variantes usan datos sinteticos.

## impacto en el Sprint marketing_30d

Despues del pase 2, `sprint_marketing_30d.yaml` quedaba con:

- 2 casos `ready`
- 6 casos `planned`
- 7 practice beats activos

Estado actualizado: el siguiente caso (`marketing_segment_with_sensitive_data`)
ya fue escrito como tercer caso canonico. Ver
`decision_simulador_third_case_segmentation.md`.
