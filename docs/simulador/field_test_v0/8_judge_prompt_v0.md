# 8 — prompt del LLM-judge (congelado v0)

> **propósito.** define exactamente cómo el LLM-judge evalúa las
> respuestas de los 5 participantes del field test. **congelado al
> commit de Fase B**: el system prompt, el modelo, la temperature y
> los criterios NO se modifican entre la sesión 1 y la sesión 5.
>
> **versión:** v0.1.0 — congelada al commit de Fase B.
>
> **regla:** si el judge produce output inconsistente o malo, NO se
> modifica el prompt durante las 5 sesiones. se documenta el problema
> y se itera para una versión futura (v0.2.0) que se commitea ANTES
> de cualquier re-run.

---

## modelo y parámetros (CONGELADOS)

| parámetro | valor | nota |
|---|---|---|
| modelo primario | `deepseek-v4-flash` | DeepSeek API |
| modelo fallback | `gemini-2.5-flash-lite` | Google AI Studio |
| temperature | `0` | determinístico |
| max_tokens (output) | `1500` | suficiente para JSON estructurado |
| top_p | `1` | default |
| frequency_penalty | `0` | default |
| presence_penalty | `0` | default |
| system_prompt | ver sección "prompt completo" abajo | NO modificar |
| user_prompt template | ver sección "prompt completo" abajo | NO modificar |

**reglas de fallback:**

- si DeepSeek responde con HTTP 4xx/5xx o timeout: reintentar 1 vez,
  luego cambiar a Gemini fallback
- si Gemini también falla: marcar la cell como "judge failed" en
  `judge.yaml`, NO bloquear el experimento; la cell no cuenta para
  agreement
- timeout por llamada: 60 segundos
- retry budget: 1 intento por modelo

**reproducibilidad:** capturar en cada llamada:
- timestamp_request_sent
- timestamp_response_received
- modelo usado (primario o fallback)
- tokens_input + tokens_output
- response raw (antes de parsing)

---

## prompt completo

### system prompt (texto literal — NO modificar)

```
Eres un evaluador experimentado de criterio operativo en uso de IA por
profesionales de marketing en empresas B2B LATAM mid-market. Tu trabajo
es asignar bandas de criterio (A: alto, M: medio, B: bajo) a las
respuestas de un participante en un caso simulado.

REGLAS DE EVALUACIÓN:

1. Evalúas SOLO contra los criterios públicos que recibirás (5
dimensiones, definiciones, señales operativas por paso). NO tienes
acceso a hipótesis esperadas, gaps internos, ni a la rúbrica con pesos
internos. Tu evaluación debe basarse en lo que ves en la respuesta del
participante y en los criterios públicos.

2. NO inventes información que no está en la respuesta del participante.
Si no puedes determinar una banda con confianza razonable, usa M (medio).
"M" absorbe ambigüedad — A y B son señales claras en ambas direcciones.

3. Tu output debe ser JSON estructurado válido. NO incluyas texto antes
o después del JSON. NO incluyas markdown code fences alrededor del JSON.

4. Para risk_events_flagged: solo incluye un evento si es claramente
detectable en la respuesta. Si dudas, NO incluyas el evento. Es mejor
sub-llamar riesgos que sobre-llamarlos cuando dudas.

5. severity de risk_events:
   - "critical": exposición masiva de datos sensibles (ej: pegar dataset
     crudo con PII al modelo) o claim public sobre algo no verificable
     que daña la marca
   - "high": exposición individual de PII o riesgo regulatorio (PII
     a vendor externo, segmentación que excluye injustamente, claim
     causal sin evidencia)
   - "medium": output del LLM con cifra inventada usada sin verificar,
     decisión sin escalamiento cuando hay aprobador disponible
   - "low": comunicación pobre, formato sub-óptimo, eficiencia

6. NO uses el contexto cultural de marketing en US — el contexto es
LATAM B2B (México, Colombia, Chile). Las normas de governance,
formalidad y autoridad pueden diferir.
```

### user prompt template (texto literal — NO modificar)

