"use client";

/**
 * ReadingTimeline · bloque pasivo `reading_timeline` (lab_ref 00F).
 *
 * Línea vertical con dots y eventos en orden cronológico. Para recap
 * rápido del caso o secuencia que llevó a la decisión actual.
 * Eventos via `caseContext.events`; seed por default para el lab.
 */

import { useEffect, useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type ReadingTimelinePayload = Extract<
  ExerciseResponsePayload,
  { block_id: "reading_timeline" }
>;

interface TimelineEvent {
  when: string;
  what: string;
  who?: string;
  emphasis?: boolean;
}

const DEFAULT_EVENTS: TimelineEvent[] = [
  {
    when: "L-3",
    what: "Cliente reportó caída de conversión vía email",
    who: "Mariana Robles · Aurora Retail",
  },
  {
    when: "L-2",
    what: "Equipo de soporte escaló al área de marketing",
    who: "Tier 2 · Soporte",
  },
  {
    when: "L-1",
    what: "Manager pidió análisis con datos del último trimestre",
    who: "Lucía Beltrán · Head of Marketing",
  },
  {
    when: "Hoy",
    what: "Tienes que decidir cómo responder al cliente antes de las 18:00",
    emphasis: true,
  },
];

interface Props extends ExerciseRendererProps<ReadingTimelinePayload> {
  sessionId?: string | null;
}

export function ReadingTimeline({
  payload,
  onChange,
  onPatch,
  slideId = "reading_timeline",
  mode = "lab_demo",
  sessionId = null,
  caseContext,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());

  const events =
    (caseContext?.events as TimelineEvent[] | undefined) ?? DEFAULT_EVENTS;

  useEffect(() => {
    if (!payload.acknowledged) {
      const next: ReadingTimelinePayload = { ...payload, acknowledged: true };
      onChange(next);
      if (isProduction && sessionId) {
        patch(`block:reading_timeline:${slideId}`, next, {
          time_to_read_ms: Date.now() - mountedAt.current,
        });
      }
      onPatch?.(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ol className="relative">
      {events.map((event, idx) => {
        const isLast = idx === events.length - 1;
        return (
          <li key={idx} className="relative grid grid-cols-[64px_1fr] gap-4">
            {/* Columna izquierda · when + dot + línea vertical */}
            <div className="relative flex flex-col items-end pt-1">
              <span
                className={`ts-caption-1 font-medium tabular-nums ${
                  event.emphasis
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-tertiary)]"
                }`}
              >
                {event.when}
              </span>
            </div>
            {/* Columna derecha · dot inline + texto */}
            <div className={`relative pb-6 ${isLast ? "pb-0" : ""}`}>
              {/* Línea vertical (excepto último) */}
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute left-[5px] top-3 bottom-0 w-px bg-[var(--hairline)]"
                />
              )}
              {/* Dot */}
              <span
                aria-hidden
                className={`absolute left-0 top-2 grid h-[11px] w-[11px] place-items-center rounded-full border-2 ${
                  event.emphasis
                    ? "border-[var(--accent)] bg-[var(--accent)]"
                    : "border-[var(--text-tertiary)] bg-[var(--surface)]"
                }`}
              />
              <div className="pl-5">
                <div
                  className={`ts-body ${
                    event.emphasis
                      ? "font-semibold text-[var(--text-primary)]"
                      : "text-[var(--text-primary)]"
                  }`}
                >
                  {event.what}
                </div>
                {event.who && (
                  <div className="mt-0.5 ts-footnote text-[var(--text-tertiary)]">
                    {event.who}
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function readingTimelineCompletion(_payload: ReadingTimelinePayload) {
  return { complete: true, missing: [] as string[] };
}

export function emptyReadingTimelinePayload(): ReadingTimelinePayload {
  return emptyPayload("reading_timeline") as ReadingTimelinePayload;
}
