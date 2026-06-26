"use client";

/**
 * ReadingPassive · renderer del bloque canónico `reading_passive` (lab_ref 00).
 *
 * Bloque PASIVO: el participante lee título + body y avanza con el botón
 * Continuar. Sin interacción interna ni evidencia para el judge.
 *
 * El shell del runtime (ExerciseSection en /exercise-lab, CaseTemplateClient
 * en /case-template, RuntimeExperience en /case productivo) ya muestra
 * título + body + botón Continuar · este renderer no aporta UI propia,
 * solo existe en el catálogo para que el case-factory sepa que este step
 * es pasivo (no requiere respuesta).
 *
 * Cuando el usuario hace click en Continuar, el runtime marca
 * payload.acknowledged = true. Si la sesión se persiste, queda registro
 * de que el slide fue leído (timestamp en metrics).
 *
 * Cumple no-prefill: acknowledged arranca en false.
 */

import { useEffect, useRef } from "react";
import type {
  ExerciseRendererProps,
  ExerciseResponsePayload,
} from "@/lib/simulador/exercise-registry";
import { emptyPayload } from "@/lib/simulador/exercise-registry";
import { useStepPatch } from "@/lib/simulador/use-step-patch";

type ReadingPassivePayload = Extract<
  ExerciseResponsePayload,
  { block_id: "reading_passive" }
>;

interface Props extends ExerciseRendererProps<ReadingPassivePayload> {
  sessionId?: string | null;
}

export function ReadingPassive({
  payload,
  onChange,
  onPatch,
  slideId = "reading_passive",
  mode = "lab_demo",
  sessionId = null,
}: Props) {
  const isProduction = mode === "authenticated" || mode === "field_test";
  const { patch } = useStepPatch(isProduction ? sessionId : null);
  const mountedAt = useRef(Date.now());
  const acknowledgedAt = useRef<number | null>(null);

  // Auto-acknowledge tras mount · el slide está completo desde que se ve.
  // El shell decide cuándo se persiste (típicamente al avanzar via Continuar).
  useEffect(() => {
    if (!payload.acknowledged) {
      acknowledgedAt.current = Date.now();
      const next: ReadingPassivePayload = { ...payload, acknowledged: true };
      onChange(next);
      if (isProduction && sessionId) {
        patch(`block:reading_passive:${slideId}`, next, {
          time_to_read_ms:
            (acknowledgedAt.current ?? Date.now()) - mountedAt.current,
          final_payload_bytes: JSON.stringify(next).length,
        });
      }
      onPatch?.(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Renderer sin UI · el shell del runtime ya tiene título + body + botón.
  return null;
}

/**
 * Completion predicate canónico · el bloque pasivo está completo siempre
 * (no requiere respuesta del participante; solo lectura).
 */
export function readingPassiveCompletion(_payload: ReadingPassivePayload) {
  return { complete: true, missing: [] as string[] };
}

export function emptyReadingPassivePayload(): ReadingPassivePayload {
  return emptyPayload("reading_passive") as ReadingPassivePayload;
}
