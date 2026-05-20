"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import { SurfaceNav } from "@/components/simulador/SurfaceNav";

type JudgeHealthResponse = {
  window_days: number;
  summary: {
    evaluation_runs: number;
    review_required: number;
    open_review: number;
    overdue_review: number;
    high_risk_reviews: number;
    recommendations: Record<string, number>;
    models: Record<string, number>;
    prompt_versions: Record<string, number>;
    risk_events: { total: number; high: number; medium: number; low: number };
  };
  recent_runs: Array<{
    id: string;
    session_id: string;
    judge_model: string;
    prompt_version: string;
    recommendation: string | null;
    risk_events_count: number;
    high_risk_count: number;
    created_at: string;
  }>;
  review_queue: Array<{
    id: string;
    status: string;
    due_at: string | null;
    required_review_count: number;
    completed_review_count: number;
    triggered_by: string;
    created_at: string;
  }>;
};

export default function AdminJudgeHealthPage() {
  const [data, setData] = useState<JudgeHealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/judge-health", { cache: "no-store" });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? `Error ${res.status}.`);
      }
      setData((await res.json()) as JudgeHealthResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const modelRows = useMemo(
    () => Object.entries(data?.summary.models ?? {}),
    [data],
  );
  const recommendationRows = useMemo(
    () => Object.entries(data?.summary.recommendations ?? {}),
    [data],
  );

  return (
    <>
      <SurfaceNav />
      <main className="surface-canvas min-h-screen pb-24">
        <section className="reading-col px-6 pt-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="eyebrow">Itera staff · evaluación</div>
            <h1 className="display mt-4 text-[36px] text-[var(--text-primary)]">
              Judge health
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.55] text-[var(--text-secondary)]">
              Lectura operacional del judge y la cola humana. El objetivo es
              detectar drift, overload o riesgos altos sin revisar tablas.
            </p>
            <AdminLinks />
          </motion.div>

          {error && <ErrorBox message={error} />}

          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Metric label="Runs" value={data?.summary.evaluation_runs ?? 0} />
            <Metric
              label="Review req."
              value={data?.summary.review_required ?? 0}
            />
            <Metric label="Open review" value={data?.summary.open_review ?? 0} />
            <Metric
              label="Overdue"
              value={data?.summary.overdue_review ?? 0}
              danger={(data?.summary.overdue_review ?? 0) > 0}
            />
            <Metric
              label="Risk high"
              value={data?.summary.risk_events.high ?? 0}
              danger={(data?.summary.risk_events.high ?? 0) > 0}
            />
          </div>

          <div className="mt-5">
            <Button
              radius="md"
              size="sm"
              className="bg-[var(--surface-2)] text-[var(--text-primary)]"
              onPress={load}
            >
              Actualizar
            </Button>
          </div>

          {data === null && !error && (
            <div className="mt-12 text-[14px] text-[var(--text-secondary)]">
              Cargando health…
            </div>
          )}

          {data && (
            <>
              <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Breakdown title="Modelos" rows={modelRows} />
                <Breakdown title="Recomendaciones" rows={recommendationRows} />
              </section>

              <section className="mt-8 card-apple bg-[var(--surface)] p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="eyebrow">Runs recientes</div>
                    <h2 className="mt-2 text-[18px] font-semibold text-[var(--text-primary)]">
                      Últimas evaluaciones
                    </h2>
                  </div>
                  <span className="text-[12px] text-[var(--text-tertiary)]">
                    ventana {data.window_days} días
                  </span>
                </div>
                <div className="mt-5 divide-y divide-[var(--hairline)]">
                  {data.recent_runs.map((run) => (
                    <div
                      key={run.id}
                      className="grid grid-cols-1 gap-2 py-4 text-[13px] lg:grid-cols-[1.5fr_1fr_1fr_1fr]"
                    >
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">
                          {run.judge_model}
                        </div>
                        <div className="mono text-[11px] text-[var(--text-tertiary)]">
                          {run.id.slice(0, 8)} · sesión{" "}
                          {run.session_id.slice(0, 8)}
                        </div>
                      </div>
                      <div className="capitalize text-[var(--text-secondary)]">
                        {run.recommendation ?? "sin recomendación"}
                      </div>
                      <div className="text-[var(--text-secondary)]">
                        {run.high_risk_count} high · {run.risk_events_count} total
                      </div>
                      <div className="text-[var(--text-tertiary)]">
                        {formatDateTime(run.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-8 card-apple bg-[var(--surface)] p-6">
                <div className="eyebrow">Cola humana abierta</div>
                <div className="mt-5 space-y-3">
                  {data.review_queue.length === 0 ? (
                    <p className="text-[14px] text-[var(--text-secondary)]">
                      No hay items abiertos.
                    </p>
                  ) : (
                    data.review_queue.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-[var(--surface-2)] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="text-[14px] font-medium text-[var(--text-primary)]">
                              {item.triggered_by}
                            </div>
                            <div className="mono mt-1 text-[11px] text-[var(--text-tertiary)]">
                              {item.id.slice(0, 8)}
                            </div>
                          </div>
                          <div className="text-right text-[12px] text-[var(--text-secondary)]">
                            {item.completed_review_count}/
                            {item.required_review_count} firmas ·{" "}
                            {item.due_at ? formatDateTime(item.due_at) : "sin SLA"}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </>
          )}
        </section>
      </main>
    </>
  );
}

function AdminLinks() {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {[
        ["/admin/review", "Review"],
        ["/admin/leads", "Leads"],
        ["/admin/orgs", "Orgs"],
        ["/admin/audit-log", "Audit log"],
      ].map(([href, label]) => (
        <a
          key={href}
          href={href}
          className="rounded-full bg-[var(--surface-2)] px-4 py-2 text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
        >
          {label}
        </a>
      ))}
    </div>
  );
}

function Metric({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: number | string;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        danger
          ? "border-[var(--band-b-text)]/20 bg-[var(--band-b-bg)]"
          : "border-[var(--hairline)] bg-[var(--surface)]"
      }`}
    >
      <div className="eyebrow">{label}</div>
      <div className="mt-2 mono text-[22px] font-semibold text-[var(--text-primary)]">
        {value}
      </div>
    </div>
  );
}

function Breakdown({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, number]>;
}) {
  return (
    <div className="card-apple bg-[var(--surface)] p-6">
      <div className="eyebrow">{title}</div>
      <div className="mt-5 space-y-3">
        {rows.length === 0 ? (
          <p className="text-[14px] text-[var(--text-secondary)]">Sin datos.</p>
        ) : (
          rows.map(([label, count]) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <span className="text-[14px] text-[var(--text-primary)]">
                {label}
              </span>
              <span className="mono text-[14px] text-[var(--text-secondary)]">
                {count}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mt-8 rounded-xl bg-[var(--band-b-bg)] p-4 text-[14px] text-[var(--band-b-text)]">
      {message}
    </div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
