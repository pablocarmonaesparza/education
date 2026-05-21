"use client";

/**
 * /reportes — vista extendida de desempeño del employee.
 *
 * Versión profunda del "Mi performance" del /team. Refleja el modelo de
 * MANAGER_RESULTS_MODEL.md + CASE_RUBRIC_V1.md:
 *   - 6 bandas por criterio (contexto, datos, ejecucion_ia, validacion,
 *     juicio, impacto)
 *   - Banda global agregada
 *   - Recomendación general (pilotar/entrenar/pausar/escalar)
 *   - Practice beat sugerido
 *   - Lista de casos completados con CaseCard compartida
 *
 * Layout glance-friendly (sin scroll vertical), HIG estricto.
 */

import Link from "next/link";
import { CaseCard } from "@/components/simulador/CaseCard";
import {
  BAND_LABEL,
  CASES,
  type Band,
} from "@/lib/simulador/cases";

// ============================================================================
// MOCK DATA — refleja el output del judge LLM por user.
// Cuando se cablee BD: derivar de aggregate(simulator_sessions WHERE user_id).
// ============================================================================

interface DimensionReport {
  id: string;
  label: string;
  score: number; // 0-100
  band: Band;
}

const DIMENSIONS_REPORT: DimensionReport[] = [
  { id: "contexto", label: "Contexto", score: 82, band: "M" },
  { id: "datos", label: "Datos", score: 65, band: "M" },
  { id: "ejecucion_ia", label: "Ejecución IA", score: 71, band: "M" },
  { id: "validacion", label: "Validación", score: 58, band: "B" },
  { id: "juicio", label: "Juicio", score: 79, band: "M" },
  { id: "impacto", label: "Impacto", score: 68, band: "M" },
];

const GLOBAL = {
  band: "M" as Band,
  score: 71,
  casesCount: 4,
  recommendation: "entrenar" as const, // pilotar | entrenar | pausar | escalar
  recommendationReason:
    "Tu criterio en contexto y juicio es sólido, pero tu validación cayó en 2 de 4 casos. Antes de ampliar uso de IA en producción, refuerza la verificación de outputs.",
  practiceBeat: {
    slug: "practice_validate_before_publish_v1",
    title: "Práctica: validar antes de publicar",
    estimatedMinutes: 10,
  },
  toolsWithRisk: ["ChatGPT", "Looker"],
};

const RECOMMENDATION_LABEL: Record<typeof GLOBAL.recommendation, string> = {
  pilotar: "Pilotar",
  entrenar: "Entrenar",
  pausar: "Pausar",
  escalar: "Escalar",
};

// Casos completados — solo userStatus === 'completed'
const COMPLETED_CASES = CASES.filter((c) => c.userStatus === "completed");

// ============================================================================
// Components
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

function CardHeader({ eyebrow }: { eyebrow: string }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
      {eyebrow}
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
  const sizeCls = size === "sm" ? "text-[10px] px-1.5 py-0" : "text-[11px] px-2 py-0.5";
  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold ${cls} ${sizeCls}`}
    >
      {BAND_LABEL[band]}
    </span>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function ReportesPage() {
  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4">
        {/* ============ HEADER ============ */}
        <header>
          <h1 className="display display-tight text-[var(--text-primary)] text-[28px] sm:text-[32px]">
            Mis reportes
          </h1>
          <p className="mt-2 text-[13.5px] text-[var(--text-secondary)] leading-[1.55]">
            Resumen de tu desempeño en{" "}
            <span className="font-medium text-[var(--text-primary)]">
              {GLOBAL.casesCount} casos
            </span>{" "}
            completados. Cada caso evalúa tus 6 criterios y dispara una
            recomendación accionable.
          </p>
        </header>

        {/* ============ TOP 2 cols: Desempeño + Recomendación ============ */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
          {/* ---- Tu desempeño por criterio ---- */}
          <Card>
            <CardHeader eyebrow="Tu desempeño por criterio" />

            <div className="mt-3 flex items-baseline gap-3">
              <BandPill band={GLOBAL.band} />
              <span className="text-[11.5px] text-[var(--text-tertiary)]">
                Banda global · promedio {GLOBAL.score}/100
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2.5">
              {DIMENSIONS_REPORT.map((d) => (
                <div key={d.id} className="flex items-center gap-3">
                  <span className="w-[110px] flex-none truncate text-[12.5px] text-[var(--text-secondary)]">
                    {d.label}
                  </span>
                  <div className="flex-1 h-[6px] rounded-full bg-[var(--surface-2)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                  <span className="w-[28px] flex-none text-right text-[12px] font-medium tabular-nums text-[var(--text-primary)]">
                    {d.score}
                  </span>
                  <BandPill band={d.band} size="sm" />
                </div>
              ))}
            </div>
          </Card>

          {/* ---- Tu recomendación actual ---- */}
          <Card>
            <CardHeader eyebrow="Tu recomendación actual" />

            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent)]">
                {RECOMMENDATION_LABEL[GLOBAL.recommendation]}
              </span>
              <span className="text-[11.5px] text-[var(--text-tertiary)]">
                Validación
              </span>
            </div>

            <p className="mt-4 text-[13px] leading-[1.55] text-[var(--text-secondary)]">
              {GLOBAL.recommendationReason}
            </p>

            <div className="mt-5">
              <span className="text-[10.5px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                Practice beat sugerido
              </span>
              <Link
                href={`/case/${GLOBAL.practiceBeat.slug}`}
                className="mt-2 group flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--hairline)] bg-[var(--surface)] px-3 py-2.5 transition-colors hover:bg-[var(--surface-2)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-[var(--text-primary)]">
                    {GLOBAL.practiceBeat.title}
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">
                    {GLOBAL.practiceBeat.estimatedMinutes} min
                  </div>
                </div>
                <span className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
                  →
                </span>
              </Link>
            </div>

            <div className="mt-4">
              <span className="text-[10.5px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                Tools con mayor riesgo
              </span>
              <div className="mt-2 flex flex-wrap gap-1">
                {GLOBAL.toolsWithRisk.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center rounded-md bg-[var(--band-b-bg)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--band-b-text)]"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* ============ CASOS COMPLETADOS ============ */}
        <section>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Casos completados
            </span>
            <span className="text-[11.5px] text-[var(--text-tertiary)]">
              {COMPLETED_CASES.length}{" "}
              {COMPLETED_CASES.length === 1 ? "caso" : "casos"}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COMPLETED_CASES.slice(0, 4).map((item) => (
              <CaseCard key={item.slug} item={item} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
