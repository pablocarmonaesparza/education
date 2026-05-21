"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RuntimeNav } from "@/components/simulador/RuntimeNav";

type DataAction = "usar" | "anonimizar" | "agregar" | "excluir";
type Permission = "permitir" | "revisar" | "bloquear";

type BrandKey = "internal" | "openai" | "anthropic" | "google" | "qwen" | "deepseek";
type Level5 = 1 | 2 | 3 | 4 | 5;
type VoiceRecState = "idle" | "recording" | "processing" | "error";

type ModelOption = {
  id: string;
  label: string;
  badge?: string;
  brand: BrandKey;
  price: Level5;
  intel: Level5;
};

type ModelGroup = {
  title: string;
  families: ModelOption[][];
};

const modelGroups: ModelGroup[] = [
  {
    title: "modelo interno",
    families: [
      [
        {
          id: "gpt-corporativo",
          label: "GPT Corporativo",
          badge: "IT",
          brand: "internal",
          price: 1,
          intel: 3,
        },
      ],
    ],
  },
  {
    title: "modelos convencionales",
    families: [
      [
        {
          id: "chatgpt-5.5",
          label: "ChatGPT 5.5",
          brand: "openai",
          price: 3,
          intel: 4,
        },
        {
          id: "chatgpt-5.5-thinking",
          label: "ChatGPT 5.5",
          badge: "Thinking",
          brand: "openai",
          price: 5,
          intel: 5,
        },
      ],
      [
        {
          id: "claude-haiku-4.5",
          label: "Claude Haiku 4.5",
          brand: "anthropic",
          price: 2,
          intel: 3,
        },
        {
          id: "claude-sonnet-4.6",
          label: "Claude Sonnet 4.6",
          brand: "anthropic",
          price: 3,
          intel: 4,
        },
        {
          id: "claude-opus-4.7",
          label: "Claude Opus 4.7",
          brand: "anthropic",
          price: 5,
          intel: 5,
        },
      ],
      [
        {
          id: "gemini-3-flash",
          label: "Gemini 3 Flash",
          brand: "google",
          price: 1,
          intel: 3,
        },
        {
          id: "gemini-3-pro",
          label: "Gemini 3 Pro",
          brand: "google",
          price: 3,
          intel: 5,
        },
      ],
    ],
  },
  {
    title: "modelos chinos",
    families: [
      [
        {
          id: "qwen-3.6",
          label: "Qwen 3.6",
          brand: "qwen",
          price: 1,
          intel: 3,
        },
      ],
      [
        {
          id: "deepseek-v4-pro",
          label: "Deepseek V4 Pro",
          brand: "deepseek",
          price: 2,
          intel: 4,
        },
      ],
    ],
  },
];

const defaultModelId = "gpt-corporativo";

const brandLogo: Record<BrandKey, { light: string; dark?: string } | null> = {
  internal: null,
  openai: { light: "/brands/openai.png", dark: "/brands/openai-dark.png" },
  anthropic: { light: "/brands/anthropic.png" },
  google: { light: "/brands/gemini.png" },
  qwen: { light: "/brands/qwen.png" },
  deepseek: { light: "/brands/deepseek.png" },
};

