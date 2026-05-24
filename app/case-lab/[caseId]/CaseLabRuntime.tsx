"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DemoCase, DemoSlide } from "@/lib/simulador/case-lab-cases";

type DataChoice = "Usar" | "Anonimizar" | "Excluir";

export function CaseLabRuntime({ demoCase }: { demoCase: DemoCase }) {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const activeSection = demoCase.sections[sectionIndex];
  const activeSlide = activeSection.slides[slideIndex];
  const totalSlides = activeSection.slides.length;
  const canGoBack = sectionIndex > 0 || slideIndex > 0;
  const canGoNext =
    sectionIndex < demoCase.sections.length - 1 || slideIndex < activeSection.slides.length - 1;

  const progress = useMemo(
    () => ((sectionIndex + slideIndex / Math.max(1, totalSlides)) / demoCase.sections.length) * 100,
    [sectionIndex, slideIndex, totalSlides, demoCase.sections.length],
  );

  function goToSection(nextSection: number) {
    setSectionIndex(nextSection);
    setSlideIndex(0);
  }

  function goBack() {
    if (slideIndex > 0) {
      setSlideIndex((current) => current - 1);
      return;
    }
    if (sectionIndex > 0) {
      const previous = sectionIndex - 1;
      setSectionIndex(previous);
      setSlideIndex(demoCase.sections[previous].slides.length - 1);
    }
  }

  function goNext() {
    if (slideIndex < activeSection.slides.length - 1) {
      setSlideIndex((current) => current + 1);
      return;
    }
    if (sectionIndex < demoCase.sections.length - 1) {
      setSectionIndex((current) => current + 1);
      setSlideIndex(0);
    }
  }

  function setOption(slideId: string, value: string) {
    setSelectedOptions((current) => ({ ...current, [slideId]: value }));
  }

  return (
    <main className="simulador-root dark min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="flex min-h-screen flex-col">
        <header className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-6 px-6 md:px-10">
          <Link href="/case-lab" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            ← Casos
          </Link>
          <div className="hidden h-1 w-[420px] overflow-hidden rounded-full bg-[var(--surface-3)] md:block">
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${progress}%` }} />
          </div>
          <Link href="/exercise-lab" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            Ejercicios
          </Link>
        </header>

        <div className="mx-auto grid w-full max-w-[1440px] flex-1 gap-8 px-6 pb-8 md:px-10 lg:grid-cols-[300px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-8 rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-5">
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
                      sectionIndex === index
                        ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                        sectionIndex === index
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
            </div>
          </aside>

          <section className="flex min-h-[calc(100vh-6rem)] items-center">
            <div className="w-full overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface-2)]">
              <AnimatePresence mode="wait">
                <motion.article
                  key={`${activeSection.name}-${activeSlide.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="grid min-h-[680px] lg:grid-cols-[minmax(0,1fr)_420px]"
                >
                  <div className="flex flex-col p-7 md:p-10">
                    <div className="flex items-center justify-between gap-4">
                      <p className="eyebrow text-[var(--text-tertiary)]">
                        {activeSection.name} · {activeSlide.eyebrow}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {slideIndex + 1} / {totalSlides}
                      </p>
                    </div>

                    <div className="mt-16 max-w-[780px]">
                      <h2 className="display text-4xl md:text-5xl">{activeSlide.title}</h2>
                      <p className="mt-6 text-xl leading-9 text-[var(--text-secondary)]">
                        {activeSlide.body}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-10">
                      <button
                        type="button"
                        onClick={goBack}
                        disabled={!canGoBack}
                        className="rounded-[12px] px-5 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        Atrás
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        disabled={!canGoNext}
                        className="rounded-[12px] bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--text-disabled)]"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-[var(--hairline)] bg-[var(--surface)] p-6 lg:border-l lg:border-t-0">
                    <ExercisePanel
                      slide={activeSlide}
                      selected={selectedOptions[activeSlide.id] ?? ""}
                      setSelected={(value) => setOption(activeSlide.id, value)}
                    />
                  </div>
                </motion.article>
              </AnimatePresence>
            </div>
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
      <PanelShell title="Lectura del caso">
        <p className="text-base leading-8 text-[var(--text-secondary)]">
          Esta pantalla contextualiza la decisión. No pide respuesta todavía.
        </p>
      </PanelShell>
    );
  }

  if (slide.type === "data_table" && slide.rows) {
    return (
      <PanelShell title="Tabla de datos">
        <div className="grid gap-3">
          {slide.rows.map((row) => (
            <div key={row.label} className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <p className="font-medium">{row.label}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{row.detail}</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(["Usar", "Anonimizar", "Excluir"] as DataChoice[]).map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setSelected(`${row.label}:${choice}`)}
                    className={[
                      "rounded-[10px] px-2 py-2 text-xs font-medium transition",
                      selected === `${row.label}:${choice}`
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]",
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
        <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="min-h-[180px] text-base leading-8 text-[var(--text-secondary)]">
            {slide.prompt}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-[var(--hairline)] pt-4 text-sm text-[var(--text-tertiary)]">
            <span>GPT Corporativo · IT</span>
            <span>↑</span>
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
                "rounded-[16px] border p-4 text-left transition",
                selected === label
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface-2)]",
              ].join(" ")}
            >
              <p className="text-sm text-[var(--text-tertiary)]">{label}</p>
              <p className="mt-1 font-medium">Seleccionar {label.toLowerCase()}</p>
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
          {["Tarea", "Acceso", "Acción máxima", "Condición de paro"].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setSelected(label)}
              className={[
                "rounded-[16px] border p-4 text-left transition",
                selected === label
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface-2)]",
              ].join(" ")}
            >
              <p className="text-sm text-[var(--text-tertiary)]">{label}</p>
              <p className="mt-1 font-medium">{selected === label ? "Seleccionado" : "Pendiente"}</p>
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
            <div key={option} className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <p className="font-medium">{option}</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {["Permitir", "Revisar", "Bloquear"].map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setSelected(`${option}:${choice}`)}
                    className={[
                      "rounded-[10px] px-2 py-2 text-xs font-medium transition",
                      selected === `${option}:${choice}`
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]",
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
                "rounded-[16px] border p-4 text-left transition",
                selected === option
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)]",
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
      <PanelShell title="Respuesta">
        <textarea
          className="min-h-[240px] w-full resize-none rounded-[20px] border border-[var(--border)] bg-[var(--surface-2)] p-4 text-base leading-7 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          placeholder="Escribe una recomendación breve para el manager..."
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
