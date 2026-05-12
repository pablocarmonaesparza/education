# 2 — formulario de respuesta del participante

> **propósito.** captura estructurada de las respuestas del participante
> en los 5 steps del caso. convertible directamente a Google Form para
> ejecución de sesión.
>
> **mecánica.** el participante completa cada step en orden. el operador
> tiene este mismo formulario abierto en paralelo y captura timestamps
> + estado de cada step. NO hay back navigation entre steps (forzar
> compromiso a cada decisión).
>
> **versión:** 1.0.0 — congelada al commit de Fase B.

---

## convenciones de captura

- **timestamp:** registrado por operador al inicio y fin de cada step
- **respuestas en texto libre:** capturadas literalmente como el
  participante las escribió (sin reformulación del operador)
- **opciones múltiples:** capturadas como id de la opción seleccionada
- **clarificaciones del operador:** anotadas en bitácora separada
  (`session_log.yaml`); cuentan para la métrica "completion sin ayuda"
  de la decision matrix

## output YAML por sesión

cada sesión produce `field_test_v0/sessions/<participant_id>/responses.yaml` con esta estructura:

```yaml
participant_id: P001
session_date: 2026-05-15
operator: pablo
duration_total_min: 19
duration_per_step_min:
  step_1: 3
  step_2_main: 4
  step_2_followup: 2
  step_3: 4
  step_4: 2
  step_5: 4
clarifications_count:
  procedural: 1
  content_or_criteria: 0  # >0 marca la sesión como "con ayuda"
abandoned_step: null      # o el id del step donde abandonó
```

el detalle de las respuestas por step va en secciones separadas debajo.

---

## paso 1 — preparación de datos

> *(operador comparte al participante el dataset completo de 60 filas
> antes de este paso.)*

**pregunta al participante:**

> *"vas a recibir el dataset de 60 filas (mismo formato que viste en
> tu brief). antes de pasar cualquier cosa al modelo, ¿qué decides
> hacer con cada uno de los 6 campos?*
>
> *para cada campo elige una opción:*
> - *usar tal cual (sin transformación)*
> - *transformar (anonimizar, bucketizar, o extraer tema)*
> - *descartar (no incluir)*"

**captura:**

```yaml
step_1:
  fields_decisions:
    name:
      action: keep | transform | drop
      transformation_method: null | anonymize | bucket | extract_theme | other
      transformation_description: null | <texto libre del participante explicando qué transformación>
    email:
      action: keep | transform | drop
      transformation_method: null | anonymize | bucket | extract_theme | other
      transformation_description: null | <texto>
    company:
      action: keep | transform | drop
      transformation_method: null | anonymize | bucket | extract_theme | other
      transformation_description: null | <texto>
    complaint_or_praise:
      action: keep | transform | drop
      transformation_method: null | anonymize | bucket | extract_theme | other
      transformation_description: null | <texto>
    revenue_potential_usd:
      action: keep | transform | drop
      transformation_method: null | anonymize | bucket | extract_theme | other
      transformation_description: null | <texto>
    signed_at:
      action: keep | transform | drop
      transformation_method: null | anonymize | bucket | extract_theme | other
      transformation_description: null | <texto>
  reasoning_short: |
    <texto libre del participante: ¿por qué tomó estas decisiones de campo?
    máx 60 palabras>
  timestamp_start: ISO-8601
  timestamp_end: ISO-8601
```

**operador presenta así (en el form):**

```
campo            | acción (radio buttons)        | si transformar, ¿cómo? (texto)
-----------------+-------------------------------+------------------------------
name             | ( ) usar  ( ) transformar  ( ) descartar | _______________
email            | ( ) usar  ( ) transformar  ( ) descartar | _______________
company          | ( ) usar  ( ) transformar  ( ) descartar | _______________
complaint_or_praise | ( ) usar  ( ) transformar  ( ) descartar | _______________
revenue_potential_usd | ( ) usar  ( ) transformar  ( ) descartar | _______________
signed_at        | ( ) usar  ( ) transformar  ( ) descartar | _______________

¿por qué decidiste así? (máx 60 palabras): ______________________________________
```

---

## paso 2 — interacción con el modelo (llm_beat)

### sub-paso 2A — redactar prompt

**pregunta al participante:**

> *"ya scopeaste los datos. ahora redacta el prompt completo que le
> enviarías al modelo para obtener 3 ángulos de campaña. recuerda:*
> - *el dataset (con tus decisiones del paso 1)*
> - *el brief de Camila*
> - *deadline 9 AM*
> - *audiencia: LinkedIn ads + email a prospects*
>
> *escribe el prompt como si fueras a copiarlo y pegarlo en el modelo
> ahora. el operador lo va a usar literal."*

**captura:**

