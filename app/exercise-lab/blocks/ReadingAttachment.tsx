"use client";

/**
 * ReadingAttachment · bloque pasivo `reading_attachment` (lab_ref 00G).
 *
 * Cards de archivo adjunto con icono, nombre, peso y descripción opcional.
 * Estilo email attachment. Para contratos PDF, briefs DOCX, presentaciones.
 * Lista vía `caseContext.attachments`; seed por default para el lab.
 */

import { useEffect, useRef } from "react";
import { AppleAttachmentCard } from "@/components/simulador/apple";
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
    name: "Aurora_Contract_2026.pdf",
    size: "1.2 MB",
    kind: "pdf",
    description: "Signed contract with an updated service level clause.",
  },
  {
    name: "Q2_Campaign_Brief.docx",
    size: "486 KB",
    kind: "docx",
    description: "Objectives, audiences, and deliverables for the relaunch.",
  },
  {
    name: "Retention_Metrics.xlsx",
    size: "2.4 MB",
    kind: "xlsx",
    description: "Cohort analysis, last 12 weeks.",
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
  const { patch } = useStepPatch(isProduction ? sessionId : null);
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
        <AppleAttachmentCard
          key={idx}
          name={att.name}
          size={att.size}
          kind={att.kind}
          description={att.description}
        />
      ))}
    </div>
  );
}

export function readingAttachmentCompletion(_payload: ReadingAttachmentPayload) {
  return { complete: true, missing: [] as string[] };
}

export function emptyReadingAttachmentPayload(): ReadingAttachmentPayload {
  return emptyPayload("reading_attachment") as ReadingAttachmentPayload;
}
