/**
 * lib/simulador/cases.ts
 *
 * Single source of truth para tipos, mock data, labels y brand colors del
 * catálogo de casos.
 *
 * Modelo alineado a docs/simulador/case_factory/CASE_SCHEMA.yaml +
 * CASE_TAXONOMY.yaml. Cuando se cablee BD, reemplazar CASES por fetch a
 * /api/cases (simulador.case_templates) y TOOL_OPTIONS por simulador.tools.
 */

// ============================================================================
// Types
// ============================================================================

export type Level = "N1" | "N2" | "N3";
export type Department =
  | "marketing"
  | "growth"
  | "sales"
  | "customer_success"
  | "operations"
  | "finance"
  | "hr"
  | "legal"
  | "product"
  | "engineering_light"
  | "leadership";
export type Seniority =
  | "junior"
  | "mid"
  | "senior"
  | "manager"
  | "director";
export type Industry =
  | "saas_b2b"
  | "ecommerce"
  | "fintech"
  | "education"
  | "healthcare"
  | "retail"
  | "professional_services";
export type Freshness = "evergreen" | "current" | "hybrid";
export type DuracionBucket = "corto" | "medio" | "largo";
export type SortKey = "recientes" | "abecedario";
export type UserCaseStatus = "available" | "in_progress" | "completed";
export type Band = "A" | "M" | "B";

export interface CaseItem {
  slug: string;
  title: string;
  primaryQuestion: string;
  level: Level;
  department: Department;
  industry: Industry;
  seniority: Seniority;
  estimatedMinutes: number;
  freshnessType: Freshness;
  lastVerifiedAt?: string;
  toolsRequired: string[];
  userStatus: UserCaseStatus;
  userCompletedAt?: string;
  userBand?: Band;
}

// ============================================================================
// MOCK CATALOG
// ============================================================================