```yaml
step_2_main:
  user_prompt: |
    <texto literal del prompt redactado por el participante>
  prompt_length_chars: <int>
  data_attached_in_prompt:
    raw_dataset: true | false  # ¿pegó las filas crudas?
    bucketed_summary: true | false
    none: true | false
  timestamp_prompt_submitted: ISO-8601
```

### sub-paso 2B — operador envía al modelo

**el operador:**
1. abre sesión nueva en DeepSeek (modelo `deepseek-chat`, temperature 0)
2. copia literal el prompt del participante
3. pega
4. envía
5. copia la respuesta literal
6. devuelve la respuesta al participante en el chat de la sesión

**captura:**

```yaml
step_2_llm_response:
  model_used: deepseek-chat
  temperature: 0
  fallback_triggered: false  # true si DeepSeek falló y usamos Gemini
  fallback_model: null | gemini-3.1-flash-lite
  model_response_full: |
    <texto literal de la respuesta del LLM>
  response_length_chars: <int>
  timestamp_response_received: ISO-8601
  retry_count: 0  # si el modelo falló y reintentamos
```

**si max_turns: 2 se activa** (participante decide pedir un segundo turn al modelo):

```yaml
step_2_turn_2:
  user_prompt_turn_2: |
    <texto literal>
  model_response_turn_2: |
    <texto literal>
  timestamp_turn_2_received: ISO-8601
```

### sub-paso 2C — followup decision

**pregunta al participante:**

> *"mira el output del modelo. en menos de 80 palabras:*
> *¿qué de esos ángulos vas a usar, qué vas a descartar y qué necesitas
> validar antes de mandar a Camila?"*

**captura:**

```yaml
step_2_followup:
  text: |
    <texto literal del participante, máx 320 chars>
  char_count: <int>
  mentions_validation: true | false   # determinístico: contiene "valid", "verif", "checar", "confirmar"
  mentions_discard: true | false
  mentions_use: true | false
  timestamp_end: ISO-8601
```

**operador presenta así:**

```
campo                    | input
-------------------------+--------------------------------------------
tu prompt al modelo:     | <textarea grande, sin límite>

[botón: enviar al modelo]
[espera ~15 segundos]
[respuesta del modelo aparece como bloque de texto solo lectura]

quieres pedirle un segundo turn al modelo?  [ ] sí  [ ] no
si sí, tu segundo prompt:  | <textarea>

ahora en menos de 80 palabras:
¿qué del output vas a usar, descartar, validar?  | <textarea, max 320 chars, contador visible>
```

---

## paso 3 — artifact_review (revisión del output)

> *(el "output del modelo" que se revisa aquí es la respuesta capturada
> en step_2. si hubo 2 turns, se revisa la respuesta del último turn.)*

**pregunta al participante:**

> *"copio aquí el output que generó el modelo. marca para cada segmento
> de la respuesta qué problema(s) tiene, si los hay. puedes marcar
> múltiples problemas por segmento."*

**operador segmenta el output:** divide el output del modelo en N
"segmentos" (típicamente N = 3, uno por ángulo de campaña sugerido).
si la respuesta no se divide naturalmente, el operador la divide en
3 párrafos consecutivos.

**captura:**

```yaml
step_3:
  segments_count: 3  # típicamente; puede variar
  segments:
    - segment_id: 1
      segment_text: |
        <texto literal del segmento del LLM output>
      flagged_targets:  # array de targets marcados por el participante
        - unverifiable_claim
        - exposed_sensitive_data
        - weak_segment_logic
        - generic_positioning
      participant_note_short: |
        <texto libre opcional explicando por qué marcó eso, máx 40 palabras>
    - segment_id: 2
      segment_text: |
        <texto literal>
      flagged_targets: []  # vacío si "no hay problemas"
      participant_note_short: null
    - segment_id: 3
      segment_text: |
        <texto literal>
      flagged_targets:
        - generic_positioning
      participant_note_short: |
        <texto>
  timestamp_start: ISO-8601
  timestamp_end: ISO-8601
```

**operador presenta así:**

```
segmento 1:
"<texto del primer segmento del output del LLM>"

problemas (marca todos los que apliquen):
[ ] cifra o claim sin evidencia (unverifiable_claim)
[ ] dato sensible expuesto (exposed_sensitive_data)
[ ] lógica de segmentación débil (weak_segment_logic)
[ ] posicionamiento genérico (generic_positioning)
[ ] sin problemas — está bien como está

nota corta (opcional, ¿por qué?): ____________________________

---

segmento 2:
"<texto del segundo segmento>"

[mismo formato]

---

segmento 3:
"<texto del tercer segmento>"

[mismo formato]
```

---

## paso 4 — entrega a Camila (decision_select)

**pregunta al participante:**

> *"Camila te pide los ángulos por slack. ¿cómo se los entregas?
> elige UNA opción."*

