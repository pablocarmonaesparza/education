"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Link,
  Progress,
} from "@heroui/react";
import { motion } from "framer-motion";
import { use } from "react";
import { SurfaceNav } from "../../_components/SurfaceNav";
import {
  BAND_LABELS,
  BandKey,
  DIMENSIONS,
  DimensionId,
  REPORT_SYNTHETIC,
} from "../../_data/case-data";

function bandColor(b: BandKey): "success" | "warning" | "danger" {
  if (b === "A") return "success";
  if (b === "M") return "warning";
  return "danger";
}

function bandIndicator(b: BandKey): string {
  if (b === "A") return "bg-gradient-to-r from-emerald-500/60 to-emerald-400";
  if (b === "M") return "bg-gradient-to-r from-amber-500/60 to-amber-400";
  return "bg-gradient-to-r from-rose-500/60 to-rose-400";
}

function bandPct(b: BandKey): number {
  if (b === "A") return 88;
  if (b === "M") return 56;
  return 22;
}

function severityChipClasses(s: string) {
  if (s === "critical" || s === "high") {
    return {
      base: "h-5 bg-rose-500/15 border border-rose-500/25",
      content: "text-[10px] text-rose-300 mono uppercase tracking-wider",
    };
  }
  if (s === "medium") {
    return {
      base: "h-5 bg-amber-500/15 border border-amber-500/25",
      content: "text-[10px] text-amber-300 mono uppercase tracking-wider",
    };
  }
  return {
    base: "h-5 bg-white/[0.04] border border-white/10",
    content: "text-[10px] text-white/55 mono uppercase tracking-wider",
  };
}

