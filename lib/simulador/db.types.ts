/**
 * Tipos TypeScript del schema `simulador` (Supabase) para usar con
 * createClient<SimuladorDatabase>.
 *
 * Distinto de lib/simulador/types.ts (constantes del contrato YAML).
 * Este archivo describe las TABLAS de la BD, no el contrato pedagógico.
 *
 * Regenerar manualmente al cambiar el schema simulador (las migrations
 * son source of truth).
 *
 * Convenciones:
 *   - Row: shape al leer (todos los campos presentes).
 *   - Insert: shape al insertar (defaults son opcionales).
 *   - Update: shape al actualizar (todos opcionales).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================================================
// ENUMS DERIVADOS DE CHECK CONSTRAINTS
// ============================================================================

export type DimensionKey =
  | "contexto"
  | "privacidad"
  | "validacion"
  | "juicio"
  | "decision";

export type BandKey = "alto" | "medio" | "bajo";

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

export type RiskSeverity = "low" | "medium" | "high";
export type Jurisdiction = "MX" | "CO" | "BR" | "other";
export type DetectedBy = "judge" | "human" | "hybrid";
export type Recommendation = "pilotar" | "entrenar" | "pausar" | "escalar";

export type OrgRole = "org_admin" | "billing_admin" | "viewer";
export type TeamRole = "manager" | "employee" | "viewer";

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export type SubscriptionStatus =
  | "trial"
  | "active"
  | "past_due"
  | "cancelled"
  | "paused";

export type SubscriptionTier =
  | "fase_0_research"
  | "fase_1_diagnostic"
  | "fase_2_sprint"
  | "fase_3_recurrente";

export type RubricStatus = "draft" | "active" | "archived";
export type CaseDifficulty = "baseline" | "intermediate" | "advanced";

export type CaseStepType =
  | "data_scope"
  | "llm_beat"
  | "artifact_review"
  | "decision_select"
  | "decision_open_short";

export type VariantRole = "primary" | "resimulation" | "benchmark" | "custom";

export type SprintStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "completed"
  | "cancelled";

export type AssignmentKind = "primary" | "resimulation";
export type AssignmentStatus =
  | "assigned"
  | "started"
  | "completed"
  | "expired"
  | "cancelled";

export type SessionStatus =
  | "not_started"
  | "in_progress"
  | "paused"
  | "completed"
  | "submitted"
  | "evaluated"
  | "practice_assigned"
  | "evidence_emitted"
  | "expired";

export type ReportType =
  | "executive_summary"
  | "manager_detail"
  | "participant_mirror"
  | "csv_export"
  | "certificate_export";

export type ReportStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "shared"
  | "archived";

export type ReviewTrigger =
  | "low_judge_confidence"
  | "high_risk_event"
  | "user_flagged"
  | "random_audit";

export type ReviewStatus =
  | "queued"
  | "in_review"
  | "resolved"
  | "escalated"
  | "cancelled";

export type EvidenceKind =
  | "readiness_dimension_scores"
  | "risk_events_detected"
  | "decision_replay"
  | "transfer_delta"
  | "manager_recommendation";

export type GapSeverity = "low" | "medium" | "high" | "critical";

// ============================================================================
// TABLAS — Row / Insert / Update por cada tabla del schema simulador
// ============================================================================

export type SimuladorTables = {
  organizations: {
    Row: {
      id: string;
      name: string;
      industry: string | null;
      region: string | null;
      company_size_key: string | null;
      metadata: Json;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      name: string;
      industry?: string | null;
      region?: string | null;
      company_size_key?: string | null;
      metadata?: Json;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<SimuladorTables["organizations"]["Row"]>;
  };

  teams: {
    Row: {
      id: string;
      organization_id: string;
      name: string;
      department_key: string | null;
      metadata: Json;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      organization_id: string;
      name: string;
      department_key?: string | null;
      metadata?: Json;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<SimuladorTables["teams"]["Row"]>;
  };

  users: {
    Row: {
      id: string;
      auth_user_id: string | null;
      email: string;
      full_name: string | null;
      locale: string;
      metadata: Json;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      auth_user_id?: string | null;
      email: string;
      full_name?: string | null;
      locale?: string;
      metadata?: Json;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<SimuladorTables["users"]["Row"]>;
  };

  organization_memberships: {
    Row: {
      id: string;
      organization_id: string;
      user_id: string;
      role: OrgRole;
      created_at: string;
    };
    Insert: {
      id?: string;
      organization_id: string;
      user_id: string;
      role: OrgRole;
      created_at?: string;
    };
    Update: Partial<SimuladorTables["organization_memberships"]["Row"]>;
  };

  team_memberships: {
    Row: {
      id: string;
      team_id: string;
      user_id: string;
      role: TeamRole;
      created_at: string;
    };
    Insert: {
      id?: string;
      team_id: string;
      user_id: string;
      role: TeamRole;
      created_at?: string;
    };
    Update: Partial<SimuladorTables["team_memberships"]["Row"]>;
  };

  invitations: {
    Row: {
      id: string;
      organization_id: string;
      team_id: string | null;
      invited_by: string;
      email: string;
      token: string;
      intended_role: TeamRole;
      status: InvitationStatus;
      accepted_by: string | null;
      expires_at: string;
      created_at: string;
      accepted_at: string | null;
    };
    Insert: {
      id?: string;
      organization_id: string;
      team_id?: string | null;
      invited_by: string;
      email: string;
      token: string;
      intended_role: TeamRole;
      status?: InvitationStatus;
      accepted_by?: string | null;
      expires_at?: string;
      created_at?: string;
      accepted_at?: string | null;
    };
    Update: Partial<SimuladorTables["invitations"]["Row"]>;
  };

  subscriptions: {
    Row: {
      id: string;
      organization_id: string;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
      status: SubscriptionStatus;
      tier: SubscriptionTier;
      seats: number;
      price_usd_total: number | null;
      current_period_start: string | null;
      current_period_end: string | null;
      metadata: Json;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      organization_id: string;
      stripe_customer_id?: string | null;
      stripe_subscription_id?: string | null;
      status?: SubscriptionStatus;
      tier: SubscriptionTier;
      seats?: number;
      price_usd_total?: number | null;
      current_period_start?: string | null;
      current_period_end?: string | null;
      metadata?: Json;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<SimuladorTables["subscriptions"]["Row"]>;
  };

  rubrics: {
    Row: {
      id: string;
      slug: string;
      version: string;
      status: RubricStatus;
      title: string;
      description: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      slug: string;
      version: string;
      status?: RubricStatus;
      title: string;
      description?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<SimuladorTables["rubrics"]["Row"]>;
  };

  rubric_dimensions: {
    Row: {
      id: string;
      rubric_id: string;
      dimension_key: DimensionKey;
      public_definition: string;
      display_order: number;
      public_weight: number | null;
      internal_weight: number | null;
      created_at: string;
    };
    Insert: {
      id?: string;
      rubric_id: string;
      dimension_key: DimensionKey;
      public_definition: string;
      display_order: number;
      public_weight?: number | null;
      internal_weight?: number | null;
      created_at?: string;
    };
    Update: Partial<SimuladorTables["rubric_dimensions"]["Row"]>;
  };

  rubric_criteria: {
    Row: {
      id: string;
      rubric_dimension_id: string;
      criteria_key: string;
      internal_label: string;
      criteria_json: Json;
      thresholds_json: Json;
      penalties_json: Json;
      internal_weight: number | null;
      is_public: boolean;
      created_at: string;
    };
    Insert: {
      id?: string;
      rubric_dimension_id: string;
      criteria_key: string;
      internal_label: string;
      criteria_json?: Json;
      thresholds_json?: Json;
      penalties_json?: Json;
      internal_weight?: number | null;
      is_public?: boolean;
      created_at?: string;
    };
    Update: Partial<SimuladorTables["rubric_criteria"]["Row"]>;
  };

  case_templates: {
    Row: {
      id: string;
      slug: string;
      version: number;
      status: RubricStatus;
      difficulty: CaseDifficulty;
      locale: string;
      title: string;
      target_roles: string[];
      duration_estimate_min: number | null;
      rubric_id: string | null;
      freshness_json: Json;
      expected_manager_action_json: Json;
      required_template_vars: string[];
      context_template_json: Json;
      data_policy_json: Json;
      telemetry_required: string[];
      evaluation_meta_json: Json;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      slug: string;
      version: number;
      status?: RubricStatus;
      difficulty: CaseDifficulty;
      locale?: string;
      title: string;
      target_roles?: string[];
      duration_estimate_min?: number | null;
      rubric_id?: string | null;
      freshness_json?: Json;
      expected_manager_action_json?: Json;
      required_template_vars?: string[];
      context_template_json?: Json;
      data_policy_json?: Json;
      telemetry_required?: string[];
      evaluation_meta_json?: Json;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<SimuladorTables["case_templates"]["Row"]>;
  };

  case_steps: {
    Row: {
      id: string;
      case_template_id: string;
      step_key: string;
      ordinal: number;
      step_type: CaseStepType;
      prompt_template: string | null;
      config_json: Json;
      evaluates_dimensions: DimensionKey[];
      created_at: string;
    };
    Insert: {
      id?: string;
      case_template_id: string;
      step_key: string;
      ordinal: number;
      step_type: CaseStepType;
      prompt_template?: string | null;
      config_json?: Json;
      evaluates_dimensions?: DimensionKey[];
      created_at?: string;
    };
    Update: Partial<SimuladorTables["case_steps"]["Row"]>;
  };

  case_variants: {
    Row: {
      id: string;
      slug: string;
      case_template_id: string;
      parent_variant_id: string | null;
      variant_role: VariantRole;
      status: RubricStatus;
      delay_days_from_parent: number | null;
      template_var_values_json: Json;
      inputs_resolved_json: Json;
      expected_behavior_shift: string | null;
      synthetic_data: boolean;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      slug: string;
      case_template_id: string;
      parent_variant_id?: string | null;
      variant_role: VariantRole;
      status?: RubricStatus;
      delay_days_from_parent?: number | null;
      template_var_values_json?: Json;
      inputs_resolved_json?: Json;
      expected_behavior_shift?: string | null;
      synthetic_data?: boolean;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<SimuladorTables["case_variants"]["Row"]>;
  };

  sprints: {
    Row: {
      id: string;
      sprint_package_id: string | null;
      organization_id: string;
      team_id: string;
      name: string;
      start_date: string | null;
      end_date: string | null;
      status: SprintStatus;
      target_dimensions: string[];
      metadata: Json;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      sprint_package_id?: string | null;
      organization_id: string;
      team_id: string;
      name: string;
      start_date?: string | null;
      end_date?: string | null;
      status?: SprintStatus;
      target_dimensions?: string[];
      metadata?: Json;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<SimuladorTables["sprints"]["Row"]>;
  };

  assignments: {
    Row: {
      id: string;
      sprint_id: string;
      user_id: string;
      case_variant_id: string;
      assignment_kind: AssignmentKind;
      parent_assignment_id: string | null;
      due_at: string | null;
      status: AssignmentStatus;
      assigned_by: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: {
      id?: string;
      sprint_id: string;
      user_id: string;
      case_variant_id: string;
      assignment_kind?: AssignmentKind;
      parent_assignment_id?: string | null;
      due_at?: string | null;
      status?: AssignmentStatus;
      assigned_by?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    Update: Partial<SimuladorTables["assignments"]["Row"]>;
  };

  simulation_sessions: {
    Row: {
      id: string;
      assignment_id: string;
      case_variant_id: string;
      user_id: string;
      sprint_id: string | null;
      status: SessionStatus;
      started_at: string;
      completed_at: string | null;
      last_event_at: string | null;
      metadata: Json;
    };
    Insert: {
      id?: string;
      assignment_id: string;
      case_variant_id: string;
      user_id: string;
      sprint_id?: string | null;
      status?: SessionStatus;
      started_at?: string;
      completed_at?: string | null;
      last_event_at?: string | null;
      metadata?: Json;
    };
    Update: Partial<SimuladorTables["simulation_sessions"]["Row"]>;
  };

  simulation_step_events: {
    Row: {
      id: string;
      simulation_session_id: string;
      case_step_id: string | null;
      step_ordinal: number;
      event_type: string;
      payload_json: Json;
      captured_at: string;
    };
    Insert: {
      id?: string;
      simulation_session_id: string;
      case_step_id?: string | null;
      step_ordinal: number;
      event_type: string;
      payload_json?: Json;
      captured_at?: string;
    };
    Update: Partial<SimuladorTables["simulation_step_events"]["Row"]>;
  };

  llm_interactions: {
    Row: {
      id: string;
      simulation_session_id: string;
      case_step_id: string | null;
      turn_index: number;
      provider_key: string;
      model_key: string;
      user_prompt: string | null;
      model_response: string | null;
      token_usage_json: Json;
      created_at: string;
    };
    Insert: {
      id?: string;
      simulation_session_id: string;
      case_step_id?: string | null;
      turn_index: number;
      provider_key: string;
      model_key: string;
      user_prompt?: string | null;
      model_response?: string | null;
      token_usage_json?: Json;
      created_at?: string;
    };
    Update: Partial<SimuladorTables["llm_interactions"]["Row"]>;
  };

  risk_events: {
    Row: {
      id: string;
      simulation_session_id: string;
      case_step_id: string | null;
      event_type: RiskEventType;
      severity: RiskSeverity;
      dimension_key: DimensionKey | null;
      sensitive_data_type: string | null;
      evidence_text: string;
      jurisdiction_of_data_subject: Jurisdiction | null;
      transfer_basis_documented: boolean | null;
      detected_by: DetectedBy;
      judge_confidence: number | null;
      action_taken: string | null;
      manager_notified_at: string | null;
      escalation_status:
        | "none"
        | "pending"
        | "notified"
        | "resolved"
        | "dismissed";
      payload_json: Json;
      created_at: string;
    };
    Insert: {
      id?: string;
      simulation_session_id: string;
      case_step_id?: string | null;
      event_type: RiskEventType;
      severity: RiskSeverity;
      dimension_key?: DimensionKey | null;
      sensitive_data_type?: string | null;
      evidence_text: string;
      jurisdiction_of_data_subject?: Jurisdiction | null;
      transfer_basis_documented?: boolean | null;
      detected_by?: DetectedBy;
      judge_confidence?: number | null;
      action_taken?: string | null;
      manager_notified_at?: string | null;
      escalation_status?:
        | "none"
        | "pending"
        | "notified"
        | "resolved"
        | "dismissed";
      payload_json?: Json;
      created_at?: string;
    };
    Update: Partial<SimuladorTables["risk_events"]["Row"]>;
  };

  evaluation_runs: {
    Row: {
      id: string;
      simulation_session_id: string;
      rubric_id: string;
      rubric_version: string;
      judge_model: string;
      judge_prompt_version: string;
      input_snapshot_json: Json;
      dimension_scores_json: Json;
      gap_tags_json: Json;
      risk_summary_json: Json;
      raw_judge_output_json: Json;
      computed_recommendation: Recommendation | null;
      override_applied_json: Json;
      created_at: string;
    };
    Insert: {
      id?: string;
      simulation_session_id: string;
      rubric_id: string;
      rubric_version: string;
      judge_model: string;
      judge_prompt_version: string;
      input_snapshot_json?: Json;
      dimension_scores_json?: Json;
      gap_tags_json?: Json;
      risk_summary_json?: Json;
      raw_judge_output_json?: Json;
      computed_recommendation?: Recommendation | null;
      override_applied_json?: Json;
      created_at?: string;
    };
    Update: Partial<SimuladorTables["evaluation_runs"]["Row"]>;
  };

  reports: {
    Row: {
      id: string;
      sprint_id: string;
      user_id: string | null;
      simulation_session_id: string | null;
      report_type: ReportType;
      status: ReportStatus;
      payload_json: Json;
      generated_by: string | null;
      generated_at: string;
      shared_at: string | null;
    };
    Insert: {
      id?: string;
      sprint_id: string;
      user_id?: string | null;
      simulation_session_id?: string | null;
      report_type: ReportType;
      status?: ReportStatus;
      payload_json?: Json;
      generated_by?: string | null;
      generated_at?: string;
      shared_at?: string | null;
    };
    Update: Partial<SimuladorTables["reports"]["Row"]>;
  };
};

// ============================================================================
// DATABASE TYPE (compatible con createClient<SimuladorDatabase>)
// ============================================================================

export type SimuladorDatabase = {
  simulador: {
    Tables: SimuladorTables;
    Views: Record<string, never>;
    Functions: {
      compute_recommendation: {
        Args: { p_session_id: string };
        Returns: { recommendation: Recommendation | null; justification: Json };
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Helpers
export type Row<T extends keyof SimuladorTables> = SimuladorTables[T]["Row"];
export type Insert<T extends keyof SimuladorTables> =
  SimuladorTables[T]["Insert"];
export type Update<T extends keyof SimuladorTables> =
  SimuladorTables[T]["Update"];
