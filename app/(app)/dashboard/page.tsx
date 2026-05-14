"use client";

/**
 * Dashboard del manager.
 *
 * Lee /api/dashboard que agrega:
 *   - team del user
 *   - sprint activo
 *   - members + sus sessions/reports
 *   - aggregate (bands, dim averages, risk count)
 *
 * Si el user es un employee sin manager scope, vera la vista limitada
 * (sólo su propia session). Para una UI separada de "employee home" en
 * el futuro, se puede router-split.
 */

import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Link,
  Progress,
} from "@heroui/react";
import { motion } from "framer-motion";
import { SurfaceNav } from "@/components/simulador/SurfaceNav";
import {
  DIMENSIONS,
  MANAGER_ACTIONS,
  SPRINT_META,
} from "@/lib/simulador/config";
import type { BandKey } from "@/lib/simulador/config";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

function bandTone(b: BandKey | null) {
  if (b === "A")
    return {
      bg: "bg-[var(--band-a-bg)]",
      text: "text-[var(--band-a-text)]",
    };
  if (b === "M")
    return {
      bg: "bg-[var(--band-m-bg)]",
      text: "text-[var(--band-m-text)]",
    };
  if (b === "B")
    return {
      bg: "bg-[var(--band-b-bg)]",
      text: "text-[var(--band-b-text)]",
    };
  return {
    bg: "bg-[var(--surface-3)]",
    text: "text-[var(--text-tertiary)]",
  };
}

const BAND_DISPLAY: Record<BandKey, string> = {
  A: "Alto",
  M: "Medio",
  B: "Bajo",
};

interface DashboardMember {
  user_id: string;
  full_name: string | null;
  email: string;
  session_id: string | null;
  session_status:
    | "not_started"
    | "in_progress"
    | "paused"
    | "submitted"
    | "evaluated"
    | "completed";
  session_duration_min: number | null;
  readiness_band: BandKey | null;
  report_id: string | null;
  report_status: string | null;
}

interface DashboardData {
  team: { id: string; name: string } | null;
  sprint: {
    id: string;
    name: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
  } | null;
  members: DashboardMember[];
  aggregate: {
    total: number;
    completed: number;
    in_progress: number;
    not_started: number;
    completion_pct: number;
    readiness_by_band: Record<"A" | "M" | "B", number>;
    dimensions_avg: Record<string, number>;
    risk_events_total: number;
    days_left: number | null;
  };
}

