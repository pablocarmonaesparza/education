/**
 * MicButton · botón de mic con estados (idle / recording / processing).
 *
 * Extraído del monolito `ExerciseLabClient.tsx` (Codex). Sin cambios.
 */

"use client";

import type { VoiceRecState } from "./types";
import { MicGlyph } from "./glyphs";

export function MicButton({
  recState,
  disabled,
  onClick,
}: {
  recState: VoiceRecState;
  disabled: boolean;
  onClick: () => void;
}) {
  const isRecording = recState === "recording";
  const isProcessing = recState === "processing";
  const label =
    recState === "recording"
      ? "Stop recording"
      : recState === "processing"
        ? "Processing voice note"
        : "Dictate by voice";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isProcessing}
      aria-label={label}
      aria-pressed={isRecording}
      className={`relative grid h-9 w-9 place-items-center rounded-full transition-colors disabled:opacity-40 ${
        isRecording
          ? "bg-red-500/15 text-red-500"
          : "text-[var(--text-tertiary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
      }`}
    >
      {isRecording && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-red-500/30" />}
      {isProcessing ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
          <path d="M14 8C14 4.69 11.31 2 8 2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        </svg>
      ) : isRecording ? (
        <span className="relative h-2.5 w-2.5 rounded-[var(--radius-xs)] bg-current" />
      ) : (
        <MicGlyph />
      )}
    </button>
  );
}
