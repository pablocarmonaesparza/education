---
type: copy
title: strings del runtime del empleado
audience: empleado en sesión de simulación
locale: es-MX
version: 1
author: claude_product
last_updated: 2026-05-12
---

# strings del runtime del empleado

> copy que el empleado ve durante una sesión del simulador. todo en
> español neutro LATAM, lowercase con IA siempre en mayúsculas.

## principio de copy

el empleado NO está en un curso. está en un caso de trabajo simulado.
todo el copy debe sentirse como entorno laboral, no como entrenamiento.

prohibido:
- "lección", "módulo", "curso", "viaje", "aventura"
- gamificación visible (puntos, badges, streaks durante la sesión)
- emojis durante el caso
- felicitaciones tipo "¡genial!" / "¡bien hecho!"
- explicaciones pedagógicas durante el caso

permitido:
- voz del entorno simulado (Camila te escribe, brief de tu VP)
- transiciones operativas mínimas ("siguiente paso", "guarda y continúa")
- feedback funcional ("guardado", "respuesta capturada")
- el reporte al final puede ser más cálido — durante el caso, frío

## strings por surface

### onboarding del Sprint (antes del primer caso)

```
bienvenida_al_sprint:
  title: "Sprint: {sprint_name}"
  subtitle: "{duration_days} días · {cases_count} casos · {role_label}"
  body: |
    el Simulador mide tu criterio para operar con IA en trabajo real.
    no es un curso. cada caso es una situación que pasa en tu rol,
    y tomas decisiones reales con presión real.

    serás evaluado en 5 dimensiones:
    · contexto · privacidad · validación · juicio · decisión

    tus decisiones se guardan. tu manager verá un reporte agregado
    del equipo, no transcripts individuales.
  cta_primary: "empezar primer caso"
  cta_secondary: "ver dimensiones en detalle"
```

### entrada a un caso

```
caso_intro:
  context_label: "contexto"
  scenario_label: "qué está pasando"
  duration_estimate: "~{minutes} min · {steps_count} pasos"
  start_cta: "empezar"
  back_cta: "volver al sprint"
  note: "puedes pausar entre pasos. no puedes pausar en medio de un paso."
```

### transiciones entre steps

```
step_transitions:
  saved: "guardado."
  next_step: "siguiente paso ({current}/{total})"
  thinking: "anotando tu respuesta..."
  llm_thinking: "el modelo está respondiendo..."
  llm_received: "respuesta recibida. revisa antes de continuar."
  step_completed: ""  # vacío adrede — no felicitación
```

### strings por tipo de step

```
step_data_scope:
  field_actions:
    keep: "usar tal cual"
    transform: "transformar"
    drop: "descartar"
  transform_options:
    bucketize: "agrupar en rangos"
    anonymize: "anonimizar"
    extract_theme: "extraer tema"
  helper_text: |
    elige qué hacer con cada campo antes de pasarlo al modelo.
    no hay respuesta única — depende del trade-off señal/riesgo.

step_llm_beat:
  prompt_field_label: "tu prompt"
  prompt_helper: "redacta el prompt como si fueras a enviarlo. el modelo responderá una vez."
  prompt_placeholder: "tu prompt aquí..."
  model_label: "modelo de Itera"
  send_cta: "enviar al modelo"
  followup_field_label: "qué harás con esta respuesta"
  followup_helper: "menos de 80 palabras."

step_artifact_review:
  instruction_helper: |
    revisa cada segmento del output del modelo. marca lo que NO enviarías
    a tu jefe tal cual. puedes seleccionar múltiples problemas por segmento.
  target_labels:
    unverifiable_claim: "cifra o claim sin evidencia"
    exposed_sensitive_data: "dato sensible expuesto"
    weak_segment_logic: "lógica de segmentación débil"
    generic_positioning: "posicionamiento genérico"

step_decision_select:
  helper_text: "elige una opción."
  no_back_warning: "después de elegir no podrás cambiar tu respuesta en este caso."

step_decision_open_short:
  field_label: "tu respuesta"
  char_counter: "{used}/{max} caracteres"
  placeholder: "escribe directamente..."
```

### avisos durante la sesión

