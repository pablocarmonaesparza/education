import { DIMENSIONS } from "@/lib/simulador/config";
import type { BandKey, DimensionId } from "@/lib/simulador/config";
import { reportCopy } from "@/lib/simulador/copy/report";

export interface ReportPayload {
  rubric_version: string;
  case_version: string;
  variant: string;
  judge_model: string;
  duration_ms: number;
  dimensions: Array<{
    id: DimensionId;
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

export interface ReportEnvelope {
  status: "none" | "pending_review" | "published" | "shared";
  session_status?: string | null;
  report_id?: string;
  generated_at?: string;
  shared_at?: string | null;
  payload?: ReportPayload;
  message?: string;
}

export const BAND_DISPLAY: Record<BandKey, string> = {
  A: "Alto",
  M: "Medio",
  B: "Bajo",
};

export function bandScore(band: BandKey) {
  if (band === "A") return 85;
  if (band === "M") return 60;
  return 35;
}

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

export function dimensionsById(payload: ReportPayload): Record<string, BandKey> {
  const bands: Record<string, BandKey> = {};
  for (const dimension of payload.dimensions) {
    bands[dimension.id] = dimension.band;
  }
  return bands;
}

export function computeOverall(payload: ReportPayload) {
  const bands = dimensionsById(payload);
  const score = Math.round(
    DIMENSIONS.reduce(
      (acc, dimension) =>
        acc + bandScore((bands[dimension.id] ?? "M") as BandKey),
      0,
    ) / DIMENSIONS.length,
  );
  const band: BandKey = score > 75 ? "A" : score > 50 ? "M" : "B";
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
