"use client";

/**
 * /team — Inicio del employee.
 *
 * Bento glance-friendly:
 *   [Hero]
 *   [Mi performance] [Leaderboard del equipo]
 *   [Casos para ti — 4 cols × 2 filas usando la misma CaseCard del catálogo]
 *
 * Las cards de "Casos para ti" son IDÉNTICAS a las del catálogo (/casos)
 * porque comparten components/simulador/CaseCard.tsx y el contrato real
 * (lib/simulador/case-catalog + GET /api/cases — R-29, el mock murió).
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppleButtonLink,
  AppleEmptyState,
  AppleErrorState,
  AppleEyebrowChip,
  AppleReveal,
} from "@/components/simulador/apple";
import { CaseCard } from "@/components/simulador/CaseCard";
import { CaseCardSkeleton } from "@/components/simulador/CaseCardSkeleton";
import {
  type Band,
  type CaseCatalogItem,
} from "@/lib/simulador/case-catalog";
import { bandFromScore100 } from "@/lib/simulador/config";
import { BAND_DISPLAY } from "@/lib/simulador/reports/model";

// ============================================================================
// Datos reales — /api/me/{profile,report-summary,team-leaderboard} (F4)
// ============================================================================

const DIMENSION_LABEL: Record<string, string> = {
  contexto: "Context",
  datos: "Data handling",
  ejecucion_ia: "AI execution",
  validacion: "Verification",
  juicio: "Judgment",
  impacto: "Impact",
};

interface Hero {
  first_name: string;
  initials: string;
  job_title: string;
  org_name: string | null;
}

interface Performance {
  band: Band | null;
  casesCompleted: number;
  dimensions: Array<{ id: string; label: string; score: number }>; // score 0-10
}

interface LeaderboardEntry {
  name: string;
  initials: string;
  score: number; // 0-10 (1 decimal)
  has_reports: boolean;
  is_current_user: boolean;
}

// ============================================================================
// Local components
// ============================================================================

/** Color de barra por banda (tokens --band-*-bar; mismo mapeo canónico R-13). */
const BAND_BAR: Record<Band, string> = {
  A: "var(--band-a-bar)",
  M: "var(--band-m-bar)",
  B: "var(--band-b-bar)",
};

/** Card v2: borde + flotación suave (--shadow-card) vía .card-apple. */
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`card-apple p-6 ${className}`}>{children}</div>;
}

/** Eyebrow de sección v2: extrabold + tracking + accent (patrón landing). */
function CardHeader({
  eyebrow,
  cta,
}: {
  eyebrow: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="ts-footnote font-extrabold uppercase tracking-[0.8px] text-[var(--accent)]">
        {eyebrow}
      </span>
      {cta && (
        <Link
          href={cta.href}
          className="ts-footnote font-bold text-[var(--accent)] transition-opacity hover:opacity-70"
        >
          {cta.label} →
        </Link>
      )}
    </div>
  );
}

