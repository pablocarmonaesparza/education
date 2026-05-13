"use client";

import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Link,
  Progress,
  Tooltip,
} from "@heroui/react";
import { motion } from "framer-motion";
import { SurfaceNav } from "../_components/SurfaceNav";
import {
  BAND_LABELS,
  BandKey,
  DIMENSIONS,
  TEAM_MEMBERS,
} from "../_data/case-data";

const TEAM_AGGREGATE: Record<string, BandKey> = {
  contexto: "A",
  privacidad: "M",
  validacion: "M",
  juicio: "M",
  decision: "A",
};

const RISK_EVENTS_TIMELINE = [
  {
    id: 1,
    severity: "high" as const,
    type: "exposed_pii_to_model",
    title: "PII expuesto al modelo corporativo",
    when: "hace 3 días",
    participantId: "P001",
  },
  {
    id: 2,
    severity: "medium" as const,
    type: "hidden_pii_usage_from_authority",
    title: "no se disclosó uso de PII a la VP",
    when: "hace 3 días",
    participantId: "P001",
  },
  {
    id: 3,
    severity: "medium" as const,
    type: "accept_output_no_validation",
    title: "aceptó cifras del LLM sin validar",
    when: "hace 2 días",
    participantId: "P002",
  },
  {
    id: 4,
    severity: "high" as const,
    type: "no_risk_flag_upward",
    title: "no objetó propuesta riesgosa del VP",
    when: "ayer",
    participantId: "P003",
  },
];

function bandColor(b: BandKey | null) {
  if (!b) return "default" as const;
  if (b === "A") return "success" as const;
  if (b === "M") return "warning" as const;
  return "danger" as const;
}

function bandPct(b: BandKey): number {
  if (b === "A") return 85;
  if (b === "M") return 55;
  return 25;
}

function bandIndicator(b: BandKey): string {
  if (b === "A")
    return "bg-gradient-to-r from-emerald-500/60 to-emerald-400";
  if (b === "M") return "bg-gradient-to-r from-amber-500/60 to-amber-400";
  return "bg-gradient-to-r from-rose-500/60 to-rose-400";
}

function ReadinessBadge({ band }: { band: BandKey | null }) {
  if (!band) {
    return (
      <Chip
        size="sm"
        variant="flat"
        classNames={{
          base: "h-5 bg-white/[0.04] border border-white/10",
          content: "text-[10px] tracking-wider text-white/45 uppercase",
        }}
      >
        pending
      </Chip>
    );
  }
  return (
    <Chip
      size="sm"
      variant="flat"
      color={bandColor(band)}
      classNames={{
        base:
          band === "A"
            ? "h-5 bg-emerald-500/15 border border-emerald-500/25"
            : band === "M"
            ? "h-5 bg-amber-500/15 border border-amber-500/25"
            : "h-5 bg-rose-500/15 border border-rose-500/25",
        content:
          band === "A"
            ? "text-[10px] text-emerald-300 mono uppercase tracking-wider"
            : band === "M"
            ? "text-[10px] text-amber-300 mono uppercase tracking-wider"
            : "text-[10px] text-rose-300 mono uppercase tracking-wider",
      }}
    >
      {band} · {BAND_LABELS[band]}
    </Chip>
  );
}

