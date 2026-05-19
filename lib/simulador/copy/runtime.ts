/**
 * Copy versionado del runtime del caso.
 *
 * Cierra C-R-2 del M9 audit (loop_audit_pre_v1_launch.md). Implementa la
 * regla pedagógica del contrato §7: "no enseñar antes de medir" — todo
 * string aquí es para guiar la navegación + capturar respuesta, NO para
 * enseñar la respuesta correcta.
 *
 * Vocabulario canónico estricto: "criterio" (NO "skill"), "evidencia" (NO
 * "results"), "decidir/decisión" (NO "feedback"), "diagnóstico" (NO
 * "assessment"). Banda A/M/B se llama "banda", NO "score" ni "puntuación".
 *
 * Imports desde components/simulador/RuntimeExperience.tsx (Codex importa).
 */

export const runtimeCopy = {
  // ============================================================================
  // Loading / session bootstrap
  // ============================================================================
  loading: {
    initial_label: "Preparando tu caso…",
    initial_sub: "Esto suele tomar 2-3 segundos.",
    resume_label: "Reanudando donde lo dejaste…",
    judge_evaluating_label: "Evaluando tu sesión.",
    judge_evaluating_sub:
      "El judge LLM compara tus decisiones contra la rúbrica. ~15-30 segundos.",
  },

  // ============================================================================
  // Section eyebrow + headlines (las 6 secciones del runtime)
  // ============================================================================
  sections: {
    intro: {
      eyebrow: "Contexto",
      headline: "Antes de empezar.",
    },
    step1_datos: {
      eyebrow: "Paso 01 · Datos",
      headline: "Decide qué información va al modelo.",
    },
    step2_ia: {
      eyebrow: "Paso 02 · IA",
      headline: "Pídele al modelo lo que necesitas.",
    },
    step3_revision: {
      eyebrow: "Paso 03 · Revisión",
      headline: "Lee crítico el output.",
    },
    step4_decision: {
      eyebrow: "Paso 04 · Decisión",
      headline: "Decide cómo entregas.",
    },
    step5_respuesta: {
      eyebrow: "Paso 05 · Respuesta",
      headline: "Responde a tu manager.",
    },
  },

  // ============================================================================
  // Navigation
  // ============================================================================
  nav: {
    next_label: "Continuar →",
    back_label: "← Anterior",
    submit_label: "Enviar para evaluación",
    submit_confirm_title: "¿Listo para enviar?",
    submit_confirm_body:
      "Una vez enviado, el judge evalúa tus decisiones y genera el reporte para tu manager. No podrás modificar respuestas después.",
    submit_confirm_yes: "Sí, enviar",
    submit_confirm_no: "Revisar otra vez",
    exit_confirm_title: "¿Salir sin enviar?",
    exit_confirm_body:
      "Tus respuestas se guardan automáticamente. Puedes retomar el caso cuando quieras desde el dashboard.",
    exit_confirm_yes: "Salir",
    exit_confirm_no: "Seguir aquí",
  },

  // ============================================================================
  // Autosave indicators (responden al patch debounced)
  // ============================================================================
  autosave: {
    saving: "Guardando…",
    saved: "Guardado",
    saved_at: (when: string) => `Guardado ${when}`,
    failed: "Error al guardar. Reintentando…",
    offline_warning:
      "Sin conexión. Tus respuestas se guardan localmente y se sincronizarán cuando vuelva.",
  },

  // ============================================================================
  // Step 1 — Datos (data_scope)
  // ============================================================================
  step1: {
    brief_eyebrow: "Brief de tu manager",
    dataset_eyebrow: "Dataset disponible",
    dataset_rows_label: (n: number) =>
      `${n} filas. Esto es lo que hay disponible.`,
    field_decision_eyebrow_template: (n: number, total: number) =>
      `Decisión ${n} de ${total}`,
    field_decision_question_template: (field_label: string) =>
      `¿Qué haces con "${field_label}" antes de pasarlo al modelo?`,
    field_options: ["Usar tal cual", "Transformar", "Descartar"],
    field_help:
      "Esto es decisión tuya. No hay opción \"correcta\" obvia — depende del caso, de la jurisdicción y del riesgo que decidas aceptar.",
  },

  // ============================================================================
  // Step 2 — IA (llm_beat)
  // ============================================================================
  step2: {
    prompt_eyebrow: "Tu prompt al modelo",
    prompt_placeholder:
      "Escribe el prompt que le mandarías al modelo. Considera contexto, restricciones y formato esperado.",
    prompt_send_label: "Enviar al modelo",
    prompt_min_chars_warning: (min: number) =>
      `Mínimo ${min} caracteres — el modelo necesita contexto para responder útil.`,
    thinking_label: "El modelo está procesando…",
    response_eyebrow: "Output del modelo",
    response_disclaimer:
      "El modelo puede generar errores, alucinaciones o sesgos. Lo que medimos es tu criterio al usar este output, no la veracidad del modelo.",
    followup_eyebrow: "Reflexión rápida",
    followup_question:
      "Mira el output. En menos de 80 palabras: ¿qué vas a usar, qué vas a descartar y qué necesitas validar?",
    followup_placeholder:
      "Por ejemplo: \"Voy a usar X porque… Descarto Y porque… Antes de mandar a mi manager valido Z con la fuente original.\"",
    followup_min_chars_warning: (min: number) =>
      `Mínimo ${min} caracteres — desarrolla tu razonamiento.`,
  },

  // ============================================================================
  // Step 3 — Revisión (artifact_review)
  // ============================================================================
  step3: {
    eyebrow: "Revisión crítica",
    instruction:
      "Lee el output del modelo segmento por segmento. Marca lo que no enviarías tal cual a tu manager y por qué.",
    segment_label_template: (n: number, total: number) =>
      `Ángulo ${n} de ${total}`,
    flag_question: "¿Qué problemas detectas en este segmento?",
    flag_help:
      "Puedes marcar cero, uno o varios problemas. No estamos buscando que marques todo — solo lo que de verdad detectas.",
    no_flags_acceptable:
      "Si el segmento te parece sólido y lo enviarías tal cual, déjalo sin marcar.",
  },

  // ============================================================================
  // Step 4 — Decisión (decision_select)
  // ============================================================================
  step4: {
    eyebrow: "Decisión final",
    instruction:
      "Tu manager te pide los ángulos por Slack. ¿Cómo se los entregas?",
    options_help:
      "Las cuatro opciones son razonables. La diferencia está en qué priorizas: velocidad, claridad, escalamiento o autonomía del manager.",
    rationale_label: "Razonamiento (opcional)",
    rationale_placeholder:
      "¿Por qué elegiste esa opción y no las otras tres?",
  },

  // ============================================================================
  // Step 5 — Respuesta (decision_open_short)
  // ============================================================================
  step5: {
    intro_eyebrow: "Mensaje de tu manager",
    intro_disclaimer:
      "Lee con atención. La pregunta del manager tiene una capa nueva — no es lo mismo que el brief inicial.",
    response_eyebrow: "Tu respuesta",
    response_placeholder:
      "Responde como lo harías por Slack. Profesional, conciso, claro en qué propones.",
    response_min_chars: (min: number) =>
      `Mínimo ${min} caracteres.`,
    response_max_chars: (max: number) => `Máximo ${max} caracteres.`,
  },

  // ============================================================================
  // Voice input (Whisper transcription)
  // ============================================================================
  voice: {
    button_label: "Dictar respuesta",
    recording_label: "Grabando…",
    transcribing_label: "Transcribiendo…",
    permission_denied:
      "Necesitamos permiso del micrófono. Habilita en la configuración del navegador.",
    transcription_failed:
      "No pudimos transcribir. Intenta de nuevo o escribe la respuesta.",
    privacy_note:
      "El audio se transcribe localmente cuando es posible. Si requiere modelo en la nube, se borra después de generar el texto.",
  },

  // ============================================================================
  // Error states
  // ============================================================================
  errors: {
    session_creation_failed:
      "No pudimos iniciar tu sesión. Reintenta o avisa a tu manager.",
    session_not_found:
      "Esta sesión no existe o no tienes permiso de acceder.",
    session_already_submitted:
      "Esta sesión ya fue enviada. Tu reporte está disponible en el dashboard.",
    judge_failed:
      "El judge LLM falló al evaluar. Staff Itera fue notificado y vamos a regenerar el reporte. Te avisamos por email cuando esté listo.",
    network_error:
      "Sin conexión. Tus respuestas se guardan localmente — reintenta cuando vuelva la conexión.",
    submit_failed:
      "No pudimos enviar la sesión. Tus respuestas siguen guardadas. Reintenta en unos segundos.",
  },

  // ============================================================================
  // Empty states inline
  // ============================================================================
  empty_states: {
    waiting_for_model_response:
      "El modelo no ha respondido aún. Espera unos segundos o reintenta el prompt.",
    no_segments_to_review:
      "No hay segmentos para revisar en este paso. Continúa al siguiente.",
  },

  // ============================================================================
  // Microcopy general
  // ============================================================================
  microcopy: {
    optional_label: "Opcional",
    required_label: "Requerido",
    character_count_template: (current: number, max: number) =>
      `${current} / ${max} caracteres`,
    time_estimate_template: (min: number) => `~${min} min`,
    no_data_yet: "Sin datos todavía.",
    confidential_note:
      "Tu sesión es individual y confidencial. El reporte va a tu manager autorizado.",
  },

  // ============================================================================
  // Post-submit confirmation
  // ============================================================================
  post_submit: {
    headline: "Listo. Tu sesión fue enviada.",
    body:
      "El judge está evaluando tus decisiones contra la rúbrica. En 15-30 segundos tendrás tu reporte ejecutivo. Tu manager también recibe una copia.",
    cta_view_report: "Ver mi reporte",
    cta_back_to_dashboard: "Volver al dashboard",
  },
} as const;

export type RuntimeCopy = typeof runtimeCopy;
