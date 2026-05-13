"use client";

import { Avatar, Button, Card, CardBody, Link } from "@heroui/react";
import { motion } from "framer-motion";
import { SurfaceNav } from "../../_components/SurfaceNav";
import { DIMENSIONS, REPORT_SYNTHETIC } from "../../_data/case-data";
import type { BandKey } from "../../_data/case-data";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
};

const BAND_DISPLAY: Record<BandKey, string> = {
  A: "Alto",
  M: "Medio",
  B: "Bajo",
};

function bandScore(b: BandKey) {
  if (b === "A") return 85;
  if (b === "M") return 60;
  return 35;
}

function bandTone(b: BandKey) {
  if (b === "A") return { bg: "bg-[#e8f5ed]", text: "text-[#0a7e3a]", bar: "#0a7e3a" };
  if (b === "M") return { bg: "bg-[#fef4e6]", text: "text-[#a05a00]", bar: "#cc8800" };
  return { bg: "bg-[#fde9e9]", text: "text-[#a01818]", bar: "#c0282b" };
}

function severityTone(s: "high" | "medium" | "low") {
  if (s === "high")
    return { bg: "bg-[#fde9e9]", text: "text-[#a01818]", label: "Alta" };
  if (s === "medium")
    return { bg: "bg-[#fef4e6]", text: "text-[#a05a00]", label: "Media" };
  return { bg: "bg-[#f5f5f7]", text: "text-[#6e6e73]", label: "Baja" };
}

