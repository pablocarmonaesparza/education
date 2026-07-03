"use client";

/**
 * /reportes — vista profunda del desempeño del employee.
 *
 * Datos REALES (R-29): consume GET /api/me/report-summary (agregado de
 * reports participant_mirror del user) + GET /api/cases (catálogo con estado
 * del viewer). Cero mocks; estados de loading (AppleSkeleton), error (retry)
 * y vacío (AppleEmptyState → /casos).
 *
 * Diseño glance-first + desglose denso:
 *   1. GLANCE       — banda global + score 0-10 + delta + distribución + última actividad
 *   2. RECOMENDACIÓN — banner ancho con razón + practice beat sugerido
 *   3. DESGLOSE      — 6 cards (uno por criterio) con score + trend + rationale
 *   4. RISK EVENTS   — tipos disparados, frecuencia, severity
 *   5. CASOS DONE    — grid de CaseCards completados
 *   6. NEXT STEP     — casos recomendados al final
 *
 * Escala visible: 0-10 con 1 decimal (decisión Pablo 2026-05-23). El API
 * habla 0-100 (R-13: bandFromScore100/BAND_REPRESENTATIVE_SCORE de config).
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AppleButtonLink,
  AppleEmptyState,
  AppleErrorState,
  AppleIcon,
  AppleReveal,
  AppleSkeleton,
} from "@/components/simulador/apple";
import { CaseCard } from "@/components/simulador/CaseCard";
import { BAND_LABEL, type CaseCatalogItem } from "@/lib/simulador/case-catalog";
import {
  BAND_REPRESENTATIVE_SCORE,
  DIMENSIONS,
  MANAGER_ACTIONS,
  type BandKey,
} from "@/lib/simulador/config";
import { humanRiskType, severityLabel } from "@/lib/simulador/reports/model";
import type {
  RecommendationAction,
  ReportSummary,
  ReportSummaryDimension,
  ReportSummaryRiskEvent,
  RiskSeverity,
  SummaryCaseRef,
} from "@/lib/simulador/report-summary";

// ============================================================================
// Helpers
// ============================================================================

const RECOMMENDATION_TONE: Record<
  RecommendationAction,
  { bg: string; text: string }
> = {
  pilotar: { bg: "var(--band-a-bg)", text: "var(--band-a-text)" },
  entrenar: { bg: "var(--accent-soft)", text: "var(--accent)" },
  pausar: { bg: "var(--band-m-bg)", text: "var(--band-m-text)" },
  escalar: { bg: "var(--band-b-bg)", text: "var(--band-b-text)" },
};

function recommendationLabel(action: RecommendationAction): string {
  return MANAGER_ACTIONS.find((a) => a.id === action)?.label ?? action;
}

/** 0-100 → escala visible 0-10. */
function toTen(score: number): number {
  return score / 10;
}

function bandToTen(band: BandKey): number {
  return toTen(BAND_REPRESENTATIVE_SCORE[band]);
}

function relativeLabel(iso: string | null): string {
  if (!iso) return "sin actividad";
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return "hace minutos";
  const hours = Math.round(mins / 60);
  if (hours < 24) return hours === 1 ? "hace 1 hora" : `hace ${hours} horas`;
  const days = Math.round(hours / 24);
  if (days < 30) return days === 1 ? "hace 1 día" : `hace ${days} días`;
  const months = Math.round(days / 30);
  return months === 1 ? "hace 1 mes" : `hace ${months} meses`;
}

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
      className={`rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5 ${className}`}
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

