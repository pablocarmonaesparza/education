"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RuntimeNav } from "@/components/simulador/RuntimeNav";
import { ExerciseBlockRenderer } from "@/components/simulador/ExerciseBlockRenderer";
import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";

type DataAction = "usar" | "anonimizar" | "agregar" | "excluir";
type Permission = "permitir" | "revisar" | "bloquear";

type BrandKey = "internal" | "openai" | "anthropic" | "google" | "qwen" | "deepseek";
type Level5 = 1 | 2 | 3 | 4 | 5;
type ModelMetric = "intelligence" | "security" | "cost";
type VoiceRecState = "idle" | "recording" | "processing" | "error";
type AgentBriefField = "task" | "access" | "action" | "stop";

type AgentBriefState = Record<AgentBriefField, string>;

type PromptAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
};

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
    title: "Modelo interno",
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
    title: "Modelos convencionales",
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
    title: "Modelos chinos",
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
    id: "reading_passive",
    eyebrow: "00 · Diapositiva informativa",
    title: "Lectura, sin interacción.",
    description:
      "Para introducir el caso, contextualizar una sección o cerrar con un mensaje. Solo título, body y botón Continuar — el participante lee y avanza.",
    signals: [],
  },
  {
    id: "ai_textfield_free",
    eyebrow: "01A · Textfield de IA",
    title: "Textfield de IA (A): libre.",
    description:
      "El participante recibe un campo de IA sin ayudas adicionales. Mide cómo estructura una petición cuando opera con criterio propio.",
    signals: ["contexto", "ejecución IA", "impacto"],
  },
  {
    id: "ai_textfield_guided",
    eyebrow: "01B · Prompt guiado",
    title: "Textfield de IA (B): guiado.",
    description:
      "El participante toma decisiones acotadas por el caso y luego genera un prompt editable. Mide criterio granular sin abrir el caso a configuración libre.",
    signals: ["contexto", "datos", "ejecución IA", "juicio"],
  },
  {
    id: "data_table_triage",
    eyebrow: "02 · Tabla editable",
    title: "Decidir qué datos entran.",
    description:
      "El participante clasifica campos reales antes de usarlos. Mide minimización, privacidad y calidad de datos sin pedir teoría.",
    signals: ["datos", "juicio"],
  },
  {
    id: "permission_matrix",
    eyebrow: "03 · Matriz de permisos",
    title: "Poner límites a una automatización.",
    description:
      "El participante define qué puede hacer el sistema solo, qué requiere revisión y qué debe bloquearse. Útil para workflows y agentes.",
    signals: ["datos", "juicio", "ejecución IA"],
  },
  {
    id: "ai_output_review",
    eyebrow: "04 · Revisión de output",
    title: "Marcar errores antes de usar.",
    description:
      "El participante revisa una salida de IA con errores realistas. Mide validación, lectura de riesgo y capacidad de corregir sin aceptar todo.",
    signals: ["validación", "juicio"],
  },
  {
    id: "ai_comparison",
    eyebrow: "05 · Comparación de respuestas",
    title: "Elegir el mejor output.",
    description:
      "El participante compara dos respuestas de IA y justifica cuál usaría. Sirve para medir criterio de calidad, no sólo preferencia estética.",
    signals: ["validación", "impacto"],
  },
  {
    id: "workflow_builder",
    eyebrow: "06 · Workflow builder",
    title: "Armar un flujo con control humano.",
    description:
      "El participante configura pasos de trabajo con IA, revisión y entrega. Mide si entiende handoffs, checkpoints y responsabilidad.",
    signals: ["ejecución IA", "validación", "impacto"],
  },
  {
    id: "agent_brief_builder",
    eyebrow: "07 · Brief para agente",
    title: "Delegar una tarea sin perder control.",
    description:
      "El participante convierte una tarea de cualquier área en un encargo operable: qué debe lograr, qué puede usar, qué puede hacer y cuándo debe detenerse.",
    signals: ["ejecución IA", "juicio", "datos"],
  },
  {
    id: "run_log_review",
    eyebrow: "08 · Revisión de logs",
    title: "Detectar fallas en una corrida.",
    description:
      "El participante lee eventos de una automatización y marca dónde se rompió el control. Mide supervisión, no memoria.",
    signals: ["validación", "juicio"],
  },
  {
    id: "dashboard_pivot",
    eyebrow: "09 · Dashboard / pivot",
    title: "Leer señales de negocio.",
    description:
      "El participante filtra una tabla y elige qué señal llevar al manager. Mide si conecta IA con impacto operativo.",
    signals: ["impacto", "contexto"],
  },
  {
    id: "tradeoff_decision_memo",
    eyebrow: "11 · Decisión + memo",
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
  { id: "contact", field: "Nombre del contacto", example: "Mariana Robles", action: "anonimizar" },
  { id: "company", field: "Empresa", example: "Aurora Retail", action: "usar" },
  { id: "email", field: "Correo", example: "mariana@aurora.example", action: "excluir" },
  { id: "tickets", field: "Tickets recientes", example: "12 conversaciones", action: "agregar" as DataAction },
].map((row) => ({
  ...row,
  action: row.action === "agregar" ? "usar" : row.action,
}));

