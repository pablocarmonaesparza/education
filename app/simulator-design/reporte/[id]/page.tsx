"use client";

import {
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

function bandIndicatorClass(b: BandKey): string {
  if (b === "A") return "bg-gradient-to-r from-emerald-500/40 to-emerald-500/80";
  if (b === "M") return "bg-gradient-to-r from-amber-500/40 to-amber-500/80";
  return "bg-gradient-to-r from-rose-500/40 to-rose-500/80";
}

function bandPct(b: BandKey): number {
  if (b === "A") return 88;
  if (b === "M") return 56;
  return 22;
}

function severityColor(
  s: string,
): "danger" | "warning" | "default" | "secondary" {
  if (s === "critical" || s === "high") return "danger";
  if (s === "medium") return "warning";
  return "default";
}

export default function ReportePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const report = REPORT_SYNTHETIC;

  return (
    <div className="min-h-screen bg-black text-white">
      <SurfaceNav />

      <div className="mx-auto max-w-4xl px-6 pt-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Disclaimer sintético */}
          <Card className="bg-amber-500/5 border border-amber-500/20 mb-6">
            <CardBody className="px-5 py-3">
              <div className="flex items-center gap-3 text-xs text-amber-200/80">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                reporte sintético v0 · construido por Itera para validar
                formato · los datos no provienen de un participante real
              </div>
            </CardBody>
          </Card>

          {/* Header */}
          <div className="mb-10">
            <div className="text-xs uppercase tracking-widest text-white/40 mb-2">
              reporte de sesión · diagnóstico IA en marketing
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              participante {id}
            </h1>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-white/40 uppercase tracking-widest mb-1">
                  rol
                </div>
                <div className="text-sm text-white/80">{report.role}</div>
              </div>
              <div>
                <div className="text-xs text-white/40 uppercase tracking-widest mb-1">
                  caso
                </div>
                <div className="text-sm text-white/80">{report.caseTitle}</div>
              </div>
              <div>
                <div className="text-xs text-white/40 uppercase tracking-widest mb-1">
                  duración
                </div>
                <div className="text-sm text-white/80">
                  {report.durationMin} min
                </div>
              </div>
              <div>
                <div className="text-xs text-white/40 uppercase tracking-widest mb-1">
                  fecha
                </div>
                <div className="text-sm text-white/80">
                  {report.evaluatedAt}
                </div>
              </div>
            </div>
          </div>

          {/* Bandas por dimensión — usando HeroUI Progress */}
          <Card className="bg-white/[0.02] border border-white/5 mb-6">
            <CardHeader className="px-6 py-4 border-b border-white/5">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/40">
                  qué evaluamos
                </div>
                <h2 className="text-lg font-medium text-white mt-1">
                  5 dimensiones de criterio operativo con IA
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
                    <div className="flex justify-between items-baseline gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-white capitalize font-medium">
                          {d.label}
                        </div>
                        <div className="text-xs text-white/40 mt-0.5">
                          {d.description}
                        </div>
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={bandColor(band)}
                        className="font-mono text-xs flex-shrink-0"
                      >
                        {band} · {BAND_LABELS[band]}
                      </Chip>
                    </div>
                    <Progress
                      aria-label={`banda ${BAND_LABELS[band]} en dimensión ${d.label}`}
                      value={bandPct(band)}
                      size="sm"
                      classNames={{
                        indicator: bandIndicatorClass(band),
                        track: "bg-white/5",
                      }}
                    />
                  </motion.div>
                );
              })}
              <Divider className="bg-white/5 my-3" />
              <p className="text-xs text-white/40 leading-relaxed">
                bandas alto (A) / medio (M) / bajo (B). no usamos scores
                puntuales — la varianza estadística del judge no justifica
                falsa precisión.
              </p>
            </CardBody>
          </Card>

          {/* Gaps observados */}
          <Card className="bg-white/[0.02] border border-white/5 mb-6">
            <CardHeader className="px-6 py-4 border-b border-white/5">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/40">
                  qué entrenar
                </div>
                <h2 className="text-lg font-medium text-white mt-1">
                  gaps observados durante la sesión
                </h2>
              </div>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              {report.gaps.map((g, i) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="pb-4 border-b border-white/5 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <code className="text-sm text-white font-mono">{g.id}</code>
                    <Chip
                      size="sm"
                      color={severityColor(g.severity)}
                      variant="flat"
                      className="text-[10px] uppercase tracking-wider"
                    >
                      {g.severity}
                    </Chip>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-white/40 text-xs uppercase tracking-widest">
                        qué se observó:
                      </span>
                      <p className="text-white/80 leading-relaxed mt-1">
                        {g.observed}
                      </p>
                    </div>
                    <div>
                      <span className="text-white/40 text-xs uppercase tracking-widest">
                        por qué importa:
                      </span>
                      <p className="text-white/70 leading-relaxed mt-1">
                        {g.whyMatters}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardBody>
          </Card>

          {/* Risk events */}
          <Card className="bg-rose-500/[0.04] border border-rose-500/20 mb-6">
            <CardHeader className="px-6 py-4 border-b border-rose-500/10">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-rose-400" />
                <div>
                  <div className="text-xs uppercase tracking-widest text-rose-300">
                    riesgos detectados
                  </div>
                  <h2 className="text-lg font-medium text-white mt-1">
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
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <code className="text-sm text-white font-mono break-all">
                      {evt.type}
                    </code>
                    <Chip
                      size="sm"
                      color={severityColor(evt.severity)}
                      variant="flat"
                      className="text-[10px] uppercase tracking-wider"
                    >
                      {evt.severity}
                    </Chip>
                    <span className="text-xs text-white/40 font-mono">
                      paso {evt.step}
                    </span>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-lg p-4">
                    <div className="text-xs text-white/30 uppercase tracking-widest mb-2">
                      excerpt anonimizado
                    </div>
                    <p className="text-sm text-white/70 italic leading-relaxed">
                      "...{evt.excerpt}..."
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardBody>
          </Card>

          {/* Lo que salió bien */}
          <Card className="bg-emerald-500/[0.04] border border-emerald-500/15 mb-6">
            <CardHeader className="px-6 py-4 border-b border-emerald-500/10">
              <div>
                <div className="text-xs uppercase tracking-widest text-emerald-300">
                  fortalezas
                </div>
                <h2 className="text-lg font-medium text-white mt-1">
                  qué sí salió bien
                </h2>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <ul className="space-y-3">
                {report.strengths.map((s, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex gap-3 text-sm text-white/80 leading-relaxed"
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

          {/* Recomendación accionable */}
          <Card className="bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 border border-indigo-500/30 mb-6">
            <CardHeader className="px-6 py-4 border-b border-indigo-500/15">
              <div>
                <div className="text-xs uppercase tracking-widest text-indigo-300">
                  recomendación accionable
                </div>
                <h2 className="text-2xl font-semibold text-white mt-2 capitalize">
                  {report.recommendation.action}
                </h2>
              </div>
            </CardHeader>
            <CardBody className="p-6 space-y-5">
              <div>
                <div className="text-xs text-white/40 uppercase tracking-widest mb-1">
                  a quién aplica
                </div>
                <p className="text-sm text-white/80">
                  {report.recommendation.appliesTo}
                </p>
              </div>

              <div>
                <div className="text-xs text-white/40 uppercase tracking-widest mb-3">
                  qué hacer concretamente · próximos 7 días
                </div>
                <ol className="space-y-3">
                  {report.recommendation.nextWeekActions.map((a, i) => (
                    <li key={i} className="flex gap-4 text-sm">
                      <span className="text-indigo-300 font-mono text-xs mt-1 flex-shrink-0">
                        0{i + 1}
                      </span>
                      <span className="text-white/80 leading-relaxed">{a}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="text-xs text-white/40 uppercase tracking-widest mb-2">
                  razón
                </div>
                <p className="text-sm text-white/70 italic leading-relaxed">
                  {report.recommendation.reason}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Próximo paso para el manager */}
          <Card className="bg-white/[0.02] border border-white/5 mb-6">
            <CardBody className="p-6">
              <div className="text-xs uppercase tracking-widest text-white/40 mb-2">
                próximo paso para ti como manager
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                agenda 20 min con {id} esta semana para discutir el reporte
                juntos. la conversación más útil es alrededor de qué piensa
                él/ella sobre lo observado, no defender los resultados.
              </p>
            </CardBody>
          </Card>

          {/* Qué NO concluir */}
          <Card className="bg-white/[0.01] border border-white/5 mb-6">
            <CardHeader className="px-6 py-3 border-b border-white/5">
              <span className="text-xs uppercase tracking-widest text-white/40">
                qué NO concluir de este reporte
              </span>
            </CardHeader>
            <CardBody className="p-6 text-sm text-white/60 space-y-2 leading-relaxed">
              <p>
                · es un diagnóstico single-participant sobre 1 caso simulado — no
                evaluación general de desempeño.
              </p>
              <p>
                · no predice comportamiento en otras situaciones (otros flujos,
                otra presión).
              </p>
              <p>
                · no compara con otros del equipo — eso requiere diagnóstico
                completo.
              </p>
              <p>
                · no certifica capacidad o incapacidad — es señal sobre criterio
                en un escenario específico.
              </p>
            </CardBody>
          </Card>

          {/* Metadata técnica */}
          <Card className="bg-black/40 border border-white/5">
            <CardHeader className="px-6 py-3 border-b border-white/5">
              <span className="text-xs uppercase tracking-widest text-white/40 font-mono">
                metadata técnica · apéndice
              </span>
            </CardHeader>
            <CardBody className="p-6 space-y-2 text-xs text-white/50 font-mono">
              <div>
                <span className="text-white/30">evaluadores:</span> 2 consultores
                externos · cohen's kappa: {report.meta.kappa}
              </div>
              <div>
                <span className="text-white/30">LLM judge:</span> corre después
                de humanos · agreement {report.meta.judgeAgreement}% ·
                discrepancia en {report.meta.discrepancyCells} cells (sin
                tie-breaker)
              </div>
              <div>
                <span className="text-white/30">rúbrica:</span>{" "}
                {report.meta.rubricVersion}
              </div>
              <div>
                <span className="text-white/30">caso:</span>{" "}
                {report.meta.caseVersion}
              </div>
              <div>
                <span className="text-white/30">variante:</span>{" "}
                {report.meta.variant}
              </div>
            </CardBody>
          </Card>

          {/* CTAs */}
          <div className="mt-12 flex flex-col sm:flex-row gap-3">
            <Button
              as={Link}
              href="/simulator-design/dashboard"
              variant="bordered"
              className="border-white/15 text-white"
            >
              ← volver al dashboard
            </Button>
            <Button
              color="primary"
              className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white"
            >
              descargar PDF
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
