# 5 — protocolo de entrevista post-test

> **propósito.** captura validez perceptual del caso + buyer validity
> tras la sesión. 8 preguntas estructuradas para grupo A
> (participantes que resolvieron el caso) + 4 preguntas para grupo B
> (managers que leyeron el reporte).
>
> **duración:** 12 min con grupo A; 15 min con grupo B.
>
> **versión:** 1.0.0 — congelada al commit de Fase B.

---

## reglas operativas para el entrevistador

1. **preguntas abiertas, no sí/no.** todo está formulado para que la
   respuesta requiera reflexión. resistir el impulso de re-formular
   como sí/no.
2. **silencio es OK.** dejar al participante pensar 3-5 segundos sin
   rellenar el silencio.
3. **NO defender el caso.** si el participante dice "esto es raro",
   no contraargumentar. anotar y seguir.
4. **NO mostrar reacción emocional** a las respuestas (positiva o
   negativa). neutralidad operativa.
5. **NO sugerir respuestas.** si el participante no recuerda algo,
   pedirle "tómate tiempo" en vez de "¿quizás fue X?".
6. **grabar audio** con consentimiento (consentimiento ya está en
   `1_participant_brief.md`). transcribir literal después.
7. **el entrevistador NO es uno de los evaluadores externos.** el
   entrevistador es Pablo o Claude humano (no ambos en la misma
   sesión).

---

## parte 1 — entrevista grupo A (12 min, post-sesión del caso)

ejecutar inmediatamente después de que el participante termina el
paso 5 del caso. transición:

> *"gracias. terminaste el caso. ahora 12 minutos cortos de
> conversación. cuando puedas hablar, te hago algunas preguntas. no hay
> respuesta correcta, queremos entender qué pensaste y sentiste."*

### pregunta 1 — face validity del escenario

> *"¿este escenario se parece a una situación que viviste en tu trabajo
> el último trimestre? si sí, ¿qué tan similar?"*

**captura literal en `interview_notes.yaml`:**

```yaml
q1_face_validity:
  response_literal: |
    <texto de la respuesta>
  classification:  # asignada por el entrevistador post-sesión
    answer: "si_exacto" | "si_parecido_con_ejemplo" | "si_parecido_sin_ejemplo" | "si_pero_no_mi_rol" | "si_pero_otra_industria" | "no"
    cited_example: true | false
    example_short: |
      <si citó ejemplo, capturarlo en <40 palabras>
```

**uso en decision matrix:** señal 2 (face validity de tensión).

### pregunta 2 — claridad del caso

> *"¿hubo algún momento del caso donde no entendiste qué se esperaba
> de ti, o donde tuviste que adivinar la mecánica?"*

> **followup si responde sí:** *"¿qué paso?"*

**captura:**

```yaml
q2_claridad:
  response_literal: |
    <texto>
  classification:
    had_confusion: true | false
    step_of_confusion: 1 | 2 | 3 | 4 | 5 | "multiple" | null
    confusion_type: "mecanica" | "contenido" | "ambos" | null
```

**uso en decision matrix:** señal 1 (completion sin ayuda). si
`confusion_type` es "contenido", suma a `content_or_criteria` count
de `session_log.yaml`.

### pregunta 3 — dificultad subjetiva

> *"en una escala de 1 a 5, donde 1 es 'fácil, terminé sin esfuerzo' y
> 5 es 'difícil, no estoy seguro de mis respuestas', ¿cómo calificas
> este caso?"*

> **followup:** *"¿qué fue lo más difícil?"*

**captura:**

```yaml
q3_dificultad:
  rating: 1 | 2 | 3 | 4 | 5
  hardest_aspect: |
    <texto literal>
```

**uso:** análisis post-experimento sobre balance de dificultad del
caso. no afecta decision matrix directamente.

### pregunta 4 — comportamiento real vs simulado

> *"si esta situación pasara con tus datos reales y tu jefe real, ¿qué
> hubieras hecho diferente?"*

> **(esta es la pregunta más importante de la entrevista.)**

**captura:**

