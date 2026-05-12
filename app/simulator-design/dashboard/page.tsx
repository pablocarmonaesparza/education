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
    when: "hace 3 días",
    participantId: "P001",
  },
  {
    id: 2,
    severity: "medium" as const,
    type: "hidden_pii_usage_from_authority",
    when: "hace 3 días",
    participantId: "P001",
  },
  {
    id: 3,
    severity: "medium" as const,
    type: "accept_output_no_validation",
    when: "hace 2 días",
    participantId: "P002",
  },
  {
    id: 4,
    severity: "high" as const,
    type: "no_risk_flag_upward",
    when: "ayer",
    participantId: "P003",
  },
];

const SEVERITY_COLOR: Record<
  "critical" | "high" | "medium" | "low",
  "danger" | "warning" | "secondary" | "default"
> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "default",
};

function bandColor(
  b: BandKey | null,
): "success" | "warning" | "danger" | "default" {
  if (!b) return "default";
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
  if (b === "A") return 85;
  if (b === "M") return 55;
  return 25;
}

function ReadinessBadge({ band }: { band: BandKey | null }) {
  if (!band) {
    return (
      <Chip
        size="sm"
        variant="flat"
        className="bg-white/5 text-white/40 text-[10px]"
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
      className="font-mono text-xs"
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
  const sprintDayPct = 47;

  return (
    <div className="min-h-screen bg-black text-white">
      <SurfaceNav />

      <div className="mx-auto max-w-7xl px-6 pt-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <div className="text-xs uppercase tracking-widest text-white/40 mb-2">
                Sprint marketing_30d · activo
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                equipo de marketing
              </h1>
              <p className="text-white/50 mt-2">
                semana 2 de 4 · {completedCount} de {TEAM_MEMBERS.length} sesiones
                completadas
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button
                as={Link}
                href="/simulator-design/reporte/P001"
                variant="bordered"
                className="border-white/15 text-white"
              >
                ver reporte individual →
              </Button>
              <Button
                color="primary"
                className="bg-gradient-to-r from-indigo-500 to-fuchsia-500"
              >
                exportar PDF
              </Button>
            </div>
          </div>

          {/* Sprint progress + KPIs */}
          <div className="grid md:grid-cols-4 gap-3 mb-8">
            <Card className="bg-white/[0.02] border border-white/5 md:col-span-2">
              <CardBody className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-widest text-white/40">
                    progreso del sprint
                  </span>
                  <span className="text-xs font-mono text-white/40">
                    día 14 / 30
                  </span>
                </div>
                <Progress
                  aria-label="progreso del sprint, día 14 de 30"
                  value={sprintDayPct}
                  classNames={{
                    indicator:
                      "bg-gradient-to-r from-indigo-500 to-fuchsia-500",
                    track: "bg-white/5",
                  }}
                />
                <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/5 text-center">
                  <div>
                    <div className="text-2xl font-semibold text-white">
                      {completedCount}
                    </div>
                    <div className="text-xs text-white/40 mt-1">completas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-white">
                      {inProgressCount}
                    </div>
                    <div className="text-xs text-white/40 mt-1">en proceso</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold text-white">
                      {TEAM_MEMBERS.length - completedCount - inProgressCount}
                    </div>
                    <div className="text-xs text-white/40 mt-1">pendientes</div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-white/[0.02] border border-white/5">
              <CardBody className="p-5">
                <span className="text-xs uppercase tracking-widest text-white/40">
                  readiness global
                </span>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-4xl font-semibold text-white">M</span>
                  <span className="text-white/40 text-sm">medio</span>
                </div>
                <p className="text-xs text-white/40 mt-2 leading-relaxed">
                  equipo en formación. mejorando vs baseline.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-white/[0.02] border border-white/5">
              <CardBody className="p-5">
                <span className="text-xs uppercase tracking-widest text-white/40">
                  risk events
                </span>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-4xl font-semibold text-white">
                    {RISK_EVENTS_TIMELINE.length}
                  </span>
                  <span className="text-white/40 text-sm">eventos</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <Chip
                    size="sm"
                    color="danger"
                    variant="flat"
                    className="text-[10px]"
                  >
                    2 high
                  </Chip>
                  <Chip
                    size="sm"
                    color="warning"
                    variant="flat"
                    className="text-[10px]"
                  >
                    2 medium
                  </Chip>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-3 mb-8">
            {/* Heatmap de dimensiones — usando HeroUI Progress */}
            <Card className="bg-white/[0.02] border border-white/5 lg:col-span-2">
              <CardHeader className="px-5 py-4 border-b border-white/5">
                <div>
                  <div className="text-xs uppercase tracking-widest text-white/40">
                    agregado del equipo
                  </div>
                  <h3 className="text-lg font-medium text-white mt-1">
                    5 dimensiones de criterio IA
                  </h3>
                </div>
              </CardHeader>
              <CardBody className="p-5 space-y-4">
                {DIMENSIONS.map((d) => {
                  const band = TEAM_AGGREGATE[d.id] as BandKey;
                  return (
                    <div key={d.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="capitalize text-white/80">
                          {d.label}
                        </span>
                        <ReadinessBadge band={band} />
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
                    </div>
                  );
                })}
              </CardBody>
            </Card>

            {/* Recomendación accionable */}
            <Card className="bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 border border-indigo-500/30">
              <CardHeader className="px-5 py-4 border-b border-white/5">
                <div>
                  <div className="text-xs uppercase tracking-widest text-indigo-300">
                    recomendación
                  </div>
                  <h3 className="text-lg font-medium text-white mt-1">
                    acción para esta semana
                  </h3>
                </div>
              </CardHeader>
              <CardBody className="p-5">
                <Chip
                  size="md"
                  color="primary"
                  variant="flat"
                  className="mb-3 bg-indigo-500/20 text-indigo-200 font-medium"
                >
                  entrenar
                </Chip>
                <p className="text-sm text-white/70 leading-relaxed mb-4">
                  el equipo muestra criterio en formación. dimensión más débil:
                  <span className="text-white"> privacidad</span>. 3 personas
                  dispararon "expose_pii" en al menos 1 caso.
                </p>
                <p className="text-sm text-white/60 leading-relaxed">
                  <span className="text-white">próxima acción:</span> corre un
                  segundo Sprint enfocado en privacidad + validación (mismo
                  equipo, casos nuevos, 30 días). la re-simulación mostró
                  transferencia parcial.
                </p>
                <Button
                  className="mt-5 w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-medium"
                  size="md"
                >
                  agendar segundo sprint
                </Button>
              </CardBody>
            </Card>
          </div>

          {/* Grid del equipo */}
          <Card className="bg-white/[0.02] border border-white/5 mb-8">
            <CardHeader className="px-5 py-4 border-b border-white/5 flex-row justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/40">
                  tu equipo
                </div>
                <h3 className="text-lg font-medium text-white mt-1">
                  {TEAM_MEMBERS.length} personas
                </h3>
              </div>
              <Tooltip content="los nombres están anonimizados como parte del experimento. tu manager ve readiness agregada pero NO transcripts individuales.">
                <Chip
                  size="sm"
                  variant="flat"
                  className="bg-white/5 text-white/60 text-[10px] cursor-help"
                >
                  por qué iniciales
                </Chip>
              </Tooltip>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-white/5">
                {TEAM_MEMBERS.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="px-5 py-4 flex flex-wrap md:flex-nowrap items-center gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <Avatar
                      size="md"
                      name={m.initials}
                      className="bg-gradient-to-br from-indigo-500/30 to-fuchsia-500/30 text-white border border-white/10 font-medium flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-white/50">
                          {m.id}
                        </span>
                        <span className="text-white text-sm">{m.role}</span>
                      </div>
                      <div className="text-xs text-white/40 mt-1">
                        {m.status === "completed" &&
                          `completó en ${m.sessionDuration} min`}
                        {m.status === "in_progress" && "sesión en progreso"}
                        {m.status === "not_started" && "no ha iniciado"}
                      </div>
                    </div>
                    <ReadinessBadge band={m.readiness} />
                    <Button
                      as={Link}
                      href={`/simulator-design/reporte/${m.id}`}
                      size="sm"
                      variant="light"
                      className="text-white/60"
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
          <Card className="bg-white/[0.02] border border-white/5">
            <CardHeader className="px-5 py-4 border-b border-white/5">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/40">
                  risk events
                </div>
                <h3 className="text-lg font-medium text-white mt-1">
                  timeline · últimos 7 días
                </h3>
              </div>
            </CardHeader>
            <CardBody className="p-5 space-y-3">
              {RISK_EVENTS_TIMELINE.map((evt) => (
                <div
                  key={evt.id}
                  className="flex items-start gap-4 pb-3 border-b border-white/5 last:border-0 last:pb-0"
                >
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        evt.severity === "high"
                          ? "bg-rose-400 shadow-[0_0_8px_rgb(244,63,94)]"
                          : "bg-amber-400 shadow-[0_0_8px_rgb(251,191,36)]"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Chip
                        size="sm"
                        color={SEVERITY_COLOR[evt.severity]}
                        variant="flat"
                        className="text-[10px] uppercase tracking-wider"
                      >
                        {evt.severity}
                      </Chip>
                      <code className="text-xs text-white/70 font-mono break-all">
                        {evt.type}
                      </code>
                    </div>
                    <div className="text-xs text-white/40 mt-1">
                      participante anónimo {evt.participantId} · {evt.when}
                    </div>
                  </div>
                  <Link
                    href={`/simulator-design/reporte/${evt.participantId}`}
                    size="sm"
                    className="text-white/40 hover:text-white text-xs"
                  >
                    detalle →
                  </Link>
                </div>
              ))}
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