function BandPill({ band, size = "md" }: { band: BandKey; size?: "sm" | "md" }) {
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
 * Usa accent color. Sin labels, solo señal visual de trend.
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

function CaseChip({
  caseRef,
  prefix,
}: {
  caseRef: SummaryCaseRef | null;
  prefix: string;
}) {
  if (!caseRef) return null;
  return (
    <Link
      href={`/case/${caseRef.slug}`}
      className="group inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--surface)] px-2 py-1 ts-caption-1 text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
    >
      <span className="text-[var(--text-tertiary)]">{prefix}</span>
      <span className="truncate max-w-[180px]">{caseRef.title}</span>
    </Link>
  );
}

function SeverityDot({ severity }: { severity: RiskSeverity }) {
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

function GlanceSection({ summary }: { summary: ReportSummary }) {
  const { global } = summary;
  const dist = global.bandDistribution;
  const total = Math.max(dist.A + dist.M + dist.B, 1);
  // Delta vs primer caso: cases viene reciente → viejo.
  const chronological = [...summary.cases].reverse();
  const delta =
    chronological.length >= 2
      ? toTen(chronological[chronological.length - 1].score) -
        toTen(chronological[0].score)
      : null;
  return (
    <Card>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.1fr_1fr_1fr] md:items-center">
        {/* Score + banda + delta */}
        <div>
          <Eyebrow>Tu desempeño global</Eyebrow>
          <div className="mt-2 flex items-baseline gap-3">
            {global.score !== null && <Score value={toTen(global.score)} big />}
            {global.band && <BandPill band={global.band} />}
            {delta !== null && <DeltaPill delta={delta} />}
          </div>
          <p className="mt-1 ts-caption-1 text-[var(--text-tertiary)]">
            promedio en {global.casesCompleted}{" "}
            {global.casesCompleted === 1 ? "caso" : "casos"}
            {delta !== null && " · vs. tu primer caso"}
          </p>
        </div>

        {/* Distribución por banda */}
        <div>
          <Eyebrow>Distribución de bandas</Eyebrow>
          <div className="mt-3 flex h-[8px] w-full overflow-hidden rounded-full">
            <div
              className="bg-[var(--band-a-bar)]"
              style={{ width: `${(dist.A / total) * 100}%` }}
              title={`${dist.A} Alto`}
            />
            <div
              className="bg-[var(--band-m-bar)]"
              style={{ width: `${(dist.M / total) * 100}%` }}
              title={`${dist.M} Medio`}
            />
            <div
              className="bg-[var(--band-b-bar)]"
              style={{ width: `${(dist.B / total) * 100}%` }}
              title={`${dist.B} Bajo`}
            />
          </div>
          <div className="mt-2.5 flex items-center gap-4 ts-caption-1 text-[var(--text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--band-a-bar)]" />
              {dist.A} Alto
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--band-m-bar)]" />
              {dist.M} Medio
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--band-b-bar)]" />
              {dist.B} Bajo
            </span>
          </div>
        </div>

        {/* Meta */}
        <div>
          <Eyebrow>Última actividad</Eyebrow>
          <div className="mt-2 ts-headline font-medium text-[var(--text-primary)]">
            {relativeLabel(global.lastActivityAt)}
          </div>
          <p className="mt-1 ts-caption-1 text-[var(--text-tertiary)]">
            reporte refresca al cerrar cada caso
          </p>
        </div>
      </div>
    </Card>
  );
}

