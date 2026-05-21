"use client";

/**
 * /team — dashboard del employee (catálogo de casos).
 *
 * Modelo de datos alineado a docs/simulador/case_factory/CASE_SCHEMA.yaml
 * y CASE_TAXONOMY.yaml. Mock data ahora respeta:
 *   - level (N1/N2/N3)
 *   - estimated_minutes
 *   - tags.departments / industries / role_families / seniority
 *   - tools.required
 *   - manager_outcome.primary_question (= pitch del caso)
 *   - freshness (evergreen / current / hybrid + last_verified_at)
 *
 * Filtros canónicos: Nivel · Departamento · Duración · Frescura.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Select, SelectItem } from "@heroui/react";

type Level = "N1" | "N2" | "N3";
type Department =
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
type Seniority = "junior" | "mid" | "senior" | "manager" | "director";
type Industry =
  | "saas_b2b"
  | "ecommerce"
  | "fintech"
  | "education"
  | "healthcare"
  | "retail"
  | "professional_services";
type Freshness = "evergreen" | "current" | "hybrid";
type DuracionBucket = "corto" | "medio" | "largo";
type SortKey = "recientes" | "abecedario";

interface CaseItem {
  slug: string;
  title: string;
  primaryQuestion: string;
  level: Level;
  department: Department;
  industry: Industry;
  seniority: Seniority;
  estimatedMinutes: number;
  freshnessType: Freshness;
  lastVerifiedAt?: string; // ISO date — solo cuando current/hybrid
  toolsRequired: string[];
}

// ============================================================================
// MOCK CATALOG — alineado a CASE_SCHEMA. Reemplazar por /api/cases en BD.
// ============================================================================

const CASES: CaseItem[] = [
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
  },
];

// ============================================================================
// LABEL maps
// ============================================================================

const LEVEL_OPTIONS: { value: Level; label: string }[] = [
  { value: "N1", label: "Fundamentos · Principiante" },
  { value: "N2", label: "Automatización · Intermedio" },
  { value: "N3", label: "Agentes · Avanzado" },
];

// Label corto para mostrar dentro de la card (sin la palabra del seniority,
// que ya se infiere y ocuparía espacio).
const LEVEL_CARD_LABEL: Record<Level, string> = {
  N1: "Fundamentos",
  N2: "Automatización",
  N3: "Agentes",
};

const DEPARTMENT_OPTIONS: { value: Department; label: string }[] = [
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

const DURACION_OPTIONS: {
  value: DuracionBucket;
  label: string;
  check: (m: number) => boolean;
}[] = [
  { value: "corto", label: "Menos de 15 min", check: (m) => m < 15 },
  { value: "medio", label: "15 a 30 min", check: (m) => m >= 15 && m <= 30 },
  { value: "largo", label: "Más de 30 min", check: (m) => m > 30 },
];

const FRESHNESS_OPTIONS: { value: Freshness; label: string }[] = [
  { value: "current", label: "Actualizado" },
  { value: "evergreen", label: "Clásico" },
  { value: "hybrid", label: "Híbrido" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recientes", label: "Más recientes" },
  { value: "abecedario", label: "Orden alfabético" },
];

// Construir TOOL_OPTIONS dinámicamente a partir de los tools únicos del
// catálogo. Cuando esté la BD, generar desde simulador.tools.
const TOOL_OPTIONS: { value: string; label: string }[] = Array.from(
  new Set(CASES.flatMap((c) => c.toolsRequired)),
)
  .sort()
  .map((t) => ({ value: t, label: t }));

// ============================================================================
// BRAND COLORS para tool chips — basado en los brand kits oficiales.
// Si una tool no está en este map, usa el default neutro.
// ============================================================================

type ToolBrand = { bg: string; text: string };

// Patrón: bg translúcido (alpha ~0.12-0.16) + text en color intenso.
// Mismo estilo que el chip "Fundamentos" del nivel — protagonismo al módulo,
// no al chip. Las brands "neutras" (negros/blancos) usan tokens del DS para
// auto-adaptarse a light/dark mode.
const TOOL_BRAND: Record<string, ToolBrand> = {
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

  // Brands "neutras" (negros/blancos) — usan tokens del DS para que se
  // vean bien en light y dark mode sin contraste roto.
  Cursor: { bg: "var(--surface-2)", text: "var(--text-primary)" },
  Notion: { bg: "var(--surface-2)", text: "var(--text-primary)" },
  "GitHub Copilot": { bg: "var(--surface-2)", text: "var(--text-primary)" },
};

const TOOL_DEFAULT: ToolBrand = {
  bg: "var(--surface-2)",
  text: "var(--text-secondary)",
};

const DEPARTMENT_LABEL: Record<Department, string> = Object.fromEntries(
  DEPARTMENT_OPTIONS.map((d) => [d.value, d.label]),
) as Record<Department, string>;
const SENIORITY_LABEL: Record<Seniority, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  manager: "Manager",
  director: "Director",
};
const INDUSTRY_LABEL: Record<Industry, string> = {
  saas_b2b: "SaaS B2B",
  ecommerce: "Ecommerce",
  fintech: "Fintech",
  education: "Educación",
  healthcare: "Salud",
  retail: "Retail",
  professional_services: "Servicios prof.",
};

// ============================================================================
// COMPONENT
// ============================================================================

function FilterSelect<T extends string>({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string;
  options: { value: T; label: string }[];
  value: T | "";
  onChange: (v: T | "") => void;
}) {
  return (
    <Select
      placeholder={placeholder}
      aria-label={placeholder}
      selectedKeys={value ? [value] : []}
      onSelectionChange={(keys) => {
        const next = Array.from(keys)[0] as T | undefined;
        onChange(next ?? "");
      }}
      isClearable={!!value}
      onClear={() => onChange("")}
      variant="bordered"
      radius="lg"
      size="lg"
      className={`min-w-[180px] flex-1 ${value ? "is-filter-active" : ""}`}
    >
      {options.map((opt) => (
        <SelectItem key={opt.value}>{opt.label}</SelectItem>
      ))}
    </Select>
  );
}

function FreshnessBadge({
  freshness,
  lastVerifiedAt,
}: {
  freshness: Freshness;
  lastVerifiedAt?: string;
}) {
  if (freshness === "evergreen") return null;
  const dateLabel = lastVerifiedAt
    ? new Date(lastVerifiedAt).toLocaleDateString("es-ES", {
        month: "short",
        year: "numeric",
      })
    : null;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
      {dateLabel ? `act. ${dateLabel}` : "actualizado"}
    </span>
  );
}

function CaseCard({ item }: { item: CaseItem }) {
  return (
    <Link
      href={`/case/${item.slug}`}
      className="group flex flex-col rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[0_4px_16px_var(--shadow)]"
    >
      {/* TOP: nivel chip + duración + frescura */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-[var(--accent-soft)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
            {LEVEL_CARD_LABEL[item.level]}
          </span>
          <span className="text-[11.5px] text-[var(--text-tertiary)]">
            {item.estimatedMinutes} min
          </span>
        </div>
        <FreshnessBadge
          freshness={item.freshnessType}
          lastVerifiedAt={item.lastVerifiedAt}
        />
      </div>

      {/* TITLE */}
      <h3 className="mt-4 text-[17px] font-semibold leading-[1.3] tracking-tight text-[var(--text-primary)]">
        {item.title}
      </h3>

      {/* MANAGER QUESTION = pitch */}
      <p className="mt-2 text-[13px] leading-[1.5] text-[var(--text-secondary)] line-clamp-3">
        {item.primaryQuestion}
      </p>

      {/* TOOLS — coloreados por brand */}
      <div className="mt-4 flex flex-wrap gap-1">
        {item.toolsRequired.slice(0, 3).map((tool) => {
          const brand = TOOL_BRAND[tool] ?? TOOL_DEFAULT;
          return (
            <span
              key={tool}
              className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: brand.bg, color: brand.text }}
            >
              {tool}
            </span>
          );
        })}
      </div>

      {/* FOOTER: depto · seniority · industria */}
      <div className="mt-5 flex items-center gap-1.5 text-[11.5px] text-[var(--text-tertiary)]">
        <span>{DEPARTMENT_LABEL[item.department]}</span>
        <span aria-hidden>·</span>
        <span>{SENIORITY_LABEL[item.seniority]}</span>
        <span aria-hidden>·</span>
        <span>{INDUSTRY_LABEL[item.industry]}</span>
      </div>
    </Link>
  );
}

