"use client";

import { useState } from "react";
import { RuntimeNav } from "@/components/simulador/RuntimeNav";
import {
  ExerciseBlockRenderer,
  type ExerciseBlockId,
  type ExerciseBlockProps,
} from "@/components/simulador/exercises/ExerciseBlockRenderer";

type ExerciseLabItem = {
  id: string;
  blockId: ExerciseBlockId;
  eyebrow: string;
  title: string;
  description: string;
  signals: string[];
  props?: ExerciseBlockProps;
};

const exerciseList: ExerciseLabItem[] = [
  {
    id: "textfield-ia-libre",
    blockId: "ai_textfield_free",
    eyebrow: "01A · Textfield de IA",
    title: "Textfield de IA (A): libre.",
    description:
      "El participante recibe un campo de IA sin ayudas adicionales. Mide cómo estructura una petición cuando opera con criterio propio.",
    signals: ["contexto", "ejecución IA", "impacto"],
    props: {
      promptPlaceholder:
        "Escribe el prompt que le mandarías al modelo. Puedes adjuntar archivos, dictar una nota y elegir modelo.",
    },
  },
  {
    id: "textfield-ia-guiado",
    blockId: "ai_textfield_guided",
    eyebrow: "01B · Prompt guiado",
    title: "Textfield de IA (B): guiado.",
    description:
      "El participante toma decisiones acotadas por el caso y luego genera un prompt. Mide criterio granular sin abrir el caso a configuración libre.",
    signals: ["contexto", "datos", "ejecución IA", "juicio"],
  },
  {
    id: "tabla-datos",
    blockId: "data_table_triage",
    eyebrow: "02 · Tabla editable",
    title: "Decidir qué datos entran.",
    description:
      "El participante clasifica campos reales antes de usarlos. Mide minimización, privacidad y calidad de datos sin pedir teoría.",
    signals: ["datos", "juicio"],
  },
  {
    id: "matriz-permisos",
    blockId: "permission_matrix",
    eyebrow: "03 · Matriz de permisos",
    title: "Poner límites a una automatización.",
    description:
      "El participante define qué puede hacer el sistema solo, qué requiere revisión y qué debe bloquearse. Útil para workflows y agentes.",
    signals: ["datos", "juicio", "ejecución IA"],
  },
  {
    id: "revision-output",
    blockId: "ai_output_review",
    eyebrow: "04 · Revisión de output",
    title: "Marcar errores antes de usar.",
    description:
      "El participante revisa una salida de IA con errores realistas. Mide validación, lectura de riesgo y capacidad de corregir sin aceptar todo.",
    signals: ["validación", "juicio"],
  },
  {
    id: "comparacion-ia",
    blockId: "ai_comparison",
    eyebrow: "05 · Comparación de respuestas",
    title: "Elegir el mejor output.",
    description:
      "El participante compara dos respuestas de IA y justifica cuál usaría. Sirve para medir criterio de calidad, no sólo preferencia estética.",
    signals: ["validación", "impacto"],
  },
  {
    id: "workflow-builder",
    blockId: "workflow_builder",
    eyebrow: "06 · Workflow builder",
    title: "Armar un flujo con control humano.",
    description:
      "El participante configura pasos de trabajo con IA, revisión y entrega. Mide si entiende handoffs, checkpoints y responsabilidad.",
    signals: ["ejecución IA", "validación", "impacto"],
  },
  {
    id: "agent-brief",
    blockId: "agent_brief_builder",
    eyebrow: "07 · Brief para agente",
    title: "Delegar una tarea sin perder control.",
    description:
      "El participante convierte una tarea de cualquier área en un encargo operable: qué debe lograr, qué puede usar, qué puede hacer y cuándo debe detenerse.",
    signals: ["ejecución IA", "juicio", "datos"],
  },
  {
    id: "logs",
    blockId: "run_log_review",
    eyebrow: "08 · Revisión de logs",
    title: "Detectar fallas en una corrida.",
    description:
      "El participante lee eventos de una automatización y marca dónde se rompió el control. Mide supervisión, no memoria.",
    signals: ["validación", "juicio"],
  },
  {
    id: "dashboard-pivot",
    blockId: "dashboard_pivot",
    eyebrow: "09 · Dashboard / pivot",
    title: "Leer señales de negocio.",
    description:
      "El participante filtra una tabla y elige qué señal llevar al manager. Mide si conecta IA con impacto operativo.",
    signals: ["impacto", "contexto"],
  },
  {
    id: "decision-memo",
    blockId: "tradeoff_decision_memo",
    eyebrow: "11 · Decisión + memo",
    title: "Cerrar con una recomendación.",
    description:
      "El participante elige una acción con ventajas y costos, luego escribe una explicación corta. Mide responsabilidad ejecutiva.",
    signals: ["juicio", "impacto", "contexto"],
  },
];

