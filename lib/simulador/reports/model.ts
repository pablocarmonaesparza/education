import {
  BAND_REPRESENTATIVE_SCORE,
  DIMENSIONS,
  bandFromScore100,
  canonicalDimensionId,
} from "@/lib/simulador/config";
import type {
  BandKey,
  DimensionId,
  ReportDimensionId,
} from "@/lib/simulador/config";
import { reportCopy } from "@/lib/simulador/copy/report";

type DimensionSource = "direct" | "legacy_alias" | "derived";

interface ReportDimensionInput {
  id?: unknown;
  band?: unknown;
  rationale?: unknown;
  confidence?: unknown;
}

interface ReportDimensionsSource {
  dimensions?: ReportDimensionInput[] | null;
}

export interface NormalizedReportDimension {
  id: DimensionId;
  band: BandKey;
  rationale: string;
  confidence: number;
  source: DimensionSource;
}

export interface ReportPayload {
  rubric_version: string;
  case_version: string;
  variant: string;
  judge_model: string;
  duration_ms: number;
  dimensions: Array<{
    id: ReportDimensionId;
    band: BandKey;
    rationale: string;
    confidence: number;
  }>;
  risk_events: Array<{
    type: string;
    severity: "low" | "medium" | "high";
    step_ordinal: number;
    evidence_text: string;
  }>;
  gaps: Array<{
    id: string;
    severity: "low" | "medium" | "high";
    observed: string;
    why_matters: string;
  }>;
  strengths: string[];
  recommendation: {
    action: "pilotar" | "entrenar" | "pausar" | "escalar";
    applies_to: string;
    next_week_actions: string[];
    reason: string;
  };
}

export interface ReportPracticeEntry {
  slug: string;
  title: string;
  duration_min: number;
  status: string;
  dimension_key: string | null;
  gap_key: string | null;
  completed_at: string | null;
}

export interface ReportEnvelope {
  status: "none" | "pending_review" | "published" | "shared";
  session_status?: string | null;
  report_id?: string;
  generated_at?: string;
  shared_at?: string | null;
  payload?: ReportPayload;
  message?: string;
  /** Práctica desbloqueada por esta sesión (gap → practice beat). */
  practice?: ReportPracticeEntry[];
}

export const BAND_DISPLAY: Record<BandKey, string> = {
  A: "Alto",
  M: "Medio",
  B: "Bajo",
};

// R-13: el mapeo score↔banda vive en lib/simulador/config.ts (espejo del YAML
// canónico de la rúbrica). Aquí solo se re-exporta el representativo para no
// romper imports existentes.
export function bandScore(band: BandKey) {
  return BAND_REPRESENTATIVE_SCORE[band];
}

function isBandKey(value: unknown): value is BandKey {
  return value === "A" || value === "M" || value === "B";
}

const bandFromScore = bandFromScore100;

export function severityLabel(severity: "low" | "medium" | "high") {
  return reportCopy.risk_events.severity_labels[severity];
}

export function capFirst(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function humanRiskType(type: string) {
  return (
    reportCopy.risk_events.type_humanized[
      type as keyof typeof reportCopy.risk_events.type_humanized
    ] ?? type.replace(/_/g, " ")
  );
}

export function normalizeReportDimensions(
  payload: ReportDimensionsSource,
): NormalizedReportDimension[] {
  const byId = new Map<DimensionId, NormalizedReportDimension>();
  const usableBands: BandKey[] = [];

  for (const raw of payload.dimensions ?? []) {
    if (typeof raw.id !== "string") continue;
    if (!isBandKey(raw.band)) continue;
    const id = canonicalDimensionId(raw.id);
    if (!id) continue;

    usableBands.push(raw.band);
    const source: DimensionSource = raw.id === id ? "direct" : "legacy_alias";
    const current = byId.get(id);
    if (current?.source === "direct" && source === "legacy_alias") continue;

    byId.set(id, {
      id,
      band: raw.band,
      rationale:
        typeof raw.rationale === "string" && raw.rationale.trim()
          ? raw.rationale
          : DIMENSIONS.find((dimension) => dimension.id === id)?.description ??
            "",
      confidence:
        typeof raw.confidence === "number" && Number.isFinite(raw.confidence)
          ? raw.confidence
          : 0.5,
      source,
    });
  }

  const derivedScore =
    usableBands.length > 0
      ? usableBands.reduce((sum, band) => sum + bandScore(band), 0) /
        usableBands.length
      : 60;
  const derivedBand = bandFromScore(derivedScore);

  return DIMENSIONS.map((dimension) => {
    const existing = byId.get(dimension.id);
    if (existing) return existing;

    if (dimension.id === "ejecucion_ia") {
      return {
        id: dimension.id,
        band: derivedBand,
        rationale:
          "Reporte generado con rúbrica legacy; esta banda se deriva del promedio disponible hasta re-evaluar con la rúbrica de seis dimensiones.",
        confidence: 0.35,
        source: "derived",
      };
    }

    return {
      id: dimension.id,
      band: "M",
      rationale: dimension.description,
      confidence: 0.35,
      source: "derived",
    };
  });
}

export function dimensionResult(
  payload: ReportDimensionsSource,
  id: DimensionId,
): NormalizedReportDimension {
  return normalizeReportDimensions(payload).find((dimension) => dimension.id === id)!;
}

export function dimensionsById(
  payload: ReportDimensionsSource,
): Record<string, BandKey> {
  const bands: Record<string, BandKey> = {};
  for (const dimension of normalizeReportDimensions(payload)) {
    bands[dimension.id] = dimension.band;
  }
  return bands;
}

export function computeOverall(payload: ReportDimensionsSource) {
  const normalized = normalizeReportDimensions(payload);
  const score = Math.round(
    normalized.reduce((acc, dimension) => acc + bandScore(dimension.band), 0) /
      normalized.length,
  );
  const band = bandFromScore(score);
  return { score, band };
}

export function redactSensitiveEvidence(value: string, severity: string) {
  let redacted = value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu, "[email]")
    .replace(/\+?\d[\d\s().-]{7,}\d/gu, "[telefono]")
    .replace(/\b(?:USD|US\$|\$)\s?\d[\d,._]*(?:\.\d+)?\b/giu, "[monto]")
    .replace(/\b\d{5,}(?:[,.]\d+)?\b/gu, "[numero]");

  if (severity === "high" && redacted.length > 280) {
    redacted = `${redacted.slice(0, 277).trim()}...`;
  }

  return redacted;
}

export function shortenId(id: string) {
  return id.slice(0, 8).toUpperCase();
}
