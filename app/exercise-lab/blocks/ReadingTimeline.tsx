"use client";

/**
 * ReadingTimeline · bloque pasivo `reading_timeline` (lab_ref 00F).
 *
 * Línea vertical con dots y eventos en orden cronológico. Para recap
 * rápido del caso o secuencia que llevó a la decisión actual.
 * Eventos via `caseContext.events`; seed por default para el lab.
 */

import { useEffect, useRef } from "react";
import { AppleTimeline } from "@/components/simulador/apple";
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
    when: "D-3",
    what: "Customer reported a conversion drop by email",
    who: "Dana Whitfield · Aurora Retail",
  },
  {
    when: "D-2",
    what: "Support escalated to marketing",
    who: "Tier 2 · Support",
  },
  {
    when: "D-1",
    what: "Manager asked for analysis using last quarter's data",
    who: "Laura Bennett · Head of Marketing",
  },
  {
    when: "Today",
    what: "You have to decide how to answer the customer before 6:00 PM",
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
  const { patch } = useStepPatch(isProduction ? sessionId : null);
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

  return <AppleTimeline events={events} />;
}

export function readingTimelineCompletion(_payload: ReadingTimelinePayload) {
  return { complete: true, missing: [] as string[] };
}

export function emptyReadingTimelinePayload(): ReadingTimelinePayload {
  return emptyPayload("reading_timeline") as ReadingTimelinePayload;
}
