# reporte sintético v0 — para validar buyer validity con grupo B en paralelo

> **propósito.** este reporte es SINTÉTICO. los managers del grupo B lo
> leen ANTES de que existan reportes reales de las 5 sesiones del grupo
> A. desbloquea la validación de buyer validity en paralelo al
> reclutamiento de grupo A.
>
> **construido por:** claude_product
> **basado en:** plantilla `4_manager_report_template.md` v1.0.0
> **datos:** 100% sintéticos. no provienen de ningún participante real.
> nombres ficticios consistentes con datos del case_variant primary.
>
> **versión:** v0.1.0 — congelada antes de entrevistas con Grupo B.
>
> **propósito de los scores:** mostrar distribución VARIADA (no todo A,
> no todo B) para que el grupo B pueda observar un reporte realista
> con datos suficientes para decidir.

---

# reporte de sesión — diagnóstico IA en marketing

**participante:** Mariana (anonimizado)
**rol:** Marketing Manager
**equipo:** marketing growth — empresa SaaS B2B LATAM mid-market
**caso evaluado:** campaña urgente con feedback de clientes
**duración de sesión:** 21 min
**evaluadores:** 2 consultores externos + LLM-judge (modelo congelado)
**fecha del diagnóstico:** 2026-05-25 (sintético)

---

## qué evaluamos

5 dimensiones de criterio operativo con IA, observadas en una situación
laboral simulada con presión real (deadline de 16 horas, datos sensibles
de clientes, autoridad del VP que explícitamente pide no involucrar a
legal, ambigüedad sobre uso de PII para targeting):

- **contexto** — encuadre de situación, audiencia y restricciones al usar IA
- **privacidad** — protección de datos personales y confidenciales
- **validación** — verificación del output de IA antes de usarlo
- **juicio** — lectura de riesgos, autoridad y consecuencias
- **decisión** — claridad y responsabilidad de la acción final

---

## resultado por dimensión

| dimensión | banda observada |
|---|---|
| contexto | A |
| privacidad | B |
| validación | M |
| juicio | M |
| decisión | A |

bandas:
- **A — alto:** criterio claro y sostenido en esa dimensión
- **M — medio:** criterio parcial; aciertos con huecos visibles
- **B — bajo:** falta de criterio; omite consideraciones críticas

---

## gaps observados

**`expose_pii`** (severidad: high)
qué se observó: al preparar los datos para el modelo, mantuvo los
campos `name`, `email` y `company` sin transformación. el prompt
enviado al LLM corporativo incluyó 60 registros con identificadores
personales completos.
por qué importa: exposición de datos personales sin consentimiento
explícito → riesgo regulatorio (LFPDPPP en México, Ley 1581 en
Colombia) + riesgo reputacional si la conversación se filtra o el
modelo retiene contexto.

**`weak_artifact_review`** (severidad: medium)
qué se observó: al revisar el output del modelo, marcó las 3
sugerencias como "problemáticas" sin discriminar cuál era el problema
de cada una. no diferenció entre cifras inventadas (bloqueante) y
posicionamiento genérico (editable).
por qué importa: si revisas todo como rojo, el equipo no sabe qué
bloquear vs qué editar. paralisis o sub-revisión, ambos riesgos.

**`accept_output_no_validation`** (severidad: medium)
qué se observó: en el followup del paso 2, escribió "uso los 3 ángulos
tal cual, ya están bien armados" sin mencionar qué validaría antes de
publicar. una de las cifras del output era inventada por el modelo.
por qué importa: publicar cifra inventada en campaña con audiencia
B2B daña credibilidad de marca. el equipo de sales recibe pregunta
"¿de dónde sale esa cifra?" sin respuesta.

---

## riesgos detectados durante la sesión

**`exposed_pii_to_model`** (severity: high)
paso del caso: 2 (interacción con el modelo)
excerpt anonimizado:

> *"...pegué el dataset completo con los 60 registros, nombres,
> emails y empresas, en el prompt al modelo. el GPT corporativo está
> aprobado por IT, no debería ser problema..."*

**`hidden_pii_usage_from_authority`** (severity: medium)
paso del caso: 4 (entrega a la VP)
excerpt anonimizado:

> *"...mandé los 3 ángulos en bullets a Camila. limpios, listos para
> campaña. no le mencioné que el dataset tenía datos personales..."*

---

## lo que sí salió bien

- el participante encuadró correctamente la audiencia en el prompt
  (LinkedIn ads + email a prospects), tono corporativo cálido,
  restricciones de longitud — el prompt al modelo fue completo
  contextualmente.
- en el paso 5, cuando Camila propuso usar `revenue_potential` para
  segmentación, el participante objetó proponiendo alternativa concreta
  ("mejor segmentemos por sector y tamaño de empresa, te paso la lista
  en 30 min"). decisión clara, profesional.
- la decisión final del paso 4 incluyó próximos pasos accionables a
  Camila ("te paso los assets revisados a las 7 PM").

---

## recomendación accionable

**acción sugerida:** entrenar

**a quién le aplica esta recomendación:** al participante y,
adicionalmente, al equipo de marketing si comparten flujos similares
con datos de clientes.

**qué hacer concretamente en los próximos 7 días:**

1. agendar 1 sesión de 45 min con el participante esta semana para
   revisar específicamente: qué campos del CRM/datasets de clientes
   pueden ir al LLM corporativo y cuáles no. salir de la sesión con 1
   página de "checklist de privacidad antes de pegar al modelo".
2. coordinar con IT/legal una clarificación de política de PII para
   el LLM corporativo aprobado — el participante muestra que asume que
   "aprobado por IT" significa "puedo pegar lo que quiera", lo cual
   no es la política actual.
3. pedir al participante que documente 1 ejemplo reciente de uso de IA
   con datos de clientes (no sintético, real) para revisión cruzada
   con el lead de privacidad/legal.

**razón de la recomendación:**

> *"el participante muestra criterio fuerte en encuadre de prompts
> (contexto: A) y en comunicación final (decisión: A), pero gap
> sistemático en privacidad (B) que se manifestó tanto en preparación
> de datos como en omisión hacia la autoridad. la mejora en juicio
> (M) es viable con feedback estructurado. en flujos donde no toca
> datos de clientes puede operar autónomo; en flujos con PII requiere
> entrenamiento + checkpoint antes de operación. el riesgo principal
> observado es exposición involuntaria de datos personales, no falta
> de habilidad técnica."*

---

## próximo paso sugerido para ti como manager

agenda 20 minutos con Mariana esta semana para discutir el reporte
juntos. la conversación más útil es alrededor de qué piensa ella sobre
lo observado, no defender los resultados. la mayoría de los gaps son
de criterio aprendible, no de habilidad técnica innata.

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
  separado, con rúbrica ciega; acuerdo cohen's kappa: 0.52
- LLM-judge: corrió después de los humanos, con modelo y prompt
  congelados; agreement con humanos: 73%
- en caso de discrepancia entre evaluadores: 2 cells requirieron
  conversación de calibración; no se invocó 3er evaluador
- versión de rúbrica usada: rubric_marketing_v1@1.0.0
- versión del caso: marketing_urgent_campaign_pii_v1
- variante usada: marketing_urgent_campaign_pii__loop_saas_b2b_v1

---

> **disclaimer obligatorio:** este reporte es sintético — construido
> por Itera para validar formato. los datos no provienen de un
> participante real. los nombres son ficticios. los scores, gaps y
> excerpts se diseñaron para mostrar un caso realista con varianza
> entre dimensiones.

*confidencial. este reporte es material de research interno; no
distribuir.*
