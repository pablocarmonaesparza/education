export type CaseLevelId = "N1" | "N2" | "N3";

export const caseFactoryLevels = [
  {
    id: "N1" as const,
    name: "fundamentos / prompt engineering",
    goal: "usar IA bien en tareas individuales",
    managerQuestion: "puede usar IA sin crear riesgo basico?",
    targetCases: 15,
  },
  {
    id: "N2" as const,
    name: "workflow / automatiza tu trabajo",
    goal: "integrar IA en procesos reales con controles",
    managerQuestion: "puede mejorar un flujo sin romper handoffs?",
    targetCases: 20,
  },
  {
    id: "N3" as const,
    name: "agentes / produccion y optimizacion",
    goal: "delegar, supervisar y optimizar agentes",
    managerQuestion: "puede controlar autonomia, riesgo e impacto?",
    targetCases: 15,
  },
];

export const caseFactoryCriteria = [
  {
    id: "contexto",
    name: "contexto",
    managerSignal: "entiende objetivo, audiencia, restricciones y exito esperado",
  },
  {
    id: "datos",
    name: "datos",
    managerSignal: "protege informacion sensible y usa datos con calidad suficiente",
  },
  {
    id: "ejecucion_ia",
    name: "ejecucion con IA",
    managerSignal: "elige prompt, workflow o agente adecuado para el trabajo",
  },
  {
    id: "validacion",
    name: "validacion",
    managerSignal: "verifica output, fuentes, consistencia y errores",
  },
  {
    id: "juicio",
    name: "juicio",
    managerSignal: "detecta riesgos, limites, autoridad y escalamiento",
  },
  {
    id: "impacto",
    name: "impacto",
    managerSignal: "convierte IA en resultado util para negocio",
  },
];

export const caseFactoryTargetMix = {
  totalCases: 50,
  evergreenPercent: 30,
  currentPercent: 70,
  activeGoldenCases: 1,
  activeProfilePacks: 6,
  minimumDepartments: 6,
  minimumIndustries: 8,
  minimumTools: 20,
};

export const caseFactoryProfilePacks = [
  {
    id: "marketing_growth",
    name: "marketing / growth",
    buyer: "Head de Marketing o Growth",
    roles: ["growth manager", "marketing manager", "performance marketer", "content lead"],
    levels: ["N1", "N2", "N3"],
    managerQuestion: "puede usar IA para crear, validar y optimizar campañas sin danar marca, datos ni performance?",
    outcomes: ["calidad de campaña", "velocidad de prueba", "brand safety", "pipeline"],
    risks: ["privacidad", "alucinacion", "validacion debil", "IP/copyright"],
  },
  {
    id: "sales_revops",
    name: "sales / revops",
    buyer: "Head de Sales o Revenue",
    roles: ["sales ops manager", "SDR lead", "account executive", "revenue operations"],
    levels: ["N1", "N2", "N3"],
    managerQuestion: "puede mejorar pipeline, follow-up y CRM sin perder control comercial ni confianza del cliente?",
    outcomes: ["velocidad de pipeline", "calidad de follow-up", "higiene de CRM", "conversion"],
    risks: ["privacidad", "automatizacion sin revision", "agent overreach", "confianza del cliente"],
  },
  {
    id: "customer_success_support",
    name: "customer success / support",
    buyer: "Head de CS o Support",
    roles: ["CS manager", "implementation manager", "support lead", "customer ops"],
    levels: ["N1", "N2", "N3"],
    managerQuestion: "puede responder, escalar y resumir clientes sin inventar soluciones ni romper confianza?",
    outcomes: ["calidad de respuesta", "escalamiento", "time to resolution", "retencion"],
    risks: ["alucinacion", "validacion debil", "escalamiento perdido", "privacidad"],
  },
  {
    id: "operations_automation",
    name: "operations / automation",
    buyer: "COO u Operations Lead",
    roles: ["ops manager", "process owner", "automation specialist", "chief of staff"],
    levels: ["N1", "N2", "N3"],
    managerQuestion: "puede redisenar procesos con IA, automatizaciones y agentes sin romper handoffs ni controles?",
    outcomes: ["tiempo de ciclo", "calidad de handoff", "confiabilidad", "visibilidad operativa"],
    risks: ["automatizacion sin revision", "agent overreach", "costos fuera de control", "compliance"],
  },
  {
    id: "finance_fpa",
    name: "finance / FP&A",
    buyer: "Finance Lead o COO",
    roles: ["finance manager", "FP&A analyst", "controller", "revenue accounting"],
    levels: ["N1", "N2"],
    managerQuestion: "puede analizar, explicar y presentar numeros sin inventar datos ni debilitar controles?",
    outcomes: ["forecast", "explicacion de varianza", "board readiness", "controles"],
    risks: ["metricas inventadas", "validacion debil", "estrategia confidencial", "compliance"],
  },
  {
    id: "legal_compliance_privacy",
    name: "legal / compliance / privacy",
    buyer: "Legal, Compliance o Privacy Lead",
    roles: ["legal ops", "compliance manager", "privacy owner", "contract manager"],
    levels: ["N1", "N2"],
    managerQuestion: "puede revisar riesgos legales y de privacidad sin delegar autoridad ni exponer informacion sensible?",
    outcomes: ["triage de riesgo", "control de privacidad", "escalamiento", "velocidad de revision"],
    risks: ["privacidad", "estrategia confidencial", "compliance perdido", "agent overreach"],
  },
];