export function ExerciseLabClient() {
  const [activeSection, setActiveSection] = useState(0);

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
    <div className="simulador-root dark min-h-screen surface-canvas text-[var(--text-primary)]">
      <RuntimeNav mode="field_test" logoTone="dark" />
      <ScrollLines activeIndex={activeSection} onSelect={scrollToSection} />
      <main
        className="simulador-root surface-canvas h-[calc(100vh-3.5rem)] snap-y snap-mandatory overflow-y-auto overflow-x-hidden scroll-smooth"
        onScroll={handleScroll}
      >
        {exerciseList.map((exercise, index) => (
          <ExerciseSection key={exercise.id} exercise={exercise} index={index}>
            <ExerciseBlockRenderer
              blockId={exercise.blockId}
              slideId={`exercise-lab-${exercise.id}`}
              props={exercise.props}
            />
          </ExerciseSection>
        ))}
      </main>
    </div>
  );
}

function ScrollLines({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="simulador-root fixed left-4 right-4 top-[68px] z-30 md:left-1/2 md:right-auto md:w-[min(760px,calc(100vw-320px))] md:-translate-x-1/2">
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${exerciseList.length}, minmax(0, 1fr))` }}
      >
        {exerciseList.map((exercise, index) => (
          <button
            key={exercise.id}
            type="button"
            aria-label={`Ir a ${exercise.title}`}
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
}: {
  exercise: ExerciseLabItem;
  index: number;
  children: React.ReactNode;
}) {
  const isPrompt = exercise.blockId === "ai_textfield_free" || exercise.blockId === "ai_textfield_guided";
  const isAgentBrief = exercise.blockId === "agent_brief_builder";

  if (isPrompt) {
    return (
      <section
        id={exercise.id}
        data-exercise-section={index}
        className="flex h-[calc(100vh-3.5rem)] snap-start snap-always items-center px-6 py-14"
      >
        <div className={`mx-auto w-full ${exercise.blockId === "ai_textfield_guided" ? "max-w-6xl" : "max-w-[880px]"}`}>
          <div className="eyebrow">{exercise.eyebrow}</div>
          <h2 className="display display-tight mt-4 text-[34px] text-[var(--text-primary)] sm:text-[52px]">
            {exercise.title}
          </h2>
          <p className="mt-4 max-w-2xl text-[16px] leading-[1.55] text-[var(--text-secondary)]">
            {exercise.description}
          </p>
          <div className="mt-6">{children}</div>
        </div>
      </section>
    );
  }

  if (isAgentBrief) {
    return (
      <section
        id={exercise.id}
        data-exercise-section={index}
        className="flex h-[calc(100vh-3.5rem)] snap-start snap-always items-center px-6 py-10"
      >
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] md:items-end">
            <div>
              <div className="eyebrow">{exercise.eyebrow}</div>
              <h2 className="display display-tight mt-3 text-[32px] text-[var(--text-primary)] sm:text-[40px]">
                {exercise.title}
              </h2>
            </div>
            <p className="text-[15px] leading-[1.5] text-[var(--text-secondary)]">
              {exercise.description}
            </p>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
            {children}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={exercise.id}
      data-exercise-section={index}
      className="flex h-[calc(100vh-3.5rem)] snap-start snap-always items-center px-6 py-16"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-center">
        <aside>
          <div className="eyebrow">{exercise.eyebrow}</div>
          <h2 className="display display-tight mt-5 text-[34px] text-[var(--text-primary)] sm:text-[46px]">
            {exercise.title}
          </h2>
          <p className="mt-5 text-[16px] leading-[1.65] text-[var(--text-secondary)]">
            {exercise.description}
          </p>
        </aside>
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
          {children}
        </div>
      </div>
    </section>
  );
}
