/**
 * AIPromptComposer — el textfield rico estilo ChatGPT con:
 *   - dropdown de modelos agrupados (con badges, $ y meter de inteligencia)
 *   - botón de adjuntos (archivos/imágenes)
 *   - botón de mic con grabación en vivo + transcripción
 *   - banner de grabación con waveform
 *   - tray de adjuntos
 *   - lista de notas de voz transcritas
 *   - botón enviar con estados (disabled hasta que haya texto o adjuntos)
 *
 * Extraído del monolito `ExerciseLabClient.tsx` (Codex). Sin cambios visuales.
 *
 * Props:
 *   value / onChange       — texto del prompt
 *   selectedModel / onSelectModel — id de modelo (controlled)
 *   attachments / onAttachmentsChange — array de adjuntos (controlled)
 *   voiceNotes / onVoiceNote — array de notas de voz; on cada nueva
 *                              transcripción se llama el callback
 *   layout                  — "default" (mt-3) o "matched" (h-full estirado)
 *   readOnly                — desactiva edición y oculta inputs interactivos
 */

"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PromptAttachment } from "./types";
import { findModelById, modelGroups } from "./models";
import { BrandMark, LevelMeter, MicGlyph, SparkGlyph, PlusGlyph } from "./glyphs";
import { useDemoVoiceCapture } from "./use-demo-voice-capture";
import { MicButton } from "./MicButton";
import { RecordingBanner } from "./RecordingBanner";
import { AttachmentTray } from "./AttachmentTray";

interface AIPromptComposerProps {
  value: string;
  onChange: (value: string) => void;
  selectedModel: string;
  onSelectModel: (value: string) => void;
  voiceNotes: string[];
  onVoiceNote: (note: string) => void;
  attachments?: PromptAttachment[];
  onAttachmentsChange?: (next: PromptAttachment[]) => void;
  layout?: "default" | "matched";
  readOnly?: boolean;
}

