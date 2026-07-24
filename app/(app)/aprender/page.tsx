"use client";

/**
 * /aprender — la superficie de CAPACITACIÓN del empleado (pilar del negocio,
 * decisión Pablo 2026-07-06: la capacitación continua es la retención de la
 * suscripción, no un extra del diagnóstico).
 *
 * Dos ristras de GET /api/practica/catalog:
 *   1. Actualizaciones de IA — módulos de TEMA que el motor educativo genera
 *      (sale algo nuevo constantemente; chip "Nuevo" si <14 días).
 *   2. Tu práctica dirigida — los beats que el judge desbloqueó según tus
 *      gaps del diagnóstico.
 *
 * Cada card lleva al player educativo /practica/[slug] (ya productivo).
 *
 * REDISEÑO v2 (Duolingo-craft): los patrones vienen del hero mock de
 * LandingPage.tsx — card activa con gradient accent + labio, chips de estado
 * CONTINUE / ✓ DONE / READY, barra de progreso chunky con conteo real.
 * Cero datos inventados: el conteo sale de los statuses que ya trae el catálogo.
 */

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AppleBadge,
  AppleEmptyState,
  AppleErrorState,
  AppleIcon,
  AppleProgress,
  AppleReveal,
  AppleSkeleton,
  type AppleIconName,
} from "@/components/simulador/apple";

interface CatalogItem {
  slug: string;
  title: string;
  topic: string | null;
  dimension: string | null;
  level: number;
  minutes: number;
  published_at: string;
  is_new: boolean;
  status: "not_started" | "in_progress" | "completed";
}

const DIMENSION_LABEL: Record<string, string> = {
  contexto: "Context",
  datos: "Data handling",
  ejecucion_ia: "AI execution",
  validacion: "Verification",
  juicio: "Judgment",
  impacto: "Impact",
};

/**
 * Chip de estado estilo mock de la landing (CONTINUE / ✓ DONE / READY).
 * `ready` habilita el chip READY para not_started (práctica dirigida);
 * los módulos not_started ya comunican estado con el badge "New".
 */
function StatusChip({
  status,
  ready = false,
}: {
  status: CatalogItem["status"];
  ready?: boolean;
}) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 ts-caption-1 font-extrabold uppercase tracking-[0.6px] text-[var(--v2-green-dark)]">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Done
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1.5 ts-caption-1 font-extrabold uppercase tracking-[0.6px] text-[var(--accent)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
        Continue
      </span>
    );
  }
  if (ready) {
    return (
      <span className="ts-caption-1 font-extrabold uppercase tracking-[0.6px] text-[var(--accent)]">
        Ready
      </span>
    );
  }
  return null;
}

/**
 * ModuleCard v2 — el patrón de card del hero mock: tile de icono con estado
 * (accent en curso / verde completada / soft pendiente), borde + shadow-card,
 * y CTA con labio 3D solo en la card activa.
 */
