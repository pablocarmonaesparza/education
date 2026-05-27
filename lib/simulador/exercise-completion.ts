/**
 * exercise-completion.ts · helper central para `completionPredicate`.
 *
 * El shell del runtime consulta `isPayloadComplete(blockId, payload)`
 * antes de avanzar al siguiente slide. Si el predicate devuelve `false`,
 * el botón Continuar se deshabilita (cumple regla CASE_HIG:
 * "cada ejercicio debe emitir evidencia"). · P1.1
 *
 * Cada bloque exporta su propio `<blockName>Completion` predicate; este
 * archivo solo hace dispatch por block_id para que el shell no tenga
 * que importar todos los predicates individualmente.
 */

import type { ExerciseBlockId } from "@/lib/simulador/exercise-blocks.generated";
import type { ExerciseResponsePayload } from "@/lib/simulador/exercise-registry";

export interface CompletionResult {
  complete: boolean;
  missing: string[];
}

/**
 * Devuelve si el payload del bloque está lo suficientemente completo
 * para considerar el slide "respondido". El shell usa esto para
 * deshabilitar el botón Continuar (P1.1) y para calcular progreso.
 *
 * Para bloques pasivos (case_cover, reading_*), `complete` es true tan
 * pronto como el bloque se mostró (acknowledged automático en montaje).
 * Para bloques activos, requiere que el usuario haya emitido evidencia.
 */
export function isPayloadComplete(
  payload: ExerciseResponsePayload,
): CompletionResult {
  switch (payload.block_id) {
    // ===== PASIVOS · acknowledged automático al montar =====
    case "case_cover":
      return {
        complete: payload.started_at !== null,
        missing: payload.started_at === null ? ["started_at"] : [],
      };
    case "reading_passive":
    case "reading_message":
    case "reading_data_table":
    case "reading_image":
    case "reading_kpi_cards":
    case "reading_timeline":
    case "reading_attachment":
      return {
        complete: payload.acknowledged,
        missing: payload.acknowledged ? [] : ["acknowledged"],
      };

    // ===== ACTIVOS · requieren evidencia explícita =====
    case "ai_textfield_free":
      return {
        complete: payload.prompt_text.trim().length > 0,
        missing: payload.prompt_text.trim().length > 0 ? [] : ["prompt_text"],
      };

    case "ai_textfield_guided": {
      const missing: string[] = [];
      if (payload.selected_objective === null) missing.push("selected_objective");
      if (payload.selected_audience === null) missing.push("selected_audience");
      if (payload.selected_limits.length === 0) missing.push("selected_limits");
      if (payload.selected_model === null) missing.push("selected_model");
      if (payload.generated_prompt.trim().length === 0)
        missing.push("generated_prompt");
      return { complete: missing.length === 0, missing };
    }

    case "model_tradeoff_sliders": {
      const missing: string[] = [];
      if (payload.autonomy_priority === null) missing.push("autonomy_priority");
      if (payload.security_priority === null) missing.push("security_priority");
      if (payload.cost_priority === null) missing.push("cost_priority");
      if (payload.recommended_model_id === null)
        missing.push("recommended_model_id");
      if (payload.rationale_text.trim().length === 0)
        missing.push("rationale_text");
      return { complete: missing.length === 0, missing };
    }

    case "categorize_rows": {
      if (payload.row_actions.length === 0) {
        return { complete: false, missing: ["row_actions"] };
      }
      const incomplete = payload.row_actions.filter((r) => r.action === null);
      return {
        complete: incomplete.length === 0,
        missing: incomplete.length > 0 ? ["row_actions"] : [],
      };
    }

    case "ai_output_review": {
      // Bloque completo cuando al menos un segmento fue evaluado · el
      // usuario puede marcar O dejar limpio (decisión explícita). El
      // predicate sólo exige que el bloque haya sido tocado.
      if (payload.flagged_segments.length === 0) {
        return { complete: false, missing: ["flagged_segments"] };
      }
      const anyMarked = payload.flagged_segments.some((s) => s.flag !== null);
      return {
        complete: anyMarked,
        missing: anyMarked ? [] : ["flagged_segments"],
      };
    }

    case "ai_comparison":
      return {
        complete: payload.selected_output !== null,
        missing: payload.selected_output === null ? ["selected_output"] : [],
      };

    case "workflow_builder": {
      const missing: string[] = [];
      if (payload.step_order.length === 0) missing.push("step_order");
      if (payload.rationale_text.trim().length === 0)
        missing.push("rationale_text");
      return { complete: missing.length === 0, missing };
    }

    case "dashboard_pivot": {
      const missing: string[] = [];
      if (payload.selected_filter === null) missing.push("selected_filter");
      if (payload.leader_takeaway.trim().length === 0)
        missing.push("leader_takeaway");
      return { complete: missing.length === 0, missing };
    }

    case "tradeoff_decision_memo": {
      const missing: string[] = [];
      if (payload.decision.trim().length === 0) missing.push("decision");
      if (payload.memo.trim().length === 0) missing.push("memo");
      return { complete: missing.length === 0, missing };
    }
  }
}

/**
 * Variante para cuando aún no hay payload (slide recién renderizado).
 * Devuelve siempre `incomplete`. Útil para inicializar el estado del
 * botón Continuar antes del primer onPayloadChange.
 */
export function isBlockComplete(
  blockId: ExerciseBlockId,
  payload: ExerciseResponsePayload | undefined,
): CompletionResult {
  if (!payload) return { complete: false, missing: ["payload"] };
  if (payload.block_id !== blockId) {
    return { complete: false, missing: ["block_id_mismatch"] };
  }
  return isPayloadComplete(payload);
}