export const CASES: CaseItem[] = [
  {
    slug: "sales_agent_followup_pipeline_v1",
    title: "Agente de follow-up para oportunidades calientes",
    primaryQuestion:
      "¿Puede delegar follow-up sin perder control comercial ni privacidad?",
    level: "N3",
    department: "sales",
    industry: "saas_b2b",
    seniority: "manager",
    estimatedMinutes: 24,
    freshnessType: "current",
    lastVerifiedAt: "2026-05-20",
    toolsRequired: ["ChatGPT", "HubSpot", "Gmail"],
    userStatus: "available",
  },
  {
    slug: "marketing_urgent_campaign_pii",
    title: "Campaña urgente con datos sensibles",
    primaryQuestion:
      "¿Sabe encuadrar urgencia comercial protegiendo privacidad de clientes?",
    level: "N1",
    department: "marketing",
    industry: "saas_b2b",
    seniority: "mid",
    estimatedMinutes: 18,
    freshnessType: "evergreen",
    toolsRequired: ["ChatGPT"],
    userStatus: "completed",
    userCompletedAt: "2026-04-28",
    userBand: "A",
  },
  {
    slug: "ops_invoice_reconciliation",
    title: "Conciliación de facturas con IA",
    primaryQuestion:
      "¿Puede automatizar el match contra ERP sin perder control de cierre de mes?",
    level: "N2",
    department: "operations",
    industry: "professional_services",
    seniority: "mid",
    estimatedMinutes: 22,
    freshnessType: "hybrid",
    lastVerifiedAt: "2026-04-10",
    toolsRequired: ["Claude", "Excel"],
    userStatus: "completed",
    userCompletedAt: "2026-05-03",
    userBand: "M",
  },
  {
    slug: "cs_churn_signal_review",
    title: "Detección de churn con health score",
    primaryQuestion:
      "¿Identifica cuentas críticas sin sobre-confiar en el score del modelo?",
    level: "N2",
    department: "customer_success",
    industry: "saas_b2b",
    seniority: "senior",
    estimatedMinutes: 25,
    freshnessType: "current",
    lastVerifiedAt: "2026-05-12",
    toolsRequired: ["ChatGPT", "Salesforce", "Looker"],
    userStatus: "in_progress",
  },
  {
    slug: "growth_attribution_anomaly",
    title: "Anomalía en atribución de ads",
    primaryQuestion:
      "¿Distingue un dato roto de una señal real antes de decidir budget?",
    level: "N2",
    department: "growth",
    industry: "ecommerce",
    seniority: "mid",
    estimatedMinutes: 20,
    freshnessType: "current",
    lastVerifiedAt: "2026-05-05",
    toolsRequired: ["ChatGPT", "Google Analytics", "Meta Ads"],
    userStatus: "available",
  },
  {
    slug: "hr_candidate_screening_with_ai",
    title: "Screening de candidatos asistido por IA",
    primaryQuestion:
      "¿Reduce sesgos sin perder de vista señales humanas claves?",
    level: "N1",
    department: "hr",
    industry: "professional_services",
    seniority: "mid",
    estimatedMinutes: 15,
    freshnessType: "evergreen",
    toolsRequired: ["ChatGPT"],
    userStatus: "completed",
    userCompletedAt: "2026-04-15",
    userBand: "B",
  },
  {
    slug: "finance_board_memo_under_deadline",
    title: "Memo al board en 1 hora",
    primaryQuestion:
      "¿Convierte data financiera en narrativa C-level sin pretextos ni adornos?",
    level: "N1",
    department: "finance",
    industry: "fintech",
    seniority: "senior",
    estimatedMinutes: 18,
    freshnessType: "evergreen",
    toolsRequired: ["Claude"],
    userStatus: "available",
  },
  {
    slug: "legal_contract_redline_assist",
    title: "Redline de contrato MSA con IA",
    primaryQuestion:
      "¿Identifica cláusulas de riesgo y cuándo escalar al abogado externo?",
    level: "N2",
    department: "legal",
    industry: "saas_b2b",
    seniority: "manager",
    estimatedMinutes: 28,
    freshnessType: "current",
    lastVerifiedAt: "2026-05-15",
    toolsRequired: ["ChatGPT", "Notion"],
    userStatus: "in_progress",
  },
  {
    slug: "product_pricing_test_call",
    title: "Llamada de pricing test al PM",
    primaryQuestion:
      "¿Recomienda subida de precios con datos suficientes o solo intuición?",
    level: "N2",
    department: "product",
    industry: "saas_b2b",
    seniority: "manager",
    estimatedMinutes: 22,
    freshnessType: "hybrid",
    lastVerifiedAt: "2026-04-22",
    toolsRequired: ["ChatGPT", "Mixpanel"],
    userStatus: "available",
  },
  {
    slug: "marketing_competitor_response_agent",
    title: "Agente de respuesta a competencia",
    primaryQuestion:
      "¿Diseña respuesta táctica con autonomía limitada y monitoreo claro?",
    level: "N3",
    department: "marketing",
    industry: "saas_b2b",
    seniority: "director",
    estimatedMinutes: 32,
    freshnessType: "current",
    lastVerifiedAt: "2026-05-18",
    toolsRequired: ["Claude", "Zapier", "Slack"],
    userStatus: "available",
  },
  {
    slug: "leadership_layoff_communication",
    title: "Comunicación de layoffs con asistencia IA",
    primaryQuestion:
      "¿Mantiene empatía + claridad sin que la IA suene corporativa fría?",
    level: "N1",
    department: "leadership",
    industry: "saas_b2b",
    seniority: "director",
    estimatedMinutes: 14,
    freshnessType: "evergreen",
    toolsRequired: ["Claude"],
    userStatus: "completed",
    userCompletedAt: "2026-05-08",
    userBand: "A",
  },
  {
    slug: "engineering_pr_review_under_pressure",
    title: "Code review de PR grande bajo deadline",
    primaryQuestion:
      "¿Valida outputs de IA cuando el deploy es en 2 horas y el PR tiene 800 líneas?",
    level: "N3",
    department: "engineering_light",
    industry: "saas_b2b",
    seniority: "senior",
    estimatedMinutes: 30,
    freshnessType: "current",
    lastVerifiedAt: "2026-05-10",
    toolsRequired: ["Cursor", "GitHub Copilot"],
    userStatus: "available",
  },
];

// ============================================================================
// LABELS y OPTIONS
// ============================================================================

export const LEVEL_OPTIONS: { value: Level; label: string }[] = [
  { value: "N1", label: "Fundamentos · Principiante" },
  { value: "N2", label: "Automatización · Intermedio" },
  { value: "N3", label: "Agentes · Avanzado" },
];

export const LEVEL_CARD_LABEL: Record<Level, string> = {
  N1: "Fundamentos",
  N2: "Automatización",
  N3: "Agentes",
};

