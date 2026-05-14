-- ============================================================================
-- 017_simulador_v0.sql
-- ----------------------------------------------------------------------------
-- Schema multi-tenant del Simulador (producto B2B de diagnóstico operativo
-- de criterio en uso de IA). Vive en namespace `simulador` para aislamiento
-- de las tablas legacy en `public` (Itera Courses, a ser dropeadas en 019).
--
-- Basado en: docs/simulador/contrato_v0/schema/simulador_v0.sql
-- Ajustes vs ese borrador (alineación al contrato canónico DIAGNOSTICO_1_CASO_V0.md):
--   1. risk_events.event_type ahora es CHECK constraint con los 11 eventos del contrato
--   2. risk_events incluye jurisdiction_of_data_subject (MX/CO/BR/other) y transfer_basis_documented
--   3. reports.status incluye pending_review (cola humano review antes de publicar)
--   4. simulador.users.auth_user_id tiene FK a auth.users(id)
--   5. nueva tabla simulador.invitations (onboarding B2B con token)
--   6. nueva tabla simulador.subscriptions (link a Stripe customer/subscription)
--   7. nueva función simulador.compute_recommendation(session_id) — override matrix
--   8. índices adicionales para queries del dashboard y judge
--
-- RLS se aplica en 018_simulador_rls.sql (separado para revisar policies aparte).
-- ============================================================================

create extension if not exists pgcrypto;

create schema if not exists simulador;

-- ============================================================================
-- IDENTITY + ORG STRUCTURE
-- ============================================================================

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
  auth_user_id uuid unique references auth.users(id) on delete cascade,
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
  -- Roles son aditivos: un user puede tener varios roles dentro de una org.
  role text not null check (role in ('org_admin', 'billing_admin', 'viewer')),
  created_at timestamptz not null default now(),
  unique (organization_id, user_id, role)
);

create table if not exists simulador.team_memberships (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references simulador.teams(id) on delete cascade,
  user_id uuid not null references simulador.users(id) on delete cascade,
  -- Roles aditivos: un manager también puede correr simulaciones como employee.
  role text not null check (role in ('manager', 'employee', 'viewer')),
  created_at timestamptz not null default now(),
  unique (team_id, user_id, role)
);

