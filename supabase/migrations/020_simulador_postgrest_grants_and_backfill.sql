-- Migration 020 — PostgREST exposure, grants, policies, and bridge-user backfill
--
-- This codifies the production DB fixes that were previously applied by hand:
--   1. Expose schema `simulador` through PostgREST.
--   2. Grant schema/table/sequence/function privileges for the runtime roles.
--   3. Recreate the defensive `simulador.users` RLS policies.
--   4. Add `simulador.ensure_bridge_user(auth.users.id)` for auth callback sync.
--   5. Backfill existing auth.users into simulador.users.

begin;

do $$
begin
  if to_regclass('simulador.users') is null then
    raise exception 'migration 020 requires simulador.users from migration 017';
  end if;

  if to_regclass('simulador.organization_memberships') is null then
    raise exception 'migration 020 requires simulador.organization_memberships from migration 017';
  end if;
end;
$$;

-- PostgREST uses the authenticator role to decide exposed schemas.
alter role authenticator set pgrst.db_schemas = 'public, graphql_public, simulador';

grant usage on schema simulador to authenticated, service_role;

grant all on all tables in schema simulador to authenticated, service_role;
grant all on all sequences in schema simulador to authenticated, service_role;
grant execute on all functions in schema simulador to authenticated, service_role;

alter default privileges in schema simulador grant all on tables to authenticated, service_role;
alter default privileges in schema simulador grant all on sequences to authenticated, service_role;
alter default privileges in schema simulador grant execute on functions to authenticated, service_role;

-- Defensive policy refresh. Migration 019 defines these, but the live project
-- had drifted after partial/manual application.
drop policy if exists "users_read_self_or_orgmate" on simulador.users;
create policy "users_read_self_or_orgmate" on simulador.users
  for select using (
    auth_user_id = auth.uid()
    or exists (
      select 1
        from simulador.organization_memberships my
        join simulador.users me on me.id = my.user_id
        join simulador.organization_memberships other on other.organization_id = my.organization_id
       where me.auth_user_id = auth.uid()
         and other.user_id = simulador.users.id
    )
  );

drop policy if exists "users_update_self" on simulador.users;
create policy "users_update_self" on simulador.users
  for update using (auth_user_id = auth.uid())
          with check (auth_user_id = auth.uid());

drop policy if exists "users_insert_self" on simulador.users;
create policy "users_insert_self" on simulador.users
  for insert with check (auth_user_id = auth.uid());

create or replace function simulador.ensure_bridge_user(
  p_auth_user_id uuid
) returns uuid
language plpgsql
security definer
set search_path = simulador, public, pg_temp
as $$
declare
  v_bridge_id uuid;
  v_email text;
  v_name text;
begin
  if auth.uid() is not null and p_auth_user_id <> auth.uid() then
    raise exception 'cannot ensure bridge user for another auth user';
  end if;

  select id
    into v_bridge_id
    from simulador.users
   where auth_user_id = p_auth_user_id;

  if v_bridge_id is not null then
    return v_bridge_id;
  end if;

  select au.email,
         coalesce(
           au.raw_user_meta_data->>'name',
           au.raw_user_meta_data->>'full_name',
           split_part(au.email, '@', 1)
         )
    into v_email, v_name
    from auth.users au
   where au.id = p_auth_user_id;

  if v_email is null then
    raise exception 'auth.users id % does not exist', p_auth_user_id;
  end if;

  insert into simulador.users (auth_user_id, email, full_name, locale)
       values (p_auth_user_id, v_email, v_name, 'es-MX')
    on conflict (auth_user_id) do update
      set email = excluded.email,
          full_name = coalesce(simulador.users.full_name, excluded.full_name)
    returning id into v_bridge_id;

  return v_bridge_id;
end;
$$;

grant execute on function simulador.ensure_bridge_user(uuid) to authenticated, service_role;

do $$
declare
  v_user record;
  v_count int := 0;
begin
  for v_user in
    select au.id
      from auth.users au
     where not exists (
       select 1 from simulador.users su where su.auth_user_id = au.id
     )
  loop
    perform simulador.ensure_bridge_user(v_user.id);
    v_count := v_count + 1;
  end loop;

  raise notice 'Backfilled % bridge users', v_count;
end;
$$;

notify pgrst, 'reload config';

commit;
