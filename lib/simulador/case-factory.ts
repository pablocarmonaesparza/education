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
  minimumDepartments: 8,
  minimumIndustries: 8,
  minimumTools: 20,
};

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
};

export const caseFactoryDepartments = [
  "marketing",
  "growth",
  "sales",
  "customer_success",
  "operations",
  "finance",
  "hr",
  "legal",
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