export default function DashboardPage() {
  const completedCount = TEAM_MEMBERS.filter(
    (m) => m.status === "completed",
  ).length;
  const inProgressCount = TEAM_MEMBERS.filter(
    (m) => m.status === "in_progress",
  ).length;

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <SurfaceNav />

      <div className="relative mx-auto max-w-7xl px-6 pt-10 pb-24">
        {/* Background mesh */}
        <div className="absolute top-0 right-0 w-[600px] h-[400px] aurora-soft opacity-40 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                  Sprint marketing_30d
                </span>
                <Chip
                  size="sm"
                  variant="flat"
                  classNames={{
                    base: "h-5 bg-emerald-500/15 border border-emerald-500/25",
                    content:
                      "text-[10px] tracking-wider text-emerald-300 uppercase font-medium flex items-center gap-1.5",
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  activo
                </Chip>
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.025em] leading-[1.05]">
                equipo de marketing
              </h1>
              <p className="text-white/55 mt-3 text-[15px]">
                semana 2 de 4 ·{" "}
                <span className="text-white/85">{completedCount}</span> de{" "}
                <span className="text-white/85">{TEAM_MEMBERS.length}</span>{" "}
                sesiones completadas
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                as={Link}
                href="/simulator-design/reporte/P001"
                size="md"
                radius="full"
                variant="flat"
                className="h-10 px-4 bg-white/[0.04] border border-white/10 text-white hover:bg-white/[0.08] hover:border-white/20 text-[13px]"
              >
                ver reporte individual →
              </Button>
              <Button
                size="md"
                radius="full"
                className="h-10 px-4 font-medium bg-white text-black hover:bg-white/90 text-[13px]"
              >
                exportar PDF
              </Button>
            </div>
          </div>

          {/* BENTO GRID — KPIs + Recomendación */}
          <div className="grid grid-cols-6 gap-3 mb-3">
            {/* Sprint progress — span 3 */}
            <Card
              className="col-span-6 md:col-span-3 bg-white/[0.025] border border-white/[0.06]"
              shadow="none"
            >
              <CardBody className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                      progreso del Sprint
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-5xl font-semibold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                        47
                      </span>
                      <span className="text-white/45 text-[14px]">%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] mono text-white/40 uppercase tracking-wider">
                      día
                    </div>
                    <div className="mono text-[18px] text-white mt-1">
                      14<span className="text-white/35">/30</span>
                    </div>
                  </div>
                </div>
                <Progress
                  aria-label="progreso del sprint, día 14 de 30"
                  value={47}
                  size="sm"
                  classNames={{
                    indicator:
                      "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500",
                    track: "bg-white/[0.06]",
                  }}
                />
                <div className="mt-6 pt-5 border-t border-white/[0.06] grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-2xl font-semibold text-white">
                      {completedCount}
                    </div>
                    <div className="text-[11px] text-white/45 mt-0.5 uppercase tracking-wider">
                      completas
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-white">
                      {inProgressCount}
                    </div>
                    <div className="text-[11px] text-white/45 mt-0.5 uppercase tracking-wider">
                      en proceso
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-white">
                      {TEAM_MEMBERS.length - completedCount - inProgressCount}
                    </div>
                    <div className="text-[11px] text-white/45 mt-0.5 uppercase tracking-wider">
                      pendientes
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Readiness */}
            <Card
              className="col-span-3 md:col-span-2 bg-white/[0.025] border border-white/[0.06]"
              shadow="none"
            >
              <CardBody className="p-6 h-full flex flex-col">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                  readiness global
                </div>
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-5xl font-semibold text-white tracking-tight">
                    M
                  </span>
                  <span className="text-white/55 text-[14px]">medio</span>
                </div>
                <div className="mt-auto pt-5">
                  <div className="flex items-center gap-1.5 mb-1.5 text-[10px] mono text-white/35 uppercase tracking-wider">
                    <span>baseline</span>
                    <span className="flex-1 h-px bg-white/10" />
                    <span>actual</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      classNames={{
                        base: "h-5 bg-rose-500/15 border border-rose-500/25",
                        content:
                          "text-[10px] text-rose-300 mono uppercase tracking-wider",
                      }}
                    >
                      B
                    </Chip>
                    <svg
                      className="flex-1 h-px text-white/15"
                      viewBox="0 0 100 1"
                      preserveAspectRatio="none"
                    >
                      <line
                        x1="0"
                        y1="0.5"
                        x2="100"
                        y2="0.5"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="2 3"
                      />
                    </svg>
                    <Chip
                      size="sm"
                      classNames={{
                        base: "h-5 bg-amber-500/15 border border-amber-500/25",
                        content:
                          "text-[10px] text-amber-300 mono uppercase tracking-wider",
                      }}
                    >
                      M
                    </Chip>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Risk events */}
            <Card
              className="col-span-3 md:col-span-1 bg-white/[0.025] border border-white/[0.06]"
              shadow="none"
            >
              <CardBody className="p-5 h-full flex flex-col">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                  risk events
                </div>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-5xl font-semibold text-white tracking-tight">
                    4
                  </span>
                </div>
                <div className="mt-auto pt-3 flex gap-1.5">
                  <Chip
                    size="sm"
                    classNames={{
                      base: "h-5 bg-rose-500/15 border border-rose-500/25",
                      content:
                        "text-[10px] text-rose-300 mono uppercase tracking-wider",
                    }}
                  >
                    2 high
                  </Chip>
                  <Chip
                    size="sm"
                    classNames={{
                      base: "h-5 bg-amber-500/15 border border-amber-500/25",
                      content:
                        "text-[10px] text-amber-300 mono uppercase tracking-wider",
                    }}
                  >
                    2 med
                  </Chip>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Main grid: dimensions heatmap + recomendación */}
          <div className="grid grid-cols-6 gap-3 mb-3">
            {/* Dimensions */}
            <Card
              className="col-span-6 md:col-span-4 bg-white/[0.025] border border-white/[0.06]"
              shadow="none"
            >
              <CardHeader className="px-6 py-4 border-b border-white/[0.06] flex-row justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                    agregado del equipo
                  </div>
                  <h3 className="text-[18px] font-semibold text-white mt-1.5">
                    5 dimensiones de criterio IA
                  </h3>
                </div>
                <Tooltip content="bandas A (alto) / M (medio) / B (bajo) por dimensión. no usamos scores puntuales por la varianza del judge.">
                  <Chip
                    size="sm"
                    variant="flat"
                    classNames={{
                      base: "h-5 bg-white/[0.04] border border-white/10 cursor-help",
                      content: "text-[10px] text-white/55",
                    }}
                  >
                    cómo se calcula
                  </Chip>
                </Tooltip>
              </CardHeader>
              <CardBody className="p-6 space-y-5">
                {DIMENSIONS.map((d, i) => {
                  const band = TEAM_AGGREGATE[d.id] as BandKey;
                  return (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-center text-[14px]">
                        <span className="capitalize text-white font-medium">
                          {d.label}
                        </span>
                        <ReadinessBadge band={band} />
                      </div>
                      <div className="relative h-2 bg-white/[0.05] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${bandPct(band)}%` }}
                          transition={{ duration: 0.7, delay: 0.1 + i * 0.05 }}
                          className={`absolute inset-y-0 left-0 rounded-full ${bandIndicator(band)}`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </CardBody>
            </Card>

            {/* Recomendación */}
            <Card
              className="col-span-6 md:col-span-2 bg-gradient-to-br from-indigo-500/[0.1] to-fuchsia-500/[0.08] border border-indigo-500/25 overflow-hidden"
              shadow="none"
            >
              <CardBody className="p-6 h-full flex flex-col">
                <div className="text-[11px] uppercase tracking-[0.2em] text-indigo-300 font-medium">
                  recomendación
                </div>
                <h3 className="text-2xl font-semibold text-white mt-2 capitalize">
                  entrenar
                </h3>
                <Chip
                  size="sm"
                  variant="flat"
                  classNames={{
                    base: "h-5 bg-indigo-500/20 border border-indigo-500/30 mt-3 self-start",
                    content:
                      "text-[10px] text-indigo-200 mono uppercase tracking-wider",
                  }}
                >
                  semana 2 → 4
                </Chip>
                <p className="text-[13px] text-white/75 leading-relaxed mt-4">
                  dimensión más débil:{" "}
                  <span className="text-white">privacidad</span>. 3 personas
                  dispararon{" "}
                  <code className="text-amber-200/80 mono text-[12px]">
                    expose_pii
                  </code>{" "}
                  en al menos 1 caso.
                </p>
                <p className="text-[13px] text-white/65 leading-relaxed mt-3">
                  segundo Sprint enfocado en privacidad + validación consolida
                  la mejora.
                </p>
                <Button
                  className="mt-auto w-full bg-white text-black hover:bg-white/90 font-medium h-10 text-[13px]"
                  radius="full"
                >
                  agendar segundo sprint →
                </Button>
              </CardBody>
            </Card>
          </div>

          {/* Team grid */}
          <Card
            className="bg-white/[0.025] border border-white/[0.06] mb-3"
            shadow="none"
          >
            <CardHeader className="px-6 py-4 border-b border-white/[0.06] flex-row justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                  tu equipo
                </div>
                <h3 className="text-[18px] font-semibold text-white mt-1.5">
                  {TEAM_MEMBERS.length} personas
                </h3>
              </div>
              <Tooltip content="los nombres están anonimizados. ves readiness agregada pero NO transcripts individuales — eso protege al empleado.">
                <Chip
                  size="sm"
                  variant="flat"
                  classNames={{
                    base: "h-5 bg-white/[0.04] border border-white/10 cursor-help",
                    content: "text-[10px] text-white/55",
                  }}
                >
                  por qué iniciales
                </Chip>
              </Tooltip>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-white/[0.05]">
                {TEAM_MEMBERS.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <Avatar
                      size="md"
                      name={m.initials}
                      classNames={{
                        base: "bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 border border-white/10 flex-shrink-0",
                        name: "text-white text-[13px] font-semibold",
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="mono text-[13px] text-white/45">
                          {m.id}
                        </span>
                        <span className="text-white text-[14px] font-medium">
                          {m.role}
                        </span>
                      </div>
                      <div className="text-[12px] text-white/45 mt-0.5">
                        {m.status === "completed" &&
                          `completó en ${m.sessionDuration} min`}
                        {m.status === "in_progress" && (
                          <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 pulse-ring" />
                            sesión en progreso
                          </span>
                        )}
                        {m.status === "not_started" && "no ha iniciado"}
                      </div>
                    </div>
                    <ReadinessBadge band={m.readiness} />
                    <Button
                      as={Link}
                      href={`/simulator-design/reporte/${m.id}`}
                      size="sm"
                      radius="full"
                      variant="flat"
                      className="bg-white/[0.04] border border-white/10 text-white hover:bg-white/[0.08] text-[12px] h-8"
                      isDisabled={m.status !== "completed"}
                    >
                      ver →
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Risk events timeline */}
          <Card
            className="bg-white/[0.025] border border-white/[0.06]"
            shadow="none"
          >
            <CardHeader className="px-6 py-4 border-b border-white/[0.06]">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                  risk events
                </div>
                <h3 className="text-[18px] font-semibold text-white mt-1.5">
                  timeline · últimos 7 días
                </h3>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4 relative">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.06]" />
                {RISK_EVENTS_TIMELINE.map((evt, i) => (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="relative flex items-start gap-4 pl-1"
                  >
                    <div
                      className={`relative flex-shrink-0 h-3.5 w-3.5 rounded-full mt-1.5 z-10 ${
                        evt.severity === "high"
                          ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                          : "bg-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                      }`}
                    >
                      <div
                        className={`absolute inset-0 rounded-full ${
                          evt.severity === "high"
                            ? "bg-rose-500"
                            : "bg-amber-500"
                        } animate-ping opacity-30`}
                      />
                    </div>
                    <div className="flex-1 min-w-0 pl-2">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Chip
                              size="sm"
                              classNames={{
                                base:
                                  evt.severity === "high"
                                    ? "h-5 bg-rose-500/15 border border-rose-500/25"
                                    : "h-5 bg-amber-500/15 border border-amber-500/25",
                                content:
                                  evt.severity === "high"
                                    ? "text-[10px] text-rose-300 mono uppercase tracking-wider"
                                    : "text-[10px] text-amber-300 mono uppercase tracking-wider",
                              }}
                            >
                              {evt.severity}
                            </Chip>
                            <code className="text-[11px] text-white/55 mono break-all">
                              {evt.type}
                            </code>
                          </div>
                          <div className="text-[14px] text-white/85 leading-snug">
                            {evt.title}
                          </div>
                          <div className="text-[11px] text-white/40 mt-1">
                            participante {evt.participantId} · {evt.when}
                          </div>
                        </div>
                        <Link
                          href={`/simulator-design/reporte/${evt.participantId}`}
                          size="sm"
                          className="text-white/45 hover:text-white text-[12px] flex-shrink-0"
                        >
                          detalle →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
