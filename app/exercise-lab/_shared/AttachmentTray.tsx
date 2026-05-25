/**
 * AttachmentTray · chips de adjuntos con botón de quitar.
 *
 * Extraído del monolito `ExerciseLabClient.tsx` (Codex). Sin cambios.
 */

"use client";

import type { PromptAttachment } from "./types";
import { AttachmentGlyph, formatFileSize } from "./glyphs";

export function AttachmentTray({
  attachments,
  onRemove,
}: {
  attachments: PromptAttachment[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="mx-3 mb-3 grid gap-2 rounded-2xl bg-[var(--surface-2)] p-3">
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
        Adjuntos para analizar
      </div>
      <div className="grid gap-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="grid min-h-10 grid-cols-[28px_1fr_28px] items-center gap-2 rounded-xl border border-[var(--hairline)] bg-[var(--surface)] px-2.5 py-2"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <AttachmentGlyph type={attachment.type} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-medium text-[var(--text-primary)]">
                {attachment.name}
              </span>
              <span className="block text-[11px] text-[var(--text-tertiary)]">
                Simulado · {formatFileSize(attachment.size)}
              </span>
            </span>
            <button
              type="button"
              onClick={() => onRemove(attachment.id)}
              aria-label={`Quitar ${attachment.name}`}
              className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.7"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
