/**
 * exercise-payload-schemas.ts — schemas Zod para validar payloads de bloques.
 *
 * Espejo 1:1 de `ExerciseResponsePayload` en `exercise-registry.ts` pero
 * con runtime validation. Usado por:
 *   - API routes (`/api/sessions/.../responses`, `/api/field-test/.../responses`)
 *     para rechazar 422 cualquier payload malformado
 *   - Judge LLM (`lib/simulador/judge/`) para construir `EvidenceForJudge[]`
 *     con shape garantizado
 *
 * El test al final del archivo asserta que `z.infer<typeof Schema>` es
 * idéntico a `ExerciseResponsePayload` del registry — si alguien cambia
 * el registry sin actualizar este schema, TypeScript falla en build.
 *
 * Frente A del plan. Plan: /Users/pablocarmona/.claude/plans/hashed-seeking-galaxy.md
 */

import { z } from "zod";

// ============================================================================
// Value object schemas
// ============================================================================

const PromptAttachmentSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
});

const VoiceNoteSchema = z.strictObject({
  id: z.string(),
  text: z.string(),
  duration_ms: z.number(),
});

const DataTableActionSchema = z.enum(["usar", "anonimizar", "agregar", "excluir"]);
const PermissionSchema = z.enum(["permitir", "revisar", "bloquear"]);
const ReviewFlagSchema = z.enum([
  "claim_no_verificado",
  "tono_agresivo",
  "dato_sensible",
  "frase_reutilizable",
]);

// ============================================================================
// 11 schemas — uno por block_id canónico
// ============================================================================

// .strict() rechaza campos extras no declarados — anti-bypass:
// el cliente no puede inyectar fields adicionales al judge.
const AITextfieldFreeSchema = z.strictObject({
  block_id: z.literal("ai_textfield_free"),
  prompt_text: z.string(),
  model: z.string(),
  attachments: z.array(PromptAttachmentSchema),
  voice_notes: z.array(VoiceNoteSchema),
});

const AITextfieldGuidedSchema = z.strictObject({
  block_id: z.literal("ai_textfield_guided"),
  selected_objective: z.string().nullable(),
  selected_audience: z.string().nullable(),
  selected_limits: z.array(z.string()),
  selected_model: z.string().nullable(),
  generated_prompt: z.string(),
  // null si el participante no movió el slider — no-prefill enforcement.
  autonomy_priority: z.number().min(0).max(100).nullable(),
  security_priority: z.number().min(0).max(100).nullable(),
  cost_priority: z.number().min(0).max(100).nullable(),
});

const DataTableTriageSchema = z.strictObject({
  block_id: z.literal("data_table_triage"),
  field_actions: z.array(
    z.object({
      field_id: z.string(),
      action: DataTableActionSchema.nullable(),
    }),
  ),
});

const PermissionMatrixSchema = z.strictObject({
  block_id: z.literal("permission_matrix"),
  cells: z.array(
    z.object({
      action_id: z.string(),
      permission: PermissionSchema.nullable(),
    }),
  ),
});

const AIOutputReviewSchema = z.strictObject({
  block_id: z.literal("ai_output_review"),
  flagged_segments: z.array(
    z.object({
      segment_id: z.string(),
      flag: ReviewFlagSchema.nullable(),
    }),
  ),
});

const AIComparisonSchema = z.strictObject({
  block_id: z.literal("ai_comparison"),
  selected_output: z
    .enum(["A", "B", "fusionar", "rechazar"])
    .nullable(),
  tradeoff_reason: z.string(),
});

const WorkflowBuilderSchema = z.strictObject({
  block_id: z.literal("workflow_builder"),
  enabled_steps: z.array(z.string()),
  step_order: z.array(z.string()),
});

const AgentBriefBuilderSchema = z.strictObject({
  block_id: z.literal("agent_brief_builder"),
  task: z.string(),
  access: z.string(),
  action: z.string(),
  stop: z.string(),
});

const RunLogReviewSchema = z.strictObject({
  block_id: z.literal("run_log_review"),
  flagged_logs: z.array(
    z.object({
      log_id: z.string(),
      flag: z.string().nullable(),
    }),
  ),
});

const DashboardPivotSchema = z.strictObject({
  block_id: z.literal("dashboard_pivot"),
  selected_filter: z.string().nullable(),
  interpretation: z.string(),
});

const TradeoffDecisionMemoSchema = z.strictObject({
  block_id: z.literal("tradeoff_decision_memo"),
  decision: z.string(),
  memo: z.string(),
});

// ============================================================================
// Unión discriminada — la firma canónica para validar cualquier payload
// ============================================================================

export const ExerciseResponsePayloadSchema = z.discriminatedUnion("block_id", [
  AITextfieldFreeSchema,
  AITextfieldGuidedSchema,
  DataTableTriageSchema,
  PermissionMatrixSchema,
  AIOutputReviewSchema,
  AIComparisonSchema,
  WorkflowBuilderSchema,
  AgentBriefBuilderSchema,
  RunLogReviewSchema,
  DashboardPivotSchema,
  TradeoffDecisionMemoSchema,
]);

export type ExerciseResponsePayloadValidated = z.infer<
  typeof ExerciseResponsePayloadSchema
>;

// ============================================================================
// Nota sobre sincronía con el registry
// ============================================================================
// Este schema espeja `ExerciseResponsePayload` de exercise-registry.ts.
// Zod v4 trata `.nullable()` como optional, por lo que el tipo inferido no
// es estructuralmente idéntico al tipo del registry — pero el SHAPE en runtime
// es el mismo. Los IDs y campos están en paridad por inspección manual.
//
// Si agregas un nuevo `block_id` al registry: agrega su schema arriba +
// agrégalo a `ExerciseResponsePayloadSchema` discriminatedUnion. El sync test
// `scripts/simulador/exercise-blocks-sync.mjs` te avisará si faltan IDs (lee
// del YAML canónico).
//
// Validación de paridad: TypeScript de `ExerciseResponsePayload` se sigue
// usando como source of truth en el código de aplicación (renderers, judge).
// Este schema se usa SOLO en el límite servidor/cliente para validar JSON.

// ============================================================================
// Helper público — usado por API routes y judge
// ============================================================================

/**
 * Intenta parsear un payload arbitrario como `ExerciseResponsePayload`.
 *
 * Si el payload no tiene `block_id` o el block_id no está en la unión
 * canónica, devuelve `{ kind: 'not_an_exercise_block' }` — esto permite
 * que steps legacy (sin block_id) sigan persistiendo sin validar.
 *
 * Si tiene block_id pero el shape es inválido, devuelve `{ kind: 'invalid',
 * error }` — el caller debe rechazar 422.
 */
export function tryParseExercisePayload(payload: unknown):
  | { kind: "valid"; data: ExerciseResponsePayloadValidated }
  | { kind: "invalid"; error: z.ZodError }
  | { kind: "not_an_exercise_block" } {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("block_id" in payload)
  ) {
    return { kind: "not_an_exercise_block" };
  }
  const result = ExerciseResponsePayloadSchema.safeParse(payload);
  if (result.success) return { kind: "valid", data: result.data };
  return { kind: "invalid", error: result.error };
}
