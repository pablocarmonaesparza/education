"use client";

/**
 * ReadingKpiCards · bloque pasivo `reading_kpi_cards` (lab_ref 00E).
 *
 * 1 a 3 tarjetas con número grande, label y delta opcional. Para situar
 * contexto de negocio (MRR, conversión, churn, NPS) antes de pedir
 * análisis. Solo lectura. Datos via `caseContext.kpis`; seed por default.
 */

import { useEffect, useRef } from "react";
import { AppleKpiCard } from "@/components/simulador/apple";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type ReadingKpiCardsPayload = Extract<
  ExerciseResponsePayload,
  { block_id: "reading_kpi_cards" }
>;

type Direction = "up" | "down" | "flat";

interface Kpi {
  value: string;
  label: string;
  delta?: { value: string; direction: Direction; goodWhen?: Direction };
}

const DEFAULT_KPIS: Kpi[] = [
  {
    value: "$48.2K",
    label: "Ingreso mensual del segmento",
    delta: { value: "+12%", direction: "up", goodWhen: "up" },
  },
  {
    value: "11.4%",
    label: "Conversión última semana",
    delta: { value: "-2.1pp", direction: "down", goodWhen: "up" },
  },
  {
    value: "3.8%",
    label: "Cancelación mensual",
    delta: { value: "+0.6pp", direction: "up", goodWhen: "down" },
  },
];

interface Props extends ExerciseRendererProps<ReadingKpiCardsPayload> {
  sessionId?: string | null;
}

export function ReadingKpiCards({
  payload,
  onChange,
  onPatch,
  slideId = "reading_kpi_cards",
  mode = "lab_demo",
  sessionId = null,
  caseContext,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null, {
    mode: mode === "field_test" ? "field_test" : "authenticated",
  });
  const mountedAt = useRef(Date.now());

  const kpis = (caseContext?.kpis as Kpi[] | undefined) ?? DEFAULT_KPIS;

  useEffect(() => {
    if (!payload.acknowledged) {
      const next: ReadingKpiCardsPayload = { ...payload, acknowledged: true };
      onChange(next);
      if (isProduction && sessionId) {
        patch(`block:reading_kpi_cards:${slideId}`, next, {
          time_to_read_ms: Date.now() - mountedAt.current,
        });
      }
      onPatch?.(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gridCols =
    kpis.length === 1
      ? "grid-cols-1"
      : kpis.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-3";

  return (
    <div className={`grid gap-4 ${gridCols}`}>
      {kpis.map((kpi, idx) => (
        <AppleKpiCard
          key={idx}
          label={kpi.label}
          value={kpi.value}
          delta={kpi.delta}
        />
      ))}
    </div>
  );
}

export function readingKpiCardsCompletion(_payload: ReadingKpiCardsPayload) {
  return { complete: true, missing: [] as string[] };
}

export function emptyReadingKpiCardsPayload(): ReadingKpiCardsPayload {
  return emptyPayload("reading_kpi_cards") as ReadingKpiCardsPayload;
}
