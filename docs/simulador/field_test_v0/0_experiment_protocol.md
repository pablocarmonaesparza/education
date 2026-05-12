# 0 — protocolo experimental (PRE-REGISTRO)

> **versión:** 1.0.0
> **fecha de pre-registro:** 2026-05-12
> **estado:** congelado al commit del git hash visible en este archivo
> **autor:** claude (producto)
> **auditor:** codex (técnico/metodológico)
> **sponsor:** pablo
>
> **regla:** este archivo se commitea **antes** de la sesión 1. cualquier
> modificación posterior al commit inicial requiere nota explícita en la
> sección "bitácora de cambios" abajo, justificación, y reset del análisis
> de validez al estado pre-modificación. NO se reescribe en silencio.

---

## 1. propósito del experimento

probar si el caso 1 (`marketing_urgent_campaign_pii_v1`) cumple **tres
formas distintas de validez** antes de invertir ingeniería en runtime.

las 3 validez no son intercambiables; cada una requiere su propia
evidencia.

- **face validity** — ¿el caso se siente real para un Marketing Manager
  LATAM SaaS B2B mid-market 50-500 empleados?
- **construct validity** — ¿el caso diferencia entre alguien con buen
  criterio para operar con IA y alguien que solo usa la herramienta sin
  criterio?
- **buyer validity** — ¿el reporte ejecutivo permite a un manager tomar
  una acción concreta (pilotar / entrenar / pausar / escalar)?

si alguna de las 3 falla, **runtime no se construye**. la decisión
post-experimento la define `9_decision_matrix.md`.

---

## 2. lo que NO estamos probando en fase 0

documentar lo que queda fuera de scope evita interpretar resultados a
conveniencia.

esta fase NO valida:

- la efectividad del Sprint completo de 8 casos
- el pricing band del Sprint
- el ROI a 30 días o 90 días
- transferencia primary↔resim (no se corre resim en fase 0)
- el comportamiento del LLM-judge a escala (n=5 es muy pequeño)
- la voluntad de compra a precio target ($79-199 per_seat_per_sprint)
- la disposición de pago de CHRO/VP (no son grupo B en fase 0)
- la efectividad de los practice_beats (no se ejecutan en fase 0)
- la usabilidad de una UI (no hay UI)

declarar conclusiones sobre cualquiera de los puntos anteriores con
data de fase 0 es **mal uso del experimento**.

---

## 3. hipótesis pre-registradas

### H1 (face validity)
**predicción:** ≥3 de 5 participantes describen el escenario del caso
como "similar a una situación que vivieron en su trabajo el último
trimestre" cuando se les pregunta explícitamente en
`5_post_test_interview_protocol.md`.

**si H1 falla:** la tensión que diseñamos (velocidad-vs-privacidad bajo
presión de VP) no es universal en marketing LATAM SaaS B2B; el caso
necesita re-narrativa o el ICP está mal definido.

### H2 (construct validity)
**predicción:** los scores agregados de los 5 participantes muestran
varianza de al menos **1 salto de banda adyacente** (A↔M o M↔B; A↔B
cuenta como señal más fuerte) en al menos **3 de las 5 dimensiones**
cuando los evaluamos con la rúbrica ciega humana.

**si H2 falla:** el caso no diferencia; todos los participantes scorean
similar. probablemente porque las decisiones del caso son demasiado
obvias o demasiado ambiguas. requiere ajuste de steps o de opciones.

### H3 (buyer validity)
**predicción:** ≥2 de 3 managers (grupo B) leyendo un reporte
anonimizado en formato `4_manager_report_template.md` declaran que
"tomarían una acción concreta" (sin parafrasear genérico) cuando se les
pregunta abiertamente.

**si H3 falla:** el reporte como está armado no comunica decisión al
comprador. el problema es de formato/copy del reporte, no del caso en
sí; iteramos `4_manager_report_template.md` y re-probamos con los
mismos 3 managers en 1 semana.

### H4 (humano-humano agreement = sanidad de rúbrica)
**predicción:** los 2 evaluadores humanos externos asignan la misma
banda (A/M/B) en al menos **70% de las cells evaluables**.

**cell evaluable:** combinación `step × dimensión` que el case template
declara explícitamente en `evaluates`, `evaluates_prompt` o
`followup.evaluates`. Para `marketing_urgent_campaign_pii_v1` son **15
cells por sesión**, no 25:

