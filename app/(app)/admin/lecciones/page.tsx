"use client";

/**
 * /admin/lecciones — consola staff de las lecciones educativas del simulador.
 *
 * La unidad educativa viva es el practice beat (práctica corta dirigida a un
 * gap, por dimensión y nivel). No es el LMS legacy. Lee /api/admin/lecciones.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AppleButton, AppleTabs } from "@/components/simulador/apple";
import {
  AdminEmpty,
  AdminLoading,
  AdminMetric,
  ErrorBox,
  LifecyclePill,
  formatDate,
} from "../shared";

type LessonItem = {
  id: string;
  slug: string;
  title: string;
  status: string;
  dimension_key: string | null;
  level: number | null;
  career_key: string | null;
  target_gap_keys: string[];
  duration_estimate_min: number | null;
  unlocks: number;
  completed_unlocks: number;
  attempts: number;
  completed_attempts: number;
  completion_rate: number;
  updated_at: string;
};

type LessonsResponse = {
  items: LessonItem[];
  summary: {
    total: number;
    active: number;
    draft: number;
    archived: number;
    total_unlocks: number;
    total_attempts: number;
    completed_attempts: number;
    completion_rate: number;
  };
};

type StatusFilter = "all" | "active" | "draft" | "archived";

const ROW_GRID =
  "md:grid md:grid-cols-[2.4fr_1fr_0.9fr_1.4fr_0.8fr] md:items-center md:gap-3";

export default function AdminLeccionesPage() {
  const [data, setData] = useState<LessonsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/lecciones", { cache: "no-store" });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? `Error ${res.status}.`);
      }
      setData((await res.json()) as LessonsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const items = data?.items ?? [];
    if (filter === "all") return items;
    return items.filter((i) => i.status === filter);
  }, [data, filter]);

  const s = data?.summary;

  return (
    <>
      <main className="surface-canvas min-h-screen pb-24">
        <section className="mx-auto w-full max-w-5xl px-6 pt-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="eyebrow">Itera staff · lecciones</div>
            <h1 className="display mt-4 ts-display text-[var(--text-primary)]">
              Lecciones educativas
            </h1>
            <p className="mt-4 max-w-2xl ts-body leading-[1.55] text-[var(--text-secondary)]">
              Los practice beats del simulador: práctica corta dirigida a un gap,
              por dimensión y nivel. Aquí ves cuáles están activos y cómo se están
              completando.
            </p>
          </motion.div>

          {error && <ErrorBox message={error} />}

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            <AdminMetric label="Total" value={s?.total ?? 0} compact />
            <AdminMetric label="Activas" value={s?.active ?? 0} compact />
            <AdminMetric label="Borradores" value={s?.draft ?? 0} compact />
            <AdminMetric label="Asignadas" value={s?.total_unlocks ?? 0} compact />
            <AdminMetric label="Intentos" value={s?.total_attempts ?? 0} compact />
            <AdminMetric
              label="Completion"
              value={`${s?.completion_rate ?? 0}%`}
              compact
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <AppleTabs
              ariaLabel="Filtrar lecciones por estado"
              value={filter}
              onChange={(v) => setFilter(v as StatusFilter)}
              items={[
                { id: "all", label: "Todas", badge: s?.total ?? 0 },
                { id: "active", label: "Activas", badge: s?.active ?? 0 },
                { id: "draft", label: "Borradores", badge: s?.draft ?? 0 },
                { id: "archived", label: "Archivadas", badge: s?.archived ?? 0 },
              ]}
            />
            <AppleButton
              tone="secondary"
              size="sm"
              className="bg-[var(--surface-2)] text-[var(--text-primary)]"
              onPress={load}
            >
              Actualizar
            </AppleButton>
          </div>

          {data === null && !error && <AdminLoading label="Cargando lecciones…" />}
          {data !== null && data.items.length === 0 && (
            <AdminEmpty
              label="No hay practice beats en la base todavía."
              hint="Crea practice beats dirigidos a los gaps de los casos activos."
            />
          )}
          {data !== null && data.items.length > 0 && visible.length === 0 && (
            <AdminLoading label="Ninguna lección en este estado." />
          )}

          {visible.length > 0 && (
            <div className="mt-8 card-apple bg-[var(--surface)] p-2">
              <div className={`hidden px-4 py-3 ${ROW_GRID}`}>
                <ColLabel>Lección</ColLabel>
                <ColLabel>Dimensión</ColLabel>
                <ColLabel>Estado</ColLabel>
                <ColLabel>Uso</ColLabel>
                <ColLabel align="right">Actualizado</ColLabel>
              </div>
              <div className="divide-y divide-[var(--hairline)]">
                {visible.map((l) => (
                  <LessonRow key={l.id} item={l} />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function ColLabel({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <div
      className={`ts-caption-1 font-medium text-[var(--text-tertiary)] ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {children}
    </div>
  );
}

function LessonRow({ item }: { item: LessonItem }) {
  const meta = [
    item.slug,
    item.level !== null ? `N${item.level}` : null,
    item.career_key ?? null,
    item.duration_estimate_min ? `${item.duration_estimate_min} min` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={`gap-2 px-4 py-4 ${ROW_GRID}`}>
      <div className="min-w-0">
        <div className="truncate ts-callout font-medium text-[var(--text-primary)]">
          {item.title}
        </div>
        <div className="mono mt-1 truncate ts-caption-1 text-[var(--text-tertiary)]">
          {meta}
        </div>
      </div>

      <div className="mt-2 ts-subhead text-[var(--text-secondary)] md:mt-0">
        <span className="eyebrow mr-2 md:hidden">Dimensión</span>
        {item.dimension_key ?? "·"}
      </div>

      <div className="mt-2 md:mt-0">
        <span className="eyebrow mr-2 md:hidden">Estado</span>
        <LifecyclePill status={item.status} />
      </div>

      <div className="mt-2 ts-subhead text-[var(--text-secondary)] md:mt-0">
        <span className="eyebrow mr-2 md:hidden">Uso</span>
        {item.unlocks === 0 && item.attempts === 0 ? (
          <span className="text-[var(--text-tertiary)]">sin asignar</span>
        ) : (
          <>
            {item.unlocks} asign. · {item.completed_attempts}/{item.attempts}{" "}
            compl. · {item.completion_rate}%
          </>
        )}
      </div>

      <div className="mt-2 ts-footnote text-[var(--text-tertiary)] md:mt-0 md:text-right">
        <span className="eyebrow mr-2 md:hidden">Actualizado</span>
        {formatDate(item.updated_at)}
      </div>
    </div>
  );
}
