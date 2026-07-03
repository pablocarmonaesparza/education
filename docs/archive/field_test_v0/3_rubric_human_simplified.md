# 3 — rúbrica humana simplificada (versión ciega para evaluadores externos)

> **propósito.** rúbrica que los 2 evaluadores externos contratados ad-hoc
> usan para calificar las 5 sesiones del caso 1. **es versión pública +
> simplificada** de `docs/simulador/contrato_v0/rubricas/rubric_marketing_v1.yaml`.
>
> **es CIEGA.** los evaluadores reciben este archivo pero NO reciben:
> - el `gap_trigger_logic` del case_template
> - los pesos internos (`dimension_weights`)
> - los `deterministic_overrides`
> - el `rubric_per_step_per_dimension` interno
> - el output del LLM-judge antes de calificar
> - las hipótesis esperadas de Itera
>
> **versión:** 1.0.0 — congelada al commit de Fase B.

---

## briefing al evaluador externo (lo que recibe al inicio)

> *"vas a calificar 5 sesiones de un experimento sobre uso de IA en
> marketing. cada sesión es un participante respondiendo un caso
> simulado en 5 pasos. tu trabajo es asignar una banda — alto / medio /
> bajo — por dimensión × paso, según el material de la sesión.*
>
> *no estamos esperando una respuesta correcta única. tu criterio es lo
> que estamos validando. responde con base en tu experiencia en
> marketing/ops B2B, no en lo que crees que la empresa que te contrató
> quiere ver.*
>
> *te tomará aproximadamente 30-40 minutos calificar las 5 sesiones."*

---

## lo que ves en cada sesión

para cada sesión recibes:

- **el contexto del caso** (mismo `1_participant_brief.md`)
- **`responses.yaml`** con las respuestas literales del participante a
  los 5 pasos
- **NO ves:** `session_log.yaml`, `judge.yaml`, las respuestas de otros
  evaluadores, ni los datos sintéticos del caso (los conoces solo a
  través de las respuestas)

ves la sesión completa (los 5 steps) y luego asignas bandas.

---

## las 5 dimensiones

el caso evalúa estas 5 dimensiones de criterio operativo con IA:

### 1. contexto
**qué tan bien la persona encuadra la situación, audiencia, tono y
restricciones al pedirle algo a la IA.**

señales de criterio alto: prompts específicos con audiencia + tono +
restricciones; mención de la marca/empresa con voz consistente.

señales de criterio bajo: prompts genéricos tipo "dame 3 ángulos" sin
encuadrar; usar el dataset crudo sin contexto sobre qué se necesita.

### 2. privacidad
**qué tan bien la persona protege datos personales y confidenciales en
cada paso.**

señales de criterio alto: anonimiza o bucketiza campos sensibles
(nombre, email, empresa, revenue exacto) ANTES de pasar al modelo;
detecta cuando el output del modelo reintrodujo info sensible.

señales de criterio bajo: pasa el dataset crudo al modelo; acepta uso
de revenue para targeting sin reflexionar.

### 3. validación
**qué tan rigurosamente la persona verifica el output de la IA antes
de usarlo.**

señales de criterio alto: identifica cifras o claims inventados en el
output; menciona explícitamente qué validaría antes de publicar; usa el
output como punto de partida, no como producto final.

señales de criterio bajo: usa el output del modelo tal cual; acepta
cifras específicas del modelo sin verificar fuente.

### 4. juicio
**qué tan bien la persona lee riesgos, autoridad y consecuencias antes
de actuar.**

señales de criterio alto: distingue entre lo táctico y lo estratégico;
identifica cuándo debe objetar a su VP o escalar a legal; reconoce
riesgos de marca o privacidad antes de actuar.

señales de criterio bajo: acepta cualquier propuesta del VP sin
considerar riesgos; no detecta cuándo el output del modelo expone a la
empresa.

### 5. decisión
**qué tan clara, justificada y responsable es la acción final que la
persona toma y comunica.**

señales de criterio alto: comunicación final incluye qué se hizo, qué
se validó, qué se descartó, qué riesgo se vio; ofrece next step
accionable cuando hay duda.

señales de criterio bajo: comunicación final genérica o defensiva;
delega la decisión sin postura propia; acepta sin condiciones.

---

## las 15 cells por sesión

cada sesión produce **15 cells evaluables**. una cell = combinación
(step × dimensión) donde el caso explícitamente declara que esa
dimensión se mide. **NO califiques cells que no están en esta lista:**

| step | dimensiones a calificar |
|---|---|
| 1 — preparación de datos | contexto, privacidad |
| 2 — interacción con el modelo | contexto, privacidad, validación, juicio, decisión |
| 3 — revisión del output | privacidad, validación, juicio |
| 4 — entrega a Camila | juicio, decisión |
| 5 — respuesta a Camila | privacidad, juicio, decisión |

**total cells por sesión:** 15.
**total cells por evaluador en las 5 sesiones:** 75.

---

## las 3 bandas (A / M / B)

para cada cell, asigna UNA de tres bandas:

### A — alto
la persona muestra criterio claro y sostenido para esa dimensión en
ese paso. su decisión/acción/redacción demuestra que entiende los
matices y actúa con intención.

### M — medio
la persona muestra criterio parcial. acierta en algunas cosas pero
deja huecos visibles. puede ser un mix: bien en parte de la dimensión,
mal en otra parte.

### B — bajo
la persona muestra falta de criterio para esa dimensión en ese paso.
omite consideraciones importantes, acepta opciones problemáticas, o
demuestra que no leyó la situación correctamente.

**regla:** si dudas entre A y M, elige M. si dudas entre M y B, elige
M. la M absorbe ambigüedad — A y B son señales claras en ambas
direcciones.

---

## señales operativas por step (sin spoilers)

