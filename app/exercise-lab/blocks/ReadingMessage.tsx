"use client";

/**
 * ReadingMessage · bloque pasivo `reading_message` (lab_ref 00B).
 *
 * Renderea email/chat/ticket card con avatar, from/to, timestamp y body.
 * Útil para mostrar el mensaje que dispara el caso (cliente, manager,
 * stakeholder). El contenido real viene en `caseContext.message`; aquí
 * hay seed por default para que se vea en el lab.
 */

import { useEffect, useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type ReadingMessagePayload = Extract<
  ExerciseResponsePayload,
  { block_id: "reading_message" }
>;

type Channel = "email" | "chat" | "ticket";

interface MessageContent {
  channel: Channel;
  from: { name: string; role?: string; avatar?: string };
  to?: { name: string; role?: string };
  timestamp: string;
  subject?: string;
  body: string;
}

const DEFAULT_MESSAGE: MessageContent = {
  channel: "email",
  from: {
    name: "Mariana Robles",
    role: "Head of Growth · Aurora Retail",
  },
  to: { name: "Tú", role: "Marketing Lead" },
  timestamp: "Hoy, 09:42",
  subject: "Necesitamos relanzar la campaña antes del viernes",
  body: "Hola, el board pidió relanzar la campaña de retención antes del viernes. **Presupuesto sin tocar**. Mándame propuesta hoy mismo con segmentos, mensaje base y métricas que vas a monitorear.\n\nGracias.",
};

interface Props extends ExerciseRendererProps<ReadingMessagePayload> {
  sessionId?: string | null;
}

export function ReadingMessage({
  payload,
  onChange,
  onPatch,
  slideId = "reading_message",
  mode = "lab_demo",
  sessionId = null,
  caseContext,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());

  const message =
    (caseContext?.message as MessageContent | undefined) ?? DEFAULT_MESSAGE;

  useEffect(() => {
    if (!payload.acknowledged) {
      const next: ReadingMessagePayload = { ...payload, acknowledged: true };
      onChange(next);
      if (isProduction && sessionId) {
        patch(`block:reading_message:${slideId}`, next, {
          time_to_read_ms: Date.now() - mountedAt.current,
        });
      }
      onPatch?.(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
      {/* Header del mensaje · canal + timestamp */}
      <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-3">
        <span className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          {channelLabel(message.channel)}
        </span>
        <span className="ts-caption-1 text-[var(--text-tertiary)] tabular-nums">
          {message.timestamp}
        </span>
      </div>

      {/* From / To · avatar + nombres */}
      <div className="mt-4 flex items-start gap-3">
        <div
          className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] ts-callout font-semibold text-[var(--accent)]"
          aria-hidden
        >
          {initials(message.from.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="ts-body font-medium text-[var(--text-primary)]">
              {message.from.name}
            </span>
            {message.from.role && (
              <span className="ts-caption-1 text-[var(--text-tertiary)]">
                · {message.from.role}
              </span>
            )}
          </div>
          {message.to && (
            <div className="mt-0.5 ts-caption-1 text-[var(--text-tertiary)]">
              Para: {message.to.name}
              {message.to.role && ` · ${message.to.role}`}
            </div>
          )}
        </div>
      </div>

      {/* Subject (opcional, solo email/ticket) */}
      {message.subject && (
        <div className="mt-4 ts-callout font-semibold text-[var(--text-primary)]">
          {message.subject}
        </div>
      )}

      {/* Body del mensaje */}
      <div className="mt-3 ts-body leading-[1.6] text-[var(--text-secondary)] whitespace-pre-wrap">
        {renderInlineBold(message.body)}
      </div>
    </div>
  );
}

function channelLabel(channel: Channel): string {
  switch (channel) {
    case "email":
      return "Email";
    case "chat":
      return "Chat";
    case "ticket":
      return "Ticket";
  }
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Render mini-markdown inline: solo soporta **bold** dentro del whitespace-pre-wrap.
// Para markdown completo del body usar <SlideBody>; aquí queremos preservar saltos
// de línea originales del mensaje.
function renderInlineBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={i}
          className="font-semibold text-[var(--text-primary)]"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function readingMessageCompletion(_payload: ReadingMessagePayload) {
  return { complete: true, missing: [] as string[] };
}

export function emptyReadingMessagePayload(): ReadingMessagePayload {
  return emptyPayload("reading_message") as ReadingMessagePayload;
}
