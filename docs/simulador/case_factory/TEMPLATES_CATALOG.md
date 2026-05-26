# Catálogo de Templates · Referencia rápida para autores

> **Propósito**: referencia legible de los 17 templates del catálogo cerrado para ensamblar casos como Lego. Cada entrada describe en qué sección encaja, qué contenido necesita del caso (`personalization_knobs`), qué evidencia emite y cuándo usarlo o evitarlo.
>
> **Fuente de verdad**: `docs/simulador/case_factory/EXERCISE_BLOCK_CATALOG.yaml` (v0.11.0). Este archivo es **derivado** para que un autor lo lea sin abrir YAML.
>
> **Cómo usar**: cuando ensambles un caso (siguiendo `CASE_ASSEMBLY_SCHEMA.yaml`), abre este archivo para elegir qué template va en cada diapositiva y qué `content` necesitas escribir.
>
> **Reglas de copy para el contenido de los slides**:
> - Cero acrónimos (escribe "inteligencia artificial" no "IA" en prosa; "IA" sí en labels cortos)
> - Cero em dash (usa punto, coma o paréntesis)
> - "IA" siempre mayúsculas cuando aparezca como label corto
> - Singulares: "API", "MCP" (no "APIs", "MCPs"); "Skills" sí lleva s (es nombre propio de Anthropic)
> - Body de cualquier slide usa markdown con bold en los datos críticos

---

## Las 5 secciones canónicas

Cada caso se ensambla en 5 secciones × 5 diapositivas = 25 slides totales.

| Sección | Función | Templates que más encajan |
|---|---|---|
| **Contexto** | Entender situación, rol, presión, audiencia | `case_cover`, `reading_message`, `reading_data_table`, `reading_image`, `reading_kpi_cards`, `reading_timeline`, `reading_attachment` |
| **Datos** | Decidir qué datos puedo usar, transformar, excluir | `reading_data_table`, `categorize_rows`, `reading_attachment` |
| **IA** | Formular la petición a la IA bajo restricciones | `ai_textfield_free`, `ai_textfield_guided`, `model_tradeoff_sliders` |
| **Revisión** | Detectar errores en el output de la IA | `ai_output_review`, `ai_comparison` |
| **Cierre** | Decidir acción + comunicar al manager | `dashboard_pivot`, `workflow_builder`, `tradeoff_decision_memo` |

---

## Pasivos (8)

Bloques que solo presentan contenido. No emiten evidencia al judge. Cierran con un botón Continuar del shell.

### case_cover · Portada del caso (lab_ref 00)

- **Tipo**: pasivo
- **Sección habitual**: Contexto (siempre slot 1 del caso)
- **Knobs que el caso provee** (`caseContext.meta`):
  - `profile` (string · "Marketing", "Sales", "Customer Success", etc.)
  - `level` (string · "N1 · Fundamentos", "N2 · Workflow", "N3 · Agentes")
  - `estimatedMinutes` (number · 12 para N1, 18 para N2, 24 para N3)
  - `timerSeconds` (number opcional · si está set, ofrece temporizador con toggle al usuario)
  - `timerDefaultOn` (boolean · default false, controla estado inicial del toggle)
  - `tools[]` (array de íconos · `ai`, `data`, `messaging`, `documents`, `workflow`)
- **Slot del shell**: `title` = título del caso, `body` = brief del caso (markdown con bold)
- **Cuándo usar**: siempre como primera diapositiva del caso. No hay excepción.
- **Evitar cuando**: nunca se evita.
- **Evidencia emitida**: `started_at`, `timer_enabled_at_start`
- **Eyebrow sugerido**: `{level}: {profile}` (ej. "Fundamentos: Marketing")

### reading_passive · Informativa básica (lab_ref 00A)

- **Tipo**: pasivo
- **Sección habitual**: cualquiera (Contexto, Datos, IA, Revisión, Cierre)
- **Knobs**: solo `title` + `body` (markdown)
- **Cuándo usar**: recap rápido, instrucciones previas a un ejercicio activo, cierre contextual de una sección.
- **Evitar cuando**: necesitas evidencia para evaluar (usa bloque activo). Body muy largo que no cabe en viewport sin scroll.
- **Evidencia**: ninguna.

### reading_message · Informativa mensaje (lab_ref 00B)

- **Tipo**: pasivo
- **Sección habitual**: Contexto, Datos
- **Knobs**:
  - `channel` (`email`, `chat`, `ticket`)
  - `from` (`name`, `role`, opcional `avatar`)
  - `to` (string · ej. "Tú · Marketing Lead")
  - `timestamp` (string · ej. "Hoy, 09:42")
  - `subject` (string · solo para email)
  - `body` (markdown · cuerpo del mensaje)