function initialsFrom(name: string | null, email: string): string {
  if (name) {
    return name
      .split(/\s+/)
      .map((p) => p[0] ?? "")
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function statusLabel(status: DashboardMember["session_status"]): {
  label: string;
  classNames: string;
  dot?: boolean;
} {
  if (
    status === "submitted" ||
    status === "evaluated" ||
    status === "completed"
  ) {
    return {
      label: "Completado",
      classNames: "text-[var(--band-a-text)]",
    };
  }
  if (status === "in_progress" || status === "paused") {
    return {
      label: "En curso",
      classNames: "text-[var(--band-m-text)] flex items-center gap-1",
      dot: true,
    };
  }
  return {
    label: "No iniciado",
    classNames: "text-[var(--text-tertiary)]",
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (!res.ok) {
          const d = await res.json().catch(() => null);
          throw new Error(d?.error ?? `Error ${res.status}`);
        }
        const d = (await res.json()) as DashboardData;
        if (!cancelled) setData(d);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Error inesperado.");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <>
        <SurfaceNav />
        <main className="surface-canvas min-h-screen grid place-items-center px-6">
          <div className="max-w-md text-center">
            <div className="eyebrow mb-3">Error al cargar dashboard</div>
            <p className="text-[15px] text-[var(--text-secondary)]">{error}</p>
          </div>
        </main>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <SurfaceNav />
        <main className="surface-canvas min-h-screen grid place-items-center px-6">
          <div className="mx-auto h-9 w-9 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />
        </main>
      </>
    );
  }

  // Empty state si no hay team/sprint
  if (!data.team || !data.sprint) {
    return (
      <>
        <SurfaceNav />
        <main className="surface-canvas min-h-screen grid place-items-center px-6 py-20">
          <motion.div {...fadeUp} className="max-w-md text-center">
            <div className="eyebrow mb-3">Dashboard del manager</div>
            <h1 className="display text-[28px] text-[var(--text-primary)]">
              Aún no hay sprint activo.
            </h1>
            <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-[1.55]">
              {data.team
                ? "Tu team existe pero no tiene un sprint creado. Pide a tu admin iniciar uno."
                : "No estás asignado a ningún team todavía. Pide a tu admin que te invite."}
            </p>
            <div className="mt-8">
              <Button
                as={Link}
                href="/onboarding/org"
                radius="full"
                size="lg"
                className="accent-bg text-white h-12 px-7 text-[15px] font-medium shadow-none"
              >
                Iniciar onboarding →
              </Button>
            </div>
          </motion.div>
        </main>
      </>
    );
  }

  const agg = data.aggregate;
  const completionPct = agg.completion_pct;
  const dimsAvg = agg.dimensions_avg;
  const avgReadiness = Math.round(
    DIMENSIONS.reduce((acc, d) => acc + (dimsAvg[d.id] ?? 0), 0) /
      DIMENSIONS.length,
  );

  return (
    <>
      <SurfaceNav />
      <main className="surface-canvas min-h-screen pb-24">
        {/* Header */}
        <section className="border-b border-[var(--hairline)] surface-canvas">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <motion.div {...fadeUp}>
              <div className="eyebrow">Dashboard del manager</div>
              <h1 className="display display-tight mt-4 text-[36px] sm:text-[44px] text-[var(--text-primary)]">
                {data.sprint.name || SPRINT_META.publicName}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px] text-[var(--text-secondary)]">
                {data.sprint.start_date && (
                  <span>
                    <span className="mono text-[var(--text-primary)]">
                      {data.sprint.start_date}
                    </span>
                    {data.sprint.end_date && (
                      <>
                        {" "}
                        → <span className="mono">{data.sprint.end_date}</span>
                      </>
                    )}
                  </span>
                )}
                {agg.days_left !== null && (
                  <>
                    <span className="text-[var(--border-strong)]">·</span>
                    <span>
                      Quedan{" "}
                      <span className="text-[var(--text-primary)] font-medium">
                        {agg.days_left} días
                      </span>
                    </span>
                  </>
                )}
                <span className="text-[var(--border-strong)]">·</span>
                <span>
                  <span className="text-[var(--text-primary)] font-medium">
                    {agg.total}
                  </span>{" "}
                  asientos
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* KPI Hero Strip */}
        <section className="max-w-6xl mx-auto px-6 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--hairline)] rounded-2xl overflow-hidden border border-[var(--hairline)]">
            <motion.div {...fadeUp} className="bg-[var(--surface)] p-8">
              <div className="eyebrow">Progreso del sprint</div>
              <div className="display mt-4 text-[48px] text-[var(--text-primary)] leading-none">
                {completionPct}%
              </div>
              <Progress
                aria-label="Progreso"
                value={completionPct}
                classNames={{
                  track: "h-[3px] bg-[var(--surface-3)] mt-4",
                  indicator: "accent-bg",
                }}
              />
              <div className="mt-4 text-[13px] text-[var(--text-secondary)]">
                <span className="text-[var(--text-primary)] font-medium">
                  {agg.completed}
                </span>{" "}
                completados ·{" "}
                <span className="text-[var(--text-primary)] font-medium">
                  {agg.in_progress}
                </span>{" "}
                en curso
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="bg-[var(--surface)] p-8"
            >
              <div className="eyebrow">Readiness promedio</div>
              <div className="display mt-4 text-[48px] text-[var(--text-primary)] leading-none">
                {avgReadiness}
                <span className="text-[var(--text-tertiary)] text-[28px] ml-1">
                  /100
                </span>
              </div>
              <div className="mt-4 flex gap-1">
                <div
                  className="h-[3px] flex-1 rounded-full"
                  style={{ backgroundColor: "var(--accent)" }}
                />
                <div className="h-[3px] flex-1 bg-[var(--surface-3)] rounded-full" />
                <div className="h-[3px] flex-1 bg-[var(--surface-3)] rounded-full" />
              </div>
              <div className="mt-4 text-[13px] text-[var(--text-secondary)]">
                {agg.completed === 0
                  ? "Sin completados aún."
                  : `${agg.readiness_by_band.A} en banda alta · ${agg.readiness_by_band.M} media · ${agg.readiness_by_band.B} baja.`}
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="bg-[var(--surface)] p-8"
            >
              <div className="eyebrow">Eventos de riesgo</div>
              <div className="display mt-4 text-[48px] text-[var(--text-primary)] leading-none">
                {agg.risk_events_total}
              </div>
              <div className="mt-5 text-[13px] text-[var(--text-secondary)]">
                {agg.risk_events_total === 0
                  ? "Sin riesgos detectados en sesiones completadas."
                  : "Detectados en sesiones completadas."}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Equipo */}
        <section className="max-w-6xl mx-auto px-6 mt-20">
          <motion.div
            {...fadeUp}
            className="flex items-end justify-between mb-8"
          >
            <div>
              <div className="eyebrow">Equipo</div>
              <h2 className="display mt-2 text-[28px] text-[var(--text-primary)]">
                {agg.total} miembros del sprint.
              </h2>
            </div>
          </motion.div>

          {data.members.length === 0 ? (
            <p className="text-[15px] text-[var(--text-secondary)]">
              Aún no hay miembros en el team.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.members.map((m, i) => {
                const tone = bandTone(m.readiness_band);
                const status = statusLabel(m.session_status);
                const initials = initialsFrom(m.full_name, m.email);
                const displayName =
                  m.full_name ?? m.email.split("@")[0];
                const card = (
                  <Card className="card-apple card-apple-interactive bg-[var(--surface)] shadow-none">
                    <CardBody className="p-5 flex flex-row items-center gap-5">
                      <Avatar
                        size="lg"
                        className="bg-[var(--surface-3)] text-[var(--text-primary)] text-[14px] font-semibold flex-shrink-0"
                        name={initials}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-semibold text-[var(--text-primary)] truncate">
                            {displayName}
                          </span>
                        </div>
                        <div
                          className={`mt-1 flex items-center gap-2 text-[12px] ${status.classNames}`}
                        >
                          {status.dot && (
                            <span
                              className="inline-block h-1.5 w-1.5 rounded-full pulse-soft"
                              style={{ backgroundColor: "var(--band-m-text)" }}
                            />
                          )}
                          {status.label}
                          {m.session_duration_min && (
                            <>
                              <span className="text-[var(--border-strong)]">
                                ·
                              </span>
                              <span className="text-[var(--text-tertiary)]">
                                {m.session_duration_min} min
                              </span>
                            </>
                          )}
                          {m.report_status === "pending_review" && (
                            <>
                              <span className="text-[var(--border-strong)]">
                                ·
                              </span>
                              <span className="text-[var(--band-m-text)] mono text-[11px]">
                                review pendiente
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {m.readiness_band && (
                        <div
                          className={`flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${tone.bg} ${tone.text}`}
                        >
                          {BAND_DISPLAY[m.readiness_band]}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                );
                return (
                  <motion.div
                    key={m.user_id}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: i * 0.04 }}
                  >
                    {m.session_id && m.report_id ? (
                      <Link
                        href={`/report/${m.session_id}`}
                        className="block"
                      >
                        {card}
                      </Link>
                    ) : (
                      card
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Dimensiones agregadas */}
        <section className="max-w-6xl mx-auto px-6 mt-20">
          <motion.div {...fadeUp} className="mb-8">
            <div className="eyebrow">Resultado agregado</div>
            <h2 className="display mt-2 text-[28px] text-[var(--text-primary)]">
              Dimensiones del equipo.
            </h2>
            <p className="mt-3 text-[15px] text-[var(--text-secondary)] max-w-2xl">
              Promedio de las 5 dimensiones que medimos en cada caso.
            </p>
          </motion.div>

          <div className="card-apple bg-[var(--surface)] p-2 sm:p-8">
            <div className="space-y-6">
              {DIMENSIONS.map((d, i) => {
                const score = dimsAvg[d.id] ?? 0;
                const labelCapped =
                  d.label.charAt(0).toUpperCase() + d.label.slice(1);
                const descCapped =
                  d.description.charAt(0).toUpperCase() +
                  d.description.slice(1) +
                  ".";
                return (
                  <motion.div
                    key={d.id}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: i * 0.04 }}
                  >
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[15px] font-medium text-[var(--text-primary)]">
                          {labelCapped}
                        </span>
                      </div>
                      <span className="text-[15px] mono text-[var(--text-primary)] font-semibold">
                        {score}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                      {descCapped}
                    </p>
                    <div className="mt-3 h-[6px] bg-[var(--surface-3)] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: "var(--accent)" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{
                          duration: 0.8,
                          delay: 0.1 + i * 0.04,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Acciones recomendadas */}
        <section className="max-w-6xl mx-auto px-6 mt-20">
          <motion.div {...fadeUp} className="mb-8">
            <div className="eyebrow">Acciones recomendadas</div>
            <h2 className="display mt-2 text-[28px] text-[var(--text-primary)]">
              Cuatro caminos por persona.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MANAGER_ACTIONS.map((a, i) => {
              const labelCapped =
                a.label.charAt(0).toUpperCase() + a.label.slice(1);
              const descCapped =
                a.description.charAt(0).toUpperCase() +
                a.description.slice(1) +
                ".";
              return (
                <motion.div
                  key={a.id}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.04 }}
                >
                  <Card className="card-apple bg-[var(--surface)] shadow-none">
                    <CardBody className="p-5">
                      <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
                        {labelCapped}.
                      </h3>
                      <p className="mt-1.5 text-[14px] text-[var(--text-secondary)] leading-[1.55]">
                        {descCapped}
                      </p>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
