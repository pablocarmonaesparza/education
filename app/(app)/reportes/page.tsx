"use client";

/**
 * /reportes — vista profunda del desempeño del employee.
 *
 * Diseño glance-first + desglose denso. Refleja el modelo de
 * MANAGER_RESULTS_MODEL.md + CASE_RUBRIC_V1.md adaptado a empleado:
 *
 *   1. GLANCE      — banda global + score 0-10 + delta + distribución + última actividad
 *   2. RECOMENDACIÓN — banner ancho con razón + practice beat + tools con riesgo
 *   3. DESGLOSE     — 6 cards (uno por criterio) con score 0-10 + delta +
 *                     sparkline + sub-criterios + mejor/peor caso
 *   4. RISK EVENTS  — tipos disparados, frecuencia, severity
 *   5. TOOLS USADAS — performance promedio por tool
 *   6. CASOS DONE   — grid de CaseCards con su score y banda individual
 *   7. NEXT STEP    — 1-2 casos recomendados al final
 *
 * Escala: 0-10 (decisión Pablo 2026-05-23). Mostrado como `7.1/10` 1 decimal.
 *
 * Cuando se cablee BD: derivar TODA esta data de
 *   SELECT * FROM simulador.reports r
 *   JOIN simulador.sessions s ON r.session_id = s.id
 *   WHERE s.user_id = $1
 */

import Link from "next/link";
import { CaseCard } from "@/components/simulador/CaseCard";
import {
  BAND_LABEL,
  CASES,
  type Band,
  type CaseItem,
} from "@/lib/simulador/cases";

// ============================================================================
// MOCK DATA — refleja el output del judge LLM por user (escala 0-10).
// ============================================================================

interface SubCriterion {
  id: string;
  label: string;
  score: number; // 0-10 (1 decimal)
}

interface DimensionReport {
  id: string;
  label: string;
  description: string;
  score: number;          // 0-10 (1 decimal)
  band: Band;
  delta: number;          // diff vs hace 30 días, en escala 0-10 (ej +0.3)
  trend: number[];        // último N scores en escala 0-10 (para sparkline)
  subCriteria: SubCriterion[];
  bestCaseSlug?: string;  // slug del mejor caso en esta dimensión
  worstCaseSlug?: string; // slug del peor caso en esta dimensión
}

