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
// MOCK USER + PERFORMANCE + LEADERBOARD
// ============================================================================

const USER = {
  fullName: "Ana López",
  initials: "AL",
  jobTitle: "Growth Manager",
  orgName: "Acme LATAM",
  currentLevelLabel: "Automatización",
};

// Scores en escala 0-10 (decisión Pablo 2026-05-23 — consistente con /reportes).
const PERFORMANCE = {
  averageBand: "M" as Band,
  averageScore: 7.1,
  casesCompleted: 4,
  dimensions: [
    { id: "contexto", label: "Contexto", score: 8.2 },
    { id: "datos", label: "Datos", score: 6.5 },
    { id: "ejecucion_ia", label: "Ejecución IA", score: 7.1 },
    { id: "validacion", label: "Validación", score: 5.8 },
    { id: "juicio", label: "Juicio", score: 7.9 },
    { id: "impacto", label: "Impacto", score: 6.8 },
  ],
};

interface LeaderboardEntry {
  name: string;
  initials: string;
  score: number; // 0-10 (1 decimal)
  isCurrentUser?: boolean;
}

const LEADERBOARD: LeaderboardEntry[] = [
  { name: "Mariana Cortés", initials: "MC", score: 9.2 },
  { name: "Juan Esparza", initials: "JE", score: 8.7 },
  { name: "Ana López", initials: "AL", score: 7.8, isCurrentUser: true },
  { name: "Pedro Ruiz", initials: "PR", score: 7.4 },
  { name: "Sofía Martín", initials: "SM", score: 6.9 },
];

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
      className={`inline-flex items-center rounded-md px-2 py-0.5 ts-caption-1 font-semibold ${cls}`}
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

  useEffect(() => {
    loadCases();
  }, [loadCases]);

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
          <Avatar initials={USER.initials} size="lg" ring />
          <div className="min-w-0 flex-1">
            <h1 className="display display-tight text-[var(--text-primary)] ts-title-2 sm:ts-title-1 leading-tight">
              Hola, {USER.fullName.split(" ")[0]}
            </h1>
            <p className="mt-1 ts-subhead text-[var(--text-secondary)]">
              {USER.jobTitle} · {USER.orgName} · Nivel actual:{" "}
              <span className="text-[var(--text-primary)] font-medium">
                {USER.currentLevelLabel}
              </span>
            </p>
          </div>
          <Link
            href="/casos"
            className="hidden sm:inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] accent-bg px-5 ts-subhead font-medium text-white hover:opacity-95 transition-opacity"
          >
            Ver catálogo
          </Link>
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
            <div className="mt-3 flex items-baseline gap-3">
              <BandPill band={PERFORMANCE.averageBand} />
              <span className="ts-caption-1 text-[var(--text-tertiary)]">
                promedio sobre {PERFORMANCE.casesCompleted} casos
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {PERFORMANCE.dimensions.map((d) => (
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

            <ul className="mt-3 flex flex-col gap-1">
              {LEADERBOARD.map((entry, i) => (
                <li
                  key={entry.name}
                  className={`flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-1.5 ${
                    entry.isCurrentUser ? "bg-[var(--accent-soft)]" : ""
                  }`}
                >
                  <span
                    className={`w-[16px] flex-none text-center ts-caption-1 font-semibold tabular-nums ${
                      entry.isCurrentUser
                        ? "text-[var(--accent)]"
                        : "text-[var(--text-tertiary)]"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <Avatar initials={entry.initials} size="sm" />
                  <span
                    className={`flex-1 truncate ts-footnote ${
                      entry.isCurrentUser
                        ? "font-semibold text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {entry.name}
                    {entry.isCurrentUser && (
                      <span className="ml-1.5 ts-caption-2 text-[var(--accent)]">
                        Tú
                      </span>
                    )}
                  </span>
                  <span className="ts-footnote font-semibold tabular-nums text-[var(--text-primary)]">
                    {entry.score.toFixed(1)}
                  </span>
                </li>
              ))}
            </ul>
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