-- Invitaciones por email pre-signup (W3: onboarding B2B).
create table if not exists simulador.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references simulador.organizations(id) on delete cascade,
  team_id uuid references simulador.teams(id) on delete set null,
  invited_by uuid not null references simulador.users(id) on delete restrict,
  email text not null,
  token text not null unique,
  intended_role text not null check (intended_role in ('manager', 'employee', 'viewer')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  accepted_by uuid references simulador.users(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  unique (organization_id, email, status) deferrable initially deferred
);

-- Link a Stripe subscription (W3: billing B2B).
create table if not exists simulador.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references simulador.organizations(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null default 'trial' check (status in ('trial', 'active', 'past_due', 'cancelled', 'paused')),
  tier text not null check (tier in ('fase_0_research', 'fase_1_diagnostic', 'fase_2_sprint', 'fase_3_recurrente')),
  seats int not null default 1,
  price_usd_total numeric(12,2),
  current_period_start timestamptz,
  current_period_end timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- RUBRICS
-- ============================================================================

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
  dimension_key text not null check (dimension_key in ('contexto', 'privacidad', 'validacion', 'juicio', 'decision')),
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

-- ============================================================================
-- SPRINT PACKAGES + RUNNING SPRINTS
-- ============================================================================

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

-- ============================================================================
-- CASE TEMPLATES + VARIANTS
-- ============================================================================

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

-- ============================================================================
-- GAPS + PRACTICE
-- ============================================================================

create table if not exists simulador.gap_definitions (
  id uuid primary key default gen_random_uuid(),
  case_template_id uuid not null references simulador.case_templates(id) on delete cascade,
  gap_key text not null,
  dimension_key text not null check (dimension_key in ('contexto', 'privacidad', 'validacion', 'juicio', 'decision')),
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

-- ============================================================================
-- ASSIGNMENTS + RUNTIME
-- ============================================================================

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
  status text not null default 'in_progress' check (status in (
    'not_started', 'in_progress', 'paused', 'completed', 'submitted',
    'evaluated', 'practice_assigned', 'evidence_emitted', 'expired'
  )),
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

-- ============================================================================
-- RISK EVENTS (alineado al catálogo del contrato DIAGNOSTICO_1_CASO_V0.md §9)
-- ============================================================================

create table if not exists simulador.risk_events (
  id uuid primary key default gen_random_uuid(),
  simulation_session_id uuid not null references simulador.simulation_sessions(id) on delete cascade,
  case_step_id uuid references simulador.case_steps(id) on delete set null,
  -- 11 event_types canónicos del contrato. Cualquier nuevo evento requiere
  -- versionar la rúbrica + actualizar este CHECK.
  event_type text not null check (event_type in (
    'exposed_pii_to_model',
    'hidden_pii_usage_from_authority',
    'accepted_unverified_claim',
    'accepted_hallucinated_figures',
    'used_sensitive_commercial_data',
    'shared_third_party_confidential',
    'used_unapproved_vendor',
    'prompt_injection_unawareness',
    'over_relied_on_output',
    'overblocked_without_discrimination',
    'ignored_escalation_path'
  )),
  severity text not null check (severity in ('low', 'medium', 'high')),
  dimension_key text check (dimension_key in ('contexto', 'privacidad', 'validacion', 'juicio', 'decision')),
  sensitive_data_type text,
  evidence_text text not null,  -- Obligatorio por contrato. Sin cita literal del transcript, el evento es inválido.
  -- Atributos LATAM (contrato §9): solo aplican cuando el evento toca PII.
  jurisdiction_of_data_subject text check (jurisdiction_of_data_subject in ('MX', 'CO', 'BR', 'other')),
  transfer_basis_documented boolean,
  detected_by text not null default 'judge' check (detected_by in ('judge', 'human', 'hybrid')),
  judge_confidence numeric(4,3),
  action_taken text,
  manager_notified_at timestamptz,
  escalation_status text not null default 'none' check (escalation_status in ('none', 'pending', 'notified', 'resolved', 'dismissed')),
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- EVALUATION + EVIDENCE + REPORTS
-- ============================================================================

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
  computed_recommendation text check (computed_recommendation in ('pilotar', 'entrenar', 'pausar', 'escalar')),
  override_applied_json jsonb not null default '{}'::jsonb,
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
  override_recommendation text check (override_recommendation in ('pilotar', 'entrenar', 'pausar', 'escalar')),
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
  simulation_session_id uuid references simulador.simulation_sessions(id) on delete set null,
  report_type text not null check (report_type in (
    'executive_summary',
    'manager_detail',
    'participant_mirror',
    'csv_export',
    'certificate_export'
  )),
  status text not null default 'draft' check (status in (
    'draft', 'pending_review', 'published', 'shared', 'archived'
  )),
  payload_json jsonb not null default '{}'::jsonb,
  generated_by uuid references simulador.users(id),
  generated_at timestamptz not null default now(),
  shared_at timestamptz
);

-- ============================================================================
-- AUDIT
-- ============================================================================

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

-- ============================================================================
-- INDICES
-- ============================================================================

create index if not exists idx_teams_org on simulador.teams(organization_id);
create index if not exists idx_org_memberships_user on simulador.organization_memberships(user_id);
create index if not exists idx_team_memberships_user on simulador.team_memberships(user_id);
create index if not exists idx_invitations_token on simulador.invitations(token);
create index if not exists idx_invitations_email_status on simulador.invitations(email, status);
create index if not exists idx_subscriptions_org on simulador.subscriptions(organization_id);
create index if not exists idx_subscriptions_stripe_sub on simulador.subscriptions(stripe_subscription_id);
create index if not exists idx_sprints_team on simulador.sprints(team_id);
create index if not exists idx_case_templates_slug_version on simulador.case_templates(slug, version);
create index if not exists idx_case_variants_template on simulador.case_variants(case_template_id);
create index if not exists idx_assignments_user_status on simulador.assignments(user_id, status);
create index if not exists idx_sessions_assignment on simulador.simulation_sessions(assignment_id);
create index if not exists idx_sessions_user_status on simulador.simulation_sessions(user_id, status);
create index if not exists idx_step_events_session on simulador.simulation_step_events(simulation_session_id, captured_at);
create index if not exists idx_llm_interactions_session on simulador.llm_interactions(simulation_session_id);
create index if not exists idx_behavior_events_session on simulador.behavior_events(simulation_session_id, captured_at);
create index if not exists idx_risk_events_session on simulador.risk_events(simulation_session_id, severity);
create index if not exists idx_risk_events_event_type on simulador.risk_events(event_type, severity);
create index if not exists idx_evaluation_runs_session on simulador.evaluation_runs(simulation_session_id);
create index if not exists idx_human_review_queue_status_due on simulador.human_review_queue(status, due_at);
create index if not exists idx_evidence_sprint_kind on simulador.evidence_snapshots(sprint_id, evidence_kind);
create index if not exists idx_reports_sprint_user on simulador.reports(sprint_id, user_id);
create index if not exists idx_reports_status on simulador.reports(status);
create index if not exists idx_audit_entity on simulador.audit_log(entity, entity_id, occurred_at);

-- ============================================================================
-- OVERRIDE MATRIX FUNCTION (contrato §10)
-- ----------------------------------------------------------------------------
-- Computa la recomendación final aplicando los caps determinísticos sobre las
-- bandas del judge. Las dimensiones miden HABILIDAD; los risk_events MODIFICAN
-- la recomendación.
--
-- Reglas (orden de evaluación):
--   1. 0 risk high + todas Alto                  → Pilotar
--   2. 0 risk high + 1-2 Medio + 0 Bajo          → Pilotar (con supervisión)
--   3. 0 risk high + 2+ Bajo                     → Entrenar/Pausar según severidad
--   4. 1+ risk high → overrides:
--      - exposed_pii_to_model high + jurisdicción regulada (MX/CO/BR)
--        sin transfer_basis_documented           → Pausar
--      - hidden_pii_usage_from_authority high    → Pausar
--      - shared_third_party_confidential high    → Pausar
--      - used_unapproved_vendor high             → Pausar
--      - Cualquier risk high con PII             → max Entrenar
--      - accepted_hallucinated_figures high      → min Entrenar
--      - Fallo de política (campo metadata)      → Escalar
--
-- La función retorna SETOF (recommendation text, justification jsonb).
-- ============================================================================

create or replace function simulador.compute_recommendation(p_session_id uuid)
returns table (
  recommendation text,
  justification jsonb
)
language plpgsql
stable
as $$
declare
  v_session_id uuid := p_session_id;
  v_high_risks jsonb;
  v_bands jsonb;
  v_alto_count int;
  v_medio_count int;
  v_bajo_count int;
  v_max_allowed text := 'pilotar';  -- Por defecto, el más permisivo.
  v_min_required text := 'pilotar';
  v_final text;
  v_reasons jsonb := '[]'::jsonb;
  v_pii_high_in_regulated_jurisdiction boolean := false;
  v_hidden_pii boolean := false;
  v_third_party_nda boolean := false;
  v_unapproved_vendor boolean := false;
  v_hallucinated_figures boolean := false;
  v_any_pii_high boolean := false;
begin
  -- 1. Obtener bandas de la evaluación más reciente.
  select dimension_scores_json
    into v_bands
    from simulador.evaluation_runs
   where simulation_session_id = v_session_id
   order by created_at desc
   limit 1;

  if v_bands is null then
    return query select null::text, jsonb_build_object(
      'error', 'no_evaluation_run_found',
      'session_id', v_session_id
    );
    return;
  end if;

  -- Contar bandas (asume estructura {"contexto": "alto"|"medio"|"bajo", ...}).
  select
    count(*) filter (where value::text in ('"alto"','"Alto"','"A"')),
    count(*) filter (where value::text in ('"medio"','"Medio"','"M"')),
    count(*) filter (where value::text in ('"bajo"','"Bajo"','"B"'))
    into v_alto_count, v_medio_count, v_bajo_count
    from jsonb_each(v_bands);

  -- 2. Detectar risk events high y aplicar overrides.
  for v_high_risks in
    select jsonb_build_object(
      'event_type', event_type,
      'severity', severity,
      'jurisdiction', jurisdiction_of_data_subject,
      'transfer_basis', transfer_basis_documented,
      'dimension', dimension_key
    )
    from simulador.risk_events
   where simulation_session_id = v_session_id
     and severity = 'high'
  loop
    -- exposed_pii_to_model high + jurisdicción regulada sin base de transferencia
    if v_high_risks->>'event_type' = 'exposed_pii_to_model'
       and v_high_risks->>'jurisdiction' in ('MX', 'CO', 'BR')
       and coalesce((v_high_risks->>'transfer_basis')::boolean, false) = false then
      v_pii_high_in_regulated_jurisdiction := true;
      v_reasons := v_reasons || jsonb_build_object(
        'override', 'pausar',
        'reason', 'pii_high_regulated_jurisdiction_no_transfer_basis',
        'event', v_high_risks
      );
    end if;

    if v_high_risks->>'event_type' = 'hidden_pii_usage_from_authority' then
      v_hidden_pii := true;
      v_reasons := v_reasons || jsonb_build_object(
        'override', 'pausar',
        'reason', 'hidden_pii_usage_from_authority',
        'event', v_high_risks
      );
    end if;

    if v_high_risks->>'event_type' = 'shared_third_party_confidential' then
      v_third_party_nda := true;
      v_reasons := v_reasons || jsonb_build_object(
        'override', 'pausar',
        'reason', 'shared_third_party_confidential',
        'event', v_high_risks
      );
    end if;

    if v_high_risks->>'event_type' = 'used_unapproved_vendor' then
      v_unapproved_vendor := true;
      v_reasons := v_reasons || jsonb_build_object(
        'override', 'pausar',
        'reason', 'used_unapproved_vendor_policy_violation',
        'event', v_high_risks
      );
    end if;

    if v_high_risks->>'event_type' = 'accepted_hallucinated_figures' then
      v_hallucinated_figures := true;
      v_reasons := v_reasons || jsonb_build_object(
        'override', 'entrenar_min',
        'reason', 'accepted_hallucinated_figures_learnable_skill',
        'event', v_high_risks
      );
    end if;

    if v_high_risks->>'dimension' = 'privacidad'
       or v_high_risks->>'event_type' in (
         'exposed_pii_to_model',
         'hidden_pii_usage_from_authority',
         'used_sensitive_commercial_data',
         'shared_third_party_confidential'
       ) then
      v_any_pii_high := true;
    end if;
  end loop;

  -- 3. Aplicar reglas en orden de severidad (Pausar > Escalar > Entrenar > Pilotar).
  if v_pii_high_in_regulated_jurisdiction
     or v_hidden_pii
     or v_third_party_nda
     or v_unapproved_vendor then
    v_final := 'pausar';
  elsif v_any_pii_high then
    -- Cualquier PII high (sin override más fuerte) → max Entrenar
    v_final := 'entrenar';
  elsif v_hallucinated_figures then
    -- Hallucinated figures aislado → min Entrenar
    v_final := 'entrenar';
  elsif v_bajo_count >= 2 then
    -- 2+ dimensiones Bajo sin risks críticos → Entrenar
    v_final := 'entrenar';
  elsif v_alto_count = 5 then
    v_final := 'pilotar';
  elsif v_alto_count >= 3 and v_bajo_count = 0 then
    v_final := 'pilotar';
  else
    v_final := 'entrenar';
  end if;

  return query select v_final, jsonb_build_object(
    'recommendation', v_final,
    'bands_count', jsonb_build_object(
      'alto', v_alto_count,
      'medio', v_medio_count,
      'bajo', v_bajo_count
    ),
    'high_risk_count', (
      select count(*)
        from simulador.risk_events
       where simulation_session_id = v_session_id
         and severity = 'high'
    ),
    'override_reasons', v_reasons,
    'computed_at', now()
  );
end;
$$;

-- ============================================================================
-- TRIGGERS para updated_at
-- ============================================================================

create or replace function simulador.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare
  t record;
begin
  for t in
    select table_name
      from information_schema.columns
     where table_schema = 'simulador'
       and column_name = 'updated_at'
       and table_name not like 'pg_%'
  loop
    execute format(
      'drop trigger if exists trg_%I_updated_at on simulador.%I;',
      t.table_name, t.table_name
    );
    execute format(
      'create trigger trg_%I_updated_at before update on simulador.%I for each row execute function simulador.set_updated_at();',
      t.table_name, t.table_name
    );
  end loop;
end$$;

-- ============================================================================
-- COMMENTS (documentación inline para futuras revisiones)
-- ============================================================================

comment on schema simulador is 'Schema multi-tenant del producto Simulador (B2B AI readiness assessment). Aislado de public.';
comment on table simulador.risk_events is 'Catálogo extractivo de eventos de riesgo durante sesiones. evidence_text es obligatorio (contrato §9): sin cita literal del transcript, el evento es inválido.';
comment on column simulador.risk_events.event_type is '11 event_types canónicos. Versionar rúbrica antes de agregar nuevos.';
comment on column simulador.risk_events.jurisdiction_of_data_subject is 'MX/CO/BR/other. Solo cuando el evento toca PII de jurisdicción regulada (LFPDPPP/Ley 1581/LGPD).';
comment on column simulador.risk_events.transfer_basis_documented is 'Verdadero si hay base legal para transferencia internacional del dato. False = posible violación regulatoria.';
comment on function simulador.compute_recommendation is 'Override matrix del contrato §10. Computa Pilotar/Entrenar/Pausar/Escalar aplicando caps sobre bandas del judge.';
