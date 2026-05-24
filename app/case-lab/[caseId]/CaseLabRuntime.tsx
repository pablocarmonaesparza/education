"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DemoCase, DemoCaseSection, DemoSlide } from "@/lib/simulador/case-lab-cases";
import { ExerciseBlockRenderer } from "@/components/simulador/exercises/ExerciseBlockRenderer";

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

  function goToSection(sectionIndex: number) {
    const nextIndex = slides.findIndex((item) => item.sectionIndex === sectionIndex);
    if (nextIndex >= 0) setCurrentIndex(nextIndex + 1);
  }

  return (
    <main className="simulador-root light min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="flex h-screen flex-col overflow-hidden">
        <header className="mx-auto flex h-16 w-full max-w-[1440px] shrink-0 items-center justify-between gap-6 px-6 md:px-10">
          <Link
            href="/case-lab"
            className="rounded-[10px] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
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
            className="rounded-[10px] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
          >
            Ejercicios
          </Link>
        </header>

        <div className="mx-auto grid min-h-0 w-full max-w-[1440px] flex-1 gap-6 px-6 pb-8 md:px-10 lg:grid-cols-[172px_minmax(0,1fr)] xl:grid-cols-[286px_minmax(0,1fr)] xl:gap-8">
          <aside className="hidden min-h-0 lg:block xl:hidden">
            <div className="flex h-full flex-col rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]">
                    {demoCase.level}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm font-semibold leading-5">{demoCase.title}</p>
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
                      "flex items-center gap-2 rounded-[14px] px-2 py-2 text-left transition",
                      !isIntro && current.sectionIndex === index
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
                        !isIntro && current.sectionIndex === index
                          ? "bg-white/18 text-white"
                          : "border border-[var(--border)] text-[var(--text-secondary)]",
                      ].join(" ")}
                    >
                      {index + 1}
                    </span>
                    <span className="text-xs font-medium">{section.name}</span>
                  </button>
                ))}
              </nav>
              <p className="mt-auto text-xs leading-5 text-[var(--text-tertiary)]">
                {isIntro ? "Inicio del caso" : `${current.section.name} · ${current.slideIndex + 1}/5`}
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
                      !isIntro && current.sectionIndex === index
                        ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                        !isIntro && current.sectionIndex === index
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
                      "grid min-h-0 overflow-hidden",
                      current.slide.kind === "reading"
                        ? "place-items-center gap-6 p-6 md:p-8"
                        : "grid-rows-[auto_minmax(0,1fr)] gap-4 p-4 md:p-5",
                    ].join(" ")}
                  >
                    <div className={current.slide.kind === "reading" ? "mx-auto w-full max-w-[720px] xl:mx-0" : "mx-auto w-full max-w-[960px]"}>
                      <div className="flex items-center justify-between gap-4">
                        <p className="eyebrow text-[var(--text-tertiary)]">
                          {current.section.name} · {current.slide.eyebrow}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {current.slideIndex + 1} / {current.section.slides.length}
                        </p>
                      </div>
                      <h2
                        className={[
                          "display leading-[1.04]",
                          current.slide.kind === "reading"
                            ? "mt-8 text-[34px] md:text-[46px] xl:text-[52px]"
                            : "mt-3 text-[26px] md:text-[32px] xl:text-[36px]",
                        ].join(" ")}
                      >
                        {current.slide.title}
                      </h2>
                      <p
                        className={[
                          "max-w-[680px] text-[var(--text-secondary)]",
                          current.slide.kind === "reading"
                            ? "mt-5 text-[17px] leading-8 md:text-[19px]"
                            : "mt-2 text-[14px] leading-6 md:text-[15px]",
                        ].join(" ")}
                      >
                        {current.slide.body}
                      </p>
                    </div>

                    {current.slide.kind === "exercise" ? (
                      <div className="mx-auto min-h-0 w-full max-w-[960px]">
                        <ExercisePanel slide={current.slide} />
                      </div>
                    ) : null}
                  </div>
                )}

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
                    onClick={() => setCurrentIndex((index) => Math.min(slides.length, index + 1))}
                    disabled={isLast}
                    className="rounded-[12px] bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--text-disabled)]"
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
          <h2 className="display mt-8 text-[36px] leading-[1.04] md:text-[54px]">
            {demoCase.title}
          </h2>
          <p className="mt-5 max-w-[740px] text-[18px] leading-8 text-[var(--text-secondary)] md:text-[20px]">
            {demoCase.summary} Trabajarás con herramientas reales de IA y marketing, datos sintéticos,
            revisión de salida y una recomendación final para manager.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-tertiary)]">Herramientas del caso</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {demoCase.tools.map((tool) => (
                <div key={tool} className="rounded-[16px] bg-[var(--surface-3)] px-4 py-3 text-sm font-medium">
                  {tool}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-tertiary)]">Timer</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Tiempo sugerido: {demoCase.minutes} min.
            </p>
            <button
              type="button"
              onClick={() => setTimerEnabled(!timerEnabled)}
              className={[
                "mt-5 w-full rounded-[14px] px-4 py-3 text-sm font-medium transition",
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

function ExercisePanel({ slide }: { slide: DemoSlide }) {
  if (!slide.exerciseBlockId) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text-secondary)]">
        Ejercicio no configurado.
      </div>
    );
  }

  return (
    <ExerciseBlockRenderer
      blockId={slide.exerciseBlockId}
      slideId={slide.id}
      props={{ ...slide.exerciseProps, compact: true }}
    />
  );
}
