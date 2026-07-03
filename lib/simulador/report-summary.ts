/**
 * Contrato de GET /api/me/report-summary — resumen agregado de reportes del
 * usuario autenticado (R-29: nada de mocks; la página /reportes consume esto).
 *
 * Scores en escala 0-100 derivados de bandas via BAND_REPRESENTATIVE_SCORE y
 * mapeados de vuelta con bandFromScore100 (R-13: cortes canónicos, únicos).
 */

import type { BandKey, DimensionId } from "@/lib/simulador/config";

export type RiskSeverity = "low" | "medium" | "high";

export type RecommendationAction = "pilotar" | "entrenar" | "pausar" | "escalar";

export interface SummaryCaseRef {
  slug: string;
  title: string;
}

export interface ReportSummaryGlobal {
  casesCompleted: number;
  /** Moda de las bandas por caso; null sin reportes. */
  band: BandKey | null;
  /** Promedio de scores representativos por caso, 0-100; null sin reportes. */
  score: number | null;
  bandDistribution: Record<BandKey, number>;
  lastActivityAt: string | null;
  /** Recomendación del reporte más reciente. */
  recommendation: {
    action: RecommendationAction;
    reason: string;
    appliesTo: string | null;
  } | null;
}

export interface ReportSummaryDimension {
  id: DimensionId;
  /** Promedio de scores representativos entre reportes, 0-100. */
  score: number;
  band: BandKey;
  /** Banda por reporte en orden cronológico (viejo → reciente). */
  trend: BandKey[];
  /** Rationale del judge en el reporte más reciente. */
  latestRationale: string | null;
  bestCase: SummaryCaseRef | null;
  worstCase: SummaryCaseRef | null;
}

export interface ReportSummaryRiskEvent {
  type: string;
  count: number;
  maxSeverity: RiskSeverity;
}

export interface ReportSummaryCase {
  sessionId: string;
  slug: string;
  title: string;
  band: BandKey;
  /** Score representativo del caso, 0-100. */
  score: number;
  completedAt: string | null;
}

export interface ReportSummaryPractice {
  slug: string;
  title: string;
  status: string;
  durationMin: number;
}

export interface ReportSummary {
  global: ReportSummaryGlobal;
  dimensions: ReportSummaryDimension[];
  riskEvents: ReportSummaryRiskEvent[];
  cases: ReportSummaryCase[];
  practice: ReportSummaryPractice[];
}