function ModuleCard({
  item,
  icon,
  readyChip = false,
}: {
  item: CatalogItem;
  icon: AppleIconName;
  /** Chip READY en not_started (práctica dirigida; los módulos usan "New"). */
  readyChip?: boolean;
}) {
  const done = item.status === "completed";
  const active = item.status === "in_progress";

  // Borde con estado (verde completada / accent en curso), como los chips del mock.
  const borderTone = done
    ? "border-[var(--v2-green-border)]"
    : active
      ? "border-[var(--accent-border)]"
      : "border-[var(--border)]";

  const tileTone = done
    ? "bg-[var(--v2-green)] text-white"
    : active
      ? "accent-bg text-white"
      : "bg-[var(--accent-soft)] text-[var(--accent)]";

  return (
    <Link
      href={`/practica/${encodeURIComponent(item.slug)}`}
      className={`group flex flex-col rounded-[var(--radius-lg)] border ${borderTone} bg-[var(--surface)] p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-float`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] ${tileTone}`}
          aria-hidden
        >
          <AppleIcon name={done ? "check" : icon} size="md" stroke={2.3} />
        </span>
        {item.is_new && item.status === "not_started" && (
          <AppleBadge tone="accent" pill>
            New
          </AppleBadge>
        )}
      </div>

      <h3 className="mt-3 ts-headline font-extrabold leading-[1.3] tracking-tight text-[var(--text-primary)]">
        {item.title}
      </h3>
      <p className="mt-1.5 flex min-w-0 items-center gap-1 ts-footnote font-semibold text-[var(--text-tertiary)]">
        <span className="truncate">
          {item.topic ?? DIMENSION_LABEL[item.dimension ?? ""] ?? "Practice"}
        </span>
        <span className="shrink-0">
          · N{item.level} · {item.minutes} min
        </span>
      </p>

      {/* Pie con estado: la activa lleva el CTA con labio del mock. */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <StatusChip status={item.status} ready={readyChip} />
        {active && (
          <span className="rounded-[var(--radius-sm)] accent-bg px-4 py-2 ts-footnote font-extrabold tracking-[0.3px] text-white shadow-lip transition-[filter] group-hover:brightness-110">
            Continue
          </span>
        )}
      </div>
    </Link>
  );
}

/**
 * Card de práctica activa — el patrón "caso en curso" del hero mock de la
 * landing: banda gradient accent con labio + CTA blanco. Solo aparece si el
 * catálogo trae un beat REALMENTE in_progress (cero estados inventados).
 */
function ContinueHeroCard({ item }: { item: CatalogItem }) {
  return (
    <Link
      href={`/practica/${encodeURIComponent(item.slug)}`}
      className="group flex flex-col gap-4 rounded-[var(--radius-xl)] px-6 py-5 text-white shadow-lip transition-[filter] hover:brightness-105 sm:flex-row sm:items-center sm:justify-between"
      style={{
        background:
          "linear-gradient(135deg, var(--accent-gradient-from), var(--accent-strong))",
      }}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <span className="ts-caption-2 font-extrabold uppercase tracking-[0.8px] opacity-75">
          In progress · {item.minutes} min
        </span>
        <span className="ts-body-lg font-extrabold leading-[1.25]">
          {item.title}
        </span>
      </div>
      {/* Labio del chip blanco en --accent-deep (el extremo oscuro del gradiente
          donde vive): con --accent-lip se leía como "azul asomándose" bajo el
          blanco, no como el costado del propio chip. */}
      <span className="shrink-0 self-start rounded-[var(--radius-md)] bg-white px-5 py-2.5 ts-callout font-extrabold tracking-[0.3px] text-[var(--accent-strong)] shadow-[0_4px_0_var(--accent-deep)] transition-[transform,box-shadow] group-active:translate-y-[4px] group-active:shadow-none sm:self-auto">
        Continue
      </span>
    </Link>
  );
}

/** Eyebrow de sección v2: extrabold + tracking + accent (receta de la landing). */
function SectionTitle({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="ts-footnote font-extrabold uppercase tracking-[0.8px] text-[var(--accent)]">
        {children}
      </span>
      {hint && (
        <span className="ts-caption-1 text-[var(--text-tertiary)]">{hint}</span>
      )}
    </div>
  );
}

/** Barra chunky con conteo real (patrón "30/40" del mock, con datos de verdad). */
function CompletionBar({ items }: { items: CatalogItem[] }) {
  const done = items.filter((i) => i.status === "completed").length;
  return (
    <div className="mt-3 flex items-center gap-3">
      <AppleProgress
        value={done}
        maxValue={items.length}
        aria-label={`${done} of ${items.length} completed`}
        className="flex-1"
      />
      <span className="shrink-0 ts-footnote font-extrabold text-[var(--text-tertiary)]">
        {done} of {items.length} completed
      </span>
    </div>
  );
}

export default function AprenderPage() {
  const [modules, setModules] = useState<CatalogItem[] | null>(null);
  const [remedial, setRemedial] = useState<CatalogItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/practica/catalog", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `Error ${res.status}`);
      setModules(data.modules ?? []);
      setRemedial(data.remedial ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // La práctica activa real (si existe): primero módulos, luego dirigida.
  const activeItem = useMemo(
    () =>
      [...(modules ?? []), ...remedial].find(
        (i) => i.status === "in_progress",
      ) ?? null,
    [modules, remedial],
  );

  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8">
        {/* ============ HEADER ============ */}
        <AppleReveal as="header">
          <h1 className="display display-tight text-[var(--text-primary)] ts-display sm:ts-display-lg">
            Learn
          </h1>
          <p className="mt-2 max-w-[560px] ts-body font-medium text-[var(--text-secondary)] leading-[1.55]">
            AI changes every week. Here you practice what is new before you use
            it in your work, and you close the gaps your assessment found.
          </p>
        </AppleReveal>

        {error ? (
          <AppleErrorState
            title="We could not load your upskilling"
            body={error}
            actionLabel="Try again"
            onAction={load}
          />
        ) : modules === null ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <AppleSkeleton key={i} className="h-36 w-full rounded-[var(--radius-lg)]" />
            ))}
          </div>
        ) : (
          <>
            {/* ============ Práctica en curso (card activa del mock) ============ */}
            {activeItem && (
              <AppleReveal delay={0.02}>
                <ContinueHeroCard item={activeItem} />
              </AppleReveal>
            )}

            {/* ============ Actualizaciones de IA (módulos de tema) ============ */}
            <AppleReveal as="section" delay={0.04}>
              <SectionTitle hint="the engine publishes new practice with every AI update that matters">
                AI updates
              </SectionTitle>
              {modules.length === 0 ? (
                <div className="mt-3">
                  <AppleEmptyState
                    title="Nothing published yet"
                    description="The first update is on its way."
                  />
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {modules.map((m) => (
                    <ModuleCard key={m.slug} item={m} icon="sparkles" />
                  ))}
                </div>
              )}
            </AppleReveal>

            {/* ============ Tu práctica dirigida (remedial por gaps) ============ */}
            <AppleReveal as="section" delay={0.08}>
              <SectionTitle hint="unlocked by your assessment">
                Your targeted practice
              </SectionTitle>
              {remedial.length === 0 ? (
                <p className="mt-3 ts-subhead text-[var(--text-secondary)]">
                  When you complete a case, your results unlock practice built
                  for your specific gaps.{" "}
                  <Link
                    href="/casos"
                    className="font-bold text-[var(--accent)] hover:underline"
                  >
                    Start your first case
                  </Link>
                  .
                </p>
              ) : (
                <>
                  {/* Conteo REAL de completadas (regla 3: nada inventado). */}
                  <CompletionBar items={remedial} />
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {remedial.map((m) => (
                      <ModuleCard key={m.slug} item={m} icon="brain" readyChip />
                    ))}
                  </div>
                </>
              )}
            </AppleReveal>
          </>
        )}
      </div>
    </main>
  );
}
