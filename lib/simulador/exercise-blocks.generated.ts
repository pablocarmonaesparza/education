/* eslint-disable */
/**
 * AUTO-GENERATED — NO EDITAR A MANO.
 *
 * Fuente: docs/simulador/case_factory/EXERCISE_BLOCK_CATALOG.yaml v0.5.0
 * Generador: scripts/simulador/generate-exercise-blocks.mjs
 *
 * Para regenerar: `bun run simulador:gen-blocks`
 * Para validar sincronía con lab/runtime: `bun run simulador:check-blocks`
 *
 * Status del catálogo: canonical_after_exercise_lab_review
 * Total bloques: 16
 */

export type ExerciseBlockId = "reading_passive" | "reading_message" | "reading_data_table" | "reading_image" | "reading_kpi_cards" | "reading_timeline" | "reading_attachment" | "ai_textfield_free" | "ai_textfield_guided" | "data_action_table" | "ai_output_review" | "ai_comparison" | "workflow_builder" | "agent_brief_builder" | "dashboard_pivot" | "tradeoff_decision_memo";

export type ExerciseBlockFamily = "passive" | "ai_native" | "traditional_business_signal" | "traditional_closure";

export type ExerciseBlockDimension = "contexto" | "ejecucion_ia" | "impacto" | "datos" | "juicio" | "validacion";

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
    labRef: "01A",
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
    id: "ai_textfield_guided",
    labRef: "01B",
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
    ],
    personalizationKnobs: [
      "objetivos",
      "audiencias",
      "limites del caso",
      "modelo recomendado",
      "prioridades de inteligencia, seguridad y costo",
    ],
    emits: ["selected_objective", "selected_audience", "selected_limits", "selected_model", "generated_prompt"],
    uiPattern: "inputs y seleccion progresivos + respuestas vacias + textfield read-only generado",
    defaultEmptyFields: ["selected_objective", "selected_audience", "selected_limits", "selected_model", "generated_prompt"],
    scoringMethod: "deterministic_selection_plus_llm_judge",
    completion: "objetivo, audiencia, limites y modelo definidos; prompt generado",
  },
  {
    id: "data_action_table",
    labRef: "02",
    publicName: "Tabla con accion por fila",
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
      "El participante debe clasificar un set de items (campos, acciones, eventos) con accion discreta por item.",
      "Hay riesgo discriminable item por item: PII, autonomia, calidad.",
    ],
    avoidWhen: [
      "Solo hay 1-2 items; usa un toggle simple.",
      "Las decisiones requieren un slider continuo; usa model_tradeoff_sliders.",
    ],
    personalizationKnobs: [
      "action_kind (data, permission, flag)",
      "filas (items a clasificar)",
      "ejemplos por fila",
      "consecuencias por accion",
    ],
    emits: ["row_actions", "action_kind"],
    uiPattern: "tabla por item con dropdown de accion segun action_kind",
    defaultEmptyFields: ["row_actions"],
    scoringMethod: "depends_on_action_kind",
    completion: "cada item tiene accion elegida",
  },
  {
    id: "ai_output_review",
    labRef: "04",
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
    labRef: "05",
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
    labRef: "06",
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
    id: "agent_brief_builder",
    labRef: "07",
    publicName: "Brief para agente",
    family: "ai_native",
    levels: ["N3"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: ["ejecucion_ia", "juicio", "datos"],
    runtimeSections: ["IA", "Decision"],
    whenToUse: [
      "El participante debe delegar una tarea a un agente sin perder control.",
      "El caso necesita medir autonomia, permisos, acceso y condicion de paro.",
    ],
    avoidWhen: [
      "No hay agente o autonomia real.",
      "El brief queda demasiado especifico a un departamento.",
    ],
    personalizationKnobs: [
      "tarea",
      "acceso permitido",
      "accion maxima",
      "condicion de paro",
      "fallback",
      "logs o costo",
    ],
    emits: ["agent_task", "allowed_access", "max_action", "stop_condition", "fallback_policy"],
    uiPattern: "flujo progresivo con una decision visible a la vez + brief preview vacio",
    defaultEmptyFields: ["agent_task", "allowed_access", "max_action", "stop_condition"],
    scoringMethod: "deterministic_overrides_plus_llm_judge",
    completion: "tarea, acceso, accion maxima y condicion de paro definidos",
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
    labRef: "11",
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
  "reading_passive",
  "reading_message",
  "reading_data_table",
  "reading_image",
  "reading_kpi_cards",
  "reading_timeline",
  "reading_attachment",
  "ai_textfield_free",
  "ai_textfield_guided",
  "data_action_table",
  "ai_output_review",
  "ai_comparison",
  "workflow_builder",
  "agent_brief_builder",
  "dashboard_pivot",
  "tradeoff_decision_memo",
];

export const exerciseBlockById: Record<ExerciseBlockId, ExerciseBlock> =
  Object.fromEntries(exerciseBlocks.map((b) => [b.id, b])) as Record<
    ExerciseBlockId,
    ExerciseBlock
  >;

export const exerciseBlockStats = {
  total: 16,
  families: {
    "passive": 7,
    "ai_native": 7,
    "traditional_business_signal": 1,
    "traditional_closure": 1
  },
  catalogVersion: "0.5.0",
  catalogStatus: "canonical_after_exercise_lab_review",
} as const;
