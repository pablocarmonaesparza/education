-- ============================================================================
-- Migration 010 — view global_engagement
-- ----------------------------------------------------------------------------
-- KPI tile feed para el dashboard admin de Education. Calcula totales globales
-- (no por sección) usando count(distinct user_id) sobre user_progress.
--
-- Por qué esto vive como view y no se computa en JS desde section_analytics:
-- una user activa en la sección 1 Y la sección 2 cuenta dos veces si sumamos
-- per-section, y se sub-cuenta si tomamos el max per-section. count(distinct)
-- a nivel global es la única lectura correcta.
--
-- security_invoker=true para que respete RLS del caller. El caller esperado
-- es service_role (admin dashboard) que bypassa RLS.
-- ============================================================================

create or replace view global_engagement as
select
  count(distinct user_id)                                            as total_users_ever,
  count(distinct user_id) filter (
    where last_active_at >= now() - interval '30 days'
  )                                                                  as active_last_30d,
  count(distinct user_id) filter (
    where last_active_at >= now() - interval '7 days'
  )                                                                  as active_last_7d,
  count(distinct user_id) filter (
    where is_completed = true
  )                                                                  as users_completed_any_lecture,
  coalesce(sum(xp_earned), 0)                                        as total_xp_awarded
from user_progress;

alter view global_engagement set (security_invoker = true);
