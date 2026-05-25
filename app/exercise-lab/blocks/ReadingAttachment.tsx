"use client";

/**
 * ReadingAttachment · bloque pasivo `reading_attachment` (lab_ref 00G).
 *
 * Cards de archivo adjunto con icono, nombre, peso y descripción opcional.
 * Estilo email attachment. Para contratos PDF, briefs DOCX, presentaciones.
 * Lista vía `caseContext.attachments`; seed por default para el lab.
 */

import { useEffect, useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type ReadingAttachmentPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "reading_attachment" }
>;

type FileKind = "pdf" | "docx" | "xlsx" | "csv" | "image" | "presentation" | "other";

interface AttachmentItem {
  name: string;
  size: string;
  kind: FileKind;
  description?: string;
}

const DEFAULT_ATTACHMENTS: AttachmentItem[] = [
  {
    name: "Contrato_Aurora_2026.pdf",
    size: "1.2 MB",
    kind: "pdf",
    description: "Versión firmada del MSA con cláusula de SLA actualizada.",
  },
  {
    name: "Brief_Campaña_Q2.docx",
    size: "486 KB",
    kind: "docx",
    description: "Objetivos, audiencias y entregables del relanzamiento.",
  },
  {
    name: "Métricas_Retención.xlsx",
    size: "2.4 MB",
    kind: "xlsx",
    description: "Cohort analysis últimas 12 semanas.",
  },
];

interface Props extends ExerciseRendererProps<ReadingAttachmentPayload> {
  sessionId?: string | null;
}

export function ReadingAttachment({
  payload,
  onChange,
  onPatch,
  slideId = "reading_attachment",
  mode = "lab_demo",
  sessionId = null,
  caseContext,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());

  const attachments =
    (caseContext?.attachments as AttachmentItem[] | undefined) ??
    DEFAULT_ATTACHMENTS;

  useEffect(() => {
    if (!payload.acknowledged) {
      const next: ReadingAttachmentPayload = { ...payload, acknowledged: true };
      onChange(next);
      if (isProduction && sessionId) {
        patch(`block:reading_attachment:${slideId}`, next, {
          time_to_read_ms: Date.now() - mountedAt.current,
        });
      }
      onPatch?.(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {attachments.map((att, idx) => (
        <div
          key={idx}
          className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3"
        >
          <div
            className="grid h-11 w-11 place-items-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent)]"
            aria-hidden
          >
            <FileGlyph kind={att.kind} />
          </div>
          <div className="min-w-0">
            <div className="ts-body font-medium text-[var(--text-primary)] truncate">
              {att.name}
            </div>
            {att.description && (
              <div className="mt-0.5 ts-footnote text-[var(--text-tertiary)] line-clamp-1">
                {att.description}
              </div>
            )}
          </div>
          <div className="ts-caption-1 tabular-nums text-[var(--text-tertiary)]">
            {att.size}
          </div>
        </div>
      ))}
    </div>
  );
}

function FileGlyph({ kind }: { kind: FileKind }) {
  // SVG simple de documento con badge de extensión
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

function labelFor(kind: FileKind): string {
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

export function readingAttachmentCompletion(_payload: ReadingAttachmentPayload) {
  return { complete: true, missing: [] as string[] };
}

export function emptyReadingAttachmentPayload(): ReadingAttachmentPayload {
  return emptyPayload("reading_attachment") as ReadingAttachmentPayload;
}
