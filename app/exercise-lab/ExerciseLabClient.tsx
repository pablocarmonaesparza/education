"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RuntimeNav } from "@/components/simulador/RuntimeNav";
import { AppleButton } from "@/components/simulador/apple";

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

const SECTIONS = [
  { id: "contexto", label: "Contexto" },
  { id: "datos", label: "Datos" },
  { id: "ia", label: "IA" },
  { id: "revision", label: "Revisión" },
  { id: "decision", label: "Decisión" },
  { id: "respuesta", label: "Respuesta" },
] as const;

const dataRows: DataRow[] = [
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
    id: "allowed_data",
    label: "Datos permitidos",
    text: "Datos permitidos: empresa, segmento, resumen agregado de tickets y rango de ARR. No usar nombres, emails ni texto crudo de clientes.",
  },
  {
    id: "controls",
    label: "Controles",
    text: "Controles: no inventar métricas, marcar cualquier claim que requiera fuente y dejar aprobación humana antes del envío.",
  },
];

const outputSegments = [
  {
    id: "claim",
    body: "Aurora SaaS puede reducir churn 40% en 30 días con nuestro agente.",
    flag: "Claim sin fuente",
  },
  {
    id: "pii",
    body: "La propuesta se enviará a mariana@aurora.example antes de pasar por Legal.",
    flag: "Dato personal",
  },
  {
    id: "safe",
    body: "Recomendamos iniciar con un piloto interno y revisión humana antes de uso externo.",
    flag: "Parte usable",
  },
];

const decisionOptions = [
  {
    id: "launch",
    title: "Lanzar hoy",
    sub: "Máxima velocidad, riesgo alto.",
    values: { velocidad: 96, riesgo: 92, aprendizaje: 35 },
  },
  {
    id: "pilot",
    title: "Piloto con aprobación",
    sub: "Avanza hoy con Legal y control humano.",
    values: { velocidad: 72, riesgo: 32, aprendizaje: 84 },
  },
  {
    id: "internal",
    title: "Solo uso interno",
    sub: "Seguro, pero con menor aprendizaje externo.",
    values: { velocidad: 68, riesgo: 20, aprendizaje: 52 },
  },
  {
    id: "pause",
    title: "Pausar",
    sub: "Riesgo mínimo, aprendizaje casi nulo.",
    values: { velocidad: 12, riesgo: 8, aprendizaje: 18 },
  },
];

const actionOptions: DataAction[] = ["usar", "anonimizar", "agregar", "excluir", "pedir permiso"];