```yaml
q4_real_vs_simulated:
  response_literal: |
    <texto>
  would_act_different: true | false
  differences_noted: |
    <si sí, qué haría distinto>
```

**uso:** señal direccional para construct validity. si los participantes
declaran que actuarían MUY distinto en real, el caso captura algo
distinto del criterio real.

### pregunta 5 — uso real de IA en el rol

> *"¿usas ChatGPT, Claude o algún modelo similar en tu trabajo
> normalmente? ¿cuántas veces por semana, más o menos? ¿para qué?"*

**captura:**

```yaml
q5_ai_usage:
  uses_ai: true | false
  frequency_per_week: 0 | 1-3 | 4-7 | 8+
  primary_use_cases: |
    <lista de 1-3 casos de uso citados literalmente>
  models_mentioned: ["chatgpt", "claude", "gemini", "deepseek", "otro"]
```

**uso:** análisis demográfico del participante; control de
representatividad del ICP.

### pregunta 6 — el reporte personalizado

> *"vas a recibir un reporte personalizado de tu sesión en ~2 semanas.
> ¿qué te gustaría ver en él? ¿qué te haría valioso o no?"*

**captura:**

```yaml
q6_reporte:
  response_literal: |
    <texto>
  desired_content: |
    <lista de elementos mencionados, ej: "scores específicos", "qué hice mal", "comparación con benchmark", etc.>
```

**uso:** input para iterar `4_manager_report_template.md` antes de la
versión final del reporte que recibe el participante.

### pregunta 7 — voluntad de uso con equipo

> *"si esto se ofreciera como un diagnóstico para tu equipo de
> marketing/ops, ¿lo correrías con ellos? ¿por qué sí o no?"*

> **followup si dice sí:** *"¿cuánto valdría para ti? un rango."*
>
> **followup si dice no:** *"¿qué tendría que cambiar para que lo
> consideraras?"*

**captura:**

```yaml
q7_team_use:
  response_literal: |
    <texto>
  would_use_with_team: "si" | "tal_vez" | "no"
  willingness_to_pay:
    range_mentioned_usd: "no menciona" | "$X-$Y per seat" | "$X total" | etc.
  reasons_for_no: |
    <si dijo no, qué dijo>
  reasons_for_yes: |
    <si dijo sí, qué dijo>
```

**uso:** señal direccional sobre pricing y demand (no es validación de
pricing — esa requiere n mucho mayor). importante para entender qué
mueve al comprador.

### pregunta 8 — feedback abierto

> *"última pregunta abierta: ¿algo que te llamó la atención del caso,
> bueno o malo, que no preguntamos?"*

**captura:**

```yaml
q8_open_feedback:
  response_literal: |
    <texto>
  sentiment: "positivo" | "neutral" | "negativo" | "mixto"
  key_themes: |
    <lista de 1-3 temas que destacaron>
```

**uso:** captura de señales no anticipadas.

---

## cierre de entrevista grupo A

> *"eso es todo. gracias por tu tiempo. el operador te va a confirmar el
> envío de la gift card en los próximos 10 minutos. el reporte
> personalizado te llega en ~2 semanas."*

operador procesa:
- envío de gift card por email
- nota en `interview_notes.yaml` con cualquier observación del
  entrevistador (sentimiento general, lenguaje corporal, hesitations
  notables) — sin interpretar emocionalmente
- archivar grabación en `field_test_v0/sessions/<participant_id>/recording.mp4` (acceso solo Itera)

---

## parte 2 — entrevista grupo B (15 min, managers que leyeron el reporte)

ejecutar después de que el manager confirma haber leído el reporte
(síntético o real). transición:

> *"gracias por leer el reporte. 15 minutos cortos. quiero entender si
> esto te sirve para decisión real, no si te gustó la presentación."*

### pregunta B1 — acción accionable

> *"si recibieras este reporte sobre alguien de tu equipo mañana, ¿qué
> harías? cuéntame el paso siguiente concreto que tomarías."*