function Avatar({
  initials,
  size = "md",
  tone = "neutral",
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  /** "accent" para el hero (sólido accent-strong + blanco, DEC-009 AA). */
  tone?: "neutral" | "accent";
}) {
  const dimensions =
    size === "lg"
      ? "h-14 w-14 ts-headline"
      : size === "md"
        ? "h-9 w-9 ts-footnote"
        : "h-7 w-7 ts-caption-1";
  const tones =
    tone === "accent"
      ? "accent-bg text-white"
      : "bg-[var(--surface-3)] text-[var(--text-primary)]";
  return (
    <div
      className={`${dimensions} ${tones} flex flex-none items-center justify-center rounded-full font-extrabold tabular-nums`}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function BandPill({ band }: { band: Band }) {
  const cls =
    band === "A"
      ? "bg-[var(--band-a-bg)] text-[var(--band-a-text)]"
      : band === "M"
        ? "bg-[var(--band-m-bg)] text-[var(--band-m-text)]"
        : "bg-[var(--band-b-bg)] text-[var(--band-b-text)]";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 ts-caption-1 font-extrabold ${cls}`}
    >
      {BAND_DISPLAY[band]} band
    </span>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function TeamHomePage() {
  const [cases, setCases] = useState<CaseCatalogItem[] | null>(null);
  const [casesError, setCasesError] = useState<string | null>(null);
  const [hero, setHero] = useState<Hero | null>(null);
  const [perf, setPerf] = useState<Performance | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const loadCases = useCallback(async () => {
    setCasesError(null);
    try {
      const res = await fetch("/api/cases", { cache: "no-store" });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? `Error ${res.status}.`);
      }
      const data = (await res.json()) as { cases: CaseCatalogItem[] };
      setCases(data.cases ?? []);
    } catch (err) {
      setCasesError(err instanceof Error ? err.message : "Unexpected error.");
    }
  }, []);

  // Hero + performance + leaderboard reales (degradan a null/[] sin datos).
  const loadMe = useCallback(async () => {
    try {
      const [pRes, rRes, lRes] = await Promise.all([
        fetch("/api/me/profile"),
        fetch("/api/me/report-summary"),
        fetch("/api/me/team-leaderboard"),
      ]);
      if (pRes.ok) {
        const p = (await pRes.json()).profile;
        setHero({
          first_name: (p.full_name as string).split(" ")[0] || "",
          initials: p.initials,
          job_title: p.job_title,
          org_name: p.org_name,
        });
      }
      if (rRes.ok) {
        const s = await rRes.json();
        setPerf({
          band: s.global?.band ?? null,
          casesCompleted: s.global?.casesCompleted ?? 0,
          dimensions: (s.dimensions ?? []).map((d: { id: string; score: number }) => ({
            id: d.id,
            label: DIMENSION_LABEL[d.id] ?? d.id,
            score: Math.round((d.score / 10) * 10) / 10,
          })),
        });
      }
      if (lRes.ok) {
        setLeaderboard((await lRes.json()).leaderboard ?? []);
      }
    } catch {
      // Silencioso: las secciones tienen su propio fallback vacío.
    }
  }, []);

  useEffect(() => {
    loadCases();
    loadMe();
  }, [loadCases, loadMe]);

  // Casos recomendados: solo no completados. in_progress primero (debe
  // terminar lo que empezó), después not_started. GET /api/cases ya ordena
  // así, pero lo reafirmamos aquí para no depender del orden del wire.
  // TODO: algoritmo de recomendación real (match por nivel, dimensiones
  // débiles, sprint del team, etc).
  const recommended = useMemo(() => {
    return (cases ?? [])
      .filter((c) => c.userStatus !== "completed")
      .sort((a, b) => {
        if (a.userStatus === "in_progress" && b.userStatus !== "in_progress") return -1;
        if (b.userStatus === "in_progress" && a.userStatus !== "in_progress") return 1;
        return 0;
      })
      .slice(0, 8);
  }, [cases]);

  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8">
        {/* ============ HERO ============ */}
        {/* Jerarquía v2: eyebrow chip (org real) + display extrabold. */}
        <AppleReveal as="header" className="flex flex-none items-center gap-4 sm:gap-5">
          <Avatar initials={hero?.initials ?? "··"} size="lg" tone="accent" />
          <div className="min-w-0 flex-1">
            {hero?.org_name && (
              <AppleEyebrowChip className="mb-2">{hero.org_name}</AppleEyebrowChip>
            )}
            <h1 className="display display-tight m-0 ts-title-1 sm:ts-display text-[var(--text-primary)]">
              {hero?.first_name ? `Hi, ${hero.first_name}` : "Hi"}
            </h1>
            {hero?.job_title && (
              <p className="m-0 mt-1 ts-subhead font-medium text-[var(--text-secondary)]">
                {hero.job_title}
              </p>
            )}
          </div>
          <AppleButtonLink
            href="/casos"
            tone="primary"
            className="hidden h-10 justify-center px-5 sm:inline-flex"
          >
            View catalog
          </AppleButtonLink>
        </AppleReveal>

        {/* ============ TOP 2 cols: Performance + Leaderboard ============ */}
        <AppleReveal
          as="section"
          delay={0.06}
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          {/* ---- Mi performance ---- */}
          <Card>
            <CardHeader
              eyebrow="My performance"
              cta={{ label: "View report", href: "/reportes" }}
            />
            {perf && perf.casesCompleted > 0 && perf.band ? (
              <div className="mt-4 flex items-center gap-3">
                <BandPill band={perf.band} />
                <span className="ts-footnote font-medium text-[var(--text-tertiary)]">
                  average across {perf.casesCompleted}{" "}
                  {perf.casesCompleted === 1 ? "case" : "cases"}
                </span>
              </div>
            ) : (
              <p className="mt-4 ts-subhead font-medium text-[var(--text-secondary)]">
                Complete your first case to see your performance here.
              </p>
            )}

            {/* Barras chunky v2: h-2 redondeadas, track surface-3, fill accent. */}
            <div className="mt-5 flex flex-col gap-2.5">
              {(perf?.dimensions ?? []).map((d) => (
                <div key={d.id} className="flex items-center gap-3">
                  <span className="w-28 flex-none truncate ts-footnote font-bold text-[var(--text-secondary)]">
                    {d.label}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-3)]">
                    <div
                      className="accent-bg h-full rounded-full"
                      style={{ width: `${(d.score / 10) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 flex-none text-right ts-caption-1 font-bold tabular-nums text-[var(--text-primary)]">
                    {d.score.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* ---- Leaderboard ---- */}
          <Card>
            <CardHeader eyebrow="Team leaderboard" />

            {leaderboard.length === 0 ? (
              <p className="mt-4 ts-subhead font-medium text-[var(--text-secondary)]">
                No team results yet.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-1.5">
                {/* Barras chunky por banda (tokens --band-*-bar, mapeo canónico
                    score→banda de config.ts). Sin reports = track vacío + "—". */}
                {leaderboard.map((entry, i) => (
                  <li
                    key={entry.name}
                    className={`flex items-center gap-3 rounded-[var(--radius-md)] px-2.5 py-2 ${
                      entry.is_current_user ? "bg-[var(--accent-soft)]" : ""
                    }`}
                  >
                    <span
                      className={`w-4 flex-none text-center ts-caption-1 font-extrabold tabular-nums ${
                        entry.is_current_user
                          ? "text-[var(--accent)]"
                          : "text-[var(--text-tertiary)]"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <Avatar initials={entry.initials} size="sm" />
                    <span
                      className={`min-w-0 flex-1 truncate ts-footnote ${
                        entry.is_current_user
                          ? "font-extrabold text-[var(--text-primary)]"
                          : "font-semibold text-[var(--text-secondary)]"
                      }`}
                    >
                      {entry.name}
                      {entry.is_current_user && (
                        <span className="accent-bg ml-1.5 inline-flex items-center rounded-full px-1.5 py-0.5 align-middle ts-caption-2 font-extrabold text-white">
                          You
                        </span>
                      )}
                    </span>
                    <div className="h-2 w-16 flex-none overflow-hidden rounded-full bg-[var(--surface-3)] sm:w-32">
                      {entry.has_reports && (
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(entry.score / 10) * 100}%`,
                            background: BAND_BAR[bandFromScore100(entry.score * 10)],
                          }}
                        />
                      )}
                    </div>
                    <span className="w-8 flex-none text-right ts-footnote font-extrabold tabular-nums text-[var(--text-primary)]">
                      {entry.has_reports ? entry.score.toFixed(1) : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </AppleReveal>

        {/* ============ BOTTOM: Casos para ti — 4 cols × 2 filas ============ */}
        <AppleReveal as="section" delay={0.12}>
          <CardHeader
            eyebrow="Cases for you"
            cta={{ label: "View all", href: "/casos" }}
          />

          {casesError ? (
            <div className="mt-4">
              <AppleErrorState
                title="We could not load your cases"
                body={casesError}
                onAction={loadCases}
              />
            </div>
          ) : cases === null ? (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <CaseCardSkeleton key={i} />
              ))}
            </div>
          ) : recommended.length === 0 ? (
            <div className="mt-4">
              {cases.length === 0 ? (
                <AppleEmptyState
                  title="No cases available yet"
                  description="Your organization has no active cases yet. The first one will show up here as soon as it publishes."
                />
              ) : (
                <AppleEmptyState
                  title="You are all caught up"
                  description="You completed every available case. Review your results in the catalog while new cases arrive."
                  action={
                    <AppleButtonLink href="/casos" tone="secondary">
                      View catalog
                    </AppleButtonLink>
                  }
                />
              )}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recommended.map((item) => (
                <CaseCard key={item.slug} item={item} />
              ))}
            </div>
          )}
        </AppleReveal>
      </div>
    </main>
  );
}