export const caseFactoryExerciseTypes = [
  { id: "data_table_triage", name: "tabla de datos editable", family: "data" },
  { id: "pivot_dashboard", name: "tabla dinamica / dashboard", family: "data" },
  { id: "workflow_builder", name: "workflow builder", family: "workflow" },
  { id: "automation_spec", name: "spec de automatizacion", family: "workflow" },
  { id: "agent_brief", name: "brief de agente", family: "agent" },
  { id: "permission_matrix", name: "matriz de permisos", family: "agent" },
  { id: "log_review", name: "revision de logs", family: "agent" },
  { id: "tradeoff_decision", name: "decision con tradeoff", family: "decision" },
  { id: "executive_response", name: "respuesta ejecutiva", family: "decision" },
  { id: "counterfactual_debrief", name: "counterfactual debrief", family: "decision" },
];

export const caseFactoryTimePressureModes = [
  {
    id: "no_timer",
    name: "sin timer",
    useWhen: "profundidad o criterio sin urgencia operacional",
  },
  {
    id: "soft_deadline",
    name: "deadline visible",
    useWhen: "ventana de entrega con overrun permitido",
  },
  {
    id: "fixed_timer",
    name: "timer fijo",
    useWhen: "decision laboral con presion real de tiempo",
  },
  {
    id: "step_timer",
    name: "timer por seccion",
    useWhen: "triage, revision y decision tienen ventanas distintas",
  },
];

export const caseFactoryTimeMetrics = [
  "total_elapsed_seconds",
  "step_elapsed_seconds",
  "time_to_first_action_seconds",
  "review_time_ratio",
  "overtime_seconds",
  "submit_after_warning",
];

export const caseFactoryGoldenCase = {
  id: "sales_agent_followup_pipeline",
  title: "agente de follow-up para pipeline comercial",
  level: "N3",
  departments: ["sales", "operations"],
  tools: ["ChatGPT", "Claude", "HubSpot", "Gmail", "Slack", "Zapier", "n8n"],
  exerciseTypes: [
    "tabla de datos editable",
    "brief de agente",
    "matriz de permisos",
    "revision de logs",
    "decision con tradeoff",
    "respuesta ejecutiva",
  ],
  managerQuestion:
    "Puede delegar follow-up comercial a un agente sin perder control, privacidad ni confianza del cliente?",
  timePressure: {
    mode: "fixed_timer",
    totalMinutes: 24,
    managerSignal: "decide con urgencia real sin saltarse privacidad, validacion ni approval gates",
  },
};

export const caseFactoryDepartments = [
  "marketing",
  "growth",
  "sales",
  "customer_success",
  "operations",
  "finance",
  "legal",
  "hr",
  "product",
  "leadership",
];

export const caseFactoryTools = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Perplexity",
  "Microsoft Copilot",
  "Google Workspace",
  "Notion",
  "Airtable",
  "Zapier",
  "Make",
  "n8n",
  "HubSpot",
  "Salesforce",
  "Slack",
  "Linear",
  "Figma",
  "Canva",
  "Metabase",
  "Looker Studio",
  "Agente generico",
];

export const caseFactoryArtifacts = [
  "CASE_HIG.md",
  "CASE_TAXONOMY.yaml",
  "CASE_SCHEMA.yaml",
  "CASE_RUBRIC_V1.md",
  "CASE_QUALITY_CHECKLIST.md",
  "TOOL_REGISTRY.yaml",
  "ROLE_INDUSTRY_TAGS.yaml",
  "MANAGER_RESULTS_MODEL.md",
  "BACKEND_REQUIREMENTS.md",
  "FACTORY_WORKFLOW.md",
];

export const caseFactoryQualityGates = [
  "schema completo",
  "pesos por criterio suman 100",
  "herramientas con refresh_due_at",
  "decision observable",
  "failure modes plausibles",
  "practice mapping",
  "resim variant",
  "judge prompt versionado",
  "manager outcome",
  "spoiler-free",
];

export const caseFactoryManagerSignals = [
  "readiness por nivel",
  "readiness por criterio",
  "riesgos recurrentes",
  "herramientas con mayor riesgo",
  "practice beats recomendados",
  "transfer delta",
  "velocidad con control",
  "accion manager: pilotar, entrenar, pausar o escalar",
];

export const caseFactoryResearchAnchors = [
  {
    source: "Stanford AI Index 2026",
    signal: "adopcion organizacional de IA reportada en 88%",
  },
  {
    source: "McKinsey State of AI 2025",
    signal: "uso regular crece, pero escalar agentes sigue siendo dificil",
  },
  {
    source: "WEF Future of Jobs 2025",
    signal: "AI/big data, pensamiento analitico y technological literacy suben",
  },
  {
    source: "PwC AI Jobs Barometer 2025",
    signal: "skills de IA muestran prima salarial promedio de 56%",
  },
  {
    source: "HBS/HKS/MIT",
    signal: "casos buenos empiezan con decision, ambiguedad, datos y aplicacion real",
  },
];
