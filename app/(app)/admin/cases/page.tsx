"use client";

/**
 * /admin/cases — consola staff de los casos del simulador.
 *
 * Une casos bespoke (generated_cases) + biblioteca global (case_templates)
 * con su lifecycle, dueño y uso. Lee /api/admin/cases.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AppleBadge, AppleButton, AppleTabs } from "@/components/simulador/apple";
import {
  AdminEmpty,
  AdminLoading,
  AdminMetric,
  ErrorBox,
  LifecyclePill,
  formatDate,
} from "../shared";

type CaseItem = {
  kind: "bespoke" | "global";
  id: string;
  case_id: string;
  title: string;
  level: string | null;
  status: string;
  version: number;
  owner: { id: string; name: string } | null;
  generation_method: string | null;
  sessions: number;
  completed_sessions: number;
  updated_at: string;
};

type CasesResponse = {
  items: CaseItem[];
  summary: {
    total: number;
    active: number;
    draft: number;
    archived: number;
    bespoke: number;
    global: number;
    sessions: number;
  };
};

type StatusFilter = "all" | "active" | "draft" | "archived";

const ROW_GRID =
  "md:grid md:grid-cols-[2.4fr_1.1fr_0.9fr_1.3fr_0.8fr] md:items-center md:gap-3";

export default function AdminCasesPage() {
  const [data, setData] = useState<CasesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/cases", { cache: "no-store" });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? `Error ${res.status}.`);
      }
      setData((await res.json()) as CasesResponse);
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
            <div className="eyebrow">Itera staff · casos</div>
            <h1 className="display mt-4 ts-display text-[var(--text-primary)]">
              Casos del simulador
            </h1>
            <p className="mt-4 max-w-2xl ts-body leading-[1.55] text-[var(--text-secondary)]">
              Todo lo que existe en la base: casos bespoke por empresa y la
              biblioteca global. Sirve para ver qué está activo, qué sigue en
              borrador y cuánto se ha jugado.
            </p>
          </motion.div>

          {error && <ErrorBox message={error} />}

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            <AdminMetric label="Total" value={s?.total ?? 0} compact />
            <AdminMetric label="Activos" value={s?.active ?? 0} compact />
            <AdminMetric label="Borradores" value={s?.draft ?? 0} compact />
            <AdminMetric label="Bespoke" value={s?.bespoke ?? 0} compact />
            <AdminMetric label="Global" value={s?.global ?? 0} compact />
            <AdminMetric label="Sesiones" value={s?.sessions ?? 0} compact />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <AppleTabs
              ariaLabel="Filtrar casos por estado"
              value={filter}
              onChange={(v) => setFilter(v as StatusFilter)}
              items={[
                { id: "all", label: "Todos", badge: s?.total ?? 0 },
                { id: "active", label: "Activos", badge: s?.active ?? 0 },
                { id: "draft", label: "Borradores", badge: s?.draft ?? 0 },
                { id: "archived", label: "Archivados", badge: s?.archived ?? 0 },
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

          {data === null && !error && <AdminLoading label="Cargando casos…" />}
          {data !== null && data.items.length === 0 && (
            <AdminEmpty
              label="No hay casos en la base todavía."
              hint="Genera un caso bespoke desde una org o seedea la biblioteca global."
            />
          )}
          {data !== null && data.items.length > 0 && visible.length === 0 && (
            <AdminLoading label="Ningún caso en este estado." />
          )}

          {visible.length > 0 && (
            <div className="mt-8 card-apple bg-[var(--surface)] p-2">
              <div className={`hidden px-4 py-3 ${ROW_GRID}`}>
                <ColLabel>Caso</ColLabel>
                <ColLabel>Dueño</ColLabel>
                <ColLabel>Estado</ColLabel>
                <ColLabel>Uso</ColLabel>
                <ColLabel align="right">Actualizado</ColLabel>
              </div>
              <div className="divide-y divide-[var(--hairline)]">
                {visible.map((c) => (
                  <CaseRow key={`${c.kind}-${c.id}`} item={c} />
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

function CaseRow({ item }: { item: CaseItem }) {
  const meta = [
    item.case_id,
    `v${item.version}`,
    item.level ?? null,
    item.generation_method ?? null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={`gap-2 px-4 py-4 ${ROW_GRID}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate ts-callout font-medium text-[var(--text-primary)]">
            {item.title}
          </span>
          <AppleBadge tone={item.kind === "bespoke" ? "accent" : "neutral"}>
            {item.kind === "bespoke" ? "bespoke" : "global"}
          </AppleBadge>
        </div>
        <div className="mono mt-1 truncate ts-caption-1 text-[var(--text-tertiary)]">
          {meta}
        </div>
      </div>

      <div className="mt-2 ts-subhead text-[var(--text-secondary)] md:mt-0">
        <span className="eyebrow mr-2 md:hidden">Dueño</span>
        {item.owner ? item.owner.name : "Global"}
      </div>

      <div className="mt-2 md:mt-0">
        <span className="eyebrow mr-2 md:hidden">Estado</span>
        <LifecyclePill status={item.status} />
      </div>

      <div className="mt-2 ts-subhead text-[var(--text-secondary)] md:mt-0">
        <span className="eyebrow mr-2 md:hidden">Uso</span>
        {item.sessions === 0 ? (
          <span className="text-[var(--text-tertiary)]">sin jugar</span>
        ) : (
          <>
            {item.sessions} jugadas · {item.completed_sessions} compl.
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