export function ExerciseLabClient() {
  const [sectionIdx, setSectionIdx] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [fieldIdx, setFieldIdx] = useState(0);
  const [dataState, setDataState] = useState<Record<string, DataRow>>(
    Object.fromEntries(dataRows.map((row) => [row.id, row])),
  );
  const [security, setSecurity] = useState(80);
  const [efficiency, setEfficiency] = useState(60);
  const [cost, setCost] = useState(40);
  const [quality, setQuality] = useState(80);
  const [autonomy, setAutonomy] = useState(30);
  const [prompt, setPrompt] = useState(
    "Actúa como marketer B2B.\n\nCrea un primer borrador de campaña enterprise usando solo datos permitidos. No uses nombres, emails ni texto crudo de clientes. No inventes métricas. Devuelve asuntos, email breve y checklist de aprobación.",
  );
  const [selectedSegments, setSelectedSegments] = useState<string[]>(["claim", "pii"]);
  const [showCorrectedOutput, setShowCorrectedOutput] = useState(false);
  const [decision, setDecision] = useState("pilot");
  const [memo, setMemo] = useState(
    "Recomiendo piloto con aprobación humana, no lanzamiento directo.\n\nMotivo: el output inicial incluye un claim no verificable y datos personales que no deben entrar a una campaña externa. Podemos avanzar hoy si limitamos el uso a borrador interno, eliminamos datos personales, pedimos fuente para cualquier métrica y dejamos Legal como aprobador antes de envío.",
  );

  const currentSection = SECTIONS[sectionIdx];
  const currentField = dataState[dataRows[fieldIdx].id];
  const selectedDecision = decisionOptions.find((option) => option.id === decision) ?? decisionOptions[1];

  const modelProfile = useMemo(() => {
    if (security >= 80 && autonomy <= 40) return "Modelo controlado";
    if (quality >= 80 && cost <= 50) return "Razonamiento premium";
    if (cost >= 70 && efficiency >= 70) return "Modelo económico y rápido";
    return "Modelo balanceado";
  }, [autonomy, cost, efficiency, quality, security]);

  function goToSection(index: number) {
    if (index <= maxReached) setSectionIdx(index);
  }

  function nextSection() {
    const next = Math.min(sectionIdx + 1, SECTIONS.length - 1);
    setSectionIdx(next);
    setMaxReached((reached) => Math.max(reached, next));
  }

  function prevSection() {
    setSectionIdx((current) => Math.max(0, current - 1));
  }

  function updateCurrentField(patch: Partial<DataRow>) {
    setDataState((state) => ({
      ...state,
      [currentField.id]: { ...currentField, ...patch },
    }));
  }

  function insertPromptBlock(text: string) {
    setPrompt((current) => `${current.trim()}\n\n${text}`);
  }

  function regeneratePrompt() {
    const allowed = Object.values(dataState)
      .filter((row) => row.action !== "excluir")
      .map((row) => `${row.field.toLowerCase()} (${row.action})`)
      .join(", ");
    setPrompt(
      [
        "Actúa como marketer B2B.",
        `Objetivo: crear un borrador de campaña enterprise usando solo ${allowed}.`,
        `Prioridades: seguridad ${security}/100, eficiencia ${efficiency}/100, costo ${cost}/100, calidad ${quality}/100, autonomía ${autonomy}/100.`,
        "Controles: no usar datos personales crudos, no inventar métricas y dejar aprobación humana antes de cualquier envío externo.",
      ].join("\n\n"),
    );
  }

  function toggleSegment(id: string) {
    setSelectedSegments((segments) =>
      segments.includes(id)
        ? segments.filter((segment) => segment !== id)
        : [...segments, id],
    );
  }

  const canGoNext = true;

  return (
    <>
      <RuntimeNav mode="field_test" />

      <div className="simulador-root max-w-7xl mx-auto flex min-h-[calc(100vh-3.5rem)]">
        <aside className="hidden md:block flex-shrink-0 w-60">
          <div className="sticky top-[80px] py-10 px-6">
            <CaseMetaCard timerEnabled={timerEnabled} />
            <nav className="space-y-1">
              {SECTIONS.map((section, index) => {
                const reached = index <= maxReached;
                const isCurrent = index === sectionIdx;
                const isCompleted = index < maxReached;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => goToSection(index)}
                    disabled={!reached}
                    className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[13px] transition-colors ${
                      isCurrent
                        ? "bg-[var(--accent-soft)] text-[var(--text-primary)] font-medium"
                        : reached
                          ? "text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
                          : "text-[var(--text-tertiary)] cursor-not-allowed"
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 h-5 w-5 rounded-full grid place-items-center text-[10px] mono font-semibold transition-colors ${
                        isCurrent || isCompleted
                          ? "accent-bg text-white"
                          : reached
                            ? "border border-[var(--border-strong)] text-[var(--text-primary)] bg-transparent"
                            : "border border-[var(--border)] text-[var(--text-tertiary)] bg-transparent"
                      }`}
                    >
                      {isCompleted ? "✓" : index === 0 ? <span className="block h-1.5 w-1.5 rounded-full bg-current" /> : index}
                    </span>
                    <span className="truncate">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex-1 min-w-0 surface-canvas pb-32 flex flex-col">
          <div className="pt-8 px-6">
            <div className="max-w-2xl mx-auto flex gap-1.5">
              {SECTIONS.map((_, index) => (
                <div
                  key={index}
                  className="flex-1 h-[5px] rounded-full overflow-hidden bg-[var(--surface-3)]"
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: index <= sectionIdx ? "var(--accent)" : "transparent" }}
                    initial={false}
                    animate={{ width: index <= sectionIdx ? "100%" : "0%" }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-6 py-10">
            <div className={`${currentSection.id === "ia" ? "max-w-4xl" : "max-w-2xl"} w-full`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSection.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {currentSection.id === "contexto" && (
                    <ContextScreen
                      timerEnabled={timerEnabled}
                      setTimerEnabled={setTimerEnabled}
                      onContinue={nextSection}
                    />
                  )}
                  {currentSection.id === "datos" && (
                    <DataScreen
                      field={currentField}
                      fieldIdx={fieldIdx}
                      totalFields={dataRows.length}
                      onPrevField={() => setFieldIdx((index) => Math.max(0, index - 1))}
                      onNextField={() => setFieldIdx((index) => Math.min(dataRows.length - 1, index + 1))}
                      onChange={updateCurrentField}
                    />
                  )}
                  {currentSection.id === "ia" && (
                    <IaScreen
                      prompt={prompt}
                      setPrompt={setPrompt}
                      insertPromptBlock={insertPromptBlock}
                      regeneratePrompt={regeneratePrompt}
                      security={security}
                      setSecurity={setSecurity}
                      efficiency={efficiency}
                      setEfficiency={setEfficiency}
                      cost={cost}
                      setCost={setCost}
                      quality={quality}
                      setQuality={setQuality}
                      autonomy={autonomy}
                      setAutonomy={setAutonomy}
                      modelProfile={modelProfile}
                    />
                  )}
                  {currentSection.id === "revision" && (
                    <ReviewScreen
                      selectedSegments={selectedSegments}
                      toggleSegment={toggleSegment}
                      showCorrectedOutput={showCorrectedOutput}
                      setShowCorrectedOutput={setShowCorrectedOutput}
                    />
                  )}
                  {currentSection.id === "decision" && (
                    <DecisionScreen decision={decision} setDecision={setDecision} />
                  )}
                  {currentSection.id === "respuesta" && (
                    <ResponseScreen
                      memo={memo}
                      setMemo={setMemo}
                      selectedDecision={selectedDecision.title}
                      score={88}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 inset-x-0 z-40 surface-backdrop">
        <div className="max-w-7xl mx-auto md:pl-60 px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            {sectionIdx > 0 ? (
              <AppleButton
                tone="secondary"
                size="lg"
                onPress={prevSection}
                className="h-11 px-5 text-[14px] font-medium border-[var(--border-strong)] text-[var(--text-primary)] bg-[var(--surface)]"
              >
                ← Anterior
              </AppleButton>
            ) : (
              <span />
            )}

            <AppleButton
              size="lg"
              tone={canGoNext ? "primary" : "secondary"}
              onPress={nextSection}
              isDisabled={!canGoNext || sectionIdx === SECTIONS.length - 1}
              className={`h-11 px-6 text-[14px] font-medium ${
                sectionIdx === SECTIONS.length - 1
                  ? "bg-[var(--surface-3)] text-[var(--text-tertiary)]"
                  : "accent-bg text-white hover:opacity-90"
              } shadow-none btn-hover-shift`}
            >
              {sectionIdx === SECTIONS.length - 1 ? "Demo completo" : "Siguiente →"}
            </AppleButton>
          </div>
        </div>
      </div>
    </>
  );
}

function CaseMetaCard({ timerEnabled }: { timerEnabled: boolean }) {
  return (
    <div className="mb-7 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4">
      <div className="flex items-center gap-2">
        <span className="rounded-full accent-bg-soft accent-text px-2 py-0.5 text-[11px] font-semibold">
          N2
        </span>
        <span className="text-[11px] text-[var(--text-tertiary)]">Marketing</span>
      </div>
      <div className="mt-3 text-[13px] font-medium leading-snug text-[var(--text-primary)]">
        Campaña urgente con datos sensibles
      </div>
      <div className="mt-2 text-[12px] leading-snug text-[var(--text-secondary)]">
        Workflow · {timerEnabled ? "12 min" : "sin timer"}
      </div>
    </div>
  );
}

function ContextScreen({
  timerEnabled,
  setTimerEnabled,
  onContinue,
}: {
  timerEnabled: boolean;
  setTimerEnabled: (value: boolean) => void;
  onContinue: () => void;
}) {
  return (
    <>
      <div className="eyebrow">Contexto · caso fijo</div>
      <h1 className="display display-tight mt-6 text-[36px] sm:text-[48px] text-[var(--text-primary)]">
        Jueves · 4:30 PM.
      </h1>
      <p className="mt-6 text-[18px] text-[var(--text-primary)] leading-[1.65]">
        Camila, VP de Marketing, necesita 3 ángulos para una campaña enterprise antes de las 5.
        El escenario, la presión y los criterios de evaluación ya vienen definidos por Itera.
        Tu trabajo no es configurar el caso: es resolverlo con criterio.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <ContextFact label="Stakeholder" value="VP de Marketing" />
        <ContextFact label="Entrega" value="Hoy, antes de las 5" />
        <ContextFact label="Cuidado" value="Datos sensibles y claims" />
      </div>

      <div className="mt-8 card-apple bg-[var(--surface)] p-5">
        <p className="text-[15px] text-[var(--text-primary)] leading-[1.6] italic">
          «No me metas a Legal hoy, ya están cerrados. Confío en tu criterio.»
        </p>
      </div>

      <div className="mt-8 card-apple bg-[var(--surface)] p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[16px] font-medium text-[var(--text-primary)]">Timer del caso</div>
            <div className="mt-1 max-w-md text-[14px] leading-6 text-[var(--text-secondary)]">
              Puedes practicar con reloj o sin reloj. El tiempo sugerido lo define Itera:
              12 minutos para completar este caso.
            </div>
          </div>
          <div className="grid grid-cols-2 rounded-2xl bg-[var(--surface-2)] p-1 sm:min-w-[240px]">
            <button
              type="button"
              onClick={() => setTimerEnabled(true)}
              className={`rounded-xl px-4 py-3 text-[14px] font-medium transition-colors ${
                timerEnabled
                  ? "accent-bg text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Con timer
            </button>
            <button
              type="button"
              onClick={() => setTimerEnabled(false)}
              className={`rounded-xl px-4 py-3 text-[14px] font-medium transition-colors ${
                !timerEnabled
                  ? "accent-bg text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Sin timer
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <AppleButton
          size="lg"
          tone="primary"
          onPress={onContinue}
          className="h-12 px-6 text-[15px] font-medium accent-bg text-white shadow-none btn-hover-shift"
        >
          Siguiente: datos →
        </AppleButton>
      </div>
    </>
  );
}

function ContextFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="text-[12px] text-[var(--text-tertiary)]">{label}</div>
      <div className="mt-2 text-[15px] font-medium leading-snug text-[var(--text-primary)]">
        {value}
      </div>
    </div>
  );
}

function DataScreen({
  field,
  fieldIdx,
  totalFields,
  onPrevField,
  onNextField,
  onChange,
}: {
  field: DataRow;
  fieldIdx: number;
  totalFields: number;
  onPrevField: () => void;
  onNextField: () => void;
  onChange: (patch: Partial<DataRow>) => void;
}) {
  return (
    <>
      <div className="eyebrow">
        Datos · Campo {fieldIdx + 1} de {totalFields}
      </div>
      <h2 className="display display-tight mt-6 text-[32px] sm:text-[44px] text-[var(--text-primary)]">
        ¿Qué hacer con <span className="mono">{field.field}</span>?
      </h2>
      <p className="mt-5 text-[17px] text-[var(--text-secondary)] leading-[1.55]">
        Clasifica el campo con decisiones simples. El objetivo es pasar señal al modelo sin exponer datos innecesarios.
      </p>

      <div className="mt-8 card-apple bg-[var(--surface)] p-5">
        <div className="text-[12px] text-[var(--text-tertiary)]">Muestra</div>
        <div className="mt-2 text-[18px] text-[var(--text-primary)]">{field.sample}</div>
        <div className="mt-2 text-[14px] text-[var(--text-secondary)]">{field.note}</div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <BinaryQuestion label="¿Contiene dato personal?" value={field.personal} onChange={(personal) => onChange({ personal })} />
        <BinaryQuestion label="¿Es necesario para la tarea?" value={field.necessary} onChange={(necessary) => onChange({ necessary })} />
      </div>

      <div className="mt-8">
        <div className="text-[15px] font-medium text-[var(--text-primary)]">Acción permitida</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {actionOptions.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => onChange({ action })}
              className={`rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${
                field.action === action
                  ? "accent-bg text-white"
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]"
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-between gap-3">
        <AppleButton tone="secondary" onPress={onPrevField} isDisabled={fieldIdx === 0}>
          ← Campo anterior
        </AppleButton>
        <AppleButton tone="secondary" onPress={onNextField} isDisabled={fieldIdx === totalFields - 1}>
          Siguiente campo →
        </AppleButton>
      </div>
    </>
  );
}

function IaScreen({
  prompt,
  setPrompt,
  insertPromptBlock,
  regeneratePrompt,
  security,
  setSecurity,
  efficiency,
  setEfficiency,
  cost,
  setCost,
  quality,
  setQuality,
  autonomy,
  setAutonomy,
  modelProfile,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  insertPromptBlock: (value: string) => void;
  regeneratePrompt: () => void;
  security: number;
  setSecurity: (value: number) => void;
  efficiency: number;
  setEfficiency: (value: number) => void;
  cost: number;
  setCost: (value: number) => void;
  quality: number;
  setQuality: (value: number) => void;
  autonomy: number;
  setAutonomy: (value: number) => void;
  modelProfile: string;
}) {
  return (
    <>
      <div className="eyebrow">IA · prompt y controles</div>
      <h2 className="display display-tight mt-6 text-[36px] sm:text-[48px] text-[var(--text-primary)]">
        Dirige al modelo.
      </h2>
      <p className="mt-5 text-[17px] text-[var(--text-secondary)] leading-[1.55]">
        Construye el prompt y ajusta prioridades en pasos de 10. No estás diseñando el caso; estás configurando la interacción con IA dentro de sus límites.
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div>
          <div className="overflow-hidden card-apple bg-[var(--surface)]">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--hairline)] px-4 py-3">
              <span className="text-[14px] font-medium text-[var(--text-primary)]">Prompt</span>
              <span className="mono text-[12px] text-[var(--text-tertiary)]">{prompt.length} chars</span>
            </div>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={8}
              className="w-full resize-none bg-transparent px-4 py-4 text-[15px] leading-6 text-[var(--text-primary)] outline-none"
            />
            <div className="border-t border-[var(--hairline)] bg-[var(--surface-2)] px-4 py-3 text-[13px] text-[var(--text-secondary)]">
              Textfield de IA: redacta, inserta bloques y regenera.
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {promptBlocks.map((block) => (
              <button
                key={block.id}
                type="button"
                onClick={() => insertPromptBlock(block.text)}
                className="rounded-full bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]"
              >
                + {block.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card-apple bg-[var(--surface)] p-5">
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-[15px] font-medium text-[var(--text-primary)]">{modelProfile}</div>
              <div className="mt-1 text-[14px] text-[var(--text-secondary)]">
                Seguridad {security} · Eficiencia {efficiency} · Costo {cost}
              </div>
            </div>
            <AppleButton tone="primary" onPress={regeneratePrompt} className="w-full">
              Regenerar
            </AppleButton>
            <div className="grid gap-4">
              <StepSlider id="security" label="Seguridad" value={security} onChange={setSecurity} />
              <StepSlider id="efficiency" label="Eficiencia" value={efficiency} onChange={setEfficiency} />
              <StepSlider id="cost" label="Cuidar costo" value={cost} onChange={setCost} />
              <StepSlider id="quality" label="Calidad" value={quality} onChange={setQuality} />
              <StepSlider id="autonomy" label="Autonomía" value={autonomy} onChange={setAutonomy} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ReviewScreen({
  selectedSegments,
  toggleSegment,
  showCorrectedOutput,
  setShowCorrectedOutput,
}: {
  selectedSegments: string[];
  toggleSegment: (id: string) => void;
  showCorrectedOutput: boolean;
  setShowCorrectedOutput: (value: boolean) => void;
}) {
  return (
    <>
      <div className="eyebrow">Revisión · output del modelo</div>
      <h2 className="display display-tight mt-6 text-[36px] sm:text-[48px] text-[var(--text-primary)]">
        Marca lo riesgoso.
      </h2>
      <p className="mt-5 text-[17px] text-[var(--text-secondary)] leading-[1.55]">
        El objetivo no es aceptar el primer output. Detecta qué debe corregirse antes de usarlo.
      </p>

      <div className="mt-8 space-y-3">
        {outputSegments.map((segment) => (
          <label key={segment.id} className="flex cursor-pointer items-start gap-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4">
            <input
              type="checkbox"
              checked={selectedSegments.includes(segment.id)}
              onChange={() => toggleSegment(segment.id)}
              className="mt-1 h-5 w-5 accent-[var(--accent)]"
            />
            <span className="flex-1">
              <span className="block text-[15px] text-[var(--text-primary)] leading-6">{segment.body}</span>
              <span className="mt-2 inline-block rounded-full bg-[var(--band-b-bg)] px-2 py-1 text-[12px] text-[var(--band-b-text)]">
                {segment.flag}
              </span>
            </span>
          </label>
        ))}
      </div>

      <div className="mt-8 overflow-hidden card-apple bg-[var(--surface)]">
        <div className="border-b border-[var(--hairline)] px-4 py-3 text-[14px] font-medium text-[var(--text-primary)]">
          Follow-up a IA
        </div>
        <textarea
          defaultValue="Corrige el output: elimina datos personales, quita claims sin fuente y agrega aprobación legal antes de uso externo."
          rows={3}
          className="w-full resize-none bg-transparent px-4 py-4 text-[15px] leading-6 text-[var(--text-primary)] outline-none"
        />
        <div className="flex justify-end border-t border-[var(--hairline)] bg-[var(--surface-2)] px-4 py-3">
          <AppleButton tone="primary" onPress={() => setShowCorrectedOutput(true)}>
            Pedir corrección
          </AppleButton>
        </div>
      </div>

      {showCorrectedOutput && (
        <div className="mt-6 card-apple bg-[var(--band-a-bg)] p-5">
          <div className="text-[13px] font-medium text-[var(--band-a-text)]">Output corregido</div>
          <p className="mt-3 text-[15px] leading-6 text-[var(--text-primary)]">
            Recomendamos un piloto interno para Aurora SaaS. La campaña usará solo datos agregados, no prometerá métricas sin fuente y deberá pasar por Legal antes de cualquier envío externo.
          </p>
        </div>
      )}
    </>
  );
}

function DecisionScreen({
  decision,
  setDecision,
}: {
  decision: string;
  setDecision: (value: string) => void;
}) {
  return (
    <>
      <div className="eyebrow">Decisión · tradeoffs</div>
      <h2 className="display display-tight mt-6 text-[36px] sm:text-[48px] text-[var(--text-primary)]">
        Elige qué harías.
      </h2>
      <p className="mt-5 text-[17px] text-[var(--text-secondary)] leading-[1.55]">
        Las consecuencias vienen del caso. Tu trabajo es decidir y sostener el tradeoff.
      </p>

      <div className="mt-8 space-y-3">
        {decisionOptions.map((option) => (
          <label key={option.id} className="block cursor-pointer rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-4">
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="decision"
                checked={decision === option.id}
                onChange={() => setDecision(option.id)}
                className="mt-1 h-5 w-5 accent-[var(--accent)]"
              />
              <div className="flex-1">
                <div className="text-[16px] font-medium text-[var(--text-primary)]">{option.title}</div>
                <div className="mt-1 text-[14px] text-[var(--text-secondary)]">{option.sub}</div>
                <div className="mt-4 grid gap-3">
                  {Object.entries(option.values).map(([label, value]) => (
                    <ReadOnlyBar key={label} label={label} value={value} danger={label === "riesgo"} />
                  ))}
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </>
  );
}

function ResponseScreen({
  memo,
  setMemo,
  selectedDecision,
  score,
}: {
  memo: string;
  setMemo: (value: string) => void;
  selectedDecision: string;
  score: number;
}) {
  return (
    <>
      <div className="eyebrow">Respuesta · recomendación</div>
      <h2 className="display display-tight mt-6 text-[36px] sm:text-[48px] text-[var(--text-primary)]">
        Responde al manager.
      </h2>
      <p className="mt-5 text-[17px] text-[var(--text-secondary)] leading-[1.55]">
        No evaluamos copy bonito. Evaluamos si puedes convertir trabajo con IA en una decisión defendible.
      </p>

      <div className="mt-8 overflow-hidden card-apple bg-[var(--surface)]">
        <div className="border-b border-[var(--hairline)] px-4 py-3 text-[14px] font-medium text-[var(--text-primary)]">
          Recomendación al manager
        </div>
        <textarea
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          rows={8}
          className="w-full resize-none bg-transparent px-4 py-4 text-[15px] leading-6 text-[var(--text-primary)] outline-none"
        />
      </div>

      <div className="mt-6 card-apple bg-[var(--surface)] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[14px] text-[var(--text-secondary)]">Evidencia para reporte</div>
            <div className="mt-1 text-[16px] font-medium text-[var(--text-primary)]">
              Decisión elegida: {selectedDecision}
            </div>
          </div>
          <div className="mono text-[22px] font-semibold text-[var(--text-primary)]">{score}%</div>
        </div>
      </div>
    </>
  );
}

function BinaryQuestion({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="card-apple bg-[var(--surface)] p-4">
      <div className="text-[14px] font-medium text-[var(--text-primary)]">{label}</div>
      <div className="mt-3 inline-flex rounded-lg bg-[var(--surface-2)] p-1">
        {[true, false].map((option) => (
          <button
            key={String(option)}
            type="button"
            onClick={() => onChange(option)}
            className={`min-w-12 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
              value === option ? "accent-bg text-white" : "text-[var(--text-secondary)]"
            }`}
          >
            {option ? "Sí" : "No"}
          </button>
        ))}
      </div>
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
    <div>
      <label htmlFor={id} className="flex items-center justify-between gap-3 text-[14px]">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="mono font-semibold text-[var(--text-primary)]">{value}</span>
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--surface-3)] accent-[var(--accent)]"
      />
    </div>
  );
}

function ReadOnlyBar({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  const color =
    danger && value > 50
      ? "var(--band-b-bar)"
      : value > 65
        ? "var(--band-a-bar)"
        : value > 35
          ? "var(--band-m-bar)"
          : "var(--band-b-bar)";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-[12px]">
        <span className="capitalize text-[var(--text-tertiary)]">{label}</span>
        <span className="mono text-[var(--text-secondary)]">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--surface-3)]">
        <div className="h-2 rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
