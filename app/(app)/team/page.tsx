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
  AppleDivider,
  AppleEmptyState,
  AppleErrorState,
  AppleReveal,
} from "@/components/simulador/apple";
import { CaseCard } from "@/components/simulador/CaseCard";
import { CaseCardSkeleton } from "@/components/simulador/CaseCardSkeleton";
import {
  BAND_LABEL,
  type Band,
  type CaseCatalogItem,
} from "@/lib/simulador/case-catalog";

// ============================================================================
// Datos reales — /api/me/{profile,report-summary,team-leaderboard} (F4)
// ============================================================================

const DIMENSION_LABEL: Record<string, string> = {
  contexto: "Contexto",
  datos: "Datos",
  ejecucion_ia: "Ejecución IA",
  validacion: "Validación",
  juicio: "Juicio",
  impacto: "Impacto",
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

function CardHeader({
  eyebrow,
  cta,
}: {
  eyebrow: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
        {eyebrow}
      </span>
      {cta && (
        <Link
          href={cta.href}
          className="ts-caption-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
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
  ring = false,
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  ring?: boolean;
}) {
  const dimensions =
    size === "lg"
      ? "h-14 w-14 ts-headline"
      : size === "md"
        ? "h-9 w-9 ts-footnote"
        : "h-7 w-7 ts-caption-1";
  return (
    <div
      className={`${dimensions} flex items-center justify-center rounded-full bg-[var(--surface-2)] font-semibold text-[var(--text-primary)] tabular-nums ${
        ring ? "ring-2 ring-[var(--accent)]" : ""
      }`}
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
      className={`inline-flex items-center rounded-[var(--radius-sm)] px-2 py-0.5 ts-caption-1 font-semibold ${cls}`}
    >
      Banda {BAND_LABEL[band]}
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
      setCasesError(err instanceof Error ? err.message : "Error inesperado.");
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
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
        {/* ============ HERO ============ */}
        <AppleReveal as="header" className="flex flex-none items-center gap-4">
          <Avatar initials={hero?.initials ?? "··"} size="lg" ring />
          <div className="min-w-0 flex-1">
            <h1 className="display display-tight text-[var(--text-primary)] ts-title-2 sm:ts-title-1 leading-tight">
              {hero?.first_name ? `Hola, ${hero.first_name}` : "Hola"}
            </h1>
            <p className="mt-1 ts-subhead text-[var(--text-secondary)]">
              {[hero?.job_title, hero?.org_name].filter(Boolean).join(" · ")}
            </p>
          </div>
          <AppleButtonLink
            href="/casos"
            tone="primary"
            className="hidden h-10 justify-center px-5 sm:inline-flex"
          >
            Ver catálogo
          </AppleButtonLink>
        </AppleReveal>

        <AppleDivider />

        {/* ============ TOP 2 cols: Performance + Leaderboard ============ */}
        <AppleReveal
          as="section"
          delay={0.06}
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          {/* ---- Mi performance ---- */}
          <Card>
            <CardHeader
              eyebrow="Mi performance"
              cta={{ label: "Ver reporte", href: "/reportes" }}
            />
            {perf && perf.casesCompleted > 0 && perf.band ? (
              <div className="mt-3 flex items-baseline gap-3">
                <BandPill band={perf.band} />
                <span className="ts-caption-1 text-[var(--text-tertiary)]">
                  promedio sobre {perf.casesCompleted}{" "}
                  {perf.casesCompleted === 1 ? "caso" : "casos"}
                </span>
              </div>
            ) : (
              <p className="mt-3 ts-subhead text-[var(--text-secondary)]">
                Juega tu primer caso para ver tu desempeño aquí.
              </p>
            )}

            <div className="mt-4 flex flex-col gap-2">
              {(perf?.dimensions ?? []).map((d) => (
                <div key={d.id} className="flex items-center gap-3">
                  <span className="w-[100px] flex-none truncate ts-footnote text-[var(--text-secondary)]">
                    {d.label}
                  </span>
                  <div className="flex-1 h-[6px] rounded-full bg-[var(--surface-2)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${(d.score / 10) * 100}%` }}
                    />
                  </div>
                  <span className="w-[32px] flex-none text-right ts-caption-1 font-medium tabular-nums text-[var(--text-primary)]">
                    {d.score.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* ---- Leaderboard ---- */}
          <Card>
            <CardHeader eyebrow="Leaderboard del equipo" />

            {leaderboard.length === 0 ? (
              <p className="mt-3 ts-subhead text-[var(--text-secondary)]">
                Aún no hay resultados del equipo.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-1">
                {leaderboard.map((entry, i) => (
                  <li
                    key={entry.name}
                    className={`flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-1.5 ${
                      entry.is_current_user ? "bg-[var(--accent-soft)]" : ""
                    }`}
                  >
                    <span
                      className={`w-[16px] flex-none text-center ts-caption-1 font-semibold tabular-nums ${
                        entry.is_current_user
                          ? "text-[var(--accent)]"
                          : "text-[var(--text-tertiary)]"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <Avatar initials={entry.initials} size="sm" />
                    <span
                      className={`flex-1 truncate ts-footnote ${
                        entry.is_current_user
                          ? "font-semibold text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)]"
                      }`}
                    >
                      {entry.name}
                      {entry.is_current_user && (
                        <span className="ml-1.5 ts-caption-2 text-[var(--accent)]">
                          Tú
                        </span>
                      )}
                    </span>
                    <span className="ts-footnote font-semibold tabular-nums text-[var(--text-primary)]">
                      {entry.has_reports ? entry.score.toFixed(1) : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </AppleReveal>

        <AppleDivider />

        {/* ============ BOTTOM: Casos para ti — 4 cols × 2 filas ============ */}
        <AppleReveal as="section" delay={0.12}>
          <div className="flex items-center justify-between">
            <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Casos para ti
            </span>
            <Link
              href="/casos"
              className="ts-caption-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Ver todos →
            </Link>
          </div>

          {casesError ? (
            <div className="mt-3">
              <AppleErrorState
                title="No pudimos cargar tus casos"
                body={casesError}
                onAction={loadCases}
              />
            </div>
          ) : cases === null ? (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <CaseCardSkeleton key={i} />
              ))}
            </div>
          ) : recommended.length === 0 ? (
            <div className="mt-3">
              {cases.length === 0 ? (
                <AppleEmptyState
                  title="Aún no hay casos disponibles"
                  description="Tu organización todavía no tiene casos activos. En cuanto se publique el primero lo verás aquí."
                />
              ) : (
                <AppleEmptyState
                  title="Estás al día"
                  description="Completaste todos los casos disponibles. Revisa tus resultados en el catálogo mientras llegan casos nuevos."
                  action={
                    <AppleButtonLink href="/casos" tone="secondary">
                      Ver catálogo
                    </AppleButtonLink>
                  }
                />
              )}
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
