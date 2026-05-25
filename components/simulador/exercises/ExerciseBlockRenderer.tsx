"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export type ExerciseBlockId =
  | "ai_textfield_free"
  | "ai_textfield_guided"
  | "data_table_triage"
  | "permission_matrix"
  | "ai_output_review"
  | "ai_comparison"
  | "workflow_builder"
  | "agent_brief_builder"
  | "run_log_review"
  | "dashboard_pivot"
  | "tradeoff_decision_memo";

export type ExerciseEvidence = {
  blockId: ExerciseBlockId;
  slideId: string;
  value: unknown;
  evidenceType: string;
  completed: boolean;
};

export type ExerciseBlockProps = {
  promptPlaceholder?: string;
  objectiveOptions?: string[];
  audienceOptions?: string[];
  guardrailOptions?: string[];
  dataRows?: Array<{ id?: string; field: string; example: string; note?: string }>;
  permissionRows?: string[];
  outputLines?: Array<{ id?: string; text: string; issue?: string }>;
  compareOptions?: Array<{ id: string; title: string; body: string }>;
  workflowSteps?: string[];
  agentBriefOptions?: Partial<Record<AgentBriefField, { label: string; options: string[] }>>;
  runLogs?: Array<{ id?: string; text: string; severity?: "ok" | "medium" | "high" }>;
  pivotRows?: Array<Record<string, string>>;
  pivotOptions?: Array<{ id: string; label: string }>;
  decisionOptions?: Array<{ id: string; title: string; detail: string }>;
  memoPlaceholder?: string;
  compact?: boolean;
  hideInternalLabels?: boolean;
};

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

const defaultModelId = "gpt-corporativo";

const modelGroups: ModelGroup[] = [
  {
    title: "Modelo interno",
    families: [[{ id: defaultModelId, label: "GPT Corporativo", badge: "IT", brand: "internal", price: 1, intel: 3 }]],
  },
  {
    title: "Modelos convencionales",
    families: [
      [
        { id: "chatgpt-5.5", label: "ChatGPT 5.5", brand: "openai", price: 3, intel: 4 },
        { id: "chatgpt-5.5-thinking", label: "ChatGPT 5.5", badge: "Thinking", brand: "openai", price: 5, intel: 5 },
      ],
      [
        { id: "claude-haiku-4.5", label: "Claude Haiku 4.5", brand: "anthropic", price: 2, intel: 3 },
        { id: "claude-sonnet-4.6", label: "Claude Sonnet 4.6", brand: "anthropic", price: 3, intel: 4 },
        { id: "claude-opus-4.7", label: "Claude Opus 4.7", brand: "anthropic", price: 5, intel: 5 },
      ],
      [
        { id: "gemini-3-flash", label: "Gemini 3 Flash", brand: "google", price: 1, intel: 3 },
        { id: "gemini-3-pro", label: "Gemini 3 Pro", brand: "google", price: 3, intel: 5 },
      ],
    ],
  },
  {
    title: "Modelos chinos",
    families: [
      [{ id: "qwen-3.6", label: "Qwen 3.6", brand: "qwen", price: 1, intel: 3 }],
      [{ id: "deepseek-v4-pro", label: "Deepseek V4 Pro", brand: "deepseek", price: 2, intel: 4 }],
    ],
  },
];

const brandLogo: Record<BrandKey, { light: string; dark?: string } | null> = {
  internal: null,
  openai: { light: "/brands/openai.png", dark: "/brands/openai-dark.png" },
  anthropic: { light: "/brands/anthropic.png" },
  google: { light: "/brands/gemini.png" },
  qwen: { light: "/brands/qwen.png" },
  deepseek: { light: "/brands/deepseek.png" },
};

export const exerciseBlockLabels: Record<ExerciseBlockId, string> = {
  ai_textfield_free: "01A · Textfield de IA libre",
  ai_textfield_guided: "01B · Textfield de IA guiado",
  data_table_triage: "02 · Tabla editable de datos",
  permission_matrix: "03 · Matriz de permisos",
  ai_output_review: "04 · Revisión de output",
  ai_comparison: "05 · Comparación de respuestas",
  workflow_builder: "06 · Workflow builder",
  agent_brief_builder: "07 · Brief para agente",
  run_log_review: "08 · Revisión de logs",
  dashboard_pivot: "09 · Dashboard / pivot",
  tradeoff_decision_memo: "11 · Decisión + memo",
};