const permissionRows = [
  "Leer CRM",
  "Crear borrador",
  "Enviar a cliente",
  "Actualizar pipeline",
  "Usar conversaciones crudas",
];

const dataActionLabels: Record<DataAction, string> = {
  usar: "Usar",
  anonimizar: "Anonimizar",
  agregar: "Agregar",
  excluir: "Excluir",
};

const permissionLabels: Record<Permission, string> = {
  permitir: "Permitir",
  revisar: "Revisar",
  bloquear: "Bloquear",
};

const outputLines = [
  {
    id: "metric",
    text: "Podemos recuperar 40% de cuentas inactivas en 30 días.",
    issue: "Afirmación sin fuente",
  },
  {
    id: "pii",
    text: "El mensaje se enviará a mariana@aurora.example con tono urgente.",
    issue: "Dato personal",
  },
  {
    id: "safe",
    text: "Propongo usar datos agregados y validar cualquier promesa antes de enviar.",
    issue: "Usable",
  },
];

const workflowSteps = [
  "Resumir tickets agregados",
  "Generar tres ángulos",
  "Marcar afirmaciones sin fuente",
  "Revisión humana",
  "Entrega a Ventas",
];

const agentBriefOptions: Record<AgentBriefField, { label: string; options: string[] }> = {
  task: {
    label: "Tarea",
    options: [
      "Ordenar insumos y detectar lo importante",
      "Preparar un borrador para revisión",
      "Comparar opciones y mostrar costos y beneficios",
      "Actualizar un registro con aprobación",
    ],
  },
  access: {
    label: "Acceso",
    options: [
      "Sólo documentos aprobados del caso",
      "Datos agregados sin nombres ni correos",
      "Notas internas marcadas como compartibles",
      "Salida de otro sistema ya revisada",
    ],
  },
  action: {
    label: "Acción máxima",
    options: [
      "Sugerir, no ejecutar",
      "Crear borrador interno",
      "Clasificar y priorizar",
      "Preparar cambio para aprobación",
    ],
  },
  stop: {
    label: "Condición de paro",
    options: [
      "Aparece dato sensible",
      "Falta una fuente verificable",
      "Hay impacto externo",
      "La instrucción contradice una política",
    ],
  },
};

const runLogs = [
  { id: "l1", text: "09:02 · Agente leyó cuentas asignadas", severity: "ok" },
  { id: "l2", text: "09:03 · Incluyó correo personal en borrador", severity: "high" },
  { id: "l3", text: "09:04 · Generó métrica sin fuente externa", severity: "high" },
  { id: "l4", text: "09:05 · Dejó envío en borrador pendiente de aprobación", severity: "ok" },
];

const guidedObjectives = [
  "Reactivar cuentas con bajo uso",
  "Proponer tres ángulos de campaña",
  "Resumir feedback para Ventas",
];

const guidedAudiences = [
  "VP de Marketing",
  "Equipo de Ventas Enterprise",
  "Cliente interno de Operaciones",
];