const DIMENSIONS_REPORT: DimensionReport[] = [
  {
    id: "contexto",
    label: "Contexto",
    description: "Capacidad de leer el problema antes de actuar",
    score: 8.2,
    band: "M",
    delta: +0.3,
    trend: [7.5, 7.9, 8.0, 8.2],
    subCriteria: [
      { id: "stakeholders", label: "Identifica stakeholders relevantes", score: 8.8 },
      { id: "restricciones", label: "Mapea restricciones del negocio",   score: 7.9 },
      { id: "supuestos",     label: "Captura supuestos críticos",         score: 7.9 },
    ],
    bestCaseSlug: "leadership_layoff_communication",
    worstCaseSlug: "ops_invoice_reconciliation",
  },
  {
    id: "datos",
    label: "Datos",
    description: "Calidad de la información que alimenta tu decisión",
    score: 6.5,
    band: "M",
    delta: -0.2,
    trend: [7.0, 6.8, 6.6, 6.5],
    subCriteria: [
      { id: "frescura", label: "Verifica frescura de fuentes",  score: 7.2 },
      { id: "sesgo",    label: "Identifica sesgo en la muestra", score: 5.8 },
      { id: "faltante", label: "Reconoce data faltante",         score: 6.4 },
    ],
    bestCaseSlug: "ops_invoice_reconciliation",
    worstCaseSlug: "hr_candidate_screening_with_ai",
  },
  {
    id: "ejecucion_ia",
    label: "Ejecución IA",
    description: "Qué tan bien operas las herramientas de IA",
    score: 7.1,
    band: "M",
    delta: +0.4,
    trend: [6.5, 6.8, 6.9, 7.1],
    subCriteria: [
      { id: "prompt",    label: "Promptea con claridad y restricciones", score: 7.6 },
      { id: "iteracion", label: "Itera sobre el output cuando hace falta", score: 6.8 },
      { id: "tooling",   label: "Combina tools de forma eficiente",      score: 6.9 },
    ],
    bestCaseSlug: "marketing_urgent_campaign_pii",
    worstCaseSlug: "hr_candidate_screening_with_ai",
  },
  {
    id: "validacion",
    label: "Validación",
    description: "Verificas antes de actuar — tu mayor área de mejora",
    score: 5.8,
    band: "B",
    delta: -0.5,
    trend: [6.4, 6.2, 6.0, 5.8],
    subCriteria: [
      { id: "crosscheck",    label: "Cross-check con segunda fuente",      score: 6.2 },
      { id: "alucinaciones", label: "Detecta números/citas alucinadas",    score: 5.1 },
      { id: "publicar",      label: "Valida outputs antes de publicarlos", score: 6.1 },
    ],
    bestCaseSlug: "leadership_layoff_communication",
    worstCaseSlug: "marketing_urgent_campaign_pii",
  },
  {
    id: "juicio",
    label: "Juicio",
    description: "Decides bajo presión y trade-offs imperfectos",
    score: 7.9,
    band: "M",
    delta: +0.1,
    trend: [7.7, 7.8, 7.8, 7.9],
    subCriteria: [
      { id: "duda",       label: "Cuestiona el output cuando hay duda",  score: 8.2 },
      { id: "etica",      label: "Aplica criterio ético / privacy",      score: 7.4 },
      { id: "tradeoffs",  label: "Sopesa trade-offs explícitamente",     score: 8.1 },
    ],
    bestCaseSlug: "leadership_layoff_communication",
    worstCaseSlug: "hr_candidate_screening_with_ai",
  },
  {
    id: "impacto",
    label: "Impacto",
    description: "Conviertes el output en acción para el negocio",
    score: 6.8,
    band: "M",
    delta: +0.2,
    trend: [6.5, 6.6, 6.7, 6.8],
    subCriteria: [
      { id: "metrica",   label: "Conecta el output a métrica de negocio", score: 7.0 },
      { id: "comunica",  label: "Comunica resultado a stakeholders",      score: 6.5 },
      { id: "nextstep",  label: "Define next-step accionable",            score: 6.9 },
    ],
    bestCaseSlug: "ops_invoice_reconciliation",
    worstCaseSlug: "hr_candidate_screening_with_ai",
  },
];

const GLOBAL = {
  band: "M" as Band,
  score: 7.1,
  scoreDelta: +0.4,
  casesCompleted: 4,
  bandDistribution: { A: 1, M: 2, B: 1 },
  lastActivityRelative: "hace 3 días",
  recommendation: "entrenar" as const,
  recommendationReason:
    "Tu criterio en contexto y juicio es sólido (8+), pero validación cayó en 2 de 4 casos. Antes de ampliar uso de IA en producción, refuerza la verificación de outputs.",
  practiceBeat: {
    slug: "practice_validate_before_publish_v1",
    title: "Práctica: validar antes de publicar",
    estimatedMinutes: 10,
  },
};

interface RiskEvent {
  type: string;
  label: string;
  count: number;
  severity: "low" | "medium" | "high";
  description: string;
}

const RISK_EVENTS: RiskEvent[] = [
  {
    type: "accepted_hallucinated_figures",
    label: "Aceptaste cifras alucinadas",
    count: 2,
    severity: "high",
    description: "En 2 casos validaste outputs sin verificar fuente primaria.",
  },
  {
    type: "shared_third_party_confidential",
    label: "Compartiste data sensible con tool externa",
    count: 1,
    severity: "high",
    description: "1 caso: pegaste PII a tool sin DPA con la empresa.",
  },
  {
    type: "over_relied_on_output",
    label: "Confiaste demasiado en el primer output",
    count: 1,
    severity: "medium",
    description: "1 caso: aceptaste el primer draft sin iterar.",
  },
  {
    type: "used_unapproved_vendor",
    label: "Usaste un vendor no aprobado",
    count: 1,
    severity: "low",
    description: "1 caso: empleaste tool fuera del catálogo permitido.",
  },
];

interface ToolPerformance {
  name: string;
  uses: number;
  avgBand: Band;
  avgScore: number; // 0-10
}

