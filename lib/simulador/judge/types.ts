/**
 * Tipos canónicos del Judge LLM del Simulador.
 *
 * Los strings literales aquí (banda, severidad, recomendación, risk type)
 * deben matchear los CHECK constraints en la BD. Las 6 dimensiones canónicas
 * (contexto, datos, ejecucion_ia, validacion, juicio, impacto) son la fuente
 * única: viven en la rúbrica (rubric_case_factory_v1.yaml) y en
 * docs/simulador/case_factory/ENGINE_CONTRACT.md. Si cambias estas literales,
 * actualiza la migración additiva de dimension_key y los seeds (ENGINE_CONTRACT §6).
 */

export type Band = "A" | "M" | "B";
export type Severity = "low" | "medium" | "high";
export type Recommendation = "pilotar" | "entrenar" | "pausar" | "escalar";
export type DimensionKey =
  | "contexto"
  | "datos"
  | "ejecucion_ia"
  | "validacion"
  | "juicio"
  | "impacto";

/** 11 risk events del contrato §9. CHECK constraint en risk_events.event_type. */
export type RiskEventType =
  | "exposed_pii_to_model"
  | "hidden_pii_usage_from_authority"
  | "accepted_unverified_claim"
  | "accepted_hallucinated_figures"
  | "used_sensitive_commercial_data"
  | "shared_third_party_confidential"
  | "used_unapproved_vendor"
  | "prompt_injection_unawareness"
  | "over_relied_on_output"
  | "overblocked_without_discrimination"
  | "ignored_escalation_path";

export interface JudgeDimensionScore {
  id: DimensionKey;
  band: Band;
  rationale: string;
  confidence: number; // 0..1
}

export interface JudgeRiskEvent {
  type: RiskEventType;
  severity: Severity;
  step_ordinal: number;
  evidence_text: string;
  /**
   * Jurisdicción del titular del dato per contrato §9.1 — null si no aplica.
   * 'US' agregado en el pivot a EEUU (2026-07-16): sin él el judge etiquetaba
   * a un titular estadounidense como 'other' y el registro de compliance
   * sub-reportaba el mercado principal. Reguladas: US (CCPA/CPRA), MX
   * (LFPDPPP), CO (Ley 1581), BR (LGPD).
   */
  jurisdiction: "MX" | "CO" | "BR" | "US" | "other" | null;
  transfer_basis_documented: boolean | null;
}

export interface JudgeGap {
  id: string;
  severity: Severity;
  observed: string;
  why_matters: string;
}

export interface JudgeRecommendation {
  action: Recommendation;
  applies_to: string;
  next_week_actions: string[];
  reason: string;
}

export interface JudgeOutput {
  dimensions: JudgeDimensionScore[];
  risk_events: JudgeRiskEvent[];
  gaps: JudgeGap[];
  strengths: string[];
  recommendation: JudgeRecommendation;
}

/** Snapshot inmutable que se pasa al judge — replicable post-hoc para auditoría. */
export interface JudgeInputContext {
  caseTitle: string;
  caseSlug: string;
  caseVersion: number;
  variantSlug: string;
  /** inputs_resolved_json del case_variant: brief, dataset sample, model_response_sample, etc. */
  variantInputs: Record<string, unknown>;
  /** Definiciones de los steps en orden, sin las respuestas del participante. */
  steps: Array<{
    ordinal: number;
    step_key: string;
    step_type: string;
    prompt_template: string | null;
    evaluates_dimensions: string[] | null;
  }>;
  /** Respuestas del participante reducidas a último payload por step_key. */
  responses: Record<string, unknown>;
  /**
   * Frente A — payloads de bloques canónicos validados con Zod, indexados
   * por step_key. Solo presentes para steps cuyo payload tenía `block_id`
   * y pasó `tryParseExercisePayload`. El judge debería preferir este shape
   * tipado para construir prompts deterministas; `responses` se mantiene
   * para retrocompat con steps legacy.
   */
  exerciseEvidence?: Record<string, import("../exercise-registry").EvidenceForJudge>;
  rubric: {
    slug: string;
    version: string;
    title: string;
    dimensions: Array<{
      dimension_key: string;
      public_definition: string;
      display_order: number;
    }>;
  };
}

/** Resultado completo del judge pipeline (LLM + overrides aplicados). */
export interface JudgeRunResult {
  /** Output crudo del modelo, antes de overrides. */
  raw: JudgeOutput;
  /** Output final después de aplicar override matrix. */
  final: JudgeOutput;
  /** Lista de overrides que se aplicaron (para audit_log). `before`/`after`
   * son Recommendation en reglas de recomendación y Band en band-caps (R-11). */
  overridesApplied: Array<{
    rule: string;
    before: Recommendation | Band;
    after: Recommendation | Band;
    reason: string;
  }>;
  /** Metadata de la llamada al modelo. */
  meta: {
    model: string;
    promptVersion: string;
    rubricVersion: string;
    durationMs: number;
  };
}
