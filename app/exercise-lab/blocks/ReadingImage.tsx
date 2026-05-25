"use client";

/**
 * ReadingImage · bloque pasivo `reading_image` (lab_ref 00D).
 *
 * Imagen estática centrada con caption opcional. Para screenshots de
 * dashboards, gráficas, UIs o reportes que aportan contexto visual.
 * Imagen real via `caseContext.image`; seed por default para el lab.
 */

import { useEffect, useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type ReadingImagePayload = Extract<
  ExerciseResponsePayload,
  { block_id: "reading_image" }
>;

interface ImageContent {
  src: string;
  alt: string;
  caption?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1" | "auto";
}

const DEFAULT_IMAGE: ImageContent = {
  src: "",
  alt: "Captura del dashboard de retención",
  caption: "Dashboard de retención · semana 18 · caída del 12% en cohort de marzo.",
  aspectRatio: "16/9",
};

interface Props extends ExerciseRendererProps<ReadingImagePayload> {
  sessionId?: string | null;
}

export function ReadingImage({
  payload,
  onChange,
  onPatch,
  slideId = "reading_image",
  mode = "lab_demo",
  sessionId = null,
  caseContext,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());

  const image = (caseContext?.image as ImageContent | undefined) ?? DEFAULT_IMAGE;

  useEffect(() => {
    if (!payload.acknowledged) {
      const next: ReadingImagePayload = { ...payload, acknowledged: true };
      onChange(next);
      if (isProduction && sessionId) {
        patch(`block:reading_image:${slideId}`, next, {
          time_to_read_ms: Date.now() - mountedAt.current,
        });
      }
      onPatch?.(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aspectClass = aspectClassFor(image.aspectRatio);

  return (
    <figure className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-2)]">
      <div
        className={`relative w-full ${aspectClass} flex items-center justify-center`}
      >
        {image.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.src}
            alt={image.alt}
            className="h-full w-full object-cover"
          />
        ) : (
          // Placeholder visual cuando no hay src (lab demo)
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--text-tertiary)]">
            <svg className="h-12 w-12" viewBox="0 0 48 48" fill="none" aria-hidden>
              <rect
                x="6"
                y="9"
                width="36"
                height="30"
                rx="3"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M11 33L19 25L25 30L31 24L37 33"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <circle cx="33" cy="18" r="2.5" fill="currentColor" />
            </svg>
            <span className="ts-caption-1">[ {image.alt} ]</span>
          </div>
        )}
      </div>
      {image.caption && (
        <figcaption className="border-t border-[var(--hairline)] bg-[var(--surface)] px-4 py-3 ts-footnote text-[var(--text-tertiary)]">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}

function aspectClassFor(ratio?: "16/9" | "4/3" | "1/1" | "auto"): string {
  switch (ratio) {
    case "4/3":
      return "aspect-[4/3]";
    case "1/1":
      return "aspect-square";
    case "auto":
      return "";
    case "16/9":
    default:
      return "aspect-video";
  }
}

export function readingImageCompletion(_payload: ReadingImagePayload) {
  return { complete: true, missing: [] as string[] };
}

export function emptyReadingImagePayload(): ReadingImagePayload {
  return emptyPayload("reading_image") as ReadingImagePayload;
}
