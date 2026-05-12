# Field Test v0 — paquete de validación experimental del Simulador

> **propósito:** validar las tres formas de validez del caso 1
> (`marketing_urgent_campaign_pii_v1`) **antes** de construir runtime,
> schema migration o cualquier UI.
>
> **estado:** Fase A en redacción (núcleo experimental). Codex audita los
> 3 archivos del núcleo antes de que Pablo apruebe. Sin OK explícito de
> Pablo, NO se ejecuta ninguna sesión y NO se redactan los 7 archivos
> restantes del paquete.

---

## las 3 validez que estamos probando

1. **face validity** — ¿el caso se siente real para un Marketing Manager LATAM SaaS B2B?
2. **construct validity** — ¿el caso diferencia entre alguien con criterio IA real y alguien que solo "sabe usar ChatGPT"?
3. **buyer validity** — ¿el reporte ayuda a un manager a tomar una acción concreta?

si una de las tres falla, **runtime/UI/schema no importan** — no construimos hasta resolver el problema de validez.

---

## qué NO es este paquete

- NO es producción
- NO es marketing
- NO es venta
- NO es validación de pricing
- NO es validación del Sprint completo de 8 casos
- NO es validación con n estadísticamente significativo (n=5 es señal direccional, no conclusión)

es **un experimento conductual sin código** para decidir si el caso 1 merece ser bajado a runtime.

---

## estructura del paquete

### Fase A — lock experimental (este commit)

| archivo | propósito | autor |
|---|---|---|
| `README.md` | mapa, roles, reglas críticas | claude |
| `0_experiment_protocol.md` | pre-registro de hipótesis + métricas + límites | claude |
| `9_decision_matrix.md` | decision tree mantener/iterar/matar post-fase-0 | claude |

los 3 archivos del núcleo se commitean **antes** de que existan los materiales que toca participante alguno. esto es pre-registro: no se puede reescribir el protocolo después de ver resultados.

### Fase B — packet de campo (después de OK de Pablo en Fase A)

| archivo | propósito | autor |
|---|---|---|
| `1_participant_brief.md` | caso 1 rendered + instrucciones de 15-20 min | claude |
| `2_response_form.md` | formulario estructurado por step (convertible a Google Form) | claude |
| `3_rubric_human_simplified.md` | bandas A/M/B + criterios públicos (rúbrica **ciega**) | claude |
| `4_manager_report_template.md` | plantilla del reporte que ve el manager (1 participante) | claude |
| `5_post_test_interview_protocol.md` | 8 preguntas estructuradas post-sesión | claude |
| `6_calibration_sheet.md` | tabla humano1 × humano2 × LLM-judge por cell | claude |
| `7_outreach_script.md` | DM/email para reclutar 5 participantes + script incentivo | claude |
| `8_judge_prompt_v0.md` | prompt versionado del LLM-judge (congelado pre-sesión) | claude |

---

## roles

| rol | responsabilidad | quién |
|---|---|---|
| autor de producto + research aplicada | redactar protocolo, matriz, packet completo, analizar evidencia post-test | claude |
| guardián técnico/metodológico | auditar consistencia experimental, garantizar reproducibilidad técnica, construir runtime SOLO si pasa la matriz | codex |
| sponsor + reclutamiento + decisión | activar red personal para reclutamiento, aprobar core experimental, decidir si se continúa | pablo |
| **evaluadores humanos (no Itera)** | 2 consultores externos senior marketing/ops LATAM contratados ad-hoc — califican con rúbrica ciega | externos contratados |
| **operador wizard-of-oz** | quien copia/pega prompts del participante a DeepSeek/Gemini y devuelve la respuesta — NO improvisa | pablo o claude (uno fijo) |
| **3er revisor (contingente)** | tie-breaker si humano1 vs humano2 kappa < 0.2 | externo contratado on-demand |

**regla crítica de roles:** Pablo, Claude y Codex NO pueden ser evaluadores humanos. los tres construyeron el caso; tenemos sesgo de autor.

---

## reglas críticas (no negociables)

### R1 — pre-registro antes de la sesión 1

`0_experiment_protocol.md` y `9_decision_matrix.md` deben estar
commiteados con git hash visible **antes** de que la primera sesión se
ejecute. cambios post-sesión al protocolo invalidan la corrida.

### R2 — rúbrica ciega para evaluadores externos

los 2 revisores externos reciben:
- `3_rubric_human_simplified.md` (versión pública, bandas A/M/B)
- ejemplos mínimos de formato