### step 1 — qué mirar

- **contexto (step 1):** ¿la persona considera el objetivo de la
  campaña al decidir qué campos usar? o ¿solo elimina al azar?
- **privacidad (step 1):** ¿la persona discrimina entre campos
  sensibles y no sensibles? ¿transforma de forma que preserva señal
  útil sin exponer identidad?

### step 2 — qué mirar

- **contexto (step 2):** ¿el prompt al modelo incluye audiencia, tono,
  restricciones?
- **privacidad (step 2):** ¿el prompt evita PII? ¿usa los datos
  anonimizados/bucketizados del step 1, o pega data cruda?
- **validación (step 2):** en el followup, ¿menciona qué validar antes
  de usar el output?
- **juicio (step 2):** ¿el prompt o el followup reconoce riesgos del
  output?
- **decisión (step 2):** en el followup, ¿hay una decisión clara (qué
  usa, qué descarta) o ambigüedad?

### step 3 — qué mirar

- **privacidad (step 3):** ¿detecta si el output del modelo
  reintrodujo info sensible que el participante había anonimizado?
- **validación (step 3):** ¿marca correctamente cifras o claims sin
  evidencia? ¿discrimina entre problemas críticos y cosméticos?
- **juicio (step 3):** ¿distingue entre lo que bloquea entrega vs lo
  que solo se edita después?

### step 4 — qué mirar

- **juicio (step 4):** ¿la opción elegida considera consecuencias
  (legal, marca, audiencia)?
- **decisión (step 4):** ¿la opción comunica claramente qué se hizo
  con el output del modelo?

### step 5 — qué mirar

- **privacidad (step 5):** ¿la respuesta detecta que usar
  revenue_potential para targeting es problemático? (sin importar si
  acepta o rechaza)
- **juicio (step 5):** ¿la respuesta lee el riesgo? ¿objeta proponiendo
  alternativa o cede sin reflexión?
- **decisión (step 5):** ¿la comunicación es clara y firme sin
  abandonar la relación profesional?

---

## ejemplo (calibración inicial — UN solo ejemplo dummy)

> **propósito del ejemplo dummy.** antes de evaluar las 5 sesiones reales,
> ambos evaluadores califican este mismo ejemplo dummy y comparan. si
> discrepan más de 3 cells entre ellos, hacen una mini-sincronización
> con el operador (Pablo o Claude) para calibrar la lectura de la
> rúbrica. **esto NO se hace con sesiones reales** — solo con este dummy.

ejemplo dummy:

> participante respondió al step 5 con: *"sí, dale, hagámoslo así.
> rankeamos por revenue y mandamos al top 20%. corro la query y te paso
> la lista a las 6 PM."*

evaluación esperada (calibración):
- privacidad (step 5): B — no detecta que usar revenue para targeting
  es problemático; lo acepta sin reflexión
- juicio (step 5): B — no lee el riesgo, no objeta, no propone
  alternativa
- decisión (step 5): A — la decisión es clara y operativa (acepta, dice
  cuándo entrega)

discutir si hay desacuerdo en alguna de las 3 cells del dummy antes de
seguir con sesiones reales.

---

## output: `evaluator_1.yaml` y `evaluator_2.yaml`

cada evaluador produce un archivo YAML por sesión con esta estructura
exacta:

```yaml
evaluator_id: E1  # o E2
participant_id: P001
session_date_evaluated: 2026-05-22
time_spent_minutes: 8

cells:
  step_1.contexto: A | M | B
  step_1.privacidad: A | M | B
  step_2.contexto: A | M | B
  step_2.privacidad: A | M | B
  step_2.validacion: A | M | B
  step_2.juicio: A | M | B
  step_2.decision: A | M | B
  step_3.privacidad: A | M | B
  step_3.validacion: A | M | B
  step_3.juicio: A | M | B
  step_4.juicio: A | M | B
  step_4.decision: A | M | B
  step_5.privacidad: A | M | B
  step_5.juicio: A | M | B
  step_5.decision: A | M | B

risk_events_flagged:  # lista vacía o eventos detectados
  - step: 2
    severity: high  # critical | high | medium | low
    description: |
      <texto libre del evaluador describiendo el evento, máx 1 oración>
  - step: 4
    severity: medium
    description: |
      <texto>

notes_optional:
  step_1: |
    <comentario libre opcional sobre el step, máx 30 palabras>
  step_2: null
  step_3: |
    <comentario>
  step_4: null
  step_5: |
    <comentario>

overall_impression_short: |
  <texto libre del evaluador resumiendo la sesión en máx 80 palabras>
```

**regla R3 del README:** evaluador1 NO ve evaluador2 antes de
calificar. evaluador2 NO ve evaluador1 antes de calificar. el judge
NO ve ninguno antes de procesar.

---

## qué pasa después

1. ambos evaluadores entregan sus archivos YAML
2. el operador (Pablo o Claude, no evaluador) consolida en
   `6_calibration_sheet.md` poblada
3. se calcula humano-humano kappa (señal 4 de la decision matrix)
4. si kappa < 0.2, se contrata 3er evaluador como tie-breaker
5. el LLM-judge corre y produce `judge.yaml`
6. se calcula humano-judge agreement (señal 5)
7. resultado va a `_analysis_v1.md` post-sesiones

---

## pago

pago confirmado al recibir los YAML completos de las 5 sesiones
(75 cells totales por evaluador).

monto: $300-500 USD según seniority — definido con el evaluador antes
de aceptar.

---

## confidencialidad del evaluador

el evaluador acuerda no compartir el material del caso ni las respuestas
de los participantes por 90 días. esto es un acuerdo simple, no NDA
legal.

el evaluador NO recibe acceso a `docs/simulador/contrato_v0/` ni al
resto del repo de Itera.
