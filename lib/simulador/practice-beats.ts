/**
 * practice-beats — tipos y parser del contenido jugable de un practice beat.
 *
 * La fila de simulador.practice_beats guarda el YAML completo del contrato en
 * content_json (ver scripts/simulador/seed-practice-beats.mjs). El player
 * (/practica/[beat_slug]) consume `content_json.slides` con el mismo shape de
 * slides formativas que validó /aprender-demo: cover → reading → exercises con
 * feedback por fila/segmento → closing.
 *
 * El parser es tolerante: normaliza `content`/`caseContext` y deriva el `kind`
 * del feedback (rows|segments) cuando el YAML no lo declara.
 */

import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";

export type PracticeSlideKind = "cover" | "reading" | "exercise" | "closing";

export interface PracticeRowFeedback {
  id: string;
  correct: string;
  why: string;
}

export interface PracticeSegmentFeedback {
  id: string;
  shouldFlag: boolean;
  why: string;
}

export type PracticeFeedback =
  | { kind: "rows"; rows: PracticeRowFeedback[] }
  | { kind: "segments"; segments: PracticeSegmentFeedback[] };

export interface PracticeSlide {
  id: string;
  kind: PracticeSlideKind;
  blockId?: ExerciseBlockId;
  title: string;
  body: string;
  chips?: string[];
  caseContext?: Record<string, unknown>;
  feedback?: PracticeFeedback;
}

export interface PlayablePracticeBeat {
  slug: string;
  title: string;
  dimensionKey: string | null;
  estimatedMinutes: number;
  slides: PracticeSlide[];
}

type RawSlide = Record<string, unknown>;

function normalizeFeedback(raw: unknown): PracticeFeedback | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const fb = raw as Record<string, unknown>;
  if (Array.isArray(fb.rows)) {
    const rows = fb.rows
      .map((r) => r as Record<string, unknown>)
      .filter((r) => typeof r.id === "string" && typeof r.why === "string")
      .map((r) => ({
        id: String(r.id),
        correct: String(r.correct ?? ""),
        why: String(r.why),
      }));
    return rows.length > 0 ? { kind: "rows", rows } : undefined;
  }
  if (Array.isArray(fb.segments)) {
    const segments = fb.segments
      .map((s) => s as Record<string, unknown>)
      .filter((s) => typeof s.id === "string" && typeof s.why === "string")
      .map((s) => ({
        id: String(s.id),
        shouldFlag: Boolean(s.shouldFlag ?? s.should_flag ?? false),
        why: String(s.why),
      }));
    return segments.length > 0 ? { kind: "segments", segments } : undefined;
  }
  return undefined;
}

function normalizeSlide(raw: RawSlide, index: number): PracticeSlide | null {
  const kind = String(raw.kind ?? "");
  if (!["cover", "reading", "exercise", "closing"].includes(kind)) return null;
  const title = typeof raw.title === "string" ? raw.title : null;
  if (!title) return null;
  const blockIdRaw = raw.blockId ?? raw.block_id;
  const contextRaw = raw.caseContext ?? raw.case_context ?? raw.content;
  return {
    id: typeof raw.id === "string" ? raw.id : `slide_${index + 1}`,
    kind: kind as PracticeSlideKind,
    blockId:
      typeof blockIdRaw === "string" ? (blockIdRaw as ExerciseBlockId) : undefined,
    title,
    body: typeof raw.body === "string" ? raw.body : "",
    chips: Array.isArray(raw.chips) ? raw.chips.map(String) : undefined,
    caseContext:
      contextRaw && typeof contextRaw === "object"
        ? (contextRaw as Record<string, unknown>)
        : undefined,
    feedback: normalizeFeedback(raw.feedback),
  };
}

export function parsePracticeBeatContent(row: {
  slug: string;
  title: string;
  dimension_key: string | null;
  duration_estimate_min: number | null;
  content_json: unknown;
}): PlayablePracticeBeat | null {
  const content = row.content_json;
  if (!content || typeof content !== "object") return null;
  const rawSlides = (content as Record<string, unknown>).slides;
  if (!Array.isArray(rawSlides) || rawSlides.length === 0) return null;

  const slides = rawSlides
    .map((s, i) => normalizeSlide(s as RawSlide, i))
    .filter((s): s is PracticeSlide => s !== null);
  if (slides.length === 0) return null;

  return {
    slug: row.slug,
    title: row.title,
    dimensionKey: row.dimension_key,
    estimatedMinutes: Math.max(1, row.duration_estimate_min ?? 5),
    slides,
  };
}
