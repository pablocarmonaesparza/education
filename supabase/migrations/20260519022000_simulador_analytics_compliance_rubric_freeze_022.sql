-- Migration 022 — Analytics catalog, LATAM consent, rubric freeze metadata
--
-- Adds the product-control layer needed for a premium simulator:
--   1. A declared telemetry catalog instead of ad-hoc event strings
--   2. Jurisdiction-aware consent metadata on users
--   3. Rubric freeze + semver metadata so reports remain auditable
--   4. Exact rubric/version FK support for evaluation runs

begin;

do $$
begin
  if to_regclass('simulador.users') is null then
    raise exception 'migration 022 requires simulador.users';
  end if;
  if to_regclass('simulador.rubrics') is null then
    raise exception 'migration 022 requires simulador.rubrics';
  end if;
  if to_regclass('simulador.evaluation_runs') is null then
    raise exception 'migration 022 requires simulador.evaluation_runs';
  end if;
end;
$$;

-- ============================================================================
-- LATAM CONSENT + JURISDICTION
-- ============================================================================

alter table simulador.users
  add column if not exists jurisdiction text not null default 'other'
    check (jurisdiction in ('MX', 'CO', 'BR', 'other')),
  add column if not exists consent_locale text not null default 'es-MX',
  add column if not exists consent_version text,
  add column if not exists consent_accepted_at timestamptz,
  add column if not exists consent_metadata_json jsonb not null default '{}'::jsonb;

create index if not exists idx_users_jurisdiction on simulador.users(jurisdiction);

-- ============================================================================
-- RUBRIC FREEZE + SEMVER
-- ============================================================================

alter table simulador.rubrics
  add column if not exists frozen_at timestamptz,
  add column if not exists frozen_by uuid references simulador.users(id) on delete set null,
  add column if not exists semver_policy_json jsonb not null default '{}'::jsonb,
  add column if not exists change_log_json jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conname = 'rubrics_id_version_unique'
       and conrelid = 'simulador.rubrics'::regclass
  ) then
    alter table simulador.rubrics
      add constraint rubrics_id_version_unique unique (id, version);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conname = 'evaluation_runs_rubric_exact_version_fk'
       and conrelid = 'simulador.evaluation_runs'::regclass
  ) then
    alter table simulador.evaluation_runs
      add constraint evaluation_runs_rubric_exact_version_fk
      foreign key (rubric_id, rubric_version)
      references simulador.rubrics(id, version)
      on delete restrict;
  end if;
end;
$$;

update simulador.rubrics
   set frozen_at = coalesce(frozen_at, now()),
       semver_policy_json = case
         when semver_policy_json = '{}'::jsonb then
           '{
             "major": "changes dimensions, bands, or scoring meaning; historical reports require re-evaluation",
             "minor": "adds criteria or weight refinements; historical reports coexist with exact rubric_version",
             "patch": "wording clarification without scoring changes"
           }'::jsonb
         else semver_policy_json
       end,
       change_log_json = case
         when change_log_json = '[]'::jsonb then
           '[{"version":"1.0.0","event":"frozen_as_initial_marketing_rubric","source":"migration_022"}]'::jsonb
         else change_log_json
       end
 where slug = 'rubric_marketing_v1'
   and version = '1.0.0'
   and status in ('active', 'draft');

-- ============================================================================
-- TELEMETRY CATALOG
-- ============================================================================

create table if not exists simulador.analytics_events_catalog (
  event_name text primary key,
  surface text not null check (surface in (
    'public',
    'auth',
    'onboarding',
    'runtime',
    'field_test',
    'dashboard',
    'report',
    'admin',
    'billing',
    'email',
    'judge'
  )),
  payload_schema jsonb not null default '{}'::jsonb,
  description text not null,
  owner text not null default 'codex' check (owner in ('claude', 'codex', 'shared')),
  introduced_at timestamptz not null default now(),
  deprecated_at timestamptz,
  metadata_json jsonb not null default '{}'::jsonb
);

alter table simulador.analytics_events_catalog enable row level security;

drop policy if exists "analytics_events_catalog_read_authenticated" on simulador.analytics_events_catalog;
create policy "analytics_events_catalog_read_authenticated" on simulador.analytics_events_catalog
  for select to authenticated using (true);

insert into simulador.analytics_events_catalog
  (event_name, surface, payload_schema, description, owner)
