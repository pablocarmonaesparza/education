# 4 — plantilla del reporte ejecutivo (single-participant)

> **propósito.** define el formato del reporte que un manager ve sobre
> UNA persona de su equipo tras una sesión del caso 1. esta es la
> versión que se enseña al grupo B (3 managers buyers) en fase 0.
>
> **importante:** en fase 0 el reporte es **single-participant** (1
> persona), no agregado de equipo. el reporte agregado de equipo viene
> en fase 1+. esta versión existe para validar **buyer validity**: ¿el
> manager toma una acción concreta con esta información?
>
> **versión:** 1.0.0 — congelada al commit de Fase B.

---

## cómo se usa este archivo

1. operador toma las respuestas + scores humanos de UNA sesión
2. operador rellena la plantilla manualmente (no hay generación automática en fase 0)
3. resultado se imprime a PDF o se comparte como markdown legible
4. operador anonimiza nombre del participante a "Mariana", "Carlos", etc. (nombres ficticios) para grupo B
5. los 3 managers del grupo B reciben **el mismo** reporte (uno común, no uno por manager) — esto controla varianza

---

## reglas de copy del reporte

heredadas de `docs/simulador/contrato_v0/copy/manager_recommendation_templates.md`:

1. **lowercase en prose** salvo nombres propios, inicios de oración después de punto, y siglas (IA, VP, CRM, PII, DPO)
2. **IA siempre mayúsculas** — nunca "ia" ni "Ai"
3. **bandas A/M/B, no scores puntuales** (regla del experimento)
4. **una acción específica al cierre**, no parafraseo genérico
5. **prohibido:** "transforma tu equipo", "lleva tu equipo al siguiente nivel", "potencia tu marketing con IA", cualquier corporate-speak vacío
6. **prohibido:** emojis, gráficos elaborados, ranking público de personas
7. **permitido:** cifras del experimento, frases textuales del participante (con consentimiento), citas literales del LLM

---

## la plantilla

```markdown
# reporte de sesión — diagnóstico IA en marketing

**participante:** {nombre_anonimizado}
**rol:** Marketing Manager
**equipo:** {equipo_del_manager, ej: "marketing growth — Loop"}
**caso evaluado:** campaña urgente con feedback de clientes
**duración de sesión:** {duracion_minutos} min
**evaluadores:** 2 consultores externos + LLM-judge (modelo congelado)
**fecha del diagnóstico:** {fecha}

---

## qué evaluamos

5 dimensiones de criterio operativo con IA, observadas en una situación
laboral simulada con presión real (deadline, datos sensibles, autoridad
del VP, ambigüedad):

- **contexto** — encuadre de situación, audiencia y restricciones al usar IA
- **privacidad** — protección de datos personales y confidenciales
- **validación** — verificación del output de IA antes de usarlo
- **juicio** — lectura de riesgos, autoridad y consecuencias
- **decisión** — claridad y responsabilidad de la acción final

---

## resultado por dimensión

| dimensión | banda observada |
|---|---|
| contexto | {A / M / B} |
| privacidad | {A / M / B} |
| validación | {A / M / B} |
| juicio | {A / M / B} |
| decisión | {A / M / B} |

bandas:
- **A — alto:** criterio claro y sostenido en esa dimensión
- **M — medio:** criterio parcial; aciertos con huecos visibles
- **B — bajo:** falta de criterio; omite consideraciones críticas

---

## gaps observados

{lista de 1-4 gaps detectados durante la sesión, descritos en lenguaje
neutro sin nombrar al participante. ejemplo:}

- **{gap_id}** ({severidad: high / medium / low})
  qué se observó: {1-2 oraciones describiendo el comportamiento observado en la sesión, sin culpa moral}
  por qué importa: {1 oración sobre el riesgo o costo de este gap en operación real}

ejemplos de gaps que pueden aparecer (no inventes, solo usa los
observados):

- `expose_pii` (high) — pasar datos de clientes al modelo sin
  anonimizar primero
- `accept_output_no_validation` (medium) — usar el output del modelo
  sin verificar cifras
- `no_risk_flag_upward` (high) — aceptar propuesta problemática del
  jefe sin objetar o proponer alternativa
- `weak_artifact_review` (medium) — no discriminar entre problemas
  críticos y cosméticos en el output del modelo

---

## riesgos detectados durante la sesión

{lista de 0-3 risk_events, si los hay. ejemplo:}

- **{event_type}** ({severity: critical / high / medium / low})
  paso del caso: {step_id}
  excerpt anonimizado: *"...{2-3 líneas anonimizadas del comportamiento, sin nombrar persona...}"*

si no hubo risk_events detectados:

> *"sin eventos de riesgo detectados durante la sesión."*

---

## lo que sí salió bien

{lista de 1-3 fortalezas observadas, en lenguaje neutro. esto NO es
"felicitar" — es información operativa.}

- {observación factual, ej: "el participante anonimizó nombres y emails
  antes de pasar el dataset al modelo"}
- {observación, ej: "la respuesta final a la propuesta del VP incluyó
  alternativa concreta de segmentación segura"}

si no hay fortalezas claras:

> *"la sesión no mostró señales claras de criterio sostenido en
> ninguna dimensión. probablemente requiere entrenamiento estructurado
> antes de operación con IA en flujos sensibles."*

---

## recomendación accionable

**acción sugerida:** {pilotar / entrenar / pausar / escalar}

**a quién le aplica esta recomendación:** {al participante / al equipo
si hay otros sospechosos / al proceso de IA en tu área}

**qué hacer concretamente en los próximos 7 días:**

{2-3 acciones específicas, no genéricas. ejemplo:}

1. {acción concreta, ej: "antes del próximo flujo con datos de
   clientes, definir con el participante 1 página de qué campos del CRM
   pueden ir al LLM corporativo y qué campos no"}
2. {acción, ej: "agendar 1 sesión de 30 min con legal/IT para clarificar
   política de PII en uso de IA — el participante asistencia opcional"}
3. {acción opcional, ej: "pedir al participante que documente 1
   ejemplo reciente donde pasó datos al LLM, para revisión cruzada"}

**razón de la recomendación** (1 párrafo, basado en datos del reporte):

{ejemplo:}

> *"el participante muestra criterio en encuadre de prompts (contexto:
> A) pero gaps recurrentes en privacidad (B). en flujos donde no toca
> datos personales puede operar; en flujos con PII requiere entrenamiento
> antes de operación autónoma. el riesgo principal observado es exposición
> involuntaria de datos de clientes al modelo, no falta de habilidad técnica."*

---

## próximo paso sugerido para ti como manager

{1-2 oraciones específicas sobre qué el manager debe hacer mañana, no
"considera implementar". ejemplo:}

> *"agenda 20 minutos con el participante esta semana para discutir el
> reporte juntos. la conversación más útil es alrededor de qué piensa
> él/ella sobre lo observado, no defender los resultados."*

---

## qué NO concluir de este reporte

- este es un diagnóstico **single-participant** sobre **1 caso
  simulado** — no es evaluación de desempeño general del participante
- no es predicción de comportamiento en otras situaciones (otros
  flujos, otra presión, otra tecnología)
- no compara al participante con otros miembros del equipo (eso
  requeriría diagnóstico del equipo completo)
- no certifica capacidad o incapacidad — es señal sobre criterio en un
  escenario específico

---

## metadata técnica (apéndice)

- evaluación humana: 2 consultores externos calificaron sesión por
  separado, con rúbrica ciega; acuerdo cohen's kappa: {kappa_value}
- LLM-judge: corrió después de los humanos, con modelo y prompt
  congelados; agreement con humanos: {agreement_pct}%
- en caso de discrepancia entre evaluadores: {se invocó 3er evaluador
  / se usó promedio / etc.}
- versión de rúbrica usada: rubric_marketing_v1@1.0.0
- versión del caso: marketing_urgent_campaign_pii_v1
- variante usada: marketing_urgent_campaign_pii__loop_saas_b2b_v1

---

*confidencial. este reporte contiene observaciones sobre comportamiento
en una situación simulada. compártelo solo con quien necesita verlo
para tomar acción.*
```

