-- Migration 025 — Fix recursive users RLS policy
--
-- The previous users_read_self_or_orgmate policy joined simulador.users from
-- inside a policy on simulador.users, which can trigger Postgres infinite
-- recursion. Use the security-definer helper current_simulador_user_id()
-- instead.

begin;

do $$
begin
  if to_regclass('simulador.users') is null then
    raise exception 'migration 025 requires simulador.users';
  end if;
end;
$$;

drop policy if exists "users_read_self_or_orgmate" on simulador.users;
create policy "users_read_self_or_orgmate" on simulador.users
  for select using (
    auth_user_id = auth.uid()
    or exists (
      select 1
        from simulador.organization_memberships my
        join simulador.organization_memberships other
          on other.organization_id = my.organization_id
       where my.user_id = simulador.current_simulador_user_id()
         and other.user_id = simulador.users.id
    )
  );

notify pgrst, 'reload schema';

commit;
