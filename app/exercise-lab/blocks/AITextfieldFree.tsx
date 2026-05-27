"use client";

/**
 * AITextfieldFree · renderer del bloque canónico `ai_textfield_free` (lab_ref 01A).
 *
 * Patrón: textfield libre estilo ChatGPT (composer rico) con:
 *   - dropdown de modelos agrupados (interno / convencional / chinos) con
 *     badges, $ y meter de inteligencia
 *   - adjuntos (archivos + imágenes)
 *   - botón mic con grabación + transcripción
 *   - notas de voz transcritas visibles
 *
 * Visual restaurado desde el monolito ExerciseLabClient.tsx (Codex). El
 * composer rico vive en _shared/AIPromptComposer.tsx; este renderer solo
 * cablea el payload del registry con sus props.
 *
 * Contrato: ExerciseRendererProps<AITextfieldFreePayload>. Cumple no-prefill
 * (prompt + model + attachments + voice_notes arrancan vacíos en el payload).
 */

import { useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
  PromptAttachment,
  VoiceNote,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";
import { AIPromptComposer } from "../_shared/AIPromptComposer";
import { defaultModelId } from "../_shared/models";

type AITextfieldFreePayload = Extract<
  ExerciseResponsePayload,
  { block_id: "ai_textfield_free" }
>;

interface Props extends ExerciseRendererProps<AITextfieldFreePayload> {
  sessionId?: string | null;
}

export function AITextfieldFree({
  payload,
  onChange,
  onPatch,
  slideId = "ai_textfield_free",
  mode = "lab_demo",
  sessionId = null,
  caseContext,
}: Props) {
  // P3 · personalization knobs · el caso puede pasar model + placeholder
  // por caseContext en vez de quedarse con defaults del bloque.
  const contextModel =
    typeof caseContext?.model === "string" ? caseContext.model : undefined;
  const contextPlaceholder =
    typeof caseContext?.placeholder === "string"
      ? caseContext.placeholder
      : undefined;
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());
  const firstActionAt = useRef<number | null>(null);
  const totalChanges = useRef(0);

  // El composer puede arrancar con model="" del emptyPayload; le pasamos
  // primero el modelo del caso (si lo pasó), luego el del payload, luego
  // el default global · sin tocar el payload · sólo presentación.
  const displayedModel = payload.model || contextModel || defaultModelId;

  function update(next: AITextfieldFreePayload) {
    if (firstActionAt.current === null) firstActionAt.current = Date.now();
    totalChanges.current += 1;
    onChange(next);
    if (isProduction && sessionId) {
      patch(`block:ai_textfield_free:${slideId}`, next, {
        time_to_first_action_ms:
          (firstActionAt.current ?? Date.now()) - mountedAt.current,
        total_changes: totalChanges.current,
        final_payload_bytes: JSON.stringify(next).length,
      });
    }
    onPatch?.(next);
  }

  function setPromptText(prompt_text: string) {
    update({ ...payload, prompt_text });
  }

  function setModel(model: string) {
    update({ ...payload, model });
  }

  function setAttachments(attachments: PromptAttachment[]) {
    update({ ...payload, attachments });
  }

  function addVoiceNote(note: string) {
    const voiceNote: VoiceNote = {
      id: `${Date.now()}-${payload.voice_notes.length}`,
      text: note,
      duration_ms: 0,
    };
    update({ ...payload, voice_notes: [...payload.voice_notes, voiceNote] });
  }

  // Mapeamos VoiceNote[] → string[] para el composer (que tipa notas como string)
  const voiceNoteStrings = payload.voice_notes.map((vn) => vn.text);

  return (
    <div className="simulador-root">
      <AIPromptComposer
        value={payload.prompt_text}
        onChange={setPromptText}
        selectedModel={displayedModel}
        onSelectModel={setModel}
        voiceNotes={voiceNoteStrings}
        onVoiceNote={addVoiceNote}
        attachments={payload.attachments}
        onAttachmentsChange={setAttachments}
        placeholder={contextPlaceholder}
      />
    </div>
  );
}

export function aiTextfieldFreeCompletion(payload: AITextfieldFreePayload) {
  const missing: string[] = [];
  if (payload.prompt_text.trim().length < 20) missing.push("prompt_text");
  if (payload.model.trim().length === 0) missing.push("model");
  return { complete: missing.length === 0, missing };
}

export function emptyAITextfieldFreePayload(): AITextfieldFreePayload {
  return emptyPayload("ai_textfield_free") as AITextfieldFreePayload;
}
