"use client";

/**
 * PracticeBeatClient — shell FORMATIVO del player de practice beats.
 *
 * Generaliza el flujo que validó /aprender-demo: responder → Revisar →
 * feedback por fila/segmento (respuesta de referencia + porqué) → Continuar.
 * Enseña; no mide bajo presión.
 *
 * Persistencia: al empezar crea un practice_attempt (POST /api/practica/attempts)
 * y al llegar al cierre lo completa (PATCH), lo que también cierra el
 * practice_unlock de origen. En previewOnly (QA sin usuario) no escribe nada.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExerciseBlockRenderer } from "@/components/simulador/ExerciseBlockRenderer";
import { AppleCaseHeader, AppleSlideButton } from "@/components/simulador/apple";
import { SlideBody } from "@/app/exercise-lab/_shared/SlideBody";
import { isBlockComplete } from "@/lib/simulador/exercise-completion";
import type { ExerciseResponsePayload } from "@/lib/simulador/exercise-registry";
import type {
  PlayablePracticeBeat,
  PracticeSlide,
} from "@/lib/simulador/practice-beats";

const SLIDE_VARIANTS = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

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
  // Chip pill v2 con band tokens (acierto = banda A, casi = banda M).
  const tone = hit
    ? "bg-[var(--band-a-bg)] text-[var(--band-a-text)]"
    : "bg-[var(--band-m-bg)] text-[var(--band-m-text)]";
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 ts-caption-1 font-bold ${tone}`}
    >
      {hit ? "You got it" : "Close"}
    </span>
  );
}

function FormativeFeedback({
  slide,
  payload,
}: {
  slide: PracticeSlide;
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
    // Panel de feedback v2: tinte accent (surface-tint) + eyebrow extrabold.
    <div className="mt-6 rounded-[var(--radius-lg)] bg-[var(--surface-tint)] px-5 py-4">
      <p className="mb-3 ts-footnote font-extrabold uppercase tracking-[0.8px] text-[var(--accent)]">
        Feedback
      </p>
      <div className="flex flex-col gap-3">
        {items.map((it) => (
          <div key={it.key}>
            <div className="flex items-start justify-between gap-3">
              <span className="ts-subhead font-semibold text-[var(--text-primary)]">
                {it.label}
              </span>
              <FeedbackChip hit={it.hit} />
            </div>
            <p className="ts-footnote mt-1 leading-[1.5] text-[var(--text-secondary)]">
              {it.why}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClosingScreen({
  slide,
  completing,
  onDone,
  onRestart,
}: {
  slide: PracticeSlide;
  completing: boolean;
  onDone: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="mx-auto w-[86%] max-w-[680px] py-4 text-center sm:w-[65%]">
      {/* Sello de cierre v2: círculo de banda A con check grueso. */}
      <div
        aria-hidden
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--band-a-bg)] text-[var(--band-a-text)]"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="display display-tight ts-title-1 text-[var(--text-primary)] sm:ts-display">
        {slide.title}
      </h1>
      <div className="mt-3">
        <SlideBody>{slide.body}</SlideBody>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <AppleSlideButton onClick={onDone} isDisabled={completing}>
          {completing ? "Saving…" : "Back to home →"}
        </AppleSlideButton>
        <button
          type="button"
          onClick={onRestart}
          className="ts-subhead font-semibold text-[var(--text-tertiary)] underline underline-offset-2 transition-colors hover:text-[var(--text-primary)]"
        >
          Redo this practice
        </button>
      </div>
    </div>
  );
}

export function PracticeBeatClient({
  beat,
  previewOnly,
  closeHref = "/team",
}: {
  beat: PlayablePracticeBeat;
  previewOnly: boolean;
  /** A dónde va el botón cerrar. Default /team (empleado autenticado);
   *  el demo público lo apunta a la landing. */
  closeHref?: string;
}) {
  const slides = beat.slides;
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [payloads, setPayloads] = useState<
    Record<string, ExerciseResponsePayload>
  >({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [completing, setCompleting] = useState(false);
  const attemptIdRef = useRef<string | null>(null);
  const attemptStartedRef = useRef(false);
  const attemptCompletedRef = useRef(false);

  const slide = slides[idx];
  const isExercise = slide.kind === "exercise";
  const payload = payloads[slide.id];
  const blockComplete = useMemo(
    () =>
      slide.blockId ? isBlockComplete(slide.blockId, payload).complete : true,
    [slide.blockId, payload],
  );
  const isRevealed = Boolean(revealed[slide.id]);

  const startAttempt = useCallback(() => {
    if (previewOnly || attemptStartedRef.current) return;
    attemptStartedRef.current = true;
    fetch("/api/practica/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ beat_slug: beat.slug }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { attempt_id?: string } | null) => {
        attemptIdRef.current = data?.attempt_id ?? null;
      })
      .catch(() => {
        // El intento es telemetría del loop; nunca bloquea la práctica.
      });
  }, [previewOnly, beat.slug]);

  const completeAttempt = useCallback(async () => {
    if (previewOnly || attemptCompletedRef.current) return;
    const attemptId = attemptIdRef.current;
    if (!attemptId) return;
    attemptCompletedRef.current = true;
    setCompleting(true);
    try {
      await fetch(`/api/practica/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response_json: payloads }),
      });
    } catch {
      // Igual que el start: no bloquea al participante.
    } finally {
      setCompleting(false);
    }
  }, [previewOnly, payloads]);

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

  // Al llegar al cierre, el intento se completa (una sola vez).
  useEffect(() => {
    if (slide.kind === "closing") {
      void completeAttempt();
    }
  }, [slide.kind, completeAttempt]);

  if (slide.kind === "closing") {
    return (
      <main className="simulador-root min-h-screen surface-canvas text-[var(--text-primary)]">
        <div className="flex min-h-screen flex-col">
          <AppleCaseHeader
            total={slides.length}
            current={idx}
            closeHref={closeHref}
            onPrev={goPrev}
            prevDisabled={idx === 0}
          />
          <section className="flex flex-1 items-center justify-center py-10">
            <ClosingScreen
              slide={slide}
              completing={completing}
              onDone={() => router.push("/team")}
              onRestart={restart}
            />
          </section>
        </div>
      </main>
    );
  }

  const ctaLabel =
    slide.kind === "cover"
      ? "Start →"
      : isRevealed || !isExercise
        ? "Continue →"
        : "Check my answers";

  const onCta = () => {
    if (slide.kind === "cover") {
      startAttempt();
    }
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
          closeHref={closeHref}
          onPrev={goPrev}
          prevDisabled={idx === 0}
          ariaLabel={`Screen ${idx + 1} of ${slides.length}`}
        />

        <section className="relative flex flex-1 items-center justify-center overflow-hidden py-10">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={slide.id}
              variants={reduceMotion ? FADE_ONLY : SLIDE_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: reduceMotion ? 0.12 : 0.32,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-[86%] max-w-[680px] sm:w-[65%]"
            >
              {slide.chips && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {/* Chips de contexto v2: pill chunky, bold. */}
                  {slide.chips.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-[var(--surface-3)] px-2.5 py-1 ts-caption-1 font-bold text-[var(--text-secondary)]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}

              {/* El cover abre el módulo: jerarquía display extrabold más alta. */}
              <h1
                className={`display display-tight text-[var(--text-primary)] ${
                  slide.kind === "cover" ? "ts-display sm:ts-display-lg" : "ts-display"
                }`}
              >
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
                        Answer the exercise to check it.
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