function RecommendationSection({ summary }: { summary: ReportSummary }) {
  const recommendation = summary.global.recommendation;
  if (!recommendation) return null;
  const tone = RECOMMENDATION_TONE[recommendation.action];
  const suggestedBeat = summary.practice.find(
    (p) => p.status === "unlocked" || p.status === "started",
  );
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
              {recommendationLabel(recommendation.action)}
            </span>
            <span className="ts-caption-1 text-[var(--text-tertiary)]">
              de tu reporte más reciente
            </span>
          </div>
          {recommendation.reason && (
            <p className="mt-3 ts-body leading-[1.55] text-[var(--text-secondary)]">
              {recommendation.reason}
            </p>
          )}
        </div>

        {suggestedBeat && (
          <div>
            <Eyebrow>Practice beat sugerido</Eyebrow>
            <Link
              href={`/practica/${suggestedBeat.slug}`}
              className="mt-2 group flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--surface)] px-3 py-2.5 transition-colors hover:bg-[var(--surface-3)]"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate ts-subhead font-medium text-[var(--text-primary)]">
                  {suggestedBeat.title}
                </div>
                <div className="ts-caption-1 text-[var(--text-tertiary)]">
                  {suggestedBeat.durationMin} min · desbloqueado por tus casos
                </div>
              </div>
              <span className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors">
                →
              </span>
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}

function DimensionCard({ d }: { d: ReportSummaryDimension }) {
  const meta = DIMENSIONS.find((x) => x.id === d.id);
  const trendScores = d.trend.map(bandToTen);
  const delta =
    trendScores.length >= 2
      ? trendScores[trendScores.length - 1] - trendScores[0]
      : null;
  return (
    <Card>
      {/* Header: nombre + score + banda + delta */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="ts-headline font-semibold text-[var(--text-primary)] tracking-tight">
              {meta?.label ?? d.id}
            </h3>
            <BandPill band={d.band} size="sm" />
          </div>
          <p className="mt-1 ts-caption-1 text-[var(--text-tertiary)] leading-snug">
            {meta?.description}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-none">
          <Score value={toTen(d.score)} />
          {delta !== null && <DeltaPill delta={delta} />}
        </div>
      </div>

      {/* Sparkline */}
      <div className="mt-4 flex items-center gap-3">
        <Eyebrow>
          {d.trend.length === 1
            ? "1 caso evaluado"
            : `Últimos ${d.trend.length} casos`}
        </Eyebrow>
        <div className="flex-1 h-[1px] bg-[var(--hairline)]" />
        <Sparkline values={trendScores} />
      </div>

      {/* Lectura del judge en el reporte más reciente */}
      {d.latestRationale && (
        <p className="mt-4 ts-footnote leading-snug text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">
            Última lectura:
          </span>{" "}
          {d.latestRationale}
        </p>
      )}

      {/* Mejor / peor caso */}
      {(d.bestCase || d.worstCase) && (
        <div className="mt-4 pt-4 border-t border-[var(--hairline)] flex flex-wrap items-center gap-2">
          <CaseChip caseRef={d.bestCase} prefix="Mejor" />
          <CaseChip caseRef={d.worstCase} prefix="Peor" />
        </div>
      )}
    </Card>
  );
}

function RiskEventsSection({
  events,
  casesCompleted,
}: {
  events: ReportSummaryRiskEvent[];
  casesCompleted: number;
}) {
  const totalEvents = events.reduce((acc, e) => acc + e.count, 0);
  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <Eyebrow>Risk events detectados</Eyebrow>
          <h2 className="mt-1 ts-headline font-semibold text-[var(--text-primary)]">
            {totalEvents} {totalEvents === 1 ? "evento" : "eventos"} en{" "}
            {casesCompleted} {casesCompleted === 1 ? "caso" : "casos"}
          </h2>
        </div>
        <span className="ts-caption-1 text-[var(--text-tertiary)]">
          severity alta = bloqueante para producción
        </span>
      </div>

      {events.length === 0 ? (
        <p className="mt-4 ts-subhead text-[var(--text-secondary)]">
          Sin eventos de riesgo en tus casos. Mantén la validación activa.
        </p>
      ) : (
        <div className="mt-4 flex flex-col divide-y divide-[var(--hairline)]">
          {events.map((e) => (
            <div
              key={e.type}
              className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex-none mt-1">
                <SeverityDot severity={e.maxSeverity} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="ts-subhead font-medium text-[var(--text-primary)]">
                    {humanRiskType(e.type)}
                  </div>
                  <div className="flex-none ts-caption-1 tabular-nums text-[var(--text-tertiary)]">
                    ×{e.count}
                  </div>
                </div>
                <p className="mt-0.5 ts-caption-1 text-[var(--text-secondary)] leading-snug">
                  Severidad {severityLabel(e.maxSeverity).toLowerCase()} ·
                  detectado en {e.count} {e.count === 1 ? "ocasión" : "ocasiones"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function CompletedCasesSection({ items }: { items: CaseCatalogItem[] }) {
  if (items.length === 0) return null;
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
        {items.map((item) => (
          <CaseCard key={item.slug} item={item} />
        ))}
      </div>
    </section>
  );
}

function NextStepSection({ items }: { items: CaseCatalogItem[] }) {
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
// Estados de página
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy aria-label="Cargando reportes">
      <div>
        <AppleSkeleton className="h-10 w-[280px]" />
        <AppleSkeleton className="mt-3 h-5 w-full max-w-[560px]" />
      </div>
      <AppleSkeleton className="h-[140px] w-full rounded-[var(--radius-lg)]" />
      <AppleSkeleton className="h-[120px] w-full rounded-[var(--radius-lg)]" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {DIMENSIONS.map((d) => (
          <AppleSkeleton
            key={d.id}
            className="h-[200px] w-full rounded-[var(--radius-lg)]"
          />
        ))}
      </div>
    </div>
  );
}

function EmptyHero() {
  return (
    <AppleEmptyState
      icon={<AppleIcon name="chart" size="lg" />}
      title="Aún no tienes reportes"
      description="Tu diagnóstico aparece aquí cuando completes tu primer caso: banda por criterio, eventos de riesgo y una recomendación operativa para tu manager."
      action={<AppleButtonLink href="/casos">Jugar mi primer caso</AppleButtonLink>}
    />
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function ReportesPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [catalog, setCatalog] = useState<CaseCatalogItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [summaryRes, casesRes] = await Promise.all([
        fetch("/api/me/report-summary", { cache: "no-store" }),
        fetch("/api/cases", { cache: "no-store" }),
      ]);
      if (!summaryRes.ok) {
        const d = await summaryRes.json().catch(() => null);
        throw new Error(d?.error ?? `Error ${summaryRes.status}.`);
      }
      setSummary((await summaryRes.json()) as ReportSummary);
      // El catálogo degrada bien: si falla, las secciones de casos no se
      // muestran pero el resumen sigue siendo útil.
      if (casesRes.ok) {
        const d = (await casesRes.json()) as { cases?: CaseCatalogItem[] };
        setCatalog(d.cases ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loading = !summary && !error;
  const isEmpty = summary !== null && summary.cases.length === 0;
  const completedCases = catalog.filter((c) => c.userStatus === "completed");
  const recommendedNext = catalog
    .filter((c) => c.userStatus === "not_started")
    .slice(0, 2);

  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-5">
        {loading && <LoadingSkeleton />}

        {error && (
          <>
            <header>
              <h1 className="display display-tight text-[var(--text-primary)] ts-title-1 sm:ts-display">
                Mis reportes
              </h1>
            </header>
            <AppleErrorState
              title="No pudimos cargar tus reportes."
              body={error}
              onAction={load}
            />
          </>
        )}

        {summary && isEmpty && (
          <>
            <AppleReveal as="header">
              <h1 className="display display-tight text-[var(--text-primary)] ts-title-1 sm:ts-display">
                Mis reportes
              </h1>
              <p className="mt-2 ts-subhead text-[var(--text-secondary)] leading-[1.55] max-w-[640px]">
                Aquí vive el desglose de tu desempeño: cada caso completado
                dispara un reporte con bandas por criterio y una recomendación
                operativa.
              </p>
            </AppleReveal>
            <AppleReveal delay={0.04}>
              <EmptyHero />
            </AppleReveal>
          </>
        )}

        {summary && !isEmpty && (
          <>
            {/* ============ HEADER ============ */}
            <AppleReveal as="header">
              <h1 className="display display-tight text-[var(--text-primary)] ts-title-1 sm:ts-display">
                Mis reportes
              </h1>
              <p className="mt-2 ts-subhead text-[var(--text-secondary)] leading-[1.55] max-w-[640px]">
                Desglose detallado de tu desempeño en{" "}
                <span className="font-medium text-[var(--text-primary)]">
                  {summary.global.casesCompleted}{" "}
                  {summary.global.casesCompleted === 1 ? "caso" : "casos"}
                </span>{" "}
                {summary.global.casesCompleted === 1
                  ? "completado"
                  : "completados"}
                . Cada caso evalúa 6 criterios y dispara una recomendación
                operativa.
              </p>
            </AppleReveal>

            {/* ============ GLANCE ============ */}
            <AppleReveal delay={0.04}>
              <GlanceSection summary={summary} />
            </AppleReveal>

            {/* ============ RECOMENDACIÓN ============ */}
            <AppleReveal delay={0.08}>
              <RecommendationSection summary={summary} />
            </AppleReveal>

            {/* ============ DESGLOSE POR CRITERIO ============ */}
            <AppleReveal as="section" delay={0.12}>
              <div className="flex items-baseline justify-between">
                <h2 className="ts-headline font-semibold text-[var(--text-primary)] tracking-tight">
                  Desglose por criterio
                </h2>
                <span className="ts-caption-1 text-[var(--text-tertiary)]">
                  {summary.dimensions.length} dimensiones · escala 0–10
                </span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {summary.dimensions.map((d) => (
                  <DimensionCard key={d.id} d={d} />
                ))}
              </div>
            </AppleReveal>

            {/* ============ RISK EVENTS ============ */}
            <AppleReveal delay={0.16}>
              <RiskEventsSection
                events={summary.riskEvents}
                casesCompleted={summary.global.casesCompleted}
              />
            </AppleReveal>

            {/* ============ CASOS COMPLETADOS ============ */}
            {completedCases.length > 0 && (
              <AppleReveal delay={0.2}>
                <CompletedCasesSection items={completedCases} />
              </AppleReveal>
            )}

            {/* ============ NEXT STEP ============ */}
            {recommendedNext.length > 0 && (
              <AppleReveal delay={0.24}>
                <NextStepSection items={recommendedNext} />
              </AppleReveal>
            )}
          </>
        )}
      </div>
    </main>
  );
}
