"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { motion } from "framer-motion";

type OrgItem = {
  id: string;
  name: string;
  industry: string | null;
  region: string | null;
  company_size_key: string | null;
  created_at: string;
  counts: {
    teams: number;
    members: number;
    sprints: number;
    active_sprints: number;
    sessions: number;
    completed_sessions: number;
    reports: number;
  };
  latest_sprint: {
    id: string;
    name: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
  } | null;
  subscription: {
    tier: string;
    status: string;
    seats: number;
    price_usd_total: number | null;
    current_period_end: string | null;
  } | null;
};

type OrgsResponse = {
  items: OrgItem[];
  summary: {
    organizations: number;
    active_sprints: number;
    seats: number;
    reports: number;
  };
};

export default function AdminOrgsPage() {
  const [data, setData] = useState<OrgsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/orgs", { cache: "no-store" });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error ?? `Error ${res.status}.`);
      }
      setData((await res.json()) as OrgsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      
      <main className="surface-canvas min-h-screen pb-24">
        <section className="reading-col px-6 pt-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="eyebrow">Itera staff · clientes</div>
            <h1 className="display mt-4 text-[36px] text-[var(--text-primary)]">
              Orgs y sprints
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.55] text-[var(--text-secondary)]">
              Estado operacional de cada organización: seats, billing, sesiones
              y reportes. Sirve para saber dónde intervenir antes de que el
              cliente pregunte.
            </p>
            <AdminLinks />
          </motion.div>

          {error && <ErrorBox message={error} />}

          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric label="Orgs" value={data?.summary.organizations ?? 0} />
            <Metric
              label="Sprints activos"
              value={data?.summary.active_sprints ?? 0}
            />
            <Metric label="Seats" value={data?.summary.seats ?? 0} />
            <Metric label="Reportes" value={data?.summary.reports ?? 0} />
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

          {data === null && !error && <Loading label="Cargando orgs…" />}
          {data !== null && data.items.length === 0 && (
            <Empty label="No hay organizaciones todavía." />
          )}

          <div className="mt-8 space-y-4">
            {data?.items.map((org) => (
              <OrgCard key={org.id} org={org} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function OrgCard({ org }: { org: OrgItem }) {
  const completionRate = rate(org.counts.completed_sessions, org.counts.sessions);

  return (
    <div className="card-apple bg-[var(--surface)] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="eyebrow">
            {org.region ?? "sin región"} · {org.company_size_key ?? "sin tamaño"}
          </div>
          <h2 className="mt-2 text-[20px] font-semibold text-[var(--text-primary)]">
            {org.name}
          </h2>
          <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
            {org.industry ?? "industria no definida"} · creada{" "}
            {formatDate(org.created_at)}
          </p>
        </div>
        <StatusPill status={org.subscription?.status ?? "sin billing"} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Metric label="Teams" value={org.counts.teams} compact />
        <Metric label="Miembros" value={org.counts.members} compact />
        <Metric label="Sprints" value={org.counts.sprints} compact />
        <Metric label="Sesiones" value={org.counts.sessions} compact />
        <Metric label="Completion" value={`${completionRate}%`} compact />
        <Metric label="Reportes" value={org.counts.reports} compact />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-2xl bg-[var(--surface-2)] p-4">
          <div className="eyebrow">Último sprint</div>
          <div className="mt-2 text-[14px] font-medium text-[var(--text-primary)]">
            {org.latest_sprint?.name ?? "Sin sprint"}
          </div>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
            {org.latest_sprint
              ? `${org.latest_sprint.status} · ${org.latest_sprint.start_date ?? "sin fecha"}`
              : "Crea o asigna sprint antes de invitar equipo."}
          </p>
        </div>
        <div className="rounded-2xl bg-[var(--surface-2)] p-4">
          <div className="eyebrow">Billing</div>
          <div className="mt-2 text-[14px] font-medium text-[var(--text-primary)]">
            {org.subscription?.tier ?? "Sin plan"}
          </div>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
            {org.subscription
              ? `${org.subscription.seats} seats · ${formatMoney(org.subscription.price_usd_total)}`
              : "Pendiente de checkout o carga manual."}
          </p>
        </div>
      </div>
    </div>
  );
}

function AdminLinks() {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {[
        ["/staff/review", "Review"],
        ["/staff/leads", "Leads"],
        ["/staff/judge-health", "Judge health"],
        ["/staff/audit-log", "Audit log"],
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
  compact = false,
}: {
  label: string;
  value: number | string;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-[var(--hairline)] bg-[var(--surface)] ${compact ? "p-3" : "p-4"}`}>
      <div className="eyebrow">{label}</div>
      <div className={`${compact ? "mt-1 text-[18px]" : "mt-2 text-[22px]"} mono font-semibold text-[var(--text-primary)]`}>
        {value}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const isHealthy = ["active", "trial"].includes(status);
  return (
    <span
      className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
        isHealthy
          ? "bg-[var(--band-a-bg)] text-[var(--band-a-text)]"
          : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
      }`}
    >
      {status}
    </span>
  );
}

function Loading({ label }: { label: string }) {
  return <div className="mt-12 text-[14px] text-[var(--text-secondary)]">{label}</div>;
}

function Empty({ label }: { label: string }) {
  return (
    <div className="mt-12 rounded-2xl bg-[var(--surface)] p-8 text-[14px] text-[var(--text-secondary)]">
      {label}
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

function rate(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
  });
}

function formatMoney(value: number | null) {
  if (value === null) return "sin precio";
  return `$${value.toLocaleString("en-US")} USD`;
}
