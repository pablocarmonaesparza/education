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
import { Avatar, Link } from "@heroui/react";
import { AppleButton, AppleCard, AppleCardBody, AppleProgress } from "@/components/simulador/apple";
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

const BAND_ROWS: Array<{
  band: BandKey;
  label: string;
  description: string;
}> = [
  {
    band: "A",
    label: "Banda alta",
    description: "Puede pilotar o ampliar scope.",
  },
  {
    band: "M",
    label: "Banda media",
    description: "Necesita práctica antes de autonomía.",
  },
  {
    band: "B",
    label: "Banda baja",
    description: "Pausar flujos sensibles y remediar.",
  },
];

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
  dimension_bands: Record<string, BandKey> | null;
  recommendation_action: "pilotar" | "entrenar" | "pausar" | "escalar" | null;
  risk_events_count: number;
  high_risk_events_count: number;
  report_id: string | null;
  report_status: string | null;
}

interface DashboardData {
  viewer_role?: string;
  team: { id: string; name: string } | null;
  sprint: {
    id: string;
    name: string;
    status: string;
    start_date: string | null;
    end_date: string | null;
  } | null;
  available_cases: Array<{
    slug: string;
    title: string;
    difficulty: string | null;
    duration_estimate_min: number | null;
  }>;
  members: DashboardMember[];
  aggregate: {
    total: number;
    completed: number;
    in_progress: number;
    not_started: number;
    completion_pct: number;
    readiness_by_band: Record<"A" | "M" | "B", number>;
    dimensions_avg: Record<string, number>;
    dimension_band_matrix: Record<string, Record<"A" | "M" | "B", number>>;
    risk_events_total: number;
    high_risk_events_total: number;
    pending_review_count: number;
    recommendation_counts: Record<"pilotar" | "entrenar" | "pausar" | "escalar", number>;
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

function EmployeeDashboard({ data }: { data: DashboardData }) {
  const member = data.members[0] ?? null;
  const status = member ? statusLabel(member.session_status) : null;
  const hasStarted = !!member?.session_id;
  const hasReport = !!member?.session_id && !!member?.report_id;
  const availableCases = data.available_cases ?? [];

  return (
    <>
      <SurfaceNav />
      <main className="surface-canvas min-h-screen pb-24">
        <section className="border-b border-[var(--hairline)] surface-canvas">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <motion.div {...fadeUp}>
              <h1 className="display display-tight ts-display sm:ts-display-lg text-[var(--text-primary)]">
                Casos disponibles
              </h1>
              <p className="mt-4 max-w-2xl ts-body text-[var(--text-secondary)] leading-[1.6]">
                Entra a un caso, toma decisiones y recibe una lectura preliminar
                de tu criterio operativo.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 mt-10">
          {availableCases.length === 0 ? (
            <motion.div
              {...fadeUp}
              className="card-apple bg-[var(--surface)] p-8 ts-body text-[var(--text-secondary)]"
            >
              Todavía no tienes casos asignados.
            </motion.div>
          ) : (
            <div className="space-y-3">
              {availableCases.map((caseItem, index) => {
                const currentStatus = index === 0 ? status : null;
                const showReport = index === 0 && hasReport;
                return (
                  <motion.div
                    key={caseItem.slug}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: index * 0.04 }}
                  >
                    <AppleCard className="card-apple bg-[var(--surface)] shadow-none">
                      <AppleCardBody className="p-7 sm:p-8">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0">
                            <div className="eyebrow">
                              Caso {String(index + 1).padStart(2, "0")}
                              {caseItem.difficulty
                                ? ` · ${caseItem.difficulty}`
                                : ""}
                            </div>
                            <h2 className="display mt-3 ts-title-1 text-[var(--text-primary)]">
                              {caseItem.title}
                            </h2>
                            <p className="mt-3 ts-body text-[var(--text-secondary)] leading-[1.55]">
                              {caseItem.duration_estimate_min ?? 18} minutos ·
                              Contexto, Datos, IA, Revisión, Decisión y
                              Respuesta.
                            </p>
                            {currentStatus && (
                              <div
                                className={`mt-4 ts-subhead ${currentStatus.classNames}`}
                              >
                                {currentStatus.label}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2 md:flex-shrink-0">
                            {showReport && (
                              <AppleButton
                                as={Link}
                                href={`/report/${member.session_id}`}
                                size="lg"
                                variant="bordered"
                                className="h-12 border-[var(--border-strong)] text-[var(--text-primary)] bg-[var(--surface)] ts-body font-medium"
                              >
                                Ver reporte
                              </AppleButton>
                            )}
                            <AppleButton
                              as={Link}
                              href={`/case/${caseItem.slug}`}
                              size="lg"
                              className="accent-bg text-white h-12 px-7 ts-body font-medium shadow-none"
                            >
                              {currentStatus && hasStarted
                                ? "Continuar caso"
                                : "Empezar caso"}
                            </AppleButton>
                          </div>
                        </div>
                      </AppleCardBody>
                    </AppleCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
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
            <p className="ts-body text-[var(--text-secondary)]">{error}</p>
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
            <h1 className="display ts-title-1 text-[var(--text-primary)]">
              Aún no hay sprint activo
            </h1>
            <p className="mt-4 ts-body text-[var(--text-secondary)] leading-[1.55]">
              {data.team
                ? "Tu team existe pero no tiene un sprint creado. Pide a tu admin iniciar uno."
                : "No estás asignado a ningún team todavía. Pide a tu admin que te invite."}
            </p>
            <div className="mt-8">
              <AppleButton
                as={Link}
                href="/onboarding/org"
                size="lg"
                className="accent-bg text-white h-12 px-7 ts-body font-medium shadow-none"
              >
                Iniciar onboarding →
              </AppleButton>
            </div>
          </motion.div>
        </main>
      </>
    );
  }

  const canManage = ["manager", "admin", "org_admin"].includes(
    data.viewer_role ?? "employee",
  );

  if (!canManage) {
    return <EmployeeDashboard data={data} />;
  }

  const agg = data.aggregate;
  const completionPct = agg.completion_pct;
  const dimsAvg = agg.dimensions_avg;
  const avgReadiness = Math.round(
    DIMENSIONS.reduce((acc, d) => acc + (dimsAvg[d.id] ?? 0), 0) /
      DIMENSIONS.length,
  );
  const reportsAvailable = data.members.filter(
    (member) => member.session_id && member.report_id,
  );

  return (
    <>
      <SurfaceNav />
      <main className="surface-canvas min-h-screen pb-24">
        {/* Header */}
        <section className="border-b border-[var(--hairline)] surface-canvas">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <motion.div {...fadeUp}>
              <h1 className="display display-tight ts-display sm:ts-display-lg text-[var(--text-primary)]">
                {data.sprint.name || SPRINT_META.publicName}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 ts-subhead text-[var(--text-secondary)]">
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
              <div className="display mt-4 ts-display-xl text-[var(--text-primary)] leading-none">
                {completionPct}%
              </div>
              <AppleProgress
                aria-label="Progreso"
                value={completionPct}
                classNames={{
                  track: "h-[3px] bg-[var(--surface-3)] mt-4",
                  indicator: "accent-bg",
                }}
              />
              <div className="mt-4 ts-subhead text-[var(--text-secondary)]">
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
              <div className="display mt-4 ts-display-xl text-[var(--text-primary)] leading-none">
                {avgReadiness}
                <span className="text-[var(--text-tertiary)] ts-title-1 ml-1">
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
              <div className="mt-4 ts-subhead text-[var(--text-secondary)]">
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
              <div className="display mt-4 ts-display-xl text-[var(--text-primary)] leading-none">
                {agg.risk_events_total}
              </div>
              <div className="mt-5 ts-subhead text-[var(--text-secondary)]">
                {agg.risk_events_total === 0
                  ? "Sin riesgos detectados en sesiones completadas."
                  : "Detectados en sesiones completadas."}
              </div>
            </motion.div>
          </div>
        </section>

        {(agg.high_risk_events_total > 0 || agg.pending_review_count > 0) && (
          <section className="max-w-6xl mx-auto px-6 mt-6">
            <motion.div
              {...fadeUp}
              className="card-apple bg-[var(--surface)] p-5 border border-[var(--band-b-text)]/30"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="eyebrow">Atención operativa</div>
                  <p className="mt-2 ts-body text-[var(--text-primary)] leading-[1.55]">
                    {agg.high_risk_events_total} eventos de riesgo alto ·{" "}
                    {agg.pending_review_count} reportes en review humano.
                  </p>
                </div>
                <span className="ts-footnote text-[var(--text-secondary)]">
                  Revisa antes de expandir autonomía.
                </span>
              </div>
            </motion.div>
          </section>
        )}

        {/* Equipo */}
        <section className="max-w-6xl mx-auto px-6 mt-20">
          <motion.div
            {...fadeUp}
            className="flex items-end justify-between mb-8"
          >
            <div>
              <div className="eyebrow">Equipo</div>
              <h2 className="display mt-2 ts-title-1 text-[var(--text-primary)]">
                {agg.total} miembros del sprint.
              </h2>
            </div>
          </motion.div>

          {data.members.length === 0 ? (
            <p className="ts-body text-[var(--text-secondary)]">
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
                  <AppleCard className="card-apple card-apple-interactive bg-[var(--surface)] shadow-none">
                    <AppleCardBody className="p-5 flex flex-row items-center gap-5">
                      <Avatar
                        size="lg"
                        className="bg-[var(--surface-3)] text-[var(--text-primary)] ts-callout font-semibold flex-shrink-0"
                        name={initials}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="ts-body font-semibold text-[var(--text-primary)] truncate">
                            {displayName}
                          </span>
                        </div>
                        <div
                          className={`mt-1 flex items-center gap-2 ts-footnote ${status.classNames}`}
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
                              <span className="text-[var(--band-m-text)] mono ts-caption-1">
                                review pendiente
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {m.readiness_band && (
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <div
                            className={`ts-caption-1 font-semibold px-2.5 py-1 rounded-full ${tone.bg} ${tone.text}`}
                          >
                            {BAND_DISPLAY[m.readiness_band]}
                          </div>
                          {m.high_risk_events_count > 0 && (
                            <span className="ts-caption-1 text-[var(--band-b-text)]">
                              {m.high_risk_events_count} high risk
                            </span>
                          )}
                        </div>
                      )}
                    </AppleCardBody>
                  </AppleCard>
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

        {/* Reportes */}
        <section className="max-w-6xl mx-auto px-6 mt-20">
          <motion.div
            {...fadeUp}
            className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <div className="eyebrow">Reportes</div>
              <h2 className="display mt-2 ts-title-1 text-[var(--text-primary)]">
                Evidencia lista para revisar.
              </h2>
              <p className="mt-3 ts-body text-[var(--text-secondary)] max-w-2xl">
                Abre los reportes individuales ya generados. El reporte agregado
                del equipo se activa cuando existan suficientes sesiones
                completadas.
              </p>
            </div>
            <div className="ts-subhead text-[var(--text-secondary)]">
              <span className="text-[var(--text-primary)] font-medium">
                {reportsAvailable.length}
              </span>{" "}
              disponibles
            </div>
          </motion.div>

          <div className="mt-8 card-apple bg-[var(--surface)] p-2 sm:p-5">
            {reportsAvailable.length === 0 ? (
              <div className="px-3 py-8 ts-callout text-[var(--text-secondary)]">
                Todavía no hay reportes para extraer. Aparecerán aquí cuando los
                empleados completen el caso y el reporte quede publicado.
              </div>
            ) : (
              <div className="divide-y divide-[var(--hairline)]">
                {reportsAvailable.map((member) => {
                  const displayName =
                    member.full_name ?? member.email.split("@")[0];
                  return (
                    <div
                      key={`${member.user_id}-report`}
                      className="flex flex-col gap-3 px-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="ts-body font-semibold text-[var(--text-primary)] truncate">
                          {displayName}
                        </div>
                        <div className="mt-1 ts-footnote text-[var(--text-tertiary)] mono">
                          {member.report_status ?? "reporte generado"}
                        </div>
                      </div>
                      <AppleButton
                        as={Link}
                        href={`/report/${member.session_id}`}
                        size="sm"
                        className="accent-bg text-white shrink-0 px-5 font-medium shadow-none"
                      >
                        Abrir reporte
                      </AppleButton>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Matriz agregada */}
        <section className="max-w-6xl mx-auto px-6 mt-20">
          <motion.div {...fadeUp} className="mb-8">
            <div className="eyebrow">Resultado agregado</div>
            <h2 className="display mt-2 ts-title-1 text-[var(--text-primary)]">
              Matriz dimensión × banda.
            </h2>
            <p className="mt-3 ts-body text-[var(--text-secondary)] max-w-2xl">
              Cuenta cuántas personas cayeron en cada banda por dimensión. La
              matriz evita esconder un gap fuerte detrás del promedio general.
            </p>
          </motion.div>

          <div className="card-apple bg-[var(--surface)] overflow-hidden">
            <div className="hidden md:grid grid-cols-[180px_repeat(6,minmax(0,1fr))] border-b border-[var(--hairline)]">
              <div className="p-4 ts-footnote text-[var(--text-tertiary)]">
                Banda
              </div>
              {DIMENSIONS.map((dimension) => (
                <div
                  key={dimension.id}
                  className="p-4 ts-footnote font-medium text-[var(--text-secondary)]"
                >
                  {dimension.label.charAt(0).toUpperCase() +
                    dimension.label.slice(1)}
                </div>
              ))}
            </div>

            {BAND_ROWS.map((row, rowIndex) => {
              const tone = bandTone(row.band);
              return (
                <motion.div
                  key={row.band}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: rowIndex * 0.04 }}
                  className="grid grid-cols-1 md:grid-cols-[180px_repeat(6,minmax(0,1fr))] border-b border-[var(--hairline)] last:border-b-0"
                >
                  <div className="p-4 md:p-5 bg-[var(--surface-2)]">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 ts-caption-1 font-semibold ${tone.bg} ${tone.text}`}
                    >
                      {row.label}
                    </span>
                    <p className="mt-2 ts-footnote leading-[1.45] text-[var(--text-secondary)]">
                      {row.description}
                    </p>
                  </div>
                  {DIMENSIONS.map((dimension) => {
                    const count =
                      agg.dimension_band_matrix?.[dimension.id]?.[row.band] ??
                      0;
                    return (
                      <div
                        key={`${row.band}-${dimension.id}`}
                        className="flex items-center justify-between gap-3 p-4 md:block md:p-5 border-t md:border-t-0 md:border-l border-[var(--hairline)]"
                      >
                        <span className="md:hidden ts-subhead text-[var(--text-secondary)]">
                          {dimension.label.charAt(0).toUpperCase() +
                            dimension.label.slice(1)}
                        </span>
                        <span className="mono ts-title-2 font-semibold text-[var(--text-primary)]">
                          {count}
                        </span>
                        <span className="ml-2 ts-footnote text-[var(--text-tertiary)]">
                          {count === 1 ? "persona" : "personas"}
                        </span>
                      </div>
                    );
                  })}
                </motion.div>
              );
            })}

            <div className="p-4 ts-footnote text-[var(--text-tertiary)]">
              Cuentas absolutas por sesiones completadas. Participantes en
              curso no se incluyen hasta publicar reporte.
            </div>
          </div>
        </section>

        {/* Promedios por dimensión */}
        <section className="max-w-6xl mx-auto px-6 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            {DIMENSIONS.map((dimension, index) => {
              const score = dimsAvg[dimension.id] ?? 0;
              return (
                <motion.div
                  key={dimension.id}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: index * 0.04 }}
                  className="card-apple bg-[var(--surface)] p-5"
                >
                  <div className="ts-subhead font-medium text-[var(--text-primary)]">
                    {dimension.label.charAt(0).toUpperCase() +
                      dimension.label.slice(1)}
                  </div>
                  <div className="mt-3 mono ts-title-2 font-semibold text-[var(--text-primary)]">
                    {score}
                    <span className="ts-callout text-[var(--text-tertiary)]">
                      /100
                    </span>
                  </div>
                  <div className="mt-3 h-[4px] overflow-hidden rounded-full bg-[var(--surface-3)]">
                    <motion.div
                      className="h-full rounded-full accent-bg"
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Acciones recomendadas */}
        <section className="max-w-6xl mx-auto px-6 mt-20">
          <motion.div {...fadeUp} className="mb-8">
            <div className="eyebrow">Acciones recomendadas</div>
            <h2 className="display mt-2 ts-title-1 text-[var(--text-primary)]">
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
                  <AppleCard className="card-apple bg-[var(--surface)] shadow-none">
                    <AppleCardBody className="p-5">
                      <div className="eyebrow mb-3">
                        {agg.recommendation_counts?.[
                          a.id as keyof typeof agg.recommendation_counts
                        ] ?? 0}{" "}
                        personas
                      </div>
                      <h3 className="ts-body font-semibold text-[var(--text-primary)]">
                        {labelCapped}.
                      </h3>
                      <p className="mt-1.5 ts-callout text-[var(--text-secondary)] leading-[1.55]">
                        {descCapped}
                      </p>
                    </AppleCardBody>
                  </AppleCard>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