- **Cuándo usar**: email de manager, ticket de cliente, mensaje de Slack que dispara el caso o aporta tensión adicional. Citar comentario de stakeholder.
- **Evitar cuando**: el mensaje requiere respuesta activa del participante (usa `ai_textfield_free` o `conversation_response` archivado).
- **Evidencia**: ninguna.

### reading_data_table · Informativa tabla (lab_ref 00C)

- **Tipo**: pasivo
- **Sección habitual**: Contexto, Datos
- **Knobs**:
  - `columns[]` (`key`, `label`, opcional `width`)
  - `rows[]` (data según columnas)
  - `caption` (opcional · mini-header de la tabla)
- **Cuándo usar**: mostrar filas de leads, tickets, transacciones o métricas tabulares para dar contexto antes de pedir triage o decisión.
- **Evitar cuando**: vas a pedir clasificar campos uno por uno (usa `categorize_rows` activo). Tabla con 30+ filas (usa `dashboard_pivot` o segmenta).
- **Evidencia**: ninguna.

### reading_image · Informativa imagen (lab_ref 00D)

- **Tipo**: pasivo
- **Sección habitual**: Contexto, Datos, Revisión
- **Knobs**:
  - `src` (url de la imagen)
  - `alt` (accesibilidad)
  - `caption` (opcional)
- **Cuándo usar**: screenshot de dashboard, gráfica, UI, captura de error o reporte estático.
- **Evitar cuando**: la imagen es decorativa sin aportar contexto. Detalle muy denso que requiere zoom interactivo.
- **Evidencia**: ninguna.

### reading_kpi_cards · Informativa métricas (lab_ref 00E)

- **Tipo**: pasivo
- **Sección habitual**: Contexto, Datos
- **Knobs**:
  - `kpis[]` (`value`, `label`, opcional `delta` con `direction` `up`/`down`/`flat`)
- **Cuándo usar**: situar contexto de negocio con 1 a 3 métricas grandes. Mostrar ingresos, conversión, cancelación, satisfacción antes de pedir análisis.
- **Evitar cuando**: tienes 4 o más métricas (usa tabla o dashboard). Métricas que requieren interpretación activa (usa `dashboard_pivot`).
- **Evidencia**: ninguna.

### reading_timeline · Informativa cronología (lab_ref 00F)

- **Tipo**: pasivo
- **Sección habitual**: Contexto
- **Knobs**:
  - `events[]` (`when`, `what`, opcional `who`)
- **Cuándo usar**: secuencia de eventos en orden cronológico. Recap rápido de qué pasó antes del momento de decisión.
- **Evitar cuando**: solo hay 1 o 2 eventos (usa body markdown plano). El detalle de cada evento es muy largo (usa múltiples slides).
- **Evidencia**: ninguna.

### reading_attachment · Informativa adjunto (lab_ref 00G)

- **Tipo**: pasivo
- **Sección habitual**: Contexto, Datos
- **Knobs**:
  - `attachments[]` (`name`, `size`, `type`, opcional `description`)
- **Cuándo usar**: adjuntar contrato, brief, presentación o documento al caso. Simular email con archivo adjunto que debe revisarse.
- **Evitar cuando**: el archivo debe abrirse y leerse completo (muestra contenido en otro bloque como `reading_passive` o `reading_data_table`).
- **Evidencia**: ninguna.

---

## Activos (9)

Bloques que capturan respuesta del participante y emiten evidencia al judge. La mayoría tiene su propio botón Continuar interno (auto-advance o subsección de revisar).

### ai_textfield_free · Textfield de IA libre (lab_ref 01)

- **Tipo**: activo · AI-native
- **Sección habitual**: IA, Cierre (cuando la respuesta final es texto libre)
- **Niveles**: N1, N2
- **Knobs**:
  - `model` (modelo disponible · ej. "GPT Corporativo · TI")
  - `placeholder` (texto del composer · ej. "Escribe el prompt que le mandarías al modelo...")
  - `attachmentsAllowed` (boolean)
  - `voiceAllowed` (boolean)
  - `inputArtifact` (opcional · referencia a un artefacto del caso visible en pantalla)
