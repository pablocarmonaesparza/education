-- ============================================================================
-- 019_simulador_rls.sql
-- ----------------------------------------------------------------------------
-- RLS policies multi-tenant para el schema `simulador`.
--
-- Modelo de acceso:
--   - Cliente browser usa `createServerClient` o `createBrowserClient` de
--     @supabase/ssr con session JWT del usuario logged-in.
--   - Todas las queries pasan por `auth.uid()` que retorna el UUID del user
--     en auth.users.
--   - `service_role` bypassa RLS — solo se usa en route handlers privilegiados
--     (NUNCA en cliente).
--
-- Reglas generales:
--   - Una row de simulador.X pertenece a una organization (directa o vía FK chain).
--   - El user puede leer rows de su organización si tiene membership en ella.
--   - Roles aditivos: org_admin ⊇ billing_admin ⊇ viewer (en políticas de lectura).
--   - Para escritura: solo org_admin o el dueño del row (cuando aplica, ej. session.user_id).
--
-- Helper functions definidas abajo:
--   - simulador.current_simulador_user_id() → uuid (id del row en simulador.users)
--   - simulador.has_org_role(org_id, role[]) → boolean
--   - simulador.has_team_role(team_id, role[]) → boolean
--   - simulador.is_org_admin(org_id) → boolean
-- ============================================================================

begin;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

create or replace function simulador.current_simulador_user_id()
returns uuid
language sql
stable
security definer
set search_path = simulador, public
as $$
  select id
    from simulador.users
   where auth_user_id = auth.uid()
   limit 1;
$$;

