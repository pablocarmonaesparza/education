export const SIMULATOR_DIMENSIONS = [
  'contexto',
  'privacidad',
  'validacion',
  'juicio',
  'decision',
] as const;

export type SimulatorDimension = (typeof SIMULATOR_DIMENSIONS)[number];

export const SIMULATOR_STEP_TYPES = [
  'data_scope',
  'llm_beat',
  'artifact_review',
  'decision_select',
  'decision_open_short',
] as const;

export type SimulatorStepType = (typeof SIMULATOR_STEP_TYPES)[number];

export const SIMULATOR_EVIDENCE_KINDS = [
  'readiness_dimension_scores',
  'risk_events_detected',
  'decision_replay',
  'transfer_delta',
  'manager_recommendation',
] as const;

export type SimulatorEvidenceKind = (typeof SIMULATOR_EVIDENCE_KINDS)[number];

export const SIMULATOR_MANAGER_ACTIONS = [
  'pilotar',
  'entrenar',
  'pausar',
  'escalar',
] as const;

export type SimulatorManagerAction = (typeof SIMULATOR_MANAGER_ACTIONS)[number];

export type SimulatorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type SimulatorSessionStatus =
  | 'not_started'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'evaluated'
  | 'practice_assigned'
  | 'evidence_emitted'
  | 'expired';

export type SimulatorJson = null | boolean | number | string | SimulatorJson[] | {
  [key: string]: SimulatorJson;
};

export type SimulatorJsonObject = Record<string, SimulatorJson>;

export type CaseTemplateFile = {
  case_template: CaseTemplateContract;
};

export type CaseVariantFile = {
  case_variant: CaseVariantContract;
};

export type SprintPackageFile = {
  sprint_package: SprintPackageContract;
};

export type PracticeBeatFile = {
  practice_beat: PracticeBeatContract;
};

export type CaseTemplateContract = {
  id: string;
  version: number;
  status: 'draft' | 'active' | 'archived';
  difficulty: 'baseline' | 'intermediate' | 'advanced';
  locale: string;
  target_role: string[];
  sprint_skus: string[];
  duration_estimate_min: number;
  rubric_ref: string;
  rubric_version_used: string;
  freshness?: SimulatorJsonObject;
  expected_manager_action?: {
    default?: SimulatorManagerAction;
    possible?: SimulatorManagerAction[];
  };
  required_template_vars?: string[];
  context_template?: SimulatorJsonObject;
  data_policy?: SimulatorJsonObject;
  inputs_spec?: SimulatorJsonObject[];
  steps: CaseStepContract[];
  evaluation_meta?: SimulatorJsonObject;
  telemetry_required?: string[];
  evidence_emitted?: EvidenceContract[];
  resimulation_spec?: SimulatorJsonObject;
  gap_definitions?: Record<string, GapDefinitionContract>;
  practice_beats?: Record<string, string>;
  practice_beats_map?: Record<string, string>;
  authoring_meta?: SimulatorJsonObject;
};

export type CaseStepContract = {
  id: number | string;
  type: SimulatorStepType;
  prompt?: string;
  task_to_user?: string;
  capture?: string[];
  evaluates?: SimulatorDimension[];
  evaluates_prompt?: SimulatorDimension[];
  followup?: {
    type: SimulatorStepType;
    evaluates?: SimulatorDimension[];
    [key: string]: SimulatorJson | SimulatorDimension[] | undefined;
  };
  [key: string]: unknown;
};

export type EvidenceContract = {
  kind: SimulatorEvidenceKind;
  shape?: SimulatorJson;
  values?: SimulatorManagerAction[];
  emitted_when?: string;
  includes?: string;
};

export type GapDefinitionContract = {
  dimension: SimulatorDimension;
  severity: SimulatorSeverity;
  triggered_by?: string[];
  [key: string]: unknown;
};