const exerciseList = [
  {
    id: "textfield-ia",
    eyebrow: "01 · textfield de IA",
    title: "Pedirle trabajo útil a la IA.",
    description:
      "El participante redacta una petición completa usando objetivo, datos permitidos y límites. Mide si sabe convertir una necesidad laboral en una instrucción clara.",
    signals: ["contexto", "ejecución IA", "impacto"],
  },
  {
    id: "tabla-datos",
    eyebrow: "02 · tabla editable",
    title: "Decidir qué datos entran.",
    description:
      "El participante clasifica campos reales antes de usarlos. Mide minimización, privacidad y calidad de datos sin pedir teoría.",
    signals: ["datos", "juicio"],
  },
  {
    id: "matriz-permisos",
    eyebrow: "03 · matriz de permisos",
    title: "Poner límites a una automatización.",
    description:
      "El participante define qué puede hacer el sistema solo, qué requiere revisión y qué debe bloquearse. Útil para workflows y agentes.",
    signals: ["datos", "juicio", "ejecución IA"],
  },
  {
    id: "revision-output",
    eyebrow: "04 · revisión de output",
    title: "Marcar errores antes de usar.",
    description:
      "El participante revisa una salida de IA con errores realistas. Mide validación, lectura de riesgo y capacidad de corregir sin aceptar todo.",
    signals: ["validación", "juicio"],
  },
  {
    id: "comparacion-ia",
    eyebrow: "05 · comparación de respuestas",
    title: "Elegir el mejor output.",
    description:
      "El participante compara dos respuestas de IA y justifica cuál usaría. Sirve para medir criterio de calidad, no sólo preferencia estética.",
    signals: ["validación", "impacto"],
  },
  {
    id: "workflow-builder",
    eyebrow: "06 · workflow builder",
    title: "Armar un flujo con control humano.",
    description:
      "El participante configura pasos de trabajo con IA, revisión y entrega. Mide si entiende handoffs, checkpoints y responsabilidad.",
    signals: ["ejecución IA", "validación", "impacto"],
  },
  {
    id: "agent-brief",
    eyebrow: "07 · brief para agente",
    title: "Delegar sin perder control.",
    description:
      "El participante define objetivo, permisos, límites y fallback para un agente. Es central para nivel 3: agentes en producción.",
    signals: ["ejecución IA", "juicio", "datos"],
  },
  {
    id: "logs",
    eyebrow: "08 · revisión de logs",
    title: "Detectar fallas en una corrida.",
    description:
      "El participante lee eventos de una automatización y marca dónde se rompió el control. Mide supervisión, no memoria.",
    signals: ["validación", "juicio"],
  },
  {
    id: "dashboard-pivot",
    eyebrow: "09 · dashboard / pivot",
    title: "Leer señales de negocio.",
    description:
      "El participante filtra una tabla y elige qué señal llevar al manager. Mide si conecta IA con impacto operativo.",
    signals: ["impacto", "contexto"],
  },
  {
    id: "decision-memo",
    eyebrow: "10 · decisión + memo",
    title: "Cerrar con una recomendación.",
    description:
      "El participante elige una acción con ventajas y costos, luego escribe una explicación corta. Mide responsabilidad ejecutiva.",
    signals: ["juicio", "impacto", "contexto"],
  },
] as const;

const initialDataRows: Array<{
  id: string;
  field: string;
  example: string;
  action: DataAction;
}> = [
  { id: "contact", field: "nombre del contacto", example: "Mariana Robles", action: "anonimizar" },
  { id: "company", field: "empresa", example: "Aurora Retail", action: "usar" },
  { id: "email", field: "correo", example: "mariana@aurora.example", action: "excluir" },
  { id: "tickets", field: "tickets recientes", example: "12 conversaciones", action: "agregar" as DataAction },
].map((row) => ({
  ...row,
  action: row.action === "agregar" ? "usar" : row.action,
}));

const permissionRows = [
  "leer CRM",
  "crear borrador",
  "enviar a cliente",
  "actualizar pipeline",
  "usar conversaciones crudas",
];

const outputLines = [
  {
    id: "metric",
    text: "Podemos recuperar 40% de cuentas inactivas en 30 días.",
    issue: "afirmación sin fuente",
  },
  {
    id: "pii",
    text: "El mensaje se enviará a mariana@aurora.example con tono urgente.",
    issue: "dato personal",
  },
  {
    id: "safe",
    text: "Propongo usar datos agregados y validar cualquier promesa antes de enviar.",
    issue: "usable",
  },
];

const workflowSteps = [
  "resumir tickets agregados",
  "generar tres ángulos",
  "marcar afirmaciones sin fuente",
  "revisión humana",
  "entrega a ventas",
];

const runLogs = [
  { id: "l1", text: "09:02 · agente leyó cuentas asignadas", severity: "ok" },
  { id: "l2", text: "09:03 · incluyó correo personal en borrador", severity: "high" },
  { id: "l3", text: "09:04 · generó métrica sin fuente externa", severity: "high" },
  { id: "l4", text: "09:05 · dejó envío en borrador pendiente de aprobación", severity: "ok" },
];

function findModelById(id: string): ModelOption {
  for (const group of modelGroups) {
    for (const family of group.families) {
      const found = family.find((model) => model.id === id);
      if (found) return found;
    }
  }
  return modelGroups[0].families[0][0];
}