export function AIPromptComposer({
  value,
  onChange,
  selectedModel,
  onSelectModel,
  voiceNotes,
  onVoiceNote,
  attachments: attachmentsProp,
  onAttachmentsChange,
  layout = "default",
  readOnly = false,
}: AIPromptComposerProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [internalAttachments, setInternalAttachments] = useState<PromptAttachment[]>([]);
  // Si el caller pasa attachments controlados, los usamos. Si no, internos.
  const attachments = attachmentsProp ?? internalAttachments;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentModel = findModelById(selectedModel);
  const { recState, recError, onMicClick } = useDemoVoiceCapture({
    onVoiceNote,
    onTranscript: (text) => {
      const separator = value.trim().length > 0 ? "\n\n" : "";
      onChange(`${value}${separator}${text}`);
    },
  });
  const canSend =
    (value.trim().length > 0 || attachments.length > 0) &&
    recState !== "recording" &&
    recState !== "processing";
  // Textarea de altura FIJA (no auto-grow) — evita que el bloque baile
  // mientras se escribe. Si el contenido supera la altura, scroll interno.
  // Override solo cuando layout="matched" (que estira flex-1).
  const textRows = 6;
  const textFixedHeight = 180;
  const matched = layout === "matched";

  function commitAttachments(next: PromptAttachment[]) {
    if (onAttachmentsChange) {
      onAttachmentsChange(next);
    } else {
      setInternalAttachments(next);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const nextAttachments = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setSent(false);
    commitAttachments([...attachments, ...nextAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeAttachment(id: string) {
    setSent(false);
    commitAttachments(attachments.filter((attachment) => attachment.id !== id));
  }

  return (
    <div className={matched ? "h-full min-h-[430px]" : "mt-3"}>
      <div
        className={`relative overflow-visible rounded-3xl border border-[var(--border)] transition-colors ${
          readOnly ? "bg-[var(--surface-2)]" : "bg-[var(--surface)] focus-within:border-[var(--accent)]"
        } ${matched ? "flex h-full min-h-[430px] flex-col" : ""}`}
        style={{
          boxShadow: "0 1px 2px var(--shadow), 0 10px 32px -22px var(--shadow)",
        }}
      >
        <textarea
          value={value}
          onChange={(event) => {
            if (readOnly) return;
            setSent(false);
            onChange(event.target.value);
          }}
          disabled={recState === "recording" || recState === "processing"}
          readOnly={readOnly}
          rows={matched ? 10 : textRows}
          placeholder={readOnly ? "Crea el prompt desde Inputs y selección..." : "Escribe el prompt que le mandarías al modelo..."}
          className={`w-full resize-none rounded-3xl bg-transparent px-5 pb-1 pt-4 text-[15px] leading-[1.5] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] disabled:cursor-not-allowed ${matched ? "flex-1" : ""} ${readOnly ? "cursor-default" : ""}`}
          style={matched ? { minHeight: 0, maxHeight: "none" } : { height: textFixedHeight, minHeight: textFixedHeight, maxHeight: textFixedHeight }}
        />

        <RecordingBanner recState={recState} recError={recError} />

        {attachments.length > 0 && (
          <AttachmentTray attachments={attachments} onRemove={removeAttachment} />
        )}

        {voiceNotes.length > 0 && (
          <div className="mx-3 mb-3 grid gap-2 rounded-2xl bg-[var(--surface-2)] p-3">
            {voiceNotes.map((note, index) => (
              <div
                key={`${note}-${index}`}
                className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]"
              >
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-[var(--surface)] text-[var(--accent)]">
                  <MicGlyph />
                </span>
                <span className="line-clamp-1">{note}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 px-3 pb-3">
          <div className="relative flex items-center gap-1">
            {!readOnly && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.csv,.xlsx,.xls,.doc,.docx,.txt,.md"
                  className="sr-only"
                  onChange={(event) => handleFiles(event.target.files)}
                  aria-label="Agregar archivo o foto"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Agregar archivo o foto"
                  className={`grid h-9 w-9 place-items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                    attachments.length > 0
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--surface-3)]"
                      : "text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <PlusGlyph />
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                if (!readOnly) setDropdownOpen((open) => !open);
              }}
              className={`flex min-h-9 max-w-[240px] items-center gap-2 rounded-2xl py-1.5 pl-2.5 pr-3.5 text-[12px] text-[var(--text-secondary)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                readOnly
                  ? "cursor-default"
                  : "hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
              }`}
              aria-label={readOnly ? "Modelo seleccionado" : "Selector de modelo"}
              aria-expanded={readOnly ? undefined : dropdownOpen}
            >
              <BrandMark brand={currentModel.brand} />
              <span className="min-w-0 truncate">
                {currentModel.label}
                {currentModel.badge && (
                  <span className="ml-1 text-[var(--text-tertiary)]">· {currentModel.badge}</span>
                )}
              </span>
              {!readOnly && (
                <svg
                  className={`h-3 w-3 shrink-0 opacity-60 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                  />
                </svg>
              )}
            </button>

            <AnimatePresence>
              {dropdownOpen && !readOnly && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute bottom-full left-0 z-50 mb-2 max-h-[54vh] w-[300px] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-2 scrollbar-thin"
                  style={{
                    boxShadow: "0 12px 32px -8px var(--shadow), 0 2px 6px var(--shadow)",
                  }}
                >
                  {modelGroups.map((group, groupIndex) => (
                    <div key={group.title}>
                      {groupIndex > 0 && <div className="mx-3 my-1.5 h-px bg-[var(--hairline)]" />}
                      <div className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
                        {group.title}
                      </div>
                      {group.families.map((family, familyIndex) => (
                        <div key={`${group.title}-${familyIndex}`}>
                          {familyIndex > 0 && (
                            <div className="mx-3 my-1 h-px bg-[var(--hairline)] opacity-60" />
                          )}
                          {family.map((model) => {
                            const isSelected = model.id === selectedModel;
                            return (
                              <button
                                key={model.id}
                                type="button"
                                onClick={() => {
                                  onSelectModel(model.id);
                                  setSent(false);
                                  setDropdownOpen(false);
                                }}
                                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors ${
                                  isSelected
                                    ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                                    : "text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
                                }`}
                              >
                                <BrandMark brand={model.brand} />
                                <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
                                  <span className="truncate">{model.label}</span>
                                  {model.badge && (
                                    <span className="shrink-0 text-[11px] text-[var(--text-tertiary)]">
                                      · {model.badge}
                                    </span>
                                  )}
                                </span>
                                <span className="flex shrink-0 items-center gap-2 text-[var(--text-tertiary)]">
                                  <span className="flex items-center gap-1">
                                    <span className="text-[9px] font-semibold tracking-wider">$</span>
                                    <LevelMeter value={model.price} ariaLabel="precio" />
                                  </span>
                                  <span aria-hidden className="h-2 w-px bg-[var(--hairline)]" />
                                  <span className="flex items-center gap-1">
                                    <SparkGlyph />
                                    <LevelMeter value={model.intel} ariaLabel="inteligencia" />
                                  </span>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1.5">
            {!readOnly && <MicButton recState={recState} disabled={false} onClick={onMicClick} />}
            <button
              type="button"
              disabled={!canSend}
              onClick={() => setSent(true)}
              aria-label="Enviar al modelo"
              className={`grid h-9 w-9 place-items-center rounded-full transition-all ${
                canSend
                  ? "accent-bg text-white hover:opacity-90 active:scale-95"
                  : "bg-[var(--surface-3)] text-[var(--text-disabled)] cursor-not-allowed"
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-[12px] text-[var(--text-tertiary)]">
        <span>⌘ + Enter para enviar en el runtime real.</span>
        {sent && <span className="text-[var(--band-a-text)]">Prompt enviado al preview</span>}
      </div>
    </div>
  );
}

