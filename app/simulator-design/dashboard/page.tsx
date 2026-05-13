"use client";

import { Avatar, Button, Card, CardBody, Link, Progress } from "@heroui/react";
import { motion } from "framer-motion";
import { SurfaceNav } from "../_components/SurfaceNav";
import {
  DIMENSIONS,
  TEAM_MEMBERS,
  BAND_LABELS,
  MANAGER_ACTIONS,
  SPRINT_META,
} from "../_data/case-data";
import type { BandKey } from "../_data/case-data";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

const SPRINT_AGGREGATE = {
  totalSeats: 8,
  completed: 5,
  inProgress: 1,
  notStarted: 2,
  daysLeft: 6,
  startDate: "2026-05-08",
  endDate: "2026-06-07",
  readinessByBand: { A: 1, M: 3, B: 1 } as Record<BandKey, number>,
  dimensionsAvg: {
    contexto: 78,
    privacidad: 42,
    validacion: 61,
    juicio: 58,
    decision: 72,
  } as Record<string, number>,
  riskEventsTotal: 3,
  flaggedRoles: ["Marketing Manager", "Demand Gen Lead"],
};

function bandTone(b: BandKey | null) {
  if (b === "A") return { bg: "bg-[#e8f5ed]", text: "text-[#0a7e3a]" };
  if (b === "M") return { bg: "bg-[#fef4e6]", text: "text-[#a05a00]" };
  if (b === "B") return { bg: "bg-[#fde9e9]", text: "text-[#a01818]" };
  return { bg: "bg-[#f5f5f7]", text: "text-[#86868b]" };
}

const BAND_DISPLAY: Record<BandKey, string> = {
  A: "Alto",
  M: "Medio",
  B: "Bajo",
};