```
Estás evaluando UNA sesión del caso "marketing_urgent_campaign_pii".
Debes asignar bandas de criterio (A/M/B) a las 15 cells evaluables y
listar risk_events si los detectas.

## CONTEXTO DEL CASO

El participante interpretó el rol de Marketing Manager en "Loop", una
SaaS B2B mid-market LATAM (120 empleados). Su VP Camila le pidió armar
3 ángulos de campaña para LinkedIn ads + email a prospects en 16 horas.
Le dio acceso a un dataset de 60 filas con feedback de clientes que
incluye PII (nombre, email, empresa, complaint, revenue_potential).

Camila explícitamente dijo "no me metas a legal hoy, ya están cerrados".

El participante completó 5 pasos:
- Step 1 (data_scope): decidir qué hacer con cada uno de los 6 campos
  del CSV antes de pasarlo al modelo.
- Step 2 (llm_beat): redactar prompt al modelo, recibir respuesta de
  3 ángulos, decidir qué hacer con el output (followup).
- Step 3 (artifact_review): marcar problemas en cada segmento del
  output del modelo.
- Step 4 (decision_select): elegir cómo entregar los ángulos a Camila.
- Step 5 (decision_open_short): responder a propuesta de Camila de
  usar revenue_potential para targeting.

## LAS 5 DIMENSIONES

- contexto: encuadre de situación, audiencia, tono y restricciones al
  pedirle algo a la IA
- privacidad: protección de datos personales y confidenciales
- validacion: verificación del output de IA antes de usarlo
- juicio: lectura de riesgos, autoridad y consecuencias
- decision: claridad y responsabilidad de la acción final

## LAS 15 CELLS EVALUABLES

Solo califica estas cells. NO califiques otras combinaciones.

- step_1.contexto
- step_1.privacidad
- step_2.contexto
- step_2.privacidad
- step_2.validacion
- step_2.juicio
- step_2.decision
- step_3.privacidad
- step_3.validacion
- step_3.juicio
- step_4.juicio
- step_4.decision
- step_5.privacidad
- step_5.juicio
- step_5.decision

## SEÑALES OPERATIVAS POR STEP

### step_1
- contexto: ¿la persona considera el objetivo de la campaña al decidir
  qué campos usar? alta cuando tiene lógica clara campaña-céntrica;
  baja cuando descarta campos sin razón o mantiene irrelevantes.
- privacidad: ¿discrimina entre campos sensibles y no sensibles?
  ¿transforma de forma que preserva señal útil sin exponer identidad?
  alta cuando anonimiza/bucketiza TODOS los sensibles (nombre, email,
  empresa, revenue exacto); baja cuando deja sensibles sin transformar
  o usa el dataset crudo.

### step_2 (prompt + respuesta del LLM + followup)
- contexto: ¿el prompt al modelo incluye audiencia + tono +
  restricciones? alta cuando los 3 están presentes; media cuando 2 de
  3; baja cuando ninguno o genérico ("dame 3 ángulos").
- privacidad: ¿el prompt evita PII? ¿usa los datos anonimizados del
  step 1 o pega data cruda? alta cuando 0 PII en prompt; baja cuando
  pega CSV crudo o nombres/emails.
- validacion: en el followup, ¿menciona qué validar antes de usar el
  output? alta cuando identifica claims específicos a validar; baja
  cuando no menciona validación o acepta todo el output.
- juicio: ¿el prompt o followup reconoce riesgos del output? alta
  cuando menciona explícitamente que requiere revisión humana; baja
  cuando trata al LLM como autoridad.
- decision: en el followup, ¿hay una decisión clara (qué usa, qué
  descarta) o ambigüedad? alta cuando clara con justificación; baja
  cuando defiere a Camila sin postura.

### step_3 (artifact_review del output del modelo)
- privacidad: ¿detecta si el output reintrodujo info sensible que el
  participante había anonimizado en step 1?
- validacion: ¿marca correctamente cifras o claims sin evidencia?
  ¿discrimina entre problemas críticos y cosméticos? alta cuando
  discrimina; baja cuando marca todo como problemático o no marca nada.
- juicio: ¿distingue entre lo que bloquea entrega vs lo que solo se
  edita después?

### step_4 (decision_select sobre cómo entregar a Camila)
- juicio: ¿la opción elegida considera consecuencias (legal, marca,
  audiencia)? alta cuando elige "bullets_with_context" o
  "bullets_plus_legal_flag"; media cuando "clean_bullets"; baja cuando
  "raw_llm_output".
- decision: ¿la opción comunica claramente qué se hizo con el output
  del modelo? alta cuando incluye disclaimer sobre PII anonimizada;
  baja cuando entrega cruda.

### step_5 (respuesta a propuesta de Camila de usar revenue_potential)
- privacidad: ¿detecta que usar revenue_potential para targeting es
  problemático? (sin importar si acepta o rechaza)
- juicio: ¿lee el riesgo? ¿objeta proponiendo alternativa o cede sin
  reflexión? alta cuando objeta con alternativa concreta; baja cuando
  acepta sin objetar o rechaza sin alternativa.
- decision: ¿la comunicación es clara y firme sin abandonar la
  relación profesional?

## RISK EVENTS

Si detectas eventos de riesgo en cualquier step, inclúyelos en la
lista. Tipos comunes:

- exposed_pii_to_model: el participante pegó nombre/email/empresa al
  modelo sin anonimizar
- accepted_unverified_output: usó cifras del modelo sin verificar
- failed_to_escalate_risky_decision: aceptó propuesta problemática del
  VP sin objetar
- hidden_pii_usage_from_authority: entregó campaña basada en PII
  anonimizada sin disclaimer al VP

## INPUT: respuestas del participante

A continuación recibirás `responses.yaml` del participante. Procesa y
emite tu evaluación en el formato JSON especificado.

---

PARTICIPANTE: {participant_id}

RESPUESTAS:

{responses_yaml_content}

---

OUTPUT: solo JSON válido, sin markdown fences, sin texto extra.

Formato esperado:

{
  "evaluator_id": "judge_v0_1",
  "participant_id": "{participant_id}",
  "cells": {
    "step_1.contexto": "A",
    "step_1.privacidad": "M",
    "step_2.contexto": "B",
    ... (15 cells totales)
  },
  "risk_events_flagged": [
    {
      "step": 2,
      "severity": "high",
      "event_type": "exposed_pii_to_model",
      "description": "el participante pegó el dataset completo con nombres y emails al modelo"
    }
  ],
  "notes_optional": {
    "step_2": "el prompt no menciona audiencia ni tono",
    "step_5": null
  },
  "overall_impression_short": "criterio fuerte en validación, débil en privacidad"
}
```

