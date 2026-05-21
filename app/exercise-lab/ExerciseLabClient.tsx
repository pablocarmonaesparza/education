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
type DataAction = "usar" | "anonimizar" | "agregar" | "excluir" | "pedir permiso";

type DataRow = {
  id: string;
  field: string;
  sample: string;
  personal: boolean;
  necessary: boolean;
  action: DataAction;
  note: string;
};

type DecisionOption = {
  id: string;
  title: string;
  tone: BadgeTone;
  badge: string;
  detail: string;
  consequences: {
    label: string;
    value: number;
    tone: BadgeTone;
  }[];
};

const caseSteps = [
  { id: "contexto", label: "Contexto", status: "completed" as const },
  { id: "datos", label: "Datos", status: "completed" as const },
  { id: "ia", label: "IA", status: "current" as const },
  { id: "revision", label: "Revisión", status: "pending" as const },
  { id: "decision", label: "Decisión", status: "pending" as const },
  { id: "respuesta", label: "Respuesta", status: "pending" as const },
];

const initialDataRows: DataRow[] = [
  {
    id: "contact_name",
    field: "Nombre del contacto",
    sample: "Mariana Robles",
    personal: true,
    necessary: false,
    action: "anonimizar",
    note: "Identificador directo.",
  },
  {
    id: "company",
    field: "Empresa",
    sample: "Aurora SaaS",
    personal: false,
    necessary: true,
    action: "usar",
    note: "Contexto comercial.",
  },
  {
    id: "email",
    field: "Email",
    sample: "mariana@aurora.example",
    personal: true,
    necessary: false,
    action: "excluir",
    note: "No aporta señal para la campaña.",
  },
  {
    id: "tickets",
    field: "Tickets recientes",
    sample: "12 conversaciones",
    personal: true,
    necessary: true,
    action: "agregar",
    note: "Usar patrones, no texto crudo.",
  },
  {
    id: "arr",
    field: "ARR",
    sample: "$84,000",
    personal: false,
    necessary: true,
    action: "agregar",
    note: "Rango suficiente para priorizar.",
  },
];

const promptBlocks = [
  {
    id: "objective",
    label: "Objetivo",
    text: "Objetivo: crear un primer borrador de campaña enterprise para una cuenta en riesgo.",
  },
  {
    id: "context",
    label: "Contexto",
    text: "Contexto: el VP quiere revisar una propuesta hoy, pero Legal debe aprobar cualquier uso externo.",
  },
  {
    id: "allowed_data",
    label: "Datos permitidos",
    text: "Datos permitidos: empresa, segmento, resumen agregado de tickets y rango de ARR. No usar nombres, emails ni texto crudo de clientes.",
  },
  {
    id: "format",
    label: "Formato",
    text: "Formato: 3 asuntos, 1 email breve, checklist de aprobación y riesgos pendientes.",
  },
  {
    id: "controls",
    label: "Controles",
    text: "Controles: no inventar métricas, marcar cualquier claim que requiera fuente y dejar aprobación humana antes del envío.",
  },
];

const controlOptions = [
  "No usar datos personales",
  "Pedir fuente para métricas",
  "Aprobación humana antes de enviar",
  "Registrar supuestos",
  "Escalar a Legal si hay duda",
];

const outputLines = [
  {
    id: "claim",
    text: "Aurora SaaS puede reducir churn 40% en 30 días con nuestro agente.",
    flag: "Claim sin fuente",
    tone: "danger" as const,
  },
  {
    id: "pii",
    text: "La propuesta se enviará a mariana@aurora.example antes de pasar por Legal.",
    flag: "Dato personal + aprobación faltante",
    tone: "danger" as const,
  },
  {
    id: "safe",
    text: "Recomendamos iniciar con un piloto interno y revisión humana antes de uso externo.",
    flag: "Parte usable",
    tone: "success" as const,
  },
  {
    id: "tone",
    text: "Si no responden hoy, asumiremos que el cliente no tiene interés real.",
    flag: "Tono riesgoso",
    tone: "warning" as const,
  },
];