const guidedGuardrails = [
  "No usar nombres ni correos",
  "Marcar afirmaciones sin fuente",
  "Dejarlo como borrador interno",
  "Explicar supuestos y dudas",
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
  const [freePrompt, setFreePrompt] = useState("");
  const [freeModel, setFreeModel] = useState(defaultModelId);
  const [freeVoiceNotes, setFreeVoiceNotes] = useState<string[]>([]);
  const [guidedPrompt, setGuidedPrompt] = useState("");
  const [guidedModel, setGuidedModel] = useState(defaultModelId);
  const [guidedVoiceNotes, setGuidedVoiceNotes] = useState<string[]>([]);
  const [guidedObjective, setGuidedObjective] = useState("");
  const [guidedAudience, setGuidedAudience] = useState("");
  const [guidedGuardrailsSelected, setGuidedGuardrailsSelected] = useState<string[]>([]);
  const [guidedAutonomy, setGuidedAutonomy] = useState(50);
  const [guidedSecurity, setGuidedSecurity] = useState(50);
  const [guidedCost, setGuidedCost] = useState(50);
  const [guidedResetKey, setGuidedResetKey] = useState(0);
  const [dataRows, setDataRows] = useState(initialDataRows);
  // Codex review P1: el state legacy de bloques inline ya no se usa — los 11
  // bloques ahora se renderizan via <ExerciseBlockRenderer> que gestiona
  // su propio payload tipado con emptyPayload() (no-prefill enforcement).
  // El state restante (dataRows, permissions, flags, etc.) se conserva por
  // si alguna referencia interna del monolito lo lee — se limpia gradualmente.
  const [permissions, setPermissions] = useState<Record<string, Permission>>({
    "Leer CRM": "revisar",
    "Crear borrador": "permitir",
    "Enviar a cliente": "bloquear",
    "Actualizar pipeline": "revisar",
    "Usar conversaciones crudas": "bloquear",
  });
  const [flags, setFlags] = useState<string[]>(["metric", "pii"]);
  const [comparison, setComparison] = useState("b");
  const [enabledSteps, setEnabledSteps] = useState<string[]>([
    "Resumir tickets agregados",
    "Generar tres ángulos",
    "Marcar afirmaciones sin fuente",
    "Revisión humana",
  ]);
  const [agentBrief, setAgentBrief] = useState<AgentBriefState>({
    task: "",
    access: "",
    action: "",
    stop: "",
  });
  const [logFlags, setLogFlags] = useState<string[]>(["l2", "l3"]);
  const [pivotFilter, setPivotFilter] = useState("riesgo");
  const [decision, setDecision] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    setGuidedPrompt("");
    setGuidedModel(defaultModelId);
    setGuidedVoiceNotes([]);
    setGuidedObjective("");
    setGuidedAudience("");
    setGuidedGuardrailsSelected([]);
    setGuidedAutonomy(50);
    setGuidedSecurity(50);
    setGuidedCost(50);
    setGuidedResetKey((key) => key + 1);
    setDecision("");
    setMemo("");
  }, []);

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
          <ExerciseSection
            key={exercise.id}
            exercise={exercise}
            index={index}
            onContinue={
              index < exerciseList.length - 1
                ? () => scrollToSection(index + 1)
                : undefined
            }
          >
            <ExerciseBlockRenderer
              blockId={exercise.id as ExerciseBlockId}
              sessionId={null}
              mode="lab_demo"
              slideId={exercise.id}
            />
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

  // Progress bar alineada con el contenido — mismo w-[65%] max-w-[1200px]
  // que cada ExerciseSection, centrada por left-1/2 + -translate-x-1/2.
  return (
    <div className="simulador-root fixed left-1/2 top-[68px] z-30 w-[65%] max-w-[1200px] -translate-x-1/2 px-0">
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
    </div>
  );
}

