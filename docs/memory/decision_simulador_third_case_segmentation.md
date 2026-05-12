---
type: decision
title: tercer caso canónico del Simulador — marketing_segment_with_sensitive_data
date: 2026-05-12
tags: [simulador, tercer-caso, marketing, segmentacion, bias, privacidad-behavioral, contrato]
dept: [producto, marketing, legal]
---

# tercer caso canónico del Simulador

## qué es

`marketing_segment_with_sensitive_data_v1` es el tercer caso canónico del
Sprint marketing_30d. vive en
`docs/simulador/contrato_v0/casos/marketing_segment_with_sensitive_data_v1.yaml`.

`difficulty: intermediate` (no baseline) — el primer caso del Sprint con
ambigüedad ética donde "respuesta correcta" requiere matiz.

## por qué va tercero

el caso 1 enseñó privacidad como **no exponer PII en output público**.
el caso 3 introduce un riesgo distinto: **privacidad behavioral + bias
predictivo en segmentación con IA**. el LLM puede sugerir segmentos
"eficientes" que perpetúan discriminación o que identifican individuos.

esto es importante porque la mayoría de problemas regulatorios de
marketing post-2024 (GDPR, leyes LATAM) NO vienen de exponer PII en
campañas — vienen de **procesamiento algorítmico de behavioral data
sin justificación legítima**. el Simulador tiene que enseñar criterio
sobre esto, no solo sobre "datos personales en LinkedIn".

## decisiones de producto en este caso

### tensión central

enriquecer segmentación con IA sin (a) exponer behavioral data sensible,
(b) introducir bias por seniority/region/company_size, (c) crear segmentos
tan chicos que identifiquen individuos. tres trampas distintas dentro
del mismo caso.

### estructura (5 steps)

1. `data_scope` — elegir qué campos del CRM pasar al LLM. la opción
   "all_18_fields_raw" incluye PII; las opciones intermedias requieren
   bucketización.
2. `llm_beat` — pedirle al LLM segmentos sugeridos con data anonimizada
   + followup sobre incomodidad ética.
3. `artifact_review` — marcar bias por segmento (bias_by_seniority,
   bias_by_region, bias_by_company_size, low_intent_proxy,
   exposes_individual_lead, sound_segment).
4. `decision_select` — qué hacer con los segmentos propuestos
   (4 opciones: usar top 2 / aceptar todos / reformular con iteración /
   skip segmentation).
5. `decision_open_short` — responder al brand lead que pregunta si el
   uso de behavioral data + IA es legal/ético.

### variantes diseñadas

- **primary:** Loop LATAM régimen regulatorio informal (LFPDPPP México +
  Ley 1581 Colombia, sin DPO), CRM 8.4k leads, campaña a 5k. trampa:
  el empleado podría tratar la falta de DPO como "no tengo que
  consultar a nadie".

- **resim:** NordLinx EU GDPR strict con DPO interno (Maja Korhonen),
  RoPA + DPIA obligatorios, CRM 62k leads, campaña a 50k (10x escala).
  trampa opuesta: el empleado podría aplicar standards LATAM en
  contexto donde escalar a DPO es obligatorio.

el contraste prueba si el empleado entendió que **la operación correcta
depende del régimen aplicable**, no de un proceso fijo.

### gaps definidos (9)

| gap | dimensión | severidad |
|---|---|---|
| `expose_pii_in_segmentation` | privacidad | high |
| `confused_data_policy` | privacidad | medium |
| `segment_too_small_individual_id` | privacidad | high |
| `bias_blindness` | juicio | medium |
| `accept_output_no_validation` | validación | medium |
| `overcorrection` | decisión | low |
| `deflection` | juicio | medium |
| `dishonest_to_peer` | juicio | high |
| `excessive_concession` | decisión | low |

3 gaps comparten dimensión `juicio` (deflection, dishonest_to_peer,
bias_blindness) — el caso enfatiza juicio en interacciones con peer
+ con data ambigua, distinto del caso 1 donde juicio era contra
autoridad (VP).

### practice_beats nuevos

- `practice_spot_segmentation_bias_v1`: detectar criterios demográficos
  solos como red flag; regla "cada criterio debe responder a qué
  señal de intent o ajuste estoy usando"
- `practice_segment_size_protections_v1`: regla del k-anonimato light
  (k=25 para outbound); si segmento queda chico, relaja un criterio
- `practice_transparent_peer_response_v1`: estructura confirma →
  principio → next step ante pregunta de compliance/peer

## diferencia clave vs casos 1 y 2

| Aspecto | Caso 1 (PII) | Caso 2 (brand voice) | Caso 3 (segmentation) |
|---|---|---|---|
| difficulty | baseline | baseline | intermediate |
| pregunta central | ¿proteges datos personales? | ¿anclas tono? | ¿discriminas bien entre criterios legítimos y sesgados? |
| autoridad presente | VP que dice "no metas legal" | VP con deadline | brand lead que pregunta ex post |
| ambigüedad ética | baja (PII = mal claro) | baja (drift = mal claro) | alta (engagement score = legal pero ético depende) |
| evaluación judge | mayormente determinístico | mixto | mayormente LLM-judge con matiz |

el caso 3 requiere que el judge LLM evalúe matiz (no solo detectar
palabras clave). esto es prueba de fuego para el motor de evaluación
de Codex.

## decisiones aún abiertas

1. **calibración del LLM-judge en casos intermediate.** el judge tiene
   que distinguir entre "usó engagement_score con justificación
   responsable" vs "usó engagement_score como filtro arbitrario". la
   rúbrica v1 da criterios pero la calibración requiere data real —
   posiblemente revisión humana de las primeras 50 sesiones.

2. **escalado a Enterprise:** el resim NordLinx EU sugiere que el
   Sprint marketing_30d puede extenderse a un Sprint marketing_30d_enterprise
   con casos `intermediate` y `advanced`. discusión pendiente con Pablo.

## fuentes

- contrato: `docs/simulador/contrato_v0/casos/marketing_segment_with_sensitive_data_v1.yaml`
- variantes: `loop_latam_v1` (primary), `nordlinx_eu_resim_v1` (resim)
- arquitectura general: `decision_simulador_arquitectura_v0.md`
- segundo caso (precedente): `decision_simulador_second_case_brand_voice.md`
