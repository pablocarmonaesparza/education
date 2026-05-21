"use client";

import { useMemo, useState } from "react";
import { RuntimeNav } from "@/components/simulador/RuntimeNav";

type DataAction = "usar" | "anonimizar" | "agregar" | "excluir";
type Permission = "permitir" | "revisar" | "bloquear";

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

export function ExerciseLabClient() {
  const [prompt, setPrompt] = useState(
    "Crea tres ángulos para reactivar cuentas grandes que bajaron su uso del producto. Usa sólo empresa, segmento y resumen agregado de tickets. No uses nombres ni correos. Marca cualquier afirmación que necesite fuente.",
  );
  const [security, setSecurity] = useState(80);
  const [quality, setQuality] = useState(70);
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
    () =>
      `${prompt}\n\nPrioridades: seguridad ${security}/100 · calidad ${quality}/100 · revisión humana obligatoria.`,
    [prompt, quality, security],
  );

  return (
    <>
      <RuntimeNav mode="field_test" />
      <main className="simulador-root surface-canvas snap-y snap-mandatory overflow-x-hidden">
        <IntroSection />
        {exerciseList.map((exercise, index) => (
          <ExerciseSection key={exercise.id} exercise={exercise} index={index}>
            {exercise.id === "textfield-ia" && (
              <PromptExercise
                prompt={prompt}
                setPrompt={setPrompt}
                promptPreview={promptPreview}
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

function IntroSection() {
  return (
    <section className="min-h-[calc(100vh-3.5rem)] snap-start px-6 py-20 grid place-items-center">
      <div className="max-w-3xl">
        <div className="eyebrow">exercise lab · catálogo de bloques</div>
        <h1 className="display display-tight mt-6 text-[40px] sm:text-[56px] text-[var(--text-primary)]">
          Diez ejercicios para construir casos.
        </h1>
        <p className="mt-6 text-[18px] leading-[1.65] text-[var(--text-secondary)]">
          Esta página no presenta un caso completo. Presenta los tipos de interacción
          que podremos combinar al crear casos: IA primero, ejercicios tradicionales
          como soporte y evidencia clara para el manager.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Fact label="regla" value="una tarea principal por pantalla" />
          <Fact label="sesgo" value="60-70% nativos de IA" />
          <Fact label="salida" value="evidencia evaluable" />
        </div>
      </div>
    </section>
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
      className="min-h-[calc(100vh-3.5rem)] snap-start px-6 py-16 flex items-center"
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
  security,
  setSecurity,
  quality,
  setQuality,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  promptPreview: string;
  security: number;
  setSecurity: (value: number) => void;
  quality: number;
  setQuality: (value: number) => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div>
        <Label>Petición al modelo</Label>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={8}
          className="mt-2 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4 text-[15px] leading-6 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
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
        <Label>Controles</Label>
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
