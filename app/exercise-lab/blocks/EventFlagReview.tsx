"use client";

/**
 * EventFlagReview · bloque canónico `event_flag_review` (lab_ref 04A).
 *
 * Tabla por evento con dropdown riesgo/normal/escalar. Mide validación
 * + detección de incidentes en logs de corrida. Reemplaza al viejo
 * run_log_review (v0.7.0).
 */

import { useEffect, useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import { ActionTable } from "./DataTableTriage";

type EventFlagReviewPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "event_flag_review" }
>;

type EventAction = "riesgo" | "normal" | "escalar";

interface EventSpec {
  id: string;
  label: string;
  detail?: string;
  hint?: string;
}

const DEFAULT_EVENTS: EventSpec[] = [
  { id: "evt1", label: "09:42 · Login OK", detail: "user@aurora.example", hint: "Evento de rutina." },
  { id: "evt2", label: "09:45 · Retry loop x12 al endpoint /sync", detail: "duración 4.2s", hint: "Comportamiento anómalo." },
  { id: "evt3", label: "09:47 · Información personal exportada a logs", detail: "email + teléfono", hint: "Riesgo de filtración." },
  { id: "evt4", label: "09:50 · Acción ejecutada sin métrica", detail: "send_email", hint: "Falta validación previa." },
  { id: "evt5", label: "09:53 · Health check OK", detail: "200 OK", hint: "Evento de rutina." },
];

const ACTION_LABELS: Record<EventAction, string> = {
  riesgo: "Marcar riesgo",
  normal: "Marcar normal",
  escalar: "Escalar",
};

const ACTIONS: EventAction[] = ["riesgo", "normal", "escalar"];

interface Props extends ExerciseRendererProps<EventFlagReviewPayload> {
  events?: EventSpec[];
  sessionId?: string | null;
}

export function EventFlagReview({
  payload,
  onChange,
  onPatch,
  slideId = "event_flag_review",
  mode = "lab_demo",
  sessionId = null,
  events = DEFAULT_EVENTS,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  useEffect(() => {
    if (payload.event_actions.length === 0 && events.length > 0) {
      onChange({
        ...payload,
        event_actions: events.map((e) => ({ event_id: e.id, action: null })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(eventId: string, action: EventAction) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    const next: EventFlagReviewPayload = {
      ...payload,
      event_actions: payload.event_actions.map((e) =>
        e.event_id === eventId ? { ...e, action } : e,
      ),
    };
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:event_flag_review:${slideId}`, next, {
        time_to_first_action_ms:
          (firstActionAt.current ?? Date.now()) - mountedAt.current,
        total_changes: totalChanges.current,
        final_payload_bytes: JSON.stringify(next).length,
      });
    }
    onPatch?.(next);
  }

  return (
    <ActionTable
      rows={events.map((e) => ({
        id: e.id,
        label: e.label,
        example: e.detail,
        hint: e.hint,
        action: payload.event_actions.find((a) => a.event_id === e.id)?.action ?? null,
      }))}
      actions={ACTIONS.map((a) => ({ value: a, label: ACTION_LABELS[a] }))}
      onSelect={(rowId, value) => update(rowId, value as EventAction)}
      actionStyle="severity"
    />
  );
}

export function eventFlagReviewCompletion(payload: EventFlagReviewPayload) {
  if (payload.event_actions.length === 0) {
    return { complete: false, missing: ["event_actions"] };
  }
  const missing = payload.event_actions
    .filter((e) => e.action === null)
    .map((e) => e.event_id);
  return { complete: missing.length === 0, missing };
}

export function emptyEventFlagReviewPayload(): EventFlagReviewPayload {
  return emptyPayload("event_flag_review") as EventFlagReviewPayload;
}