export const DEPARTMENT_OPTIONS: { value: Department; label: string }[] = [
  { value: "marketing", label: "Marketing" },
  { value: "growth", label: "Growth" },
  { value: "sales", label: "Ventas" },
  { value: "customer_success", label: "Customer Success" },
  { value: "operations", label: "Operaciones" },
  { value: "finance", label: "Finanzas" },
  { value: "hr", label: "HR" },
  { value: "legal", label: "Legal" },
  { value: "product", label: "Producto" },
  { value: "engineering_light", label: "Ingeniería" },
  { value: "leadership", label: "Liderazgo" },
];

export const DURACION_OPTIONS: {
  value: DuracionBucket;
  label: string;
  check: (m: number) => boolean;
}[] = [
  { value: "corto", label: "Menos de 15 min", check: (m) => m < 15 },
  {
    value: "medio",
    label: "15 a 30 min",
    check: (m) => m >= 15 && m <= 30,
  },
  { value: "largo", label: "Más de 30 min", check: (m) => m > 30 },
];

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recientes", label: "Más recientes" },
  { value: "abecedario", label: "Orden alfabético" },
];

export const TOOL_OPTIONS: { value: string; label: string }[] = Array.from(
  new Set(CASES.flatMap((c) => c.toolsRequired)),
)
  .sort()
  .map((t) => ({ value: t, label: t }));

export const DEPARTMENT_LABEL: Record<Department, string> = Object.fromEntries(
  DEPARTMENT_OPTIONS.map((d) => [d.value, d.label]),
) as Record<Department, string>;

export const SENIORITY_LABEL: Record<Seniority, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  manager: "Manager",
  director: "Director",
};

export const INDUSTRY_LABEL: Record<Industry, string> = {
  saas_b2b: "SaaS B2B",
  ecommerce: "Ecommerce",
  fintech: "Fintech",
  education: "Educación",
  healthcare: "Salud",
  retail: "Retail",
  professional_services: "Servicios prof.",
};

export const BAND_LABEL: Record<Band, string> = {
  A: "Alta",
  M: "Media",
  B: "Baja",
};

// ============================================================================
// BRAND COLORS
// ============================================================================

export type ToolBrand = { bg: string; text: string };

export const TOOL_BRAND: Record<string, ToolBrand> = {
  // LLM chats
  ChatGPT: { bg: "rgba(16, 163, 127, 0.12)", text: "#10a37f" },
  Claude: { bg: "rgba(217, 119, 87, 0.14)", text: "#d97757" },
  Gemini: { bg: "rgba(66, 133, 244, 0.12)", text: "#4285f4" },

  // CRM / sales
  HubSpot: { bg: "rgba(255, 122, 89, 0.14)", text: "#ff7a59" },
  Salesforce: { bg: "rgba(0, 161, 224, 0.12)", text: "#00a1e0" },

  // Marketing / analytics
  "Meta Ads": { bg: "rgba(24, 119, 242, 0.12)", text: "#1877f2" },
  "Google Analytics": { bg: "rgba(227, 116, 0, 0.14)", text: "#e37400" },
  Looker: { bg: "rgba(66, 133, 244, 0.12)", text: "#4285f4" },
  Mixpanel: { bg: "rgba(120, 86, 255, 0.14)", text: "#7856ff" },

  // Workspace
  Gmail: { bg: "rgba(234, 67, 53, 0.12)", text: "#ea4335" },
  Slack: { bg: "rgba(74, 21, 75, 0.18)", text: "#4a154b" },
  Excel: { bg: "rgba(33, 115, 70, 0.14)", text: "#217346" },

  // Automation
  Zapier: { bg: "rgba(255, 74, 0, 0.14)", text: "#ff4a00" },
  Make: { bg: "rgba(109, 58, 255, 0.14)", text: "#6d3aff" },
  n8n: { bg: "rgba(234, 75, 113, 0.14)", text: "#ea4b71" },

  // Brands "neutras" — usan tokens del DS para light/dark mode automático
  Cursor: { bg: "var(--surface-2)", text: "var(--text-primary)" },
  Notion: { bg: "var(--surface-2)", text: "var(--text-primary)" },
  "GitHub Copilot": { bg: "var(--surface-2)", text: "var(--text-primary)" },
};

export const TOOL_DEFAULT: ToolBrand = {
  bg: "var(--surface-2)",
  text: "var(--text-secondary)",
};