- step 1: contexto, privacidad
- step 2: contexto, privacidad, validacion, juicio, decision
- step 3: privacidad, validacion, juicio
- step 4: juicio, decision
- step 5: privacidad, juicio, decision

cohen's kappa esperado: ≥0.4 (acuerdo moderado).

**si H4 falla:** los humanos no están de acuerdo entre ellos, lo que
significa que la rúbrica `3_rubric_human_simplified.md` no comunica
criterios suficientemente concretos. el problema NO es del judge; es
de la rúbrica. iteramos rúbrica antes de juzgar al judge.

### H5 (humano-judge agreement direccional, NO conclusivo)
**predicción direccional:** el LLM-judge coincide con al menos UN
humano en ≥70% de las cells A/M/B.

**predicción asimétrica para risk_events high:** el judge detecta ≥85%
de los risk_events high detectados por los humanos. **máximo 1 false
negative crítico (high) en toda la prueba.** precision del judge puede
ser ≥60% (puede sobre-llamar riesgos, eso es calibrable; lo que NO se
puede tolerar es que pierda riesgos altos).

Los `risk_events high` se capturan como flags explícitos por step en
`evaluator_1.yaml` y `evaluator_2.yaml`; no se infieren solo desde la
banda A/M/B.

**si H5 falla en recall high-risk:** el judge no es vendible al manager
todavía. se reemplaza por evaluación humana hasta calibrar con n ≥20.
runtime puede construirse pero el judge automatizado no se vende
externamente hasta calibración.

**si H5 falla solo en precision:** aceptable; precision se mejora
iterando el prompt.

**aclaración estadística:** con n=5, H5 es **direccional**. la
calibración real del judge requiere n ≥20 sesiones (fase 1+).

---

## 4. diseño experimental

### 4.1 unidad de observación

| nivel | n target | rol |
|---|---|---|
| grupo A — participantes que resuelven el caso | 5 | individuos LATAM mid-market SaaS B2B en marketing/growth/ops |
| grupo B — managers/buyers que leen reportes | 3 | senior/manager/director nivel; no necesariamente conocen al participante |
| evaluadores humanos externos (ciegos) | 2 | consultores marketing/ops senior 8+ años; contratados ad-hoc |
| 3er evaluador (contingente) | 0 o 1 | tie-breaker si humano1 vs humano2 kappa < 0.2 |

**grupo A y grupo B son distintos.** un participante NO es manager para
ningún reporte. esto preserva ceguera del manager (no vio cómo se generó
el reporte).

### 4.2 criterios de inclusión grupo A

- región: MX, CO, AR o CL (LATAM only fase 0, US-Hispanic queda fuera)
- empresa actual: SaaS B2B 50-500 empleados
- rol: Marketing Manager, Growth Marketer, Operations Manager, o similar
- experiencia previa con ChatGPT, Claude, Gemini o similar (uso semanal últimos 3 meses, autorreportado)
- NO ha visto el caso ni este protocolo previamente
- compromiso de 30 min (18 min caso + 12 min entrevista post)

### 4.3 criterios de inclusión grupo B

- rol: Head of Marketing, Marketing Director, CMO, Head of Operations o equivalente
- empresa: B2B (no necesariamente SaaS), 50-500 empleados, LATAM
- experiencia gestionando equipo de ≥3 personas
- NO conoce al participante cuyo reporte está leyendo (anonimizado por nosotros)
- compromiso de 15 min de revisión + 15 min entrevista

### 4.4 criterios de inclusión evaluadores externos

- 8+ años en marketing/ops B2B
- uso semanal de IA en flujos de trabajo últimos 12 meses
- experiencia previa con assessment / rubric-based evaluation (preferido pero no obligatorio)
- NO conoce Itera; NO ha visto contrato_v0
- disponibilidad de ~3 horas para evaluar 5 sesiones × 18 min
- compensación: $300-500 USD por revisor (definido por seniority; final lo decide Pablo en sub-fase de contratación)

### 4.5 incentivos

| participante | incentivo |
|---|---|
| grupo A early-mid career | $50 USD amazon gift card + reporte personalizado de su sesión (bandas + 2-3 sugerencias específicas) |
| grupo A senior (Head/Director nivel) | $100 USD amazon gift card + reporte personalizado |
| grupo B managers | $50 USD amazon gift card + acceso anticipado a la versión runtime si se construye |
| evaluadores externos | $300-500 USD por evaluador, según seniority y volumen |
| 3er evaluador contingente | $300-500 USD adicional |

**budget total fase 0 estimado:** $1,000 - $2,000 USD.

