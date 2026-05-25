"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DemoCase, DemoCaseSection, DemoSlide } from "@/lib/simulador/case-lab-cases";
import {
  ExerciseBlockRenderer,
  type ExerciseEvidence,
} from "@/components/simulador/exercises/ExerciseBlockRenderer";

type FlatSlide = {
  section: DemoCaseSection;
  sectionIndex: number;
  slide: DemoSlide;
  slideIndex: number;
};

type SimulationLearningMode = "diagnostic_mode" | "learning_demo_mode";

const sectionNextLabel: Record<DemoCaseSection["name"], string> = {
  Contexto: "Ir a Datos",
  Datos: "Ir a IA",
  IA: "Ir a Revisión",
  Revisión: "Ir a Decisión",
  Decisión: "Ir a Respuesta",
  Respuesta: "Terminar",
};

export function CaseLabRuntime({ demoCase }: { demoCase: DemoCase }) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [highestUnlockedIndex, setHighestUnlockedIndex] = useState(1);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [evidenceBySlide, setEvidenceBySlide] = useState<Record<string, ExerciseEvidence>>({});
  const learningMode: SimulationLearningMode = "learning_demo_mode";
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
  const currentEvidence = !isIntro ? evidenceBySlide[current.slide.id] : undefined;
  const sectionHasExercises = !isIntro && current.section.slides.some((slide) => slide.kind === "exercise");
  const sectionEvidenceCount = !isIntro
    ? current.section.slides.filter((slide) => evidenceBySlide[slide.id]?.completed).length
    : 0;
  const currentSlideRequiresEvidence = !isIntro && current.slide.kind === "exercise";
  const currentSlideComplete = !currentSlideRequiresEvidence || Boolean(currentEvidence?.completed);
  const canAdvance = !isLast && currentSlideComplete;
  const canShowSectionDebrief =
    !isIntro &&
    isLastSlideInSection &&
    learningMode === "learning_demo_mode" &&
    sectionHasExercises &&
    sectionEvidenceCount > 0 &&
    (current.slide.kind === "reading" || Boolean(currentEvidence?.completed));

  useEffect(() => {
    function resetScroll() {
      window.scrollTo({ top: 0, left: 0 });
      shellRef.current?.scrollTo({ top: 0, left: 0 });
    }
    resetScroll();
    const resetAfterLayout = window.setTimeout(resetScroll, 320);
    return () => window.clearTimeout(resetAfterLayout);
  }, [currentIndex]);

  function sectionStartIndex(sectionIndex: number) {
    const slideIndex = slides.findIndex((item) => item.sectionIndex === sectionIndex);
    return slideIndex >= 0 ? slideIndex + 1 : 0;
  }

  function isSectionUnlocked(sectionIndex: number) {
    return sectionStartIndex(sectionIndex) <= highestUnlockedIndex;
  }

  function goToSection(sectionIndex: number) {
    const nextIndex = slides.findIndex((item) => item.sectionIndex === sectionIndex);
    const targetIndex = nextIndex + 1;
    if (nextIndex >= 0 && targetIndex <= highestUnlockedIndex) setCurrentIndex(targetIndex);
  }

  function goNext() {
    if (!canAdvance) return;
    const nextIndex = Math.min(slides.length, currentIndex + 1);
    setCurrentIndex(nextIndex);
    setHighestUnlockedIndex((index) => Math.max(index, nextIndex));
  }

  function goBack() {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function handleEvidence(evidence: ExerciseEvidence) {
    setEvidenceBySlide((current) => ({
      ...current,
      [evidence.slideId]: evidence,
    }));
  }

  return (
    <main className="simulador-root light h-screen overflow-hidden surface-canvas text-[var(--text-primary)]">
      <div ref={shellRef} className="flex h-screen flex-col overflow-hidden">
        <header className="mx-auto flex h-12 w-full max-w-[1440px] shrink-0 items-center justify-between gap-6 px-6 md:px-10">
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

        <div className="mx-auto grid min-h-0 w-full max-w-[1440px] flex-1 gap-6 px-6 pb-4 md:px-10 lg:grid-cols-[172px_minmax(0,1fr)] xl:grid-cols-[286px_minmax(0,1fr)] xl:gap-8">
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
                    disabled={!isSectionUnlocked(index)}
                    className={[
                      "flex items-center gap-2 rounded-[14px] px-2 py-2 text-left transition",
                      !isIntro && current.sectionIndex === index
                        ? "bg-[var(--accent)] text-white"
                        : isSectionUnlocked(index)
                          ? "text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
                          : "cursor-not-allowed text-[var(--text-disabled)] opacity-55",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
                        !isIntro && current.sectionIndex === index
                          ? "bg-white/18 text-white"
                          : isSectionUnlocked(index)
                            ? "border border-[var(--border)] text-[var(--text-secondary)]"
                            : "border border-[var(--hairline)] text-[var(--text-disabled)]",
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
                    disabled={!isSectionUnlocked(index)}
                    className={[
                      "flex items-center gap-3 rounded-[14px] px-3 py-3 text-left transition",
                      !isIntro && current.sectionIndex === index
                        ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                        : isSectionUnlocked(index)
                          ? "text-[var(--text-secondary)] hover:bg-[var(--surface-3)]"
                          : "cursor-not-allowed text-[var(--text-disabled)] opacity-55",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                        !isIntro && current.sectionIndex === index
                          ? "bg-[var(--accent)] text-white"
                          : isSectionUnlocked(index)
                            ? "border border-[var(--border)] text-[var(--text-secondary)]"
                            : "border border-[var(--hairline)] text-[var(--text-disabled)]",
                      ].join(" ")}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{section.name}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-auto hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4 2xl:block">
                <p className="text-xs text-[var(--text-tertiary)]">Brief para manager</p>
                <p className="mt-2 line-clamp-5 text-sm leading-6 text-[var(--text-secondary)]">
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
                        : "grid-rows-[auto_minmax(0,1fr)] gap-2 p-3 md:p-4",
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
                            : "mt-2 text-[24px] md:text-[28px] xl:text-[32px]",
                        ].join(" ")}
                      >
                        {current.slide.title}
                      </h2>
                      <p
                        className={[
                          "max-w-[680px] text-[var(--text-secondary)]",
                          current.slide.kind === "reading"
                            ? "mt-5 text-[17px] leading-8 md:text-[19px]"
                            : "mt-1 text-[13px] leading-5 md:text-[14px]",
                        ].join(" ")}
                      >
                        {current.slide.body}
                      </p>
                      {current.slide.kind === "reading" ? <LearningSignals slide={current.slide} /> : null}
                      {current.slide.kind === "reading" && canShowSectionDebrief ? (
                        <SectionDebrief section={current.section} mode={learningMode} compact />
                      ) : null}
                    </div>

                    {current.slide.kind === "exercise" ? (
                      <div className="mx-auto min-h-0 w-full max-w-[960px]">
                        <ExercisePanel
                          slide={current.slide}
                          evidence={currentEvidence}
                          onEvidence={handleEvidence}
                          mode={learningMode}
                        />
                        {canShowSectionDebrief ? <SectionDebrief section={current.section} mode={learningMode} compact /> : null}
                      </div>
                    ) : null}
                  </div>
                )}

                <footer className="flex shrink-0 items-center justify-between border-t border-[var(--hairline)] px-6 py-3 md:px-8">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={isFirst}
                    className="rounded-[12px] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canAdvance}
                    className="rounded-[12px] bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--text-disabled)]"
                  >
                    {isIntro
                      ? "Comenzar"
                      : isLast
                      ? "Listo"
                      : currentSlideRequiresEvidence && !currentSlideComplete
                      ? "Completa para seguir"
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
      <div className="mx-auto grid w-full max-w-[820px] gap-5">
        <div>
          <p className="eyebrow text-[var(--text-tertiary)]">Inicio del caso</p>
          <h2 className="display mt-5 text-[34px] leading-[1.04] md:text-[48px]">
            {demoCase.title}
          </h2>
          <p className="mt-4 max-w-[740px] text-[16px] leading-7 text-[var(--text-secondary)] md:text-[18px]">
            {demoCase.summary} Trabajarás con herramientas reales, datos sintéticos,
            decisiones con consecuencias y una recomendación final para manager.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-sm font-medium text-[var(--text-tertiary)]">Herramientas del caso</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {demoCase.tools.map((tool) => (
                <div key={tool} className="rounded-[16px] bg-[var(--surface-3)] px-4 py-2.5 text-sm font-medium">
                  {tool}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-sm font-medium text-[var(--text-tertiary)]">Timer</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Tiempo sugerido: {demoCase.minutes} min.
            </p>
            <button
              type="button"
              onClick={() => setTimerEnabled(!timerEnabled)}
              className={[
                "mt-4 w-full rounded-[14px] px-4 py-2.5 text-sm font-medium transition",
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
  evidence,
  onEvidence,
  mode,
}: {
  slide: DemoSlide;
  evidence?: ExerciseEvidence;
  onEvidence: (evidence: ExerciseEvidence) => void;
  mode: SimulationLearningMode;
}) {
  if (!slide.exerciseBlockId) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[var(--text-secondary)]">
        Ejercicio no configurado.
      </div>
    );
  }

  return (
    <div className="grid min-h-0 gap-3">
      <ExerciseBlockRenderer
        blockId={slide.exerciseBlockId}
        slideId={slide.id}
        props={{ ...slide.exerciseProps, compact: true }}
        onEvidence={onEvidence}
      />
      <SimulationFeedback slide={slide} evidence={evidence} mode={mode} />
    </div>
  );
}

