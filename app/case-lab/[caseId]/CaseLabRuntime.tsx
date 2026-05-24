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
  const current = slides[currentIndex] ?? slides[0];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === slides.length - 1;
  const isLastSlideInSection = current.slideIndex === current.section.slides.length - 1;
  const progress = ((currentIndex + 1) / slides.length) * 100;
  const selected = selectedOptions[current.slide.id] ?? "";

  function goToSection(sectionIndex: number) {
    const nextIndex = slides.findIndex((item) => item.sectionIndex === sectionIndex);
    if (nextIndex >= 0) setCurrentIndex(nextIndex);
  }

  function setOption(slideId: string, value: string) {
    setSelectedOptions((currentOptions) => ({ ...currentOptions, [slideId]: value }));
  }

  return (
    <main className="simulador-root dark min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="flex h-screen flex-col overflow-hidden">
        <header className="mx-auto flex h-16 w-full max-w-[1440px] shrink-0 items-center justify-between gap-6 px-6 md:px-10">
          <Link
            href="/case-lab"
            className="rounded-[10px] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
          >
            ← Casos
          </Link>
          <div className="h-1 w-[min(520px,42vw)] overflow-hidden rounded-full bg-[var(--surface-3)]">
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${progress}%` }} />
          </div>
          <Link
            href="/exercise-lab"
            className="rounded-[10px] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
          >
            Ejercicios
          </Link>
        </header>

        <div className="mx-auto grid min-h-0 w-full max-w-[1440px] flex-1 gap-6 px-6 pb-8 md:px-10 lg:grid-cols-[72px_minmax(0,1fr)] xl:grid-cols-[286px_minmax(0,1fr)] xl:gap-8">
          <aside className="hidden min-h-0 lg:block xl:hidden">
            <div className="flex h-full flex-col items-center rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-5">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
                {demoCase.level}
              </div>
              <nav className="mt-6 grid gap-3">
                {demoCase.sections.map((section, index) => (
                  <button
                    key={section.name}
                    type="button"
                    onClick={() => goToSection(index)}
                    aria-label={section.name}
                    title={section.name}
                    className={[
                      "grid h-9 w-9 place-items-center rounded-full text-xs font-semibold transition",
                      current.sectionIndex === index
                        ? "bg-[var(--accent)] text-white"
                        : "border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]",
                    ].join(" ")}
                  >
                    {index + 1}
                  </button>
                ))}
              </nav>
              <p className="mt-auto [writing-mode:vertical-rl] rotate-180 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                {current.section.name}
              </p>
            </div>
          </aside>

          <aside className="hidden min-h-0 xl:block">
            <div className="flex h-full flex-col rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                    {demoCase.level}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">{demoCase.profile}</span>
                </div>
                <h1 className="text-lg font-semibold leading-6">{demoCase.title}</h1>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
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
                      "flex items-center gap-3 rounded-[14px] px-3 py-3 text-left transition",
                      current.sectionIndex === index
                        ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                        current.sectionIndex === index
                          ? "bg-[var(--accent)] text-white"
                          : "border border-[var(--border)] text-[var(--text-secondary)]",
                      ].join(" ")}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{section.name}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-auto rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-xs text-[var(--text-tertiary)]">Brief para manager</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {demoCase.managerBrief}
                </p>
              </div>
            </div>
          </aside>

          <section className="min-h-0 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface-2)]">
            <AnimatePresence mode="wait">
              <motion.article
                key={current.slide.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="grid h-full grid-rows-[minmax(0,1fr)_auto]"
              >
                <div className="grid min-h-0 gap-6 overflow-hidden p-6 md:p-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(340px,0.78fr)] lg:items-center">
                  <div className="mx-auto w-full max-w-[720px] xl:mx-0">
                    <div className="flex items-center justify-between gap-4">
                      <p className="eyebrow text-[var(--text-tertiary)]">
                        {current.section.name} · {current.slide.eyebrow}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {current.slideIndex + 1} / {current.section.slides.length}
                      </p>
                    </div>
                    <h2 className="display mt-8 text-[34px] leading-[1.04] md:text-[46px] xl:text-[52px]">
                      {current.slide.title}
                    </h2>
                    <p className="mt-5 max-w-[680px] text-[17px] leading-8 text-[var(--text-secondary)] md:text-[19px]">
                      {current.slide.body}
                    </p>
                  </div>

                  <div className="mx-auto w-full max-w-[560px]">
                    <ExercisePanel
                      slide={current.slide}
                      selected={selected}
                      setSelected={(value) => setOption(current.slide.id, value)}
                    />
                  </div>
                </div>

                <footer className="flex shrink-0 items-center justify-between border-t border-[var(--hairline)] px-6 py-4 md:px-8">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                    disabled={isFirst}
                    className="rounded-[12px] px-5 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((index) => Math.min(slides.length - 1, index + 1))}
                    disabled={isLast}
                    className="rounded-[12px] bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--text-disabled)]"
                  >
                    {isLast
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
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-[17px] leading-8 text-[var(--text-secondary)]">
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
            <div key={row.label} className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="font-medium">{row.label}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{row.detail}</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {(["Usar", "Anonimizar", "Excluir"] as DataChoice[]).map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setSelected(`${row.label}:${choice}`)}
                    className={[
                      "min-h-11 rounded-[12px] px-2 text-xs font-medium transition",
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
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="min-h-[190px] rounded-[18px] bg-[var(--surface-3)] p-5 text-[16px] leading-8 text-[var(--text-secondary)]">
            {slide.prompt}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-[var(--text-tertiary)]">
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
                "min-h-[74px] rounded-[18px] border p-4 text-left transition",
                selected === label
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-3)]",
              ].join(" ")}
            >
              <p className="text-sm text-[var(--text-tertiary)]">{label}</p>
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
                "min-h-[74px] rounded-[18px] border p-4 text-left transition",
                selected === label
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-3)]",
              ].join(" ")}
            >
              <p className="text-sm text-[var(--text-tertiary)]">{label}</p>
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
            <div key={option} className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="font-medium">{option}</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {["Permitir", "Revisar", "Bloquear"].map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setSelected(`${option}:${choice}`)}
                    className={[
                      "min-h-11 rounded-[12px] px-2 text-xs font-medium transition",
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
                "min-h-[68px] rounded-[18px] border p-4 text-left text-[15px] leading-6 transition",
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
          className="min-h-[280px] w-full resize-none rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 text-[16px] leading-8 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
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