> **REGLA CRÍTICA:** esta es la pregunta que mide señal 6 de decision
> matrix. la respuesta cuenta como "accionable" SOLO si nombra:
> - una acción específica (no "lo discutiría", no "lo pensaría")
> - un timeframe ("mañana", "esta semana", "antes del próximo Q")
> - referencia a datos del reporte (no genérica)

**captura:**

```yaml
qB1_action:
  response_literal: |
    <texto>
  classification:  # asignada por el entrevistador post
    action_specific: true | false  # ¿nombra acción concreta?
    timeframe_specific: true | false  # ¿menciona cuándo?
    references_report_data: true | false  # ¿cita datos del reporte?
  verdict:
    is_actionable: true | false  # true si los 3 criterios arriba son true
```

**uso en decision matrix:** señal 6. al menos 2/3 managers debe tener
`is_actionable: true` para "mantener".

### pregunta B2 — qué falta

> *"¿qué información del reporte te hizo falta para tomar mejor
> decisión?"*

**captura:**

```yaml
qB2_missing:
  response_literal: |
    <texto>
  themes_missing: |
    <lista de elementos mencionados como faltantes>
```

**uso:** iterar `4_manager_report_template.md` si pasa a "iterar" en
decision matrix.

### pregunta B3 — qué sobra

> *"¿qué información del reporte no es útil para ti? algo que
> quitarías?"*

**captura:**

```yaml
qB3_excess:
  response_literal: |
    <texto>
  themes_excess: |
    <lista de elementos mencionados como innecesarios>
```

### pregunta B4 — credibilidad

> *"¿lo compartirías con tu CMO/jefe/board tal cual está? ¿por qué sí
> o no?"*

> **followup si dice no:** *"¿qué cambiarías antes?"*

**captura:**

```yaml
qB4_credibility:
  response_literal: |
    <texto>
  would_share_upward: "si" | "tal_vez" | "no"
  changes_required_before_sharing: |
    <si dijo no/tal vez, qué cambiaría>
```

**uso:** señal direccional sobre credibilidad del reporte para
compartir hacia arriba en la organización.

---

## cierre de entrevista grupo B

> *"eso es todo. gracias por la lectura crítica. te enviamos la gift
> card en los próximos 10 minutos. si construimos esto en producción,
> te avisamos para acceso anticipado."*

operador procesa:
- envío de gift card
- archivar `field_test_v0/managers/<manager_id>/interview_notes.yaml`
- archivar grabación

---

## qué se analiza al cierre

de las 5 entrevistas grupo A + 3 entrevistas grupo B, el operador
consolida:

**resumen direccional grupo A** en `field_test_v0/sessions/_grupo_a_summary.md`:

- distribución de q1 (face validity): cuántos en cada categoría
- distribución de q3 (dificultad): mediana + rango
- q4 patrones (qué dirían "haría diferente")
- q7 voluntad de uso: cuántos sí/tal vez/no
- q7 pricing rangos mencionados
- temas recurrentes en q8 (feedback abierto)

**resumen direccional grupo B** en
`field_test_v0/managers/_grupo_b_summary.md`:

- count de managers con `is_actionable: true`
- temas faltantes (qB2) y excedentes (qB3)
- count de managers que `would_share_upward: si`

ambos resúmenes alimentan `_analysis_v1.md` post-Fase D.

---

## regla de cita en el reporte final

cualquier cita literal de un participante o manager en
`_analysis_v1.md` debe:

- anonimizar nombre del participante
- citar con `[Q1 — P003]` o `[QB2 — M002]` para trazabilidad
- mantener el texto literal sin paráfrasis

ejemplo:

> "*la mayoría no escala a legal cuando hay duda — confiamos en
> criterio propio."* — [Q1, P004]

esto preserva auditabilidad del análisis vs material crudo.

---

## confidencialidad

todas las grabaciones y notas se mantienen en
`field_test_v0/sessions/<id>/` con acceso solo Itera.

al cumplir 90 días post-sesión:

- grabaciones audio/video: borrar
- transcripts literales: anonimizar (reemplazar nombres reales por
  IDs participante)
- archivos `interview_notes.yaml`: preservar como evidencia anónima

el participante puede solicitar borrado anticipado de su material en
cualquier momento.