const TOOLS_PERFORMANCE: ToolPerformance[] = [
  { name: "ChatGPT",      uses: 3, avgBand: "M", avgScore: 6.4 },
  { name: "Claude",       uses: 2, avgBand: "A", avgScore: 8.5 },
  { name: "Meta Ads",     uses: 2, avgBand: "M", avgScore: 7.1 },
  { name: "Google Ads",   uses: 1, avgBand: "B", avgScore: 5.5 },
  { name: "Looker",       uses: 1, avgBand: "M", avgScore: 6.8 },
];

type RecommendationAction = "pilotar" | "entrenar" | "pausar" | "escalar";

const RECOMMENDATION_LABEL: Record<RecommendationAction, string> = {
  pilotar: "Pilotar",
  entrenar: "Entrenar",
  pausar: "Pausar",
  escalar: "Escalar",
};

const RECOMMENDATION_TONE: Record<
  RecommendationAction,
  { bg: string; text: string }
> = {
  pilotar: { bg: "var(--band-a-bg)", text: "var(--band-a-text)" },
  entrenar: { bg: "var(--accent-soft)", text: "var(--accent)" },
  pausar: { bg: "var(--band-b-bg)", text: "var(--band-b-text)" },
  escalar: { bg: "var(--band-a-bg)", text: "var(--band-a-text)" },
};

const COMPLETED_CASES = CASES.filter((c) => c.userStatus === "completed");
const RECOMMENDED_NEXT = CASES.filter(
  (c) => c.userStatus !== "completed" && c.userStatus !== "in_progress",
).slice(0, 2);

// Lookup helper: dado un slug, devuelve el CaseItem o undefined.
const caseBySlug = (slug: string) => CASES.find((c) => c.slug === slug);