const defaultObjectives = [
  "Reactivar cuentas con bajo uso",
  "Proponer tres ángulos de campaña",
  "Resumir feedback para Ventas",
];
const defaultAudiences = ["VP de Marketing", "Equipo de Ventas Enterprise", "Cliente interno de Operaciones"];
const defaultGuardrails = [
  "No usar nombres ni correos",
  "Marcar afirmaciones sin fuente",
  "Dejarlo como borrador interno",
  "Explicar supuestos y dudas",
];
const defaultDataRows: NonNullable<ExerciseBlockProps["dataRows"]> = [
  { field: "Nombre del contacto", example: "Mariana Robles", note: "Puede identificar a una persona." },
  { field: "Empresa", example: "Aurora Retail", note: "Puede aportar contexto sin dato personal." },
  { field: "Correo", example: "mariana@aurora.example", note: "No aporta al razonamiento inicial." },
  { field: "Tickets recientes", example: "12 conversaciones", note: "Conviene usarlo como señal agregada." },
];
const defaultPermissionRows = ["Leer CRM", "Crear borrador", "Enviar a cliente", "Actualizar pipeline", "Usar conversaciones crudas"];
const defaultOutputLines: NonNullable<ExerciseBlockProps["outputLines"]> = [
  { text: "Podemos recuperar 40% de cuentas inactivas en 30 días.", issue: "Afirmación sin fuente" },
  { text: "El mensaje se enviará a mariana@aurora.example con tono urgente.", issue: "Dato personal" },
  { text: "Propongo usar datos agregados y validar cualquier promesa antes de enviar.", issue: "Usable" },
];
const defaultWorkflowSteps = [
  "Resumir tickets agregados",
  "Generar tres ángulos",
  "Marcar afirmaciones sin fuente",
  "Revisión humana",
  "Entrega al equipo",
];
const defaultAgentBriefOptions: Record<AgentBriefField, { label: string; options: string[] }> = {
  task: {
    label: "Tarea",
    options: ["Ordenar insumos y detectar lo importante", "Preparar un borrador para revisión", "Comparar opciones y mostrar costos y beneficios", "Actualizar un registro con aprobación"],
  },
  access: {
    label: "Acceso",
    options: ["Sólo documentos aprobados del caso", "Datos agregados sin nombres ni correos", "Notas internas marcadas como compartibles", "Salida de otro sistema ya revisada"],
  },
  action: {
    label: "Acción máxima",
    options: ["Sugerir, no ejecutar", "Crear borrador interno", "Clasificar y priorizar", "Preparar cambio para aprobación"],
  },
  stop: {
    label: "Condición de paro",
    options: ["Aparece dato sensible", "Falta una fuente verificable", "Hay impacto externo", "La instrucción contradice una política"],
  },
};
const defaultRunLogs: NonNullable<ExerciseBlockProps["runLogs"]> = [
  { text: "09:02 · Agente leyó cuentas asignadas", severity: "ok" as const },
  { text: "09:03 · Incluyó correo personal en borrador", severity: "high" as const },
  { text: "09:04 · Generó métrica sin fuente externa", severity: "high" as const },
  { text: "09:05 · Dejó envío en borrador pendiente de aprobación", severity: "ok" as const },
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

export function ExerciseBlockRenderer({
  blockId,
  slideId,
  props = {},
  onEvidence,
}: {
  blockId: ExerciseBlockId;
  slideId: string;
  props?: ExerciseBlockProps;
  onEvidence?: (evidence: ExerciseEvidence) => void;
}) {
  function emit(value: unknown, evidenceType: string, completed: boolean) {
    onEvidence?.({ blockId, slideId, value, evidenceType, completed });
  }

  if (blockId === "ai_textfield_free") {
    return <FreePromptBlock props={props} emit={emit} />;
  }
  if (blockId === "ai_textfield_guided") {
    return <GuidedPromptBlock props={props} emit={emit} />;
  }
  if (blockId === "data_table_triage") {
    return <DataTableBlock props={props} emit={emit} />;
  }
  if (blockId === "permission_matrix") {
    return <PermissionMatrixBlock props={props} emit={emit} />;
  }
  if (blockId === "ai_output_review") {
    return <OutputReviewBlock props={props} emit={emit} />;
  }
  if (blockId === "ai_comparison") {
    return <ComparisonBlock props={props} emit={emit} />;
  }
  if (blockId === "workflow_builder") {
    return <WorkflowBlock props={props} emit={emit} />;
  }
  if (blockId === "agent_brief_builder") {
    return <AgentBriefBlock props={props} emit={emit} />;
  }
  if (blockId === "run_log_review") {
    return <LogReviewBlock props={props} emit={emit} />;
  }
  if (blockId === "dashboard_pivot") {
    return <PivotBlock props={props} emit={emit} />;
  }
  return <DecisionMemoBlock props={props} emit={emit} />;
}

function FreePromptBlock({ props, emit }: { props: ExerciseBlockProps; emit: EmitEvidence }) {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(defaultModelId);
  const [voiceNotes, setVoiceNotes] = useState<string[]>([]);

  useEffect(() => {
    emit({ prompt, model, voiceNotes }, "ai_prompt_free", Boolean(prompt.trim()));
  }, [prompt, model, voiceNotes]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Panel label={exerciseBlockLabels.ai_textfield_free} hideLabel={props.hideInternalLabels}>
      <AIPromptComposer
        value={prompt}
        onChange={setPrompt}
        selectedModel={model}
        onSelectModel={setModel}
        voiceNotes={voiceNotes}
        onVoiceNote={(note) => setVoiceNotes((notes) => [...notes, note])}
        placeholder={props.promptPlaceholder}
      />
    </Panel>
  );
}

function GuidedPromptBlock({ props, emit }: { props: ExerciseBlockProps; emit: EmitEvidence }) {
  const [prompt, setPrompt] = useState("");
  const [voiceNotes, setVoiceNotes] = useState<string[]>([]);
  const [objective, setObjective] = useState("");
  const [audience, setAudience] = useState("");
  const [guardrails, setGuardrails] = useState<string[]>([]);
  const [intelligence, setIntelligence] = useState(50);
  const [security, setSecurity] = useState(50);
  const [cost, setCost] = useState(50);
  const [activeInput, setActiveInput] = useState(0);
  const [modelTouched, setModelTouched] = useState(false);
  const objectiveOptions = props.objectiveOptions ?? defaultObjectives;
  const audienceOptions = props.audienceOptions ?? defaultAudiences;
  const guardrailOptions = props.guardrailOptions ?? defaultGuardrails;
  const recommendedModelId = chooseGuidedModelId({ intelligence, security, cost });
  const recommendedModel = findModelById(recommendedModelId);
  const guardrailText = guardrails.length > 0 ? guardrails.join("; ") : "";
  const inputSteps = ["Objetivo", "Audiencia", "Límites", "Modelo"];
  const canCreatePrompt = Boolean(objective && audience && guardrails.length > 0 && modelTouched);

  useEffect(() => {
    emit(
      { objective, audience, guardrails, intelligence, security, cost, model: recommendedModelId, prompt },
      "ai_prompt_guided",
      Boolean(prompt),
    );
  }, [objective, audience, guardrails, intelligence, security, cost, recommendedModelId, prompt]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateModelMetric(metric: ModelMetric, value: number) {
    setModelTouched(true);
    const next = rebalanceModelTradeoffs({ intelligence, security, cost }, metric, value);
    setIntelligence(next.intelligence);
    setSecurity(next.security);
    setCost(next.cost);
  }

  function createPrompt() {
    setPrompt(
      `Objetivo: ${objective}.\nAudiencia: ${audience}.\nModelo sugerido: ${recommendedModel.label}${recommendedModel.badge ? ` · ${recommendedModel.badge}` : ""}.\n\nTrabaja sólo con información permitida del caso. Límites: ${guardrailText}.\n\nPrioridades: inteligencia ${priorityLabel(intelligence)}, seguridad ${priorityLabel(security)} y costo permitido ${budgetLabel(cost)}.\n\nEntrega una respuesta breve con opciones accionables, riesgos visibles y validaciones humanas necesarias.`,
    );
  }

  return (
    <Panel label={exerciseBlockLabels.ai_textfield_guided} bare>
      {!props.hideInternalLabels ? (
        <div className="mb-4 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          {exerciseBlockLabels.ai_textfield_guided}
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-stretch">
        <div className="flex min-h-[320px] flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                Inputs y selección
              </div>
              <div className="mt-1 text-[18px] font-semibold text-[var(--text-primary)]">{inputSteps[activeInput]}</div>
            </div>
            <StepDots steps={inputSteps.length} active={activeInput} setActive={setActiveInput} />
          </div>

          <div className="mt-4">
            {activeInput === 0 && <GuidedInputOptions options={objectiveOptions} value={objective} onChange={setObjective} />}
            {activeInput === 1 && <GuidedInputOptions options={audienceOptions} value={audience} onChange={setAudience} />}
            {activeInput === 2 && (
              <GuidedInputCard>
                <div className="grid gap-2">
                  {guardrailOptions.map((guardrail) => (
                    <GuidedOption
                      key={guardrail}
                      selected={guardrails.includes(guardrail)}
                      onClick={() =>
                        setGuardrails((current) =>
                          current.includes(guardrail)
                            ? current.filter((item) => item !== guardrail)
                            : [...current, guardrail],
                        )
                      }
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
                      <div className="text-[12px] text-[var(--text-tertiary)]">Modelo recomendado</div>
                      <div className="mt-1 flex min-w-0 items-center gap-2 text-[14px] font-semibold text-[var(--text-primary)]">
                        <BrandMark brand={recommendedModel.brand} />
                        <span className="truncate">
                          {recommendedModel.label}
                          {recommendedModel.badge && <span className="font-medium text-[var(--text-tertiary)]"> · {recommendedModel.badge}</span>}
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-[var(--surface-2)] px-2.5 py-1.5 text-[11px] text-[var(--text-secondary)]">
                      Automático
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2">
                  <Range10 label="Inteligencia" value={intelligence} onChange={(value) => updateModelMetric("intelligence", value)} />
                  <Range10 label="Seguridad" value={security} onChange={(value) => updateModelMetric("security", value)} />
                  <Range10 label="Costo" value={cost} onChange={(value) => updateModelMetric("cost", value)} />
                </div>
              </GuidedInputCard>
            )}
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
            <button type="button" onClick={() => setActiveInput(Math.max(0, activeInput - 1))} disabled={activeInput === 0} className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-[14px] font-medium text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40">
              Atrás
            </button>
            <button
              type="button"
              onClick={() => {
                if (activeInput === inputSteps.length - 1) return createPrompt();
                setActiveInput(Math.min(inputSteps.length - 1, activeInput + 1));
              }}
              disabled={activeInput === inputSteps.length - 1 && !canCreatePrompt}
              className="min-h-11 rounded-xl bg-[var(--accent)] px-4 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--text-disabled)]"
            >
              {activeInput === inputSteps.length - 1 ? "Crear prompt" : "Siguiente"}
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
            <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Respuestas</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <ProcessAnswer index={1} label="Objetivo" value={objective} muted={!objective} />
              <ProcessAnswer index={2} label="Audiencia" value={audience} muted={!audience} />
              <ProcessAnswer index={3} label="Límites" value={guardrailText} muted={!guardrailText} />
              <ProcessAnswer
                index={4}
                label="Modelo"
                value={modelTouched ? `${recommendedModel.label}${recommendedModel.badge ? ` · ${recommendedModel.badge}` : ""} · Inteligencia ${intelligence} · Seguridad ${security} · Costo ${cost}` : ""}
                muted={!modelTouched}
              />
            </div>
          </div>
          <AIPromptComposer
            value={prompt}
            onChange={setPrompt}
            selectedModel={recommendedModelId}
            onSelectModel={() => undefined}
            voiceNotes={voiceNotes}
            onVoiceNote={(note) => setVoiceNotes((notes) => [...notes, note])}
            readOnly
          />
        </div>
      </div>
    </Panel>
  );
}

type EmitEvidence = (value: unknown, evidenceType: string, completed: boolean) => void;

function DataTableBlock({ props, emit }: { props: ExerciseBlockProps; emit: EmitEvidence }) {
  const rows = (props.dataRows ?? defaultDataRows).map((row, index) => ({ ...row, id: row.id ?? `row-${index}` }));
  const compact = Boolean(props.compact);
  const [actions, setActions] = useState<Record<string, DataAction | "">>({});
  useEffect(() => {
    emit(actions, "data_classification", Object.keys(actions).length === rows.length);
  }, [actions]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Panel label={exerciseBlockLabels.data_table_triage} hideLabel={props.hideInternalLabels}>
      <Label>Clasifica cada campo antes de enviarlo al modelo</Label>
      <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)]">
        {rows.map((row) => (
          <div key={row.id} className={`grid gap-3 border-b border-[var(--hairline)] px-4 last:border-b-0 sm:grid-cols-[1fr_1fr_170px] sm:items-center ${compact ? "py-2.5" : "py-4"}`}>
            <div>
              <div className="text-[15px] font-medium text-[var(--text-primary)]">{row.field}</div>
              <div className={`mt-1 text-[13px] text-[var(--text-secondary)] ${compact ? "line-clamp-1" : ""}`}>{row.example}</div>
            </div>
            <div className={`text-[13px] leading-5 text-[var(--text-secondary)] ${compact ? "line-clamp-2" : ""}`}>{row.note ?? "Decide si aporta señal o expone información de más."}</div>
            <div className="relative">
              <select value={actions[row.id] ?? ""} onChange={(event) => setActions((current) => ({ ...current, [row.id]: event.target.value as DataAction }))} className="min-h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-2 pl-3 pr-10 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">
                <option value="">Decidir</option>
                {(["usar", "anonimizar", "agregar", "excluir"] as DataAction[]).map((action) => (
                  <option key={action} value={action}>{dataActionLabels[action]}</option>
                ))}
              </select>
              <ChevronDown />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function PermissionMatrixBlock({ props, emit }: { props: ExerciseBlockProps; emit: EmitEvidence }) {
  const rows = props.permissionRows ?? defaultPermissionRows;
  const compact = Boolean(props.compact);
  const [permissions, setPermissions] = useState<Record<string, Permission | "">>({});
  useEffect(() => {
    emit(permissions, "permission_matrix", Object.keys(permissions).length === rows.length);
  }, [permissions]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Panel label={exerciseBlockLabels.permission_matrix} hideLabel={props.hideInternalLabels}>
      <Label>Define permisos por acción</Label>
      <div className={`mt-4 grid ${compact ? "gap-2" : "gap-3"}`}>
        {rows.map((row) => (
          <div key={row} className={`grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] sm:grid-cols-[1fr_330px] sm:items-center ${compact ? "p-3" : "p-4"}`}>
            <div className="text-[15px] font-medium text-[var(--text-primary)]">{row}</div>
            <div className="grid grid-cols-3 gap-2">
              {(["permitir", "revisar", "bloquear"] as Permission[]).map((option) => (
                <ChoiceButton key={option} selected={permissions[row] === option} onClick={() => setPermissions((current) => ({ ...current, [row]: option }))}>
                  {permissionLabels[option]}
                </ChoiceButton>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function OutputReviewBlock({ props, emit }: { props: ExerciseBlockProps; emit: EmitEvidence }) {
  const lines = (props.outputLines ?? defaultOutputLines).map((line, index) => ({ ...line, id: line.id ?? `line-${index}` }));
  const [flags, setFlags] = useState<string[]>([]);
  useEffect(() => {
    emit(flags, "output_review_flags", flags.length > 0);
  }, [flags]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Panel label={exerciseBlockLabels.ai_output_review} hideLabel={props.hideInternalLabels}>
      <Label>Marca lo que no se puede usar todavía</Label>
      <SelectableLines lines={lines} flags={flags} setFlags={setFlags} />
    </Panel>
  );
}

function ComparisonBlock({ props, emit }: { props: ExerciseBlockProps; emit: EmitEvidence }) {
  const options = props.compareOptions ?? [
    { id: "a", title: "Respuesta A", body: "Lanza la acción hoy. La IA ya preparó mensajes y el equipo necesita velocidad." },
    { id: "b", title: "Respuesta B", body: "Usa el borrador como material interno. Valida datos, claims y revisión humana antes de usarlo." },
  ];
  const [selected, setSelected] = useState("");
  useEffect(() => {
    emit(selected, "ai_comparison_choice", Boolean(selected));
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Panel label={exerciseBlockLabels.ai_comparison} hideLabel={props.hideInternalLabels}>
      <Label>Elige cuál respuesta llevarías al manager</Label>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {options.map((option) => (
          <CompareCard key={option.id} selected={selected === option.id} onClick={() => setSelected(option.id)} title={option.title} body={option.body} />
        ))}
      </div>
    </Panel>
  );
}

function WorkflowBlock({ props, emit }: { props: ExerciseBlockProps; emit: EmitEvidence }) {
  const steps = props.workflowSteps ?? defaultWorkflowSteps;
  const compact = Boolean(props.compact);
  const [enabledSteps, setEnabledSteps] = useState<string[]>([]);
  useEffect(() => {
    emit(enabledSteps, "workflow_steps", enabledSteps.length >= 3);
  }, [enabledSteps]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Panel label={exerciseBlockLabels.workflow_builder} hideLabel={props.hideInternalLabels}>
      <Label>Activa los pasos que debe tener el flujo</Label>
      <div className={`mt-4 grid ${compact ? "gap-2" : "gap-3"}`}>
        {steps.map((step, index) => {
          const enabled = enabledSteps.includes(step);
          return (
            <button key={step} type="button" onClick={() => setEnabledSteps((current) => enabled ? current.filter((item) => item !== step) : [...current, step])} className={`grid ${compact ? "min-h-11" : "min-h-14"} grid-cols-[36px_1fr] items-center gap-3 rounded-2xl border px-4 text-left ${enabled ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--surface-2)]"}`}>
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--surface)] text-[13px] font-medium text-[var(--text-primary)]">{index + 1}</span>
              <span className="text-[15px] text-[var(--text-primary)]">{step}</span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function AgentBriefBlock({ props, emit }: { props: ExerciseBlockProps; emit: EmitEvidence }) {
  const optionGroups: Record<AgentBriefField, { label: string; options: string[] }> = {
    ...defaultAgentBriefOptions,
    ...props.agentBriefOptions,
  };
  const fields: AgentBriefField[] = ["task", "access", "action", "stop"];
  const [value, setValue] = useState<AgentBriefState>({ task: "", access: "", action: "", stop: "" });
  const [activeField, setActiveField] = useState<AgentBriefField>("task");
  const compact = Boolean(props.compact);
  const activeIndex = fields.indexOf(activeField);
  const activeGroup = optionGroups[activeField];
  const completed = fields.filter((field) => value[field]).length;
  useEffect(() => {
    emit(value, "agent_brief", completed === fields.length);
  }, [value, completed]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Panel label={exerciseBlockLabels.agent_brief_builder} bare>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-stretch">
        <div className={`flex flex-col ${compact ? "min-h-[250px]" : "min-h-[360px]"}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label>Construye el brief</Label>
              <p className={`${compact ? "hidden" : "mt-2"} max-w-xl text-[15px] leading-6 text-[var(--text-secondary)]`}>
                Define una pieza a la vez. El caso controla la situación; el participante decide cómo delegar sin abrir riesgos.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[12px] text-[var(--text-secondary)]">{completed}/4</span>
          </div>
          <div className={`${compact ? "mt-3" : "mt-5"} grid grid-cols-4 gap-2`}>
            {fields.map((field, index) => (
              <button key={field} type="button" onClick={() => setActiveField(field)} className={`min-h-10 rounded-xl border px-2 text-[12px] font-medium transition-colors ${activeField === field ? "border-[var(--accent)] bg-[var(--accent)] text-white" : value[field] ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]" : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)]"}`}>
                {index + 1}. {optionGroups[field].label}
              </button>
            ))}
          </div>
          <div className={`${compact ? "mt-3 p-3" : "mt-5 p-4"} rounded-3xl bg-[var(--surface-2)]`}>
            <div className="text-[15px] font-semibold text-[var(--text-primary)]">{activeGroup.label}</div>
            <div className="mt-3 grid gap-2">
              {activeGroup.options.map((option) => (
                <GuidedOption
                  key={option}
                  selected={value[activeField] === option}
                  onClick={() => {
                    setValue((current) => ({ ...current, [activeField]: option }));
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
        <div className={`flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface-2)] p-4 ${compact ? "min-h-[250px]" : "min-h-[360px]"}`}>
          <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Brief del agente</div>
          <div className="mt-4 grid gap-2">
            <AgentBriefLine label="Tarea" value={value.task} />
            <AgentBriefLine label="Acceso permitido" value={value.access} />
            <AgentBriefLine label="Puede hacer" value={value.action} />
            <AgentBriefLine label="Debe detenerse si" value={value.stop} />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function LogReviewBlock({ props, emit }: { props: ExerciseBlockProps; emit: EmitEvidence }) {
  const logs = (props.runLogs ?? defaultRunLogs).map((log, index) => ({ ...log, id: log.id ?? `log-${index}` }));
  const [flags, setFlags] = useState<string[]>([]);
  useEffect(() => {
    emit(flags, "run_log_flags", flags.length > 0);
  }, [flags]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Panel label={exerciseBlockLabels.run_log_review} hideLabel={props.hideInternalLabels}>
      <Label>Marca eventos que requieren intervención</Label>
      <SelectableLines lines={logs.map((log) => ({ id: log.id, text: log.text, issue: log.severity === "high" ? "Riesgo alto" : "Revisar contexto" }))} flags={flags} setFlags={setFlags} highMode />
    </Panel>
  );
}

function PivotBlock({ props, emit }: { props: ExerciseBlockProps; emit: EmitEvidence }) {
  const rows = props.pivotRows ?? [
    { equipo: "Ventas Norte", tiempo: "Alto", riesgo: "Medio", impacto: "Alto" },
    { equipo: "Ventas Sur", tiempo: "Medio", riesgo: "Alto", impacto: "Medio" },
    { equipo: "Alianzas", tiempo: "Bajo", riesgo: "Bajo", impacto: "Medio" },
  ];
  const options = props.pivotOptions ?? [
    { id: "tiempo", label: "Tiempo" },
    { id: "riesgo", label: "Riesgo" },
    { id: "impacto", label: "Impacto" },
  ];
  const [filter, setFilter] = useState("");
  useEffect(() => {
    emit(filter, "business_signal", Boolean(filter));
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Panel label={exerciseBlockLabels.dashboard_pivot} hideLabel={props.hideInternalLabels}>
      <Label>Elige la señal que llevarías al manager</Label>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <ChoiceButton key={option.id} selected={filter === option.id} onClick={() => setFilter(option.id)}>
            {option.label}
          </ChoiceButton>
        ))}
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--border)]">
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-4 gap-3 border-b border-[var(--hairline)] px-4 py-3 text-[14px] last:border-b-0">
            {Object.entries(row).slice(0, 4).map(([key, value], itemIndex) => (
              <span key={key} className={itemIndex === 0 ? "font-medium text-[var(--text-primary)]" : filter === key ? "text-[var(--accent)]" : "text-[var(--text-secondary)]"}>
                {value}
              </span>
            ))}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DecisionMemoBlock({ props, emit }: { props: ExerciseBlockProps; emit: EmitEvidence }) {
  const options = props.decisionOptions ?? [
    { id: "launch", title: "Lanzar ahora", detail: "Úsalo si el beneficio es alto y los riesgos ya quedaron mitigados." },
    { id: "pilot", title: "Piloto controlado", detail: "Úsalo si hay señales prometedoras, pero todavía falta validar con un grupo pequeño." },
    { id: "pause", title: "Pausar y escalar", detail: "Úsalo si falta evidencia, hay datos sensibles o la decisión puede afectar a terceros." },
  ];
  const [decision, setDecision] = useState("");
  const [memo, setMemo] = useState("");
  useEffect(() => {
    emit({ decision, memo }, "decision_memo", Boolean(decision && memo.trim()));
  }, [decision, memo]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Panel label={exerciseBlockLabels.tradeoff_decision_memo} hideLabel={props.hideInternalLabels}>
      <div className="grid gap-5 md:grid-cols-[320px_1fr]">
        <div>
          <Label>Elige la recomendación</Label>
          <div className="mt-3 grid gap-3">
            {options.map((option) => (
              <button key={option.id} type="button" onClick={() => setDecision(option.id)} className={`rounded-2xl border p-4 text-left transition-colors ${decision === option.id ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"}`}>
                <span className="block text-[15px] font-semibold text-[var(--text-primary)]">{option.title}</span>
                <span className="mt-2 block text-[13px] leading-5 text-[var(--text-secondary)]">{option.detail}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Escribe el memo para tu líder</Label>
          <textarea value={memo} onChange={(event) => setMemo(event.target.value)} rows={9} placeholder={props.memoPlaceholder ?? "Explica qué harías, por qué, qué riesgo estás aceptando y qué tendría que revisarse antes de avanzar."} className="mt-3 min-h-[240px] w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 text-[15px] leading-6 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]" />
        </div>
      </div>
    </Panel>
  );
}

function AIPromptComposer({
  value,
  onChange,
  selectedModel,
  onSelectModel,
  voiceNotes,
  onVoiceNote,
  placeholder,
  layout = "default",
  readOnly = false,
}: {
  value: string;
  onChange: (value: string) => void;
  selectedModel: string;
  onSelectModel: (value: string) => void;
  voiceNotes: string[];
  onVoiceNote: (note: string) => void;
  placeholder?: string;
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
      if (readOnly) return;
      const separator = value.trim().length > 0 ? "\n\n" : "";
      onChange(`${value}${separator}${text}`);
    },
  });
  const canSend = (value.trim().length > 0 || attachments.length > 0) && recState !== "recording" && recState !== "processing";
  const textRows = value.trim() ? Math.min(7, Math.max(3, value.split("\n").length + Math.ceil(value.length / 160))) : 3;
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

  return (
      <div className={matched ? "h-full min-h-[320px]" : "mt-3"}>
      <div className={`relative overflow-visible rounded-3xl border border-[var(--border)] transition-colors ${readOnly ? "bg-[var(--surface-2)]" : "bg-[var(--surface)] focus-within:border-[var(--accent)]"} ${matched ? "flex h-full min-h-[320px] flex-col" : ""}`} style={{ boxShadow: "0 1px 2px var(--shadow), 0 10px 32px -22px var(--shadow)" }}>
        <textarea
          value={value}
          onChange={(event) => {
            if (readOnly) return;
            setSent(false);
            onChange(event.target.value);
          }}
          disabled={recState === "recording" || recState === "processing"}
          readOnly={readOnly}
          rows={matched ? 7 : textRows}
          placeholder={readOnly ? "El prompt aparecerá aquí cuando completes las selecciones..." : placeholder ?? "Escribe el prompt que le mandarías al modelo..."}
          className={`w-full resize-none rounded-3xl bg-transparent px-5 pb-1 pt-4 text-[15px] leading-[1.5] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] disabled:cursor-not-allowed ${matched ? "flex-1" : ""} ${readOnly ? "cursor-default" : ""}`}
          style={matched ? { minHeight: 0, maxHeight: "none" } : { minHeight: textMinHeight, maxHeight: 240 }}
        />

        <RecordingBanner recState={recState} recError={recError} />
        {attachments.length > 0 && <AttachmentTray attachments={attachments} onRemove={(id) => setAttachments((current) => current.filter((attachment) => attachment.id !== id))} />}
        {voiceNotes.length > 0 && (
          <div className="mx-3 mb-3 grid gap-2 rounded-2xl bg-[var(--surface-2)] p-3">
            {voiceNotes.map((note, index) => (
              <div key={`${note}-${index}`} className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-[var(--surface)] text-[var(--accent)]"><MicGlyph /></span>
                <span className="line-clamp-1">{note}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 px-3 pb-3">
          <div className="relative flex items-center gap-1">
            {!readOnly && (
              <>
                <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.csv,.xlsx,.xls,.doc,.docx,.txt,.md" className="sr-only" onChange={(event) => handleFiles(event.target.files)} aria-label="Agregar archivo o foto" />
                <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Agregar archivo o foto" className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${attachments.length > 0 ? "bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--surface-3)]" : "text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"}`}>
                  <PlusGlyph />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                if (!readOnly) setDropdownOpen((open) => !open);
              }}
              className={`flex min-h-9 max-w-[240px] items-center gap-2 rounded-2xl py-1.5 pl-2.5 pr-3.5 text-[12px] text-[var(--text-secondary)] transition-colors ${readOnly ? "cursor-default" : "hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"}`}
              aria-label={readOnly ? "Modelo seleccionado" : "Selector de modelo"}
              aria-expanded={readOnly ? undefined : dropdownOpen}
            >
              <BrandMark brand={currentModel.brand} />
              <span className="min-w-0 truncate">{currentModel.label}{currentModel.badge && <span className="ml-1 text-[var(--text-tertiary)]">· {currentModel.badge}</span>}</span>
              {!readOnly && <ChevronIcon open={dropdownOpen} />}
            </button>

            <AnimatePresence>
              {dropdownOpen && !readOnly && <ModelMenu selectedModel={selectedModel} onSelect={(id) => { onSelectModel(id); setSent(false); setDropdownOpen(false); }} />}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1.5">
            {!readOnly && <MicButton recState={recState} disabled={false} onClick={onMicClick} />}
            <button type="button" disabled={!canSend} onClick={() => setSent(true)} aria-label="Enviar al modelo" className={`grid h-9 w-9 place-items-center rounded-full transition-all ${canSend ? "accent-bg text-white hover:opacity-90 active:scale-95" : "cursor-not-allowed bg-[var(--surface-3)] text-[var(--text-disabled)]"}`}>
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none"><path d="M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
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

function ModelMenu({ selectedModel, onSelect }: { selectedModel: string; onSelect: (id: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }} className="absolute bottom-full left-0 z-50 mb-2 max-h-[54vh] w-[300px] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-2 scrollbar-thin" style={{ boxShadow: "0 12px 32px -8px var(--shadow), 0 2px 6px var(--shadow)" }}>
      {modelGroups.map((group, groupIndex) => (
        <div key={group.title}>
          {groupIndex > 0 && <div className="mx-3 my-1.5 h-px bg-[var(--hairline)]" />}
          <div className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">{group.title}</div>
          {group.families.map((family, familyIndex) => (
            <div key={`${group.title}-${familyIndex}`}>
              {familyIndex > 0 && <div className="mx-3 my-1 h-px bg-[var(--hairline)] opacity-60" />}
              {family.map((model) => (
                <button key={model.id} type="button" onClick={() => onSelect(model.id)} className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors ${model.id === selectedModel ? "bg-[var(--accent-soft)] text-[var(--text-primary)]" : "text-[var(--text-primary)] hover:bg-[var(--surface-3)]"}`}>
                  <BrandMark brand={model.brand} />
                  <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
                    <span className="truncate">{model.label}</span>
                    {model.badge && <span className="shrink-0 text-[11px] text-[var(--text-tertiary)]">· {model.badge}</span>}
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-[var(--text-tertiary)]">
                    <span className="flex items-center gap-1"><span className="text-[9px] font-semibold tracking-wider">$</span><LevelMeter value={model.price} ariaLabel="precio" /></span>
                    <span aria-hidden className="h-2 w-px bg-[var(--hairline)]" />
                    <span className="flex items-center gap-1"><SparkGlyph /><LevelMeter value={model.intel} ariaLabel="inteligencia" /></span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      ))}
    </motion.div>
  );
}

function SelectableLines({ lines, flags, setFlags, highMode = false }: { lines: Array<{ id: string; text: string; issue?: string }>; flags: string[]; setFlags: (flags: string[]) => void; highMode?: boolean }) {
  return (
    <div className="mt-4 grid gap-3">
      {lines.map((line) => {
        const selected = flags.includes(line.id);
        return (
          <button key={line.id} type="button" onClick={() => setFlags(selected ? flags.filter((flag) => flag !== line.id) : [...flags, line.id])} className={`min-h-10 rounded-2xl border px-4 py-3 text-left transition-colors ${selected ? highMode ? "border-[var(--band-b-bar)] bg-[var(--band-b-bg)]" : "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"}`}>
            <span className="block text-[15px] leading-6 text-[var(--text-primary)]">{line.text}</span>
            {line.issue && <span className="mt-2 block text-[13px] text-[var(--text-secondary)]">{line.issue}</span>}
          </button>
        );
      })}
    </div>
  );
}

function useDemoVoiceCapture({ onVoiceNote, onTranscript }: { onVoiceNote: (note: string) => void; onTranscript: (text: string) => void }) {
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
      formData.append("audio", blob, "exercise-note.webm");
      formData.append("language", "es");
      const response = await fetch("/api/transcribe", { method: "POST", body: formData });
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
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
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

  function onMicClick() {
    const recorder = recorderRef.current;
    if (recState === "recording" && recorder?.state === "recording") {
      recorder.stop();
      return;
    }
    if (recState === "idle" || recState === "error") void startRecording();
  }

  return { recState, recError, onMicClick };
}

function findModelById(id: string): ModelOption {
  for (const group of modelGroups) {
    for (const family of group.families) {
      const found = family.find((model) => model.id === id);
      if (found) return found;
    }
  }
  return modelGroups[0].families[0][0];
}

function chooseGuidedModelId({ intelligence, security, cost }: { intelligence: number; security: number; cost: number }) {
  if (security <= 20 && cost <= 30) return "qwen-3.6";
  if (cost <= 30 && intelligence >= 70) return "deepseek-v4-pro";
  if (security >= 80 && intelligence >= 80 && cost >= 80) return "claude-opus-4.7";
  if (security >= 70 && intelligence >= 60) return "claude-sonnet-4.6";
  if (intelligence >= 80 && cost >= 50) return "chatgpt-5.5-thinking";
  if (intelligence >= 70) return "gemini-3-pro";
  if (cost <= 40) return "gemini-3-flash";
  return defaultModelId;
}

function rebalanceModelTradeoffs(current: { intelligence: number; security: number; cost: number }, metric: ModelMetric, value: number) {
  const next = { ...current, [metric]: value };
  const total = next.intelligence + next.security + next.cost;
  if (total <= 220) return next;
  const overflow = total - 220;
  const others = (["intelligence", "security", "cost"] as ModelMetric[]).filter((item) => item !== metric);
  const first = others[0];
  const second = others[1];
  const firstDrop = Math.min(next[first], Math.ceil(overflow / 2));
  next[first] = Math.max(0, next[first] - firstDrop);
  next[second] = Math.max(0, next[second] - (overflow - firstDrop));
  return next;
}

function priorityLabel(value: number) {
  if (value >= 70) return "alta";
  if (value >= 40) return "media";
  return "baja";
}

function budgetLabel(value: number) {
  if (value >= 70) return "alto";
  if (value >= 40) return "medio";
  return "bajo";
}

function GuidedInputOptions({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <GuidedInputCard>
      <div className="grid gap-2">
        {options.map((option) => <GuidedOption key={option} selected={value === option} onClick={() => onChange(option)}>{option}</GuidedOption>)}
      </div>
    </GuidedInputCard>
  );
}

function GuidedInputCard({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[190px] rounded-3xl bg-[var(--surface-2)] p-3">{children}</div>;
}

function GuidedOption({ children, selected, onClick }: { children: React.ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={typeof children === "string" ? children : "Seleccionar opción"} className={`grid min-h-11 grid-cols-[20px_1fr] items-center gap-3 rounded-2xl border px-3 py-2 text-left text-[13px] transition-colors ${selected ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"}`}>
      <span className={`grid h-5 w-5 place-items-center rounded-full border ${selected ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--border-strong)]"}`} aria-hidden>
        {selected && <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none"><path d="M2.5 6.2L5 8.7L9.5 3.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" /></svg>}
      </span>
      <span className="leading-snug">{children}</span>
    </button>
  );
}

function ProcessAnswer({ index, label, value, muted }: { index: number; label: string; value: string; muted: boolean }) {
  return (
    <div className={`grid min-h-[44px] grid-cols-[24px_1fr] gap-2 rounded-2xl border px-3 py-2 ${muted ? "border-[var(--border)] bg-[var(--surface-2)]" : "border-[var(--accent)] bg-[var(--accent-soft)]"}`}>
      <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold ${muted ? "bg-[var(--surface)] text-[var(--text-tertiary)]" : "bg-[var(--accent)] text-white"}`}>{index}</span>
      <span className="min-w-0">
        <span className="block text-[11px] uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{label}</span>
        <span className={`mt-1 block truncate text-[14px] ${muted ? "text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"}`}>{value || "\u00A0"}</span>
      </span>
    </div>
  );
}

function Panel({
  label,
  children,
  bare = false,
  hideLabel = false,
}: {
  label: string;
  children: React.ReactNode;
  bare?: boolean;
  hideLabel?: boolean;
}) {
  if (bare) return <div data-exercise-block={label}>{children}</div>;
  return (
    <div data-exercise-block={label}>
      {!hideLabel ? (
        <div className="mb-2 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{label}</div>
      ) : null}
      {children}
    </div>
  );
}

function StepDots({ steps, active, setActive }: { steps: number; active: number; setActive: (index: number) => void }) {
  return (
    <div className="flex gap-1.5" aria-label="Progreso de inputs">
      {Array.from({ length: steps }).map((_, index) => (
        <button key={index} type="button" onClick={() => setActive(index)} aria-label={`Ir a paso ${index + 1}`} className={`h-2 rounded-full transition-all ${index === active ? "w-8 bg-[var(--accent)]" : "w-2 bg-[var(--surface-3)]"}`} />
      ))}
    </div>
  );
}

function AgentBriefLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="text-[12px] text-[var(--text-tertiary)]">{label}</div>
      <div className={`mt-1 min-h-5 text-[14px] leading-snug ${value ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}>{value || "\u00A0"}</div>
    </div>
  );
}

function CompareCard({ selected, onClick, title, body }: { selected: boolean; onClick: () => void; title: string; body: string }) {
  return (
    <button type="button" onClick={onClick} className={`min-h-52 rounded-2xl border p-5 text-left transition-colors ${selected ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"}`}>
      <span className="block text-[15px] font-medium text-[var(--text-primary)]">{title}</span>
      <span className="mt-4 block text-[15px] leading-6 text-[var(--text-secondary)]">{body}</span>
    </button>
  );
}

function Range10({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid grid-cols-[88px_1fr_36px] items-center gap-3 text-[13px]">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <input type="range" min={0} max={100} step={10} value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--surface-3)] accent-[var(--accent)]" />
      <span className="mono text-[var(--text-primary)]">{value}</span>
    </label>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[14px] font-medium text-[var(--text-primary)]">{children}</div>;
}

function ChoiceButton({ children, selected, onClick }: { children: React.ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`min-h-10 rounded-xl border px-3 text-[13px] font-medium transition-colors ${selected ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
      {children}
    </button>
  );
}

function RecordingBanner({ recState, recError }: { recState: VoiceRecState; recError: string | null }) {
  return (
    <AnimatePresence>
      {(recState === "recording" || recState === "processing" || recState === "error") && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }} className="flex items-center gap-2.5 px-5 pb-2 text-[13px]">
          {recState === "recording" && <><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-50" /><span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" /></span><span className="font-medium text-[var(--text-secondary)]">Escuchando...</span><WaveBars /></>}
          {recState === "processing" && <><svg className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" /><path d="M14 8C14 4.69 11.31 2 8 2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg><span className="font-medium text-[var(--text-secondary)]">Procesando nota...</span></>}
          {recState === "error" && recError && <span className="text-[var(--band-b-text)]">{recError}</span>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AttachmentTray({ attachments, onRemove }: { attachments: PromptAttachment[]; onRemove: (id: string) => void }) {
  return (
    <div className="mx-3 mb-3 grid gap-2 rounded-2xl bg-[var(--surface-2)] p-3">
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Adjuntos para analizar</div>
      {attachments.map((attachment) => (
        <div key={attachment.id} className="grid min-h-10 grid-cols-[28px_1fr_28px] items-center gap-2 rounded-xl border border-[var(--hairline)] bg-[var(--surface)] px-2.5 py-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]"><AttachmentGlyph type={attachment.type} /></span>
          <span className="min-w-0"><span className="block truncate text-[12px] font-medium text-[var(--text-primary)]">{attachment.name}</span><span className="block text-[11px] text-[var(--text-tertiary)]">Simulado · {formatFileSize(attachment.size)}</span></span>
          <button type="button" onClick={() => onRemove(attachment.id)} aria-label={`Quitar ${attachment.name}`} className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"><XGlyph /></button>
        </div>
      ))}
    </div>
  );
}

function BrandMark({ brand }: { brand: BrandKey }) {
  const logo = brandLogo[brand];
  if (!logo) {
    return <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md bg-[var(--text-primary)] text-[var(--surface)]" aria-hidden><ShieldGlyph /></span>;
  }
  return (
    <span className="grid h-[22px] w-[22px] shrink-0 place-items-center" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo.light} alt="" width={22} height={22} className={logo.dark ? "block dark:hidden" : "block"} style={{ width: 22, height: 22, objectFit: "contain" }} />
      {logo.dark && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo.dark} alt="" width={22} height={22} className="hidden dark:block" style={{ width: 22, height: 22, objectFit: "contain" }} />
      )}
    </span>
  );
}

function LevelMeter({ value, ariaLabel }: { value: Level5; ariaLabel: string }) {
  return (
    <span className="inline-flex items-end gap-[2px]" aria-label={`${ariaLabel} ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((level) => (
        <span key={level} className="block w-[2.5px] rounded-[var(--radius-xs)] transition-colors" style={{ height: `${3 + level * 1.6}px`, backgroundColor: level <= value ? "currentColor" : "var(--border-strong)", opacity: level <= value ? 1 : 0.5 }} />
      ))}
    </span>
  );
}

function MicButton({ recState, disabled, onClick }: { recState: VoiceRecState; disabled: boolean; onClick: () => void }) {
  const isRecording = recState === "recording";
  const isProcessing = recState === "processing";
  return (
    <button type="button" onClick={onClick} disabled={disabled || isProcessing} aria-label={isRecording ? "Detener grabación" : "Dictar por voz"} aria-pressed={isRecording} className={`relative grid h-9 w-9 place-items-center rounded-full transition-colors disabled:opacity-40 ${isRecording ? "bg-red-500/15 text-red-500" : "text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"}`}>
      {isRecording && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-red-500/30" />}
      {isProcessing ? <svg className="h-4 w-4 animate-spin" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" /><path d="M14 8C14 4.69 11.31 2 8 2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" /></svg> : isRecording ? <span className="relative h-2.5 w-2.5 rounded-[var(--radius-xs)] bg-current" /> : <MicGlyph />}
    </button>
  );
}

function ChevronDown() {
  return <svg className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" viewBox="0 0 12 12" fill="none" aria-hidden><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>;
}
function ChevronIcon({ open }: { open: boolean }) {
  return <svg className={`h-3 w-3 shrink-0 opacity-60 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>;
}
function MicGlyph() {
  return <svg className="relative h-4 w-4" viewBox="0 0 16 16" fill="none"><rect x="5.5" y="2" width="5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.4" /><path d="M3 8C3 10.7614 5.23858 13 8 13M8 13C10.7614 13 13 10.7614 13 8M8 13V14.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4" /></svg>;
}
function PlusGlyph() {
  return <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M8 3.5V12.5M3.5 8H12.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg>;
}
function XGlyph() {
  return <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none"><path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" /></svg>;
}
function AttachmentGlyph({ type }: { type: string }) {
  const isImage = type.startsWith("image/");
  if (isImage) return <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden><rect x="2.5" y="3" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M4.5 10.8L6.6 8.6L8.2 10.1L9.7 8.4L11.8 10.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" /><circle cx="10.8" cy="5.8" r="1" fill="currentColor" /></svg>;
  return <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M5 2.5H9.2L12 5.3V12.5C12 13.05 11.55 13.5 11 13.5H5C4.45 13.5 4 13.05 4 12.5V3.5C4 2.95 4.45 2.5 5 2.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" /><path d="M9.2 2.7V5.3H11.8" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" /></svg>;
}
function ShieldGlyph() {
  return <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5"><path d="M8 2L13 4v4.5C13 11 11 13 8 14C5 13 3 11 3 8.5V4L8 2Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" /></svg>;
}
function SparkGlyph() {
  return <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="currentColor" aria-hidden><path d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4L5 0Z" /></svg>;
}
function WaveBars() {
  return (
    <span className="inline-flex h-3 items-end gap-[2px]" aria-hidden>
      {[0, 1, 2, 3, 4].map((index) => <span key={index} className="block w-[2px] rounded-[var(--radius-xs)] bg-[var(--band-b-bar)]" style={{ height: "100%", animation: `simulador-wave 0.9s ease-in-out ${index * 0.12}s infinite`, transformOrigin: "bottom" }} />)}
      <style>{`@keyframes simulador-wave { 0%, 100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }`}</style>
    </span>
  );
}
function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${kilobytes.toFixed(kilobytes >= 100 ? 0 : 1)} KB`;
  const megabytes = kilobytes / 1024;
  return `${megabytes.toFixed(megabytes >= 10 ? 1 : 2)} MB`;
}
