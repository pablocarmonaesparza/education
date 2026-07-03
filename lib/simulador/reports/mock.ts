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
      "Encuadró el objetivo de negocio y las restricciones de la campaña antes de tocar la herramienta. Distinguió lo urgente de lo importante.",
    confidence: 0.86,
  },
  datos: {
    band: "M",
    rationale:
      "Revisó la fuente del dataset, pero no marcó que incluía correos de clientes sin consentimiento explícito hasta avanzado el flujo.",
    confidence: 0.72,
  },
  ejecucion_ia: {
    band: "M",
    rationale:
      "Prompt claro y con contexto, pero delegó el criterio de segmentación al modelo sin acotar los límites del caso.",
    confidence: 0.7,
  },
  validacion: {
    band: "B",
    rationale:
      "Aceptó la salida del modelo sin contrastar las cifras contra la fuente original ni revisar los segmentos propuestos.",
    confidence: 0.64,
  },
  juicio: {
    band: "A",
    rationale:
      "Cuando detectó el riesgo de PII, frenó el envío y escaló en vez de seguir bajo presión de tiempo.",
    confidence: 0.81,
  },
  impacto: {
    band: "M",
    rationale:
      "La decisión final fue defendible, pero la justificación al manager fue breve y sin cuantificar el riesgo evitado.",
    confidence: 0.69,
  },
};

export function getMockReport(sessionId: string): ReportEnvelope {
  const dimensions = DIMENSIONS.map((d) => {
    const detail = DIM_DETAIL[d.id] ?? {
      band: "M" as BandKey,
      rationale: "Desempeño dentro del rango esperado para esta dimensión.",
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
    risk_events: [
      {
        type: "pii_expuesta_al_modelo",
        severity: "high",
        step_ordinal: 3,
        evidence_text:
          "Pegó el dataset completo con correos de clientes en el prompt sin anonimizar ni clasificar la sensibilidad de los datos.",
      },
      {
        type: "decision_sin_validar_fuente",
        severity: "medium",
        step_ordinal: 4,
        evidence_text:
          "Tomó las cifras de alcance que devolvió el modelo como definitivas sin contrastarlas contra el reporte original.",
      },
    ],
    gaps: [
      {
        id: "clasificacion_datos",
        severity: "high",
        observed:
          "No clasificó la sensibilidad del dataset antes de usarlo con IA.",
        why_matters:
          "Exponer PII a un modelo externo es un incidente de privacidad, no un detalle técnico.",
      },
      {
        id: "validacion_de_salida",
        severity: "medium",
        observed:
          "Aceptó la segmentación del modelo sin revisar muestras ni cruzar con la fuente.",
        why_matters:
          "La IA acelera, pero el criterio de qué se envía y a quién sigue siendo del operador.",
      },
    ],
    strengths: [
      "Frenó el envío al detectar el riesgo de datos sensibles en lugar de ceder a la urgencia.",
      "Escaló con contexto suficiente para que el manager pudiera decidir rápido.",
    ],
    recommendation: {
      action: "entrenar",
      applies_to: "Uso de IA con datos de clientes bajo presión de tiempo.",
      next_week_actions: [
        "Practicar el beat de clasificación de datos antes de usar cualquier herramienta de IA.",
        "Repetir el caso con la variante de re-simulación y validar la salida contra la fuente.",
        "Acordar con el manager un checklist de PII para campañas urgentes.",
      ],
      reason:
        "El juicio bajo presión fue sólido (frenó y escaló), pero la higiene de datos y la validación de salida necesitan práctica antes de operar con autonomía.",
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
