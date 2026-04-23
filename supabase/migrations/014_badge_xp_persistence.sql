-- ============================================================================
-- Migration 014 — XP de badges persiste tras recalcular stats
-- ----------------------------------------------------------------------------
-- Bug encontrado por Codex review:
--
-- La versión de 013 sumaba `xp_reward` directamente a `user_stats.total_xp`
-- en `evaluate_user_badges`. El problema: la próxima vez que
-- `recalculate_user_stats` corre (trigger on_user_progress_complete al
-- completar otra lección, o el backfill inicial), hace:
--
--   total_xp := sum(user_progress.xp_earned)
--
-- y SOBRESCRIBE el valor — los XP ganados por badges desaparecen y el
-- nivel puede bajar.
--
-- Fix:
--   1. `recalculate_user_stats` suma ahora user_progress.xp_earned +
--      sum(badges.xp_reward) sobre los badges desbloqueados del usuario.
--      Así el XP de badges queda reflejado en cada re-cálculo.
--   2. `evaluate_user_badges` ya no toca user_stats.total_xp directo. Si
--      hubo unlocks nuevos, llama a `recalculate_user_stats` al final —
--      que ahora sí considera los xp_reward del nuevo badge.
--   3. Backfill: re-correr recalculate_user_stats para todos los usuarios
--      para reflejar los xp_reward de los badges backfilleados en 013.
-- ============================================================================


