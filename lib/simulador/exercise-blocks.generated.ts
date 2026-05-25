/* eslint-disable */
/**
 * AUTO-GENERATED — NO EDITAR A MANO.
 *
 * Fuente: docs/simulador/case_factory/EXERCISE_BLOCK_CATALOG.yaml v0.11.0
 * Generador: scripts/simulador/generate-exercise-blocks.mjs
 *
 * Para regenerar: `bun run simulador:gen-blocks`
 * Para validar sincronía con lab/runtime: `bun run simulador:check-blocks`
 *
 * Status del catálogo: canonical_after_exercise_lab_review
 * Total bloques: 18
 */

export type ExerciseBlockId = "case_cover" | "reading_passive" | "reading_message" | "reading_data_table" | "reading_image" | "reading_kpi_cards" | "reading_timeline" | "reading_attachment" | "ai_textfield_free" | "conversation_response" | "ai_textfield_guided" | "model_tradeoff_sliders" | "categorize_rows" | "ai_output_review" | "ai_comparison" | "workflow_builder" | "dashboard_pivot" | "tradeoff_decision_memo";

export type ExerciseBlockFamily = "passive" | "ai_native" | "traditional_business_signal" | "traditional_closure";

export type ExerciseBlockDimension = "contexto" | "ejecucion_ia" | "impacto" | "juicio" | "datos" | "validacion";

export type ExerciseBlockRuntimeSection = "Contexto" | "Datos" | "IA" | "Revision" | "Decision" | "Respuesta";

export type ExerciseBlockLevel = "N1" | "N2" | "N3";

export interface ExerciseBlock {
  id: ExerciseBlockId;
  labRef: string | null;
  publicName: string;
  family: ExerciseBlockFamily;
  levels: ExerciseBlockLevel[];
  profiles: string[];
  primaryDimensions: ExerciseBlockDimension[];
  runtimeSections: ExerciseBlockRuntimeSection[];
  whenToUse: string[];
  avoidWhen: string[];
  personalizationKnobs: string[];
  emits: string[];
  uiPattern: string;
  defaultEmptyFields: string[];
  scoringMethod: string;
  completion: string;
}

