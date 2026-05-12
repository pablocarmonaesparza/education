---
type: copy
title: plantillas de recomendación al manager
audience: manager (Head of Area / CHRO / Director / dueño-PyME)
locale: es-MX
version: 1
author: claude_product
last_updated: 2026-05-12
---

# plantillas de recomendación al manager

> el motor emite UNA de estas 4 recomendaciones al cierre de un sprint
> (no por caso individual). la recomendación es la **acción accionable**
> que el manager toma después de leer el reporte. cada plantilla está
> diseñada para defenderse sola — el manager no debería tener que
> interpretar nada.

## principio de copy

el reporte ejecutivo NO es educativo. es operativo. cada string debe:

1. nombrar el estado actual del equipo (qué)
2. nombrar la razón principal del estado (por qué)
3. proponer una acción única y clara (qué hacer)
4. terminar con un timeframe concreto (cuándo)

prohibido:
- preguntas retóricas tipo "¿está tu equipo listo?"
- lenguaje de coaching tipo "una oportunidad para crecer"
- jerga de aprendizaje tipo "viaje de aprendizaje" o "journey"
- emojis o branding excesivo

permitido:
- cifras concretas del reporte
- nombres de dimensiones o gaps específicos (vocabulario del producto)
- referencias a casos del Sprint (sin nombrar a personas individuales)
- tono ejecutivo seco

## las 4 recomendaciones

### 1. pilotar

usado cuando: readiness ≥ 78 en todas las dimensiones críticas para el rol; gaps high resueltos en re-simulación; risk_events bajos.

```
recomendación: PILOTAR

tu equipo de marketing (8 personas) está listo para pilotear
uso de IA en flujos productivos. readiness global: 84/100.
dimensiones críticas (privacidad 87, validación 82, juicio 81)
superan el umbral de pilotaje (78).

próxima acción: define 2 flujos de marketing donde el equipo
puede usar IA con supervisión semanal — sugerimos: redacción
de copy + análisis de feedback de clientes (anonimizado).
arranca esta semana, revisa resultados a 30 días.
```

### 2. entrenar

usado cuando: readiness 60-77; al menos 1 dimensión < 70; gaps medium pendientes; mejora visible en re-simulación pero no consolidada.

```
recomendación: ENTRENAR

tu equipo de marketing (8 personas) muestra criterio en formación.
readiness global: 68/100. dimensión más débil: privacidad (61).
gaps recurrentes: 4 personas dispararon "expose_pii" en al menos
2 casos del Sprint.

próxima acción: corre un segundo Sprint enfocado en privacidad
+ validación (mismo equipo, casos nuevos, 30 días). la
re-simulación mostró transferencia parcial — un segundo Sprint
consolida la mejora antes de mover a flujos productivos.
```

### 3. pausar

usado cuando: readiness < 60; ≥ 2 dimensiones < 50; risk_events high recurrentes; sin mejora en re-simulación.

```
recomendación: PAUSAR uso autónomo de IA

tu equipo de marketing (8 personas) NO está listo para uso
autónomo de IA en flujos sensibles. readiness global: 51/100.
3 dimensiones bajo umbral mínimo: privacidad (44), juicio (48),
validación (52). risk_events high detectados en 5 sesiones.

próxima acción: bloquea uso de IA sobre datos de clientes hasta
nuevo Sprint. el equipo puede seguir usando IA para tareas
internas (drafts, brainstorms, búsqueda) pero no para flujos
que toquen PII o output público. re-evalúa en 60 días con
Sprint nuevo + practice acumulada.
```

### 4. escalar

usado cuando: readiness mixto (algunas personas listas, otras no); risk_events apuntan a problemas de proceso, no de individuos; el Sprint reveló brechas que el manager solo no puede resolver.

```
recomendación: ESCALAR a aprobador interno

el sprint reveló que el problema NO es individual — es de
proceso. readiness del equipo: 64/100 promedio, pero con varianza
alta (rango 38-87). 6 risk_events comparten patrón: ausencia de
política clara sobre PII en flujos de marketing.

próxima acción: convoca a legal/compliance/DPO antes de habilitar
IA en flujos productivos. el equipo no necesita más entrenamiento;
necesita una política a la cual entrenarse. recomendamos definir
3 cosas con tu aprobador: qué datos pueden ir al LLM corporativo,
qué validación es obligatoria antes de output público, y cómo se
escala una decisión gris.
```