- **Cuándo usar**: medir cómo estructura una petición sin ayudas. Evaluar claridad de objetivo, audiencia, tono, restricciones y output esperado.
- **Evitar cuando**: necesitas medir decisiones granulares (usa `ai_textfield_guided`). La persona no tiene información suficiente del caso (agrega un `reading_*` antes).
- **Evidencia**: `prompt_text`, `instruction_quality`, `constraint_coverage`, `attachment_usage`

### ai_textfield_guided · Textfield de IA guiado (lab_ref 03)

- **Tipo**: activo · AI-native
- **Sección habitual**: IA
- **Niveles**: N1, N2
- **Knobs**:
  - `objectives[]` (opciones del primer chip · 4 ítems típicamente)
  - `audiences[]` (opciones del segundo chip · 4 ítems)
  - `limits[]` (opciones del tercer chip · multi-select, 4 ítems)
  - `models[]` (opciones de modelo · puede heredar de `model_tradeoff_sliders` anterior)
  - `promptTemplate` (string con placeholders · ej. "Objetivo: {objective}. Audiencia: {audience}. Modelo elegido: {model}. Límites: {limits}.")
- **Cuándo usar**: medir decisiones discretas que construyen un prompt. Enseñar razonamiento sin permitir edición libre del output.
- **Evitar cuando**: las opciones no tienen tradeoff real. El caso requiere creatividad abierta. Quieres medir ponderación entre prioridades (usa `model_tradeoff_sliders`).
- **Evidencia**: `selected_objective`, `selected_audience`, `selected_limits`, `selected_model`, `generated_prompt`
- **Maneja Continuar interno**: sí (en la subsección Revisar).

### model_tradeoff_sliders · Sliders de tradeoff de modelo (lab_ref 04)

- **Tipo**: activo · AI-native
- **Sección habitual**: IA (precede a `ai_textfield_guided`)
- **Niveles**: N1, N2, N3
- **Knobs**:
  - `sliderLabels` (`autonomy`, `security`, `cost` por default · pueden customizarse)
  - `sliderDescriptions` (string corto por slider)
  - `availableModels[]` (catálogo restringido por caso)
  - `recommendationMatrix` (combinación de prioridades → modelo recomendado)
- **Cuándo usar**: medir cómo el participante pondera autonomía, seguridad y costo para elegir modelo. Anteceder a `ai_textfield_guided` cuando el caso necesita justificar la elección.
- **Evitar cuando**: el caso fija el modelo por contrato (no hay decisión real). La elección es binaria (usa un toggle simple).
- **Evidencia**: `autonomy_priority`, `security_priority`, `cost_priority`, `recommended_model_id`

### categorize_rows · Clasificar filas con acción (lab_ref 05)

- **Tipo**: activo · AI-native
- **Sección habitual**: Datos, IA, Revisión, Cierre
- **Niveles**: N1, N2, N3
- **Knobs**:
  - `rows[]` (`id`, `title`, `subtitle`, opcional `hint`)
  - `actions[]` (set de strings · ej. `[usar, anonimizar, agregar, excluir]` o `[permitir, revisar, bloquear]` o `[bajo, medio, alto]`)
  - `actionStyle` (`neutral`, `permission`, `severity` · controla color de chips)
  - `prompt` (string · pregunta del slide · ej. "Decide qué hacer con cada contacto antes del envío.")
- **Cuándo usar**: el participante debe clasificar un set de items (campos, contactos, eventos, riesgos) con una acción discreta por item. Reemplaza a los antiguos `data_table_triage`, `permission_matrix`, `event_flag_review`.
- **Evitar cuando**: solo hay 1 o 2 items (usa un toggle simple). La decisión necesita un slider continuo (usa `model_tradeoff_sliders`).
- **Evidencia**: `row_actions` (array `{row_id, action}`)
- **Maneja Continuar interno**: sí (auto-advance al completar todas las filas).

### ai_output_review · Revisión de output de IA (lab_ref 06)

- **Tipo**: activo · AI-native
- **Sección habitual**: Revisión
- **Niveles**: N1, N2, N3
- **Knobs**:
  - `segments[]` (`id`, `text`, opcional `flagOptions` overrideando los defaults)
  - `flagOptions[]` (default · `claim_no_verificado`, `tono_agresivo`, `dato_sensible`, `frase_reutilizable`)
  - `prompt` (string · ej. "Marca los problemas antes de enviar este mensaje.")
  - `followupPrompt` (opcional · pregunta a la IA después del flagging)
- **Cuándo usar**: la IA produjo algo plausible pero imperfecto. El participante debe detectar errores antes de usar o enviar.
- **Evitar cuando**: el output es caricaturescamente malo. No hay riesgos o claims verificables.
- **Evidencia**: `flagged_segments`, `missed_risks`, `correction_request`

