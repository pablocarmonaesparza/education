-- El Simulador v0 schema draft
-- Estado: SNAPSHOT HISTORICO (2026-05). La verdad del schema vive en
-- supabase/migrations/ — este archivo YA DIVERGIO (ej.: falta 'submitted' en
-- simulation_sessions.status; risk_events conserva las 5 dimensiones legacy,
-- retiradas por las 6 canonicas de la migracion 20260608000000). Ver
-- docs/coord/RULES_LEDGER.md R-24. NO correr como migracion, NO citar como
-- autoridad de schema.

create extension if not exists pgcrypto;

create schema if not exists simulador;

-- ---------------------------------------------------------------------------
-- Identity and org structure
-- ---------------------------------------------------------------------------

create table if not exists simulador.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  region text,
  company_size_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists simulador.teams (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references simulador.organizations(id) on delete cascade,
  name text not null,
  department_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists simulador.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text not null unique,
  full_name text,
  locale text not null default 'es-MX',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists simulador.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references simulador.organizations(id) on delete cascade,
  user_id uuid not null references simulador.users(id) on delete cascade,
  -- Roles are additive in v0. Permissions are computed as a union of roles.
  role text not null check (role in ('org_admin', 'billing_admin', 'viewer')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id, role)
);

create table if not exists simulador.team_memberships (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references simulador.teams(id) on delete cascade,
  user_id uuid not null references simulador.users(id) on delete cascade,
  -- Roles are additive in v0: a manager can also run simulations as an employee.
  role text not null check (role in ('manager', 'employee', 'viewer')),
  created_at timestamptz not null default now(),
  unique (team_id, user_id, role)
);

-- ---------------------------------------------------------------------------
-- Rubrics
-- ---------------------------------------------------------------------------

create table if not exists simulador.rubrics (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  version text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, version)
);

create table if not exists simulador.rubric_dimensions (
  id uuid primary key default gen_random_uuid(),
  rubric_id uuid not null references simulador.rubrics(id) on delete cascade,
  dimension_key text not null,
  public_definition text not null,
  display_order int not null,
  public_weight numeric(6,3),
  internal_weight numeric(6,3),
  created_at timestamptz not null default now(),
  unique (rubric_id, dimension_key)
);

create table if not exists simulador.rubric_criteria (
  id uuid primary key default gen_random_uuid(),
  rubric_dimension_id uuid not null references simulador.rubric_dimensions(id) on delete cascade,
  criteria_key text not null,
  internal_label text not null,
  criteria_json jsonb not null default '{}'::jsonb,
  thresholds_json jsonb not null default '{}'::jsonb,
  penalties_json jsonb not null default '{}'::jsonb,
  internal_weight numeric(6,3),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  unique (rubric_dimension_id, criteria_key)
);

-- ---------------------------------------------------------------------------
-- Sprint packages and running sprints
-- ---------------------------------------------------------------------------

create table if not exists simulador.sprint_packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  version int not null default 1,
  name text not null,
  target_buyer text,
  target_roles text[] not null default '{}',
  duration_days int not null,
  included_cases int not null,
  included_seats int,
  price_usd numeric(12,2),
  pricing_json jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  config_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, version)
);

create table if not exists simulador.sprints (
  id uuid primary key default gen_random_uuid(),
  sprint_package_id uuid references simulador.sprint_packages(id),
  organization_id uuid not null references simulador.organizations(id) on delete cascade,
  team_id uuid not null references simulador.teams(id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'active', 'completed', 'cancelled')),
  target_dimensions text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Case templates and variants
-- ---------------------------------------------------------------------------

create table if not exists simulador.case_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  version int not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  difficulty text not null check (difficulty in ('baseline', 'intermediate', 'advanced')),
  locale text not null default 'es-MX',
  title text not null,
  target_roles text[] not null default '{}',
  duration_estimate_min int,
  rubric_id uuid references simulador.rubrics(id),
  freshness_json jsonb not null default '{}'::jsonb,
  expected_manager_action_json jsonb not null default '{}'::jsonb,
  required_template_vars text[] not null default '{}',
  context_template_json jsonb not null default '{}'::jsonb,
  data_policy_json jsonb not null default '{}'::jsonb,
  telemetry_required text[] not null default '{}',
  evaluation_meta_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, version)
);

create table if not exists simulador.case_steps (
  id uuid primary key default gen_random_uuid(),
  case_template_id uuid not null references simulador.case_templates(id) on delete cascade,
  step_key text not null,
  ordinal int not null,
  step_type text not null check (step_type in ('data_scope', 'llm_beat', 'artifact_review', 'decision_select', 'decision_open_short')),
  prompt_template text,
  config_json jsonb not null default '{}'::jsonb,
  evaluates_dimensions text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (case_template_id, step_key),
  unique (case_template_id, ordinal)
);