## variables a poblar

cada plantilla recibe estos slots del motor:

```
{team_name}              # "marketing" / "ventas" / "ops"
{team_size}              # integer
{readiness_global}       # 0-100
{weakest_dimension_name} # "privacidad" / "juicio" / ...
{weakest_dimension_score} # 0-100
{recurring_gap_id}       # "expose_pii" / ...
{recurring_gap_count}    # cuántas personas dispararon ese gap
{high_risk_events_count} # cuántos risk_events high
{sprint_count_completed} # 1 = primer sprint, 2+ = recurrente
```

el motor selecciona la plantilla según las reglas siguientes (en orden):

1. si `readiness_global < 60` AND `dimensions_below_50 >= 2` → **pausar**
2. si `high_risk_events_count >= 3` AND `pattern_detected = policy_gap` → **escalar**
3. si `readiness_global >= 78` AND `critical_dimensions >= 78` AND `gaps_high == 0` → **pilotar**
4. else → **entrenar**

## copy adicional: el contexto del reporte

prefacio del reporte ejecutivo, antes de la recomendación:

```
reporte del Sprint marketing_30d
equipo: {team_name} · {team_size} personas
ventana: {sprint_start_date} → {sprint_end_date}
casos completados: {cases_completed}/{cases_total}

readiness global: {readiness_global}/100 ({band_label})

dimensiones:
  contexto:    {contexto_score}/100
  privacidad:  {privacidad_score}/100
  validacion:  {validacion_score}/100
  juicio:      {juicio_score}/100
  decision:    {decision_score}/100

gaps más recurrentes:
  {gap_1_id}: {gap_1_count} personas
  {gap_2_id}: {gap_2_count} personas
  {gap_3_id}: {gap_3_count} personas

risk_events: {risk_events_count} total ({high} high, {medium} medium, {low} low)
```

posfacio (siempre incluido al final):

```
los detalles individuales por persona están disponibles en el
dashboard del equipo. esta recomendación se basa en agregado del
Sprint — no en sesiones individuales.

el siguiente Sprint estará disponible para asignar a partir de
{next_sprint_available_date}.
```

## visibilidad del manager (alineado con FLUJO_RUNTIME_V0.md)

regla v0: el manager ve **agregados, gaps y risk_events**. NO ve
transcript individual completo del LLM beat por defecto.

excepción: cuando un risk_event tiene `severity: high`, el reporte
incluye un **excerpt anonimizado** del paso donde se disparó (texto
con nombres/identificadores removidos pero contenido conservado), para
que el manager pueda evaluar el patrón sin asociarlo a una persona.

ejemplo de excerpt anonimizado en el reporte:

```
risk_event detectado (high) — exposición de PII en prompt al LLM
caso: marketing_urgent_campaign_pii
paso: 2 (llm_beat)
excerpt anonimizado:
  "...pegué el dataset completo con datos de [PERSONA_A] y
  [PERSONA_B], pero pensé que el modelo corporativo era seguro..."
```

los managers NO pueden:
- ver el nombre del empleado que disparó el evento
- ver el prompt completo del empleado
- ver respuestas en steps decision_open_short individuales

los empleados PUEDEN:
- ver su propio dashboard completo (todos sus prompts, decisiones, scores)
- compartir su certificate_export opt-in si quieren mostrar evidencia personal

## tonos a evitar

- **no usar:** "tu equipo está aprendiendo" → vago, no accionable
- **no usar:** "considera entrenar a tu equipo" → tibio, manager paga por decisión clara
- **no usar:** "¡felicidades por completar el sprint!" → no es un curso
- **no usar:** "los resultados son alentadores" → métrica vaga
- **no usar:** emojis en el reporte
- **no usar:** referencias a personas individuales en el cuerpo (preservar privacidad del empleado)

## prueba de cordura para nuevas plantillas

antes de aprobar una nueva variante de recomendación, debe pasar:

1. ¿un CHRO no-técnico la entiende en 30 segundos?
2. ¿hay una acción específica que se pueda calendarizar?
3. ¿la justificación referencia datos del Sprint (no opiniones)?
4. ¿el manager podría defenderla en su comité directivo sin más explicación?

si una falla, la plantilla no entra.
