/**
 * AIPromptComposer · el textfield rico estilo ChatGPT con:
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
 *   value / onChange       · texto del prompt
 *   selectedModel / onSelectModel · id de modelo (controlled)
 *   attachments / onAttachmentsChange · array de adjuntos (controlled)
 *   voiceNotes / onVoiceNote · array de notas de voz; on cada nueva
 *                              transcripción se llama el callback
 *   layout                  · "default" (mt-3) o "matched" (h-full estirado)
 *   readOnly                · desactiva edición y oculta inputs interactivos
 */

"use client";

import { useLayoutEffect, useRef, useState } from "react";
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
  /** P3 · placeholder custom desde el caso · override del default. */
  placeholder?: string;
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
  placeholder: placeholderProp,
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
  // Auto-grow estilo ChatGPT/Claude:
  //   - Base: 1 línea (~46px con padding pt-4 pb-1) cuando vacío
  //   - Crece línea por línea según contenido
  //   - Cap superior: 320px · más texto = scroll interno
  //   - Al borrar texto vuelve a 1 línea automáticamente
  // Override solo cuando layout="matched" (que estira flex-1).
  const TEXT_MIN_HEIGHT = 46; // 1 línea + padding vertical
  const TEXT_MAX_HEIGHT = 320;
  const computedRows = value.trim()
    ? Math.max(1, value.split("\n").length + Math.floor(value.length / 140))
    : 1;
  const textComputedHeight = Math.min(
    TEXT_MAX_HEIGHT,
    Math.max(TEXT_MIN_HEIGHT, computedRows * 22 + 24),
  );
  const matched = layout === "matched";

  // En readOnly · auto-fit al scrollHeight real (no estimado por \n).
  // Evita el espacio muerto cuando el cálculo por líneas sobreestima
  // la altura (e.g. cuando hay wraps menos agresivos que lo previsto).
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useLayoutEffect(() => {
    if (!readOnly || matched) return;
    const ta = textareaRef.current;
    if (!ta) return;
    // Reset height para que scrollHeight refleje el contenido real
    ta.style.height = "auto";
    const fit = Math.min(TEXT_MAX_HEIGHT, Math.max(TEXT_MIN_HEIGHT, ta.scrollHeight));
    ta.style.height = `${fit}px`;
  }, [value, readOnly, matched]);

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
          ref={textareaRef}
          value={value}
          onChange={(event) => {
            if (readOnly) return;
            setSent(false);
            onChange(event.target.value);
          }}
          disabled={recState === "recording" || recState === "processing"}
          readOnly={readOnly}
          rows={matched ? 10 : 1}
          placeholder={
            placeholderProp ??
            (readOnly
              ? "Build the prompt from your inputs and selections..."
              : "Write the prompt you would send to the model...")
          }
          className={`w-full resize-none rounded-3xl bg-transparent px-5 pb-1 pt-4 ts-body leading-[1.5] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] disabled:cursor-not-allowed ${matched ? "flex-1" : ""} ${readOnly ? "cursor-default" : ""}`}
          style={matched ? { minHeight: 0, maxHeight: "none" } : { height: textComputedHeight, minHeight: TEXT_MIN_HEIGHT, maxHeight: TEXT_MAX_HEIGHT }}
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
                className="flex items-center gap-2 ts-footnote text-[var(--text-secondary)]"
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
                  aria-label="Add file or photo"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Add file or photo"
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
              className={`flex min-h-9 max-w-[240px] items-center gap-2 rounded-2xl py-1.5 pl-2.5 pr-3.5 ts-footnote text-[var(--text-secondary)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                readOnly
                  ? "cursor-default"
                  : "hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
              }`}
              aria-label={readOnly ? "Selected model" : "Model picker"}
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
                      <div className="px-3 pb-1 pt-1.5 ts-caption-2 font-semibold text-[var(--text-tertiary)]">
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
                                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left ts-subhead transition-colors ${
                                  isSelected
                                    ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                                    : "text-[var(--text-primary)] hover:bg-[var(--surface-3)]"
                                }`}
                              >
                                <BrandMark brand={model.brand} />
                                <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
                                  <span className="truncate">{model.label}</span>
                                  {model.badge && (
                                    <span className="shrink-0 ts-caption-1 text-[var(--text-tertiary)]">
                                      · {model.badge}
                                    </span>
                                  )}
                                </span>
                                <span className="flex shrink-0 items-center gap-2 text-[var(--text-tertiary)]">
                                  <span className="flex items-center gap-1">
                                    <span className="ts-caption-2 font-semibold tracking-wider">$</span>
                                    <LevelMeter value={model.price} ariaLabel="price" />
                                  </span>
                                  <span aria-hidden className="h-2 w-px bg-[var(--hairline)]" />
                                  <span className="flex items-center gap-1">
                                    <SparkGlyph />
                                    <LevelMeter value={model.intel} ariaLabel="intelligence" />
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
              disabled={!canSend || readOnly}
              onClick={() => {
                if (!readOnly) setSent(true);
              }}
              aria-label={readOnly ? "Send disabled in preview" : "Send to model"}
              className={`grid h-9 w-9 place-items-center rounded-full transition-all ${
                canSend && !readOnly
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
      <div className="mt-3 flex items-center justify-between gap-3 ts-footnote text-[var(--text-tertiary)]">
        <span>⌘ + Enter to send in the live runtime.</span>
        {sent && <span className="text-[var(--band-a-text)]">Prompt sent to preview</span>}
      </div>
    </div>
  );
}