function LearningSignals({ slide }: { slide: DemoSlide }) {
  const items = [
    slide.learningGoal ? ["Objetivo", slide.learningGoal] : null,
    slide.stakeholderPressure ? ["Presión", slide.stakeholderPressure] : null,
    slide.artifact ? ["Artefacto", slide.artifact] : null,
  ].filter(Boolean) as Array<[string, string]>;

  if (items.length === 0) return null;

  return (
    <div className="mt-6 grid gap-2 sm:grid-cols-2">
      {items.slice(0, 4).map(([label, value]) => (
        <div key={label} className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">{label}</p>
          <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[var(--text-secondary)]">{value}</p>
        </div>
      ))}
    </div>
  );
}

function SimulationFeedback({
  slide,
  evidence,
  mode,
}: {
  slide: DemoSlide;
  evidence?: ExerciseEvidence;
  mode: SimulationLearningMode;
}) {
  const completed = Boolean(evidence?.completed);
  const showDebrief = mode === "learning_demo_mode" && completed;

  return (
    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5">
      <div className="grid gap-2 text-[12px] leading-5 text-[var(--text-secondary)] md:grid-cols-2">
        <p>
          <span className="font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
            {completed ? "Evidencia capturada: " : "Evidencia esperada: "}
          </span>
          {completed ? "decisión registrada para el replay." : slide.evidenceExpected ?? "decisión observable."}
        </p>
        <p>
          <span className="font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          {showDebrief ? "Consecuencia simulada: " : "Qué afectará: "}
        </span>
        {showDebrief
          ? slide.simulationConsequence ?? "cambia lo que puede avanzar en el caso."
          : "se usará en el replay final y en la lectura del manager."}
      </p>
      </div>
    </div>
  );
}

function SectionDebrief({
  section,
  mode,
  compact = false,
}: {
  section: DemoCaseSection;
  mode: SimulationLearningMode;
  compact?: boolean;
}) {
  if (mode !== "learning_demo_mode") return null;

  return (
    <div className={`${compact ? "mt-1" : "mt-6"} rounded-[20px] border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-3`}>
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--accent)]">Debrief de sección</p>
      <div className="mt-2 grid gap-2 text-[13px] leading-5 text-[var(--text-secondary)] md:grid-cols-3">
        <p><span className="font-medium text-[var(--text-primary)]">Qué protegías: </span>{section.debrief.protect}</p>
        <p><span className="font-medium text-[var(--text-primary)]">Qué evidencia quedó: </span>{section.debrief.evidence}</p>
        <p><span className="font-medium text-[var(--text-primary)]">Qué sigue: </span>{section.debrief.next}</p>
      </div>
    </div>
  );
}
