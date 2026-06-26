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
import { AppleMessageCard } from "@/components/simulador/apple";
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
  const { patch } = useStepPatch(isProduction ? sessionId : null);
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
    <AppleMessageCard
      channel={message.channel}
      from={message.from}
      to={message.to}
      timestamp={message.timestamp}
      subject={message.subject}
      body={message.body}
    />
  );
}

export function readingMessageCompletion(_payload: ReadingMessagePayload) {
  return { complete: true, missing: [] as string[] };
}

export function emptyReadingMessagePayload(): ReadingMessagePayload {
  return emptyPayload("reading_message") as ReadingMessagePayload;
}