export default function DashboardPage() {
  const completionPct = Math.round(
    (SPRINT_AGGREGATE.completed / SPRINT_AGGREGATE.totalSeats) * 100,
  );
  const avgReadiness = Math.round(
    Object.values(SPRINT_AGGREGATE.dimensionsAvg).reduce((a, b) => a + b, 0) /
      DIMENSIONS.length,
  );

  return (
    <>
      <SurfaceNav />
      <main className="surface-canvas min-h-screen pb-24">
        {/* Header */}
        <section className="border-b border-black/[0.06] surface-canvas">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <motion.div {...fadeUp}>
              <div className="eyebrow">Dashboard del manager</div>
              <h1 className="display display-tight mt-4 text-[36px] sm:text-[44px] text-[#1d1d1f]">
                {SPRINT_META.publicName}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px] text-[#6e6e73]">
                <span>
                  <span className="mono text-[#1d1d1f]">
                    {SPRINT_AGGREGATE.startDate}
                  </span>{" "}
                  → {SPRINT_AGGREGATE.endDate}
                </span>
                <span className="text-[#d2d2d7]">·</span>
                <span>
                  Quedan{" "}
                  <span className="text-[#1d1d1f] font-medium">
                    {SPRINT_AGGREGATE.daysLeft} días
                  </span>
                </span>
                <span className="text-[#d2d2d7]">·</span>
                <span>
                  <span className="text-[#1d1d1f] font-medium">
                    {SPRINT_AGGREGATE.totalSeats}
                  </span>{" "}
                  asientos
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* KPI Hero Strip */}
        <section className="max-w-6xl mx-auto px-6 mt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/[0.06] rounded-2xl overflow-hidden border border-black/[0.06]">
            <motion.div {...fadeUp} className="bg-white p-8">
              <div className="eyebrow">Progreso del sprint</div>
              <div className="display mt-4 text-[48px] text-[#1d1d1f] leading-none">
                {completionPct}%
              </div>
              <Progress
                aria-label="Progreso"
                value={completionPct}
                classNames={{
                  track: "h-[3px] bg-[#f5f5f7] mt-4",
                  indicator: "accent-bg",
                }}
              />
              <div className="mt-4 text-[13px] text-[#6e6e73]">
                <span className="text-[#1d1d1f] font-medium">
                  {SPRINT_AGGREGATE.completed}
                </span>{" "}
                completados ·{" "}
                <span className="text-[#1d1d1f] font-medium">
                  {SPRINT_AGGREGATE.inProgress}
                </span>{" "}
                en curso
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="bg-white p-8"
            >
              <div className="eyebrow">Readiness promedio</div>
              <div className="display mt-4 text-[48px] text-[#1d1d1f] leading-none">
                {avgReadiness}
                <span className="text-[#86868b] text-[28px] ml-1">/100</span>
              </div>
              <div className="mt-4 flex gap-1">
                <div
                  className="h-[3px] flex-1 rounded-full"
                  style={{ backgroundColor: "var(--accent)" }}
                />
                <div className="h-[3px] flex-1 bg-[#f5f5f7] rounded-full" />
                <div className="h-[3px] flex-1 bg-[#f5f5f7] rounded-full" />
              </div>
              <div className="mt-4 text-[13px] text-[#6e6e73]">
                El equipo está en{" "}
                <span className="text-[#1d1d1f] font-medium">banda media</span>{" "}
                · privacidad es el gap principal.
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="bg-white p-8"
            >
              <div className="eyebrow">Eventos de riesgo</div>
              <div className="display mt-4 text-[48px] text-[#1d1d1f] leading-none">
                {SPRINT_AGGREGATE.riskEventsTotal}
              </div>
              <div className="mt-5 text-[13px] text-[#6e6e73]">
                Detectados en sesiones completadas.
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {SPRINT_AGGREGATE.flaggedRoles.map((r) => (
                  <span
                    key={r}
                    className="text-[11px] text-[#1d1d1f] bg-[#f5f5f7] px-2.5 py-1 rounded-full"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Equipo */}
        <section className="max-w-6xl mx-auto px-6 mt-20">
          <motion.div {...fadeUp} className="flex items-end justify-between mb-8">
            <div>
              <div className="eyebrow">Equipo</div>
              <h2 className="display mt-2 text-[28px] text-[#1d1d1f]">
                {SPRINT_AGGREGATE.totalSeats} miembros del sprint.
              </h2>
            </div>
            <Button
              as={Link}
              href="/simulator-design/reporte/P001"
              radius="full"
              size="sm"
              variant="bordered"
              className="hidden sm:flex border-[#d2d2d7] text-[#1d1d1f] bg-white"
            >
              Ver reporte ejecutivo →
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TEAM_MEMBERS.map((m, i) => {
              const tone = bandTone(m.readiness);
              return (
                <motion.div
                  key={m.id}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.04 }}
                >
                  <Card className="card-apple card-apple-interactive bg-white shadow-none">
                    <CardBody className="p-5 flex flex-row items-center gap-5">
                      <Avatar
                        size="lg"
                        className="bg-[#f5f5f7] text-[#1d1d1f] text-[14px] font-semibold flex-shrink-0"
                        name={m.initials}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-semibold text-[#1d1d1f]">
                            {m.initials}
                          </span>
                          <span className="text-[#86868b]">·</span>
                          <span className="text-[14px] text-[#6e6e73] truncate">
                            {m.role}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[12px]">
                          {m.status === "completed" && (
                            <span className="text-[#0a7e3a]">Completado</span>
                          )}
                          {m.status === "in_progress" && (
                            <span className="text-[#a05a00] flex items-center gap-1">
                              <span
                                className="inline-block h-1.5 w-1.5 rounded-full pulse-soft"
                                style={{ backgroundColor: "#a05a00" }}
                              />
                              En curso
                            </span>
                          )}
                          {m.status === "not_started" && (
                            <span className="text-[#86868b]">No iniciado</span>
                          )}
                          {m.sessionDuration && (
                            <>
                              <span className="text-[#d2d2d7]">·</span>
                              <span className="text-[#86868b]">
                                {m.sessionDuration} min
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {m.readiness && (
                        <div
                          className={`flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${tone.bg} ${tone.text}`}
                        >
                          {BAND_DISPLAY[m.readiness]}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Dimensiones agregadas */}
        <section className="max-w-6xl mx-auto px-6 mt-20">
          <motion.div {...fadeUp} className="mb-8">
            <div className="eyebrow">Resultado agregado</div>
            <h2 className="display mt-2 text-[28px] text-[#1d1d1f]">
              Dimensiones del equipo.
            </h2>
            <p className="mt-3 text-[15px] text-[#6e6e73] max-w-2xl">
              Promedio de las 5 dimensiones que medimos en cada caso. El gap
              principal del equipo se concentra en{" "}
              <span className="text-[#1d1d1f] font-medium">Privacidad</span>.
            </p>
          </motion.div>

          <div className="card-apple bg-white p-2 sm:p-8">
            <div className="space-y-6">
              {DIMENSIONS.map((d, i) => {
                const score = SPRINT_AGGREGATE.dimensionsAvg[d.id] || 0;
                const labelCapped = d.label.charAt(0).toUpperCase() + d.label.slice(1);
                const descCapped =
                  d.description.charAt(0).toUpperCase() + d.description.slice(1) + ".";
                return (
                  <motion.div
                    key={d.id}
                    {...fadeUp}
                    transition={{ ...fadeUp.transition, delay: i * 0.04 }}
                  >
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[15px] font-medium text-[#1d1d1f]">
                          {labelCapped}
                        </span>
                      </div>
                      <span className="text-[15px] mono text-[#1d1d1f] font-semibold">
                        {score}
                      </span>
                    </div>
                    <p className="mt-1 text-[13px] text-[#6e6e73]">
                      {descCapped}
                    </p>
                    <div className="mt-3 h-[6px] bg-[#f5f5f7] rounded-full overflow-hidden">
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
            <h2 className="display mt-2 text-[28px] text-[#1d1d1f]">
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
                  <Card className="card-apple bg-white shadow-none">
                    <CardBody className="p-5">
                      <h3 className="text-[16px] font-semibold text-[#1d1d1f]">
                        {labelCapped}.
                      </h3>
                      <p className="mt-1.5 text-[14px] text-[#6e6e73] leading-[1.55]">
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
