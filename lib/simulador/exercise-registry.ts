/**
 * exercise-registry.ts — contrato canónico de bloques de ejercicio.
 *
 * Define los TIPOS DISCRIMINADOS por block_id que cualquier renderer debe
 * emitir, y el predicado de completion + payload de evidencia que el judge
 * LLM consume.
 *
 * Esto NO es el catálogo (eso vive en exercise-blocks.generated.ts derivado
 * del YAML canónico). Esto es el CONTRATO DE EJECUCIÓN: qué shape tiene la
 * respuesta del usuario, cuándo está completa, qué metadata se persiste.
 *
 * Estructura:
 *   1. ExerciseResponsePayload — unión discriminada por block_id (11 variantes)
 *   2. ExerciseCompletionPredicate — función que dice si payload está completo
 *   3. EvidenceForJudge — payload + metrics que se manda al judge
 *   4. ExerciseRendererProps — props comunes a todos los renderers
 *   5. exerciseRegistry — Record<ExerciseBlockId, ...> (placeholder; los
 *      renderers se atan en Día 3)
 *
 * Día 2 del plan. Próximo: Día 3 extrae renderers a app/exercise-lab/blocks/.
 */

import type { ExerciseBlockId } from "./exercise-blocks.generated";

// ============================================================================
// SHARED VALUE OBJECTS
// ============================================================================

export type DataTableAction = "usar" | "anonimizar" | "agregar" | "excluir";
export type Permission = "permitir" | "revisar" | "bloquear";
export type ReviewFlag = "claim_no_verificado" | "tono_agresivo" | "dato_sensible" | "frase_reutilizable";

export interface PromptAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface VoiceNote {
  id: string;
  text: string;
  duration_ms: number;
}

// ============================================================================
// 1. EXERCISE RESPONSE PAYLOAD — unión discriminada por block_id
// ============================================================================

/**
 * Lo que un renderer emite hacia el sistema de persistencia + judge.
 * Cada variante tiene `block_id` literal que TypeScript usa para narrowing.
 */
export type ExerciseResponsePayload =
  | {
      block_id: "ai_textfield_free";
      prompt_text: string;
      model: string;
      attachments: PromptAttachment[];
      voice_notes: VoiceNote[];
    }
  | {
      block_id: "ai_textfield_guided";
      selected_objective: string | null;
      selected_audience: string | null;
      selected_limits: string[];
      selected_model: string | null;
      generated_prompt: string;
      autonomy_priority: number; // 0-100, slider pasos de 10
      security_priority: number;
      cost_priority: number;
    }
  | {
      block_id: "data_table_triage";
      field_actions: Array<{
        field_id: string;
        action: DataTableAction | null;
      }>;
    }
  | {
      block_id: "permission_matrix";
      cells: Array<{
        action_id: string;
        permission: Permission | null;
      }>;
    }
  | {
      block_id: "ai_output_review";
      flagged_segments: Array<{
        segment_id: string;
        flag: ReviewFlag | null;
      }>;
    }
  | {
      block_id: "ai_comparison";
      selected_output: "A" | "B" | "fusionar" | "rechazar" | null;
      tradeoff_reason: string;
    }
  | {
      block_id: "workflow_builder";
      enabled_steps: string[]; // ids de pasos activados (trigger, gate, action, ...)
      step_order: string[]; // si el usuario reordena
    }
  | {
      block_id: "agent_brief_builder";
      task: string;
      access: string;
      action: string;
      stop: string;
    }
  | {
      block_id: "run_log_review";
      flagged_logs: Array<{
        log_id: string;
        flag: string | null; // retry_loop, datos_sensibles, sin_metrica, accion_segura
      }>;
    }
  | {
      block_id: "dashboard_pivot";
      selected_filter: string | null;
      interpretation: string;
    }
  | {
      block_id: "tradeoff_decision_memo";
      decision: string;
      memo: string;
    };

// ============================================================================
// 2. COMPLETION PREDICATE
// ============================================================================

/**
 * Devuelve si el payload está lo suficientemente completo para considerar el
 * bloque "respondido" + qué campos faltan si no.
 *
 * Implementado por bloque en `app/exercise-lab/blocks/*` o `lib/simulador/
 * exercise-completion.ts` (TBD Día 3-4).
 */
export type ExerciseCompletionPredicate<
  P extends ExerciseResponsePayload = ExerciseResponsePayload,
> = (payload: P) => { complete: boolean; missing: string[] };

// ============================================================================
// 3. EVIDENCE FOR JUDGE — lo que se manda al judge LLM
// ============================================================================

