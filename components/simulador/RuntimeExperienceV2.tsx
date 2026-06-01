"use client";

/**
 * RuntimeExperienceV2 — runtime productivo CONFIG-DRIVEN.
 *
 * A diferencia de RuntimeExperience (hardcodeado a 5 step_types y al caso de
 * Camila), este juega CUALQUIER caso 5x5 generado: itera las slides del caso,
 * renderiza cada bloque con ExerciseBlockRenderer (los 17 bloques canónicos) y
 * persiste las respuestas vía las APIs de sesión (que ya son agnósticas al
 * número de pasos y al shape del payload; el juez también lee los pasos
 * dinámicamente).
 *
 * Aditivo: NO toca RuntimeExperience. Montado en /(app)/jugar/[case_id].
 *
 * Degradación: si el caso aún no está sembrado en la base (case_templates), la
 * sesión no se crea y corre en modo PREVIEW (jugable, sin persistir). Cuando el
 * caso se siembre (Fase 2), la misma pantalla persiste y evalúa.
 */

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExerciseBlockRenderer } from "@/components/simulador/ExerciseBlockRenderer";
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
      <strong key={i} className="font-semibold text-[var(--text-primary,#fff)]">
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
  mode?: "authenticated" | "field_test";
}) {
  const router = useRouter();
  const session = useSession(
    previewOnly ? null : (sessionSlug ?? playableCase.caseId),
    { mode },
  );
  const { patch, flush } = useStepPatch(session.sessionId, { mode });

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
      <main className="mx-auto max-w-2xl px-6 py-16 text-[var(--text-primary,#e7e7e7)]">
        <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary,#888)]">Cierre</p>
        <h1 className="mt-2 text-2xl font-semibold">Recorriste el caso.</h1>
        <p className="mt-3 text-[var(--text-secondary,#aaa)]">
          {session.sessionId
            ? "Tu sesión se está evaluando."
            : `Modo preview: respondiste ${answered} de ${flat.length} ejercicios. Este caso aún no está sembrado en la base, así que no se evaluó (eso llega cuando el caso vive en producción).`}
        </p>
      </main>
    );
  }

  if (!slide) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-[var(--text-primary,#e7e7e7)]">
        <p>Caso sin slides.</p>
      </main>
    );
  }

  const progress = ((idx + 1) / flat.length) * 100;

  return (
    <div className="min-h-screen bg-[var(--bg,#0a0a0b)]">
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-8 text-[var(--text-primary,#e7e7e7)]">
      {/* barra de progreso + estado de sesión */}
      <div className="mb-8">
        <div className="h-1 w-full overflow-hidden rounded bg-[var(--surface-2,#222)]">
          <div className="h-full bg-[var(--accent,#6366f1)] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-[var(--text-tertiary,#777)]">
          <span>{slide.sectionName} · slide {idx + 1} de {flat.length}</span>
          <span>
            {session.status === "ready" && session.sessionId
              ? "sesión activa"
              : session.status === "creating"
                ? "abriendo sesión…"
                : "modo preview"}
          </span>
        </div>
      </div>

      {/* encuadre de la slide */}
      <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary,#888)]">
        {slide.sectionName}
      </p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight">{slide.title}</h2>
      {slide.body && (
        <p className="mt-3 leading-relaxed text-[var(--text-secondary,#b5b5b5)]">
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
      <div className="mt-8 flex items-center justify-between border-t border-[var(--border,#2a2a2a)] pt-4">
        <button
          onClick={goPrev}
          disabled={idx === 0}
          className="text-sm text-[var(--text-tertiary,#888)] disabled:opacity-30"
        >
          Atrás
        </button>
        {!ownsContinue && (
          <button
            onClick={goNext}
            disabled={!blockComplete || completing}
            className="rounded-lg bg-[var(--accent,#6366f1)] px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {isLast ? (completing ? "Cerrando…" : "Terminar") : "Continuar"}
          </button>
        )}
      </div>
    </main>
    </div>
  );
}