---

## reglas de uso del prompt

### cuándo se ejecuta

- **después** de que ambos evaluadores humanos (E1 y E2) completaron
  sus calificaciones para esa sesión específica
- 1 llamada por sesión (no se promedian múltiples runs en fase 0)
- en orden de session_id (P001 → P002 → ... → P005)

### cómo se ejecuta

- el operador o Codex corre un script simple que:
  1. lee `field_test_v0/sessions/<participant_id>/responses.yaml`
  2. inyecta `{participant_id}` y `{responses_yaml_content}` en el user
     prompt template
  3. envía al modelo con system prompt arriba
  4. parsea el JSON de respuesta
  5. valida que las 15 cells estén presentes con valores A/M/B
  6. escribe `field_test_v0/sessions/<participant_id>/judge.yaml`

### qué hacer si el output no es válido

el output del judge debe ser JSON parseable con las 15 cells. si no
lo es:

1. **retry 1 vez** con el mismo prompt, misma temperatura
2. si vuelve a fallar: **fallback a Gemini** con mismos prompts
3. si Gemini falla: **marcar sesión como "judge failed"** en
   `judge.yaml` y documentar en `_judge_failures.md`
4. una sesión con judge failed cuenta en denominadores ajustados (no
   bloquea el experimento)

**NO se modifica el prompt para "arreglar" el output.** si el prompt es
defectuoso, se documenta y se itera en v0.2.0 (post-fase-0).

---

## tabla de runs del judge

operador mantiene `field_test_v0/_judge_runs.yaml`:

```yaml
runs:
  - participant_id: P001
    timestamp: ISO-8601
    model_used: deepseek-v4-flash | gemini-2.5-flash-lite
    success: true | false
    tokens_input: <int>
    tokens_output: <int>
    cells_returned: 15  # debe ser 15
    risk_events_count: <int>
    retry_attempts: 0 | 1 | 2
    notes: |
      <opcional, errores o anomalías>

  # ... P002...P005
```

---

## consideraciones del prompt

### lo que el prompt asume

- el LLM-judge puede leer YAML estructurado en el input (`responses_yaml_content`)
- el LLM-judge puede emitir JSON estructurado en el output
- el LLM-judge entiende español operativo LATAM B2B
- el LLM-judge mantiene consistencia entre sesiones con temperature 0

### lo que el prompt NO garantiza

- consistencia con evaluadores humanos (eso lo mide señal 5)
- detección de TODOS los risk_events (eso lo mide recall)
- ausencia de false positives (eso lo mide precision)
- entendimiento profundo del contexto cultural específico del
  participante (variation MX vs CO vs CL)

### sesgos conocidos del prompt

1. **sesgo de "M" por instrucción explícita.** el prompt dice "si dudas,
   usa M". esto puede producir distribución artificialmente centrada
   en M. mitigación: humanos califican primero con el mismo criterio,
   así el sesgo es comparable.

2. **sesgo de detección de eventos high.** el prompt enfatiza
   sub-llamar antes que sobre-llamar (R4). esto puede bajar recall.
   mitigación: la señal 5 mide explícitamente recall ≥85% para juzgar
   si el prompt es viable.

3. **sesgo de language model en general.** los LLMs tienden a ser más
   generosos en juicios cualitativos que humanos críticos. mitigación:
   el experimento captura este sesgo via comparación con humanos.

---

## qué pasa con este archivo después

el prompt v0.1.0 se congela al commit de Fase B. modificaciones futuras
SOLO en versiones nuevas (v0.2.0+), commiteadas ANTES de cualquier
re-run del experimento.

el archivo de bitácora de versiones (futuro):

```yaml
versions:
  - version: v0.1.0
    date: 2026-05-12
    author: claude
    changes: prompt inicial
    used_in_field_test: v0_session_2026_05_xx

  - version: v0.2.0
    date: TBD
    author: TBD
    changes: TBD
    used_in_field_test: TBD
```

---

## firma de congelamiento

este prompt se considera **congelado** cuando:

- el archivo está commiteado en `main` con git hash visible
- `0_experiment_protocol.md` referencia este archivo en su sección
  4.7 (modelos congelados)
- ninguna sesión del field test se ha ejecutado todavía

cuando se ejecute la primera sesión, el git hash del último commit que
modificó este archivo queda **inalterable** hasta concluir las 5
sesiones.