export default function TeamPage() {
  const [level, setLevel] = useState<Level | "">("");
  const [department, setDepartment] = useState<Department | "">("");
  const [duracion, setDuracion] = useState<DuracionBucket | "">("");
  const [tool, setTool] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortKey>("recientes");

  const filteredSorted = useMemo(() => {
    const filtered = CASES.filter((c) => {
      if (level && c.level !== level) return false;
      if (department && c.department !== department) return false;
      if (tool && !c.toolsRequired.includes(tool)) return false;
      if (duracion) {
        const d = DURACION_OPTIONS.find((x) => x.value === duracion);
        if (d && !d.check(c.estimatedMinutes)) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "abecedario") {
        return a.title.localeCompare(b.title, "es");
      }
      // recientes: por lastVerifiedAt descendente. Si falta (evergreen),
      // empuja al final.
      const aDate = a.lastVerifiedAt ?? "0000-00-00";
      const bDate = b.lastVerifiedAt ?? "0000-00-00";
      return bDate.localeCompare(aDate);
    });
  }, [level, department, duracion, tool, sortBy]);

  const anyFilterActive =
    level !== "" || department !== "" || duracion !== "" || tool !== "";

  function clearAll() {
    setLevel("");
    setDepartment("");
    setDuracion("");
    setTool("");
  }

  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-8 py-12 sm:px-12 lg:px-16">
      <div className="mx-auto w-full max-w-[1280px]">
        {/* ============ HEADER ============ */}
        <header>
          <h1 className="display display-tight text-[var(--text-primary)] text-[32px] sm:text-[40px]">
            Catálogo de casos
          </h1>
          <p className="mt-3 text-[15px] text-[var(--text-secondary)] leading-[1.55] max-w-[640px]">
            Elige un caso para empezar tu diagnóstico. Cada caso mide tu
            criterio operativo bajo presión real con IA — no tu memoria.
          </p>
        </header>

        {/* ============ FILTROS canónicos ============ */}
        <section
          aria-label="Filtros"
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
        >
          <FilterSelect
            placeholder="Nivel"
            options={LEVEL_OPTIONS}
            value={level}
            onChange={setLevel}
          />
          <FilterSelect
            placeholder="Departamento"
            options={DEPARTMENT_OPTIONS}
            value={department}
            onChange={setDepartment}
          />
          <FilterSelect
            placeholder="Duración"
            options={DURACION_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
            value={duracion}
            onChange={setDuracion}
          />
          <FilterSelect
            placeholder="Herramientas"
            options={TOOL_OPTIONS}
            value={tool}
            onChange={setTool}
          />
        </section>

        {/* ============ RESULTS META + SORT ============ */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[13px] text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">
              {filteredSorted.length}
            </span>{" "}
            {filteredSorted.length === 1 ? "caso" : "casos"}
            {anyFilterActive && (
              <span className="text-[var(--text-tertiary)]">
                {" "}
                de {CASES.length}
              </span>
            )}
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[var(--text-tertiary)]">
                Ordenar
              </span>
              <Select
                aria-label="Ordenar"
                selectedKeys={[sortBy]}
                onSelectionChange={(keys) => {
                  const next = Array.from(keys)[0] as SortKey | undefined;
                  if (next) setSortBy(next);
                }}
                variant="bordered"
                radius="md"
                size="sm"
                className="w-[180px]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value}>{opt.label}</SelectItem>
                ))}
              </Select>
            </div>
            {anyFilterActive && (
              <button
                type="button"
                onClick={clearAll}
                className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* ============ GRID ============ */}
        {filteredSorted.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSorted.map((item) => (
              <CaseCard key={item.slug} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--hairline)] py-20 text-center">
            <div className="text-[15px] font-medium text-[var(--text-primary)]">
              No hay casos con esos filtros
            </div>
            <p className="mt-2 text-[13.5px] text-[var(--text-secondary)] max-w-[360px]">
              Prueba quitando alguno o limpia todos arriba.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