export default function ReportePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const report = REPORT_SYNTHETIC;

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <SurfaceNav />

      <div className="relative mx-auto max-w-4xl px-6 pt-10 pb-24">
        {/* Soft background gradient */}
        <div className="absolute top-0 right-0 w-[400px] h-[300px] aurora-soft opacity-30 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          {/* Sintético disclaimer */}
          <div className="mb-6 flex items-center gap-3 px-4 py-2.5 rounded-full bg-amber-500/[0.08] border border-amber-500/20 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-[11px] text-amber-200/80 tracking-wide">
              reporte sintético v0 · datos no provienen de un participante real
            </span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
              reporte de sesión · diagnóstico IA en marketing
            </div>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-[-0.025em]">
              participante <span className="mono">{id}</span>
            </h1>

            <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-[11px] text-white/40 uppercase tracking-[0.18em] font-medium">
                  rol
                </div>
                <div className="text-[14px] text-white mt-1.5">
                  {report.role}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-white/40 uppercase tracking-[0.18em] font-medium">
                  caso
                </div>
                <div className="text-[14px] text-white mt-1.5 leading-tight">
                  {report.caseTitle}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-white/40 uppercase tracking-[0.18em] font-medium">
                  duración
                </div>
                <div className="text-[14px] text-white mt-1.5">
                  {report.durationMin} min
                </div>
              </div>
              <div>
                <div className="text-[11px] text-white/40 uppercase tracking-[0.18em] font-medium">
                  fecha
                </div>
                <div className="text-[14px] text-white mt-1.5 mono">
                  {report.evaluatedAt}
                </div>
              </div>
            </div>
          </div>

          {/* Dimensiones */}
          <Card
            className="bg-white/[0.025] border border-white/[0.06] mb-3"
            shadow="none"
          >
            <CardHeader className="px-6 py-4 border-b border-white/[0.06]">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                  qué evaluamos
                </div>
                <h2 className="text-[18px] font-semibold text-white mt-1.5">
                  5 dimensiones de criterio operativo
                </h2>
              </div>
            </CardHeader>
            <CardBody className="p-6 space-y-5">
              {DIMENSIONS.map((d, i) => {
                const band = report.bands[d.id as DimensionId];
                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-white capitalize font-medium text-[15px]">
                          {d.label}
                        </div>
                        <div className="text-[12px] text-white/50 mt-1 leading-relaxed">
                          {d.description}
                        </div>
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        classNames={{
                          base:
                            band === "A"
                              ? "h-6 bg-emerald-500/15 border border-emerald-500/25"
                              : band === "M"
                              ? "h-6 bg-amber-500/15 border border-amber-500/25"
                              : "h-6 bg-rose-500/15 border border-rose-500/25",
                          content:
                            band === "A"
                              ? "text-[11px] text-emerald-300 mono uppercase tracking-wider px-1"
                              : band === "M"
                              ? "text-[11px] text-amber-300 mono uppercase tracking-wider px-1"
                              : "text-[11px] text-rose-300 mono uppercase tracking-wider px-1",
                        }}
                      >
                        {band} · {BAND_LABELS[band]}
                      </Chip>
                    </div>
                    <div className="relative h-2 bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${bandPct(band)}%` }}
                        transition={{
                          duration: 0.7,
                          delay: 0.2 + i * 0.05,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className={`absolute inset-y-0 left-0 rounded-full ${bandIndicator(band)}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
              <Divider className="bg-white/[0.06] my-3" />
              <p className="text-[12px] text-white/45 leading-relaxed">
                bandas alto (A) / medio (M) / bajo (B). no usamos scores
                puntuales — la varianza estadística del judge no justifica
                falsa precisión.
              </p>
            </CardBody>
          </Card>

          {/* Gaps */}
          <Card
            className="bg-white/[0.025] border border-white/[0.06] mb-3"
            shadow="none"
          >
            <CardHeader className="px-6 py-4 border-b border-white/[0.06]">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                  qué entrenar
                </div>
                <h2 className="text-[18px] font-semibold text-white mt-1.5">
                  gaps observados durante la sesión
                </h2>
              </div>
            </CardHeader>
            <CardBody className="p-6 space-y-5">
              {report.gaps.map((g, i) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="pb-5 border-b border-white/[0.05] last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <code className="text-[13px] text-white mono font-medium">
                      {g.id}
                    </code>
                    <Chip
                      size="sm"
                      classNames={severityChipClasses(g.severity)}
                    >
                      {g.severity}
                    </Chip>
                  </div>
                  <div className="space-y-3 text-[14px]">
                    <div>
                      <span className="text-[11px] text-white/40 uppercase tracking-[0.18em] font-medium">
                        qué se observó
                      </span>
                      <p className="text-white/80 leading-[1.65] mt-1.5">
                        {g.observed}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-white/40 uppercase tracking-[0.18em] font-medium">
                        por qué importa
                      </span>
                      <p className="text-white/70 leading-[1.65] mt-1.5">
                        {g.whyMatters}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardBody>
          </Card>

          {/* Risk events */}
          <Card
            className="bg-rose-500/[0.04] border border-rose-500/20 mb-3"
            shadow="none"
          >
            <CardHeader className="px-6 py-4 border-b border-rose-500/10">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center h-6 w-6">
                  <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                  <div className="relative h-2 w-2 rounded-full bg-rose-400" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-rose-300 font-medium">
                    riesgos detectados
                  </div>
                  <h2 className="text-[18px] font-semibold text-white mt-1">
                    eventos durante la sesión
                  </h2>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-6 space-y-5">
              {report.riskEvents.map((evt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="pb-5 border-b border-rose-500/10 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <code className="text-[13px] text-white mono break-all font-medium">
                      {evt.type}
                    </code>
                    <Chip
                      size="sm"
                      classNames={severityChipClasses(evt.severity)}
                    >
                      {evt.severity}
                    </Chip>
                    <span className="text-[11px] text-white/40 mono">
                      paso {evt.step}
                    </span>
                  </div>
                  <div className="bg-black/40 border border-white/[0.05] rounded-xl p-4">
                    <div className="text-[10px] text-white/35 uppercase tracking-[0.2em] mb-2 font-medium">
                      excerpt anonimizado
                    </div>
                    <p className="text-[14px] text-white/75 italic leading-[1.65]">
                      "...{evt.excerpt}..."
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardBody>
          </Card>

          {/* Strengths */}
          <Card
            className="bg-emerald-500/[0.04] border border-emerald-500/20 mb-3"
            shadow="none"
          >
            <CardHeader className="px-6 py-4 border-b border-emerald-500/10">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-emerald-300 font-medium">
                  fortalezas
                </div>
                <h2 className="text-[18px] font-semibold text-white mt-1.5">
                  qué sí salió bien
                </h2>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <ul className="space-y-3.5">
                {report.strengths.map((s, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex gap-3 text-[14px] text-white/85 leading-[1.65]"
                  >
                    <div className="text-emerald-400 flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <span>{s}</span>
                  </motion.li>
                ))}
              </ul>
            </CardBody>
          </Card>

          {/* Recomendación */}
          <Card
            className="relative bg-gradient-to-br from-indigo-500/[0.1] via-violet-500/[0.06] to-fuchsia-500/[0.08] border border-indigo-500/25 mb-3 overflow-hidden"
            shadow="none"
          >
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/20 blur-3xl pointer-events-none" />
            <CardHeader className="relative px-6 py-4 border-b border-indigo-500/15">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-indigo-300 font-medium">
                  recomendación accionable
                </div>
                <h2 className="text-3xl font-semibold text-white mt-2 capitalize tracking-tight">
                  {report.recommendation.action}
                </h2>
              </div>
            </CardHeader>
            <CardBody className="relative p-6 space-y-6">
              <div>
                <div className="text-[11px] text-white/40 uppercase tracking-[0.18em] font-medium mb-2">
                  a quién aplica
                </div>
                <p className="text-[14px] text-white/85 leading-[1.65]">
                  {report.recommendation.appliesTo}
                </p>
              </div>

              <div>
                <div className="text-[11px] text-white/40 uppercase tracking-[0.18em] font-medium mb-4">
                  qué hacer concretamente — próximos 7 días
                </div>
                <ol className="space-y-4">
                  {report.recommendation.nextWeekActions.map((a, i) => (
                    <li key={i} className="flex gap-4 text-[14px]">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="h-6 w-6 rounded-full bg-indigo-500/15 border border-indigo-500/30 grid place-items-center text-[11px] mono text-indigo-200 font-medium">
                          {i + 1}
                        </div>
                      </div>
                      <span className="text-white/85 leading-[1.65]">{a}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="pt-4 border-t border-white/[0.06]">
                <div className="text-[11px] text-white/40 uppercase tracking-[0.18em] font-medium mb-2">
                  razón
                </div>
                <p className="text-[14px] text-white/75 italic leading-[1.65]">
                  {report.recommendation.reason}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Next step for manager */}
          <Card
            className="bg-white/[0.025] border border-white/[0.06] mb-3"
            shadow="none"
          >
            <CardBody className="p-6">
              <div className="text-[11px] text-white/40 uppercase tracking-[0.18em] font-medium mb-2">
                próximo paso para ti como manager
              </div>
              <p className="text-[14px] text-white/85 leading-[1.65]">
                agenda 20 min con <span className="mono">{id}</span> esta semana
                para discutir el reporte juntos. la conversación más útil es
                alrededor de qué piensa él/ella sobre lo observado, no defender
                los resultados.
              </p>
            </CardBody>
          </Card>

          {/* What NOT to conclude */}
          <Card
            className="bg-white/[0.015] border border-white/[0.06] mb-3"
            shadow="none"
          >
            <CardHeader className="px-6 py-3 border-b border-white/[0.05]">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                qué NO concluir de este reporte
              </span>
            </CardHeader>
            <CardBody className="p-6 space-y-2.5 text-[13px] text-white/65 leading-[1.65]">
              <p>
                <span className="text-white/40 mr-2">·</span>diagnóstico
                single-participant sobre 1 caso simulado — no evaluación general
                de desempeño.
              </p>
              <p>
                <span className="text-white/40 mr-2">·</span>no predice
                comportamiento en otras situaciones (otros flujos, otra
                presión).
              </p>
              <p>
                <span className="text-white/40 mr-2">·</span>no compara con
                otros del equipo — eso requiere diagnóstico completo.
              </p>
              <p>
                <span className="text-white/40 mr-2">·</span>no certifica
                capacidad o incapacidad — es señal sobre criterio en un
                escenario específico.
              </p>
            </CardBody>
          </Card>

          {/* Technical metadata */}
          <Card
            className="bg-black/40 border border-white/[0.05]"
            shadow="none"
          >
            <CardHeader className="px-6 py-3 border-b border-white/[0.05]">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mono">
                metadata técnica · apéndice
              </span>
            </CardHeader>
            <CardBody className="p-6 grid sm:grid-cols-2 gap-3 text-[12px] mono">
              <div>
                <span className="text-white/35">evaluadores:</span>{" "}
                <span className="text-white/75">
                  2 externos · κ {report.meta.kappa}
                </span>
              </div>
              <div>
                <span className="text-white/35">judge agreement:</span>{" "}
                <span className="text-white/75">
                  {report.meta.judgeAgreement}%
                </span>
              </div>
              <div>
                <span className="text-white/35">discrepancia:</span>{" "}
                <span className="text-white/75">
                  {report.meta.discrepancyCells} cells
                </span>
              </div>
              <div>
                <span className="text-white/35">rúbrica:</span>{" "}
                <span className="text-white/75">
                  {report.meta.rubricVersion}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-white/35">caso:</span>{" "}
                <span className="text-white/75">
                  {report.meta.caseVersion}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-white/35">variante:</span>{" "}
                <span className="text-white/75">{report.meta.variant}</span>
              </div>
            </CardBody>
          </Card>

          {/* CTAs */}
          <div className="mt-12 flex flex-col sm:flex-row gap-3">
            <Button
              as={Link}
              href="/simulator-design/dashboard"
              size="lg"
              variant="flat"
              radius="full"
              className="h-12 px-6 bg-white/[0.04] border border-white/10 text-white hover:bg-white/[0.08]"
            >
              ← volver al dashboard
            </Button>
            <Button
              size="lg"
              radius="full"
              className="h-12 px-6 font-medium bg-white text-black hover:bg-white/90 shadow-[0_8px_32px_-8px_rgba(255,255,255,0.4)]"
            >
              descargar PDF
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