### 4.6 setup técnico (wizard-of-oz)

- **0 código.** no hay UI, no hay base de datos, no hay runtime.
- materiales: Google Doc por participante (caso rendered de
  `1_participant_brief.md`) + Google Form para captura de respuestas.
- sesión: Zoom/Meet con screen share del operador.
- el participante:
  1. lee el contexto + scenario en el doc
  2. completa cada step en el Google Form
  3. en el llm_beat (step 2), redacta su prompt en una textarea
  4. el operador copia el prompt, lo pega manualmente a DeepSeek (model
     fijo, temperature 0), copia la respuesta y la devuelve al
     participante en el chat
  5. el participante hace su followup decision en el form

- **operador único por sesión** (Pablo o Claude humano supervisado, no
  ambos en la misma sesión).
- **operador NO improvisa** respuestas del LLM; copia/pega literal.
- **operador no comenta** sobre las decisiones del participante hasta
  terminar la sesión.
- **timestamp** de cada acción: inicio sesión, inicio cada step, prompt
  enviado, respuesta recibida, fin sesión.

### 4.7 modelos congelados

el archivo `8_judge_prompt_v0.md` (Fase B) define exactamente:

- modelo para el LLM beat del caso: **DeepSeek `deepseek-chat`,
  temperature 0**, fallback Gemini `gemini-3.1-flash-lite`
- modelo para el LLM-judge: a definir en `8_judge_prompt_v0.md`,
  congelado pre-sesión
- system prompts versionados
- max tokens por turn
- timeout por llamada

**no se cambia ningún parámetro de modelo durante las 5 sesiones.** si
hay fallo técnico, se documenta y se mantiene constante.

---

## 5. medición

### 5.1 lo que se captura por sesión

en `field_test_v0/sessions/<participant_id>/`:

- `metadata.yaml` — fecha, operador, duración total, modelo usado, etc.
- `responses.yaml` — todas las respuestas estructuradas del participante por step
- `llm_beat_log.yaml` — prompt del participante + respuesta del LLM + followup
- `interview_notes.yaml` — respuestas a `5_post_test_interview_protocol.md`
- `evaluator_1.yaml` — calificación humano1 con rúbrica ciega
- `evaluator_2.yaml` — calificación humano2 con rúbrica ciega
- `evaluator_3.yaml` — (si aplica tie-breaker)
- `judge.yaml` — output del LLM-judge (corre DESPUÉS de los 2 humanos)

todas las respuestas en texto plano + YAML. sin DB.

### 5.2 métricas agregadas

al cierre de las 5 sesiones:

1. **completion rate** (sesiones completadas / 5)
2. **face validity (H1)**: count de participantes que afirman realismo + transcripts de las frases que usaron
3. **construct validity (H2)**: tabla de scores por participante × dimensión, calculada con bandas A/M/B
4. **buyer validity (H3)**: count de managers que afirman decisión accionable + transcripts
5. **humano-humano kappa (H4)**: cohen's kappa weighted sobre 15 cells × 5 sesiones = 75 cells totales
6. **humano-judge agreement (H5)**: % cells acuerdo + recall high-risk + precision high-risk
7. **time on task** (mediana de los 5 participantes para completar caso)
8. **abandono mid-session** (cuántos no terminan)

estas 8 métricas se consolidan en `field_test_v0/sessions/_analysis_v1.md` al cierre de Fase D.

---

## 6. control de sesgos

### 6.1 sesgos identificados y mitigaciones

| sesgo | mitigación |
|---|---|
| **autor evaluador** (Claude/Codex/Pablo conocen gaps esperados) | 2 evaluadores externos contratados con rúbrica ciega |
| **demand characteristics** (participante intenta complacer al investigador) | operador no comenta durante la sesión; entrevista post separa "qué hiciste" de "qué piensas del caso" |
| **researcher allegiance** (Pablo quiere que el experimento pase) | pre-registro de hipótesis + decision matrix con umbrales numéricos no editables |
| **selección no aleatoria** (Pablo recluta solo de su red) | criterios de inclusión explícitos (sección 4.2); reclutamiento con outreach script público |
| **acquiescence bias en entrevista post-test** (decir "sí" a todo) | preguntas de la entrevista en `5_post_test_interview_protocol.md` formuladas como abiertas (no sí/no); transcripts citables |
| **operator effect** (operador influye en participante) | 1 solo operador por sesión, script de instrucciones idénticas |
| **rubric drift** (humanos calibran su criterio durante las 5 evaluaciones) | los 2 humanos califican TODAS las 5 sesiones antes de revelar resultados; calibración pre-evaluación con 1 ejemplo dummy |