```
warnings:
  about_to_send_pii: |
    detectamos que tu prompt parece contener PII (nombre/email/empresa
    sin transformar). ¿estás seguro?
    [continuar de todos modos] [volver a editar]

  abandon_step: |
    si sales ahora, este paso queda incompleto y afecta tu score.
    ¿quieres pausar el caso completo en su lugar?
    [pausar caso] [salir igual]

  timeout_warning: |
    el caso lleva más de {warning_threshold_min} min activo.
    puedes pausar y retomar después.
    [pausar] [seguir]
```

### cierre del caso (antes del reporte)

```
case_end:
  evaluating: "evaluando tu sesión... (~12 segundos)"
  practice_beat_intro: |
    antes del score final, pequeña práctica de {duration_seconds} segundos.
    detectamos un patrón que vale reforzar.
  practice_beat_skip: |
    puedes saltarla, pero te recomendamos hacerla — el siguiente caso
    se siente más difícil sin esto.
  case_completed_neutral: "caso terminado. tu sesión queda guardada."
```

### feedback individual (después del caso)

```
session_report:
  header: "tu sesión"
  case_title_label: "caso"
  duration_label: "duración"
  score_label: "readiness en este caso"
  band_label_template: "{band_name}: {score}/100"

  dimensions_section_title: "tus dimensiones"
  dimension_score_template: "{dimension_name}: {score}/100"
  dimension_explanation_template: |
    {dimension_name_lower}: {public_definition}
    tu desempeño: {observation_short}

  gaps_section_title: "qué entrenar"
  gap_template: |
    {gap_label}: {short_description}
    practice disponible: {practice_beat_name} ({duration_min} min)

  resim_notice: |
    en {delay_days} días recibirás una variante de este caso para
    practicar lo aprendido. tu mejora cuenta hacia tu readiness del
    Sprint.

  privacy_notice: |
    tu manager ve agregados del equipo. no ve transcripts individuales
    ni el texto de tus respuestas.

  cta_next_case: "siguiente caso del sprint"
  cta_dashboard: "volver al sprint"
```

### sprint completado

```
sprint_completed:
  header: "sprint terminado"
  body_template: |
    completaste {cases_completed}/{cases_total} casos del Sprint
    {sprint_name}.

    tu readiness al cierre: {final_readiness}/100
    cambio desde el inicio: {delta_readiness}

    tu manager recibió el reporte agregado. los detalles individuales
    quedan en tu dashboard personal.
  cta_view_my_dashboard: "ver mi dashboard"
  cta_close: "cerrar"
```

### errores y estados de excepción

```
errors:
  llm_unavailable: |
    el modelo de Itera está temporalmente fuera. estamos reintentando.
    tu progreso está guardado.

  llm_timeout: |
    el modelo tardó más de lo esperado. ¿reintentar?

  session_expired: |
    tu sesión expiró. retomamos donde te quedaste — sin penalty.

  judge_low_confidence: |
    el evaluador automático no está 100% seguro de tu respuesta.
    un revisor humano de Itera te dará feedback en {sla_hours}h.
```

## reglas de copy críticas

1. **lowercase en prose** salvo nombres propios, inicios de oración después de punto, y siglas (IA, VP, CRM, SLA, PII, DPO).

2. **IA siempre en mayúsculas** — nunca "ia" ni "Ia".

3. **nada de imperativos pedagógicos**. "ahora vas a aprender" → prohibido.

4. **mención al manager solo en privacy_notice y cierre**. durante el caso, el manager no existe. está la jefa del caso ficticio (Camila / Hannah / etc.), no "tu manager de Itera".

5. **el sistema no celebra**. score 87 no es "¡excelente!". es "operador avanzado: 87/100".

6. **errores siempre proponen acción**. "fallamos al guardar" → mal. "no pudimos guardar. ¿reintentar?" → bien.

## tonos a evitar

- **no usar:** "¡bien hecho!" / "¡excelente trabajo!" — el sistema no aplaude
- **no usar:** "tu viaje continúa" / "siguiente nivel" — esto no es un game
- **no usar:** "completaste tu objetivo" — usa "caso terminado"
- **no usar:** emojis en strings runtime
- **no usar:** "estamos aquí para ayudarte" — el sistema no es asistente, es evaluador

## prueba de cordura para nuevos strings

antes de agregar un string nuevo, debe pasar:

1. ¿se sentiría natural en un entorno laboral real (no curso)?
2. ¿es lowercase + IA mayúsculas?
3. ¿propone acción concreta (si es CTA o error)?
4. ¿evita celebración o gamificación visible?

si una falla, el string no entra.