export function ExerciseLabClient() {
  const [activeSection, setActiveSection] = useState(0);
  const [prompt, setPrompt] = useState(
    "Crea tres ángulos para reactivar cuentas grandes que bajaron su uso del producto. Usa sólo empresa, segmento y resumen agregado de tickets. No uses nombres ni correos. Marca cualquier afirmación que necesite fuente.",
  );
  const [model, setModel] = useState(defaultModelId);
  const [security, setSecurity] = useState(80);
  const [quality, setQuality] = useState(70);
  const [voiceNotes, setVoiceNotes] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState(initialDataRows);
  const [permissions, setPermissions] = useState<Record<string, Permission>>({
    "leer CRM": "revisar",
    "crear borrador": "permitir",
    "enviar a cliente": "bloquear",
    "actualizar pipeline": "revisar",
    "usar conversaciones crudas": "bloquear",
  });
  const [flags, setFlags] = useState<string[]>(["metric", "pii"]);
  const [comparison, setComparison] = useState("b");
  const [enabledSteps, setEnabledSteps] = useState<string[]>([
    "resumir tickets agregados",
    "generar tres ángulos",
    "marcar afirmaciones sin fuente",
    "revisión humana",
  ]);
  const [agentFallback, setAgentFallback] = useState("pausar y pedir revisión humana");
  const [logFlags, setLogFlags] = useState<string[]>(["l2", "l3"]);
  const [pivotFilter, setPivotFilter] = useState("riesgo");
  const [decision, setDecision] = useState("pilot");
  const [memo, setMemo] = useState(
    "Recomiendo piloto interno antes de envío externo. Hay señales útiles, pero dos afirmaciones requieren fuente y los datos personales deben salir del borrador.",
  );

  const promptPreview = useMemo(
    () => {
      const selected = findModelById(model);
      const notes =
        voiceNotes.length > 0
          ? `\nNotas de voz: ${voiceNotes.map((note, index) => `${index + 1}. ${note}`).join(" ")}`
          : "";
      return `${prompt}${notes}\n\nModelo: ${selected.label}${selected.badge ? ` · ${selected.badge}` : ""}.\nPrioridades: seguridad ${security}/100 · calidad ${quality}/100 · revisión humana obligatoria.`;
    },
    [model, prompt, quality, security, voiceNotes],
  );

  function handleScroll(event: React.UIEvent<HTMLElement>) {
    const target = event.currentTarget;
    const nextIndex = Math.round(target.scrollTop / target.clientHeight);
    setActiveSection(Math.max(0, Math.min(exerciseList.length - 1, nextIndex)));
  }

  function scrollToSection(index: number) {
    const section = document.querySelector<HTMLElement>(`[data-exercise-section="${index}"]`);
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <RuntimeNav mode="field_test" />
      <ScrollLines activeIndex={activeSection} onSelect={scrollToSection} />
      <main
        className="simulador-root surface-canvas h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth"
        onScroll={handleScroll}
      >
        {exerciseList.map((exercise, index) => (
          <ExerciseSection key={exercise.id} exercise={exercise} index={index}>
            {exercise.id === "textfield-ia" && (
              <PromptExercise
                prompt={prompt}
                setPrompt={setPrompt}
                promptPreview={promptPreview}
                model={model}
                setModel={setModel}
                voiceNotes={voiceNotes}
                setVoiceNotes={setVoiceNotes}
                security={security}
                setSecurity={setSecurity}
                quality={quality}
                setQuality={setQuality}
              />
            )}
            {exercise.id === "tabla-datos" && (
              <DataTableExercise rows={dataRows} setRows={setDataRows} />
            )}
            {exercise.id === "matriz-permisos" && (
              <PermissionMatrix permissions={permissions} setPermissions={setPermissions} />
            )}
            {exercise.id === "revision-output" && (
              <OutputReview flags={flags} setFlags={setFlags} />
            )}
            {exercise.id === "comparacion-ia" && (
              <ComparisonExercise comparison={comparison} setComparison={setComparison} />
            )}
            {exercise.id === "workflow-builder" && (
              <WorkflowBuilder enabledSteps={enabledSteps} setEnabledSteps={setEnabledSteps} />
            )}
            {exercise.id === "agent-brief" && (
              <AgentBrief fallback={agentFallback} setFallback={setAgentFallback} />
            )}
            {exercise.id === "logs" && (
              <LogReview flags={logFlags} setFlags={setLogFlags} />
            )}
            {exercise.id === "dashboard-pivot" && (
              <PivotExercise filter={pivotFilter} setFilter={setPivotFilter} />
            )}
            {exercise.id === "decision-memo" && (
              <DecisionMemo
                decision={decision}
                setDecision={setDecision}
                memo={memo}
                setMemo={setMemo}
              />
            )}
          </ExerciseSection>
        ))}
      </main>
    </>
  );
}