create or replace function simulador.has_org_role(p_org_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = simulador, public
as $$
  select exists (
    select 1
      from simulador.organization_memberships om
      join simulador.users u on u.id = om.user_id
     where om.organization_id = p_org_id
       and u.auth_user_id = auth.uid()
       and om.role = any(p_roles)
  );
$$;

create or replace function simulador.has_team_role(p_team_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = simulador, public
as $$
  select exists (
    select 1
      from simulador.team_memberships tm
      join simulador.users u on u.id = tm.user_id
     where tm.team_id = p_team_id
       and u.auth_user_id = auth.uid()
       and tm.role = any(p_roles)
  );
$$;

create or replace function simulador.is_org_admin(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = simulador, public
as $$
  select simulador.has_org_role(p_org_id, array['org_admin']);
$$;

create or replace function simulador.user_in_org(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = simulador, public
as $$
  select simulador.has_org_role(p_org_id, array['org_admin', 'billing_admin', 'viewer']);
$$;

-- ============================================================================
-- ENABLE RLS EN TODAS LAS TABLAS
-- ============================================================================

alter table simulador.organizations enable row level security;
alter table simulador.teams enable row level security;
alter table simulador.users enable row level security;
alter table simulador.organization_memberships enable row level security;
alter table simulador.team_memberships enable row level security;
alter table simulador.invitations enable row level security;
alter table simulador.subscriptions enable row level security;
alter table simulador.rubrics enable row level security;
alter table simulador.rubric_dimensions enable row level security;
alter table simulador.rubric_criteria enable row level security;
alter table simulador.sprint_packages enable row level security;
alter table simulador.sprints enable row level security;
alter table simulador.case_templates enable row level security;
alter table simulador.case_steps enable row level security;
alter table simulador.case_inputs_spec enable row level security;
alter table simulador.case_variants enable row level security;
alter table simulador.sprint_package_cases enable row level security;
alter table simulador.gap_definitions enable row level security;
alter table simulador.practice_beats enable row level security;
alter table simulador.case_practice_beats enable row level security;
alter table simulador.assignments enable row level security;
alter table simulador.simulation_sessions enable row level security;
alter table simulador.simulation_step_events enable row level security;
alter table simulador.llm_interactions enable row level security;
alter table simulador.behavior_events enable row level security;
alter table simulador.risk_events enable row level security;
alter table simulador.evaluation_runs enable row level security;
alter table simulador.human_review_queue enable row level security;
alter table simulador.evidence_snapshots enable row level security;
alter table simulador.manager_recommendations enable row level security;
alter table simulador.reports enable row level security;
alter table simulador.audit_log enable row level security;

-- ============================================================================
-- POLICIES — ORG STRUCTURE
-- ============================================================================

-- organizations: lectura por miembros; escritura solo org_admin
create policy "org_members_read" on simulador.organizations
  for select using (simulador.user_in_org(id));

create policy "org_admin_update" on simulador.organizations
  for update using (simulador.is_org_admin(id));

-- INSERT permitido cualquier auth user (creará la org y se asignará org_admin via route handler).
create policy "authenticated_insert_org" on simulador.organizations
  for insert with check (auth.uid() is not null);

-- teams
create policy "team_members_or_org_members_read" on simulador.teams
  for select using (simulador.user_in_org(organization_id));

create policy "org_admin_team_write" on simulador.teams
  for all using (simulador.is_org_admin(organization_id))
            with check (simulador.is_org_admin(organization_id));

-- users: lectura propia + miembros de org (para resolver nombres en dashboard)
create policy "users_read_self_or_orgmate" on simulador.users
  for select using (
    auth_user_id = auth.uid()
    or exists (
      select 1 from simulador.organization_memberships my
       join simulador.organization_memberships other on other.organization_id = my.organization_id
       join simulador.users me on me.id = my.user_id
      where me.auth_user_id = auth.uid()
        and other.user_id = simulador.users.id
    )
  );

create policy "users_update_self" on simulador.users
  for update using (auth_user_id = auth.uid());

create policy "users_insert_self" on simulador.users
  for insert with check (auth_user_id = auth.uid());

-- organization_memberships
create policy "org_memberships_read" on simulador.organization_memberships
  for select using (simulador.user_in_org(organization_id));

create policy "org_admin_memberships_write" on simulador.organization_memberships
  for all using (simulador.is_org_admin(organization_id))
            with check (simulador.is_org_admin(organization_id));

-- team_memberships
create policy "team_memberships_read" on simulador.team_memberships
  for select using (
    simulador.user_in_org((select organization_id from simulador.teams where id = team_id))
  );

create policy "org_admin_team_memberships_write" on simulador.team_memberships
  for all using (
    simulador.is_org_admin((select organization_id from simulador.teams where id = team_id))
  )
  with check (
    simulador.is_org_admin((select organization_id from simulador.teams where id = team_id))
  );

-- ============================================================================
-- POLICIES — INVITATIONS
-- ============================================================================

create policy "org_admin_invitations_all" on simulador.invitations
  for all using (simulador.is_org_admin(organization_id))
            with check (simulador.is_org_admin(organization_id));

-- Accept invitation se hace via route handler con service_role + token, no policy de cliente.

-- ============================================================================
-- POLICIES — SUBSCRIPTIONS
-- ============================================================================

create policy "org_members_read_subscription" on simulador.subscriptions
  for select using (simulador.user_in_org(organization_id));

create policy "billing_admin_write_subscription" on simulador.subscriptions
  for all using (simulador.has_org_role(organization_id, array['org_admin', 'billing_admin']))
            with check (simulador.has_org_role(organization_id, array['org_admin', 'billing_admin']));

-- ============================================================================
-- POLICIES — RUBRICS, SPRINT PACKAGES, CASE TEMPLATES
-- ----------------------------------------------------------------------------
-- Estos son CONTENT global (no por org). Lectura para cualquier authenticated.
-- Escritura solo via service_role (Itera staff, seed scripts).
-- ============================================================================

create policy "authenticated_read_rubrics" on simulador.rubrics
  for select using (auth.uid() is not null);

create policy "authenticated_read_rubric_dimensions" on simulador.rubric_dimensions
  for select using (auth.uid() is not null);

create policy "authenticated_read_rubric_criteria" on simulador.rubric_criteria
  for select using (auth.uid() is not null);

create policy "authenticated_read_sprint_packages" on simulador.sprint_packages
  for select using (auth.uid() is not null);

create policy "authenticated_read_case_templates" on simulador.case_templates
  for select using (auth.uid() is not null);

create policy "authenticated_read_case_steps" on simulador.case_steps
  for select using (auth.uid() is not null);

create policy "authenticated_read_case_inputs_spec" on simulador.case_inputs_spec
  for select using (auth.uid() is not null);

create policy "authenticated_read_case_variants" on simulador.case_variants
  for select using (auth.uid() is not null);

create policy "authenticated_read_sprint_package_cases" on simulador.sprint_package_cases
  for select using (auth.uid() is not null);

create policy "authenticated_read_gap_definitions" on simulador.gap_definitions
  for select using (auth.uid() is not null);

create policy "authenticated_read_practice_beats" on simulador.practice_beats
  for select using (auth.uid() is not null);

create policy "authenticated_read_case_practice_beats" on simulador.case_practice_beats
  for select using (auth.uid() is not null);

-- ============================================================================
-- POLICIES — SPRINTS, ASSIGNMENTS, SESSIONS (per-org)
-- ============================================================================

create policy "org_members_read_sprints" on simulador.sprints
  for select using (simulador.user_in_org(organization_id));

create policy "org_admin_write_sprints" on simulador.sprints
  for all using (simulador.is_org_admin(organization_id))
            with check (simulador.is_org_admin(organization_id));

-- assignments: el user puede leer las suyas + managers del team pueden leer las del team
create policy "assignments_read_self_or_manager" on simulador.assignments
  for select using (
    user_id = simulador.current_simulador_user_id()
    or simulador.has_team_role(
      (select team_id from simulador.sprints where id = simulador.assignments.sprint_id),
      array['manager']
    )
    or simulador.is_org_admin(
      (select organization_id from simulador.sprints where id = simulador.assignments.sprint_id)
    )
  );

create policy "assignments_write_manager_or_admin" on simulador.assignments
  for all using (
    simulador.has_team_role(
      (select team_id from simulador.sprints where id = simulador.assignments.sprint_id),
      array['manager']
    )
    or simulador.is_org_admin(
      (select organization_id from simulador.sprints where id = simulador.assignments.sprint_id)
    )
  );

-- simulation_sessions: el dueño + managers + org_admin
create policy "sessions_read_self_or_manager" on simulador.simulation_sessions
  for select using (
    user_id = simulador.current_simulador_user_id()
    or simulador.has_team_role(
      (select team_id from simulador.sprints where id = simulador.simulation_sessions.sprint_id),
      array['manager']
    )
    or simulador.is_org_admin(
      (select organization_id from simulador.sprints where id = simulador.simulation_sessions.sprint_id)
    )
  );

create policy "sessions_write_self" on simulador.simulation_sessions
  for all using (user_id = simulador.current_simulador_user_id())
            with check (user_id = simulador.current_simulador_user_id());

-- step_events, llm_interactions, behavior_events: solo dueño puede insertar/leer
create policy "step_events_read_session_owner_or_manager" on simulador.simulation_step_events
  for select using (
    exists (
      select 1 from simulador.simulation_sessions s
       where s.id = simulation_session_id
         and (
           s.user_id = simulador.current_simulador_user_id()
           or simulador.has_team_role(
             (select team_id from simulador.sprints where id = s.sprint_id),
             array['manager']
           )
         )
    )
  );

create policy "step_events_write_session_owner" on simulador.simulation_step_events
  for insert with check (
    exists (
      select 1 from simulador.simulation_sessions s
       where s.id = simulation_session_id
         and s.user_id = simulador.current_simulador_user_id()
    )
  );

create policy "llm_interactions_read" on simulador.llm_interactions
  for select using (
    exists (
      select 1 from simulador.simulation_sessions s
       where s.id = simulation_session_id
         and (
           s.user_id = simulador.current_simulador_user_id()
           or simulador.has_team_role(
             (select team_id from simulador.sprints where id = s.sprint_id),
             array['manager']
           )
         )
    )
  );

create policy "llm_interactions_write_owner" on simulador.llm_interactions
  for insert with check (
    exists (
      select 1 from simulador.simulation_sessions s
       where s.id = simulation_session_id
         and s.user_id = simulador.current_simulador_user_id()
    )
  );

create policy "behavior_events_read" on simulador.behavior_events
  for select using (
    exists (
      select 1 from simulador.simulation_sessions s
       where s.id = simulation_session_id
         and (
           s.user_id = simulador.current_simulador_user_id()
           or simulador.has_team_role(
             (select team_id from simulador.sprints where id = s.sprint_id),
             array['manager']
           )
         )
    )
  );

create policy "behavior_events_write" on simulador.behavior_events
  for insert with check (
    exists (
      select 1 from simulador.simulation_sessions s
       where s.id = simulation_session_id
         and s.user_id = simulador.current_simulador_user_id()
    )
  );

-- ============================================================================
-- POLICIES — RISK EVENTS, EVALUATIONS, REPORTS
-- ============================================================================

-- risk_events: lectura para dueño de la sesión + manager + org_admin
create policy "risk_events_read" on simulador.risk_events
  for select using (
    exists (
      select 1 from simulador.simulation_sessions s
       where s.id = simulation_session_id
         and (
           s.user_id = simulador.current_simulador_user_id()
           or simulador.has_team_role(
             (select team_id from simulador.sprints where id = s.sprint_id),
             array['manager']
           )
         )
    )
  );

-- INSERT/UPDATE de risk_events solo via service_role (judge LLM) — sin policy permisiva.

-- evaluation_runs: read solo manager + org_admin (el participant ve via report)
create policy "evaluation_runs_read" on simulador.evaluation_runs
  for select using (
    exists (
      select 1 from simulador.simulation_sessions s
       where s.id = simulation_session_id
         and (
           s.user_id = simulador.current_simulador_user_id()
           or simulador.has_team_role(
             (select team_id from simulador.sprints where id = s.sprint_id),
             array['manager']
           )
         )
    )
  );

-- human_review_queue: solo Itera staff (acceso via service_role en /admin/review).
-- No policy de cliente.

-- evidence_snapshots: lectura per-org
create policy "evidence_snapshots_read" on simulador.evidence_snapshots
  for select using (
    (sprint_id is not null and exists (
      select 1 from simulador.sprints sp
       where sp.id = sprint_id
         and simulador.user_in_org(sp.organization_id)
    ))
    or (user_id = simulador.current_simulador_user_id())
  );

-- manager_recommendations: lectura per-team/org
create policy "manager_recommendations_read" on simulador.manager_recommendations
  for select using (
    (sprint_id is not null and exists (
      select 1 from simulador.sprints sp
       where sp.id = sprint_id
         and simulador.user_in_org(sp.organization_id)
    ))
    or (user_id = simulador.current_simulador_user_id())
  );

-- reports: status=published o draft del propio user; pending_review solo via service_role
create policy "reports_read_published_or_self_draft" on simulador.reports
  for select using (
    (status in ('published', 'shared') and (
      user_id = simulador.current_simulador_user_id()
      or exists (
        select 1 from simulador.sprints sp
         where sp.id = sprint_id
           and (
             simulador.is_org_admin(sp.organization_id)
             or simulador.has_team_role(sp.team_id, array['manager'])
           )
      )
    ))
    or (status = 'draft' and user_id = simulador.current_simulador_user_id())
  );

-- audit_log: solo org_admin lee su org (entity_id se cruza con sus entities propias)
-- v0 política conservadora: no lectura desde cliente. Acceso via service_role + admin UI.

commit;

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on function simulador.current_simulador_user_id is 'Retorna el simulador.users.id para el auth.uid() actual. NULL si no hay user.';
comment on function simulador.has_org_role is 'Boolean: el auth user tiene alguno de los roles[] en la org dada.';
comment on function simulador.has_team_role is 'Boolean: el auth user tiene alguno de los roles[] en el team dado.';
comment on function simulador.is_org_admin is 'Shortcut: ¿auth user es org_admin de la org dada?';
comment on function simulador.user_in_org is 'Boolean: ¿auth user es miembro (cualquier rol) de la org dada?';
