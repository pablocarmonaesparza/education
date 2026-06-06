"use client";

import { cn } from "./utils";

export type AppleFileKind =
  | "pdf"
  | "docx"
  | "xlsx"
  | "csv"
  | "image"
  | "presentation"
  | "other";

export interface AppleAttachmentCardProps {
  name: string;
  size: string;
  kind: AppleFileKind;
  description?: string;
  className?: string;
}

/**
 * AppleAttachmentCard — tarjeta de archivo adjunto estilo email (icono + nombre
 * + descripción + peso). Extraída del bloque reading_attachment; el bloque la
 * consume. Hereda los tokens de color del ancestro `.simulador-root`.
 */
export function AppleAttachmentCard({
  name,
  size,
  kind,
  description,
  className,
}: AppleAttachmentCardProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3",
        className,
      )}
    >
      <div
        className="grid h-11 w-11 place-items-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)]"
        aria-hidden
      >
        <FileGlyph kind={kind} />
      </div>
      <div className="min-w-0">
        <div className="ts-body font-medium text-[var(--text-primary)] truncate">{name}</div>
        {description && (
          <div className="mt-0.5 ts-footnote text-[var(--text-tertiary)] line-clamp-1">
            {description}
          </div>
        )}
      </div>
      <div className="ts-caption-1 tabular-nums text-[var(--text-tertiary)]">{size}</div>
    </div>
  );
}

function FileGlyph({ kind }: { kind: AppleFileKind }) {
  const label = labelFor(kind);
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3H14L19 8V20C19 20.55 18.55 21 18 21H7C6.45 21 6 20.55 6 20V4C6 3.45 6.45 3 7 3Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path d="M14 3V8H19" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
      <text
        x="12.5"
        y="17.5"
        textAnchor="middle"
        className="font-semibold"
        style={{ fontSize: 5.2, fill: "currentColor" }}
      >
        {label}
      </text>
    </svg>
  );
}

function labelFor(kind: AppleFileKind): string {
  switch (kind) {
    case "pdf":
      return "PDF";
    case "docx":
      return "DOC";
    case "xlsx":
      return "XLS";
    case "csv":
      return "CSV";
    case "image":
      return "IMG";
    case "presentation":
      return "PPT";
    case "other":
    default:
      return "FILE";
  }
}