export const exerciseBlocks: ExerciseBlock[] = [
  {
    id: "case_cover",
    labRef: "00",
    publicName: "Portada del caso",
    family: "passive",
    levels: ["N1", "N2", "N3"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: [],
    runtimeSections: ["Contexto"],
    whenToUse: [
      "Inicio del caso · pantalla de bienvenida con titulo, contexto y boton Iniciar.",
      "Si el caso usa timer global, este se activa al click en Iniciar (no antes).",
    ],
    avoidWhen: [
      "El caso no necesita pantalla de inicio (caso muy corto, demo embebida).",
    ],
    personalizationKnobs: [
      "titulo del caso",
      "descripcion ampliada",
      "metadata (perfil, dificultad, tiempo estimado)",
      "timer (opcional, en segundos)",
      "label del boton Iniciar",
    ],
    emits: ["started_at", "timer_seconds"],
    uiPattern: "hero centrado con titulo grande + descripcion + meta + boton Iniciar prominente",
    defaultEmptyFields: ["started_at"],
    scoringMethod: "passive",
    completion: "auto al clickear Iniciar",
  },
  {
    id: "reading_passive",
    labRef: "00A",
    publicName: "Informativa basica",
    family: "passive",
    levels: ["N1", "N2", "N3"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: [],
    runtimeSections: ["Contexto", "Datos", "IA", "Revision", "Decision", "Respuesta"],
    whenToUse: [
      "Introducir el caso o una seccion sin interaccion.",
      "Recap rapido o instrucciones previas al ejercicio activo.",
      "Cerrar una seccion con un mensaje contextual.",
    ],
    avoidWhen: [
      "El caso necesita evidencia para evaluar; usa un bloque activo.",
      "El body es muy largo y no cabe en viewport sin scroll.",
    ],
    personalizationKnobs: [
      "titulo",
      "body markdown",
    ],
    emits: [],
    uiPattern: "titulo + body markdown + boton continuar; sin interaccion",
    defaultEmptyFields: [],
    scoringMethod: "passive",
    completion: "auto al clickear continuar",
  },
  {
    id: "reading_message",
    labRef: "00B",
    publicName: "Informativa mensaje",
    family: "passive",
    levels: ["N1", "N2", "N3"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: [],
    runtimeSections: ["Contexto", "Datos"],
    whenToUse: [
      "Mostrar email, chat o ticket que dispara el caso.",
      "Reproducir conversacion de Slack o mensaje del cliente.",
      "Citar comentario de stakeholder con avatar y timestamp.",
    ],
    avoidWhen: [
      "El mensaje requiere respuesta activa; usa un bloque interactivo.",
    ],
    personalizationKnobs: [
      "canal (email, chat, ticket)",
      "remitente (nombre, rol, avatar)",
      "destinatario",
      "timestamp",
      "subject (opcional)",
      "body markdown",
    ],
    emits: [],
    uiPattern: "titulo + body markdown + card de mensaje con avatar, from/to, timestamp, body",
    defaultEmptyFields: [],
    scoringMethod: "passive",
    completion: "auto al clickear continuar",
  },
  {
    id: "reading_data_table",
    labRef: "00C",
    publicName: "Informativa tabla",
    family: "passive",
    levels: ["N1", "N2", "N3"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: [],
    runtimeSections: ["Contexto", "Datos"],
    whenToUse: [
      "Mostrar filas de leads, tickets, transacciones o metricas tabulares.",
      "Dar contexto de datos antes de pedir triage o decision.",
    ],
    avoidWhen: [
      "Se necesita clasificar campos uno por uno; usa data_table_triage activo.",
      "La tabla tiene 30+ filas; usa dashboard o segmentar.",
    ],
    personalizationKnobs: [
      "columnas (key, label, width)",
      "filas (data)",
      "caption opcional",
    ],
    emits: [],
    uiPattern: "titulo + body markdown + tabla con header sticky y filas",
    defaultEmptyFields: [],
    scoringMethod: "passive",
    completion: "auto al clickear continuar",
  },
  {
    id: "reading_image",
    labRef: "00D",
    publicName: "Informativa imagen",
    family: "passive",
    levels: ["N1", "N2", "N3"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: [],
    runtimeSections: ["Contexto", "Datos", "Revision"],
    whenToUse: [
      "Mostrar screenshot de dashboard, grafica o UI.",
      "Captura de error o de un reporte estatico.",
    ],
    avoidWhen: [
      "La imagen es decorativa sin aportar contexto.",
      "El detalle es tan denso que necesita zoom interactivo.",
    ],
    personalizationKnobs: [
      "src (url)",
      "alt (accesibilidad)",
      "caption (opcional)",
    ],
    emits: [],
    uiPattern: "titulo + body markdown + imagen centrada con caption opcional",
    defaultEmptyFields: [],
    scoringMethod: "passive",
    completion: "auto al clickear continuar",
  },
  {
    id: "reading_kpi_cards",
    labRef: "00E",
    publicName: "Informativa KPIs",
    family: "passive",
    levels: ["N1", "N2", "N3"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: [],
    runtimeSections: ["Contexto", "Datos"],
    whenToUse: [
      "Situar contexto de negocio con 1-3 metricas grandes.",
      "Mostrar MRR, conversion, churn, NPS antes de pedir analisis.",
    ],
    avoidWhen: [
      "Hay 4+ metricas; usa tabla o dashboard.",
      "Las metricas requieren interpretacion activa; usa dashboard_pivot.",
    ],
    personalizationKnobs: [
      "kpis (value, label, delta opcional con direccion up/down/flat)",
    ],
    emits: [],
    uiPattern: "titulo + body markdown + 1-3 cards de KPI con numero grande, label, delta",
    defaultEmptyFields: [],
    scoringMethod: "passive",
    completion: "auto al clickear continuar",
  },
  {
    id: "reading_timeline",
    labRef: "00F",
    publicName: "Informativa cronologia",
    family: "passive",
    levels: ["N1", "N2", "N3"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: [],
    runtimeSections: ["Contexto"],
    whenToUse: [
      "Mostrar secuencia de eventos del caso en orden cronologico.",
      "Recap rapido de que paso antes de la decision actual.",
    ],
    avoidWhen: [
      "Solo hay 1-2 eventos; usa body markdown plano.",
      "El detalle de cada evento es muy largo; usa multiples slides.",
    ],
    personalizationKnobs: [
      "events (when, what, who opcional)",
    ],
    emits: [],
    uiPattern: "titulo + body markdown + linea vertical con dots y eventos cronologicos",
    defaultEmptyFields: [],
    scoringMethod: "passive",
    completion: "auto al clickear continuar",
  },
  {
    id: "reading_attachment",
    labRef: "00G",
    publicName: "Informativa adjunto",
    family: "passive",
    levels: ["N1", "N2", "N3"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: [],
    runtimeSections: ["Contexto", "Datos"],
    whenToUse: [
      "Adjuntar contrato, brief, presentacion o PDF al caso.",
      "Simular email con archivo adjunto que debe revisarse.",
    ],
    avoidWhen: [
      "El archivo debe abrirse y leerse completo; muestra contenido en otro bloque.",
    ],
    personalizationKnobs: [
      "attachments (name, size, type, description opcional)",
    ],
    emits: [],
    uiPattern: "titulo + body markdown + cards de archivo adjunto con icono, nombre, peso",
    defaultEmptyFields: [],
    scoringMethod: "passive",
    completion: "auto al clickear continuar",
  },
  {
    id: "ai_textfield_free",
    labRef: "01",
    publicName: "Textfield de IA libre",
    family: "ai_native",
    levels: ["N1", "N2"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: ["contexto", "ejecucion_ia", "impacto"],
    runtimeSections: ["IA", "Respuesta"],
    whenToUse: [
      "Medir como estructura una peticion sin ayudas.",
      "Evaluar claridad de objetivo, audiencia, tono, restricciones y output esperado.",
    ],
    avoidWhen: [
      "Necesitas medir decisiones granulares; usa ai_textfield_guided.",
      "La persona no tiene informacion suficiente del caso.",
    ],
    personalizationKnobs: [
      "modelo disponible",
      "placeholder",
      "adjuntos permitidos",
      "voz",
      "artefacto de entrada",
    ],
    emits: ["prompt_text", "instruction_quality", "constraint_coverage", "attachment_usage"],
    uiPattern: "textfield de IA amplio con selector de modelo, voz y adjuntos opcionales",
    defaultEmptyFields: ["prompt_text", "attachments", "voice_notes"],
    scoringMethod: "llm_judge_with_structured_rubric",
    completion: "prompt no vacio con objetivo y al menos una restriccion o criterio de validacion",
  },
  {
    id: "conversation_response",
    labRef: "02",
    publicName: "Siguiente turno con la IA",
    family: "ai_native",
    levels: ["N1", "N2", "N3"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: ["contexto", "ejecucion_ia", "juicio"],
    runtimeSections: ["IA"],
    whenToUse: [
      "Hay una conversacion previa entre el participante y un modelo de IA.",
      "Medir como itera con la IA (corregir, profundizar, reformular) a partir del contexto ya visible.",
    ],
    avoidWhen: [
      "No hay turnos previos relevantes; usa ai_textfield_free.",
      "El contexto es respuesta a un humano (cliente/manager); modela como reading_message + ai_textfield_free.",
    ],
    personalizationKnobs: [
      "thread (turnos user/assistant previos)",
      "modelo de la conversacion (BrandMark)",
      "modelo del siguiente turno (puede ser distinto al previo)",
      "placeholder del composer",
    ],
    emits: ["response_text", "model", "attachments"],
    uiPattern: "thread con burbujas user/assistant (avatar BrandMark del modelo) + composer al final",
    defaultEmptyFields: ["response_text", "attachments"],
    scoringMethod: "llm_judge_with_context_alignment",
    completion: "siguiente prompt no vacio con coherencia al thread",
  },
  {
    id: "ai_textfield_guided",
    labRef: "03",
    publicName: "Textfield de IA guiado",
    family: "ai_native",
    levels: ["N1", "N2"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: ["contexto", "datos", "ejecucion_ia", "juicio"],
    runtimeSections: ["Contexto", "Datos", "IA"],
    whenToUse: [
      "Medir decisiones discretas que construyen un prompt o encargo.",
      "Ensenar razonamiento sin permitir edicion libre del output final.",
    ],
    avoidWhen: [
      "Las opciones no tienen tradeoff real.",
      "El caso requiere creatividad abierta sin andamiaje.",
      "Quieres medir ponderacion entre prioridades; usa model_tradeoff_sliders.",
    ],
    personalizationKnobs: [
      "objetivos",
      "audiencias",
      "limites del caso",
      "modelo (manual o referencia desde model_tradeoff_sliders)",
    ],
    emits: ["selected_objective", "selected_audience", "selected_limits", "selected_model", "generated_prompt"],
    uiPattern: "inputs y seleccion progresivos + textfield read-only generado",
    defaultEmptyFields: ["selected_objective", "selected_audience", "selected_limits", "selected_model", "generated_prompt"],
    scoringMethod: "deterministic_selection_plus_llm_judge",
    completion: "objetivo, audiencia, limites y modelo definidos; prompt generado",
  },
  {
    id: "model_tradeoff_sliders",
    labRef: "04",
    publicName: "Sliders de tradeoff de modelo",
    family: "ai_native",
    levels: ["N1", "N2", "N3"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: ["juicio", "ejecucion_ia"],
    runtimeSections: ["IA"],
    whenToUse: [
      "Medir como el participante pondera autonomia, seguridad y costo para elegir modelo.",
      "Validar criterio de seleccion de modelo bajo restricciones reales.",
      "Anteceder ai_textfield_guided cuando el caso necesita justificar la eleccion.",
    ],
    avoidWhen: [
      "El caso fija el modelo por contrato; no hay decision real.",
      "La eleccion es binaria; usa un toggle simple.",
    ],
    personalizationKnobs: [
      "etiquetas y descripciones de cada slider",
      "modelos disponibles (catalogo restringido por caso)",
      "set de modelos recomendados por combinacion",
    ],
    emits: ["autonomy_priority", "security_priority", "cost_priority", "recommended_model_id"],
    uiPattern: "3 sliders 0-100 en pasos de 10 + modelo recomendado dinamico con BrandMark",
    defaultEmptyFields: ["autonomy_priority", "security_priority", "cost_priority", "recommended_model_id"],
    scoringMethod: "judge_with_priority_coherence_check",
    completion: "los 3 sliders movidos al menos una vez + modelo recomendado confirmado",
  },
  {
    id: "categorize_rows",
    labRef: "05",
    publicName: "Clasificar filas con acción",
    family: "ai_native",
    levels: ["N1", "N2", "N3"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: ["datos", "juicio", "validacion"],
    runtimeSections: ["Datos", "IA", "Decision", "Revision"],
    whenToUse: [
      "El participante debe clasificar un set de items (campos, acciones, eventos, riesgos) con una accion discreta por item.",
      "Hay riesgo o decision discriminable item por item.",
    ],
    avoidWhen: [
      "Solo hay 1-2 items; usa un toggle simple.",
      "La decision necesita un slider continuo; usa model_tradeoff_sliders.",
    ],
    personalizationKnobs: [
      "filas (items a clasificar)",
      "acciones disponibles (set de strings)",
      "actionStyle (neutral, permission, severity) para color de chips",
      "ejemplos y hints por fila",
    ],
    emits: ["row_actions"],
    uiPattern: "tabla por item con chips inline de accion (sin dropdown)",
    defaultEmptyFields: ["row_actions"],
    scoringMethod: "depends_on_case_rubric",
    completion: "cada item tiene accion elegida",
  },
  {
    id: "ai_output_review",
    labRef: "06",
    publicName: "Revision de output de IA",
    family: "ai_native",
    levels: ["N1", "N2", "N3"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: ["validacion", "juicio"],
    runtimeSections: ["Revision"],
    whenToUse: [
      "La IA produjo algo plausible pero imperfecto.",
      "El participante debe detectar errores antes de usar o enviar.",
    ],
    avoidWhen: [
      "El output es caricaturescamente malo.",
      "No hay riesgos o claims verificables.",
    ],
    personalizationKnobs: [
      "segmentos marcables",
      "severidad",
      "correccion esperada",
      "follow-up con IA",
    ],
    emits: ["flagged_segments", "missed_risks", "correction_request"],
    uiPattern: "segmentos seleccionables + follow-up opcional",
    defaultEmptyFields: ["flagged_segments", "correction_request"],
    scoringMethod: "risk_event_recall_precision",
    completion: "al menos una decision de aceptar, marcar o corregir",
  },
  {
    id: "ai_comparison",
    labRef: "07",
    publicName: "Comparacion de respuestas",
    family: "ai_native",
    levels: ["N1", "N2"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: ["validacion", "impacto"],
    runtimeSections: ["Revision", "Decision"],
    whenToUse: [
      "Hay dos o tres outputs plausibles con tradeoffs reales.",
      "Quieres medir criterio de calidad, no gusto estetico.",
    ],
    avoidWhen: [
      "Una opcion es obviamente correcta o absurda.",
      "El participante no puede explicar por que eligio.",
    ],
    personalizationKnobs: [
      "numero de outputs",
      "criterios visibles",
      "tradeoffs",
      "justificacion corta",
    ],
    emits: ["chosen_output", "justification", "quality_tradeoff"],
    uiPattern: "dos o tres respuestas comparables + justificacion",
    defaultEmptyFields: ["chosen_output", "justification"],
    scoringMethod: "llm_judge_with_expected_signals",
    completion: "respuesta elegida y razon breve",
  },
  {
    id: "workflow_builder",
    labRef: "08",
    publicName: "Workflow builder",
    family: "ai_native",
    levels: ["N2"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
    ],
    primaryDimensions: ["ejecucion_ia", "validacion", "impacto"],
    runtimeSections: ["IA", "Revision"],
    whenToUse: [
      "El caso mide handoffs, checkpoints y responsabilidad dentro de un flujo.",
      "La IA participa en un proceso, no en una tarea aislada.",
    ],
    avoidWhen: [
      "El flujo se reduce a escribir un prompt.",
      "No hay revision humana o entrega definida.",
    ],
    personalizationKnobs: [
      "pasos",
      "orden",
      "herramientas",
      "checkpoints",
      "salida del flujo",
    ],
    emits: ["workflow_steps", "checkpoints", "handoff_plan"],
    uiPattern: "pasos activables, ordenables o conectados",
    defaultEmptyFields: [],
    scoringMethod: "workflow_integrity_rules",
    completion: "flujo tiene entrada, uso de IA, revision y salida",
  },
  {
    id: "dashboard_pivot",
    labRef: "09",
    publicName: "Dashboard / pivot",
    family: "traditional_business_signal",
    levels: ["N2", "N3"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
    ],
    primaryDimensions: ["impacto", "contexto"],
    runtimeSections: ["Decision", "Respuesta"],
    whenToUse: [
      "El participante debe leer una senal de negocio y decidir que llevar al lider.",
      "Hay metricas con caveats, filtros o segmentacion.",
    ],
    avoidWhen: [
      "El dashboard no fuerza una decision.",
      "Las metricas son decorativas o irrelevantes.",
    ],
    personalizationKnobs: [
      "metricas",
      "tablas",
      "filtros",
      "cohortes",
      "comparativos",
      "caveats",
    ],
    emits: ["selected_signal", "leader_takeaway", "metric_caveats"],
    uiPattern: "tabla o dashboard filtrable con senal para lider",
    defaultEmptyFields: ["selected_signal", "leader_takeaway"],
    scoringMethod: "manager_signal_alignment",
    completion: "senal elegida y takeaway declarado",
  },
  {
    id: "tradeoff_decision_memo",
    labRef: "10",
    publicName: "Decision con ventajas y costos + memo",
    family: "traditional_closure",
    levels: ["N1", "N2", "N3"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: ["juicio", "impacto", "contexto"],
    runtimeSections: ["Decision", "Respuesta"],
    whenToUse: [
      "Cerrar el caso con una recomendacion responsable.",
      "Medir si la persona entiende consecuencias, riesgos aceptados y siguiente paso.",
    ],
    avoidWhen: [
      "Solo quieres medir redaccion.",
      "Las opciones de decision no tienen costos reales.",
    ],
    personalizationKnobs: [
      "opciones de decision",
      "consecuencias",
      "longitud del memo",
      "audiencia del memo",
    ],
    emits: ["decision_choice", "rationale_text", "leader_action_signal"],
    uiPattern: "opciones con consecuencias + memo corto",
    defaultEmptyFields: ["decision_choice", "rationale_text"],
    scoringMethod: "llm_judge_with_override_matrix",
    completion: "opcion elegida y memo no vacio",
  },
];

export const exerciseBlockIds: ExerciseBlockId[] = [
  "case_cover",
  "reading_passive",
  "reading_message",
  "reading_data_table",
  "reading_image",
  "reading_kpi_cards",
  "reading_timeline",
  "reading_attachment",
  "ai_textfield_free",
  "conversation_response",
  "ai_textfield_guided",
  "model_tradeoff_sliders",
  "categorize_rows",
  "ai_output_review",
  "ai_comparison",
  "workflow_builder",
  "dashboard_pivot",
  "tradeoff_decision_memo",
];

export const exerciseBlockById: Record<ExerciseBlockId, ExerciseBlock> =
  Object.fromEntries(exerciseBlocks.map((b) => [b.id, b])) as Record<
    ExerciseBlockId,
    ExerciseBlock
  >;

export const exerciseBlockStats = {
  total: 18,
  families: {
    "passive": 8,
    "ai_native": 8,
    "traditional_business_signal": 1,
    "traditional_closure": 1
  },
  catalogVersion: "0.11.0",
  catalogStatus: "canonical_after_exercise_lab_review",
} as const;
