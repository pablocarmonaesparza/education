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
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AppleBadge,
  AppleEmptyState,
  AppleErrorState,
  AppleReveal,
  AppleSkeleton,
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
  contexto: "Contexto",
  datos: "Datos",
  ejecucion_ia: "Ejecución IA",
  validacion: "Validación",
  juicio: "Juicio",
  impacto: "Impacto",
};

function StatusChip({ status }: { status: CatalogItem["status"] }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 ts-caption-1 font-medium text-[var(--band-a-text)]">
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
        Completado
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 ts-caption-1 font-medium text-[var(--accent)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
        En curso
      </span>
    );
  }
  return null;
}

function ModuleCard({ item }: { item: CatalogItem }) {
  return (
    <Link
      href={`/practica/${encodeURIComponent(item.slug)}`}
      className="group flex flex-col rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_var(--shadow)]"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {item.is_new && item.status === "not_started" ? (
            <AppleBadge tone="accent">Nuevo</AppleBadge>
          ) : (
            <span className="ts-caption-1 text-[var(--text-tertiary)]">
              N{item.level}
            </span>
          )}
          <span className="ts-caption-1 text-[var(--text-tertiary)]">
            {item.minutes} min
          </span>
        </div>
        <StatusChip status={item.status} />
      </div>
      <h3 className="mt-3 ts-headline font-semibold leading-[1.3] tracking-tight text-[var(--text-primary)]">
        {item.title}
      </h3>
      <div className="mt-3 flex items-center gap-1.5 ts-caption-1 text-[var(--text-tertiary)]">
        {item.topic ? (
          <span className="truncate">{item.topic}</span>
        ) : (
          <span>{DIMENSION_LABEL[item.dimension ?? ""] ?? "Práctica"}</span>
        )}
      </div>
    </Link>
  );
}

function SectionTitle({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
        {children}
      </span>
      {hint && (
        <span className="ts-caption-1 text-[var(--text-tertiary)]">{hint}</span>
      )}
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
      setError(e instanceof Error ? e.message : "Error inesperado.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="surface-canvas min-h-[calc(100vh-3.5rem)] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8">
        {/* ============ HEADER ============ */}
        <AppleReveal as="header">
          <h1 className="display display-tight text-[var(--text-primary)] ts-title-1 sm:ts-display">
            Aprender
          </h1>
          <p className="mt-2 ts-subhead text-[var(--text-secondary)] leading-[1.55]">
            La inteligencia artificial cambia todas las semanas. Aquí practicas
            lo nuevo antes de usarlo en tu trabajo, y cierras los gaps que tu
            diagnóstico encontró.
          </p>
        </AppleReveal>

        {error ? (
          <AppleErrorState
            title="No pudimos cargar tu capacitación"
            body={error}
            actionLabel="Reintentar"
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
            {/* ============ Actualizaciones de IA (módulos de tema) ============ */}
            <AppleReveal as="section" delay={0.04}>
              <SectionTitle hint="el motor publica módulos nuevos con cada update relevante">
                Actualizaciones de IA
              </SectionTitle>
              {modules.length === 0 ? (
                <div className="mt-3">
                  <AppleEmptyState
                    title="Aún no hay módulos publicados"
                    description="El primer módulo de actualización está en camino."
                  />
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {modules.map((m) => (
                    <ModuleCard key={m.slug} item={m} />
                  ))}
                </div>
              )}
            </AppleReveal>

            {/* ============ Tu práctica dirigida (remedial por gaps) ============ */}
            <AppleReveal as="section" delay={0.08}>
              <SectionTitle hint="desbloqueada por tu diagnóstico">
                Tu práctica dirigida
              </SectionTitle>
              {remedial.length === 0 ? (
                <p className="mt-3 ts-subhead text-[var(--text-secondary)]">
                  Cuando completes un caso, tu evaluación desbloquea práctica
                  específica para tus gaps.{" "}
                  <Link
                    href="/casos"
                    className="font-medium text-[var(--accent)] hover:underline"
                  >
                    Juega tu primer caso
                  </Link>
                  .
                </p>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {remedial.map((m) => (
                    <ModuleCard key={m.slug} item={m} />
                  ))}
                </div>
              )}
            </AppleReveal>
          </>
        )}
      </div>
    </main>
  );
}