create table if not exists simulador.case_inputs_spec (
  id uuid primary key default gen_random_uuid(),
  case_template_id uuid not null references simulador.case_templates(id) on delete cascade,
  kind text not null,
  name text not null,
  schema_json jsonb not null default '{}'::jsonb,
  content_template_ref text,
  sample_rows_ref text,
  config_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists simulador.case_variants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  case_template_id uuid not null references simulador.case_templates(id) on delete restrict,
  parent_variant_id uuid references simulador.case_variants(id) on delete set null,
  variant_role text not null check (variant_role in ('primary', 'resimulation', 'benchmark', 'custom')),
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  delay_days_from_parent int,
  template_var_values_json jsonb not null default '{}'::jsonb,
  inputs_resolved_json jsonb not null default '{}'::jsonb,
  expected_behavior_shift text,
  synthetic_data boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists simulador.sprint_package_cases (
  id uuid primary key default gen_random_uuid(),
  sprint_package_id uuid not null references simulador.sprint_packages(id) on delete cascade,
  case_template_id uuid not null references simulador.case_templates(id) on delete restrict,
  display_order int not null,
  status text not null default 'planned' check (status in ('ready', 'planned', 'archived')),
  primary_variant_id uuid references simulador.case_variants(id) on delete restrict,
  resim_variant_id uuid references simulador.case_variants(id) on delete restrict,
  dimensions_emphasized text[] not null default '{}',
  difficulty text check (difficulty in ('baseline', 'intermediate', 'advanced')),
  tension text,
  is_required boolean not null default true,
  created_at timestamptz not null default now(),
  unique (sprint_package_id, case_template_id)
);

-- ---------------------------------------------------------------------------
-- Gaps and practice
-- ---------------------------------------------------------------------------

create table if not exists simulador.gap_definitions (
  id uuid primary key default gen_random_uuid(),
  case_template_id uuid not null references simulador.case_templates(id) on delete cascade,
  gap_key text not null,
  dimension_key text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  triggered_by_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (case_template_id, gap_key)
);

create table if not exists simulador.practice_beats (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  target_gap_keys text[] not null default '{}',
  duration_estimate_min int not null default 2,
  content_json jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists simulador.case_practice_beats (
  id uuid primary key default gen_random_uuid(),
  case_template_id uuid not null references simulador.case_templates(id) on delete cascade,
  gap_definition_id uuid not null references simulador.gap_definitions(id) on delete cascade,
  practice_beat_id uuid not null references simulador.practice_beats(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (case_template_id, gap_definition_id, practice_beat_id)
);

-- ---------------------------------------------------------------------------
-- Assignments and runtime
-- ---------------------------------------------------------------------------

create table if not exists simulador.assignments (
  id uuid primary key default gen_random_uuid(),
  sprint_id uuid not null references simulador.sprints(id) on delete cascade,
  user_id uuid not null references simulador.users(id) on delete cascade,
  case_variant_id uuid not null references simulador.case_variants(id) on delete restrict,
  assignment_kind text not null default 'primary' check (assignment_kind in ('primary', 'resimulation')),
  parent_assignment_id uuid references simulador.assignments(id) on delete set null,
  due_at timestamptz,
  status text not null default 'assigned' check (status in ('assigned', 'started', 'completed', 'expired', 'cancelled')),
  assigned_by uuid references simulador.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sprint_id, user_id, case_variant_id)
);

create table if not exists simulador.simulation_sessions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references simulador.assignments(id) on delete cascade,
  case_variant_id uuid not null references simulador.case_variants(id) on delete restrict,
  user_id uuid not null references simulador.users(id) on delete cascade,
  sprint_id uuid references simulador.sprints(id) on delete set null,
  status text not null default 'in_progress' check (status in ('not_started', 'in_progress', 'paused', 'completed', 'evaluated', 'practice_assigned', 'evidence_emitted', 'expired')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  last_event_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists simulador.simulation_step_events (
  id uuid primary key default gen_random_uuid(),
  simulation_session_id uuid not null references simulador.simulation_sessions(id) on delete cascade,
  case_step_id uuid references simulador.case_steps(id) on delete set null,
  step_ordinal int not null,
  event_type text not null,
  payload_json jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now()
);

create table if not exists simulador.llm_interactions (
  id uuid primary key default gen_random_uuid(),
  simulation_session_id uuid not null references simulador.simulation_sessions(id) on delete cascade,
  case_step_id uuid references simulador.case_steps(id) on delete set null,
  turn_index int not null,
  provider_key text not null,
  model_key text not null,
  user_prompt text,
  model_response text,
  token_usage_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (simulation_session_id, case_step_id, turn_index)
);

create table if not exists simulador.behavior_events (
  id uuid primary key default gen_random_uuid(),
  simulation_session_id uuid not null references simulador.simulation_sessions(id) on delete cascade,
  case_step_id uuid references simulador.case_steps(id) on delete set null,
  event_type text not null,
  payload_json jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now()
);

create table if not exists simulador.risk_events (
  id uuid primary key default gen_random_uuid(),
  simulation_session_id uuid not null references simulador.simulation_sessions(id) on delete cascade,
  case_step_id uuid references simulador.case_steps(id) on delete set null,
  event_type text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  dimension_key text check (dimension_key in ('contexto', 'privacidad', 'validacion', 'juicio', 'decision')),
  sensitive_data_type text,
  evidence_text text,
  action_taken text,
  manager_notified_at timestamptz,
  escalation_status text not null default 'none' check (escalation_status in ('none', 'pending', 'notified', 'resolved', 'dismissed')),
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Evaluation, evidence, reporting
-- ---------------------------------------------------------------------------

create table if not exists simulador.evaluation_runs (
  id uuid primary key default gen_random_uuid(),
  simulation_session_id uuid not null references simulador.simulation_sessions(id) on delete cascade,
  rubric_id uuid not null references simulador.rubrics(id) on delete restrict,
  rubric_version text not null,
  judge_model text not null,
  judge_prompt_version text not null,
  input_snapshot_json jsonb not null default '{}'::jsonb,
  dimension_scores_json jsonb not null default '{}'::jsonb,
  gap_tags_json jsonb not null default '[]'::jsonb,
  risk_summary_json jsonb not null default '{}'::jsonb,
  raw_judge_output_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists simulador.human_review_queue (
  id uuid primary key default gen_random_uuid(),
  evaluation_run_id uuid not null references simulador.evaluation_runs(id) on delete cascade,
  triggered_by text not null check (triggered_by in (
    'low_judge_confidence',
    'high_risk_event',
    'user_flagged',
    'random_audit'
  )),
  status text not null default 'queued' check (status in (
    'queued',
    'in_review',
    'resolved',
    'escalated',
    'cancelled'
  )),
  assigned_to uuid references simulador.users(id) on delete set null,
  due_at timestamptz,
  resolved_at timestamptz,
  resolver_notes text,
  override_dimension_scores_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists simulador.evidence_snapshots (
  id uuid primary key default gen_random_uuid(),
  simulation_session_id uuid references simulador.simulation_sessions(id) on delete cascade,
  sprint_id uuid references simulador.sprints(id) on delete cascade,
  team_id uuid references simulador.teams(id) on delete cascade,
  user_id uuid references simulador.users(id) on delete cascade,
  evidence_kind text not null check (evidence_kind in (
    'readiness_dimension_scores',
    'risk_events_detected',
    'decision_replay',
    'transfer_delta',
    'manager_recommendation'
  )),
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists simulador.manager_recommendations (
  id uuid primary key default gen_random_uuid(),
  sprint_id uuid references simulador.sprints(id) on delete cascade,
  team_id uuid references simulador.teams(id) on delete cascade,
  user_id uuid references simulador.users(id) on delete set null,
  recommendation text not null check (recommendation in ('pilotar', 'entrenar', 'pausar', 'escalar')),
  justification_text text not null,
  evidence_snapshot_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists simulador.reports (
  id uuid primary key default gen_random_uuid(),
  sprint_id uuid not null references simulador.sprints(id) on delete cascade,
  user_id uuid references simulador.users(id) on delete cascade,
  report_type text not null check (report_type in (
    'executive_summary',
    'manager_detail',
    'csv_export',
    'certificate_export'
  )),
  status text not null default 'draft' check (status in ('draft', 'ready', 'shared', 'archived')),
  payload_json jsonb not null default '{}'::jsonb,
  generated_by uuid references simulador.users(id),
  generated_at timestamptz not null default now(),
  shared_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Audit
-- ---------------------------------------------------------------------------

create table if not exists simulador.audit_log (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  entity_id uuid,
  actor_id uuid references simulador.users(id) on delete set null,
  action text not null,
  before_state jsonb,
  after_state jsonb,
  occurred_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists idx_teams_org on simulador.teams(organization_id);
create index if not exists idx_org_memberships_user on simulador.organization_memberships(user_id);
create index if not exists idx_team_memberships_user on simulador.team_memberships(user_id);
create index if not exists idx_sprints_team on simulador.sprints(team_id);
create index if not exists idx_case_templates_slug_version on simulador.case_templates(slug, version);
create index if not exists idx_case_variants_template on simulador.case_variants(case_template_id);
create index if not exists idx_assignments_user_status on simulador.assignments(user_id, status);
create index if not exists idx_sessions_assignment on simulador.simulation_sessions(assignment_id);
create index if not exists idx_step_events_session on simulador.simulation_step_events(simulation_session_id, captured_at);
create index if not exists idx_llm_interactions_session on simulador.llm_interactions(simulation_session_id);
create index if not exists idx_behavior_events_session on simulador.behavior_events(simulation_session_id, captured_at);
create index if not exists idx_risk_events_session on simulador.risk_events(simulation_session_id, severity);
create index if not exists idx_evaluation_runs_session on simulador.evaluation_runs(simulation_session_id);
create index if not exists idx_human_review_queue_status_due on simulador.human_review_queue(status, due_at);
create index if not exists idx_evidence_sprint_kind on simulador.evidence_snapshots(sprint_id, evidence_kind);
create index if not exists idx_audit_entity on simulador.audit_log(entity, entity_id, occurred_at);
