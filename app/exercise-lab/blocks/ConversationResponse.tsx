"use client";

/**
 * ConversationResponse · renderer del bloque canónico `conversation_response`
 * (lab_ref 02).
 *
 * Thread de mensajes previos visible + composer al final para que el
 * participante redacte el siguiente turno. Mide cómo ajusta su respuesta
 * al contexto ya visible (cliente, manager, soporte).
 *
 * Variantes (caseContext.channel): email · chat · ticket.
 *
 * Sin hint interno · el shell tiene eyebrow + title + body.
 */

import { useRef, useState } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
  PromptAttachment,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import { AIPromptComposer } from "../_shared/AIPromptComposer";
import { defaultModelId } from "../_shared/models";

type ConversationResponsePayload = Extract<
  ExerciseResponsePayload,
  { block_id: "conversation_response" }
>;

type Channel = "email" | "chat" | "ticket";

interface ThreadMessage {
  id: string;
  from: { name: string; role?: string };
  timestamp: string;
  body: string;
  isCustomer?: boolean;
}

interface ThreadConfig {
  channel: Channel;
  subject?: string;
  messages: ThreadMessage[];
}

const DEFAULT_THREAD: ThreadConfig = {
  channel: "email",
  subject: "Necesitamos relanzar la campaña antes del viernes",
  messages: [
    {
      id: "m1",
      from: { name: "Mariana Robles", role: "Head of Growth · Aurora Retail" },
      timestamp: "Lunes 09:42",
      body: "Hola, el board pidió relanzar la campaña de retención antes del viernes. Presupuesto sin tocar. Mándame propuesta hoy con segmentos, mensaje base y métricas que vas a monitorear.\n\nGracias.",
      isCustomer: true,
    },
    {
      id: "m2",
      from: { name: "Tú", role: "Marketing Lead" },
      timestamp: "Lunes 10:18",
      body: "Hola Mariana, gracias por el detalle. ¿Puedes confirmar dos cosas antes de avanzar?\n\n1. ¿La campaña anterior se pausó por bajo desempeño o por timing?\n2. ¿Tenemos resultados de la prueba de retención del mes pasado?",
    },
    {
      id: "m3",
      from: { name: "Mariana Robles", role: "Head of Growth · Aurora Retail" },
      timestamp: "Lunes 11:05",
      body: "La pausa fue por timing (cierre fiscal). La prueba del mes pasado dio 14% de reactivación en el segmento medio, pero el mensaje generaba quejas de tono. Necesitamos algo más suave esta vez.",
      isCustomer: true,
    },
  ],
};

interface Props extends ExerciseRendererProps<ConversationResponsePayload> {
  thread?: ThreadConfig;
  sessionId?: string | null;
}

export function ConversationResponse({
  payload,
  onChange,
  onPatch,
  slideId = "conversation_response",
  mode = "lab_demo",
  sessionId = null,
  caseContext,
  thread: threadProp,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);
  const [voiceNotes, setVoiceNotes] = useState<string[]>([]);

  const thread =
    threadProp ?? (caseContext?.thread as ThreadConfig | undefined) ?? DEFAULT_THREAD;

  function persist(next: ConversationResponsePayload) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:conversation_response:${slideId}`, next, {
        time_to_first_action_ms:
          (firstActionAt.current ?? Date.now()) - mountedAt.current,
        total_changes: totalChanges.current,
        final_payload_bytes: JSON.stringify(next).length,
      });
    }
    onPatch?.(next);
  }

  return (
    <div className="space-y-5">
      {/* Thread · mensajes previos como burbujas en orden cronológico */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--hairline)] px-4 py-2.5 ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          <span>{channelLabel(thread.channel)}</span>
          {thread.subject && (
            <span className="ts-caption-1 text-[var(--text-secondary)] normal-case tracking-normal">
              {thread.subject}
            </span>
          )}
        </div>
        <div className="space-y-3 p-4">
          {thread.messages.map((msg) => (
            <Bubble key={msg.id} message={msg} />
          ))}
        </div>
      </div>

      {/* Composer al final · turno del participante */}
      <div>
        <div className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          Tu respuesta
        </div>
        <div className="mt-2">
          <AIPromptComposer
            value={payload.response_text}
            onChange={(value) =>
              persist({ ...payload, response_text: value })
            }
            selectedModel={payload.model || defaultModelId}
            onSelectModel={(value) => persist({ ...payload, model: value })}
            voiceNotes={voiceNotes}
            onVoiceNote={(note) => setVoiceNotes([...voiceNotes, note])}
            attachments={payload.attachments}
            onAttachmentsChange={(next: PromptAttachment[]) =>
              persist({ ...payload, attachments: next })
            }
          />
        </div>
      </div>
    </div>
  );
}

function Bubble({ message }: { message: ThreadMessage }) {
  const isCustomer = message.isCustomer ?? false;
  return (
    <div className={`flex gap-3 ${isCustomer ? "" : "flex-row-reverse"}`}>
      <div
        className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full ts-caption-1 font-semibold ${
          isCustomer
            ? "bg-[var(--surface-2)] text-[var(--text-secondary)]"
            : "bg-[var(--accent)] text-white"
        }`}
        aria-hidden
      >
        {initials(message.from.name)}
      </div>
      <div
        className={`max-w-[80%] rounded-[var(--radius-lg)] p-3 ${
          isCustomer
            ? "bg-[var(--surface-2)]"
            : "bg-[var(--accent-soft)]"
        }`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="ts-caption-1 font-medium text-[var(--text-primary)]">
            {message.from.name}
          </span>
          <span className="ts-caption-2 text-[var(--text-tertiary)] tabular-nums">
            {message.timestamp}
          </span>
        </div>
        {message.from.role && (
          <div className="ts-caption-2 text-[var(--text-tertiary)]">
            {message.from.role}
          </div>
        )}
        <div className="mt-2 ts-subhead leading-[1.55] text-[var(--text-primary)] whitespace-pre-wrap">
          {message.body}
        </div>
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

export function conversationResponseCompletion(
  payload: ConversationResponsePayload,
) {
  const missing: string[] = [];
  if (payload.response_text.trim().length < 20) missing.push("response_text");
  if (payload.model.trim().length === 0) missing.push("model");
  return { complete: missing.length === 0, missing };
}

export function emptyConversationResponsePayload(): ConversationResponsePayload {
  return emptyPayload("conversation_response") as ConversationResponsePayload;
}
