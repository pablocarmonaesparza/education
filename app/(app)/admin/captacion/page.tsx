"use client";

/**
 * /admin/captacion — consola del pipeline propio de captación.
 *
 * Prospectos descubiertos de registros públicos (SECOP CO / DENUE MX),
 * calificados por Claude (score, válido, tamaño) con su señal de presupuesto.
 * Lee /api/admin/captacion, que consulta captacion/prospects.duckdb.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AppleBadge, AppleButton, AppleTabs } from "@/components/simulador/apple";
import {
  AdminEmpty,
  AdminLoading,
  AdminMetric,
  ErrorBox,
  QualifyPill,
} from "../shared";

type Prospect = {
  id: string;
  source: string;
  country: "CO" | "MX" | string;
  company_name: string;
  region: string | null;
  city: string | null;
  industry: string | null;
  size_bucket: string | null;
  signal_value: number | null;
  signal_note: string | null;
  score: number | null;
  qualifies: boolean | null;
  size_ok: boolean | null;
  reason: string | null;
  scored: boolean;
};

type CaptacionResponse = {
  available: boolean;
  items: Prospect[];
  summary: {
    total: number;
    co: number;
    mx: number;
    scored: number;
    valid: number;
    small: number;
  };
};

type Filter = "all" | "valid" | "scored" | "unscored";

const ROW_GRID =
  "md:grid md:grid-cols-[2.2fr_1.1fr_0.6fr_1fr_1.9fr] md:items-center md:gap-3";

// Moneda por país: hoy solo SECOP (CO) popula signal_value, pero atamos el
// formato al país para que una fuente MX futura no se etiquete como COP.
const MONEY = {
  CO: new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }),
  MX: new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }),
};

function formatSignal(country: string, value: number) {
  return (country === "MX" ? MONEY.MX : MONEY.CO).format(value);
}

export default function AdminCaptacionPage() {
  const [data, setData] = useState<CaptacionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/captacion", { cache: "no-store" });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? `Error ${res.status}.`);
      }
      setData((await res.json()) as CaptacionResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const items = data?.items ?? [];
    if (filter === "valid") return items.filter((p) => p.qualifies === true);
    if (filter === "scored") return items.filter((p) => p.scored);
    if (filter === "unscored") return items.filter((p) => !p.scored);
    return items;
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
            <div className="eyebrow">Itera staff · captación</div>
            <h1 className="display mt-4 ts-display text-[var(--text-primary)]">
              Captación de clientes
            </h1>
            <p className="mt-4 max-w-2xl ts-body leading-[1.55] text-[var(--text-secondary)]">
              Negocios pequeños descubiertos de registros públicos (SECOP
              Colombia, DENUE México) y calificados contra el perfil de Itera. La
              señal de presupuesto y el score deciden a quién contactar primero.
            </p>
          </motion.div>

          {error && <ErrorBox message={error} />}

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            <AdminMetric label="Prospectos" value={s?.total ?? 0} compact />
            <AdminMetric label="Colombia" value={s?.co ?? 0} compact />
            <AdminMetric label="México" value={s?.mx ?? 0} compact />
            <AdminMetric label="Calificados" value={s?.scored ?? 0} compact />
            <AdminMetric label="Válidos" value={s?.valid ?? 0} compact />
            <AdminMetric label="Pequeños" value={s?.small ?? 0} compact />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <AppleTabs
              ariaLabel="Filtrar prospectos"
              value={filter}
              onChange={(v) => setFilter(v as Filter)}
              items={[
                { id: "all", label: "Todos", badge: s?.total ?? 0 },
                { id: "valid", label: "Válidos", badge: s?.valid ?? 0 },
                { id: "scored", label: "Calificados", badge: s?.scored ?? 0 },
                {
                  id: "unscored",
                  label: "Sin calificar",
                  badge: (s?.total ?? 0) - (s?.scored ?? 0),
                },
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

          {data === null && !error && (
            <AdminLoading label="Cargando prospectos…" />
          )}
          {data !== null && data.items.length === 0 && (
            <AdminEmpty
              label="Aún no hay prospectos en la base."
              hint={
                <>
                  Corre el pipeline:{" "}
                  <span className="mono text-[var(--text-secondary)]">
                    ./captacion/run.sh
                  </span>{" "}
                  y califica con{" "}
                  <span className="mono text-[var(--text-secondary)]">
                    node captacion/qualify.mjs
                  </span>
                  .
                </>
              }
            />
          )}
          {data !== null && data.items.length > 0 && visible.length === 0 && (
            <AdminLoading label="Ningún prospecto en este filtro." />
          )}

          {visible.length > 0 && (
            <div className="mt-8 card-apple bg-[var(--surface)] p-2">
              <div className={`hidden px-4 py-3 ${ROW_GRID}`}>
                <ColLabel>Empresa</ColLabel>
                <ColLabel>Señal</ColLabel>
                <ColLabel align="right">Score</ColLabel>
                <ColLabel>Estado</ColLabel>
                <ColLabel>Por qué</ColLabel>
              </div>
              <div className="divide-y divide-[var(--hairline)]">
                {visible.map((p) => (
                  <ProspectRow key={p.id} item={p} />
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

function ProspectRow({ item }: { item: Prospect }) {
  const place = [item.city, item.region].filter(Boolean).join(" · ");
  const sourceLabel = item.country === "MX" ? "DENUE · MX" : "SECOP · CO";

  return (
    <div className={`gap-2 px-4 py-4 ${ROW_GRID}`}>
      {/* Empresa */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate ts-callout font-medium text-[var(--text-primary)]">
            {item.company_name}
          </span>
          <AppleBadge tone={item.country === "MX" ? "accent" : "neutral"}>
            {sourceLabel}
          </AppleBadge>
        </div>
        {place && (
          <div className="mono mt-1 truncate ts-caption-1 text-[var(--text-tertiary)]">
            {place}
          </div>
        )}
      </div>

      {/* Señal */}
      <div className="mt-2 ts-subhead text-[var(--text-secondary)] md:mt-0">
        <span className="eyebrow mr-2 md:hidden">Señal</span>
        {item.signal_value != null ? (
          <span className="tabular-nums">
            {formatSignal(item.country, item.signal_value)}
          </span>
        ) : (
          <span className="text-[var(--text-tertiary)]">
            {item.size_bucket ?? item.industry ?? "—"}
          </span>
        )}
      </div>

      {/* Score */}
      <div className="mt-2 md:mt-0 md:text-right">
        <span className="eyebrow mr-2 md:hidden">Score</span>
        {item.scored ? (
          <span className="mono ts-body font-semibold text-[var(--text-primary)]">
            {item.score ?? 0}
          </span>
        ) : (
          <span className="text-[var(--text-tertiary)]">—</span>
        )}
      </div>

      {/* Estado */}
      <div className="mt-2 md:mt-0">
        <span className="eyebrow mr-2 md:hidden">Estado</span>
        <QualifyPill qualifies={item.qualifies} scored={item.scored} />
      </div>

      {/* Por qué — contenido de decisión: text-secondary (≥4.5:1), no tertiary. */}
      <div className="mt-2 ts-footnote leading-[1.45] text-[var(--text-secondary)] md:mt-0">
        <span className="eyebrow mr-2 md:hidden">Por qué</span>
        {item.reason ?? "—"}
      </div>
    </div>
  );
}