### ai_comparison · Comparación de respuestas (lab_ref 07)

- **Tipo**: activo · AI-native
- **Sección habitual**: Revisión, Cierre
- **Niveles**: N1, N2
- **Knobs**:
  - `options[]` (4 opciones · `id` A/B/C/D, `text`, opcional `meta` con criterios visibles)
  - `prompt` (string · ej. "Elige la versión que enviarías al cliente.")
- **Cuándo usar**: hay 2 a 4 outputs plausibles con tradeoffs reales. Medir criterio de calidad, no gusto estético.
- **Evitar cuando**: una opción es obviamente correcta o absurda. El participante no puede explicar por qué eligió.
- **Evidencia**: `selected_output` (A/B/C/D)
- **Maneja Continuar interno**: sí (auto-advance al elegir).

### workflow_builder · Workflow builder (lab_ref 08)

- **Tipo**: activo · AI-native
- **Sección habitual**: IA, Cierre
- **Niveles**: N2
- **Knobs**:
  - `steps[]` (`id`, `label`, opcional `description` y `tool`)
  - `prompt` (string · ej. "Ordena los pasos del flujo de envío con revisión humana.")
- **Cuándo usar**: el caso mide handoffs, checkpoints y responsabilidad dentro de un flujo. La IA participa en un proceso, no en una tarea aislada.
- **Evitar cuando**: el flujo se reduce a escribir un prompt. No hay revisión humana o entrega definida.
- **Evidencia**: `enabled_steps`, `step_order`

### dashboard_pivot · Dashboard / pivot (lab_ref 09)

- **Tipo**: activo · traditional business signal
- **Sección habitual**: Cierre
- **Niveles**: N2, N3
- **Knobs**:
  - `filters[]` (cada uno con `id`, `label`, `metrics` array con `label` + `value` + opcional `band` `alto`/`medio`/`bajo`)
  - `prompt` (string · ej. "Elige el segmento que vas a llevar al manager esta semana.")
- **Cuándo usar**: el participante debe leer una señal de negocio y decidir qué llevar al líder. Hay métricas con caveats, filtros o segmentación.
- **Evitar cuando**: el dashboard no fuerza una decisión. Las métricas son decorativas o irrelevantes.
- **Evidencia**: `selected_filter`
- **Maneja Continuar interno**: sí (auto-advance al elegir).

### tradeoff_decision_memo · Decisión con ventajas y costos + memo (lab_ref 10)

- **Tipo**: activo · traditional closure
- **Sección habitual**: Cierre (típicamente último slide del caso)
- **Niveles**: N1, N2, N3
- **Knobs**:
  - `options[]` (3 opciones típicamente · `id`, `label`, `hint` con tradeoff explícito · ej. "Lanzar ahora", "Piloto controlado", "Pausar y escalar")
  - `prompt` (string · ej. "Cierra con tu recomendación para el manager.")
  - `memoPlaceholder` (string · ej. "Explica qué harías, por qué, qué riesgo aceptas y qué tendrías que revisar antes de avanzar.")
  - `memoMaxChars` (number · 700 por default)
  - `memoAudience` (string · ej. "manager directo", "VP de Marketing")
- **Cuándo usar**: cerrar el caso con una recomendación responsable. Medir si la persona entiende consecuencias, riesgos aceptados y siguiente paso.
- **Evitar cuando**: solo quieres medir redacción. Las opciones de decisión no tienen costos reales.
- **Evidencia**: `decision` (opción elegida), `memo` (texto del memo)

---

## Notas finales

- **OWNS_CONTINUE** (bloques que manejan su propio botón Continuar · no usan el del shell): `case_cover`, `ai_textfield_guided`, `categorize_rows`, `ai_comparison`, `dashboard_pivot`. El resto usa el Continuar default del shell.
- **Ratio AI-native mínimo**: 60% del caso (ver `EXERCISE_BLOCK_CATALOG.yaml` regla 21 de `product_rules`). Pasivos máximo 40% del caso.
- **Selection recipes por nivel**:
  - N1 (Fundamentos): `ai_textfield_free`, `ai_textfield_guided`, `categorize_rows`, `ai_output_review`, `tradeoff_decision_memo`
  - N2 (Workflow): añade `model_tradeoff_sliders`, `workflow_builder`, `dashboard_pivot`
  - N3 (Agentes): foco en `ai_textfield_guided`, `categorize_rows`, `workflow_builder`, `dashboard_pivot`, `tradeoff_decision_memo`
