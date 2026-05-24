/* eslint-disable */
/**
 * AUTO-GENERATED — NO EDITAR A MANO.
 *
 * Fuente: docs/simulador/case_factory/EXERCISE_BLOCK_CATALOG.yaml v0.2.0
 * Generador: scripts/simulador/generate-exercise-blocks.mjs
 *
 * Para regenerar: `bun run simulador:gen-blocks`
 * Para validar sincronía con lab/runtime: `bun run simulador:check-blocks`
 *
 * Status del catálogo: canonical_after_exercise_lab_review
 * Total bloques: 11
 */

export type ExerciseBlockId = "ai_textfield_free" | "ai_textfield_guided" | "data_table_triage" | "permission_matrix" | "ai_output_review" | "ai_comparison" | "workflow_builder" | "agent_brief_builder" | "run_log_review" | "dashboard_pivot" | "tradeoff_decision_memo";

export type ExerciseBlockFamily = "ai_native" | "traditional_plus_ai_context" | "traditional_business_signal" | "traditional_closure";

export type ExerciseBlockDimension = "contexto" | "ejecucion_ia" | "impacto" | "datos" | "juicio" | "validacion";

export type ExerciseBlockRuntimeSection = "IA" | "Respuesta" | "Contexto" | "Datos" | "Decision" | "Revision";

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
    id: "data_table_triage",
    labRef: "02",
    publicName: "Tabla editable de datos",
    family: "traditional_plus_ai_context",
    levels: ["N1", "N2"],
    profiles: [
      "marketing_growth",
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: ["datos", "juicio"],
    runtimeSections: ["Datos"],
    whenToUse: [
      "El participante debe decidir que datos entran al modelo.",
      "Hay riesgo de PII, datos sensibles, baja calidad o exceso de informacion.",
    ],
    avoidWhen: [
      "La decision de datos no afecta el resultado del caso.",
      "Estas tentado a usar sliders de sensibilidad; usa acciones discretas.",
    ],
    personalizationKnobs: [
      "filas de datos",
      "ejemplos",
      "acciones: usar, anonimizar, agregar, excluir",
      "consecuencias por campo",
    ],
    emits: ["field_actions", "minimization_decisions", "privacy_flags"],
    uiPattern: "tabla por campo con dropdown de accion y chevron con padding suficiente",
    defaultEmptyFields: [],
    scoringMethod: "deterministic_rules_plus_judge_notes",
    completion: "cada campo tiene accion elegida o confirmada",
  },
  {
    id: "permission_matrix",
    labRef: "03",
    publicName: "Matriz de permisos",
    family: "ai_native",
    levels: ["N2", "N3"],
    profiles: [
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: ["datos", "ejecucion_ia", "juicio"],
    runtimeSections: ["IA", "Decision"],
    whenToUse: [
      "Hay automatizacion o agente con acciones de distinto riesgo.",
      "El participante debe decidir permitir, revisar o bloquear.",
    ],
    avoidWhen: [
      "Todas las acciones tienen el mismo nivel de riesgo.",
      "Es una tarea N1 sin autonomia real.",
    ],
    personalizationKnobs: [
      "acciones",
      "niveles de permiso",
      "acciones high risk",
      "approval gates",
    ],
    emits: ["permission_plan", "blocked_actions", "review_gates"],
    uiPattern: "filas de acciones x permitir/revisar/bloquear",
    defaultEmptyFields: [],
    scoringMethod: "deterministic_overrides_for_high_risk_actions",
    completion: "todas las acciones tienen permiso declarado",
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
    id: "run_log_review",
    labRef: "08",
    publicName: "Revision de logs",
    family: "ai_native",
    levels: ["N2", "N3"],
    profiles: [
      "sales_revops",
      "customer_success_support",
      "operations_automation",
      "finance_fpa",
      "legal_compliance_privacy",
    ],
    primaryDimensions: ["validacion", "juicio"],
    runtimeSections: ["Revision"],
    whenToUse: [
      "El participante supervisa una corrida de automatizacion o agente.",
      "Quieres medir si detecta incidentes en evidencia operacional.",
    ],
    avoidWhen: [
      "Los logs son demasiado tecnicos para el perfil.",
      "No hay eventos normales que sirvan de contraste.",
    ],
    personalizationKnobs: [
      "timeline",
      "eventos normales",
      "eventos de riesgo",
      "severidad",
      "escalamiento",
    ],
    emits: ["flagged_log_events", "incident_type", "escalation_need"],
    uiPattern: "timeline de eventos con marcacion de incidentes",
    defaultEmptyFields: ["flagged_log_events"],
    scoringMethod: "risk_event_recall_precision",
    completion: "eventos relevantes marcados o descartados",
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
  "ai_textfield_free",
  "ai_textfield_guided",
  "data_table_triage",
  "permission_matrix",
  "ai_output_review",
  "ai_comparison",
  "workflow_builder",
  "agent_brief_builder",
  "run_log_review",
  "dashboard_pivot",
  "tradeoff_decision_memo",
];

export const exerciseBlockById: Record<ExerciseBlockId, ExerciseBlock> =
  Object.fromEntries(exerciseBlocks.map((b) => [b.id, b])) as Record<
    ExerciseBlockId,
    ExerciseBlock
  >;

export const exerciseBlockStats = {
  total: 11,
  families: {
    "ai_native": 8,
    "traditional_plus_ai_context": 1,
    "traditional_business_signal": 1,
    "traditional_closure": 1
  },
  catalogVersion: "0.2.0",
  catalogStatus: "canonical_after_exercise_lab_review",
} as const;