function ScrollLines({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const total = exerciseList.length;

  return (
    <div className="simulador-root fixed left-4 right-4 top-[68px] z-30 md:left-1/2 md:right-auto md:w-[min(760px,calc(100vw-320px))] md:-translate-x-1/2">
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {Array.from({ length: total }).map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Ir a sección ${index + 1}`}
            onClick={() => onSelect(index)}
            className="group h-7 min-w-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            <span
              className={`block h-[3px] rounded-sm transition-colors ${
                index === activeIndex
                  ? "bg-[var(--accent)]"
                  : index < activeIndex
                    ? "bg-[var(--text-secondary)]"
                    : "bg-[var(--surface-3)]"
              }`}
            />
          </button>
        ))}
      </div>
      <div className="mt-1 text-right text-[11px] text-[var(--text-tertiary)]">
        {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
    </div>
  );
}

function ExerciseSection({
  exercise,
  index,
  children,
}: {
  exercise: (typeof exerciseList)[number];
  index: number;
  children: React.ReactNode;
}) {
  return (
    <section
      id={exercise.id}
      data-exercise-section={index}
      className="h-[calc(100vh-3.5rem)] snap-start snap-always px-6 py-16 flex items-center"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-center">
        <aside>
          <div className="eyebrow">{exercise.eyebrow}</div>
          <h2 className="display display-tight mt-5 text-[34px] sm:text-[46px] text-[var(--text-primary)]">
            {exercise.title}
          </h2>
          <p className="mt-5 text-[16px] leading-[1.65] text-[var(--text-secondary)]">
            {exercise.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {exercise.signals.map((signal) => (
              <span
                key={signal}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[13px] text-[var(--text-secondary)]"
              >
                {signal}
              </span>
            ))}
          </div>
          <div className="mt-8 text-[13px] text-[var(--text-tertiary)]">
            bloque {String(index + 1).padStart(2, "0")} / {exerciseList.length}
          </div>
        </aside>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-[var(--shadow-sm)]">
          {children}
        </div>
      </div>
    </section>
  );
}

function PromptExercise({
  prompt,
  setPrompt,
  promptPreview,
  model,
  setModel,
  voiceNotes,
  setVoiceNotes,
  security,
  setSecurity,
  quality,
  setQuality,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  promptPreview: string;
  model: string;
  setModel: (value: string) => void;
  voiceNotes: string[];
  setVoiceNotes: (notes: string[]) => void;
  security: number;
  setSecurity: (value: number) => void;
  quality: number;
  setQuality: (value: number) => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <Label>Petición al modelo</Label>
        <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">
          Este es el campo de IA del runtime: puedes elegir modelo, escribir, dictar una nota de voz
          y enviar cuando el prompt esté listo.
        </p>
        <AIPromptComposer
          value={prompt}
          onChange={setPrompt}
          selectedModel={model}
          onSelectModel={setModel}
          voiceNotes={voiceNotes}
          onVoiceNote={(note) => setVoiceNotes([...voiceNotes, note])}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "agrega audiencia",
            "agrega límites",
            "pide fuentes",
          ].map((text) => (
            <ActionButton key={text} onClick={() => setPrompt(`${prompt}\n\n${text}.`)}>
              {text}
            </ActionButton>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-[var(--surface-2)] p-4">
        <Label>Prioridades</Label>
        <Range10 label="seguridad" value={security} onChange={setSecurity} />
        <Range10 label="calidad" value={quality} onChange={setQuality} />
        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="text-[13px] font-medium text-[var(--text-primary)]">preview</div>
          <p className="mt-2 line-clamp-6 text-[13px] leading-5 text-[var(--text-secondary)]">
            {promptPreview}
          </p>
        </div>
      </div>
    </div>
  );
}

function AIPromptComposer({
  value,
  onChange,
  selectedModel,
  onSelectModel,
  voiceNotes,
  onVoiceNote,
}: {
  value: string;
  onChange: (value: string) => void;
  selectedModel: string;
  onSelectModel: (value: string) => void;
  voiceNotes: string[];
  onVoiceNote: (note: string) => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const currentModel = findModelById(selectedModel);
  const { recState, recError, onMicClick } = useDemoVoiceCapture({
    onVoiceNote,
    onTranscript: (text) => {
      const separator = value.trim().length > 0 ? "\n\n" : "";
      onChange(`${value}${separator}${text}`);
    },
  });
  const canSend = value.trim().length > 0 && recState !== "recording" && recState !== "processing";

  return (
    <div className="mt-3">
      <div
        className="relative overflow-visible rounded-3xl border border-[var(--border)] bg-[var(--surface)] transition-colors focus-within:border-[var(--accent)]"
        style={{
          boxShadow: "0 1px 2px var(--shadow), 0 10px 32px -22px var(--shadow)",
        }}
      >
        <textarea
          value={value}
          onChange={(event) => {
            setSent(false);
            onChange(event.target.value);
          }}
          disabled={recState === "recording" || recState === "processing"}
          rows={5}
          placeholder="Escribe el prompt que le mandarías al modelo..."
          className="w-full resize-none rounded-3xl bg-transparent px-5 pb-2 pt-4 text-[15px] leading-[1.55] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] disabled:cursor-not-allowed"
          style={{ minHeight: 148, maxHeight: 260 }}
        />

        <RecordingBanner recState={recState} recError={recError} />

        {voiceNotes.length > 0 && (
          <div className="mx-3 mb-3 grid gap-2 rounded-2xl bg-[var(--surface-2)] p-3">
            {voiceNotes.map((note, index) => (
              <div
                key={`${note}-${index}`}
                className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]"
              >
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-[var(--surface)] text-[var(--accent)]">
                  <MicGlyph />
                </span>
                <span className="line-clamp-1">{note}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 px-3 pb-3">
          <div className="relative flex items-center gap-1">
            <button
              type="button"
              onClick={() => setDropdownOpen((open) => !open)}
              className="flex min-h-9 items-center gap-2 rounded-2xl px-2.5 py-1.5 text-[12px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              aria-label="Selector de modelo"
              aria-expanded={dropdownOpen}
            >
              <BrandMark brand={currentModel.brand} />
              <span>
                {currentModel.label}
                {currentModel.badge && (
                  <span className="ml-1 text-[var(--text-tertiary)]">· {currentModel.badge}</span>
                )}
              </span>
              <svg
                className={`h-3 w-3 opacity-60 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute bottom-full left-0 z-50 mb-2 max-h-[54vh] w-[300px] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-2 scrollbar-thin"
                  style={{
                    boxShadow: "0 12px 32px -8px var(--shadow), 0 2px 6px var(--shadow)",
                  }}
                >
                  {modelGroups.map((group, groupIndex) => (
                    <div key={group.title}>
                      {groupIndex > 0 && <div className="mx-3 my-1.5 h-px bg-[var(--hairline)]" />}
                      <div className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                        {group.title}
                      </div>
                      {group.families.map((family, familyIndex) => (
                        <div key={`${group.title}-${familyIndex}`}>
                          {familyIndex > 0 && (
                            <div className="mx-3 my-1 h-px bg-[var(--hairline)] opacity-60" />
                          )}
                          {family.map((model) => {
                            const isSelected = model.id === selectedModel;
                            return (
                              <button
                                key={model.id}
                                type="button"
                                onClick={() => {
                                  onSelectModel(model.id);
                                  setSent(false);
                                  setDropdownOpen(false);
                                }}
                                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors ${
                                  isSelected
                                    ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                                    : "text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
                                }`}
                              >
                                <BrandMark brand={model.brand} />
                                <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
                                  <span className="truncate">{model.label}</span>
                                  {model.badge && (
                                    <span className="shrink-0 text-[11px] text-[var(--text-tertiary)]">
                                      · {model.badge}
                                    </span>
                                  )}
                                </span>
                                <span className="flex shrink-0 items-center gap-2 text-[var(--text-tertiary)]">
                                  <span className="flex items-center gap-1">
                                    <span className="text-[9px] font-semibold tracking-wider">$</span>
                                    <LevelMeter value={model.price} ariaLabel="precio" />
                                  </span>
                                  <span aria-hidden className="h-2 w-px bg-[var(--hairline)]" />
                                  <span className="flex items-center gap-1">
                                    <SparkGlyph />
                                    <LevelMeter value={model.intel} ariaLabel="inteligencia" />
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1.5">
            <MicButton recState={recState} disabled={false} onClick={onMicClick} />
            <button
              type="button"
              disabled={!canSend}
              onClick={() => setSent(true)}
              aria-label="Enviar al modelo"
              className={`grid h-9 w-9 place-items-center rounded-full transition-all ${
                canSend
                  ? "accent-bg text-white hover:opacity-90 active:scale-95"
                  : "bg-[var(--surface-3)] text-[var(--text-disabled)] cursor-not-allowed"
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-[12px] text-[var(--text-tertiary)]">
        <span>⌘ + enter para enviar en el runtime real.</span>
        {sent && <span className="text-[var(--band-a-text)]">prompt enviado al preview</span>}
      </div>
    </div>
  );
}

function useDemoVoiceCapture({
  onVoiceNote,
  onTranscript,
}: {
  onVoiceNote: (note: string) => void;
  onTranscript: (text: string) => void;
}) {
  const [recState, setRecState] = useState<VoiceRecState>("idle");
  const [recError, setRecError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);

  function resetErrorLater() {
    window.setTimeout(() => {
      setRecState("idle");
      setRecError(null);
    }, 3200);
  }

  async function finishRecording(blob: Blob) {
    setRecState("processing");
    const seconds = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));

    try {
      const formData = new FormData();
      formData.append("audio", blob, "exercise-lab-note.webm");
      formData.append("language", "es");
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && typeof data.text === "string" && data.text.trim()) {
        const transcript = `Nota de voz: ${data.text.trim()}`;
        onVoiceNote(transcript);
        onTranscript(transcript);
      } else {
        onVoiceNote(`nota de voz adjunta (${seconds} s)`);
      }
      setRecState("idle");
    } catch {
      onVoiceNote(`nota de voz adjunta (${seconds} s)`);
      setRecState("idle");
    }
  }

  async function startRecording() {
    setRecError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRecState("error");
      setRecError("Este navegador no permite grabar audio aquí.");
      resetErrorLater();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      startedAtRef.current = Date.now();
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        void finishRecording(new Blob(chunksRef.current, { type: mime || "audio/webm" }));
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecState("recording");
    } catch {
      setRecState("error");
      setRecError("Permiso de micrófono no disponible.");
      resetErrorLater();
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.stop();
    }
  }

  function onMicClick() {
    if (recState === "recording") {
      stopRecording();
      return;
    }
    if (recState === "idle" || recState === "error") {
      void startRecording();
    }
  }

  return { recState, recError, onMicClick };
}

function RecordingBanner({
  recState,
  recError,
}: {
  recState: VoiceRecState;
  recError: string | null;
}) {
  return (
    <AnimatePresence>
      {(recState === "recording" || recState === "processing" || recState === "error") && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="flex items-center gap-2.5 px-5 pb-2 text-[13px]"
        >
          {recState === "recording" && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="font-medium text-[var(--text-secondary)]">escuchando...</span>
              <WaveBars />
              <span className="ml-auto text-[12px] text-[var(--text-tertiary)]">
                pulsa el micrófono para parar
              </span>
            </>
          )}
          {recState === "processing" && (
            <>
              <svg className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
                <path d="M14 8C14 4.69 11.31 2 8 2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              </svg>
              <span className="font-medium text-[var(--text-secondary)]">procesando nota...</span>
            </>
          )}
          {recState === "error" && recError && (
            <span className="text-[var(--band-b-text)]">{recError}</span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BrandMark({ brand }: { brand: BrandKey }) {
  const logo = brandLogo[brand];
  if (!logo) {
    return (
      <span
        className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md bg-[var(--text-primary)] text-[var(--surface)]"
        aria-hidden
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
          <path
            d="M8 2L13 4v4.5C13 11 11 13 8 14C5 13 3 11 3 8.5V4L8 2Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </svg>
      </span>
    );
  }

  return (
    <span className="grid h-[22px] w-[22px] shrink-0 place-items-center" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.light}
        alt=""
        width={22}
        height={22}
        className={logo.dark ? "block dark:hidden" : "block"}
        style={{ width: 22, height: 22, objectFit: "contain" }}
      />
      {logo.dark && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo.dark}
          alt=""
          width={22}
          height={22}
          className="hidden dark:block"
          style={{ width: 22, height: 22, objectFit: "contain" }}
        />
      )}
    </span>
  );
}

function LevelMeter({ value, ariaLabel }: { value: Level5; ariaLabel: string }) {
  return (
    <span className="inline-flex items-end gap-[2px]" aria-label={`${ariaLabel} ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((level) => (
        <span
          key={level}
          className="block w-[2.5px] rounded-[var(--radius-xs)] transition-colors"
          style={{
            height: `${3 + level * 1.6}px`,
            backgroundColor: level <= value ? "currentColor" : "var(--border-strong)",
            opacity: level <= value ? 1 : 0.5,
          }}
        />
      ))}
    </span>
  );
}

function MicButton({
  recState,
  disabled,
  onClick,
}: {
  recState: VoiceRecState;
  disabled: boolean;
  onClick: () => void;
}) {
  const isRecording = recState === "recording";
  const isProcessing = recState === "processing";
  const label =
    recState === "recording"
      ? "Detener grabación"
      : recState === "processing"
        ? "Procesando nota de voz"
        : "Dictar por voz";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isProcessing}
      aria-label={label}
      aria-pressed={isRecording}
      className={`relative grid h-9 w-9 place-items-center rounded-full transition-colors disabled:opacity-40 ${
        isRecording
          ? "bg-red-500/15 text-red-500"
          : "text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
      }`}
    >
      {isRecording && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-red-500/30" />}
      {isProcessing ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
          <path d="M14 8C14 4.69 11.31 2 8 2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        </svg>
      ) : isRecording ? (
        <span className="relative h-2.5 w-2.5 rounded-[var(--radius-xs)] bg-current" />
      ) : (
        <MicGlyph />
      )}
    </button>
  );
}

function MicGlyph() {
  return (
    <svg className="relative h-4 w-4" viewBox="0 0 16 16" fill="none">
      <rect x="5.5" y="2" width="5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3 8C3 10.7614 5.23858 13 8 13M8 13C10.7614 13 13 10.7614 13 8M8 13V14.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function SparkGlyph() {
  return (
    <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
      <path d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4L5 0Z" />
    </svg>
  );
}

function WaveBars() {
  return (
    <span className="inline-flex h-3 items-end gap-[2px]" aria-hidden>
      {[0, 1, 2, 3, 4].map((index) => (
        <span
          key={index}
          className="block w-[2px] rounded-[var(--radius-xs)] bg-[var(--band-b-bar)]"
          style={{
            height: "100%",
            animation: `simulador-wave 0.9s ease-in-out ${index * 0.12}s infinite`,
            transformOrigin: "bottom",
          }}
        />
      ))}
      <style>{`
        @keyframes simulador-wave {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </span>
  );
}

function DataTableExercise({
  rows,
  setRows,
}: {
  rows: typeof initialDataRows;
  setRows: (rows: typeof initialDataRows) => void;
}) {
  function updateAction(id: string, action: DataAction) {
    setRows(rows.map((row) => (row.id === id ? { ...row, action } : row)));
  }

  return (
    <div>
      <Label>Clasifica cada campo antes de enviarlo al modelo</Label>
      <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)]">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid gap-3 border-b border-[var(--hairline)] px-4 py-4 last:border-b-0 sm:grid-cols-[1fr_1fr_170px] sm:items-center"
          >
            <div>
              <div className="text-[15px] font-medium text-[var(--text-primary)]">{row.field}</div>
              <div className="mt-1 text-[13px] text-[var(--text-secondary)]">{row.example}</div>
            </div>
            <div className="text-[13px] text-[var(--text-secondary)]">
              decide si aporta señal o si expone información de más.
            </div>
            <select
              value={row.action}
              onChange={(event) => updateAction(row.id, event.target.value as DataAction)}
              className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-[14px] text-[var(--text-primary)]"
            >
              <option value="usar">usar</option>
              <option value="anonimizar">anonimizar</option>
              <option value="agregar">agregar</option>
              <option value="excluir">excluir</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function PermissionMatrix({
  permissions,
  setPermissions,
}: {
  permissions: Record<string, Permission>;
  setPermissions: (permissions: Record<string, Permission>) => void;
}) {
  return (
    <div>
      <Label>Define permisos por acción</Label>
      <div className="mt-4 grid gap-3">
        {permissionRows.map((row) => (
          <div
            key={row}
            className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 sm:grid-cols-[1fr_330px] sm:items-center"
          >
            <div className="text-[15px] font-medium text-[var(--text-primary)]">{row}</div>
            <div className="grid grid-cols-3 gap-2">
              {(["permitir", "revisar", "bloquear"] as Permission[]).map((option) => (
                <ChoiceButton
                  key={option}
                  selected={permissions[row] === option}
                  onClick={() => setPermissions({ ...permissions, [row]: option })}
                >
                  {option}
                </ChoiceButton>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OutputReview({
  flags,
  setFlags,
}: {
  flags: string[];
  setFlags: (flags: string[]) => void;
}) {
  return (
    <div>
      <Label>Marca lo que no se puede usar todavía</Label>
      <div className="mt-4 grid gap-3">
        {outputLines.map((line) => {
          const selected = flags.includes(line.id);
          return (
            <button
              key={line.id}
              type="button"
              onClick={() =>
                setFlags(selected ? flags.filter((flag) => flag !== line.id) : [...flags, line.id])
              }
              className={`min-h-11 rounded-2xl border px-4 py-4 text-left transition-colors ${
                selected
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"
              }`}
            >
              <span className="block text-[15px] leading-6 text-[var(--text-primary)]">{line.text}</span>
              <span className="mt-2 block text-[13px] text-[var(--text-secondary)]">{line.issue}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ComparisonExercise({
  comparison,
  setComparison,
}: {
  comparison: string;
  setComparison: (value: string) => void;
}) {
  return (
    <div>
      <Label>Elige cuál respuesta llevarías al manager</Label>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <CompareCard
          id="a"
          selected={comparison === "a"}
          onClick={() => setComparison("a")}
          title="Respuesta A"
          body="Lanza la campaña hoy. El cliente necesita ver acción rápida y la IA ya preparó los mensajes."
        />
        <CompareCard
          id="b"
          selected={comparison === "b"}
          onClick={() => setComparison("b")}
          title="Respuesta B"
          body="Usa el borrador como material interno. Quita datos personales, valida métricas y pide una revisión corta antes de enviar."
        />
      </div>
    </div>
  );
}

function WorkflowBuilder({
  enabledSteps,
  setEnabledSteps,
}: {
  enabledSteps: string[];
  setEnabledSteps: (steps: string[]) => void;
}) {
  return (
    <div>
      <Label>Activa los pasos que debe tener el flujo</Label>
      <div className="mt-4 grid gap-3">
        {workflowSteps.map((step, index) => {
          const enabled = enabledSteps.includes(step);
          return (
            <button
              key={step}
              type="button"
              onClick={() =>
                setEnabledSteps(enabled ? enabledSteps.filter((item) => item !== step) : [...enabledSteps, step])
              }
              className={`grid min-h-14 grid-cols-[36px_1fr] items-center gap-3 rounded-2xl border px-4 text-left ${
                enabled
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface-2)]"
              }`}
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--surface)] text-[13px] font-medium text-[var(--text-primary)]">
                {index + 1}
              </span>
              <span className="text-[15px] text-[var(--text-primary)]">{step}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AgentBrief({
  fallback,
  setFallback,
}: {
  fallback: string;
  setFallback: (value: string) => void;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <Label>Objetivo del agente</Label>
        <div className="mt-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-[15px] leading-6 text-[var(--text-primary)]">
          Preparar borradores de seguimiento para cuentas inactivas, sin enviar nada al cliente.
        </div>
      </div>
      <div>
        <Label>Fallback obligatorio</Label>
        <textarea
          value={fallback}
          onChange={(event) => setFallback(event.target.value)}
          rows={5}
          className="mt-2 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 text-[15px] leading-6 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        />
      </div>
      <div className="md:col-span-2 grid gap-3 sm:grid-cols-3">
        <Fact label="permiso" value="borradores internos" />
        <Fact label="bloqueo" value="envío externo" />
        <Fact label="monitoreo" value="logs y revisión" />
      </div>
    </div>
  );
}

function LogReview({
  flags,
  setFlags,
}: {
  flags: string[];
  setFlags: (flags: string[]) => void;
}) {
  return (
    <div>
      <Label>Marca eventos que requieren intervención</Label>
      <div className="mt-4 grid gap-3">
        {runLogs.map((log) => {
          const selected = flags.includes(log.id);
          return (
            <button
              key={log.id}
              type="button"
              onClick={() => setFlags(selected ? flags.filter((flag) => flag !== log.id) : [...flags, log.id])}
              className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                selected
                  ? "border-[var(--band-b-bar)] bg-[var(--band-b-bg)]"
                  : "border-[var(--border)] bg-[var(--surface-2)]"
              }`}
            >
              <span className="text-[15px] text-[var(--text-primary)]">{log.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PivotExercise({
  filter,
  setFilter,
}: {
  filter: string;
  setFilter: (value: string) => void;
}) {
  const rows = [
    { team: "ventas norte", time: "alto", risk: "medio", impact: "alto" },
    { team: "ventas sur", time: "medio", risk: "alto", impact: "medio" },
    { team: "alianzas", time: "bajo", risk: "bajo", impact: "medio" },
  ];

  return (
    <div>
      <Label>Elige la señal que llevarías al manager</Label>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {["tiempo", "riesgo", "impacto"].map((option) => (
          <ChoiceButton key={option} selected={filter === option} onClick={() => setFilter(option)}>
            {option}
          </ChoiceButton>
        ))}
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)]">
        {rows.map((row) => (
          <div
            key={row.team}
            className="grid grid-cols-4 gap-3 border-b border-[var(--hairline)] px-4 py-3 text-[14px] last:border-b-0"
          >
            <span className="font-medium text-[var(--text-primary)]">{row.team}</span>
            <span className={filter === "tiempo" ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}>{row.time}</span>
            <span className={filter === "riesgo" ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}>{row.risk}</span>
            <span className={filter === "impacto" ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}>{row.impact}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DecisionMemo({
  decision,
  setDecision,
  memo,
  setMemo,
}: {
  decision: string;
  setDecision: (value: string) => void;
  memo: string;
  setMemo: (value: string) => void;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-[280px_1fr]">
      <div className="grid gap-3">
        {[
          ["launch", "lanzar hoy"],
          ["pilot", "piloto interno"],
          ["pause", "pausar"],
        ].map(([id, label]) => (
          <ChoiceButton key={id} selected={decision === id} onClick={() => setDecision(id)}>
            {label}
          </ChoiceButton>
        ))}
      </div>
      <div>
        <Label>Explica tu recomendación</Label>
        <textarea
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          rows={7}
          className="mt-2 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 text-[15px] leading-6 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
        />
      </div>
    </div>
  );
}

function CompareCard({
  selected,
  onClick,
  title,
  body,
}: {
  id: string;
  selected: boolean;
  onClick: () => void;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-56 rounded-2xl border p-5 text-left transition-colors ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"
      }`}
    >
      <span className="block text-[15px] font-medium text-[var(--text-primary)]">{title}</span>
      <span className="mt-4 block text-[15px] leading-6 text-[var(--text-secondary)]">{body}</span>
    </button>
  );
}

function Range10({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="mt-4">
      <label className="flex items-center justify-between text-[14px]">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <span className="mono text-[var(--text-primary)]">{value}</span>
      </label>
      <input
        type="range"
        min={0}
        max={100}
        step={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--surface-3)] accent-[var(--accent)]"
      />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[14px] font-medium text-[var(--text-primary)]">{children}</div>;
}

function ActionButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-[14px] text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      {children}
    </button>
  );
}

function ChoiceButton({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-xl border px-3 text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="text-[12px] text-[var(--text-tertiary)]">{label}</div>
      <div className="mt-2 text-[15px] font-medium leading-snug text-[var(--text-primary)]">{value}</div>
    </div>
  );
}
