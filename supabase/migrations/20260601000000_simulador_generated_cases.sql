-- Casos generados por empresa (formato 5x5 rico, 17 bloques) para el runtime
-- productivo config-driven (RuntimeExperienceV2). A diferencia de case_templates
-- (globales, modelo viejo de 5 step_types), estos son POR organización y guardan
-- el PlayableCase completo como JSON, que RuntimeExperienceV2 juega directo.
--
-- El motor de generación (Claude / API del cliente en producción) escribe estas
-- filas via service_role. Los miembros de la org las leen; el org_admin las
-- administra.

create table if not exists simulador.generated_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references simulador.organizations(id) on delete cascade,
  team_id uuid references simulador.teams(id) on delete set null,
  case_id text not null,                       -- slug del caso (ej. lumen_reactivacion_citas)
  version int not null default 1,
  title text not null,
  level text,                                  -- N1/N2/N3
  profile_pack text,
  playable_json jsonb not null,                -- PlayableCase completo (lo que juega el runtime)
  manager_outcome_json jsonb not null default '{}'::jsonb,
  generation_method text not null default 'engine',  -- engine | manual
  generation_meta_json jsonb not null default '{}'::jsonb, -- brief_hash, modelo, intentos, etc.
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_by uuid references simulador.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, case_id, version)
);

create index if not exists generated_cases_org_status
  on simulador.generated_cases (organization_id, status);
create index if not exists generated_cases_team
  on simulador.generated_cases (team_id);

comment on table simulador.generated_cases is
  'Casos generados por empresa (formato 5x5 rico). playable_json es el PlayableCase que juega RuntimeExperienceV2. Escritos por el motor via service_role.';

-- ---- RLS ----
alter table simulador.generated_cases enable row level security;

-- Miembros de la org leen SOLO los casos activos (no drafts/archived, que pueden
-- tener contenido a medio generar o metadata del brief).
-- drop-if-exists hace la migración idempotente (re-aplicable sin error por
-- "policy already exists", p. ej. si db push la corre tras un apply manual).
drop policy if exists "org_members_read_active_generated_cases" on simulador.generated_cases;
create policy "org_members_read_active_generated_cases" on simulador.generated_cases
  for select using (status = 'active' and simulador.user_in_org(organization_id));

-- El org_admin ve todo (incluidos drafts/archived) y administra. El motor escribe
-- via service_role, que bypassa RLS.
drop policy if exists "org_admin_all_generated_cases" on simulador.generated_cases;
create policy "org_admin_all_generated_cases" on simulador.generated_cases
  for all using (simulador.is_org_admin(organization_id))
            with check (simulador.is_org_admin(organization_id));

-- ---- Grants (PostgREST) ----
grant select, insert, update, delete on simulador.generated_cases to authenticated;
grant select, insert, update, delete on simulador.generated_cases to service_role;
