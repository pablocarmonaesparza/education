"use client";

/**
 * /aprender-demo · pantalla de PRUEBA del motor educativo (segundo motor).
 * dev-only, sin BD ni sesión. Reusa los bloques reales (ExerciseBlockRenderer
 * en mode lab_demo) y el design system Apple. El modo FORMATIVO es propio de
 * esta capa: tras responder, el participante pulsa Revisar y ve el feedback
 * (respuesta de referencia + porqué). No mide bajo presión; enseña.
 *
 * No toca el runtime productivo del operativo. El contenido vive en module-data.ts.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExerciseBlockRenderer } from "@/components/simulador/ExerciseBlockRenderer";
import { AppleCaseHeader, AppleSlideButton } from "@/components/simulador/apple";
import { SlideBody } from "../exercise-lab/_shared/SlideBody";
import { isBlockComplete } from "@/lib/simulador/exercise-completion";
import type { ExerciseResponsePayload } from "@/lib/simulador/exercise-registry";
import { MODULE, type DemoSlide } from "./module-data";

const SLIDE_VARIANTS = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

// HIG A11Y-04: con prefers-reduced-motion, solo fundido sin desplazamiento.
const FADE_ONLY = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

function rowAction(
  payload: ExerciseResponsePayload | undefined,
  rowId: string,
): string | null {
  if (!payload || payload.block_id !== "categorize_rows") return null;
  const hit = payload.row_actions.find((r) => r.row_id === rowId);
  return hit?.action ?? null;
}

function segmentMarked(
  payload: ExerciseResponsePayload | undefined,
  segmentId: string,
): boolean {
  if (!payload || payload.block_id !== "ai_output_review") return false;
  const hit = payload.flagged_segments.find((s) => s.segment_id === segmentId);
  return Boolean(hit && hit.flag !== null);
}

function FeedbackChip({ hit }: { hit: boolean }) {
  return (
    <span
      className="ts-caption-1 font-medium"
      style={{
        background: hit ? "var(--band-a-bg)" : "var(--band-m-bg)",
        color: hit ? "var(--band-a-text)" : "var(--band-m-text)",
        padding: "2px 10px",
        borderRadius: "var(--radius-full)",
        whiteSpace: "nowrap",
      }}
    >
      {hit ? "Lo tienes" : "Casi"}
    </span>
  );
}

function FormativeFeedback({
  slide,
  payload,
}: {
  slide: DemoSlide;
  payload: ExerciseResponsePayload | undefined;
}) {
  if (!slide.feedback) return null;

  const items =
    slide.feedback.kind === "rows"
      ? slide.feedback.rows.map((r) => {
          const rows = (slide.caseContext?.rows ?? []) as Array<{
            id: string;
            label: string;
          }>;
          const label = rows.find((x) => x.id === r.id)?.label ?? r.id;
          const hit = rowAction(payload, r.id) === r.correct;
          return { key: r.id, label, hit, why: r.why };
        })
      : slide.feedback.segments.map((s) => {
          const segs = (slide.caseContext?.segments ?? []) as Array<{
            id: string;
            text: string;
          }>;
          const label = segs.find((x) => x.id === s.id)?.text ?? s.id;
          const hit = segmentMarked(payload, s.id) === s.shouldFlag;
          return { key: s.id, label, hit, why: s.why };
        });

  return (
    <div
      className="mt-6"
      style={{
        borderRadius: "var(--radius-lg)",
        background: "var(--surface-2)",
        padding: "1rem 1.25rem",
      }}
    >
      <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>
        Retroalimentación
      </p>
      <div className="flex flex-col gap-3">
        {items.map((it) => (
          <div key={it.key}>
            <div className="flex items-start justify-between gap-3">
              <span className="ts-subhead text-[var(--text-primary)]">{it.label}</span>
              <FeedbackChip hit={it.hit} />
            </div>
            <p className="ts-footnote mt-1 text-[var(--text-secondary)]">{it.why}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClosingScreen({ onRestart }: { onRestart: () => void }) {
  const [eduValue, setEduValue] = useState(MODULE.seals.educativoBefore);
  useEffect(() => {
    const t = setTimeout(() => setEduValue(MODULE.seals.educativoAfter), 280);
    return () => clearTimeout(t);
  }, []);

  const cierre = MODULE.slides[MODULE.slides.length - 1];

  function Bar({
    label,
    value,
    color,
  }: {
    label: string;
    value: number;
    color: string;
  }) {
    return (
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <span className="ts-subhead text-[var(--text-primary)]">{label}</span>
          <span className="ts-footnote text-[var(--text-secondary)]">{Math.round(value)}%</span>
        </div>
        <div
          style={{
            height: 8,
            background: "var(--surface-3)",
            borderRadius: "var(--radius-full)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${value}%`,
              background: color,
              borderRadius: "var(--radius-full)",
              transition: "width var(--motion-slow) var(--motion-ease)",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-[65%] max-w-[680px] py-4 text-center">
      <div
        aria-hidden
        className="mx-auto flex items-center justify-center"
        style={{
          width: 48,
          height: 48,
          borderRadius: "var(--radius-full)",
          background: "var(--band-a-bg)",
          color: "var(--band-a-text)",
          marginBottom: 16,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="display display-tight ts-title-1 text-[var(--text-primary)]">
        {cierre.title}
      </h1>
      <div className="mt-3">
        <SlideBody>{cierre.body}</SlideBody>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {MODULE.dimensions.map((d) => (
          <span
            key={d}
            className="ts-caption-1 text-[var(--text-secondary)]"
            style={{
              background: "var(--surface-3)",
              padding: "3px 10px",
              borderRadius: "var(--radius-full)",
            }}
          >
            {d}
          </span>
        ))}
      </div>

      <div
        className="mt-8 text-left"
        style={{
          borderRadius: "var(--radius-lg)",
          background: "var(--surface-2)",
          padding: "1.25rem",
        }}
      >
        <p className="eyebrow" style={{ marginBottom: 16 }}>
          Tus dos sellos
        </p>
        <div className="flex flex-col gap-4">
          <Bar label="Educativo" value={eduValue} color="var(--accent-strong)" />
          <Bar label="Práctico" value={MODULE.seals.practico} color="var(--band-a-bar)" />
        </div>
        <p className="ts-footnote mt-4 text-[var(--text-tertiary)]">
          Para tener el perfil completo cierras los dos. El educativo te mantiene al día; el práctico demuestra que lo aplicas bajo presión.
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <AppleSlideButton onClick={onRestart}>Reiniciar la demo →</AppleSlideButton>
      </div>
    </div>
  );
}

export function AprenderDemoClient() {
  const slides = MODULE.slides;
  const reduceMotion = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [payloads, setPayloads] = useState<Record<string, ExerciseResponsePayload>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const slide = slides[idx];
  const isExercise = slide.kind === "exercise";
  const payload = payloads[slide.id];
  const blockComplete = useMemo(
    () => (slide.blockId ? isBlockComplete(slide.blockId, payload).complete : true),
    [slide.blockId, payload],
  );
  const isRevealed = Boolean(revealed[slide.id]);

  const goNext = useCallback(() => {
    setIdx((i) => Math.min(i + 1, slides.length - 1));
  }, [slides.length]);
  const goPrev = useCallback(() => setIdx((i) => Math.max(i - 1, 0)), []);
  const restart = useCallback(() => {
    setIdx(0);
    setPayloads({});
    setRevealed({});
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [idx]);

  if (slide.kind === "closing") {
    return (
      <main className="simulador-root min-h-screen surface-canvas text-[var(--text-primary)]">
        <div className="flex min-h-screen flex-col">
          <AppleCaseHeader
            total={slides.length}
            current={idx}
            closeHref="/dev"
            onPrev={goPrev}
            prevDisabled={idx === 0}
          />
          <section className="flex flex-1 items-center justify-center py-10">
            <ClosingScreen onRestart={restart} />
          </section>
        </div>
      </main>
    );
  }

  const ctaLabel =
    slide.kind === "cover" ? "Empezar →" : isRevealed || !isExercise ? "Continuar →" : "Revisar respuestas";

  const onCta = () => {
    if (isExercise && !isRevealed) {
      setRevealed((r) => ({ ...r, [slide.id]: true }));
      return;
    }
    goNext();
  };

  const ctaDisabled = isExercise && !isRevealed && !blockComplete;

  return (
    <main className="simulador-root min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="flex min-h-screen flex-col">
        <AppleCaseHeader
          total={slides.length}
          current={idx}
          closeHref="/dev"
          onPrev={goPrev}
          prevDisabled={idx === 0}
          ariaLabel={`Pantalla ${idx + 1} de ${slides.length}`}
        />

        <section className="relative flex flex-1 items-center justify-center overflow-hidden py-10">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={slide.id}
              variants={reduceMotion ? FADE_ONLY : SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: reduceMotion ? 0.12 : 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="w-[65%] max-w-[680px]"
            >
              {slide.chips && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {slide.chips.map((c) => (
                    <span
                      key={c}
                      className="ts-caption-1 font-medium text-[var(--text-secondary)]"
                      style={{
                        background: "var(--surface-3)",
                        padding: "3px 10px",
                        borderRadius: "var(--radius-full)",
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="display display-tight ts-display text-[var(--text-primary)]">
                {slide.title}
              </h1>

              <SlideBody className="mt-4">{slide.body}</SlideBody>

              {isExercise && slide.blockId && (
                <div className="mt-8">
                  <ExerciseBlockRenderer
                    key={slide.id}
                    blockId={slide.blockId}
                    sessionId={null}
                    mode="lab_demo"
                    slideId={slide.id}
                    caseContext={slide.caseContext}
                    initialPayload={payload}
                    onPayloadChange={(p) =>
                      setPayloads((prev) => ({ ...prev, [slide.id]: p }))
                    }
                  />
                </div>
              )}

              {isExercise && isRevealed && (
                <FormativeFeedback slide={slide} payload={payload} />
              )}

              <div className="mt-10">
                <AppleSlideButton
                  onClick={onCta}
                  isDisabled={ctaDisabled}
                  hint={
                    ctaDisabled ? (
                      <span className="ts-footnote text-[var(--text-tertiary)]">
                        Responde el ejercicio para revisar.
                      </span>
                    ) : undefined
                  }
                >
                  {ctaLabel}
                </AppleSlideButton>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
