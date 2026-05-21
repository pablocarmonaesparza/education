"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  AppleBadge,
  AppleButton,
  AppleCard,
  AppleCardBody,
  AppleIcon,
  AppleProgress,
  AppleStepDots,
} from "@/components/simulador/apple";

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";
type DataAction = "usar" | "mascarar" | "resumir" | "rango" | "excluir";

type DataRow = {
  id: string;
  field: string;
  sample: string;
  action: DataAction;
  note: string;
  sensitivity: number;
  usefulness: number;
};

const caseSteps = [
  { id: "contexto", label: "Contexto", status: "completed" as const },
  { id: "datos", label: "Datos", status: "completed" as const },
  { id: "ia", label: "IA", status: "current" as const },
  { id: "revision", label: "Revision", status: "pending" as const },
  { id: "decision", label: "Decision", status: "pending" as const },
  { id: "respuesta", label: "Respuesta", status: "pending" as const },
];

const initialDataRows: DataRow[] = [
  {
    id: "contact_name",
    field: "Nombre del contacto",
    sample: "Mariana Robles",
    action: "mascarar",
    note: "identificador personal",
    sensitivity: 86,
    usefulness: 24,
  },
  {
    id: "company",
    field: "Empresa",
    sample: "Aurora SaaS",
    action: "usar",
    note: "contexto comercial",
    sensitivity: 18,
    usefulness: 82,
  },
  {
    id: "email",
    field: "Email",
    sample: "mariana@aurora.example",
    action: "excluir",
    note: "no aporta señal",
    sensitivity: 94,
    usefulness: 12,
  },
  {
    id: "tickets",
    field: "Tickets recientes",
    sample: "12 conversaciones",
    action: "resumir",
    note: "usar patrones, no texto crudo",
    sensitivity: 58,
    usefulness: 78,
  },
  {
    id: "arr",
    field: "ARR",
    sample: "$84,000",
    action: "rango",
    note: "suficiente para priorizar",
    sensitivity: 42,
    usefulness: 68,
  },
];

const outputLines = [
  {
    id: "claim",
    text: "Aurora SaaS puede reducir churn 40% en 30 dias con nuestro agente.",
    flag: "claim no verificado",
    tone: "danger" as const,
  },
  {
    id: "pii",
    text: "La propuesta se enviara a mariana@aurora.example antes de legal.",
    flag: "dato personal + aprobacion faltante",
    tone: "danger" as const,
  },
  {
    id: "safe",
    text: "Recomendamos iniciar con un piloto interno y aprobacion humana.",
    flag: "usable",
    tone: "success" as const,
  },
];

const decisionOptions = [
  {
    id: "launch",
    title: "Lanzar hoy",
    risk: "alto",
    detail: "Maxima velocidad, pero publica claims y datos sin validacion.",
    tone: "danger" as const,
  },
  {
    id: "pilot",
    title: "Piloto con aprobacion",
    risk: "controlado",
    detail: "Mantiene avance, exige revision legal y medicion clara.",
    tone: "success" as const,
  },
  {
    id: "internal",
    title: "Solo uso interno",
    risk: "medio",
    detail: "Reduce exposicion, pero no prueba impacto con clientes.",
    tone: "warning" as const,
  },
  {
    id: "pause",
    title: "Pausar",
    risk: "bajo",
    detail: "Evita riesgo inmediato, pero no genera aprendizaje operativo.",
    tone: "neutral" as const,
  },
];

const actionOptions: DataAction[] = ["usar", "mascarar", "resumir", "rango", "excluir"];

