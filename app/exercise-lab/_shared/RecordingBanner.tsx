/**
 * RecordingBanner — banner contextual mientras se graba/procesa una nota de voz.
 *
 * Extraído del monolito `ExerciseLabClient.tsx` (Codex). Sin cambios.
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { VoiceRecState } from "./types";
import { WaveBars } from "./glyphs";

export function RecordingBanner({
  recState,
  recError,
}: {
  recState: VoiceRecState;
  recError: string | null;
}) {
  return (
    <AnimatePresence>
      {(recState === "recording" || recState === "processing" || recState === "error") && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="flex items-center gap-2.5 px-5 pb-2 text-[13px]"
        >
          {recState === "recording" && (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              <span className="font-medium text-[var(--text-secondary)]">Escuchando...</span>
              <WaveBars />
              <span className="ml-auto text-[12px] text-[var(--text-tertiary)]">
                Pulsa el micrófono para parar
              </span>
            </>
          )}
          {recState === "processing" && (
            <>
              <svg className="h-3.5 w-3.5 animate-spin text-[var(--accent)]" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
                <path d="M14 8C14 4.69 11.31 2 8 2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              </svg>
              <span className="font-medium text-[var(--text-secondary)]">Procesando nota...</span>
            </>
          )}
          {recState === "error" && recError && (
            <span className="text-[var(--band-b-text)]">{recError}</span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