---

## variante sintética para grupo B (fase 0)

para validar **buyer validity** sin esperar al output real del grupo A
(que puede tomar 2 semanas más), el operador genera UN reporte sintético
con esta plantilla **antes** de las sesiones reales. propósito: el
grupo B (3 managers) puede revisarlo en paralelo al reclutamiento del
grupo A.

el reporte sintético debe:

- usar **nombres ficticios** ("Mariana López") consistentes con los del caso
- mostrar **scores variados** entre dimensiones (no todo A, no todo B)
- incluir **2-3 gaps** detectables
- incluir **1 risk_event high**
- llevar **al final un disclaimer:** "este reporte es sintético —
  construido por Itera para validar formato. los datos no provienen de
  un participante real."

la versión sintética se llama
`field_test_v0/manager_report_synthetic_v0.md` y se construye 1 sola
vez. después de las 5 sesiones reales, se genera 1 reporte real (el
operador elige cuál de las 5 sesiones se muestra al grupo B en su
segunda revisión, o si las 3 ven el mismo).

---

## el ask al grupo B (cuando reciben el reporte)

mensaje literal que el grupo B recibe junto al reporte:

> *"hola — agradeceríamos 15 min para que leas este reporte y nos
> cuentes qué harías si lo recibieras sobre alguien de tu equipo. no es
> una prueba de ti; estamos validando si el formato del reporte
> comunica lo suficiente para que tomes decisión.*
>
> *cuando puedas, dinos:*
> 1. *¿qué decisión tomarías a partir de este reporte?*
> 2. *¿qué información te faltó?*
> 3. *¿qué información sobra o no es útil?*
> 4. *¿lo compartirías con tu CMO/superior tal cual está?*
>
> *agendamos 15 min después de que lo leas. gracias."*

las respuestas del grupo B se capturan en
`5_post_test_interview_protocol.md` (sección "entrevistas grupo B").

---

## qué pasa si el reporte falla buyer validity

si los 3 managers no toman una acción específica con el reporte (señal
6 de la decision matrix en "umbral matar el reporte"):

- **NO mata el caso**
- mata el **formato del reporte como está**
- iteramos esta plantilla con feedback específico de los managers
- re-probamos con los **mismos 3 managers** en ~1 semana
- si en la segunda ronda tampoco toman acción, hay problema más
  profundo: la información que produce el experimento no es accionable
  → re-evaluar producto

esto está documentado en `9_decision_matrix.md` señal 6.