-- ============================================================================
-- 1. recalculate_user_stats: incluir XP de badges
-- ============================================================================
create or replace function recalculate_user_stats(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_lesson_xp         integer;
  v_badge_xp          integer;
  v_total_xp          integer;
  v_lessons_completed integer;
  v_last_date         date;
  v_current_streak    smallint;
  v_longest_streak    smallint;
begin
  -- XP de lecciones (una fila por lecture completada, xp_earned escrito
  -- por award_lecture_xp).
  select
    coalesce(sum(xp_earned), 0)::integer,
    count(*) filter (where is_completed = true)::integer,
    max(completed_at::date)
  into
    v_lesson_xp,
    v_lessons_completed,
    v_last_date
  from user_progress
  where user_id = p_user_id;

  -- XP de badges desbloqueados (la recompensa persiste mientras el badge
  -- exista en user_badges).
  select coalesce(sum(b.xp_reward), 0)::integer
    into v_badge_xp
  from user_badges ub
  join badges b on b.id = ub.badge_id
  where ub.user_id = p_user_id;

  v_total_xp := v_lesson_xp + v_badge_xp;

  -- Streak: grupos consecutivos de días con ≥1 completed.
  with completed_days as (
    select distinct completed_at::date as d
    from user_progress
    where user_id = p_user_id
      and is_completed = true
      and completed_at is not null
  ),
  ranked as (
    select
      d,
      d - (row_number() over (order by d))::int as grp
    from completed_days
  ),
  groups as (
    select grp, min(d) as start_d, max(d) as end_d, count(*) as streak_len
    from ranked
    group by grp
  )
  select
    coalesce(max(streak_len) filter (
      where end_d >= current_date - interval '1 day'
    ), 0)::smallint,
    coalesce(max(streak_len), 0)::smallint
  into
    v_current_streak,
    v_longest_streak
  from groups;

  insert into user_stats (
    user_id, total_xp, level, current_streak, longest_streak,
    last_activity_date, lessons_completed
  ) values (
    p_user_id,
    v_total_xp,
    (v_total_xp / 100 + 1)::smallint,
    v_current_streak,
    v_longest_streak,
    v_last_date,
    v_lessons_completed
  )
  on conflict (user_id) do update set
    total_xp           = excluded.total_xp,
    level              = excluded.level,
    current_streak     = excluded.current_streak,
    longest_streak     = greatest(user_stats.longest_streak, excluded.longest_streak),
    last_activity_date = excluded.last_activity_date,
    lessons_completed  = excluded.lessons_completed;
end;
$$;


-- ============================================================================
-- 2. evaluate_user_badges: NO tocar total_xp directo; llamar recalc
-- ============================================================================
create or replace function evaluate_user_badges(p_user_id uuid)
returns text[]
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_stats              record;
  v_badge              record;
  v_qualifies          boolean;
  v_new_unlocks        text[] := array[]::text[];
  v_has_first_section  boolean;
  v_has_perfect_week   boolean;
begin
  select total_xp, current_streak, longest_streak, lessons_completed
    into v_stats
  from user_stats
  where user_id = p_user_id;

  if not found then
    return v_new_unlocks;
  end if;

  select exists (
    select 1
    from sections s
    join lectures l on l.section_id = s.id
    where s.status = 'published'
      and l.status = 'published'
    group by s.id
    having
      count(l.id) > 0
      and count(l.id) = count(l.id) filter (
        where exists (
          select 1 from user_progress up
          where up.user_id = p_user_id
            and up.lecture_id = l.id
            and up.is_completed = true
        )
      )
  ) into v_has_first_section;

  select exists (
    with dd as (
      select distinct
        date_trunc('week', completed_at at time zone 'UTC')::date as week_start,
        extract(isodow from completed_at at time zone 'UTC')::int as dow
      from user_progress
      where user_id = p_user_id
        and is_completed = true
        and completed_at is not null
    )
    select 1
    from dd
    where dow between 1 and 5
    group by week_start
    having count(distinct dow) = 5
  ) into v_has_perfect_week;

  for v_badge in
    select id, xp_reward, requirement
    from badges
  loop
    v_qualifies := false;

    case v_badge.requirement->>'kind'
      when 'lessons_completed' then
        v_qualifies := v_stats.lessons_completed
          >= coalesce((v_badge.requirement->>'min')::int, 1);
      when 'current_streak' then
        v_qualifies := v_stats.current_streak
          >= coalesce((v_badge.requirement->>'min')::int, 1);
      when 'longest_streak' then
        v_qualifies := v_stats.longest_streak
          >= coalesce((v_badge.requirement->>'min')::int, 1);
      when 'first_lesson' then
        v_qualifies := v_stats.lessons_completed >= 1;
      when 'first_section_completed' then
        v_qualifies := v_has_first_section;
      when 'perfect_week' then
        v_qualifies := v_has_perfect_week;
      when 'total_xp' then
        v_qualifies := v_stats.total_xp
          >= coalesce((v_badge.requirement->>'min')::int, 1);
      else
        v_qualifies := false;
    end case;

    if v_qualifies then
      insert into user_badges (user_id, badge_id)
      values (p_user_id, v_badge.id)
      on conflict (user_id, badge_id) do nothing;

      if found then
        v_new_unlocks := v_new_unlocks || v_badge.id;
      end if;
    end if;
  end loop;

  -- Si hubo unlocks nuevos, re-calcular stats para que total_xp y level
  -- reflejen los xp_reward recién otorgados. recalculate_user_stats ahora
  -- suma user_progress.xp_earned + user_badges.xp_reward — no hay bucle
  -- porque la segunda llamada a evaluate (si existiera) no encontraría
  -- badges nuevos para esta snapshot.
  if array_length(v_new_unlocks, 1) > 0 then
    perform recalculate_user_stats(p_user_id);
  end if;

  return v_new_unlocks;
end;
$$;


-- ============================================================================
-- 3. Backfill: re-calcular stats de todos los usuarios
-- ----------------------------------------------------------------------------
-- Necesario porque los backfill de 013 ya desbloquearon badges con la
-- lógica vieja. Re-calcular ahora suma los xp_reward correctamente.
-- ============================================================================
do $$
declare
  r record;
begin
  for r in select distinct user_id from user_stats loop
    perform recalculate_user_stats(r.user_id);
  end loop;
end $$;


-- ============================================================================
-- FIN MIGRATION 014
-- ----------------------------------------------------------------------------
-- Verificación:
--   -- user_stats.total_xp debe incluir ahora el xp_reward de sus badges
--   select
--     us.total_xp,
--     us.lessons_completed,
--     coalesce(sum(b.xp_reward), 0) as badge_xp,
--     (select coalesce(sum(up.xp_earned), 0) from user_progress up
--       where up.user_id = us.user_id) as lesson_xp
--   from user_stats us
--   left join user_badges ub on ub.user_id = us.user_id
--   left join badges b on b.id = ub.badge_id
--   group by us.user_id, us.total_xp, us.lessons_completed
--   limit 5;
--   -- Debería cumplirse: total_xp = badge_xp + lesson_xp
-- ============================================================================