const decisionOptions: DecisionOption[] = [
  {
    id: "launch",
    title: "Lanzar hoy",
    tone: "danger",
    badge: "Riesgo alto",
    detail: "Maximiza velocidad, pero usa datos y claims que todavía no están aprobados.",
    consequences: [
      { label: "Velocidad", value: 96, tone: "success" },
      { label: "Riesgo", value: 92, tone: "danger" },
      { label: "Aprendizaje", value: 35, tone: "warning" },
    ],
  },
  {
    id: "pilot",
    title: "Piloto con aprobación",
    tone: "success",
    badge: "Controlado",
    detail: "Permite avanzar hoy con revisión legal, claims verificables y envío supervisado.",
    consequences: [
      { label: "Velocidad", value: 72, tone: "warning" },
      { label: "Riesgo", value: 32, tone: "success" },
      { label: "Aprendizaje", value: 84, tone: "success" },
    ],
  },
  {
    id: "internal",
    title: "Solo uso interno",
    tone: "warning",
    badge: "Seguro pero limitado",
    detail: "Reduce exposición externa, pero no prueba impacto real con clientes.",
    consequences: [
      { label: "Velocidad", value: 68, tone: "warning" },
      { label: "Riesgo", value: 20, tone: "success" },
      { label: "Aprendizaje", value: 52, tone: "warning" },
    ],
  },
  {
    id: "pause",
    title: "Pausar",
    tone: "neutral",
    badge: "Conservador",
    detail: "Evita riesgo inmediato, pero no genera evidencia operativa para el equipo.",
    consequences: [
      { label: "Velocidad", value: 12, tone: "danger" },
      { label: "Riesgo", value: 8, tone: "success" },
      { label: "Aprendizaje", value: 18, tone: "danger" },
    ],
  },
];

const actionOptions: DataAction[] = ["usar", "anonimizar", "agregar", "excluir", "pedir permiso"];

