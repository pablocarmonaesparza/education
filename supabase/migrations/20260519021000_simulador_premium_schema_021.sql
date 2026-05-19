-- Migration 021 — Premium simulator schema
--
-- Adds the durable substrate for:
--   - operational difficulty levels (copilot/workflow/agents)
--   - career/track metadata
--   - adaptive practice attempts/unlocks
--   - transfer delta and longitudinal readiness history
--   - manager alerts and field-test lead inbox

begin;

do $$
begin
  if to_regclass('simulador.case_templates') is null then
    raise exception 'migration 021 requires simulador.case_templates';
  end if;
  if to_regclass('simulador.practice_beats') is null then
    raise exception 'migration 021 requires simulador.practice_beats';
  end if;
end;
$$;

alter table simulador.case_templates
  add column if not exists level_primary int not null default 1
    check (level_primary in (1, 2, 3)),
  add column if not exists level_advanced_variant int
    check (level_advanced_variant in (1, 2, 3)),
  add column if not exists career_key text not null default 'marketing'
    check (career_key in ('marketing', 'growth', 'sales', 'cs', 'ops', 'finance', 'legal', 'hr', 'product', 'engineering')),
  add column if not exists archetype_ref text;

alter table simulador.case_variants
  add column if not exists level int
    check (level in (1, 2, 3)),
  add column if not exists career_key text
    check (career_key in ('marketing', 'growth', 'sales', 'cs', 'ops', 'finance', 'legal', 'hr', 'product', 'engineering')),
  add column if not exists transfer_pair_key text;

alter table simulador.practice_beats
  add column if not exists dimension_key text
    check (dimension_key in ('contexto', 'privacidad', 'validacion', 'juicio', 'decision')),
  add column if not exists level int
    check (level in (1, 2, 3)),
  add column if not exists career_key text
    check (career_key in ('marketing', 'growth', 'sales', 'cs', 'ops', 'finance', 'legal', 'hr', 'product', 'engineering')),
  add column if not exists expected_signals_json jsonb not null default '{}'::jsonb,
  add column if not exists completion_criteria_json jsonb not null default '{}'::jsonb;

create table if not exists simulador.practice_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references simulador.users(id) on delete cascade,
  sprint_id uuid references simulador.sprints(id) on delete cascade,
  practice_beat_id uuid not null references simulador.practice_beats(id) on delete restrict,
  source_session_id uuid references simulador.simulation_sessions(id) on delete set null,
  gap_key text,
  dimension_key text check (dimension_key in ('contexto', 'privacidad', 'validacion', 'juicio', 'decision')),
  unlock_reason text,
  status text not null default 'unlocked' check (status in ('unlocked', 'started', 'completed', 'skipped', 'expired')),
  unlocked_at timestamptz not null default now(),
  due_at timestamptz,
  completed_at timestamptz,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, practice_beat_id, source_session_id)
);

create table if not exists simulador.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  practice_beat_id uuid not null references simulador.practice_beats(id) on delete restrict,
  practice_unlock_id uuid references simulador.practice_unlocks(id) on delete set null,
  user_id uuid not null references simulador.users(id) on delete cascade,
  sprint_id uuid references simulador.sprints(id) on delete cascade,
  source_session_id uuid references simulador.simulation_sessions(id) on delete set null,
  status text not null default 'started' check (status in ('started', 'completed', 'abandoned', 'failed')),
  score_band text check (score_band in ('A', 'M', 'B')),
  score_numeric numeric(6,2),
  response_json jsonb not null default '{}'::jsonb,
  feedback_json jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists simulador.person_readiness_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references simulador.organizations(id) on delete cascade,
  team_id uuid references simulador.teams(id) on delete cascade,
  sprint_id uuid references simulador.sprints(id) on delete cascade,
  user_id uuid not null references simulador.users(id) on delete cascade,
  source_session_id uuid references simulador.simulation_sessions(id) on delete set null,
  source_report_id uuid references simulador.reports(id) on delete set null,
  career_key text check (career_key in ('marketing', 'growth', 'sales', 'cs', 'ops', 'finance', 'legal', 'hr', 'product', 'engineering')),
  level int check (level in (1, 2, 3)),
  snapshot_kind text not null check (snapshot_kind in ('baseline', 'post_practice', 'resimulation', 'manager_review', 'manual')),
  dimensions_json jsonb not null default '{}'::jsonb,
  risk_summary_json jsonb not null default '{}'::jsonb,
  recommendation text check (recommendation in ('pilotar', 'entrenar', 'pausar', 'escalar')),
  captured_at timestamptz not null default now(),
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists simulador.manager_alert_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references simulador.organizations(id) on delete cascade,
  team_id uuid references simulador.teams(id) on delete cascade,
  manager_user_id uuid not null references simulador.users(id) on delete cascade,
  channel text not null check (channel in ('email', 'slack', 'webhook', 'in_app')),
  destination text,
  alert_types text[] not null default '{}',
  is_active boolean not null default true,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists simulador.manager_alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references simulador.organizations(id) on delete cascade,
  team_id uuid references simulador.teams(id) on delete cascade,
  sprint_id uuid references simulador.sprints(id) on delete cascade,
  manager_user_id uuid references simulador.users(id) on delete set null,
  subject_user_id uuid references simulador.users(id) on delete set null,
  source_session_id uuid references simulador.simulation_sessions(id) on delete set null,
  alert_type text not null,
  severity text not null default 'info' check (severity in ('info', 'low', 'medium', 'high', 'critical')),
  status text not null default 'queued' check (status in ('queued', 'sent', 'acknowledged', 'resolved', 'dismissed', 'failed')),
  title text not null,
  body text,
  payload_json jsonb not null default '{}'::jsonb,
  delivery_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  acknowledged_at timestamptz,
  resolved_at timestamptz
);

