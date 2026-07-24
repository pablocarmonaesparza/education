"use client";

/**
 * RuntimeExperienceV2 — runtime productivo CONFIG-DRIVEN, único motor del
 * simulador.
 *
 * Juega CUALQUIER caso 5x5 generado: itera las slides del caso, renderiza
 * cada bloque con ExerciseBlockRenderer (los 17 bloques canónicos) y persiste
 * las respuestas vía las APIs de sesión (que ya son agnósticas al número de
 * pasos y al shape del payload; el juez también lee los pasos dinámicamente).
 *
 * Montado en /(app)/case/[case_id]. El motor legacy hardcodeado a 5 step_types
 * (RuntimeExperience) y la ruta separada /jugar se retiraron — había dos
 * rutas para lo mismo, ahora hay una sola.
 *
 * Degradación: si el caso aún no está sembrado en la base (case_templates), la
 * sesión no se crea y corre en modo PREVIEW (jugable, sin persistir). Cuando el
 * caso se siembre (Fase 2), la misma pantalla persiste y evalúa.
 */

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExerciseBlockRenderer } from "@/components/simulador/ExerciseBlockRenderer";
import { AppleButton } from "@/components/simulador/apple/AppleButton";
import { AppleSlideButton } from "@/components/simulador/apple/AppleSlideButton";
import { AppleStepBar } from "@/components/simulador/apple/AppleStepBar";
import { isBlockComplete } from "@/lib/simulador/exercise-completion";
import {
  emptyPayload,
  type ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";
import { useSession } from "@/lib/simulador/use-session";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import type { PlayableCase } from "@/lib/simulador/load-assembled-case";

// Bloques que manejan su propio botón Continuar (igual que el demo).
const OWNS_CONTINUE = new Set<ExerciseBlockId>([
  "case_cover",
  "ai_textfield_guided",
  "categorize_rows",
  "ai_comparison",
]);

interface FlatSlide {
  slideId: string;
  blockId: ExerciseBlockId;
  title: string;
  body: string;
  caseContext?: Record<string, unknown>;
  sectionId: string;
  sectionName: string;
}

// Render mínimo de markdown: **negritas**. Los bloques renderizan su contenido
// rico; esto es solo el encuadre (title/body) de la slide.
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

export function RuntimeExperienceV2({
  playableCase,
  sessionSlug,
  previewOnly = false,
  mode = "authenticated",
}: {
  playableCase: PlayableCase;
  /** Slug org-scoped del case_template sembrado; con él la sesión persiste y
   *  evalúa. Sin él, useSession no resuelve y corre en modo preview. */
  sessionSlug?: string;
  /** Si true, NO abre sesión productiva: corre puramente en preview (local). Es
   *  el contrato explícito para casos bespoke aún no integrados al modelo de
   *  sesión org-scoped (evita el intento fallido a /api/sessions). */
  previewOnly?: boolean;
  mode?: "authenticated";
}) {
  const router = useRouter();
  const session = useSession(
    previewOnly ? null : (sessionSlug ?? playableCase.caseId),
  );
  const { patch, flush } = useStepPatch(session.sessionId);

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
  const [payloads, setPayloads] = useState<Record<string, ExerciseResponsePayload>>({});
  const [completing, setCompleting] = useState(false);

  const slide = flat[idx];
  const currentPayload = payloads[slide?.slideId ?? ""];
  const ownsContinue = slide ? OWNS_CONTINUE.has(slide.blockId) : false;
  const blockComplete = slide
    ? isBlockComplete(slide.blockId, currentPayload ?? emptyPayload(slide.blockId)).complete
    : false;
  const isLast = idx >= flat.length - 1;

  const handlePayloadChange = useCallback(
    (p: ExerciseResponsePayload) => {
      if (!slide) return;
      setPayloads((prev) => ({ ...prev, [slide.slideId]: p }));
      // step_key = slideId. Coincide con los case_steps que siembra
      // persistGeneratedCase, así PATCH /responses lo valida y persiste. Sin
      // sesión (caso aún no sembrado en la base) es no-op: modo preview.
      patch(slide.slideId, p as unknown as Record<string, unknown>);
    },
    [slide, patch],
  );

  const finish = useCallback(async () => {
    setCompleting(true);
    try {
      await flush();
      if (session.sessionId) {
        await fetch(`/api/sessions/${session.sessionId}/complete`, { method: "POST" });
        router.push(`/report/${session.sessionId}`);
        return;
      }
    } catch {
      // en preview o ante error, cae al resumen local
    }
    setIdx(flat.length); // pantalla de cierre local
    setCompleting(false);
  }, [flush, session.sessionId, router, flat.length]);

  const goNext = useCallback(() => {
    if (isLast) {
      void finish();
    } else {
      setIdx((i) => i + 1);
    }
  }, [isLast, finish]);

  const goPrev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);

  // Pantalla de cierre local (modo preview, sin reporte productivo).
  if (idx >= flat.length) {
    const answered = Object.keys(payloads).length;
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-[var(--text-primary)]">
        {/* eyebrow v2: extrabold + tracking + acento */}
        <p className="ts-footnote font-extrabold uppercase tracking-[0.8px] text-[var(--accent)]">Wrap-up</p>
        <h1 className="mt-2 ts-title-2 font-extrabold">You finished the case</h1>
        <p className="mt-3 text-[var(--text-secondary)]">
          {session.sessionId
            ? "Your session is being scored."
            : `Preview mode: you answered ${answered} of ${flat.length} exercises. This case is not seeded in the database yet, so it was not scored (that happens once the case is live in production).`}
        </p>
      </main>
    );
  }

  if (!slide) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-[var(--text-primary)]">
        <p>This case has no slides.</p>
      </main>
    );
  }

  // AppleStepBar por sección (mismo chrome que case-demo): segmentos = slides
  // de la sección actual · la posición global vive en el caption de abajo.
  const sectionStart = flat.findIndex((f) => f.sectionId === slide.sectionId);
  const sectionTotal = flat.filter((f) => f.sectionId === slide.sectionId).length;
  const idxInSection = idx - sectionStart;

  return (
    <div className="min-h-screen bg-[var(--surface)]">
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-8 text-[var(--text-primary)]">
      {/* barra de pasos chunky (v2) + estado de sesión */}
      <div className="mb-8">
        <AppleStepBar
          total={sectionTotal}
          current={idxInSection}
          ariaLabel="Case progress"
        />
        <div className="mt-2 ts-caption-1 text-[var(--text-tertiary)]">
          {slide.sectionName} · screen {idx + 1} of {flat.length}
        </div>
      </div>

      {/* encuadre de la slide · eyebrow v2 + título extrabold */}
      <p className="ts-footnote font-extrabold uppercase tracking-[0.8px] text-[var(--accent)]">
        {slide.sectionName}
      </p>
      <h2 className="mt-1 ts-title-2 font-extrabold tracking-tight">{slide.title}</h2>
      {slide.body && (
        <p className="mt-3 leading-relaxed text-[var(--text-secondary)]">
          {renderBody(slide.body)}
        </p>
      )}

      {/* el bloque */}
      <div className="mt-6 flex-1">
        <ExerciseBlockRenderer
          key={slide.slideId}
          blockId={slide.blockId}
          sessionId={session.sessionId}
          mode={mode}
          slideId={slide.slideId}
          caseContext={slide.caseContext}
          initialPayload={currentPayload}
          onPayloadChange={handlePayloadChange}
          onShellContinue={goNext}
        />
      </div>

      {/* navegación (los bloques OWNS_CONTINUE traen su propio botón) */}
      <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-4">
        <AppleButton
          tone="ghost"
          onPress={goPrev}
          isDisabled={idx === 0}
        >
          Back
        </AppleButton>
        {/* v2: CTA canónico del flujo slide-a-slide con labio 3D */}
        {!ownsContinue && (
          <AppleSlideButton
            onClick={goNext}
            isDisabled={!blockComplete || completing}
            isLoading={completing}
          >
            {isLast ? (completing ? "Finishing…" : "Finish") : "Continue"}
          </AppleSlideButton>
        )}
      </div>
    </main>
    </div>
  );
}
