export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  simulador: {
    Tables: {
      analytics_events_catalog: {
        Row: {
          deprecated_at: string | null
          description: string
          event_name: string
          introduced_at: string
          metadata_json: Json
          owner: string
          payload_schema: Json
          surface: string
        }
        Insert: {
          deprecated_at?: string | null
          description: string
          event_name: string
          introduced_at?: string
          metadata_json?: Json
          owner?: string
          payload_schema?: Json
          surface: string
        }
        Update: {
          deprecated_at?: string | null
          description?: string
          event_name?: string
          introduced_at?: string
          metadata_json?: Json
          owner?: string
          payload_schema?: Json
          surface?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          assigned_by: string | null
          assignment_kind: string
          case_variant_id: string
          created_at: string
          due_at: string | null
          id: string
          parent_assignment_id: string | null
          sprint_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          assignment_kind?: string
          case_variant_id: string
          created_at?: string
          due_at?: string | null
          id?: string
          parent_assignment_id?: string | null
          sprint_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          assignment_kind?: string
          case_variant_id?: string
          created_at?: string
          due_at?: string | null
          id?: string
          parent_assignment_id?: string | null
          sprint_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_case_variant_id_fkey"
            columns: ["case_variant_id"]
            isOneToOne: false
            referencedRelation: "case_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_parent_assignment_id_fkey"
            columns: ["parent_assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          after_state: Json | null
          before_state: Json | null
          entity: string
          entity_id: string | null
          id: string
          occurred_at: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
          occurred_at?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
          occurred_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      behavior_events: {
        Row: {
          captured_at: string
          case_step_id: string | null
          event_type: string
          id: string
          payload_json: Json
          simulation_session_id: string
        }
        Insert: {
          captured_at?: string
          case_step_id?: string | null
          event_type: string
          id?: string
          payload_json?: Json
          simulation_session_id: string
        }
        Update: {
          captured_at?: string
          case_step_id?: string | null
          event_type?: string
          id?: string
          payload_json?: Json
          simulation_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavior_events_case_step_id_fkey"
            columns: ["case_step_id"]
            isOneToOne: false
            referencedRelation: "case_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavior_events_simulation_session_id_fkey"
            columns: ["simulation_session_id"]
            isOneToOne: false
            referencedRelation: "simulation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      case_inputs_spec: {
        Row: {
          case_template_id: string
          config_json: Json
          content_template_ref: string | null
          created_at: string
          id: string
          kind: string
          name: string
          sample_rows_ref: string | null
          schema_json: Json
        }
        Insert: {
          case_template_id: string
          config_json?: Json
          content_template_ref?: string | null
          created_at?: string
          id?: string
          kind: string
          name: string
          sample_rows_ref?: string | null
          schema_json?: Json
        }
        Update: {
          case_template_id?: string
          config_json?: Json
          content_template_ref?: string | null
          created_at?: string
          id?: string
          kind?: string
          name?: string
          sample_rows_ref?: string | null
          schema_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "case_inputs_spec_case_template_id_fkey"
            columns: ["case_template_id"]
            isOneToOne: false
            referencedRelation: "case_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      case_practice_beats: {
        Row: {
          case_template_id: string
          created_at: string
          gap_definition_id: string
          id: string
          practice_beat_id: string
        }
        Insert: {
          case_template_id: string
          created_at?: string
          gap_definition_id: string
          id?: string
          practice_beat_id: string
        }
        Update: {
          case_template_id?: string
          created_at?: string
          gap_definition_id?: string
          id?: string
          practice_beat_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_practice_beats_case_template_id_fkey"
            columns: ["case_template_id"]
            isOneToOne: false
            referencedRelation: "case_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_practice_beats_gap_definition_id_fkey"
            columns: ["gap_definition_id"]
            isOneToOne: false
            referencedRelation: "gap_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_practice_beats_practice_beat_id_fkey"
            columns: ["practice_beat_id"]
            isOneToOne: false
            referencedRelation: "practice_beats"
            referencedColumns: ["id"]
          },
        ]
      }
      case_steps: {
        Row: {
          case_template_id: string
          config_json: Json
          created_at: string
          evaluates_dimensions: string[]
          id: string
          ordinal: number
          prompt_template: string | null
          step_key: string
          step_type: string
        }
        Insert: {
          case_template_id: string
          config_json?: Json
          created_at?: string
          evaluates_dimensions?: string[]
          id?: string
          ordinal: number
          prompt_template?: string | null
          step_key: string
          step_type: string
        }
        Update: {
          case_template_id?: string
          config_json?: Json
          created_at?: string
          evaluates_dimensions?: string[]
          id?: string
          ordinal?: number
          prompt_template?: string | null
          step_key?: string
          step_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_steps_case_template_id_fkey"
            columns: ["case_template_id"]
            isOneToOne: false
            referencedRelation: "case_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      case_templates: {
        Row: {
          archetype_ref: string | null
          career_key: string
          context_template_json: Json
          created_at: string
          data_policy_json: Json
          difficulty: string
          duration_estimate_min: number | null
          evaluation_meta_json: Json
          expected_manager_action_json: Json
          freshness_json: Json
          id: string
          level_advanced_variant: number | null
          level_primary: number
          locale: string
          required_template_vars: string[]
          rubric_id: string | null
          slug: string
          status: string
          target_roles: string[]
          telemetry_required: string[]
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          archetype_ref?: string | null
          career_key?: string
          context_template_json?: Json
          created_at?: string
          data_policy_json?: Json
          difficulty: string
          duration_estimate_min?: number | null
          evaluation_meta_json?: Json
          expected_manager_action_json?: Json
          freshness_json?: Json
          id?: string
          level_advanced_variant?: number | null
          level_primary?: number
          locale?: string
          required_template_vars?: string[]
          rubric_id?: string | null
          slug: string
          status?: string
          target_roles?: string[]
          telemetry_required?: string[]
          title: string
          updated_at?: string
          version: number
        }
        Update: {
          archetype_ref?: string | null
          career_key?: string
          context_template_json?: Json
          created_at?: string
          data_policy_json?: Json
          difficulty?: string
          duration_estimate_min?: number | null
          evaluation_meta_json?: Json
          expected_manager_action_json?: Json
          freshness_json?: Json
          id?: string
          level_advanced_variant?: number | null
          level_primary?: number
          locale?: string
          required_template_vars?: string[]
          rubric_id?: string | null
          slug?: string
          status?: string
          target_roles?: string[]
          telemetry_required?: string[]
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "case_templates_rubric_id_fkey"
            columns: ["rubric_id"]
            isOneToOne: false
            referencedRelation: "rubrics"
            referencedColumns: ["id"]
          },
        ]
      }
      case_variants: {
        Row: {
          career_key: string | null
          case_template_id: string
          created_at: string
          delay_days_from_parent: number | null
          expected_behavior_shift: string | null
          id: string
          inputs_resolved_json: Json
          level: number | null
          parent_variant_id: string | null
          slug: string
          status: string
          synthetic_data: boolean
          template_var_values_json: Json
          transfer_pair_key: string | null
          updated_at: string
          variant_role: string
        }
        Insert: {
          career_key?: string | null
          case_template_id: string
          created_at?: string
          delay_days_from_parent?: number | null
          expected_behavior_shift?: string | null
          id?: string
          inputs_resolved_json?: Json
          level?: number | null
          parent_variant_id?: string | null
          slug: string
          status?: string
          synthetic_data?: boolean
          template_var_values_json?: Json
          transfer_pair_key?: string | null
          updated_at?: string
          variant_role: string
        }
        Update: {
          career_key?: string | null
          case_template_id?: string
          created_at?: string
          delay_days_from_parent?: number | null
          expected_behavior_shift?: string | null
          id?: string
          inputs_resolved_json?: Json
          level?: number | null
          parent_variant_id?: string | null
          slug?: string
          status?: string
          synthetic_data?: boolean
          template_var_values_json?: Json
          transfer_pair_key?: string | null
          updated_at?: string
          variant_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_variants_case_template_id_fkey"
            columns: ["case_template_id"]
            isOneToOne: false
            referencedRelation: "case_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_variants_parent_variant_id_fkey"
            columns: ["parent_variant_id"]
            isOneToOne: false
            referencedRelation: "case_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_runs: {
        Row: {
          computed_recommendation: string | null
          created_at: string
          dimension_scores_json: Json
          gap_tags_json: Json
          id: string
          input_snapshot_json: Json
          judge_model: string
          judge_prompt_version: string
          override_applied_json: Json
          raw_judge_output_json: Json
          risk_summary_json: Json
          rubric_id: string
          rubric_version: string
          simulation_session_id: string
        }
        Insert: {
          computed_recommendation?: string | null
          created_at?: string
          dimension_scores_json?: Json
          gap_tags_json?: Json
          id?: string
          input_snapshot_json?: Json
          judge_model: string
          judge_prompt_version: string
          override_applied_json?: Json
          raw_judge_output_json?: Json
          risk_summary_json?: Json
          rubric_id: string
          rubric_version: string
          simulation_session_id: string
        }
        Update: {
          computed_recommendation?: string | null
          created_at?: string
          dimension_scores_json?: Json
          gap_tags_json?: Json
          id?: string
          input_snapshot_json?: Json
          judge_model?: string
          judge_prompt_version?: string
          override_applied_json?: Json
          raw_judge_output_json?: Json
          risk_summary_json?: Json
          rubric_id?: string
          rubric_version?: string
          simulation_session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_runs_rubric_exact_version_fk"
            columns: ["rubric_id", "rubric_version"]
            isOneToOne: false
            referencedRelation: "rubrics"
            referencedColumns: ["id", "version"]
          },
          {
            foreignKeyName: "evaluation_runs_rubric_id_fkey"
            columns: ["rubric_id"]
            isOneToOne: false
            referencedRelation: "rubrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_runs_simulation_session_id_fkey"
            columns: ["simulation_session_id"]
            isOneToOne: false
            referencedRelation: "simulation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_snapshots: {
        Row: {
          created_at: string
          evidence_kind: string
          id: string
          payload_json: Json
          simulation_session_id: string | null
          sprint_id: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          evidence_kind: string
          id?: string
          payload_json?: Json
          simulation_session_id?: string | null
          sprint_id?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          evidence_kind?: string
          id?: string
          payload_json?: Json
          simulation_session_id?: string | null
          sprint_id?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_snapshots_simulation_session_id_fkey"
            columns: ["simulation_session_id"]
            isOneToOne: false
            referencedRelation: "simulation_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_snapshots_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_snapshots_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      field_test_leads: {
        Row: {
          company: string
          consent_to_contact: boolean
          created_at: string
          email: string
          field_test_session_id: string | null
          id: string
          metadata_json: Json
          name: string
          role: string | null
          source: string
          team_size: string | null
        }
        Insert: {
          company: string
          consent_to_contact?: boolean
          created_at?: string
          email: string
          field_test_session_id?: string | null
          id?: string
          metadata_json?: Json
          name: string
          role?: string | null
          source?: string
          team_size?: string | null
        }
        Update: {
          company?: string
          consent_to_contact?: boolean
          created_at?: string
          email?: string
          field_test_session_id?: string | null
          id?: string
          metadata_json?: Json
          name?: string
          role?: string | null
          source?: string
          team_size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_test_leads_field_test_session_id_fkey"
            columns: ["field_test_session_id"]
            isOneToOne: false
            referencedRelation: "field_test_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      field_test_reports: {
        Row: {
          created_at: string
          field_test_session_id: string
          generated_at: string
          id: string
          payload_json: Json
          status: string
        }
        Insert: {
          created_at?: string
          field_test_session_id: string
          generated_at?: string
          id?: string
          payload_json?: Json
          status?: string
        }
        Update: {
          created_at?: string
          field_test_session_id?: string
          generated_at?: string
          id?: string
          payload_json?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_test_reports_field_test_session_id_fkey"
            columns: ["field_test_session_id"]
            isOneToOne: true
            referencedRelation: "field_test_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      field_test_sessions: {
        Row: {
          case_slug: string
          case_template_id: string | null
          case_variant_id: string | null
          completed_at: string | null
          created_at: string
          expires_at: string
          id: string
          ip_hash: string | null
          last_event_at: string
          metadata_json: Json
          public_token_hash: string
          report_status: string
          started_at: string
          status: string
          updated_at: string
          user_agent_hash: string | null
        }
        Insert: {
          case_slug: string
          case_template_id?: string | null
          case_variant_id?: string | null
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          ip_hash?: string | null
          last_event_at?: string
          metadata_json?: Json
          public_token_hash: string
          report_status?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_agent_hash?: string | null
        }
        Update: {
          case_slug?: string
          case_template_id?: string | null
          case_variant_id?: string | null
          completed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          ip_hash?: string | null
          last_event_at?: string
          metadata_json?: Json
          public_token_hash?: string
          report_status?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_agent_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_test_sessions_case_template_id_fkey"
            columns: ["case_template_id"]
            isOneToOne: false
            referencedRelation: "case_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "field_test_sessions_case_variant_id_fkey"
            columns: ["case_variant_id"]
            isOneToOne: false
            referencedRelation: "case_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      field_test_step_events: {
        Row: {
          captured_at: string
          event_type: string
          field_test_session_id: string
          id: string
          metrics_json: Json
          payload_json: Json
          step_key: string | null
        }
        Insert: {
          captured_at?: string
          event_type: string
          field_test_session_id: string
          id?: string
          metrics_json?: Json
          payload_json?: Json
          step_key?: string | null
        }
        Update: {
          captured_at?: string
          event_type?: string
          field_test_session_id?: string
          id?: string
          metrics_json?: Json
          payload_json?: Json
          step_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_test_step_events_field_test_session_id_fkey"
            columns: ["field_test_session_id"]
            isOneToOne: false
            referencedRelation: "field_test_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      gap_definitions: {
        Row: {
          case_template_id: string
          created_at: string
          dimension_key: string
          gap_key: string
          id: string
          severity: string
          triggered_by_json: Json
        }
        Insert: {
          case_template_id: string
          created_at?: string
          dimension_key: string
          gap_key: string
          id?: string
          severity: string
          triggered_by_json?: Json
        }
        Update: {
          case_template_id?: string
          created_at?: string
          dimension_key?: string
          gap_key?: string
          id?: string
          severity?: string
          triggered_by_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "gap_definitions_case_template_id_fkey"
            columns: ["case_template_id"]
            isOneToOne: false
            referencedRelation: "case_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      human_review_queue: {
        Row: {
          assigned_to: string | null
          created_at: string
          due_at: string | null
          evaluation_run_id: string
          id: string
          override_dimension_scores_json: Json | null
          override_recommendation: string | null
          resolved_at: string | null
          resolver_notes: string | null
          status: string
          triggered_by: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          due_at?: string | null
          evaluation_run_id: string
          id?: string
          override_dimension_scores_json?: Json | null
          override_recommendation?: string | null
          resolved_at?: string | null
          resolver_notes?: string | null
          status?: string
          triggered_by: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          due_at?: string | null
          evaluation_run_id?: string
          id?: string
          override_dimension_scores_json?: Json | null
          override_recommendation?: string | null
          resolved_at?: string | null
          resolver_notes?: string | null
          status?: string
          triggered_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "human_review_queue_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "human_review_queue_evaluation_run_id_fkey"
            columns: ["evaluation_run_id"]
            isOneToOne: false
            referencedRelation: "evaluation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          intended_role: string
          invited_by: string
          organization_id: string
          status: string
          team_id: string | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          intended_role: string
          invited_by: string
          organization_id: string
          status?: string
          team_id?: string | null
          token: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          intended_role?: string
          invited_by?: string
          organization_id?: string
          status?: string
          team_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_inbox: {
        Row: {
          company: string | null
          created_at: string
          email: string
          field_test_lead_id: string | null
          field_test_session_id: string | null
          id: string
          metadata_json: Json
          name: string | null
          notes: string | null
          owner_user_id: string | null
          role: string | null
          source: string
          status: string
          team_size: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          field_test_lead_id?: string | null
          field_test_session_id?: string | null
          id?: string
          metadata_json?: Json
          name?: string | null
          notes?: string | null
          owner_user_id?: string | null
          role?: string | null
          source?: string
          status?: string
          team_size?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          field_test_lead_id?: string | null
          field_test_session_id?: string | null
          id?: string
          metadata_json?: Json
          name?: string | null
          notes?: string | null
          owner_user_id?: string | null
          role?: string | null
          source?: string
          status?: string
          team_size?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_inbox_field_test_lead_id_fkey"
            columns: ["field_test_lead_id"]
            isOneToOne: false
            referencedRelation: "field_test_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_inbox_field_test_session_id_fkey"
            columns: ["field_test_session_id"]
            isOneToOne: false
            referencedRelation: "field_test_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_inbox_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_interactions: {
        Row: {
          case_step_id: string | null
          created_at: string
          id: string
          model_key: string
          model_response: string | null
          provider_key: string
          simulation_session_id: string
          token_usage_json: Json
          turn_index: number
          user_prompt: string | null
        }
        Insert: {
          case_step_id?: string | null
          created_at?: string
          id?: string
          model_key: string
          model_response?: string | null
          provider_key: string
          simulation_session_id: string
          token_usage_json?: Json
          turn_index: number
          user_prompt?: string | null
        }
        Update: {
          case_step_id?: string | null
          created_at?: string
          id?: string
          model_key?: string
          model_response?: string | null
          provider_key?: string
          simulation_session_id?: string
          token_usage_json?: Json
          turn_index?: number
          user_prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "llm_interactions_case_step_id_fkey"
            columns: ["case_step_id"]
            isOneToOne: false
            referencedRelation: "case_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "llm_interactions_simulation_session_id_fkey"
            columns: ["simulation_session_id"]
            isOneToOne: false
            referencedRelation: "simulation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_alert_subscriptions: {
        Row: {
          alert_types: string[]
          channel: string
          created_at: string
          destination: string | null
          id: string
          is_active: boolean
          manager_user_id: string
          metadata_json: Json
          organization_id: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          alert_types?: string[]
          channel: string
          created_at?: string
          destination?: string | null
          id?: string
          is_active?: boolean
          manager_user_id: string
          metadata_json?: Json
          organization_id: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          alert_types?: string[]
          channel?: string
          created_at?: string
          destination?: string | null
          id?: string
          is_active?: boolean
          manager_user_id?: string
          metadata_json?: Json
          organization_id?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manager_alert_subscriptions_manager_user_id_fkey"
            columns: ["manager_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_alert_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_alert_subscriptions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_alerts: {
        Row: {
          acknowledged_at: string | null
          alert_type: string
          body: string | null
          created_at: string
          delivery_json: Json
          id: string
          manager_user_id: string | null
          organization_id: string | null
          payload_json: Json
          resolved_at: string | null
          sent_at: string | null
          severity: string
          source_session_id: string | null
          sprint_id: string | null
          status: string
          subject_user_id: string | null
          team_id: string | null
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          alert_type: string
          body?: string | null
          created_at?: string
          delivery_json?: Json
          id?: string
          manager_user_id?: string | null
          organization_id?: string | null
          payload_json?: Json
          resolved_at?: string | null
          sent_at?: string | null
          severity?: string
          source_session_id?: string | null
          sprint_id?: string | null
          status?: string
          subject_user_id?: string | null
          team_id?: string | null
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          alert_type?: string
          body?: string | null
          created_at?: string
          delivery_json?: Json
          id?: string
          manager_user_id?: string | null
          organization_id?: string | null
          payload_json?: Json
          resolved_at?: string | null
          sent_at?: string | null
          severity?: string
          source_session_id?: string | null
          sprint_id?: string | null
          status?: string
          subject_user_id?: string | null
          team_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "manager_alerts_manager_user_id_fkey"
            columns: ["manager_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_alerts_source_session_id_fkey"
            columns: ["source_session_id"]
            isOneToOne: false
            referencedRelation: "simulation_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_alerts_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_alerts_subject_user_id_fkey"
            columns: ["subject_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_alerts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_recommendations: {
        Row: {
          created_at: string
          evidence_snapshot_ids: string[]
          id: string
          justification_text: string
          recommendation: string
          sprint_id: string | null
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          evidence_snapshot_ids?: string[]
          id?: string
          justification_text: string
          recommendation: string
          sprint_id?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          evidence_snapshot_ids?: string[]
          id?: string
          justification_text?: string
          recommendation?: string
          sprint_id?: string | null
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manager_recommendations_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_recommendations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          company_size_key: string | null
          created_at: string
          id: string
          industry: string | null
          metadata: Json
          name: string
          region: string | null
          updated_at: string
        }
        Insert: {
          company_size_key?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          metadata?: Json
          name: string
          region?: string | null
          updated_at?: string
        }
        Update: {
          company_size_key?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          metadata?: Json
          name?: string
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      person_readiness_history: {
        Row: {
          captured_at: string
          career_key: string | null
          created_at: string
          dimensions_json: Json
          id: string
          level: number | null
          metadata_json: Json
          organization_id: string | null
          recommendation: string | null
          risk_summary_json: Json
          snapshot_kind: string
          source_report_id: string | null
          source_session_id: string | null
          sprint_id: string | null
          team_id: string | null
          user_id: string
        }
        Insert: {
          captured_at?: string
          career_key?: string | null
          created_at?: string
          dimensions_json?: Json
          id?: string
          level?: number | null
          metadata_json?: Json
          organization_id?: string | null
          recommendation?: string | null
          risk_summary_json?: Json
          snapshot_kind: string
          source_report_id?: string | null
          source_session_id?: string | null
          sprint_id?: string | null
          team_id?: string | null
          user_id: string
        }
        Update: {
          captured_at?: string
          career_key?: string | null
          created_at?: string
          dimensions_json?: Json
          id?: string
          level?: number | null
          metadata_json?: Json
          organization_id?: string | null
          recommendation?: string | null
          risk_summary_json?: Json
          snapshot_kind?: string
          source_report_id?: string | null
          source_session_id?: string | null
          sprint_id?: string | null
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_readiness_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_readiness_history_source_report_id_fkey"
            columns: ["source_report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_readiness_history_source_session_id_fkey"
            columns: ["source_session_id"]
            isOneToOne: false
            referencedRelation: "simulation_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_readiness_history_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_readiness_history_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_readiness_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_attempts: {
        Row: {
          completed_at: string | null
          created_at: string
          feedback_json: Json
          id: string
          practice_beat_id: string
          practice_unlock_id: string | null
          response_json: Json
          score_band: string | null
          score_numeric: number | null
          source_session_id: string | null
          sprint_id: string | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          feedback_json?: Json
          id?: string
          practice_beat_id: string
          practice_unlock_id?: string | null
          response_json?: Json
          score_band?: string | null
          score_numeric?: number | null
          source_session_id?: string | null
          sprint_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          feedback_json?: Json
          id?: string
          practice_beat_id?: string
          practice_unlock_id?: string | null
          response_json?: Json
          score_band?: string | null
          score_numeric?: number | null
          source_session_id?: string | null
          sprint_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_attempts_practice_beat_id_fkey"
            columns: ["practice_beat_id"]
            isOneToOne: false
            referencedRelation: "practice_beats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_attempts_practice_unlock_id_fkey"
            columns: ["practice_unlock_id"]
            isOneToOne: false
            referencedRelation: "practice_unlocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_attempts_source_session_id_fkey"
            columns: ["source_session_id"]
            isOneToOne: false
            referencedRelation: "simulation_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_attempts_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_beats: {
        Row: {
          career_key: string | null
          completion_criteria_json: Json
          content_json: Json
          created_at: string
          dimension_key: string | null
          duration_estimate_min: number
          expected_signals_json: Json
          id: string
          level: number | null
          slug: string
          status: string
          target_gap_keys: string[]
          title: string
          updated_at: string
        }
        Insert: {
          career_key?: string | null
          completion_criteria_json?: Json
          content_json?: Json
          created_at?: string
          dimension_key?: string | null
          duration_estimate_min?: number
          expected_signals_json?: Json
          id?: string
          level?: number | null
          slug: string
          status?: string
          target_gap_keys?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          career_key?: string | null
          completion_criteria_json?: Json
          content_json?: Json
          created_at?: string
          dimension_key?: string | null
          duration_estimate_min?: number
          expected_signals_json?: Json
          id?: string
          level?: number | null
          slug?: string
          status?: string
          target_gap_keys?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      practice_unlocks: {
        Row: {
          completed_at: string | null
          created_at: string
          dimension_key: string | null
          due_at: string | null
          gap_key: string | null
          id: string
          metadata_json: Json
          practice_beat_id: string
          source_session_id: string | null
          sprint_id: string | null
          status: string
          unlock_reason: string | null
          unlocked_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          dimension_key?: string | null
          due_at?: string | null
          gap_key?: string | null
          id?: string
          metadata_json?: Json
          practice_beat_id: string
          source_session_id?: string | null
          sprint_id?: string | null
          status?: string
          unlock_reason?: string | null
          unlocked_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          dimension_key?: string | null
          due_at?: string | null
          gap_key?: string | null
          id?: string
          metadata_json?: Json
          practice_beat_id?: string
          source_session_id?: string | null
          sprint_id?: string | null
          status?: string
          unlock_reason?: string | null
          unlocked_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_unlocks_practice_beat_id_fkey"
            columns: ["practice_beat_id"]
            isOneToOne: false
            referencedRelation: "practice_beats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_unlocks_source_session_id_fkey"
            columns: ["source_session_id"]
            isOneToOne: false
            referencedRelation: "simulation_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_unlocks_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_unlocks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_windows: {
        Row: {
          count: number
          key: string
          reset_at: string
          updated_at: string
        }
        Insert: {
          count?: number
          key: string
          reset_at: string
          updated_at?: string
        }
        Update: {
          count?: number
          key?: string
          reset_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          generated_at: string
          generated_by: string | null
          id: string
          payload_json: Json
          report_type: string
          shared_at: string | null
          simulation_session_id: string | null
          sprint_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          generated_at?: string
          generated_by?: string | null
          id?: string
          payload_json?: Json
          report_type: string
          shared_at?: string | null
          simulation_session_id?: string | null
          sprint_id: string
          status?: string
          user_id?: string | null
        }
        Update: {
          generated_at?: string
          generated_by?: string | null
          id?: string
          payload_json?: Json
          report_type?: string
          shared_at?: string | null
          simulation_session_id?: string | null
          sprint_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_simulation_session_id_fkey"
            columns: ["simulation_session_id"]
            isOneToOne: false
            referencedRelation: "simulation_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_events: {
        Row: {
          action_taken: string | null
          case_step_id: string | null
          created_at: string
          detected_by: string
          dimension_key: string | null
          escalation_status: string
          event_type: string
          evidence_text: string
          id: string
          judge_confidence: number | null
          jurisdiction_of_data_subject: string | null
          manager_notified_at: string | null
          payload_json: Json
          sensitive_data_type: string | null
          severity: string
          simulation_session_id: string
          transfer_basis_documented: boolean | null
        }
        Insert: {
          action_taken?: string | null
          case_step_id?: string | null
          created_at?: string
          detected_by?: string
          dimension_key?: string | null
          escalation_status?: string
          event_type: string
          evidence_text: string
          id?: string
          judge_confidence?: number | null
          jurisdiction_of_data_subject?: string | null
          manager_notified_at?: string | null
          payload_json?: Json
          sensitive_data_type?: string | null
          severity: string
          simulation_session_id: string
          transfer_basis_documented?: boolean | null
        }
        Update: {
          action_taken?: string | null
          case_step_id?: string | null
          created_at?: string
          detected_by?: string
          dimension_key?: string | null
          escalation_status?: string
          event_type?: string
          evidence_text?: string
          id?: string
          judge_confidence?: number | null
          jurisdiction_of_data_subject?: string | null
          manager_notified_at?: string | null
          payload_json?: Json
          sensitive_data_type?: string | null
          severity?: string
          simulation_session_id?: string
          transfer_basis_documented?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_events_case_step_id_fkey"
            columns: ["case_step_id"]
            isOneToOne: false
            referencedRelation: "case_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_events_simulation_session_id_fkey"
            columns: ["simulation_session_id"]
            isOneToOne: false
            referencedRelation: "simulation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      rubric_criteria: {
        Row: {
          created_at: string
          criteria_json: Json
          criteria_key: string
          id: string
          internal_label: string
          internal_weight: number | null
          is_public: boolean
          penalties_json: Json
          rubric_dimension_id: string
          thresholds_json: Json
        }
        Insert: {
          created_at?: string
          criteria_json?: Json
          criteria_key: string
          id?: string
          internal_label: string
          internal_weight?: number | null
          is_public?: boolean
          penalties_json?: Json
          rubric_dimension_id: string
          thresholds_json?: Json
        }
        Update: {
          created_at?: string
          criteria_json?: Json
          criteria_key?: string
          id?: string
          internal_label?: string
          internal_weight?: number | null
          is_public?: boolean
          penalties_json?: Json
          rubric_dimension_id?: string
          thresholds_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "rubric_criteria_rubric_dimension_id_fkey"
            columns: ["rubric_dimension_id"]
            isOneToOne: false
            referencedRelation: "rubric_dimensions"
            referencedColumns: ["id"]
          },
        ]
      }
      rubric_dimensions: {
        Row: {
          created_at: string
          dimension_key: string
          display_order: number
          id: string
          internal_weight: number | null
          public_definition: string
          public_weight: number | null
          rubric_id: string
        }
        Insert: {
          created_at?: string
          dimension_key: string
          display_order: number
          id?: string
          internal_weight?: number | null
          public_definition: string
          public_weight?: number | null
          rubric_id: string
        }
        Update: {
          created_at?: string
          dimension_key?: string
          display_order?: number
          id?: string
          internal_weight?: number | null
          public_definition?: string
          public_weight?: number | null
          rubric_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rubric_dimensions_rubric_id_fkey"
            columns: ["rubric_id"]
            isOneToOne: false
            referencedRelation: "rubrics"
            referencedColumns: ["id"]
          },
        ]
      }
      rubrics: {
        Row: {
          change_log_json: Json
          created_at: string
          description: string | null
          frozen_at: string | null
          frozen_by: string | null
          id: string
          semver_policy_json: Json
          slug: string
          status: string
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          change_log_json?: Json
          created_at?: string
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          semver_policy_json?: Json
          slug: string
          status?: string
          title: string
          updated_at?: string
          version: string
        }
        Update: {
          change_log_json?: Json
          created_at?: string
          description?: string | null
          frozen_at?: string | null
          frozen_by?: string | null
          id?: string
          semver_policy_json?: Json
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "rubrics_frozen_by_fkey"
            columns: ["frozen_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_sessions: {
        Row: {
          assignment_id: string
          case_variant_id: string
          completed_at: string | null
          id: string
          last_event_at: string | null
          metadata: Json
          sprint_id: string | null
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          assignment_id: string
          case_variant_id: string
          completed_at?: string | null
          id?: string
          last_event_at?: string | null
          metadata?: Json
          sprint_id?: string | null
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          assignment_id?: string
          case_variant_id?: string
          completed_at?: string | null
          id?: string
          last_event_at?: string | null
          metadata?: Json
          sprint_id?: string | null
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulation_sessions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulation_sessions_case_variant_id_fkey"
            columns: ["case_variant_id"]
            isOneToOne: false
            referencedRelation: "case_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulation_sessions_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulation_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_step_events: {
        Row: {
          captured_at: string
          case_step_id: string | null
          event_type: string
          id: string
          payload_json: Json
          simulation_session_id: string
          step_ordinal: number
        }
        Insert: {
          captured_at?: string
          case_step_id?: string | null
          event_type: string
          id?: string
          payload_json?: Json
          simulation_session_id: string
          step_ordinal: number
        }
        Update: {
          captured_at?: string
          case_step_id?: string | null
          event_type?: string
          id?: string
          payload_json?: Json
          simulation_session_id?: string
          step_ordinal?: number
        }
        Relationships: [
          {
            foreignKeyName: "simulation_step_events_case_step_id_fkey"
            columns: ["case_step_id"]
            isOneToOne: false
            referencedRelation: "case_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulation_step_events_simulation_session_id_fkey"
            columns: ["simulation_session_id"]
            isOneToOne: false
            referencedRelation: "simulation_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_package_cases: {
        Row: {
          case_template_id: string
          created_at: string
          difficulty: string | null
          dimensions_emphasized: string[]
          display_order: number
          id: string
          is_required: boolean
          primary_variant_id: string | null
          resim_variant_id: string | null
          sprint_package_id: string
          status: string
          tension: string | null
        }
        Insert: {
          case_template_id: string
          created_at?: string
          difficulty?: string | null
          dimensions_emphasized?: string[]
          display_order: number
          id?: string
          is_required?: boolean
          primary_variant_id?: string | null
          resim_variant_id?: string | null
          sprint_package_id: string
          status?: string
          tension?: string | null
        }
        Update: {
          case_template_id?: string
          created_at?: string
          difficulty?: string | null
          dimensions_emphasized?: string[]
          display_order?: number
          id?: string
          is_required?: boolean
          primary_variant_id?: string | null
          resim_variant_id?: string | null
          sprint_package_id?: string
          status?: string
          tension?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sprint_package_cases_case_template_id_fkey"
            columns: ["case_template_id"]
            isOneToOne: false
            referencedRelation: "case_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_package_cases_primary_variant_id_fkey"
            columns: ["primary_variant_id"]
            isOneToOne: false
            referencedRelation: "case_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_package_cases_resim_variant_id_fkey"
            columns: ["resim_variant_id"]
            isOneToOne: false
            referencedRelation: "case_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprint_package_cases_sprint_package_id_fkey"
            columns: ["sprint_package_id"]
            isOneToOne: false
            referencedRelation: "sprint_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      sprint_packages: {
        Row: {
          config_json: Json
          created_at: string
          duration_days: number
          id: string
          included_cases: number
          included_seats: number | null
          name: string
          price_usd: number | null
          pricing_json: Json
          slug: string
          status: string
          target_buyer: string | null
          target_roles: string[]
          updated_at: string
          version: number
        }
        Insert: {
          config_json?: Json
          created_at?: string
          duration_days: number
          id?: string
          included_cases: number
          included_seats?: number | null
          name: string
          price_usd?: number | null
          pricing_json?: Json
          slug: string
          status?: string
          target_buyer?: string | null
          target_roles?: string[]
          updated_at?: string
          version?: number
        }
        Update: {
          config_json?: Json
          created_at?: string
          duration_days?: number
          id?: string
          included_cases?: number
          included_seats?: number | null
          name?: string
          price_usd?: number | null
          pricing_json?: Json
          slug?: string
          status?: string
          target_buyer?: string | null
          target_roles?: string[]
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      sprints: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          metadata: Json
          name: string
          organization_id: string
          sprint_package_id: string | null
          start_date: string | null
          status: string
          target_dimensions: string[]
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          metadata?: Json
          name: string
          organization_id: string
          sprint_package_id?: string | null
          start_date?: string | null
          status?: string
          target_dimensions?: string[]
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          metadata?: Json
          name?: string
          organization_id?: string
          sprint_package_id?: string | null
          start_date?: string | null
          status?: string
          target_dimensions?: string[]
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprints_sprint_package_id_fkey"
            columns: ["sprint_package_id"]
            isOneToOne: false
            referencedRelation: "sprint_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sprints_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json
          organization_id: string
          price_usd_total: number | null
          seats: number
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json
          organization_id: string
          price_usd_total?: number | null
          seats?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json
          organization_id?: string
          price_usd_total?: number | null
          seats?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_memberships: {
        Row: {
          created_at: string
          id: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_memberships_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          department_key: string | null
          id: string
          metadata: Json
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_key?: string | null
          id?: string
          metadata?: Json
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_key?: string | null
          id?: string
          metadata?: Json
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string | null
          consent_accepted_at: string | null
          consent_locale: string
          consent_metadata_json: Json
          consent_version: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          jurisdiction: string
          locale: string
          metadata: Json
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          consent_accepted_at?: string | null
          consent_locale?: string
          consent_metadata_json?: Json
          consent_version?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          jurisdiction?: string
          locale?: string
          metadata?: Json
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          consent_accepted_at?: string | null
          consent_locale?: string
          consent_metadata_json?: Json
          consent_version?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          jurisdiction?: string
          locale?: string
          metadata?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      compute_recommendation: {
        Args: { p_session_id: string }
        Returns: {
          justification: Json
          recommendation: string
        }[]
      }
      compute_transfer_delta: {
        Args: { p_primary_session_id: string; p_resim_session_id: string }
        Returns: {
          delta_score: number
          dimension_key: string
          improved: boolean
          primary_band: string
          primary_score: number
          resim_band: string
          resim_score: number
        }[]
      }
      consume_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number }
        Returns: {
          limit_value: number
          remaining: number
          reset_ms: number
          success: boolean
        }[]
      }
      current_simulador_user_id: { Args: never; Returns: string }
      ensure_bridge_user: { Args: { p_auth_user_id: string }; Returns: string }
      has_org_role: {
        Args: { p_org_id: string; p_roles: string[] }
        Returns: boolean
      }
      has_team_role: {
        Args: { p_roles: string[]; p_team_id: string }
        Returns: boolean
      }
      is_org_admin: { Args: { p_org_id: string }; Returns: boolean }
      user_in_org: { Args: { p_org_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  simulador: {
    Enums: {},
  },
} as const

// Backward-compatible aliases used by the simulator code.
export type SimuladorDatabase = Database
export type SimuladorTables = Database["simulador"]["Tables"]
export type SimuladorFunctions = Database["simulador"]["Functions"]
