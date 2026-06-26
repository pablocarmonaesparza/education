"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AppleButton } from "@/components/simulador/apple";
import { ErrorBox, formatDateTime } from "../shared";

type AuditItem = {
  id: string;
  entity: string;
  entity_id: string | null;
  action: string;
  actor_id: string | null;
  before_state: unknown;
  after_state: unknown;
  occurred_at: string;
  actor: {
    email: string;
    full_name: string | null;
  } | null;
};

type AuditResponse = {
  items: AuditItem[];
  summary: {
    total: number;
    by_entity: Record<string, number>;
    by_action: Record<string, number>;
  };
};

export default function AdminAuditLogPage() {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [entity, setEntity] = useState("all");
  const [action, setAction] = useState("all");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (entity !== "all") qs.set("entity", entity);
      if (action !== "all") qs.set("action", action);
      const suffix = qs.toString() ? `?${qs.toString()}` : "";
      const res = await fetch(`/api/admin/audit-log${suffix}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? `Error ${res.status}.`);
      }
      setData((await res.json()) as AuditResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    }
  }, [action, entity]);

  useEffect(() => {
    load();
  }, [load]);

  const entityOptions = useMemo(
    () => ["all", ...Object.keys(data?.summary.by_entity ?? {})],
    [data],
  );
  const actionOptions = useMemo(
    () => ["all", ...Object.keys(data?.summary.by_action ?? {})],
    [data],
  );

  return (
    <>
      <main className="surface-canvas min-h-screen pb-24">
        <section className="reading-col px-6 pt-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="eyebrow">Itera staff · auditoría</div>
            <h1 className="display mt-4 ts-display text-[var(--text-primary)]">
              Audit log
            </h1>
            <p className="mt-4 max-w-2xl ts-body leading-[1.55] text-[var(--text-secondary)]">
              Cambios privilegiados y eventos auditables del simulador. Úsalo
              para investigar quién tocó qué y cuándo.
            </p>
          </motion.div>

          {error && <ErrorBox message={error} />}

          <div className="mt-8 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <SelectBox
              label="Entity"
              value={entity}
              options={entityOptions}
              onChange={setEntity}
            />
            <SelectBox
              label="Action"
              value={action}
              options={actionOptions}
              onChange={setAction}
            />
            <div className="flex items-end">
              <AppleButton
                tone="secondary"
                size="sm"
                className="bg-[var(--surface-2)] text-[var(--text-primary)]"
                onPress={load}
              >
                Actualizar
              </AppleButton>
            </div>
          </div>

          {data === null && !error && (
            <div className="mt-12 ts-callout text-[var(--text-secondary)]">
              Cargando audit log…
            </div>
          )}

          {data !== null && data.items.length === 0 && (
            <div className="mt-12 rounded-2xl bg-[var(--surface)] p-8 ts-callout text-[var(--text-secondary)]">
              No hay eventos con esos filtros.
            </div>
          )}

          <div className="mt-8 space-y-4">
            {data?.items.map((item) => (
              <AuditCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function AuditCard({ item }: { item: AuditItem }) {
  const diffPreview = preview(item.after_state ?? item.before_state);

  return (
    <div className="card-apple bg-[var(--surface)] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow">
            {item.entity} · {item.action}
          </div>
          <h2 className="mt-2 ts-headline font-semibold text-[var(--text-primary)]">
            {item.actor?.full_name ?? item.actor?.email ?? "system"}
          </h2>
          <p className="mt-1 mono ts-caption-1 text-[var(--text-tertiary)]">
            {item.entity_id ?? "sin entity_id"} · {formatDateTime(item.occurred_at)}
          </p>
        </div>
        <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 ts-footnote font-medium text-[var(--text-secondary)]">
          {item.actor ? "staff/user" : "system"}
        </span>
      </div>
      <pre className="mt-5 max-h-56 overflow-auto rounded-2xl bg-[var(--surface-2)] p-4 ts-footnote leading-[1.55] text-[var(--text-secondary)]">
        {diffPreview}
      </pre>
    </div>
  );
}

function SelectBox({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <div className="eyebrow mb-2">{label}</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 ts-callout text-[var(--text-primary)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function preview(value: unknown) {
  if (value === null || value === undefined) return "sin payload";
  try {
    return JSON.stringify(value, null, 2).slice(0, 3000);
  } catch {
    return "payload no serializable";
  }
}