// ============================================================================
// Atoms
// ============================================================================

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--hairline)] bg-[var(--surface)] p-5 ${className}`}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="ts-caption-2 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
      {children}
    </span>
  );
}

function BandPill({ band, size = "md" }: { band: Band; size?: "sm" | "md" }) {
  const cls =
    band === "A"
      ? "bg-[var(--band-a-bg)] text-[var(--band-a-text)]"
      : band === "M"
        ? "bg-[var(--band-m-bg)] text-[var(--band-m-text)]"
        : "bg-[var(--band-b-bg)] text-[var(--band-b-text)]";
  const sizeCls = size === "sm" ? "ts-caption-2 px-1.5 py-0" : "ts-caption-1 px-2 py-0.5";
  return (
    <span className={`inline-flex items-center rounded-[var(--radius-sm)] font-semibold ${cls} ${sizeCls}`}>
      {BAND_LABEL[band]}
    </span>
  );
}

function DeltaPill({ delta }: { delta: number }) {
  if (Math.abs(delta) < 0.05) {
    return (
      <span className="inline-flex items-center gap-0.5 ts-caption-1 text-[var(--text-tertiary)] tabular-nums">
        = 0.0
      </span>
    );
  }
  const up = delta > 0;
  const color = up ? "text-[var(--band-a-text)]" : "text-[var(--band-b-text)]";
  return (
    <span
      className={`inline-flex items-center gap-0.5 ts-caption-1 font-semibold tabular-nums ${color}`}
      aria-label={up ? `Sube ${delta.toFixed(1)}` : `Baja ${Math.abs(delta).toFixed(1)}`}
    >
      {up ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}
    </span>
  );
}

function Score({ value, big = false }: { value: number; big?: boolean }) {
  return (
    <span
      className={`tabular-nums font-semibold text-[var(--text-primary)] ${
        big ? "ts-display" : "ts-headline"
      }`}
    >
      {value.toFixed(1)}
      <span className="ts-callout text-[var(--text-tertiary)] font-medium">/10</span>
    </span>
  );
}

/**
 * Sparkline en SVG, fit-to-container. Refleja últimos N scores (0-10).
 * Usa accent color. Sin labels — solo señal visual de trend.
 */
function Sparkline({ values }: { values: number[] }) {
  const w = 80;
  const h = 24;
  const maxScore = 10;
  const padding = 1.5;
  const step = (w - padding * 2) / Math.max(values.length - 1, 1);
  const points = values
    .map((v, i) => {
      const x = padding + i * step;
      const y = padding + (h - padding * 2) * (1 - v / maxScore);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  // Último punto = círculo destacado
  const lastX = padding + (values.length - 1) * step;
  const lastY = padding + (h - padding * 2) * (1 - values[values.length - 1] / maxScore);
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      role="img"
      aria-label={`Tendencia: ${values.map((v) => v.toFixed(1)).join(" → ")}`}
      className="flex-none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={2} fill="var(--accent)" />
    </svg>
  );
}

/**
 * Mini bar 0-10 con fill según score. Usado en sub-criterios.
 */
function SubBar({ value }: { value: number }) {
  const pct = (value / 10) * 100;
  // Color del fill por banda (consistente con sistema): A≥7.5, M≥6, B<6
  const fillColor =
    value >= 7.5
      ? "var(--band-a-bar)"
      : value >= 6
        ? "var(--band-m-bar)"
        : "var(--band-b-bar)";
  return (
    <div className="flex-1 h-[5px] rounded-full bg-[var(--surface-2)] overflow-hidden">
      <div
        className="h-full rounded-full transition-[width]"
        style={{ width: `${pct}%`, background: fillColor }}
      />
    </div>
  );
}

function CaseChip({ slug, prefix }: { slug?: string; prefix: string }) {
  if (!slug) return null;
  const c = caseBySlug(slug);
  if (!c) return null;
  return (
    <Link
      href={`/case/${c.slug}`}
      className="group inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--hairline)] bg-[var(--surface)] px-2 py-1 ts-caption-1 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
    >
      <span className="text-[var(--text-tertiary)]">{prefix}</span>
      <span className="truncate max-w-[180px]">{c.title}</span>
    </Link>
  );
}

function SeverityDot({ severity }: { severity: RiskEvent["severity"] }) {
  const color =
    severity === "high"
      ? "var(--band-b-bar)"
      : severity === "medium"
        ? "var(--band-m-bar)"
        : "var(--band-a-bar)";
  return <span className="h-1.5 w-1.5 rounded-full flex-none" style={{ background: color }} />;
}

// ============================================================================
// Sections
// ============================================================================

function GlanceSection() {
  const total = GLOBAL.bandDistribution.A + GLOBAL.bandDistribution.M + GLOBAL.bandDistribution.B;
  return (
    <Card>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.1fr_1fr_1fr] md:items-center">
        {/* Score + banda + delta */}
        <div>
          <Eyebrow>Tu desempeño global</Eyebrow>
          <div className="mt-2 flex items-baseline gap-3">
            <Score value={GLOBAL.score} big />
            <BandPill band={GLOBAL.band} />
            <DeltaPill delta={GLOBAL.scoreDelta} />
          </div>
          <p className="mt-1 ts-caption-1 text-[var(--text-tertiary)]">
            promedio en {GLOBAL.casesCompleted} casos · vs. tu primer caso
          </p>
        </div>

        {/* Distribución por banda */}
        <div>
          <Eyebrow>Distribución de bandas</Eyebrow>
          <div className="mt-3 flex h-[8px] w-full overflow-hidden rounded-full">
            <div
              className="bg-[var(--band-a-bar)]"
              style={{ width: `${(GLOBAL.bandDistribution.A / total) * 100}%` }}
              title={`${GLOBAL.bandDistribution.A} Alto`}
            />
            <div
              className="bg-[var(--band-m-bar)]"
              style={{ width: `${(GLOBAL.bandDistribution.M / total) * 100}%` }}
              title={`${GLOBAL.bandDistribution.M} Medio`}
            />
            <div
              className="bg-[var(--band-b-bar)]"
              style={{ width: `${(GLOBAL.bandDistribution.B / total) * 100}%` }}
              title={`${GLOBAL.bandDistribution.B} Bajo`}
            />
          </div>
          <div className="mt-2.5 flex items-center gap-4 ts-caption-1 text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--band-a-bar)]" />
              {GLOBAL.bandDistribution.A} Alto
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--band-m-bar)]" />
              {GLOBAL.bandDistribution.M} Medio
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--band-b-bar)]" />
              {GLOBAL.bandDistribution.B} Bajo
            </span>
          </div>
        </div>

        {/* Meta */}
        <div>
          <Eyebrow>Última actividad</Eyebrow>
          <div className="mt-2 ts-headline font-medium text-[var(--text-primary)]">
            {GLOBAL.lastActivityRelative}
          </div>
          <p className="mt-1 ts-caption-1 text-[var(--text-tertiary)]">
            reporte refresca al cerrar cada caso
          </p>
        </div>
      </div>
    </Card>
  );
}

function RecommendationSection() {
  const tone = RECOMMENDATION_TONE[GLOBAL.recommendation];
  return (
    <Card>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1.5fr_1fr] md:items-start">
        <div>
          <Eyebrow>Recomendación operativa</Eyebrow>
          <div className="mt-2 flex items-center gap-2">
            <span
              className="inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 ts-callout font-semibold"
              style={{ background: tone.bg, color: tone.text }}
            >
              {RECOMMENDATION_LABEL[GLOBAL.recommendation]}
            </span>
            <span className="ts-caption-1 text-[var(--text-tertiary)]">
              gating principal · Validación
            </span>
          </div>
          <p className="mt-3 ts-body leading-[1.55] text-[var(--text-secondary)]">
            {GLOBAL.recommendationReason}
          </p>
        </div>

        <div>
          <Eyebrow>Practice beat sugerido</Eyebrow>
          <Link
            href={`/case/${GLOBAL.practiceBeat.slug}`}
            className="mt-2 group flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)] px-3 py-2.5 transition-colors hover:bg-[var(--surface-2)] hover:border-[var(--border-strong)]"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate ts-subhead font-medium text-[var(--text-primary)]">
                {GLOBAL.practiceBeat.title}
              </div>
              <div className="ts-caption-1 text-[var(--text-tertiary)]">
                {GLOBAL.practiceBeat.estimatedMinutes} min · prioridad alta
              </div>
            </div>
            <span className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
              →
            </span>
          </Link>
        </div>
      </div>
    </Card>
  );
}

function DimensionCard({ d }: { d: DimensionReport }) {
  return (
    <Card>
      {/* Header: nombre + score + banda + delta */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="ts-headline font-semibold text-[var(--text-primary)] tracking-tight">
              {d.label}
            </h3>
            <BandPill band={d.band} size="sm" />
          </div>
          <p className="mt-1 ts-caption-1 text-[var(--text-tertiary)] leading-snug">
            {d.description}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-none">
          <Score value={d.score} />
          <DeltaPill delta={d.delta} />
        </div>
      </div>

      {/* Sparkline */}
      <div className="mt-4 flex items-center gap-3">
        <Eyebrow>Últimos {d.trend.length} casos</Eyebrow>
        <div className="flex-1 h-[1px] bg-[var(--hairline)]" />
        <Sparkline values={d.trend} />
      </div>

      {/* Sub-criterios */}
      <div className="mt-4 flex flex-col gap-2.5">
        {d.subCriteria.map((sc) => (
          <div key={sc.id} className="flex items-center gap-3">
            <span className="flex-1 min-w-0 ts-footnote text-[var(--text-secondary)] truncate">
              {sc.label}
            </span>
            <SubBar value={sc.score} />
            <span className="w-[36px] flex-none text-right ts-footnote font-medium tabular-nums text-[var(--text-primary)]">
              {sc.score.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Mejor / peor caso */}
      {(d.bestCaseSlug || d.worstCaseSlug) && (
        <div className="mt-4 pt-4 border-t border-[var(--hairline)] flex flex-wrap items-center gap-2">
          <CaseChip slug={d.bestCaseSlug} prefix="Mejor" />
          <CaseChip slug={d.worstCaseSlug} prefix="Peor" />
        </div>
      )}
    </Card>
  );
}

function RiskEventsSection() {
  const totalEvents = RISK_EVENTS.reduce((acc, e) => acc + e.count, 0);
  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <Eyebrow>Risk events detectados</Eyebrow>
          <h2 className="mt-1 ts-headline font-semibold text-[var(--text-primary)]">
            {totalEvents} eventos en {GLOBAL.casesCompleted} casos
          </h2>
        </div>
        <span className="ts-caption-1 text-[var(--text-tertiary)]">
          severity ≥ alta = bloqueante para producción
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {RISK_EVENTS.map((e) => (
          <div
            key={e.type}
            className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)] px-3 py-2.5"
          >
            <div className="flex-none mt-1">
              <SeverityDot severity={e.severity} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <div className="ts-subhead font-medium text-[var(--text-primary)]">
                  {e.label}
                </div>
                <div className="flex-none ts-caption-1 tabular-nums text-[var(--text-tertiary)]">
                  ×{e.count}
                </div>
              </div>
              <p className="mt-0.5 ts-caption-1 text-[var(--text-secondary)] leading-snug">
                {e.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ToolsSection() {
  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <Eyebrow>Performance por herramienta</Eyebrow>
          <h2 className="mt-1 ts-headline font-semibold text-[var(--text-primary)]">
            Cómo te va con cada tool
          </h2>
        </div>
        <span className="ts-caption-1 text-[var(--text-tertiary)]">
          score promedio en casos donde la usaste
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        {TOOLS_PERFORMANCE.map((t) => (
          <div
            key={t.name}
            className="grid grid-cols-[100px_auto_1fr_auto_auto] items-center gap-3 px-2 py-2 rounded-[var(--radius-sm)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <span className="ts-subhead font-medium text-[var(--text-primary)] truncate">
              {t.name}
            </span>
            <span className="ts-caption-1 text-[var(--text-tertiary)] tabular-nums">
              {t.uses} {t.uses === 1 ? "uso" : "usos"}
            </span>
            <SubBar value={t.avgScore} />
            <span className="ts-footnote font-medium tabular-nums text-[var(--text-primary)]">
              {t.avgScore.toFixed(1)}
            </span>
            <BandPill band={t.avgBand} size="sm" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function CompletedCasesSection() {
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="ts-headline font-semibold text-[var(--text-primary)] tracking-tight">
          Casos completados
        </h2>
        <Link
          href="/casos"
          className="ts-caption-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          ver catálogo →
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COMPLETED_CASES.slice(0, 4).map((item) => (
          <CaseCard key={item.slug} item={item} />
        ))}
      </div>
    </section>
  );
}

function NextStepSection({ items }: { items: CaseItem[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="ts-headline font-semibold text-[var(--text-primary)] tracking-tight">
          Próximos casos para ti
        </h2>
        <span className="ts-caption-1 text-[var(--text-tertiary)]">
          alineados a tus puntos débiles
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <CaseCard key={item.slug} item={item} />
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function ReportesPage() {
  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-5">
        {/* ============ HEADER ============ */}
        <header>
          <h1 className="display display-tight text-[var(--text-primary)] ts-title-1 sm:ts-display">
            Mis reportes
          </h1>
          <p className="mt-2 ts-subhead text-[var(--text-secondary)] leading-[1.55] max-w-[640px]">
            Desglose detallado de tu desempeño en{" "}
            <span className="font-medium text-[var(--text-primary)]">
              {GLOBAL.casesCompleted} casos
            </span>{" "}
            completados. Cada criterio evalúa 3 sub-habilidades específicas, y cada caso
            dispara una recomendación operativa.
          </p>
        </header>

        {/* ============ GLANCE ============ */}
        <GlanceSection />

        {/* ============ RECOMENDACIÓN ============ */}
        <RecommendationSection />

        {/* ============ DESGLOSE POR CRITERIO ============ */}
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="ts-headline font-semibold text-[var(--text-primary)] tracking-tight">
              Desglose por criterio
            </h2>
            <span className="ts-caption-1 text-[var(--text-tertiary)]">
              {DIMENSIONS_REPORT.length} dimensiones · escala 0–10
            </span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {DIMENSIONS_REPORT.map((d) => (
              <DimensionCard key={d.id} d={d} />
            ))}
          </div>
        </section>

        {/* ============ RISK EVENTS + TOOLS (2 cols) ============ */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
          <RiskEventsSection />
          <ToolsSection />
        </section>

        {/* ============ CASOS COMPLETADOS ============ */}
        <CompletedCasesSection />

        {/* ============ NEXT STEP ============ */}
        <NextStepSection items={RECOMMENDED_NEXT} />
      </div>
    </main>
  );
}