export function ExerciseLabClient() {
  const [deadlineMinutes, setDeadlineMinutes] = useState(18);
  const [audiencePressure, setAudiencePressure] = useState(72);
  const [dataRows, setDataRows] = useState(initialDataRows);
  const [uploadedFile, setUploadedFile] = useState("tickets_enterprise_sample.csv");
  const [creativity, setCreativity] = useState(22);
  const [autonomy, setAutonomy] = useState(35);
  const [selectedChecks, setSelectedChecks] = useState<string[]>(["claim", "pii"]);
  const [decision, setDecision] = useState("pilot");
  const [impact, setImpact] = useState(76);
  const [riskTolerance, setRiskTolerance] = useState(28);
  const [memo, setMemo] = useState(
    "Recomiendo piloto con aprobacion humana, no lanzamiento directo.\n\nMotivo: el output inicial incluye un claim no verificable y datos personales que no deben entrar a una campaña externa. Podemos avanzar hoy si limitamos el uso a borrador interno, eliminamos PII, pedimos fuente para cualquier metrica y dejamos Legal como aprobador antes de envio.\n\nSiguiente paso: generar version limpia, validar claims y revisar con Legal antes de las 5.",
  );

  const sensitiveFields = dataRows.filter((row) => row.sensitivity >= 70).length;
  const usableSignals = dataRows.filter((row) => row.action !== "excluir").length;
  const evidenceScore = Math.round(
    (100 - riskTolerance + impact + selectedChecks.length * 18 + usableSignals * 7) / 4,
  );

  const promptPreview = useMemo(() => {
    const allowed = dataRows
      .filter((row) => row.action !== "excluir")
      .map((row) => `${row.field.toLowerCase()} (${row.action})`)
      .join(", ");
    const autonomyRule =
      autonomy > 70
        ? "Puede proponer plan de envio, pero requiere aprobacion humana."
        : "Solo debe generar borrador interno y checklist de aprobacion.";
    return `Actua como marketer B2B. Crea un borrador de campaña enterprise usando solo: ${allowed}. Creatividad ${creativity}/100. ${autonomyRule} No uses datos personales, descuentos ni metricas sin fuente.`;
  }, [autonomy, creativity, dataRows]);

  const updateRow = (rowId: string, patch: Partial<DataRow>) => {
    setDataRows((rows) => rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)));
  };

  const toggleCheck = (id: string) => {
    setSelectedChecks((checks) =>
      checks.includes(id) ? checks.filter((check) => check !== id) : [...checks, id],
    );
  };

  return (
    <main className="simulador-root min-h-screen surface-canvas">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="max-w-4xl">
            <AppleBadge tone="neutral">laboratorio interno</AppleBadge>
            <h1 className="display mt-5 text-[3rem] leading-[1.02] md:text-[4.5rem]">
              Ejercicios dinámicos.
            </h1>
            <p className="mt-5 max-w-[62ch] text-[1.0625rem] leading-7 text-[var(--text-secondary)]">
              Un caso completo con controles vivos: sliders, carga de archivo, tabla editable, revisión de output, decisión con tradeoffs y evidencia para manager.
            </p>
          </div>

          <AppleCard variant="elevated" padding="lg" className="border-[var(--border)]">
            <p className="text-[0.8125rem] font-medium text-[var(--text-tertiary)]">
              caso demo
            </p>
            <h2 className="mt-2 text-[1.375rem] font-semibold tracking-[-0.022em] text-[var(--text-primary)]">
              Campaña urgente con datos sensibles
            </h2>
            <div className="mt-6">
              <AppleStepDots steps={caseSteps} />
            </div>
          </AppleCard>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <MiniMetric label="timer actual" value={`${deadlineMinutes} min`} />
          <MiniMetric label="campos sensibles" value={`${sensitiveFields}`} />
          <MiniMetric label="evidencia emitida" value={`${Math.min(100, evidenceScore)}%`} />
        </div>

        <div className="grid gap-6">
          <ExerciseSection
            id="contexto"
            number="1"
            title="Contexto"
            subtitle="Ajusta la presión del caso y encuadra que decision se necesita."
          >
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <AppleCard variant="default" padding="md" className="border-[var(--border)]">
                <p className="text-[0.8125rem] font-medium text-[var(--text-tertiary)]">
                  mensaje recibido
                </p>
                <p className="mt-3 text-[1rem] leading-7 text-[var(--text-primary)]">
                  “Necesito una campaña para enterprise antes de las 5. Usa los tickets, el CRM y lo que tengamos. El VP quiere ver algo hoy.”
                </p>
                <div className="mt-5 grid gap-4">
                  <SliderControl
                    id="deadline-minutes"
                    label="tiempo disponible"
                    value={deadlineMinutes}
                    min={6}
                    max={30}
                    suffix=" min"
                    onChange={setDeadlineMinutes}
                  />
                  <SliderControl
                    id="audience-pressure"
                    label="presion de stakeholder"
                    value={audiencePressure}
                    min={0}
                    max={100}
                    suffix="%"
                    onChange={setAudiencePressure}
                  />
                </div>
              </AppleCard>

              <div className="grid gap-4">
                <HigField
                  label="decision que debe poder tomar el manager"
                  defaultValue="Si podemos lanzar un piloto externo o solo un borrador interno."
                />
                <HigField
                  label="audiencia"
                  defaultValue={audiencePressure > 70 ? "VP + Legal + Customer Success" : "VP de Marketing"}
                />
                <DynamicSignal
                  title="lectura del caso"
                  tone={deadlineMinutes < 12 || audiencePressure > 80 ? "warning" : "success"}
                  body={
                    deadlineMinutes < 12 || audiencePressure > 80
                      ? "Timer y presion altos: el ejercicio debe premiar control minimo, no velocidad pura."
                      : "Presion manejable: el ejercicio puede exigir mas iteracion y validacion."
                  }
                />
              </div>
            </div>
          </ExerciseSection>

          <ExerciseSection
            id="datos"
            number="2"
            title="Datos"
            subtitle="Sube una muestra, ajusta sensibilidad/utilidad y decide que entra al contexto."
          >
            <div className="grid gap-4">
              <AppleCard variant="default" padding="md" className="border-[var(--border)]">
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-[0.8125rem] font-medium text-[var(--text-tertiary)]">
                      demo de carga
                    </p>
                    <p className="mt-2 text-[1rem] font-semibold text-[var(--text-primary)]">
                      {uploadedFile}
                    </p>
                    <p className="mt-1 text-[0.875rem] text-[var(--text-secondary)]">
                      Simula una tabla del CRM o un CSV de tickets. No se sube a servidor en este lab.
                    </p>
                  </div>
                  <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-[0.9375rem] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-2)]">
                    cambiar archivo
                    <input
                      className="sr-only"
                      type="file"
                      accept=".csv,.xlsx,.json,.txt"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) setUploadedFile(file.name);
                      }}
                    />
                  </label>
                </div>
              </AppleCard>

              <AppleCard variant="default" padding="none" className="overflow-hidden border-[var(--border)]">
                <div className="grid min-w-[920px] grid-cols-[1.05fr_0.9fr_1.1fr_1fr_1fr] border-b border-[var(--hairline)] bg-[var(--surface-2)] px-4 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                  <span>campo</span>
                  <span>muestra</span>
                  <span>accion</span>
                  <span>sensibilidad</span>
                  <span>utilidad IA</span>
                </div>
                <div className="overflow-x-auto">
                  {dataRows.map((row) => (
                    <div
                      key={row.id}
                      className="grid min-w-[920px] grid-cols-[1.05fr_0.9fr_1.1fr_1fr_1fr] items-center gap-3 border-b border-[var(--hairline)] px-4 py-4 last:border-b-0"
                    >
                      <div>
                        <p className="text-[0.9375rem] font-medium text-[var(--text-primary)]">
                          {row.field}
                        </p>
                        <p className="mt-1 text-[0.75rem] text-[var(--text-tertiary)]">{row.note}</p>
                      </div>
                      <span className="text-[0.875rem] text-[var(--text-secondary)]">{row.sample}</span>
                      <SegmentedAction
                        value={row.action}
                        onChange={(action) => updateRow(row.id, { action })}
                      />
                      <MiniSlider
                        label={`${row.field} sensibilidad`}
                        value={row.sensitivity}
                        onChange={(sensitivity) => updateRow(row.id, { sensitivity })}
                      />
                      <MiniSlider
                        label={`${row.field} utilidad`}
                        value={row.usefulness}
                        onChange={(usefulness) => updateRow(row.id, { usefulness })}
                      />
                    </div>
                  ))}
                </div>
              </AppleCard>
            </div>
          </ExerciseSection>

          <ExerciseSection
            id="ia"
            number="3"
            title="IA"
            subtitle="Ajusta creatividad, autonomia y guardrails; el prompt cambia en vivo."
          >
            <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
              <div className="grid gap-4">
                <HigField label="objetivo" defaultValue="Crear primer borrador de campaña enterprise" />
                <SliderControl
                  id="creativity"
                  label="creatividad permitida"
                  value={creativity}
                  min={0}
                  max={100}
                  suffix="%"
                  onChange={setCreativity}
                />
                <SliderControl
                  id="autonomy"
                  label="autonomia de IA"
                  value={autonomy}
                  min={0}
                  max={100}
                  suffix="%"
                  onChange={setAutonomy}
                />
                <GuardrailChecklist />
                <AppleButton className="w-fit" tone="primary">
                  regenerar preview
                </AppleButton>
              </div>
              <AppleCard variant="default" padding="md" className="border-[var(--border)] bg-[var(--surface-2)]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <AppleBadge tone="accent">prompt vivo</AppleBadge>
                  <AppleBadge tone={autonomy > 70 ? "warning" : "success"}>
                    autonomia {autonomy}%
                  </AppleBadge>
                </div>
                <p className="text-[0.9375rem] leading-7 text-[var(--text-primary)]">
                  {promptPreview}
                </p>
              </AppleCard>
            </div>
          </ExerciseSection>

          <ExerciseSection
            id="revision"
            number="4"
            title="Revisión"
            subtitle="Marca segmentos, observa el conteo de riesgo y escribe la correccion."
          >
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <AppleBadge tone={selectedChecks.length >= 2 ? "danger" : "warning"}>
                  {selectedChecks.length} flags activos
                </AppleBadge>
                <AppleBadge tone="neutral">evidencia: flagged_segments</AppleBadge>
              </div>
              {outputLines.map((line) => (
                <label
                  key={line.id}
                  className="grid cursor-pointer gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-[2rem_minmax(0,1fr)_auto] md:items-start"
                >
                  <input
                    checked={selectedChecks.includes(line.id)}
                    onChange={() => toggleCheck(line.id)}
                    type="checkbox"
                    className="mt-1 h-5 w-5 rounded border-[var(--border)] accent-[var(--accent)]"
                    aria-label={`marcar ${line.flag}`}
                  />
                  <span className="text-[0.9375rem] leading-6 text-[var(--text-primary)]">
                    {line.text}
                  </span>
                  <AppleBadge tone={line.tone}>{line.flag}</AppleBadge>
                </label>
              ))}
              <HigTextarea
                label="correccion que pedirias a IA"
                minRows={3}
                defaultValue="Reescribe sin prometer resultados cuantificados, elimina emails/personas y agrega aprobacion legal antes de uso externo."
              />
            </div>
          </ExerciseSection>

          <ExerciseSection
            id="decision"
            number="5"
            title="Decisión"
            subtitle="Mueve impacto y tolerancia de riesgo; elige una accion defendible."
          >
            <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
              <AppleCard variant="default" padding="md" className="border-[var(--border)] bg-[var(--surface-2)]">
                <SliderControl
                  id="impact"
                  label="impacto esperado"
                  value={impact}
                  min={0}
                  max={100}
                  suffix="%"
                  onChange={setImpact}
                />
                <div className="mt-5">
                  <SliderControl
                    id="risk-tolerance"
                    label="tolerancia de riesgo"
                    value={riskTolerance}
                    min={0}
                    max={100}
                    suffix="%"
                    onChange={setRiskTolerance}
                  />
                </div>
                <DynamicSignal
                  title="recomendacion viva"
                  tone={riskTolerance > 65 ? "warning" : decision === "pilot" ? "success" : "neutral"}
                  body={
                    riskTolerance > 65
                      ? "La tolerancia esta alta: pedir aprobacion o pausar protege mejor el caso."
                      : decision === "pilot"
                        ? "Piloto con aprobacion balancea aprendizaje, control y velocidad."
                        : "La decision queda defendible si explicas tradeoff y siguiente paso."
                  }
                />
              </AppleCard>

              <div className="grid gap-3 md:grid-cols-2">
                {decisionOptions.map((option) => (
                  <label
                    key={option.id}
                    className="cursor-pointer rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        name="decision"
                        checked={decision === option.id}
                        onChange={() => setDecision(option.id)}
                        type="radio"
                        className="mt-1 h-5 w-5 accent-[var(--accent)]"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-[var(--text-primary)]">{option.title}</span>
                          <AppleBadge tone={option.tone}>{option.risk}</AppleBadge>
                        </div>
                        <p className="mt-2 text-[0.875rem] leading-5 text-[var(--text-secondary)]">
                          {option.detail}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </ExerciseSection>

          <ExerciseSection
            id="respuesta"
            number="6"
            title="Respuesta"
            subtitle="Redacta el memo y revisa como se traduciria a evidencia para manager."
          >
            <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
              <HigTextarea
                label="respuesta al manager"
                minRows={9}
                value={memo}
                onChange={setMemo}
              />
              <AppleCard variant="elevated" padding="md" className="border-[var(--border)]">
                <p className="text-[0.8125rem] font-medium text-[var(--text-tertiary)]">
                  evidencia para reporte
                </p>
                <div className="mt-5 grid gap-4">
                  <EvidenceMetric label="contexto" value={Math.min(96, 55 + Math.round(audiencePressure / 3))} />
                  <EvidenceMetric label="datos" value={Math.max(35, 90 - sensitiveFields * 10)} />
                  <EvidenceMetric label="validacion" value={Math.min(98, 52 + selectedChecks.length * 18)} />
                </div>
                <div className="mt-5 rounded-[var(--radius-md)] bg-[var(--band-m-bg)] p-3">
                  <p className="text-[0.8125rem] leading-5 text-[var(--band-m-text)]">
                    recomendacion: entrenar en minimizacion de datos antes de permitir automatizacion externa.
                  </p>
                </div>
              </AppleCard>
            </div>
          </ExerciseSection>
        </div>
      </section>
    </main>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <AppleCard variant="default" padding="md" className="border-[var(--border)]">
      <p className="text-[0.8125rem] font-medium text-[var(--text-tertiary)]">{label}</p>
      <p className="mt-2 text-[1.375rem] font-semibold tracking-[-0.022em] text-[var(--text-primary)]">
        {value}
      </p>
    </AppleCard>
  );
}

function ExerciseSection({
  id,
  number,
  title,
  subtitle,
  children,
}: {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <AppleCard variant="default" padding="none" className="border-[var(--border)]">
        <AppleCardBody className="grid gap-6 p-5 md:p-7">
          <div className="grid gap-4 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-[0.9375rem] font-semibold text-white">
                  {number}
                </span>
                <AppleBadge tone="neutral">seccion</AppleBadge>
              </div>
              <h2 className="mt-4 text-[2rem] font-semibold tracking-[-0.022em] text-[var(--text-primary)]">
                {title}
              </h2>
              <p className="mt-2 text-[0.9375rem] leading-6 text-[var(--text-secondary)]">
                {subtitle}
              </p>
            </div>
            <div className="min-w-0">{children}</div>
          </div>
        </AppleCardBody>
      </AppleCard>
    </section>
  );
}

function SliderControl({
  id,
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="flex items-center justify-between gap-3 text-[0.875rem]">
        <span className="font-medium text-[var(--text-secondary)]">{label}</span>
        <span className="font-semibold text-[var(--text-primary)]">
          {value}
          {suffix}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--surface-3)] accent-[var(--accent)]"
      />
    </div>
  );
}

function MiniSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="sr-only">{label}</span>
      <span className="text-[0.8125rem] font-medium text-[var(--text-primary)]">{value}%</span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--surface-3)] accent-[var(--accent)]"
      />
    </label>
  );
}

function SegmentedAction({
  value,
  onChange,
}: {
  value: DataAction;
  onChange: (value: DataAction) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {actionOptions.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={[
            "rounded-[var(--radius-xs)] px-2 py-1 text-[0.75rem] font-medium transition-colors",
            value === option
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]",
          ].join(" ")}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function GuardrailChecklist() {
  const [checked, setChecked] = useState(["sin PII", "approval gate", "fuentes"]);
  const options = ["sin PII", "approval gate", "fuentes", "log de cambios", "fallback humano"];
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-[0.8125rem] font-medium text-[var(--text-secondary)]">
        guardrails incluidos
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const isChecked = checked.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() =>
                setChecked((items) =>
                  items.includes(option)
                    ? items.filter((item) => item !== option)
                    : [...items, option],
                )
              }
              className={[
                "inline-flex min-h-9 items-center gap-2 rounded-[var(--radius-sm)] px-3 text-[0.8125rem] font-medium transition-colors",
                isChecked
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "bg-[var(--surface-2)] text-[var(--text-secondary)]",
              ].join(" ")}
            >
              {isChecked && <AppleIcon name="check" size="xs" />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DynamicSignal({
  title,
  body,
  tone,
}: {
  title: string;
  body: string;
  tone: BadgeTone;
}) {
  return (
    <AppleCard variant={tone === "success" ? "success" : tone === "warning" ? "warning" : "default"} padding="md">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-[var(--accent)]">
          <AppleIcon name={tone === "warning" ? "alert" : "sparkles"} size="sm" />
        </span>
        <div>
          <p className="text-[0.9375rem] font-semibold text-[var(--text-primary)]">{title}</p>
          <p className="mt-1 text-[0.875rem] leading-5 text-[var(--text-secondary)]">{body}</p>
        </div>
      </div>
    </AppleCard>
  );
}

function HigField({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.8125rem] font-medium text-[var(--text-secondary)]">
        {label}
      </span>
      <input
        defaultValue={defaultValue}
        className="min-h-11 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-[0.9375rem] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
      />
    </label>
  );
}

function HigTextarea({
  label,
  defaultValue,
  value,
  onChange,
  minRows = 4,
}: {
  label: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  minRows?: number;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.8125rem] font-medium text-[var(--text-secondary)]">
        {label}
      </span>
      <textarea
        defaultValue={defaultValue}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        rows={minRows}
        className="resize-none rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-[0.9375rem] leading-6 text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
      />
    </label>
  );
}

function EvidenceMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[0.875rem] text-[var(--text-secondary)]">{label}</span>
        <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">{value}%</span>
      </div>
      <AppleProgress value={value} aria-label={label} />
    </div>
  );
}