values
  ('public_landing_viewed', 'public', '{"required":["path"],"properties":{"path":{"type":"string"},"utm_source":{"type":"string"},"utm_campaign":{"type":"string"}}}'::jsonb, 'Public landing page view.', 'shared'),
  ('public_cta_clicked', 'public', '{"required":["cta_id","target"],"properties":{"cta_id":{"type":"string"},"target":{"type":"string"}}}'::jsonb, 'Public CTA click.', 'shared'),
  ('signup_started', 'auth', '{"required":["source"],"properties":{"source":{"type":"string"}}}'::jsonb, 'Signup flow opened.', 'codex'),
  ('signup_completed', 'auth', '{"required":["user_id"],"properties":{"user_id":{"type":"string"},"jurisdiction":{"type":"string"}}}'::jsonb, 'Signup completed and bridge user available.', 'codex'),
  ('login_completed', 'auth', '{"required":["user_id"],"properties":{"user_id":{"type":"string"}}}'::jsonb, 'Login completed.', 'codex'),
  ('consent_accepted', 'auth', '{"required":["version","jurisdiction"],"properties":{"version":{"type":"string"},"jurisdiction":{"type":"string"}}}'::jsonb, 'User accepted localized consent.', 'shared'),
  ('onboarding_step_viewed', 'onboarding', '{"required":["step_key"],"properties":{"step_key":{"type":"string"},"organization_id":{"type":"string"}}}'::jsonb, 'Onboarding step viewed.', 'codex'),
  ('onboarding_step_completed', 'onboarding', '{"required":["step_key"],"properties":{"step_key":{"type":"string"},"organization_id":{"type":"string"}}}'::jsonb, 'Onboarding step completed.', 'codex'),
  ('invitation_sent', 'onboarding', '{"required":["invitation_id","role"],"properties":{"invitation_id":{"type":"string"},"role":{"type":"string"},"team_id":{"type":"string"}}}'::jsonb, 'Invitation sent to a team member.', 'codex'),
  ('invitation_accepted', 'onboarding', '{"required":["invitation_id","user_id"],"properties":{"invitation_id":{"type":"string"},"user_id":{"type":"string"}}}'::jsonb, 'Invitation accepted.', 'codex'),
  ('case_started', 'runtime', '{"required":["session_id","case_id"],"properties":{"session_id":{"type":"string"},"case_id":{"type":"string"},"level":{"type":"number"}}}'::jsonb, 'Authenticated case session started.', 'codex'),
  ('section_started', 'runtime', '{"required":["session_id","step_key"],"properties":{"session_id":{"type":"string"},"step_key":{"type":"string"}}}'::jsonb, 'Runtime section started.', 'codex'),
  ('section_completed', 'runtime', '{"required":["session_id","step_key"],"properties":{"session_id":{"type":"string"},"step_key":{"type":"string"},"duration_ms":{"type":"number"}}}'::jsonb, 'Runtime section completed.', 'codex'),
  ('response_saved', 'runtime', '{"required":["session_id","step_key"],"properties":{"session_id":{"type":"string"},"step_key":{"type":"string"},"source":{"type":"string"}}}'::jsonb, 'Participant response autosaved.', 'codex'),
  ('llm_prompt_submitted', 'runtime', '{"required":["session_id","turn_index"],"properties":{"session_id":{"type":"string"},"turn_index":{"type":"number"}}}'::jsonb, 'LLM beat prompt submitted.', 'codex'),
  ('llm_response_received', 'runtime', '{"required":["session_id","latency_ms"],"properties":{"session_id":{"type":"string"},"latency_ms":{"type":"number"},"provider":{"type":"string"},"model":{"type":"string"},"cost_usd":{"type":"number"}}}'::jsonb, 'LLM beat response returned.', 'codex'),
  ('case_submitted', 'runtime', '{"required":["session_id"],"properties":{"session_id":{"type":"string"},"duration_ms":{"type":"number"}}}'::jsonb, 'Participant submitted full case.', 'codex'),
  ('judge_started', 'judge', '{"required":["session_id"],"properties":{"session_id":{"type":"string"},"model":{"type":"string"}}}'::jsonb, 'Judge evaluation started.', 'codex'),
  ('judge_completed', 'judge', '{"required":["session_id","evaluation_run_id"],"properties":{"session_id":{"type":"string"},"evaluation_run_id":{"type":"string"},"latency_ms":{"type":"number"},"requires_human_review":{"type":"boolean"}}}'::jsonb, 'Judge evaluation completed.', 'codex'),
  ('judge_failed', 'judge', '{"required":["session_id","error_code"],"properties":{"session_id":{"type":"string"},"error_code":{"type":"string"}}}'::jsonb, 'Judge evaluation failed.', 'codex'),
  ('report_viewed', 'report', '{"required":["report_id"],"properties":{"report_id":{"type":"string"},"viewer_role":{"type":"string"}}}'::jsonb, 'Report viewed.', 'shared'),
  ('report_exported', 'report', '{"required":["report_id","format"],"properties":{"report_id":{"type":"string"},"format":{"type":"string"}}}'::jsonb, 'Report exported.', 'codex'),
  ('practice_unlocked', 'runtime', '{"required":["user_id","practice_beat_id"],"properties":{"user_id":{"type":"string"},"practice_beat_id":{"type":"string"},"dimension_key":{"type":"string"}}}'::jsonb, 'Practice beat unlocked from a gap.', 'shared'),
  ('practice_started', 'runtime', '{"required":["practice_attempt_id","practice_beat_id"],"properties":{"practice_attempt_id":{"type":"string"},"practice_beat_id":{"type":"string"}}}'::jsonb, 'Practice beat attempt started.', 'codex'),
  ('practice_completed', 'runtime', '{"required":["practice_attempt_id","score_band"],"properties":{"practice_attempt_id":{"type":"string"},"score_band":{"type":"string"}}}'::jsonb, 'Practice beat attempt completed.', 'codex'),
  ('resim_assigned', 'runtime', '{"required":["assignment_id","source_session_id"],"properties":{"assignment_id":{"type":"string"},"source_session_id":{"type":"string"}}}'::jsonb, 'Re-simulation assigned after practice.', 'shared'),
  ('resim_completed', 'runtime', '{"required":["session_id"],"properties":{"session_id":{"type":"string"}}}'::jsonb, 'Re-simulation completed.', 'codex'),
  ('transfer_delta_computed', 'report', '{"required":["primary_session_id","resim_session_id"],"properties":{"primary_session_id":{"type":"string"},"resim_session_id":{"type":"string"}}}'::jsonb, 'Transfer delta computed between primary and resimulation.', 'codex'),
  ('manager_alert_triggered', 'dashboard', '{"required":["alert_type","severity"],"properties":{"alert_type":{"type":"string"},"severity":{"type":"string"},"manager_user_id":{"type":"string"}}}'::jsonb, 'Manager alert created.', 'shared'),
  ('manager_alert_sent', 'email', '{"required":["alert_id","channel"],"properties":{"alert_id":{"type":"string"},"channel":{"type":"string"}}}'::jsonb, 'Manager alert delivered through a channel.', 'codex'),
  ('field_test_started', 'field_test', '{"required":["field_test_session_id"],"properties":{"field_test_session_id":{"type":"string"},"case_slug":{"type":"string"}}}'::jsonb, 'Anonymous field-test session started.', 'codex'),
  ('field_test_abandoned', 'field_test', '{"required":["field_test_session_id","step_key"],"properties":{"field_test_session_id":{"type":"string"},"step_key":{"type":"string"}}}'::jsonb, 'Anonymous field-test abandoned.', 'codex'),
  ('field_test_submitted', 'field_test', '{"required":["field_test_session_id"],"properties":{"field_test_session_id":{"type":"string"}}}'::jsonb, 'Anonymous field-test submitted.', 'codex'),
  ('lead_captured', 'field_test', '{"required":["email","source"],"properties":{"email":{"type":"string"},"source":{"type":"string"},"field_test_session_id":{"type":"string"}}}'::jsonb, 'Field-test or manual lead captured.', 'shared'),
  ('billing_checkout_started', 'billing', '{"required":["organization_id","tier"],"properties":{"organization_id":{"type":"string"},"tier":{"type":"string"}}}'::jsonb, 'Stripe checkout started.', 'codex'),
  ('billing_checkout_completed', 'billing', '{"required":["organization_id","tier"],"properties":{"organization_id":{"type":"string"},"tier":{"type":"string"},"stripe_customer_id":{"type":"string"}}}'::jsonb, 'Stripe checkout completed.', 'codex'),
  ('admin_review_assigned', 'admin', '{"required":["queue_id","reviewer_user_id"],"properties":{"queue_id":{"type":"string"},"reviewer_user_id":{"type":"string"}}}'::jsonb, 'Human review queue item assigned.', 'codex'),
  ('admin_review_completed', 'admin', '{"required":["queue_id","decision"],"properties":{"queue_id":{"type":"string"},"decision":{"type":"string"}}}'::jsonb, 'Human review queue item completed.', 'shared')
on conflict (event_name) do update
  set surface = excluded.surface,
      payload_schema = excluded.payload_schema,
      description = excluded.description,
      owner = excluded.owner,
      deprecated_at = null;

grant select on simulador.analytics_events_catalog to authenticated;
grant all on simulador.analytics_events_catalog to service_role;
grant all on all tables in schema simulador to authenticated, service_role;
grant all on all sequences in schema simulador to authenticated, service_role;

notify pgrst, 'reload schema';

commit;
