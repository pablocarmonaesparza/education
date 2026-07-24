/**
 * Mock del reporte individual — SOLO para QA visual con dev-bypass.
 *
 * Lo sirve `/api/sessions/[session_id]/report` cuando el bypass está activo y
 * no hay sesión real (mismo gate que el dashboard). Permite revisar el diseño
 * del ReportShell (wow #2) sin sembrar datos reales en Supabase.
 *
 * Las dimensiones se derivan de `DIMENSIONS` para no desincronizarse del
 * schema. Reporte de ejemplo: perfil "Medio" con bandas variadas (A/M/B), un
 * par de risk events, gaps, fortalezas y recomendación "entrenar".
 */

import { DIMENSIONS } from "@/lib/simulador/config";
import type { BandKey } from "@/lib/simulador/config";
import type { ReportEnvelope, ReportPayload } from "./model";

const DIM_DETAIL: Record<
  string,
  { band: BandKey; rationale: string; confidence: number }
> = {
  contexto: {
    band: "A",
    rationale:
      "Framed the business goal and the campaign constraints before touching the tool. Separated what was urgent from what was important.",
    confidence: 0.86,
  },
  datos: {
    band: "M",
    rationale:
      "Checked the source of the dataset, but did not flag that it included customer emails without explicit consent until late in the flow.",
    confidence: 0.72,
  },
  ejecucion_ia: {
    band: "M",
    rationale:
      "Clear prompt with context, but handed the segmentation judgment to the model without bounding the limits of the case.",
    confidence: 0.7,
  },
  validacion: {
    band: "B",
    rationale:
      "Accepted the model output without checking the numbers against the original source or reviewing the proposed segments.",
    confidence: 0.64,
  },
  juicio: {
    band: "A",
    rationale:
      "On spotting the PII risk, stopped the send and escalated instead of pushing through under time pressure.",
    confidence: 0.81,
  },
  impacto: {
    band: "M",
    rationale:
      "The final decision was defensible, but the justification to the manager was brief and did not quantify the risk avoided.",
    confidence: 0.69,
  },
};

export function getMockReport(sessionId: string): ReportEnvelope {
  const dimensions = DIMENSIONS.map((d) => {
    const detail = DIM_DETAIL[d.id] ?? {
      band: "M" as BandKey,
      rationale: "Performance within the expected range for this dimension.",
      confidence: 0.7,
    };
    return {
      id: d.id,
      band: detail.band,
      rationale: detail.rationale,
      confidence: detail.confidence,
    };
  }) as ReportPayload["dimensions"];

  const payload: ReportPayload = {
    rubric_version: "rubric_case_factory_v1@1.0.0",
    case_version: "marketing_urgent_campaign_pii@1.2.0",
    variant: "base",
    judge_model: "claude · mock",
    duration_ms: 19 * 60 * 1000,
    dimensions,
    // event_type debe ser uno de los 11 canónicos del CHECK en BD
    // (017_simulador_v0.sql) — si no, humanRiskType() no resuelve label.
    risk_events: [
      {
        type: "exposed_pii_to_model",
        severity: "high",
        step_ordinal: 3,
        evidence_text:
          "Pasted the full dataset with customer emails into the prompt without anonymizing it or classifying how sensitive the data was.",
      },
      {
        type: "accepted_unverified_claim",
        severity: "medium",
        step_ordinal: 4,
        evidence_text:
          "Took the reach figures the model returned as final without checking them against the original report.",
      },
    ],
    gaps: [
      {
        id: "clasificacion_datos",
        severity: "high",
        observed:
          "Did not classify how sensitive the dataset was before using it with AI.",
        why_matters:
          "Exposing PII to an outside model is a privacy incident, not a technical detail.",
      },
      {
        id: "validacion_de_salida",
        severity: "medium",
        observed:
          "Accepted the model's segmentation without reviewing samples or cross-checking the source.",
        why_matters:
          "AI speeds the work up, but what gets sent and to whom is still the operator's call.",
      },
    ],
    strengths: [
      "Stopped the send on spotting the sensitive-data risk instead of giving in to the urgency.",
      "Escalated with enough context for the manager to decide quickly.",
    ],
    recommendation: {
      action: "entrenar",
      applies_to: "Using AI with customer data under time pressure.",
      next_week_actions: [
        "Run the data classification practice before using any AI tool.",
        "Redo the case with the re-simulation variant and verify the output against the source.",
        "Agree on a PII checklist with the manager for urgent campaigns.",
      ],
      reason:
        "Judgment under pressure was solid (stopped and escalated), but data hygiene and output verification need practice before working with autonomy.",
    },
  };

  return {
    status: "published",
    report_id: `mock-report-${sessionId}`,
    generated_at: "2026-06-12T15:30:00.000Z",
    shared_at: null,
    payload,
  };
}
