---
type: decision
title: primer caso canónico del Simulador — marketing_urgent_campaign_pii
date: 2026-05-12
tags: [simulador, primer-caso, marketing, pii, design-partner, contrato]
dept: [producto, marketing, ventas]
---

# primer caso canónico del Simulador

## qué es

`marketing_urgent_campaign_pii_v1` es el primer caso canónico del Simulador.
vive en `docs/simulador/contrato_v0/casos/marketing_urgent_campaign_pii_v1.yaml`.
es la unidad de producto desde la cual se deriva schema, runtime, motor de
evaluación y SKU vendible.

## por qué este caso primero

1. **tensión universal en marketing LATAM 2026:** velocidad-vs-privacidad
   bajo presión del VP es la situación #1 que un Marketing Director con
   equipo de 6-12 personas vive cada trimestre. ningún comprador
   potencial lo va a leer y decir "esto no me pasa".

2. **toca las 5 dimensiones simultáneamente:** contexto (encuadrar la
   tarea), privacidad (datos sensibles), validación (output de IA con
   cifras inventadas), juicio (objetar a la jefa, escalar a legal),
   decisión (cómo entregar y comunicar). caso "comprehensivo" para
   validar maquinaria.

3. **resim con contraste fuerte:** enterprise US con DPO disponible y
   datos comerciales sensibles cambia el comportamiento esperado en
   `juicio` sin cambiar la rúbrica. valida que el sistema de variantes
   funciona conceptualmente.

4. **ICP claro:** Marketing Manager / Growth Marketer en SaaS B2B
   mid-market LATAM 50-500 ppl. alineado con `decision_marketing_simulator_framing_v1.md`.

## decisiones de producto en este caso

### estructura (5 steps)

1. `data_scope` — qué hacer con los 6 campos del CSV
2. `llm_beat` — redactar prompt + recibir 3 ángulos del modelo + decidir qué usar
3. `artifact_review` — marcar problemas del output (cifras inventadas, PII, claims débiles)
4. `decision_select` — cómo entregar a la VP (4 opciones, 2 correctas con matiz)
5. `decision_open_short` — responder a propuesta de uso de PII para segmentación

### tensiones diseñadas

- **velocidad vs privacidad** (steps 1, 2)
- **autoridad vs criterio** (steps 4, 5 — la VP no quiere meter a legal)
- **eficiencia vs validación** (step 3 — facil aceptar output que "suena bien")
- **deferir vs objetar** (step 5 — propuesta plausible pero problemática)

### gaps definidos (7)

| gap | dimensión | severidad |
|---|---|---|
| `expose_pii` | privacidad | high |
| `accept_output_no_validation` | validación | medium |
| `poor_context` | contexto | medium |
| `weak_decision_justification` | decisión | low |
| `no_risk_flag_upward` | juicio | high |
| `weak_artifact_review` | juicio | medium |
| `misread_authority` | juicio | low |

cada gap mapeado a practice_beat correspondiente.

### datos sintéticos

- 60 filas de feedback de clientes con voz LATAM 2026 (problemas reales: SLA tracker, integración WhatsApp Business, billing-SAT México, jerga gringa en reportes)
- empresas inventadas con sufijos plausibles (.mx, .cl, .co)
- revenue_potential en banda PYME (18k-96k USD anual)
- 8 sample_rows visibles en la variante primary
- 8 sample_rows distintos en variante resim enterprise US

### resim variant

- mismo template, contraste en 3 ejes: governance (informal → strict_with_DPO), data_type (customer_feedback → sales_pipeline_with_open_deals), time_pressure (16h → 4h)
- mismas dimensiones, mismos pesos (regla v0: no modular pesos entre primary y resim para preservar comparabilidad de `transfer_delta`)
- delay default: 7 días

## decisiones aún abiertas para Pablo

1. **pricing band del Sprint marketing_30d:** tentativo $79-199 per_seat_per_sprint, team_minimum 5 seats. necesita validación con design partners.

2. **diseño visual:** zero. Pablo dijo "primero quiero validar el producto, después UX/UI". el contrato vive en YAML/MD. Codex implementa runtime sin diseño pulido.

3. **launch como SKU:** sprint_marketing_30d.operational dice que NO se cobra precio full por menos de 8 casos `status: ready`. modo "design partner" con 1-3 casos vale para validar maquinaria.

## fuentes

- contrato:  `docs/simulador/contrato_v0/casos/marketing_urgent_campaign_pii_v1.yaml`
- rúbrica: `docs/simulador/contrato_v0/rubricas/rubric_marketing_v1.yaml`
- sprint: `docs/simulador/contrato_v0/sprints/sprint_marketing_30d.yaml`
- arquitectura general: `docs/memory/decision_simulador_arquitectura_v0.md`
- ICP + categoría: `docs/memory/decision_marketing_simulator_framing_v1.md`
- tesis: `docs/memory/decision_tesis_concentracion_plataforma.md`

## próximo caso a escribir (en orden de prioridad del sprint package)

`marketing_copy_with_brand_voice` — redactar copy con voz de marca usando IA sin diluir tono. dimensiones enfatizadas: contexto, validación, decisión. tensión: cómo usas IA para escribir copy que suena a tu marca y no a "IA genérica".

Claude escribe el contenido completo, Codex revisa antes de bajar a schema final.