**NO reciben:**
- `gap_trigger_logic` del case_template
- pesos internos de `rubric_marketing_v1`
- hipótesis esperadas de Itera
- output del LLM-judge antes de calificar

si reciben gaps esperados, validamos obediencia a rúbrica, no criterio independiente.

### R3 — LLM-judge corre DESPUÉS de los humanos

orden obligatorio en cada sesión:
1. participante completa caso
2. humano1 califica usando rúbrica ciega
3. humano2 califica usando rúbrica ciega (sin ver humano1)
4. LLM-judge corre sobre respuestas (sin ver humano1 ni humano2)
5. calibración: 3 columnas comparadas en `6_calibration_sheet.md`

el judge no puede contaminar evaluación humana ni viceversa.

### R4 — wizard-of-oz reproducible

- 1 modelo LLM fijo para el LLM beat del caso (DeepSeek primario v1, Gemini fallback v1)
- 1 modelo LLM fijo para el judge (definido en `8_judge_prompt_v0.md`)
- temperature: 0
- system prompt: congelado (versionado en `8_judge_prompt_v0.md`)
- timestamp de cada sesión + cada llamada al LLM
- operador NO improvisa respuestas; solo copia/pega

### R5 — sample size limit honesto

con n=5 participantes + n=3 managers:
- evidencia sobre el caso es **direccional, no conclusiva**
- el LLM-judge calibration es **hipótesis para fase 1, no validación**
- validación estadística del judge requiere n ≥ 20 sesiones (queda fuera de fase 0)

esto debe quedar explícito en cualquier reporte que salga de fase 0.

### R6 — datos sintéticos siempre

el caso 1 ya está marcado `synthetic: true` en su variante. ninguna pieza del packet usa data real de cliente o de Itera. participantes saben que están en un experimento.

### R7 — confidentiality note, no NDA formal

participantes firman un "confidentiality note" simple (1 párrafo: no comparten el caso ni el reporte por 90 días). NDA formal solo si el participante viene de empresa con compliance estricto.

---

## flujo de uso del paquete

```text
día 1-3   Fase A: claude redacta núcleo experimental
día 3     codex audita núcleo (consistencia, métricas, dependencias)
día 3-4   pablo aprueba/corrige; commit core con git hash
día 3-7   pre-warming outreach (pablo activa red personal en paralelo)
día 4-6   Fase B: claude redacta packet de campo
día 6     codex audita packet (rúbrica ciega, judge congelado, captura serviría a runtime)
día 7-10  reclutamiento formal de 5 participantes + 3 managers + 2 revisores
día 10-21 Fase C: ejecución manual de 5 sesiones
día 21-24 calibración humano-humano + humano-judge
día 24-28 Fase D: análisis de las 3 validez + evaluación contra decision matrix
día 28    decisión: construir runtime, iterar packet, o matar caso
```

timeline total: ~4 semanas. el critical path es reclutamiento.

---

## qué se entrega al cierre de Fase D

- 1 reporte de validación de las 3 validez (face, construct, buyer)
- 1 tabla de calibración completa (`6_calibration_sheet.md` poblada)
- 1 análisis del LLM-judge contra humanos (direccional)
- 1 recomendación: **construir runtime / iterar caso / iterar rúbrica / matar caso**
- evidencia raw archivada en `field_test_v0/sessions/<participant_id>/`

después de Fase D:

- si pasa la matriz: Codex arranca seed SQL + importer + runtime mínimo
- si no pasa: iteramos packet + caso + rúbrica, repetimos con 3 nuevos participantes

---

## qué NO entregamos al cierre de Fase D

- producto en producción
- UI bonita
- migración Supabase corrida
- contratos firmados con clientes pagados
- segundo Sprint
- estudio estadístico publicable (n=5 no soporta esa conclusión)

---

## consistencia con contrato_v0

este paquete asume y respeta:

- el **caso canónico** `marketing_urgent_campaign_pii_v1` (no se modifica)
- la **rúbrica** `rubric_marketing_v1@1.0.0` (no se modifica; se "simplifica para participantes" en `3_rubric_human_simplified.md` quitando internal weights)
- las **5 dimensiones** del scoring (no se modifican)
- la **regla de no transcript individual al manager** del manager_recommendation_templates

si fase 0 genera evidencia para cambiar caso/rúbrica/dimensiones, se documenta en `field_test_v0/sessions/<sesión>_findings.md` y se versiona como `v2` en contrato_v0. **no se modifica v1.**

---

## bitácora de cambios al paquete

| fecha | autor | cambio | razón |
|---|---|---|---|
| 2026-05-12 | claude | creación del paquete + 3 archivos Fase A | arrancar lock experimental |
