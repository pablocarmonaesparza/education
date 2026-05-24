"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DemoCase, DemoCaseSection, DemoSlide } from "@/lib/simulador/case-lab-cases";

type DataChoice = "Usar" | "Anonimizar" | "Excluir";

type FlatSlide = {
  section: DemoCaseSection;
  sectionIndex: number;
  slide: DemoSlide;
  slideIndex: number;
};

const sectionNextLabel: Record<DemoCaseSection["name"], string> = {
  Contexto: "Ir a Datos",
  Datos: "Ir a IA",
  IA: "Ir a Revisión",
  Revisión: "Ir a Decisión",
  Decisión: "Ir a Respuesta",
  Respuesta: "Terminar",
};

export function CaseLabRuntime({ demoCase }: { demoCase: DemoCase }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const slides = useMemo<FlatSlide[]>(
    () =>
      demoCase.sections.flatMap((section, sectionIndex) =>
        section.slides.map((slide, slideIndex) => ({
          section,
          sectionIndex,
          slide,
          slideIndex,
        })),
      ),
    [demoCase.sections],
  );
  const isIntro = currentIndex === 0;
  const current = slides[Math.max(0, currentIndex - 1)] ?? slides[0];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === slides.length;
  const isLastSlideInSection = !isIntro && current.slideIndex === current.section.slides.length - 1;
  const progress = isIntro ? 0 : ((current.slideIndex + 1) / current.section.slides.length) * 100;
  const selected = isIntro ? "" : selectedOptions[current.slide.id] ?? "";

  function goToSection(sectionIndex: number) {
    const nextIndex = slides.findIndex((item) => item.sectionIndex === sectionIndex);
    if (nextIndex >= 0) setCurrentIndex(nextIndex + 1);
  }

  function setOption(slideId: string, value: string) {
    setSelectedOptions((currentOptions) => ({ ...currentOptions, [slideId]: value }));
  }

  return (
    <main className="simulador-root min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="flex h-screen flex-col overflow-hidden">
        <header className="mx-auto flex h-16 w-full max-w-[1440px] shrink-0 items-center justify-between gap-6 px-6 md:px-10">
          <Link
            href="/case-lab"
            className="rounded-[var(--radius-sm)] px-3 py-2 ts-callout font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
          >
            ← Casos
          </Link>
          <div
            role="progressbar"
            aria-label={isIntro ? "Progreso de sección 0%" : `Progreso de ${current.section.name} ${Math.round(progress)}%`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            className="h-1 w-[min(520px,42vw)] overflow-hidden rounded-full bg-[var(--surface-3)]"
          >
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${progress}%` }} />
          </div>
          <Link
            href="/exercise-lab"
            className="rounded-[var(--radius-sm)] px-3 py-2 ts-callout font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
          >
            Ejercicios
          </Link>
        </header>

        <div className="mx-auto grid min-h-0 w-full max-w-[1440px] flex-1 gap-6 px-6 pb-8 md:px-10 lg:grid-cols-[172px_minmax(0,1fr)] xl:grid-cols-[286px_minmax(0,1fr)] xl:gap-8">
          <aside className="hidden min-h-0 lg:block xl:hidden">
            <div className="flex h-full flex-col rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 ts-caption-1 font-medium text-[var(--accent)]">
                    {demoCase.level}
                  </span>
                </div>
                <p className="line-clamp-2 ts-callout font-semibold leading-5">{demoCase.title}</p>
              </div>
              <nav className="mt-5 grid gap-2">
                {demoCase.sections.map((section, index) => (
                  <button
                    key={section.name}
                    type="button"
                    onClick={() => goToSection(index)}
                    aria-label={section.name}
                    title={section.name}
                    className={[
                      "flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-2 text-left transition",
                      !isIntro && current.sectionIndex === index
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full ts-caption-1 font-semibold",
                        !isIntro && current.sectionIndex === index
                          ? "bg-white/18 text-white"
                          : "border border-[var(--border)] text-[var(--text-secondary)]",
                      ].join(" ")}
                    >
                      {index + 1}
                    </span>
                    <span className="ts-caption-1 font-medium">{section.name}</span>
                  </button>
                ))}
              </nav>
              <p className="mt-auto ts-caption-1 leading-5 text-[var(--text-tertiary)]">
                {isIntro ? "Inicio del caso" : `${current.section.name} · ${current.slideIndex + 1}/5`}
              </p>
            </div>
          </aside>

          <aside className="hidden min-h-0 xl:block">
            <div className="flex h-full flex-col rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 ts-caption-1 font-medium text-[var(--accent)]">
                    {demoCase.level}
                  </span>
                  <span className="ts-caption-1 text-[var(--text-secondary)]">{demoCase.profile}</span>
                </div>
                <h1 className="ts-body-lg font-semibold leading-6">{demoCase.title}</h1>
                <p className="mt-3 ts-callout leading-6 text-[var(--text-secondary)]">
                  {demoCase.company} · {demoCase.minutes} min
                </p>
              </div>

              <nav className="mt-6 grid gap-2">
                {demoCase.sections.map((section, index) => (
                  <button
                    key={section.name}
                    type="button"
                    onClick={() => goToSection(index)}
                    className={[
                      "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-left transition",
                      !isIntro && current.sectionIndex === index
                        ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full ts-caption-1 font-semibold",
                        !isIntro && current.sectionIndex === index
                          ? "bg-[var(--accent)] text-white"
                          : "border border-[var(--border)] text-[var(--text-secondary)]",
                      ].join(" ")}
                    >
                      {index + 1}
                    </span>
                    <span className="ts-callout font-medium">{section.name}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="ts-caption-1 text-[var(--text-tertiary)]">Brief para manager</p>
                <p className="mt-2 ts-callout leading-6 text-[var(--text-secondary)]">
                  {demoCase.managerBrief}
                </p>
              </div>
            </div>
          </aside>

          <section className="min-h-0 overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-2)]">
            <AnimatePresence mode="wait">
              <motion.article
                key={isIntro ? "case-intro" : current.slide.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="grid h-full grid-rows-[minmax(0,1fr)_auto]"
              >
                {isIntro ? (
                  <IntroPanel
                    demoCase={demoCase}
                    timerEnabled={timerEnabled}
                    setTimerEnabled={setTimerEnabled}
                  />
                ) : (
                  <div
                    className={[
                      "grid min-h-0 gap-6 overflow-hidden p-6 md:p-8",
                      current.slide.type === "reading"
                        ? "place-items-center"
                        : "lg:grid-cols-[minmax(0,0.85fr)_minmax(320px,0.78fr)] lg:items-center",
                    ].join(" ")}
                  >
                    <div className="mx-auto w-full max-w-[720px] xl:mx-0">
                      <div className="flex items-center justify-between gap-4">
                        <p className="eyebrow text-[var(--text-tertiary)]">
                          {current.section.name} · {current.slide.eyebrow}
                        </p>
                        <p className="ts-callout text-[var(--text-secondary)]">
                          {current.slideIndex + 1} / {current.section.slides.length}
                        </p>
                      </div>
                      <h2 className="display mt-8 ts-display leading-[1.04] md:ts-display-xl xl:ts-display-xl">
                        {current.slide.title}
                      </h2>
                      <p className="mt-5 max-w-[680px] ts-headline leading-8 text-[var(--text-secondary)] md:ts-body-lg">
                        {current.slide.body}
                      </p>
                    </div>

                    {current.slide.type !== "reading" ? (
                      <div className="mx-auto w-full max-w-[560px]">
                        <ExercisePanel
                          slide={current.slide}
                          selected={selected}
                          setSelected={(value) => setOption(current.slide.id, value)}
                        />
                      </div>
                    ) : null}
                  </div>
                )}

                <footer className="flex shrink-0 items-center justify-between border-t border-[var(--hairline)] px-6 py-4 md:px-8">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                    disabled={isFirst}
                    className="rounded-[var(--radius-md)] px-5 py-3 ts-callout font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((index) => Math.min(slides.length, index + 1))}
                    disabled={isLast}
                    className="rounded-[var(--radius-md)] bg-[var(--accent)] px-6 py-3 ts-callout font-medium text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--text-disabled)]"
                  >
                    {isIntro
                      ? "Comenzar"
                      : isLast
                      ? "Listo"
                      : isLastSlideInSection
                        ? sectionNextLabel[current.section.name]
                        : "Continuar"}
                  </button>
                </footer>
              </motion.article>
            </AnimatePresence>
          </section>
        </div>
      </div>
    </main>
  );
}

function IntroPanel({
  demoCase,
  timerEnabled,
  setTimerEnabled,
}: {
  demoCase: DemoCase;
  timerEnabled: boolean;
  setTimerEnabled: (value: boolean) => void;
}) {
  return (
    <div className="grid min-h-0 place-items-center overflow-hidden p-6 md:p-8">
      <div className="mx-auto grid w-full max-w-[860px] gap-8">
        <div>
          <p className="eyebrow text-[var(--text-tertiary)]">Inicio del caso</p>
          <h2 className="display mt-8 ts-display leading-[1.04] md:ts-display-2xl">
            {demoCase.title}
          </h2>
          <p className="mt-5 max-w-[740px] ts-body-lg leading-8 text-[var(--text-secondary)] md:ts-title-3">
            {demoCase.summary} Trabajarás con datos agregados, selección de modelo, prompt guiado,
            revisión de salida y una recomendación final para manager.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="ts-callout font-medium text-[var(--text-tertiary)]">Herramientas del caso</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["Datos", "Textfield IA", "Revisión"].map((tool) => (
                <div key={tool} className="rounded-[var(--radius-lg)] bg-[var(--surface-3)] px-4 py-3 ts-callout font-medium">
                  {tool}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="ts-callout font-medium text-[var(--text-tertiary)]">Timer</p>
            <p className="mt-2 ts-callout leading-6 text-[var(--text-secondary)]">
              Tiempo sugerido: {demoCase.minutes} min.
            </p>
            <button
              type="button"
              onClick={() => setTimerEnabled(!timerEnabled)}
              className={[
                "mt-5 w-full rounded-[var(--radius-md)] px-4 py-3 ts-callout font-medium transition",
                timerEnabled
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface-3)] text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]",
              ].join(" ")}
            >
              {timerEnabled ? "Timer activado" : "Activar timer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExercisePanel({
  slide,
  selected,
  setSelected,
}: {
  slide: DemoSlide;
  selected: string;
  setSelected: (value: string) => void;
}) {
  if (slide.type === "reading") {
    return (
      <PanelShell title="Brief">
        <div className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="ts-headline leading-8 text-[var(--text-secondary)]">
            Lee esto como el brief que acaba de llegar a tu mesa. La acción viene en la siguiente pantalla.
          </p>
        </div>
      </PanelShell>
    );
  }

  if (slide.type === "data_table" && slide.rows) {
    return (
      <PanelShell title="Tabla de datos">
        <div className="grid gap-3">
          {slide.rows.map((row) => (
            <div key={row.label} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="font-medium">{row.label}</p>
              <p className="mt-1 ts-callout leading-6 text-[var(--text-secondary)]">{row.detail}</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {(["Usar", "Anonimizar", "Excluir"] as DataChoice[]).map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setSelected(`${row.label}:${choice}`)}
                    className={[
                      "min-h-11 rounded-[var(--radius-md)] px-2 ts-caption-1 font-medium transition",
                      selected === `${row.label}:${choice}`
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--surface-3)] text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]",
                    ].join(" ")}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PanelShell>
    );
  }

  if (slide.type === "ai_textfield") {
    return (
      <PanelShell title="Textfield de IA">
        <div className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="min-h-[190px] rounded-[var(--radius-lg)] bg-[var(--surface-3)] p-5 ts-headline leading-8 text-[var(--text-secondary)]">
            {slide.prompt}
          </div>
          <div className="mt-4 flex items-center justify-between ts-callout text-[var(--text-tertiary)]">
            <span>+ archivo</span>
            <span>GPT Corporativo · IT · voz</span>
          </div>
        </div>
      </PanelShell>
    );
  }

  if (slide.type === "guided_prompt") {
    return (
      <PanelShell title="Prompt guiado">
        <div className="grid gap-3">
          {["Objetivo", "Audiencia", "Límites", "Modelo"].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setSelected(label)}
              className={[
                "min-h-[74px] rounded-[var(--radius-lg)] border p-4 text-left transition",
                selected === label
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-3)]",
              ].join(" ")}
            >
              <p className="ts-callout text-[var(--text-tertiary)]">{label}</p>
              <p className="mt-1 font-medium">
                {selected === label ? "Seleccionado" : "Elegir opción"}
              </p>
            </button>
          ))}
        </div>
      </PanelShell>
    );
  }

  if (slide.type === "agent_brief") {
    return (
      <PanelShell title="Brief para agente">
        <div className="grid gap-3">
          {["Tarea", "Acceso permitido", "Puede hacer", "Debe detenerse si"].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setSelected(label)}
              className={[
                "min-h-[74px] rounded-[var(--radius-lg)] border p-4 text-left transition",
                selected === label
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-3)]",
              ].join(" ")}
            >
              <p className="ts-callout text-[var(--text-tertiary)]">{label}</p>
              <p className="mt-1 font-medium">
                {selected === label ? "Definido" : "Pendiente"}
              </p>
            </button>
          ))}
        </div>
      </PanelShell>
    );
  }

  if (slide.type === "permission_matrix" && slide.options) {
    return (
      <PanelShell title="Matriz de permisos">
        <div className="grid gap-3">
          {slide.options.map((option) => (
            <div key={option} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="font-medium">{option}</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {["Permitir", "Revisar", "Bloquear"].map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setSelected(`${option}:${choice}`)}
                    className={[
                      "min-h-11 rounded-[var(--radius-md)] px-2 ts-caption-1 font-medium transition",
                      selected === `${option}:${choice}`
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--surface-3)] text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]",
                    ].join(" ")}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PanelShell>
    );
  }

  if ((slide.type === "output_review" || slide.type === "log_review" || slide.type === "decision") && slide.options) {
    return (
      <PanelShell title={slide.type === "decision" ? "Decisión" : "Revisión"}>
        <div className="grid gap-3">
          {slide.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSelected(option)}
              className={[
                "min-h-[68px] rounded-[var(--radius-lg)] border p-4 text-left ts-body leading-6 transition",
                selected === option
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]",
              ].join(" ")}
            >
              {option}
            </button>
          ))}
        </div>
      </PanelShell>
    );
  }

  if (slide.type === "memo") {
    return (
      <PanelShell title="Memo">
        <textarea
          className="min-h-[280px] w-full resize-none rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-5 ts-headline leading-8 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
          placeholder="Escribe qué harías, por qué y qué debe revisar tu líder..."
        />
      </PanelShell>
    );
  }

  return (
    <PanelShell title="Ejercicio">
      <p className="text-[var(--text-secondary)]">Ejercicio aplicado al caso.</p>
    </PanelShell>
  );
}

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-5 text-[var(--text-tertiary)]">{title}</p>
      {children}
    </div>
  );
}
