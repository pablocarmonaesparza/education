-- RLS smoke test template for schema simulador.
--
-- Purpose:
--   Validate that org A cannot read org B rows through authenticated paths.
--
-- Usage:
--   Run against a disposable/staging Supabase project with two synthetic auth users.
--   Do not run against production with real customers unless wrapped in a transaction
--   and seeded with synthetic data only.
--
-- TODO(B2/B10): replace placeholders with generated synthetic users after
-- migration 021/022 settles.

begin;

-- Expected setup:
-- - user_a_auth_id belongs to org_a
-- - user_b_auth_id belongs to org_b
-- - org_a and org_b have no shared memberships

-- Example pattern:
-- select set_config('request.jwt.claim.sub', '<user_a_auth_id>', true);
-- select * from simulador.organizations where id = '<org_b>';
-- Expected: 0 rows.

rollback;