export interface ExerciseEvidenceMetrics {
  /** Tiempo desde que se mostró el slide hasta el primer cambio del payload. */
  time_to_first_action_ms?: number;
  /** Total de mutaciones al payload (clicks, keystrokes batch, etc.) */
  total_changes?: number;
  /** Tamaño del payload final, útil para detectar respuestas casi vacías. */
  final_payload_bytes?: number;
  /** Cualquier metadata específica del bloque. */
  [key: string]: unknown;
}

export interface EvidenceForJudge {
  block_id: ExerciseBlockId;
  payload: ExerciseResponsePayload;
  metrics: ExerciseEvidenceMetrics;
  /** ISO timestamp de cuando se hizo commit final de la respuesta. */
  submitted_at: string;
}

// ============================================================================
// 4. RENDERER CONTRACT — props que cualquier ExerciseBlockRenderer recibe
// ============================================================================

export type ExerciseSessionMode = "field_test" | "authenticated" | "lab_demo";

export interface ExerciseRendererProps<
  P extends ExerciseResponsePayload = ExerciseResponsePayload,
> {
  /** Estado actual del payload. Para el primer render: estado vacío del bloque. */
  payload: P;
  /** Mutador del payload. El renderer llama esto en cada interacción. */
  onChange: (next: P) => void;
  /** Si está disponible, el renderer puede llamar onPatch directamente para
   *  forzar autosave (ej. al llenar todos los campos). */
  onPatch?: (next: P, metrics?: ExerciseEvidenceMetrics) => void;
  /** Identificador del slide dentro del caso. Útil para step_key del autosave. */
  slideId?: string;
  /** Modo de sesión: cambia destino de las llamadas a /api/sessions/.../responses */
  mode?: ExerciseSessionMode;
  /** Si está disponible, el renderer puede consultar el contexto del caso
   *  para personalizar (ej. usar el nombre del cliente en el prompt). */
  caseContext?: Record<string, unknown>;
}

/** Función render — un componente React que cumple el contrato. */
export type ExerciseRenderer<
  P extends ExerciseResponsePayload = ExerciseResponsePayload,
> = React.ComponentType<ExerciseRendererProps<P>>;

// ============================================================================
// 5. EMPTY PAYLOAD FACTORIES — no-prefill enforcement (regla dura del YAML)
// ============================================================================

/**
 * Devuelve el payload vacío para un bloque. Ningún campo viene con valor
 * default — todo arranca null/[]/"" según corresponda. Esto cumple con la
 * regla 2 del catálogo YAML: "Ningun bloque puede iniciar con respuestas...
 * prellenados."
 */
export function emptyPayload(block_id: ExerciseBlockId): ExerciseResponsePayload {
  switch (block_id) {
    case "ai_textfield_free":
      return {
        block_id,
        prompt_text: "",
        model: "",
        attachments: [],
        voice_notes: [],
      };
    case "ai_textfield_guided":
      return {
        block_id,
        selected_objective: null,
        selected_audience: null,
        selected_limits: [],
        selected_model: null,
        generated_prompt: "",
        autonomy_priority: 50,
        security_priority: 50,
        cost_priority: 50,
      };
    case "data_table_triage":
      return { block_id, field_actions: [] };
    case "permission_matrix":
      return { block_id, cells: [] };
    case "ai_output_review":
      return { block_id, flagged_segments: [] };
    case "ai_comparison":
      return { block_id, selected_output: null, tradeoff_reason: "" };
    case "workflow_builder":
      return { block_id, enabled_steps: [], step_order: [] };
    case "agent_brief_builder":
      return { block_id, task: "", access: "", action: "", stop: "" };
    case "run_log_review":
      return { block_id, flagged_logs: [] };
    case "dashboard_pivot":
      return { block_id, selected_filter: null, interpretation: "" };
    case "tradeoff_decision_memo":
      return { block_id, decision: "", memo: "" };
  }
}

// ============================================================================
// 6. REGISTRY — Record<ExerciseBlockId, ExerciseRendererEntry>
// ============================================================================

export interface ExerciseRendererEntry<
  P extends ExerciseResponsePayload = ExerciseResponsePayload,
> {
  renderer: ExerciseRenderer<P>;
  completion: ExerciseCompletionPredicate<P>;
}

/**
 * Mapping ID canónico → renderer + completion predicate.
 *
 * Se llena en Día 3 cuando los renderers se extraigan a archivos.
 * Por ahora es un placeholder vacío con cast — TypeScript fallaría si el
 * registry no tiene los 11 IDs, así que esto se irá completando ID por ID.
 *
 * Uso esperado (post-Día 3):
 *   import { exerciseRegistry } from "@/lib/simulador/exercise-registry";
 *   const Renderer = exerciseRegistry["data_table_triage"].renderer;
 *   return <Renderer payload={...} onChange={...} />;
 */
export const exerciseRegistry: Partial<
  Record<ExerciseBlockId, ExerciseRendererEntry>
> = {};
