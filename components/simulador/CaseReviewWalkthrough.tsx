"use client";

/**
 * CaseReviewWalkthrough — recorrido READ-ONLY de un caso, slide por slide, sin
 * jugarlo. Lo usan las pantallas de "Caso revisión" (staff/admin y manager)
 * para que quien revisa el caso vea EXACTAMENTE lo que ve el participante en
 * cada pantalla, sin poder responder ni persistir nada.
 *
 * Reusa ExerciseBlockRenderer (los 17 bloques canónicos) envuelto en un
 * contenedor no-interactivo (pointer-events:none, aria-hidden). Cero sesión,
 * cero autosave: sessionId=null y no se pasa onPayloadChange, así que ningún
 * bloque escribe a la base. Esto NO toca el runtime productivo
 * (RuntimeExperienceV2) — es un recorrido paralelo de solo lectura.
 *
 * Auto-avance opcional (play/pausa): recorre las slides cada AUTO_MS. Se
 * detiene solo al llegar al final. También hay navegación manual (atrás/
 * adelante) y un ir-a-slide desde los puntos de sección.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExerciseBlockRenderer } from "@/components/simulador/ExerciseBlockRenderer";
import { AppleBadge, AppleIcon } from "@/components/simulador/apple";
import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";
import type { PlayableCase } from "@/lib/simulador/load-assembled-case";

const AUTO_MS = 3500;

interface FlatSlide {
  slideId: string;
  blockId: ExerciseBlockId;
  title: string;
  body: string;
  caseContext?: Record<string, unknown>;
  sectionId: string;
  sectionName: string;
}

// Encuadre mínimo (title/body). Los bloques renderizan su contenido rico.
function renderBody(body: string) {
  const parts = body.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-[var(--text-primary)]">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export function CaseReviewWalkthrough({
  playableCase,
}: {
  playableCase: PlayableCase;
}) {
  const flat = useMemo<FlatSlide[]>(
    () =>
      playableCase.sections.flatMap((s) =>
        s.slides.map((sl) => ({
          slideId: sl.slideId,
          blockId: sl.blockId as ExerciseBlockId,
          title: sl.title,
          body: sl.body,
          caseContext: sl.caseContext,
          sectionId: s.id,
          sectionName: s.name,
        })),
      ),
    [playableCase],
  );

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const total = flat.length;
  const slide = flat[idx];
  const isLast = idx === total - 1;

  const goNext = useCallback(
    () => setIdx((i) => Math.min(total - 1, i + 1)),
    [total],
  );
  const goPrev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);

  // Auto-avance: mientras playing y no sea la última, avanza cada AUTO_MS.
  useEffect(() => {
    if (!playing) return;
    if (isLast) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIdx((i) => Math.min(total - 1, i + 1)), AUTO_MS);
    return () => clearTimeout(t);
  }, [playing, idx, isLast, total]);

  if (!slide) {
    return (
      <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-8 text-center ts-subhead text-[var(--text-secondary)]">
        This case has no slides to review.
      </div>
    );
  }

  const progress = ((idx + 1) / total) * 100;

  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--surface-2)] p-5 sm:p-6">
      {/* barra de modo revisión */}
      <div className="flex items-center justify-between gap-3">
        <AppleBadge tone="accent">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Review mode
          </span>
        </AppleBadge>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          disabled={isLast && !playing}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-3)] px-3 py-1.5 ts-caption-1 font-bold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-40"
        >
          {playing ? "Pause walkthrough" : "Play walkthrough"}
        </button>
      </div>

      {/* progreso · barra chunky redondeada (v2) */}
      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 ts-caption-1 text-[var(--text-tertiary)]">
          {slide.sectionName} · screen {idx + 1} of {total}
        </div>
      </div>

      {/* encuadre de la slide · eyebrow v2 + título extrabold */}
      <div className="mt-5">
        <p className="ts-footnote font-extrabold uppercase tracking-[0.8px] text-[var(--accent)]">
          {slide.sectionName}
        </p>
        <h3 className="mt-1 ts-title-3 font-extrabold tracking-tight text-[var(--text-primary)]">
          {slide.title}
        </h3>
        {slide.body && (
          <p className="mt-2 leading-relaxed text-[var(--text-secondary)]">
            {renderBody(slide.body)}
          </p>
        )}
      </div>

      {/* el bloque, en solo lectura: pointer-events:none impide interacción;
          sessionId=null y sin onPayloadChange ⇒ no persiste nada. */}
      {/* v2: contenedor del bloque como card (borde + shadow-card) */}
      <div
        className="mt-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card [&_*]:pointer-events-none"
        aria-hidden
      >
        <ExerciseBlockRenderer
          key={slide.slideId}
          blockId={slide.blockId}
          sessionId={null}
          mode="lab_demo"
          slideId={slide.slideId}
          caseContext={slide.caseContext}
        />
      </div>

      {/* navegación manual */}
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-[var(--hairline)] pt-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={idx === 0}
          className="inline-flex items-center gap-1 ts-callout font-bold text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)] disabled:opacity-30"
        >
          <AppleIcon name="chevronLeft" className="h-4 w-4" />
          Back
        </button>

        {/* puntos por slide (click para saltar) */}
        <div className="flex flex-wrap items-center justify-center gap-1">
          {flat.map((s, i) => (
            <button
              key={s.slideId}
              type="button"
              onClick={() => {
                setPlaying(false);
                setIdx(i);
              }}
              aria-label={`Go to screen ${i + 1}: ${s.title}`}
              className={`h-1.5 rounded-full transition-all ${
                i === idx
                  ? "w-4 bg-[var(--accent)]"
                  : "w-1.5 bg-[var(--surface-3)] hover:bg-[var(--border-strong)]"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={isLast}
          className="inline-flex items-center gap-1 ts-callout font-bold text-[var(--accent)] transition-colors disabled:opacity-30"
        >
          Next
          <AppleIcon name="chevronRight" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
