"use client";

/**
 * ConversationResponse · renderer del bloque canónico `conversation_response`
 * (lab_ref 02).
 *
 * Thread de turnos previos con un modelo de IA + composer al final
 * para que el participante escriba el SIGUIENTE prompt. Mide cómo
 * itera con el modelo a partir del contexto ya visible (cómo
 * reformula, qué falta pedir, qué corregir del output anterior).
 *
 * NO es respuesta a humano (cliente/manager) · ESO ya está cubierto
 * implícitamente en otros bloques. Aquí lo que se mide es el
 * "siguiente turno con la IA" en un contexto operativo real.
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
import { BrandMark } from "../_shared/glyphs";
import { defaultModelId, findModelById } from "../_shared/models";
import type { BrandKey } from "../_shared/types";

type ConversationResponsePayload = Extract<
  ExerciseResponsePayload,
  { block_id: "conversation_response" }
>;

type Turn = "user" | "assistant";

interface ThreadMessage {
  id: string;
  turn: Turn;
  body: string;
}

interface ThreadConfig {
  modelId: string;
  messages: ThreadMessage[];
}

const DEFAULT_THREAD: ThreadConfig = {
  modelId: "claude-sonnet-4.6",
  messages: [
    {
      id: "m1",
      turn: "user",
      body: "Necesito reactivar cuentas que llevan 60+ días sin uso. Ayúdame con tres ángulos de mensaje para campaña de email, sin tono agresivo.",
    },
    {
      id: "m2",
      turn: "assistant",
      body: "Tres ángulos posibles:\n\n1. **Recuperar tiempo perdido**: enfocado en lo que han dejado de aprovechar (módulos no usados, reportes pendientes).\n2. **Novedades desde tu última visita**: lista corta de mejoras del producto en los últimos 60 días.\n3. **Check-in personal**: pregunta abierta sobre qué los frenó, con CTA a una llamada de 15 min.\n\n¿Quieres que profundice en alguno o necesitas variaciones de tono?",
    },
    {
      id: "m3",
      turn: "user",
      body: "El #1 me gusta pero suena culpabilizador. ¿Puedes reformularlo más neutral, enfocado en el valor que pueden recuperar?",
    },
    {
      id: "m4",
      turn: "assistant",
      body: "Reformulado: **\"Recuperar el valor de tu cuenta\"**.\n\nEjemplo de asunto: *\"3 módulos que aún no has activado\"*.\n\nCuerpo corto centrado en oportunidad, no en pérdida. Cierro con un solo llamado a la acción: agendar una llamada o activar el módulo directamente desde el correo.",
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
  const threadModel = findModelById(thread.modelId);

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
      {/* Thread · turnos previos con la IA */}
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-2 border-b border-[var(--hairline)] px-4 py-2.5 ts-caption-1 font-medium text-[var(--text-tertiary)]">
          <BrandMark brand={threadModel.brand} />
          <span className="text-[var(--text-secondary)]">
            Conversación con{" "}
            <span className="text-[var(--text-primary)]">
              {threadModel.label}
            </span>
            {threadModel.badge && (
              <span className="ml-1 text-[var(--text-tertiary)]">
                · {threadModel.badge}
              </span>
            )}
          </span>
        </div>
        <div className="space-y-3 p-4">
          {thread.messages.map((msg) => (
            <Bubble
              key={msg.id}
              message={msg}
              modelBrand={threadModel.brand}
            />
          ))}
        </div>
      </div>

      {/* Composer al final · siguiente turno del participante */}
      <div>
        <div className="ts-caption-1 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          Tu siguiente prompt
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

function Bubble({
  message,
  modelBrand,
}: {
  message: ThreadMessage;
  modelBrand: BrandKey;
}) {
  const isAssistant = message.turn === "assistant";
  return (
    <div className={`flex gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}>
      {isAssistant ? (
        <BrandMark brand={modelBrand} />
      ) : (
        <div
          className="grid h-[22px] w-[22px] flex-shrink-0 place-items-center rounded-md bg-[var(--accent)] ts-caption-2 font-semibold text-white"
          aria-hidden
        >
          Tú
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-[var(--radius-lg)] p-3 ${
          isAssistant ? "bg-[var(--surface-2)]" : "bg-[var(--accent-soft)]"
        }`}
      >
        <div className="ts-caption-2 font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
          {isAssistant ? "IA" : "Tú"}
        </div>
        <div className="mt-1 ts-subhead leading-[1.55] text-[var(--text-primary)] whitespace-pre-wrap">
          {message.body}
        </div>
      </div>
    </div>
  );
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