### 6.2 lo que NO podemos controlar con n=5

- representatividad estadística del ICP
- variance natural del LLM (mitigado parcialmente con temperature 0 + 1 modelo fijo)
- efectos longitudinales (transferencia primary↔resim, retención)
- efectos de grupo (peer dynamics — no aplica, son sesiones individuales)
- intercultural variation dentro de LATAM (MX vs CO vs AR vs CL)

esto se acepta explícitamente. **no se concluye sobre ellos en fase 0.**

---

## 7. cronograma esperado

| día | actividad | quién |
|---|---|---|
| 0 | OK explícito de pablo a Fase A | pablo |
| 0-3 | claude redacta Fase A; codex audita núcleo experimental | claude + codex |
| 3-4 | pablo aprueba/corrige Fase A; core se commitea con hash visible | pablo |
| 3-7 | pablo puede hacer pre-warming informal de outreach, sin ejecutar sesiones | pablo |
| 4-6 | claude redacta Fase B (7 archivos del packet) después del OK de Fase A | claude |
| 6 | codex audita Fase B + Pablo aprueba | codex + pablo |
| 7-10 | reclutamiento formal de 5 participantes + 3 managers + 2 revisores externos | pablo |
| 10-21 | ejecución de 5 sesiones individuales (1 por día como límite, total ~10 días con buffer) | operador + participantes |
| 21-24 | calificación humana de las 5 sesiones por evaluador1 y evaluador2 | externos |
| 24-25 | corrida del LLM-judge sobre las 5 sesiones | codex (técnico) o claude |
| 25-26 | calibración + 3er evaluador si aplica | externos |
| 26-27 | grupo B revisa reportes anonimizados | managers + pablo |
| 27-28 | análisis de las 3 validez | claude |
| 28 | decisión vs `9_decision_matrix.md` | pablo (con input claude + codex) |

**total:** ~4 semanas. critical path: reclutamiento (días 0-10).

---

## 8. límites estadísticos explícitos

con n=5 participantes + n=3 managers, este experimento produce:

- **señal direccional** sobre face/construct/buyer validity
- **hipótesis** sobre calibración humano-judge
- **NO produce** conclusiones generalizables al universo de Marketing
  Managers LATAM SaaS B2B
- **NO produce** validación estadística del LLM-judge
- **NO produce** evidencia de pricing power
- **NO produce** retention/completion benchmark de Sprint completo

cualquier reporte derivado de fase 0 que se comparte (interno o
externo) debe llevar este disclaimer:

> *"resultados basados en n=5 participantes; señal direccional, no
> validación estadística. validación con n ≥ 20 queda fuera de scope
> de fase 0."*

---

## 9. responsable de cada métrica

| métrica | responsable de captura | responsable de análisis |
|---|---|---|
| completion rate | operador | claude |
| H1 (face validity) | operador + entrevistador post | claude |
| H2 (construct validity) | evaluadores externos | claude |
| H3 (buyer validity) | pablo + entrevistador grupo B | claude |
| H4 (humano-humano kappa) | evaluadores externos | claude (con codex audit del cálculo) |
| H5 (humano-judge agreement) | operador (judge) + evaluadores externos | claude (con codex audit del cálculo) |
| time on task | operador | claude |
| abandono mid-session | operador | claude |

**codex audita el cálculo estadístico** (kappa, recall, precision) para
evitar errores aritméticos que sesguen la decisión final.

---

## 10. bitácora de cambios

| fecha | autor | cambio | razón |
|---|---|---|---|
| 2026-05-12 | claude | v1.0.0 inicial — pre-registro | arrancar lock experimental |

**regla:** cualquier modificación post-commit inicial requiere fila en
esta tabla + justificación + reset de análisis al estado pre-modificación
si afecta métricas o umbrales.

---

## 11. firma de pre-registro

este archivo se considera **pre-registrado** cuando:

- está commiteado en `main` con git hash visible
- README del paquete enlaza a este archivo
- `9_decision_matrix.md` está commiteado simultáneamente
- Pablo ha dado OK explícito en mensaje (capturado en commit message o en handoff)

referencia del git hash inicial se rellena post-commit:

```
git hash inicial: [SE COMPLETARÁ AL COMMITEAR]
fecha de pre-registro: 2026-05-12
```
