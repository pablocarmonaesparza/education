"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppleButton } from "@/components/simulador/apple";
import {
  AdminEmpty,
  AdminLoading,
  AdminMetric,
  BillingPill,
  ErrorBox,
  formatDate,
  formatMoney,
  rate,
} from "../shared";

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
            <h1 className="display ts-display text-[var(--text-primary)]">
              Orgs y sprints
            </h1>
            <p className="mt-4 max-w-2xl ts-body leading-[1.55] text-[var(--text-secondary)]">
              Estado operacional de cada organización: seats, billing, sesiones
              y reportes. Sirve para saber dónde intervenir antes de que el
              cliente pregunte.
            </p>
          </motion.div>

          {error && <ErrorBox message={error} />}

          <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <AdminMetric label="Orgs" value={data?.summary.organizations ?? 0} />
            <AdminMetric
              label="Sprints activos"
              value={data?.summary.active_sprints ?? 0}
            />
            <AdminMetric label="Seats" value={data?.summary.seats ?? 0} />
            <AdminMetric label="Reportes" value={data?.summary.reports ?? 0} />
          </div>

          <div className="mt-5">
            <AppleButton
              tone="secondary"
              size="sm"
              className="bg-[var(--surface-2)] text-[var(--text-primary)]"
              onPress={load}
            >
              Actualizar
            </AppleButton>
          </div>

          {data === null && !error && <AdminLoading label="Cargando orgs…" />}
          {data !== null && data.items.length === 0 && (
            <AdminEmpty label="No hay organizaciones todavía." />
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
          <h2 className="mt-2 ts-body-lg font-semibold text-[var(--text-primary)]">
            {org.name}
          </h2>
          <p className="mt-1 ts-subhead text-[var(--text-secondary)]">
            {org.industry ?? "industria no definida"} · creada{" "}
            {formatDate(org.created_at)}
          </p>
        </div>
        <BillingPill status={org.subscription?.status ?? "sin billing"} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
        <AdminMetric label="Teams" value={org.counts.teams} compact />
        <AdminMetric label="Miembros" value={org.counts.members} compact />
        <AdminMetric label="Sprints" value={org.counts.sprints} compact />
        <AdminMetric label="Sesiones" value={org.counts.sessions} compact />
        <AdminMetric label="Completion" value={`${completionRate}%`} compact />
        <AdminMetric label="Reportes" value={org.counts.reports} compact />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-2xl bg-[var(--surface-2)] p-4">
          <div className="eyebrow">Último sprint</div>
          <div className="mt-2 ts-callout font-medium text-[var(--text-primary)]">
            {org.latest_sprint?.name ?? "Sin sprint"}
          </div>
          <p className="mt-1 ts-footnote text-[var(--text-secondary)]">
            {org.latest_sprint
              ? `${org.latest_sprint.status} · ${org.latest_sprint.start_date ?? "sin fecha"}`
              : "Crea o asigna sprint antes de invitar equipo."}
          </p>
        </div>
        <div className="rounded-2xl bg-[var(--surface-2)] p-4">
          <div className="eyebrow">Billing</div>
          <div className="mt-2 ts-callout font-medium text-[var(--text-primary)]">
            {org.subscription?.tier ?? "Sin plan"}
          </div>
          <p className="mt-1 ts-footnote text-[var(--text-secondary)]">
            {org.subscription
              ? `${org.subscription.seats} seats · ${formatMoney(org.subscription.price_usd_total)}`
              : "Pendiente de checkout o carga manual."}
          </p>
        </div>
      </div>
    </div>
  );
}
