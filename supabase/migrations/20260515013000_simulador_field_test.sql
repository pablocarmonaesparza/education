-- Migration 20260515013000 — simulador field-test v0
--
-- Public/semi-public diagnostic sessions. These tables are intentionally
-- separate from the authenticated B2B runtime so the sample case can run
-- before login without weakening multi-tenant RLS on production sessions.

create table if not exists simulador.field_test_sessions (
  id uuid primary key default gen_random_uuid(),
  case_slug text not null,
  case_template_id uuid references simulador.case_templates(id) on delete restrict,
  case_variant_id uuid references simulador.case_variants(id) on delete restrict,
  public_token_hash text not null unique,
  status text not null default 'in_progress' check (
    status in ('in_progress', 'submitted', 'evaluating', 'published', 'failed')
  ),
  report_status text not null default 'none' check (
    report_status in ('none', 'published', 'failed')
  ),
  ip_hash text,
  user_agent_hash text,
  metadata_json jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  last_event_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists simulador.field_test_step_events (
  id uuid primary key default gen_random_uuid(),
  field_test_session_id uuid not null
    references simulador.field_test_sessions(id) on delete cascade,
  step_key text,
  event_type text not null check (
    event_type in (
      'field_test_started',
      'response_update',
      'llm_prompt_submitted',
      'llm_response_received',
      'section_completed',
      'abandoned',
      'submitted',
      'report_viewed',
      'email_captured'
    )
  ),
  payload_json jsonb not null default '{}'::jsonb,
  metrics_json jsonb not null default '{}'::jsonb,
  captured_at timestamptz not null default now()
);

create table if not exists simulador.field_test_reports (
  id uuid primary key default gen_random_uuid(),
  field_test_session_id uuid not null unique
    references simulador.field_test_sessions(id) on delete cascade,
  status text not null default 'published' check (status in ('published', 'failed')),
  payload_json jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists simulador.field_test_leads (
  id uuid primary key default gen_random_uuid(),
  field_test_session_id uuid
    references simulador.field_test_sessions(id) on delete set null,
  name text not null,
  email text not null,
  company text not null,
  role text,
  team_size text,
  consent_to_contact boolean not null default true,
  source text not null default 'field-test-report',
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_field_test_sessions_case_slug
  on simulador.field_test_sessions(case_slug, created_at desc);

create index if not exists idx_field_test_sessions_status
  on simulador.field_test_sessions(status, created_at desc);

create index if not exists idx_field_test_sessions_expires_at
  on simulador.field_test_sessions(expires_at);

create index if not exists idx_field_test_events_session_time
  on simulador.field_test_step_events(field_test_session_id, captured_at);

create index if not exists idx_field_test_events_event_type
  on simulador.field_test_step_events(event_type, captured_at desc);

create index if not exists idx_field_test_leads_email
  on simulador.field_test_leads(email);

alter table simulador.field_test_sessions enable row level security;
alter table simulador.field_test_step_events enable row level security;
alter table simulador.field_test_reports enable row level security;
alter table simulador.field_test_leads enable row level security;

-- No anon policies by design. All reads/writes go through trusted route
-- handlers using service_role after validating the opaque cookie token.

create or replace function simulador.tg_field_test_sessions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_field_test_sessions_updated_at
  on simulador.field_test_sessions;

create trigger trg_field_test_sessions_updated_at
  before update on simulador.field_test_sessions
  for each row
  execute function simulador.tg_field_test_sessions_updated_at();

revoke execute on function simulador.tg_field_test_sessions_updated_at()
  from anon, authenticated;

comment on table simulador.field_test_sessions is
  'Public/semi-public sample diagnostic sessions. Token-scoped via route handlers; not part of authenticated B2B tenant runtime.';

comment on column simulador.field_test_sessions.public_token_hash is
  'SHA-256 hash of opaque httpOnly cookie token. Raw token is never stored.';

comment on table simulador.field_test_reports is
  'Inline participant mini-reports for field-test sessions. Not calibrated manager reports.';