export type CaseVariantContract = {
  id: string;
  template_ref: string;
  parent_variant_ref?: string;
  variant_role: 'primary' | 'resimulation' | 'benchmark' | 'custom';
  delay_days_from_parent?: number;
  status: 'draft' | 'active' | 'archived';
  template_var_values: SimulatorJsonObject;
  expected_behavior_shift?: string;
  inputs_resolved: {
    synthetic: boolean;
    provenance_note?: string;
    items?: SimulatorJsonObject[];
  };
  rendering_meta?: SimulatorJsonObject;
  authoring_note?: string;
};

export type PracticeBeatContract = {
  id: string;
  version: number;
  status: 'draft' | 'active' | 'archived';
  duration_max_seconds: number;
  triggered_by_gap: string | string[];
  dimension: SimulatorDimension;
  applies_to_sprint_skus: string[];
  framing?: SimulatorJsonObject;
  principle_card?: SimulatorJsonObject;
  practice_exercise?: SimulatorJsonObject;
  reveal_after_attempt?: SimulatorJsonObject;
  exit?: SimulatorJsonObject;
  authoring?: SimulatorJsonObject;
};

export type SprintPackageContract = {
  id: string;
  version: number;
  status: 'draft' | 'active' | 'archived';
  vertical: string;
  duration_days: number;
  marketing_meta?: SimulatorJsonObject;
  contents: {
    cases_included: SprintCaseContract[];
    rubric_ref: string;
    rubric_version_used: string;
    practice_beats_catalog: string[];
    resim_policy?: SimulatorJsonObject;
    deliverables_to_manager?: SimulatorJsonObject[];
    deliverables_to_employee?: SimulatorJsonObject[];
  };
  commercial?: SimulatorJsonObject;
  success_metrics?: SimulatorJsonObject;
  operational?: SimulatorJsonObject;
  changelog?: SimulatorJsonObject[];
  notes_for_codex?: string;
};

export type SprintCaseContract = {
  id: string;
  order: number;
  status: 'ready' | 'planned' | 'archived';
  primary_variant_ref?: string;
  resim_variant_ref?: string;
  dimensions_emphasized?: SimulatorDimension[];
  difficulty?: 'baseline' | 'intermediate' | 'advanced';
  tension?: string;
};

export type SimulationStepEventType =
  | 'step_started'
  | 'step_completed'
  | 'decision_submitted'
  | 'llm_prompt_submitted'
  | 'llm_response_received'
  | 'practice_beat_completed';

export type SimulationStepEvent = {
  simulationSessionId: string;
  stepId?: string;
  stepOrdinal: number;
  eventType: SimulationStepEventType;
  payload: SimulatorJsonObject;
  capturedAt: string;
};

export type BehaviorEventType =
  | 'hint_requested'
  | 'answer_changed'
  | 'abandoned_step'
  | 'prompt_iteration'
  | 'timeout_warning_shown';

export type BehaviorEvent = {
  simulationSessionId: string;
  stepId?: string;
  eventType: BehaviorEventType;
  payload: SimulatorJsonObject;
  capturedAt: string;
};

export type RiskEvent = {
  simulationSessionId: string;
  stepId?: string;
  eventType: string;
  severity: SimulatorSeverity;
  dimension?: SimulatorDimension;
  sensitiveDataType?: string;
  evidenceText?: string;
  actionTaken?: string;
  payload: SimulatorJsonObject;
  createdAt: string;
};

export type SimulationSessionDraft = {
  id: string;
  assignmentId: string;
  caseVariantId: string;
  userId: string;
  sprintId?: string;
  status: SimulatorSessionStatus;
  startedAt: string;
  lastEventAt: string;
  metadata: SimulatorJsonObject;
};

export type DimensionScores = Record<SimulatorDimension, number>;

export type EvaluationStubResult = {
  simulationSessionId: string;
  rubricRef: string;
  rubricVersion: string;
  dimensionScores: DimensionScores;
  triggeredGaps: string[];
  riskSummary: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  decisionReplay: SimulationStepEvent[];
};

export type ContractIssue = {
  severity: 'error' | 'warning';
  code: string;
  path: string;
  message: string;
};