function ExerciseSection({
  exercise,
  index,
  children,
  onContinue,
}: {
  exercise: (typeof exerciseList)[number];
  index: number;
  children: React.ReactNode;
  onContinue?: () => void;
}) {
  // Layout unificado estilo Typeform (mismo principio que /case-template):
  //  - Bloque cohesivo (eyebrow → title → body → ejercicio → botón) centrado
  //    vertical + horizontal en el viewport.
  //  - Ancho 65% con cap 1200px (mismo cálculo que la progress bar arriba —
  //    quedan perfectamente alineadas).
  //  - Botón "Continuar →" + hint "Enter ↵" debajo del ejercicio.
  //    Navega al siguiente bloque vía scrollToSection (smooth scroll-snap).
  //    En el último bloque del catálogo el botón no se renderiza.
  return (
    <section
      id={exercise.id}
      data-exercise-section={index}
      className="h-[calc(100vh-3.5rem)] snap-start snap-always flex items-center justify-center py-14"
    >
      <div className="w-[65%] max-w-[1200px]">
        <div className="eyebrow">{exercise.eyebrow}</div>
        <h2 className="display display-tight mt-3 ts-display text-[var(--text-primary)]">
          {exercise.title}
        </h2>
        <p className="mt-4 ts-body-lg leading-[1.55] text-[var(--text-secondary)]">
          {exercise.description}
        </p>

        <div className="mt-8">{children}</div>

        {onContinue && (
          <div className="mt-10 flex items-center gap-4">
            <button
              type="button"
              onClick={onContinue}
              className="rounded-[var(--radius-md)] accent-bg px-7 py-3 ts-callout font-medium text-white shadow-none transition-opacity hover:opacity-90"
            >
              Continuar →
            </button>
            <span className="ts-footnote text-[var(--text-tertiary)]">
              o pulsa{" "}
              <kbd className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 ts-caption-2 font-medium text-[var(--text-secondary)]">
                Enter ↵
              </kbd>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function FreePromptExercise({
  prompt,
  setPrompt,
  model,
  setModel,
  voiceNotes,
  setVoiceNotes,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  model: string;
  setModel: (value: string) => void;
  voiceNotes: string[];
  setVoiceNotes: (notes: string[]) => void;
}) {
  return (
    <AIPromptComposer
      value={prompt}
      onChange={setPrompt}
      selectedModel={model}
      onSelectModel={setModel}
      voiceNotes={voiceNotes}
      onVoiceNote={(note) => setVoiceNotes([...voiceNotes, note])}
    />
  );
}

function GuidedPromptExercise({
  prompt,
  setPrompt,
  model,
  setModel,
  voiceNotes,
  setVoiceNotes,
  objective,
  setObjective,
  audience,
  setAudience,
  guardrails,
  setGuardrails,
  autonomy,
  setAutonomy,
  security,
  setSecurity,
  cost,
  setCost,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  model: string;
  setModel: (value: string) => void;
  voiceNotes: string[];
  setVoiceNotes: (notes: string[]) => void;
  objective: string;
  setObjective: (value: string) => void;
  audience: string;
  setAudience: (value: string) => void;
  guardrails: string[];
  setGuardrails: (value: string[]) => void;
  autonomy: number;
  setAutonomy: (value: number) => void;
  security: number;
  setSecurity: (value: number) => void;
  cost: number;
  setCost: (value: number) => void;
}) {
  const [activeInput, setActiveInput] = useState(0);
  const [modelTouched, setModelTouched] = useState(false);
  const recommendedModelId = chooseGuidedModelId({ autonomy, security, cost });
  const recommendedModel = findModelById(recommendedModelId);
  const guardrailText = guardrails.length > 0 ? guardrails.join("; ") : "Sin restricciones adicionales";
  const inputSteps = ["Objetivo", "Audiencia", "Límites", "Modelo"];
  const canCreatePrompt = Boolean(objective && audience && guardrails.length > 0 && modelTouched);

  useEffect(() => {
    if (model !== recommendedModelId) {
      setModel(recommendedModelId);
    }
  }, [model, recommendedModelId, setModel]);

  function updateModelMetric(metric: ModelMetric, value: number) {
    setModelTouched(true);
    const next = rebalanceModelTradeoffs(
      { autonomy, security, cost },
      metric,
      value,
    );
    setAutonomy(next.autonomy);
    setSecurity(next.security);
    setCost(next.cost);
  }

  function toggleGuardrail(value: string) {
    setGuardrails(
      guardrails.includes(value)
        ? guardrails.filter((item) => item !== value)
        : [...guardrails, value],
    );
  }

  function createPrompt() {
    const selected = findModelById(recommendedModelId);
    setPrompt(
      `Objetivo: ${objective}.\nAudiencia: ${audience}.\nModelo sugerido: ${selected.label}${selected.badge ? ` · ${selected.badge}` : ""}.\n\nTrabaja sólo con información agregada del caso. Límites: ${guardrailText}.\n\nPrioridades: inteligencia ${priorityLabel(autonomy)}, seguridad ${priorityLabel(security)} y costo permitido ${budgetLabel(cost)}.\n\nEntrega tres opciones accionables, riesgos visibles y validaciones humanas necesarias.`,
    );
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-stretch">
        <div className="flex h-full flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                Inputs y selección
              </div>
              <div className="mt-1 text-[18px] font-semibold text-[var(--text-primary)]">
                {inputSteps[activeInput]}
              </div>
            </div>
            <div className="flex gap-1.5" aria-label="Progreso de inputs">
              {inputSteps.map((step, index) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setActiveInput(index)}
                  aria-label={`Ir a ${step}`}
                  className={`h-2 rounded-full transition-all ${
                    index === activeInput ? "w-8 bg-[var(--accent)]" : "w-2 bg-[var(--surface-3)]"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-5">
            {activeInput === 0 && (
              <GuidedInputCard>
                <GuidedSlideOptions
                  options={guidedObjectives}
                  value={objective}
                  onChange={setObjective}
                />
              </GuidedInputCard>
            )}
            {activeInput === 1 && (
              <GuidedInputCard>
                <GuidedSlideOptions
                  options={guidedAudiences}
                  value={audience}
                  onChange={setAudience}
                />
              </GuidedInputCard>
            )}
            {activeInput === 2 && (
              <GuidedInputCard>
                <div className="grid gap-2">
                  {guidedGuardrails.map((guardrail) => (
                    <GuidedOption
                      key={guardrail}
                      selected={guardrails.includes(guardrail)}
                      onClick={() => toggleGuardrail(guardrail)}
                    >
                      {guardrail}
                    </GuidedOption>
                  ))}
                </div>
              </GuidedInputCard>
            )}
            {activeInput === 3 && (
              <GuidedInputCard>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[12px] text-[var(--text-tertiary)]">
                        Modelo recomendado
                      </div>
                      <div className="mt-1 flex min-w-0 items-center gap-2 text-[14px] font-semibold text-[var(--text-primary)]">
                        <BrandMark brand={recommendedModel.brand} />
                        <span className="truncate">
                          {recommendedModel.label}
                          {recommendedModel.badge && (
                            <span className="font-medium text-[var(--text-tertiary)]"> · {recommendedModel.badge}</span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-[var(--surface-2)] px-2.5 py-1.5 text-[11px] text-[var(--text-secondary)]">
                      Automático
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2">
                  <Range10 label="Inteligencia" value={autonomy} onChange={(value) => updateModelMetric("intelligence", value)} />
                  <Range10 label="Seguridad" value={security} onChange={(value) => updateModelMetric("security", value)} />
                  <Range10 label="Costo" value={cost} onChange={(value) => updateModelMetric("cost", value)} />
                </div>
              </GuidedInputCard>
            )}
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
            <button
              type="button"
              onClick={() => setActiveInput(Math.max(0, activeInput - 1))}
              disabled={activeInput === 0}
              className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-[14px] font-medium text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeInput === inputSteps.length - 1) {
                  createPrompt();
                  return;
                }
                setActiveInput(Math.min(inputSteps.length - 1, activeInput + 1));
              }}
              disabled={activeInput === inputSteps.length - 1 && !canCreatePrompt}
              className="min-h-11 rounded-xl bg-[var(--accent)] px-4 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--text-disabled)]"
            >
              {activeInput === inputSteps.length - 1 ? "Crear prompt" : "Siguiente"}
            </button>
          </div>
        </div>

        <div className="h-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
          <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            Respuestas
          </div>
          <div className="mt-4 grid gap-3">
            <ProcessAnswer index={1} label="Objetivo" value={objective} muted={!objective} />
            <ProcessAnswer index={2} label="Audiencia" value={audience} muted={!audience} />
            <ProcessAnswer
              index={3}
              label="Límites"
              value={guardrails.length > 0 ? guardrailText : ""}
              muted={guardrails.length === 0}
            />
            <ProcessAnswer
              index={4}
              label="Modelo"
              value={
                modelTouched
                  ? `${recommendedModel.label}${recommendedModel.badge ? ` · ${recommendedModel.badge}` : ""} · Inteligencia ${autonomy} · Seguridad ${security} · Costo ${cost}`
                  : ""
              }
              muted={!modelTouched}
            />
          </div>
        </div>
      </div>

      <div>
        <AIPromptComposer
          value={prompt}
          onChange={setPrompt}
          selectedModel={model}
          onSelectModel={setModel}
          voiceNotes={voiceNotes}
          onVoiceNote={(note) => setVoiceNotes([...voiceNotes, note])}
          readOnly
        />
      </div>
    </div>
  );
}

function chooseGuidedModelId({
  autonomy,
  security,
  cost,
}: {
  autonomy: number;
  security: number;
  cost: number;
}) {
  if (security <= 10) return autonomy >= 60 || cost >= 20 ? "deepseek-v4-pro" : "qwen-3.6";
  if (security <= 30) return cost <= 20 ? "qwen-3.6" : "deepseek-v4-pro";

  const profiles = [
    { id: "gpt-corporativo", autonomy: 30, security: 95, cost: 45 },
    { id: "chatgpt-5.5", autonomy: 60, security: 70, cost: 60 },
    { id: "chatgpt-5.5-thinking", autonomy: 82, security: 82, cost: 88 },
    { id: "claude-haiku-4.5", autonomy: 42, security: 52, cost: 30 },
    { id: "claude-sonnet-4.6", autonomy: 76, security: 66, cost: 72 },
    { id: "claude-opus-4.7", autonomy: 96, security: 82, cost: 100 },
    { id: "gemini-3-flash", autonomy: 45, security: 38, cost: 15 },
    { id: "gemini-3-pro", autonomy: 70, security: 58, cost: 55 },
    { id: "qwen-3.6", autonomy: 50, security: 10, cost: 10 },
    { id: "deepseek-v4-pro", autonomy: 66, security: 24, cost: 25 },
  ];

  return profiles
    .map((profile) => ({
      id: profile.id,
      distance:
        Math.abs(profile.autonomy - autonomy) * 1.05 +
        Math.abs(profile.security - security) * 1.25 +
        Math.abs(profile.cost - cost),
    }))
    .sort((a, b) => a.distance - b.distance)[0].id;
}

function priorityLabel(value: number) {
  if (value >= 70) return "alta";
  if (value >= 40) return "media";
  return "baja";
}

function budgetLabel(value: number) {
  if (value >= 70) return `alto (${value}/100)`;
  if (value >= 40) return `medio (${value}/100)`;
  return `bajo (${value}/100)`;
}

function roundTo10(value: number) {
  return Math.max(0, Math.min(100, Math.round(value / 10) * 10));
}

function rebalanceModelTradeoffs(
  current: { autonomy: number; security: number; cost: number },
  metric: ModelMetric,
  rawValue: number,
) {
  let autonomy = current.autonomy;
  let security = current.security;
  let cost = current.cost;
  const value = roundTo10(rawValue);

  if (metric === "intelligence") autonomy = value;
  if (metric === "security") security = value;
  if (metric === "cost") cost = value;

  const cap = 120 + cost;
  const pressure = autonomy + security;

  if (pressure <= cap) {
    return { autonomy, security, cost };
  }

  if (metric === "cost") {
    let excess = pressure - cap;
    while (excess > 0 && (autonomy > 0 || security > 0)) {
      if (autonomy >= security && autonomy > 0) {
        autonomy = roundTo10(autonomy - 10);
      } else if (security > 0) {
        security = roundTo10(security - 10);
      }
      excess -= 10;
    }
    return { autonomy, security, cost };
  }

  return {
    autonomy,
    security,
    cost: roundTo10(pressure - 120),
  };
}

function ProcessAnswer({
  index,
  label,
  value,
  muted = false,
}: {
  index: number;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="grid grid-cols-[28px_1fr] gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
      <span
        className={`grid h-7 w-7 place-items-center rounded-full text-[12px] font-semibold ${
          muted ? "bg-[var(--surface)] text-[var(--text-tertiary)]" : "bg-[var(--accent)] text-white"
        }`}
      >
        {index}
      </span>
      <span className="min-w-0">
        <span className="block text-[12px] font-medium text-[var(--text-tertiary)]">{label}</span>
        <span
          className={`mt-1 block text-[14px] leading-snug ${
            muted ? "text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"
          }`}
        >
          {value || "\u00A0"}
        </span>
      </span>
    </div>
  );
}

function GuidedInputCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[210px] rounded-2xl bg-[var(--surface-2)] p-3">
      {children}
    </div>
  );
}

function GuidedSlideOptions({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      {options.map((option) => (
        <GuidedOption key={option} selected={value === option} onClick={() => onChange(option)}>
          {option}
        </GuidedOption>
      ))}
    </div>
  );
}

function GuidedOption({
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
      className={`grid min-h-11 grid-cols-[20px_1fr] items-center gap-3 rounded-2xl border px-3 py-2 text-left text-[13px] transition-colors ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
          : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
      }`}
    >
      <span
        className={`grid h-5 w-5 place-items-center rounded-full border ${
          selected ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--border-strong)]"
        }`}
        aria-hidden
      >
        {selected && (
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6.2L5 8.7L9.5 3.8"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.7"
            />
          </svg>
        )}
      </span>
      <span className="leading-snug">{children}</span>
    </button>
  );
}

function AIPromptComposer({
  value,
  onChange,
  selectedModel,
  onSelectModel,
  voiceNotes,
  onVoiceNote,
  layout = "default",
  readOnly = false,
}: {
  value: string;
  onChange: (value: string) => void;
  selectedModel: string;
  onSelectModel: (value: string) => void;
  voiceNotes: string[];
  onVoiceNote: (note: string) => void;
  layout?: "default" | "matched";
  readOnly?: boolean;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentModel = findModelById(selectedModel);
  const { recState, recError, onMicClick } = useDemoVoiceCapture({
    onVoiceNote,
    onTranscript: (text) => {
      const separator = value.trim().length > 0 ? "\n\n" : "";
      onChange(`${value}${separator}${text}`);
    },
  });
  const canSend =
    (value.trim().length > 0 || attachments.length > 0) &&
    recState !== "recording" &&
    recState !== "processing";
  const textRows = value.trim()
    ? Math.min(7, Math.max(3, value.split("\n").length + Math.ceil(value.length / 160)))
    : 3;
  const textMinHeight = value.trim() ? Math.min(220, Math.max(92, textRows * 22 + 42)) : 92;
  const matched = layout === "matched";

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const nextAttachments = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setSent(false);
    setAttachments((current) => [...current, ...nextAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAttachment(id: string) {
    setSent(false);
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
  }

  return (
    <div className={matched ? "h-full min-h-[430px]" : "mt-3"}>
      <div
        className={`relative overflow-visible rounded-3xl border border-[var(--border)] transition-colors ${
          readOnly ? "bg-[var(--surface-2)]" : "bg-[var(--surface)] focus-within:border-[var(--accent)]"
        } ${matched ? "flex h-full min-h-[430px] flex-col" : ""}`}
        style={{
          boxShadow: "0 1px 2px var(--shadow), 0 10px 32px -22px var(--shadow)",
        }}
      >
        <textarea
          value={value}
          onChange={(event) => {
            if (readOnly) return;
            setSent(false);
            onChange(event.target.value);
          }}
          disabled={recState === "recording" || recState === "processing"}
          readOnly={readOnly}
          rows={matched ? 10 : textRows}
          placeholder={readOnly ? "Crea el prompt desde Inputs y selección..." : "Escribe el prompt que le mandarías al modelo..."}
          className={`w-full resize-none rounded-3xl bg-transparent px-5 pb-1 pt-4 text-[15px] leading-[1.5] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] disabled:cursor-not-allowed ${matched ? "flex-1" : ""} ${readOnly ? "cursor-default" : ""}`}
          style={matched ? { minHeight: 0, maxHeight: "none" } : { minHeight: textMinHeight, maxHeight: 240 }}
        />

        <RecordingBanner recState={recState} recError={recError} />

        {attachments.length > 0 && (
          <AttachmentTray attachments={attachments} onRemove={removeAttachment} />
        )}

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
            {!readOnly && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.csv,.xlsx,.xls,.doc,.docx,.txt,.md"
                  className="sr-only"
                  onChange={(event) => handleFiles(event.target.files)}
                  aria-label="Agregar archivo o foto"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Agregar archivo o foto"
                  className={`grid h-9 w-9 place-items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                    attachments.length > 0
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--surface-3)]"
                      : "text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <PlusGlyph />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                if (!readOnly) setDropdownOpen((open) => !open);
              }}
              className={`flex min-h-9 max-w-[240px] items-center gap-2 rounded-2xl py-1.5 pl-2.5 pr-3.5 text-[12px] text-[var(--text-secondary)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                readOnly
                  ? "cursor-default"
                  : "hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
              }`}
              aria-label={readOnly ? "Modelo seleccionado" : "Selector de modelo"}
              aria-expanded={readOnly ? undefined : dropdownOpen}
            >
              <BrandMark brand={currentModel.brand} />
              <span className="min-w-0 truncate">
                {currentModel.label}
                {currentModel.badge && (
                  <span className="ml-1 text-[var(--text-tertiary)]">· {currentModel.badge}</span>
                )}
              </span>
              {!readOnly && (
                <svg
                  className={`h-3 w-3 shrink-0 opacity-60 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
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
              )}
            </button>

            <AnimatePresence>
              {dropdownOpen && !readOnly && (
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
            {!readOnly && <MicButton recState={recState} disabled={false} onClick={onMicClick} />}
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
        <span>⌘ + Enter para enviar en el runtime real.</span>
        {sent && <span className="text-[var(--band-a-text)]">Prompt enviado al preview</span>}
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
        onVoiceNote(`Nota de voz adjunta (${seconds} s)`);
      }
      setRecState("idle");
    } catch {
      onVoiceNote(`Nota de voz adjunta (${seconds} s)`);
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
              <span className="font-medium text-[var(--text-secondary)]">Escuchando...</span>
              <WaveBars />
              <span className="ml-auto text-[12px] text-[var(--text-tertiary)]">
                Pulsa el micrófono para parar
              </span>
            </>
          )}
          {recState === "processing" && (
            <>
              <svg className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
                <path d="M14 8C14 4.69 11.31 2 8 2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              </svg>
              <span className="font-medium text-[var(--text-secondary)]">Procesando nota...</span>
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

function AttachmentTray({
  attachments,
  onRemove,
}: {
  attachments: PromptAttachment[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="mx-3 mb-3 grid gap-2 rounded-2xl bg-[var(--surface-2)] p-3">
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
        Adjuntos para analizar
      </div>
      <div className="grid gap-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="grid min-h-10 grid-cols-[28px_1fr_28px] items-center gap-2 rounded-xl border border-[var(--hairline)] bg-[var(--surface)] px-2.5 py-2"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <AttachmentGlyph type={attachment.type} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-medium text-[var(--text-primary)]">
                {attachment.name}
              </span>
              <span className="block text-[11px] text-[var(--text-tertiary)]">
                Simulado · {formatFileSize(attachment.size)}
              </span>
            </span>
            <button
              type="button"
              onClick={() => onRemove(attachment.id)}
              aria-label={`Quitar ${attachment.name}`}
              className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.7"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${kilobytes.toFixed(kilobytes >= 100 ? 0 : 1)} KB`;
  const megabytes = kilobytes / 1024;
  return `${megabytes.toFixed(megabytes >= 10 ? 1 : 2)} MB`;
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

function PlusGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 3.5V12.5M3.5 8H12.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function AttachmentGlyph({ type }: { type: string }) {
  const isImage = type.startsWith("image/");

  if (isImage) {
    return (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="2.5" y="3" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M4.5 10.8L6.6 8.6L8.2 10.1L9.7 8.4L11.8 10.8"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.4"
        />
        <circle cx="10.8" cy="5.8" r="1" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M5 2.5H9.2L12 5.3V12.5C12 13.05 11.55 13.5 11 13.5H5C4.45 13.5 4 13.05 4 12.5V3.5C4 2.95 4.45 2.5 5 2.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
      <path d="M9.2 2.7V5.3H11.8" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
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
              Decide si aporta señal o si expone información de más.
            </div>
            <div className="relative">
              <select
                value={row.action}
                onChange={(event) => updateAction(row.id, event.target.value as DataAction)}
                className="min-h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-2 pl-3 pr-10 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              >
                {(["usar", "anonimizar", "agregar", "excluir"] as DataAction[]).map((action) => (
                  <option key={action} value={action}>
                    {dataActionLabels[action]}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden
              >
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
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
                  {permissionLabels[option]}
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
  value,
  setValue,
}: {
  value: AgentBriefState;
  setValue: (value: AgentBriefState) => void;
}) {
  const fields: AgentBriefField[] = ["task", "access", "action", "stop"];
  const [activeField, setActiveField] = useState<AgentBriefField>("task");
  const activeIndex = fields.indexOf(activeField);
  const activeGroup = agentBriefOptions[activeField];
  const completed = fields.filter((field) => value[field]).length;

  function updateField(field: AgentBriefField, nextValue: string) {
    setValue({ ...value, [field]: nextValue });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch">
      <div className="flex min-h-[400px] flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
              Construye el brief
            </div>
            <p className="mt-2 max-w-xl text-[15px] leading-6 text-[var(--text-secondary)]">
              Define una sola pieza a la vez. El caso controla la situación; el participante sólo decide cómo delegar sin abrir riesgos.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[12px] text-[var(--text-secondary)]">
            {completed}/4
          </span>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {fields.map((field, index) => (
            <button
              key={field}
              type="button"
              onClick={() => setActiveField(field)}
              className={`min-h-10 rounded-xl border px-2 text-[12px] font-medium transition-colors ${
                activeField === field
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : value[field]
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                    : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)]"
              }`}
            >
              {index + 1}. {agentBriefOptions[field].label}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-3xl bg-[var(--surface-2)] p-4">
          <div className="text-[15px] font-semibold text-[var(--text-primary)]">
            {activeGroup.label}
          </div>
          <div className="mt-3 grid gap-2">
            {activeGroup.options.map((option) => (
              <GuidedOption
                key={option}
                selected={value[activeField] === option}
                onClick={() => {
                  updateField(activeField, option);
                  const nextField = fields[Math.min(fields.length - 1, activeIndex + 1)];
                  if (nextField !== activeField) setActiveField(nextField);
                }}
              >
                {option}
              </GuidedOption>
            ))}
          </div>
        </div>
      </div>

      <div className="flex min-h-[400px] flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          Brief del agente
        </div>
        <div className="mt-4 grid gap-2">
          <AgentBriefLine label="Tarea" value={value.task} />
          <AgentBriefLine label="Acceso permitido" value={value.access} />
          <AgentBriefLine label="Puede hacer" value={value.action} />
          <AgentBriefLine label="Debe detenerse si" value={value.stop} />
        </div>
      </div>
    </div>
  );
}

function AgentBriefLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="text-[12px] text-[var(--text-tertiary)]">{label}</div>
      <div className={`mt-1 min-h-5 text-[14px] leading-snug ${value ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}>
        {value || "\u00A0"}
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
    { team: "Ventas Norte", time: "Alto", risk: "Medio", impact: "Alto" },
    { team: "Ventas Sur", time: "Medio", risk: "Alto", impact: "Medio" },
    { team: "Alianzas", time: "Bajo", risk: "Bajo", impact: "Medio" },
  ];
  const filterLabels: Record<string, string> = {
    tiempo: "Tiempo",
    riesgo: "Riesgo",
    impacto: "Impacto",
  };

  return (
    <div>
      <Label>Elige la señal que llevarías al manager</Label>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {["tiempo", "riesgo", "impacto"].map((option) => (
          <ChoiceButton key={option} selected={filter === option} onClick={() => setFilter(option)}>
            {filterLabels[option]}
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
  const options = [
    {
      id: "launch",
      title: "Lanzar ahora",
      detail: "Úsalo si el beneficio es alto y los riesgos ya quedaron mitigados.",
    },
    {
      id: "pilot",
      title: "Piloto controlado",
      detail: "Úsalo si hay señales prometedoras, pero todavía falta validar con un grupo pequeño.",
    },
    {
      id: "pause",
      title: "Pausar y escalar",
      detail: "Úsalo si falta evidencia, hay datos sensibles o la decisión puede afectar a terceros.",
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-[320px_1fr]">
      <div>
        <Label>Elige la recomendación</Label>
        <div className="mt-3 grid gap-3">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setDecision(option.id)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                decision === option.id
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"
              }`}
            >
              <span className="block text-[15px] font-semibold text-[var(--text-primary)]">
                {option.title}
              </span>
              <span className="mt-2 block text-[13px] leading-5 text-[var(--text-secondary)]">
                {option.detail}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>Escribe el memo para tu líder</Label>
        <textarea
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          rows={10}
          placeholder="Explica qué harías, por qué, qué riesgo estás aceptando y qué tendría que revisarse antes de avanzar."
          className="mt-3 h-[calc(100%-2rem)] min-h-[260px] w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 text-[15px] leading-6 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
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
    <div>
      <label className="grid grid-cols-[72px_1fr_36px] items-center gap-3 text-[13px]">
        <span className="text-[var(--text-secondary)]">{label}</span>
        <input
          type="range"
          min={0}
          max={100}
          step={10}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--surface-3)] accent-[var(--accent)]"
        />
        <span className="mono text-[var(--text-primary)]">{value}</span>
      </label>
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