export function ExerciseLabClient() {
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [contextAnswer, setContextAnswer] = useState("Privacidad y claims verificables");
  const [dataRows, setDataRows] = useState(initialDataRows);
  const [uploadedFile, setUploadedFile] = useState("tickets_enterprise_sample.csv");
  const [security, setSecurity] = useState(80);
  const [efficiency, setEfficiency] = useState(60);
  const [cost, setCost] = useState(40);
  const [quality, setQuality] = useState(80);
  const [autonomy, setAutonomy] = useState(30);
  const [prompt, setPrompt] = useState(
    "Actúa como marketer B2B.\n\nCrea un primer borrador de campaña enterprise usando solo datos permitidos. No uses nombres, emails ni texto crudo de clientes. No inventes métricas. Devuelve asuntos, email breve y checklist de aprobación.",
  );
  const [selectedControls, setSelectedControls] = useState<string[]>([
    "No usar datos personales",
    "Pedir fuente para métricas",
    "Aprobación humana antes de enviar",
  ]);
  const [selectedChecks, setSelectedChecks] = useState<string[]>(["claim", "pii"]);
  const [showCorrectedOutput, setShowCorrectedOutput] = useState(false);
  const [decision, setDecision] = useState("pilot");
  const [memo, setMemo] = useState(
    "Recomiendo piloto con aprobación humana, no lanzamiento directo.\n\nMotivo: el output inicial incluye un claim no verificable y datos personales que no deben entrar a una campaña externa. Podemos avanzar hoy si limitamos el uso a borrador interno, eliminamos datos personales, pedimos fuente para cualquier métrica y dejamos Legal como aprobador antes de envío.\n\nSiguiente paso: generar versión limpia, validar claims y revisar con Legal antes de las 5.",
  );

  const personalCount = dataRows.filter((row) => row.personal).length;
  const riskyIncludedCount = dataRows.filter((row) => row.personal && row.action === "usar").length;
  const necessaryIncludedCount = dataRows.filter(
    (row) => row.necessary && row.action !== "excluir",
  ).length;
  const selectedDecision = decisionOptions.find((option) => option.id === decision) ?? decisionOptions[1];

  const modelProfile = useMemo(() => {
    if (security >= 80 && autonomy <= 40) {
      return {
        title: "Modelo controlado",
        subtitle: "Prioriza privacidad, baja autonomía y aprobación humana.",
        tone: "success" as const,
      };
    }
    if (quality >= 80 && cost <= 50) {
      return {
        title: "Razonamiento premium",
        subtitle: "Conviene cuando la calidad pesa más que costo o latencia.",
        tone: "accent" as const,
      };
    }
    if (cost >= 70 && efficiency >= 70) {
      return {
        title: "Modelo económico y rápido",
        subtitle: "Útil para borradores internos con revisión posterior.",
        tone: "warning" as const,
      };
    }
    return {
      title: "Modelo balanceado",
      subtitle: "Buen punto medio para tareas de marketing con supervisión.",
      tone: "neutral" as const,
    };
  }, [autonomy, cost, efficiency, quality, security]);

  const evidenceScore = Math.min(
    100,
    Math.max(
      0,
      55 +
        selectedControls.length * 4 +
        selectedChecks.length * 6 +
        necessaryIncludedCount * 3 -
        riskyIncludedCount * 18,
    ),
  );

  const updateRow = (rowId: string, patch: Partial<DataRow>) => {
    setDataRows((rows) => rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)));
  };

  const toggleCheck = (id: string) => {
    setSelectedChecks((checks) =>
      checks.includes(id) ? checks.filter((check) => check !== id) : [...checks, id],
    );
  };

  const toggleControl = (control: string) => {
    setSelectedControls((controls) =>
      controls.includes(control)
        ? controls.filter((item) => item !== control)
        : [...controls, control],
    );
  };

  const insertPromptBlock = (text: string) => {
    setPrompt((current) => `${current.trim()}\n\n${text}`);
  };

  const regeneratePrompt = () => {
    const allowedData = dataRows
      .filter((row) => row.action !== "excluir")
      .map((row) => `${row.field.toLowerCase()} (${row.action})`)
      .join(", ");
    setPrompt(
      [
        "Actúa como marketer B2B.",
        `Objetivo: crear un borrador de campaña enterprise usando solo ${allowedData}.`,
        `Prioridades: seguridad ${security}/100, eficiencia ${efficiency}/100, costo ${cost}/100, calidad ${quality}/100, autonomía ${autonomy}/100.`,
        selectedControls.length > 0 ? `Controles: ${selectedControls.join("; ")}.` : "",
        "No inventes métricas, no uses datos personales crudos y deja aprobación humana antes de cualquier envío externo.",
      ]
        .filter(Boolean)
        .join("\n\n"),
    );
  };

  return (
    <main className="simulador-root min-h-screen surface-canvas">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="max-w-4xl">
            <AppleBadge tone="neutral">Laboratorio interno</AppleBadge>
            <h1 className="display mt-5 text-[3rem] leading-[1.02] md:text-[4.5rem]">
              Ejercicios dinámicos.
            </h1>
            <p className="mt-5 max-w-[62ch] text-[1.0625rem] leading-7 text-[var(--text-secondary)]">
              Un caso controlado por Itera, con ejercicios vivos para clasificar datos, construir prompts, revisar output, decidir con tradeoffs y cerrar con una recomendación ejecutiva.
            </p>
          </div>

          <AppleCard variant="elevated" padding="lg" className="border-[var(--border)]">
            <p className="text-[0.8125rem] font-medium text-[var(--text-tertiary)]">
              Caso demo
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
          <MiniMetric label="Timer" value={timerEnabled ? "12 min" : "apagado"} />
          <MiniMetric label="Campos personales" value={`${personalCount}`} />
          <MiniMetric label="Evidencia emitida" value={`${evidenceScore}%`} />
        </div>

        <div className="grid gap-6">
          <ExerciseSection
            id="contexto"
            number="1"
            title="Contexto"
            subtitle="El caso viene fijo. El participante solo interpreta qué está en juego."
          >
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <AppleCard variant="default" padding="md" className="border-[var(--border)]">
                <p className="text-[0.8125rem] font-medium text-[var(--text-tertiary)]">
                  Mensaje recibido
                </p>
                <p className="mt-3 text-[1rem] leading-7 text-[var(--text-primary)]">
                  “Necesito una campaña para enterprise antes de las 5. Usa los tickets, el CRM y lo que tengamos. El VP quiere ver algo hoy.”
                </p>
                <div className="mt-5 grid gap-3 rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
                  <FactRow label="Stakeholder" value="VP de Marketing" />
                  <FactRow label="Aprobador" value="Legal" />
                  <FactRow label="Presión" value="Alta, definida por el caso" />
                  <FactRow label="Tiempo estimado" value={timerEnabled ? "12 minutos" : "Sin timer visible"} />
                </div>
              </AppleCard>

              <div className="grid gap-4">
                <ToggleRow
                  title="Activar timer"
                  description="Modo opcional del caso. Itera fija el tiempo; el usuario no lo negocia."
                  checked={timerEnabled}
                  onChange={setTimerEnabled}
                />
                <ChoiceGroup
                  title="Qué restricción no se puede romper?"
                  value={contextAnswer}
                  onChange={setContextAnswer}
                  options={[
                    "Velocidad del lanzamiento",
                    "Privacidad y claims verificables",
                    "Que el email suene convincente",
                    "Mandar todo al VP sin fricción",
                  ]}
                />
                <DynamicSignal
                  title="Lectura esperada"
                  tone={contextAnswer === "Privacidad y claims verificables" ? "success" : "warning"}
                  body={
                    contextAnswer === "Privacidad y claims verificables"
                      ? "Correcto: el caso mide criterio bajo presión, no obediencia al stakeholder."
                      : "Cuidado: la presión del VP no cancela privacidad, validación ni aprobación."
                  }
                />
              </div>
            </div>
          </ExerciseSection>

          <ExerciseSection
            id="datos"
            number="2"
            title="Datos"
            subtitle="Clasifica campos con decisiones claras: personal, necesario y acción permitida."
          >
            <div className="grid gap-4">
              <AppleCard variant="default" padding="md" className="border-[var(--border)]">
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-[0.8125rem] font-medium text-[var(--text-tertiary)]">
                      Carga de muestra
                    </p>
                    <p className="mt-2 text-[1rem] font-semibold text-[var(--text-primary)]">
                      {uploadedFile}
                    </p>
                    <p className="mt-1 text-[0.875rem] text-[var(--text-secondary)]">
                      Simula un CSV, XLSX, JSON o TXT del CRM. En este lab no se sube a servidor.
                    </p>
                  </div>
                  <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-[0.9375rem] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-2)]">
                    Cambiar archivo
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
                <div className="overflow-x-auto">
                  <div className="grid min-w-[960px] grid-cols-[1.05fr_0.9fr_0.75fr_0.75fr_1.2fr] border-b border-[var(--hairline)] bg-[var(--surface-2)] px-4 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                    <span>Campo</span>
                    <span>Muestra</span>
                    <span>Personal?</span>
                    <span>Necesario?</span>
                    <span>Acción</span>
                  </div>
                  {dataRows.map((row) => (
                    <div
                      key={row.id}
                      className="grid min-w-[960px] grid-cols-[1.05fr_0.9fr_0.75fr_0.75fr_1.2fr] items-center gap-3 border-b border-[var(--hairline)] px-4 py-4 last:border-b-0"
                    >
                      <div>
                        <p className="text-[0.9375rem] font-medium text-[var(--text-primary)]">
                          {row.field}
                        </p>
                        <p className="mt-1 text-[0.75rem] text-[var(--text-tertiary)]">{row.note}</p>
                      </div>
                      <span className="text-[0.875rem] text-[var(--text-secondary)]">{row.sample}</span>
                      <YesNoToggle
                        value={row.personal}
                        onChange={(personal) => updateRow(row.id, { personal })}
                        ariaLabel={`${row.field} contiene dato personal`}
                      />
                      <YesNoToggle
                        value={row.necessary}
                        onChange={(necessary) => updateRow(row.id, { necessary })}
                        ariaLabel={`${row.field} es necesario`}
                      />
                      <SegmentedAction
                        value={row.action}
                        onChange={(action) => updateRow(row.id, { action })}
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
            subtitle="Construye el prompt, añade controles y ajusta prioridades en pasos de 10."
          >
            <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
              <div className="grid gap-4">
                <PromptEditor value={prompt} onChange={setPrompt} />
                <div className="flex flex-wrap gap-2">
                  {promptBlocks.map((block) => (
                    <button
                      key={block.id}
                      type="button"
                      onClick={() => insertPromptBlock(block.text)}
                      className="rounded-[var(--radius-sm)] bg-[var(--surface-2)] px-3 py-2 text-[0.8125rem] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
                    >
                      + {block.label}
                    </button>
                  ))}
                </div>
                <ControlChecklist selected={selectedControls} onToggle={toggleControl} />
              </div>

              <div className="grid gap-4">
                <AppleCard variant="default" padding="md" className="border-[var(--border)] bg-[var(--surface-2)]">
                  <div className="grid gap-4">
                    <StepSlider id="security" label="Seguridad" value={security} onChange={setSecurity} />
                    <StepSlider id="efficiency" label="Eficiencia" value={efficiency} onChange={setEfficiency} />
                    <StepSlider id="cost" label="Cuidar costo" value={cost} onChange={setCost} />
                    <StepSlider id="quality" label="Calidad" value={quality} onChange={setQuality} />
                    <StepSlider id="autonomy" label="Autonomía" value={autonomy} onChange={setAutonomy} />
                  </div>
                </AppleCard>
                <AppleCard variant="elevated" padding="md" className="border-[var(--border)]">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <AppleBadge tone={modelProfile.tone}>Modelo sugerido</AppleBadge>
                    <AppleBadge tone={autonomy > 60 ? "warning" : "success"}>
                      Autonomía {autonomy}
                    </AppleBadge>
                  </div>
                  <h3 className="text-[1.125rem] font-semibold text-[var(--text-primary)]">
                    {modelProfile.title}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-6 text-[var(--text-secondary)]">
                    {modelProfile.subtitle}
                  </p>
                  <AppleButton className="mt-5 w-fit" tone="primary" onClick={regeneratePrompt}>
                    Regenerar prompt
                  </AppleButton>
                </AppleCard>
              </div>
            </div>
          </ExerciseSection>

          <ExerciseSection
            id="revision"
            number="4"
            title="Revisión"
            subtitle="Marca segmentos, pide una corrección a IA y compara el output corregido."
          >
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <AppleBadge tone={selectedChecks.length >= 2 ? "danger" : "warning"}>
                  {selectedChecks.length} flags activos
                </AppleBadge>
                <AppleBadge tone="neutral">Evidencia: flagged_segments</AppleBadge>
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
              <AiFollowUpBox onSubmit={() => setShowCorrectedOutput(true)} />
              {showCorrectedOutput && (
                <AppleCard variant="success" padding="md">
                  <AppleBadge tone="success">Output corregido</AppleBadge>
                  <p className="mt-3 text-[0.9375rem] leading-6 text-[var(--text-primary)]">
                    Recomendamos un piloto interno para Aurora SaaS. La campaña usará solo datos agregados, no prometerá métricas sin fuente y deberá pasar por Legal antes de cualquier envío externo.
                  </p>
                </AppleCard>
              )}
            </div>
          </ExerciseSection>

          <ExerciseSection
            id="decision"
            number="5"
            title="Decisión"
            subtitle="Elige una acción. Las consecuencias son parte del caso, no sliders del usuario."
          >
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
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-[var(--text-primary)]">{option.title}</span>
                        <AppleBadge tone={option.tone}>{option.badge}</AppleBadge>
                      </div>
                      <p className="mt-2 text-[0.875rem] leading-5 text-[var(--text-secondary)]">
                        {option.detail}
                      </p>
                      <div className="mt-4 grid gap-3">
                        {option.consequences.map((item) => (
                          <ReadOnlyBar key={item.label} {...item} />
                        ))}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </ExerciseSection>

          <ExerciseSection
            id="respuesta"
            number="6"
            title="Respuesta"
            subtitle="Cierra con una recomendación al manager: decisión, evidencia, riesgo y siguiente paso."
          >
            <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
              <HigTextarea
                label="Recomendación al manager"
                minRows={9}
                value={memo}
                onChange={setMemo}
              />
              <AppleCard variant="elevated" padding="md" className="border-[var(--border)]">
                <p className="text-[0.8125rem] font-medium text-[var(--text-tertiary)]">
                  Evidencia para reporte
                </p>
                <div className="mt-5 grid gap-4">
                  <EvidenceMetric label="Contexto" value={contextAnswer === "Privacidad y claims verificables" ? 88 : 58} />
                  <EvidenceMetric label="Datos" value={Math.max(35, 92 - riskyIncludedCount * 25)} />
                  <EvidenceMetric label="Validación" value={Math.min(98, 50 + selectedChecks.length * 12)} />
                </div>
                <div className="mt-5 rounded-[var(--radius-md)] bg-[var(--band-m-bg)] p-3">
                  <p className="text-[0.8125rem] leading-5 text-[var(--band-m-text)]">
                    Decisión elegida: {selectedDecision.title}. Revisar si la explicación incluye límites, evidencia y siguiente paso.
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
                <AppleBadge tone="neutral">Sección</AppleBadge>
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

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[0.875rem]">
      <span className="text-[var(--text-tertiary)]">{label}</span>
      <span className="text-right font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div>
        <p className="font-semibold text-[var(--text-primary)]">{title}</p>
        <p className="mt-1 text-[0.875rem] leading-5 text-[var(--text-secondary)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          "relative h-8 w-14 shrink-0 rounded-full transition-colors",
          checked ? "bg-[var(--accent)]" : "bg-[var(--surface-3)]",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-6 w-6 rounded-full bg-white shadow-[var(--shadow-sm)] transition-transform",
            checked ? "translate-x-7" : "translate-x-1",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

function ChoiceGroup({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <AppleCard variant="default" padding="md" className="border-[var(--border)]">
      <p className="text-[0.9375rem] font-semibold text-[var(--text-primary)]">{title}</p>
      <div className="mt-3 grid gap-2">
        {options.map((option) => (
          <label key={option} className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] bg-[var(--surface-2)] px-3 py-2">
            <input
              type="radio"
              name="context-answer"
              checked={value === option}
              onChange={() => onChange(option)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            <span className="text-[0.875rem] text-[var(--text-primary)]">{option}</span>
          </label>
        ))}
      </div>
    </AppleCard>
  );
}

function YesNoToggle({
  value,
  onChange,
  ariaLabel,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <div className="inline-flex w-fit rounded-[var(--radius-sm)] bg-[var(--surface-2)] p-1" aria-label={ariaLabel}>
      {[true, false].map((option) => (
        <button
          key={String(option)}
          type="button"
          onClick={() => onChange(option)}
          className={[
            "min-w-10 rounded-[var(--radius-xs)] px-2 py-1 text-[0.75rem] font-semibold transition-colors",
            value === option
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)]",
          ].join(" ")}
        >
          {option ? "Sí" : "No"}
        </button>
      ))}
    </div>
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

function StepSlider({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="flex items-center justify-between gap-3 text-[0.875rem]">
        <span className="font-medium text-[var(--text-secondary)]">{label}</span>
        <span className="font-semibold text-[var(--text-primary)]">{value}</span>
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--surface-3)] accent-[var(--accent)]"
      />
      <div className="flex justify-between text-[0.6875rem] text-[var(--text-tertiary)]">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}

function ControlChecklist({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (control: string) => void;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-[0.9375rem] font-semibold text-[var(--text-primary)]">Controles del caso</p>
      <p className="mt-1 text-[0.8125rem] text-[var(--text-secondary)]">
        Límites operativos que el prompt debe respetar.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {controlOptions.map((option) => {
          const isChecked = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={[
                "inline-flex min-h-9 items-center gap-2 rounded-[var(--radius-sm)] px-3 text-[0.8125rem] font-medium transition-colors",
                isChecked
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]",
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

function PromptEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--hairline)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
            <AppleIcon name="sparkles" size="xs" />
          </span>
          <span className="text-[0.875rem] font-semibold text-[var(--text-primary)]">Prompt</span>
        </div>
        <AppleBadge tone="neutral">{value.length} caracteres</AppleBadge>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={9}
        className="w-full resize-none bg-transparent px-4 py-4 text-[0.9375rem] leading-6 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hairline)] bg-[var(--surface-2)] px-4 py-3">
        <span className="text-[0.8125rem] text-[var(--text-secondary)]">Textarea de IA: redactar, insertar bloques y regenerar.</span>
        <AppleBadge tone="accent">Preview editable</AppleBadge>
      </div>
    </div>
  );
}

function AiFollowUpBox({ onSubmit }: { onSubmit: () => void }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center gap-2 border-b border-[var(--hairline)] px-4 py-3">
        <AppleIcon name="sparkles" size="sm" className="text-[var(--accent)]" />
        <span className="text-[0.875rem] font-semibold text-[var(--text-primary)]">Follow-up a IA</span>
      </div>
      <textarea
        defaultValue="Corrige el output: elimina datos personales, quita claims sin fuente y agrega aprobación legal antes de uso externo."
        rows={3}
        className="w-full resize-none bg-transparent px-4 py-4 text-[0.9375rem] leading-6 text-[var(--text-primary)] outline-none"
      />
      <div className="flex justify-end border-t border-[var(--hairline)] bg-[var(--surface-2)] px-4 py-3">
        <AppleButton tone="primary" onClick={onSubmit}>
          Pedir corrección
        </AppleButton>
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

function ReadOnlyBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: BadgeTone;
}) {
  const color =
    tone === "danger"
      ? "var(--band-b-bar)"
      : tone === "warning"
        ? "var(--band-m-bar)"
        : "var(--band-a-bar)";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-[0.75rem]">
        <span className="text-[var(--text-tertiary)]">{label}</span>
        <span className="font-medium text-[var(--text-secondary)]">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--surface-3)]">
        <div className="h-2 rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
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
  value,
  onChange,
  minRows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minRows?: number;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.8125rem] font-medium text-[var(--text-secondary)]">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