**captura:**

```yaml
step_4:
  option_selected: clean_bullets | bullets_with_context | bullets_plus_legal_flag | raw_llm_output
  option_label_displayed: |
    <el label literal que vio el participante>
  reasoning_short: |
    <texto libre opcional del participante explicando por qué eligió eso,
    máx 50 palabras>
  timestamp_start: ISO-8601
  timestamp_end: ISO-8601
```

**operador presenta así:**

```
elige UNA opción:

( ) los 3 ángulos finales en bullets, listos para campaña
( ) los 3 ángulos + nota corta de qué validaste, qué descartaste y qué riesgo viste
( ) los 3 ángulos + sugerencia de que legal revise el copy antes de lanzar
( ) le mando el output crudo del LLM, total tiene buen criterio y ella decide

¿por qué elegiste esta? (opcional, máx 50 palabras): ______________________________
```

> **regla:** después de elegir, NO se puede regresar a cambiar.

---

## paso 5 — respuesta a propuesta de Camila (decision_open_short)

**pregunta al participante:**

> *"Camila te contesta:*
>
> *"gracias. oye, ¿podemos usar también el revenue_potential para
> priorizar a quién mandamos el email? rankeamos top 20% y a ellos
> primero."*
>
> *¿qué le respondes? (máx 280 caracteres)"*

**captura:**

```yaml
step_5:
  text: |
    <texto literal del participante, máx 280 chars>
  char_count: <int>
  accepts_proposal: true | false  # heurística inicial; humano1/humano2 validan
  proposes_alternative: true | false
  alternative_described: |
    <si hay alternativa, qué propuso; null si no>
  mentions_consent_or_legal: true | false
  timestamp_start: ISO-8601
  timestamp_end: ISO-8601
```

**operador presenta así:**

```
Camila contesta en slack:

"gracias. oye, ¿podemos usar también el revenue_potential para priorizar
a quién mandamos el email? rankeamos top 20% y a ellos primero."

tu respuesta (máx 280 caracteres):
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________

[contador visible: X/280]
```

---

## cierre del caso

al completar el paso 5:

```yaml
session_end:
  status: completed | abandoned | timeout
  timestamp_end: ISO-8601
  total_duration_min: <int>
  participant_self_reported_difficulty: 1-5  # opcional, 1 fácil, 5 difícil
```

operador pasa al participante a la entrevista post-test
(`5_post_test_interview_protocol.md`).

---

## formato del Google Form (conversión 1:1)

cada step arriba se convierte a una sección del Google Form:

| step | tipo de Google Form |
|---|---|
| step 1 | una sección con 6 grid questions + 1 textarea |
| step 2A | sección con 1 textarea |
| step 2B | manejado por operador (fuera del form) |
| step 2C | sección con 1 textarea + contador |
| step 3 | una sección con 3 grids de checkboxes (uno por segmento) + 3 textareas opcionales |
| step 4 | sección con 1 radio button group (4 opciones) + 1 textarea opcional |
| step 5 | sección con 1 textarea + contador |

**tiempo estimado:** 18 min total. el operador NO acelera al
participante; si tarda más, se anota pero se acepta hasta 25 min.

---

## archivo de bitácora de sesión

paralelo a `responses.yaml`, el operador mantiene un
`field_test_v0/sessions/<participant_id>/session_log.yaml`:

```yaml
session_id: P001
participant_id: P001
operator: pablo
date: 2026-05-15
start_time: ISO-8601
end_time: ISO-8601

events:
  - timestamp: ISO-8601
    type: session_start
  - timestamp: ISO-8601
    type: step_start
    step: 1
  - timestamp: ISO-8601
    type: clarification
    category: procedural | content_or_criteria
    description: "el participante preguntó cómo guardar progreso (procedural)"
  - timestamp: ISO-8601
    type: step_end
    step: 1
  - timestamp: ISO-8601
    type: llm_call
    model: deepseek-chat
    success: true
    retry_count: 0
  # ... etc

notes:
  - "el participante hizo pausa de 2 min después del step 2 para releer brief"
  - "fallback gemini no se activó en esta sesión"
```

---

## qué pasa con estos archivos después

al cierre de las 5 sesiones:

- `sessions/P001/responses.yaml` + `session_log.yaml` (similar para P002...P005)
- los 2 evaluadores externos reciben acceso de SOLO LECTURA al
  `responses.yaml` (no a `session_log.yaml`) y producen
  `evaluator_1.yaml` y `evaluator_2.yaml` con rúbrica ciega (ver
  `3_rubric_human_simplified.md` y `6_calibration_sheet.md`)
- el LLM-judge procesa `responses.yaml` y produce `judge.yaml` DESPUÉS
  de los 2 evaluadores humanos (regla R3 del README)