create table if not exists simulador.leads_inbox (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'field_test' check (source in ('field_test', 'manual', 'referral', 'partner', 'import')),
  field_test_lead_id uuid references simulador.field_test_leads(id) on delete set null,
  field_test_session_id uuid references simulador.field_test_sessions(id) on delete set null,
  name text,
  email text not null,
  company text,
  role text,
  team_size text,
  status text not null default 'new' check (status in ('new', 'qualified', 'contacted', 'converted', 'lost', 'archived')),
  owner_user_id uuid references simulador.users(id) on delete set null,
  notes text,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_case_templates_level_career on simulador.case_templates(level_primary, career_key, status);
create index if not exists idx_case_variants_level_career on simulador.case_variants(level, career_key, status);
create index if not exists idx_practice_beats_dimension_level on simulador.practice_beats(dimension_key, level, status);
create index if not exists idx_practice_unlocks_user_status on simulador.practice_unlocks(user_id, status, due_at);
create index if not exists idx_practice_attempts_user_status on simulador.practice_attempts(user_id, status, completed_at desc);
create index if not exists idx_readiness_history_user_time on simulador.person_readiness_history(user_id, captured_at desc);
create index if not exists idx_readiness_history_team_time on simulador.person_readiness_history(team_id, captured_at desc);
create index if not exists idx_manager_alerts_status on simulador.manager_alerts(status, severity, created_at desc);
create index if not exists idx_leads_inbox_status on simulador.leads_inbox(status, created_at desc);
create index if not exists idx_leads_inbox_email on simulador.leads_inbox(email);
create unique index if not exists idx_manager_alert_subscriptions_unique_destination
  on simulador.manager_alert_subscriptions(manager_user_id, channel, coalesce(destination, ''));

alter table simulador.practice_unlocks enable row level security;
alter table simulador.practice_attempts enable row level security;
alter table simulador.person_readiness_history enable row level security;
alter table simulador.manager_alert_subscriptions enable row level security;
alter table simulador.manager_alerts enable row level security;
alter table simulador.leads_inbox enable row level security;

drop policy if exists "practice_unlocks_read_self_or_manager" on simulador.practice_unlocks;
create policy "practice_unlocks_read_self_or_manager" on simulador.practice_unlocks
  for select using (
    user_id = simulador.current_simulador_user_id()
    or (sprint_id is not null and simulador.has_team_role(
      (select team_id from simulador.sprints where id = simulador.practice_unlocks.sprint_id),
      array['manager']
    ))
    or (sprint_id is not null and simulador.is_org_admin(
      (select organization_id from simulador.sprints where id = simulador.practice_unlocks.sprint_id)
    ))
  );

drop policy if exists "practice_unlocks_write_self" on simulador.practice_unlocks;
create policy "practice_unlocks_write_self" on simulador.practice_unlocks
  for update using (user_id = simulador.current_simulador_user_id())
          with check (user_id = simulador.current_simulador_user_id());

drop policy if exists "practice_attempts_read_self_or_manager" on simulador.practice_attempts;
create policy "practice_attempts_read_self_or_manager" on simulador.practice_attempts
  for select using (
    user_id = simulador.current_simulador_user_id()
    or (sprint_id is not null and simulador.has_team_role(
      (select team_id from simulador.sprints where id = simulador.practice_attempts.sprint_id),
      array['manager']
    ))
    or (sprint_id is not null and simulador.is_org_admin(
      (select organization_id from simulador.sprints where id = simulador.practice_attempts.sprint_id)
    ))
  );

drop policy if exists "practice_attempts_write_self" on simulador.practice_attempts;
create policy "practice_attempts_write_self" on simulador.practice_attempts
  for all using (user_id = simulador.current_simulador_user_id())
        with check (user_id = simulador.current_simulador_user_id());

drop policy if exists "readiness_history_read_self_or_manager" on simulador.person_readiness_history;
create policy "readiness_history_read_self_or_manager" on simulador.person_readiness_history
  for select using (
    user_id = simulador.current_simulador_user_id()
    or (team_id is not null and simulador.has_team_role(team_id, array['manager']))
    or (organization_id is not null and simulador.is_org_admin(organization_id))
  );

comment on table simulador.leads_inbox is
  'Internal Itera sales inbox. RLS intentionally has no authenticated policies; access is through service-role admin APIs only.';

drop policy if exists "manager_alert_subscriptions_read_owner_or_admin" on simulador.manager_alert_subscriptions;
create policy "manager_alert_subscriptions_read_owner_or_admin" on simulador.manager_alert_subscriptions
  for select using (
    manager_user_id = simulador.current_simulador_user_id()
    or simulador.is_org_admin(organization_id)
  );

drop policy if exists "manager_alert_subscriptions_write_owner_or_admin" on simulador.manager_alert_subscriptions;
create policy "manager_alert_subscriptions_write_owner_or_admin" on simulador.manager_alert_subscriptions
  for all using (
    manager_user_id = simulador.current_simulador_user_id()
    or simulador.is_org_admin(organization_id)
  )
  with check (
    manager_user_id = simulador.current_simulador_user_id()
    or simulador.is_org_admin(organization_id)
  );

drop policy if exists "manager_alerts_read_recipient_or_admin" on simulador.manager_alerts;
create policy "manager_alerts_read_recipient_or_admin" on simulador.manager_alerts
  for select using (
    manager_user_id = simulador.current_simulador_user_id()
    or simulador.is_org_admin(organization_id)
  );

create or replace function simulador.compute_transfer_delta(
  p_primary_session_id uuid,
  p_resim_session_id uuid
) returns table (
  dimension_key text,
  primary_band text,
  resim_band text,
  primary_score numeric,
  resim_score numeric,
  delta_score numeric,
  improved boolean
)
language sql
stable
set search_path = simulador, public, pg_temp
as $$
with latest_primary as (
  select dimension_scores_json
    from simulador.evaluation_runs
   where simulation_session_id = p_primary_session_id
   order by created_at desc
   limit 1
),
latest_resim as (
  select dimension_scores_json
    from simulador.evaluation_runs
   where simulation_session_id = p_resim_session_id
   order by created_at desc
   limit 1
),
primary_dims as (
  select
    elem->>'id' as dimension_key,
    elem->>'band' as band,
    case elem->>'band'
      when 'A' then 85
      when 'M' then 60
      when 'B' then 35
      else null
    end::numeric as score
  from latest_primary,
       jsonb_array_elements(
         case
           when jsonb_typeof(dimension_scores_json) = 'array' then dimension_scores_json
           else '[]'::jsonb
         end
       ) elem
),
resim_dims as (
  select
    elem->>'id' as dimension_key,
    elem->>'band' as band,
    case elem->>'band'
      when 'A' then 85
      when 'M' then 60
      when 'B' then 35
      else null
    end::numeric as score
  from latest_resim,
       jsonb_array_elements(
         case
           when jsonb_typeof(dimension_scores_json) = 'array' then dimension_scores_json
           else '[]'::jsonb
         end
       ) elem
)
select
  coalesce(p.dimension_key, r.dimension_key) as dimension_key,
  p.band as primary_band,
  r.band as resim_band,
  p.score as primary_score,
  r.score as resim_score,
  (r.score - p.score) as delta_score,
  (r.score > p.score) as improved
from primary_dims p
full outer join resim_dims r using (dimension_key)
order by dimension_key;
$$;

grant all on all tables in schema simulador to authenticated, service_role;
grant all on all sequences in schema simulador to authenticated, service_role;
grant execute on function simulador.compute_transfer_delta(uuid, uuid) to authenticated, service_role;

notify pgrst, 'reload schema';

commit;