function capFirst(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function ReportePage() {
  const r = REPORT_SYNTHETIC;
  const overallScore = Math.round(
    DIMENSIONS.reduce((acc, d) => acc + bandScore(r.bands[d.id]), 0) /
      DIMENSIONS.length,
  );
  const overallBand: BandKey =
    overallScore > 75 ? "A" : overallScore > 50 ? "M" : "B";

  return (
    <>
      <SurfaceNav />
      <main className="surface-canvas min-h-screen pb-24">
        {/* Disclaimer */}
        <div className="border-b border-black/[0.06] bg-[#fafafa]">
          <div className="reading-col px-6 py-3 flex items-center gap-2 text-[12px] text-[#6e6e73]">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "#cc8800" }}
            />
            <span>
              <span className="text-[#1d1d1f] font-medium">Vista preview</span>{" "}
              · datos sintéticos · estructura del reporte final.
            </span>
          </div>
        </div>

        {/* Header */}
        <section className="reading-col px-6 pt-14">
          <motion.div {...fadeUp}>
            <div className="eyebrow">Reporte ejecutivo · participante</div>
            <h1 className="display display-tight mt-5 text-[40px] sm:text-[52px] text-[#1d1d1f]">
              {capFirst(r.caseTitle)}.
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-[13px] text-[#6e6e73]">
              <Avatar
                size="sm"
                className="bg-[#f5f5f7] text-[#1d1d1f] text-[12px] font-semibold"
                name={r.participantInitials}
              />
              <span className="text-[#1d1d1f] font-medium">
                {r.participantInitials} · {r.role}
              </span>
              <span className="text-[#d2d2d7]">·</span>
              <span className="mono">{r.participantId}</span>
              <span className="text-[#d2d2d7]">·</span>
              <span>{r.durationMin} min</span>
              <span className="text-[#d2d2d7]">·</span>
              <span>{r.evaluatedAt}</span>
            </div>
          </motion.div>

          {/* Overall pull */}
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.06 }}
            className="mt-12 card-apple bg-white p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-8">
              <div className="flex-shrink-0">
                <div className="eyebrow">Readiness general</div>
                <div className="display mt-3 text-[64px] text-[#1d1d1f] leading-none">
                  {overallScore}
                  <span className="text-[#86868b] text-[28px] ml-1">/100</span>
                </div>
                <div className="mt-3">
                  <span
                    className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${
                      bandTone(overallBand).bg
                    } ${bandTone(overallBand).text}`}
                  >
                    Banda {BAND_DISPLAY[overallBand]}
                  </span>
                </div>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-[16px] text-[#1d1d1f] leading-[1.65]">
                  {capFirst(r.recommendation.reason)}
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Dimensiones */}
        <section className="reading-col px-6 mt-20">
          <motion.div {...fadeUp}>
            <div className="eyebrow">Desempeño por dimensión</div>
            <h2 className="display mt-3 text-[28px] text-[#1d1d1f]">
              Las cinco dimensiones.
            </h2>
          </motion.div>

          <div className="mt-8 space-y-5">
            {DIMENSIONS.map((d, i) => {
              const band = r.bands[d.id];
              const score = bandScore(band);
              const tone = bandTone(band);
              return (
                <motion.div
                  key={d.id}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.04 }}
                  className="card-apple bg-white p-6"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[17px] font-semibold text-[#1d1d1f]">
                          {capFirst(d.label)}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tone.bg} ${tone.text}`}
                        >
                          Banda {BAND_DISPLAY[band]}
                        </span>
                      </div>
                      <p className="mt-2 text-[14px] text-[#6e6e73] leading-[1.6]">
                        {capFirst(d.description)}.
                      </p>
                    </div>
                    <span className="text-[20px] mono font-semibold text-[#1d1d1f] flex-shrink-0">
                      {score}
                    </span>
                  </div>
                  <div className="mt-4 h-[5px] bg-[#f5f5f7] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: tone.bar }}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{
                        duration: 0.8,
                        delay: 0.15 + i * 0.04,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Gaps */}
        <section className="reading-col px-6 mt-20">
          <motion.div {...fadeUp}>
            <div className="eyebrow">Gaps identificados</div>
            <h2 className="display mt-3 text-[28px] text-[#1d1d1f]">
              Dónde se torció.
            </h2>
          </motion.div>

          <div className="mt-8 space-y-3">
            {r.gaps.map((g, i) => {
              const tone = severityTone(g.severity as "high" | "medium" | "low");
              return (
                <motion.div
                  key={g.id}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                  className="card-apple bg-white p-6"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-1 ${tone.bg} ${tone.text}`}
                    >
                      Severidad {tone.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="eyebrow">Qué observamos</div>
                      <p className="mt-2 text-[15px] text-[#1d1d1f] leading-[1.65]">
                        {capFirst(g.observed)}
                      </p>
                      <div className="eyebrow mt-5">Por qué importa</div>
                      <p className="mt-2 text-[14px] text-[#6e6e73] leading-[1.65]">
                        {capFirst(g.whyMatters)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Risk events */}
        <section className="reading-col px-6 mt-20">
          <motion.div {...fadeUp}>
            <div className="eyebrow">Eventos de riesgo</div>
            <h2 className="display mt-3 text-[28px] text-[#1d1d1f]">
              Momentos críticos en la sesión.
            </h2>
          </motion.div>

          <div className="mt-8 space-y-3">
            {r.riskEvents.map((e, i) => {
              const tone = severityTone(
                e.severity as "high" | "medium" | "low",
              );
              return (
                <motion.div
                  key={e.type}
                  {...fadeUp}
                  transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                  className="card-apple bg-white p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="mono text-[12px] text-[#86868b] flex-shrink-0">
                        Paso {e.step}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tone.bg} ${tone.text}`}
                      >
                        {tone.label}
                      </span>
                      <span className="text-[14px] text-[#1d1d1f] truncate capitalize">
                        {e.type.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                  <blockquote className="mt-4 pl-4 border-l-2 border-[#e5e5ea] text-[14px] text-[#6e6e73] italic leading-[1.65]">
                    «{capFirst(e.excerpt)}»
                  </blockquote>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Fortalezas */}
        <section className="reading-col px-6 mt-20">
          <motion.div {...fadeUp}>
            <div className="eyebrow">Fortalezas</div>
            <h2 className="display mt-3 text-[28px] text-[#1d1d1f]">
              Qué hizo bien.
            </h2>
          </motion.div>

          <ul className="mt-8 space-y-4">
            {r.strengths.map((s, i) => (
              <motion.li
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.04 }}
                className="flex items-start gap-4"
              >
                <span
                  className="flex-shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: "var(--accent)" }}
                />
                <p className="text-[15px] text-[#1d1d1f] leading-[1.65]">
                  {capFirst(s)}
                </p>
              </motion.li>
            ))}
          </ul>
        </section>

        {/* Recomendación */}
        <section className="reading-col px-6 mt-20">
          <motion.div
            {...fadeUp}
            className="card-apple p-8"
            style={{
              backgroundColor: "var(--accent-soft)",
              borderColor: "var(--accent)",
              borderWidth: 1,
            }}
          >
            <div className="eyebrow accent-text">Recomendación</div>
            <h2 className="display mt-3 text-[34px] text-[#1d1d1f]">
              {capFirst(r.recommendation.action)}.
            </h2>
            <p className="mt-3 text-[15px] text-[#6e6e73]">
              {capFirst(r.recommendation.appliesTo)}
            </p>

            <div className="mt-7">
              <div className="eyebrow">Próximos 7 días</div>
              <ol className="mt-4 space-y-3">
                {r.recommendation.nextWeekActions.map((a, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="mono text-[13px] text-[#86868b] flex-shrink-0 mt-0.5 w-5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[15px] text-[#1d1d1f] leading-[1.6]">
                      {capFirst(a)}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mt-10 flex flex-col sm:flex-row gap-3"
          >
            <Button
              as={Link}
              href="/simulator-design/dashboard"
              radius="full"
              size="lg"
              className="accent-bg text-white h-12 px-7 text-[15px] font-medium shadow-none"
            >
              Vista del manager →
            </Button>
            <Button
              as={Link}
              href="/simulator-design"
              radius="full"
              variant="bordered"
              size="lg"
              className="h-12 px-7 border-[#d2d2d7] text-[#1d1d1f] bg-white text-[15px]"
            >
              Volver a landing
            </Button>
          </motion.div>
        </section>

        {/* Meta footer */}
        <section className="reading-col px-6 mt-20">
          <div className="border-t border-black/[0.06] pt-6 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-[#86868b] mono">
            <span>Kappa {r.meta.kappa}</span>
            <span>·</span>
            <span>Judge agreement {r.meta.judgeAgreement}%</span>
            <span>·</span>
            <span>Rúbrica {r.meta.rubricVersion}</span>
            <span>·</span>
            <span>Caso {r.meta.caseVersion}</span>
          </div>
        </section>
      </main>
    </>
  );
}
