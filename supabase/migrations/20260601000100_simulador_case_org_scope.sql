-- #2 · org-scope de los casos para que el bespoke por empresa se EVALÚE en
-- producción (sesión + juez) SIN filtrarse entre tenants.
--
-- Agrega organization_id a case_templates/case_steps/case_variants:
--   - NULL  = caso global de la biblioteca (comportamiento actual, visible a todos).
--   - SET   = caso bespoke de esa empresa (visible solo a sus miembros).
-- La RLS de lectura se vuelve org-aware. Los casos EXISTENTES quedan con
-- organization_id NULL, así que su acceso NO cambia (siguen globales).

alter table simulador.case_templates
  add column if not exists organization_id uuid references simulador.organizations(id) on delete cascade;
alter table simulador.case_steps
  add column if not exists organization_id uuid references simulador.organizations(id) on delete cascade;
alter table simulador.case_variants
  add column if not exists organization_id uuid references simulador.organizations(id) on delete cascade;

create index if not exists case_templates_org on simulador.case_templates (organization_id);
create index if not exists case_steps_org on simulador.case_steps (organization_id);
create index if not exists case_variants_org on simulador.case_variants (organization_id);

-- Lectura org-aware (denormalizada para evitar subconsultas RLS recursivas):
-- global (NULL) para cualquier autenticado; bespoke solo para su org.
-- Se dropea tanto la policy vieja (authenticated_read_*) como la nueva
-- (read_*_org_aware) antes de crearla: idempotente, re-aplicable sin error.
drop policy if exists "authenticated_read_case_templates" on simulador.case_templates;
drop policy if exists "read_case_templates_org_aware" on simulador.case_templates;
create policy "read_case_templates_org_aware" on simulador.case_templates
  for select using (
    auth.uid() is not null
    and (organization_id is null or simulador.user_in_org(organization_id))
  );

drop policy if exists "authenticated_read_case_steps" on simulador.case_steps;
drop policy if exists "read_case_steps_org_aware" on simulador.case_steps;
create policy "read_case_steps_org_aware" on simulador.case_steps
  for select using (
    auth.uid() is not null
    and (organization_id is null or simulador.user_in_org(organization_id))
  );

drop policy if exists "authenticated_read_case_variants" on simulador.case_variants;
drop policy if exists "read_case_variants_org_aware" on simulador.case_variants;
create policy "read_case_variants_org_aware" on simulador.case_variants
  for select using (
    auth.uid() is not null
    and (organization_id is null or simulador.user_in_org(organization_id))
  );

comment on column simulador.case_templates.organization_id is
  'NULL = caso global de la biblioteca; SET = caso bespoke de esa empresa (RLS lo aisla).';
