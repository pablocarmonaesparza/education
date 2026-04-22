-- ============================================================================
-- Migration 007 — award_lecture_xp cuenta slides no-archivados
-- ----------------------------------------------------------------------------
-- Fix post-006: el filtro original `status = 'published'` no matcheaba la
-- realidad del contenido en prod. Los 1000 slides del curso están en status
-- 'drafted' pero son plenamente visibles y jugables desde el dashboard
-- (fetchLectureSlides usa `neq(status, 'archived')`). Con el filtro estricto
-- `published`, ningún usuario ganaba XP porque no había slides publicados.
--
-- Este fix alinea el trigger con la visibilidad real: cuenta cualquier slide
-- scoreable que no esté archivado. Si en el futuro el curso se cura más
-- estrictamente (drafts vs published), basta con volver al filtro original.
--
-- Smoke test al aplicar: lección con 95 XP scoreable disponible (todos en
-- status='drafted' — no hay slides 'published' en prod). Pre-fix otorgaba
-- 0 XP por el filtro estricto; post-fix otorga los 95 XP reales.
-- user_stats se crea con total_xp=95, level=1, current_streak=1.
-- ============================================================================

create or replace function award_lecture_xp(
  p_user_id    uuid,
  p_lecture_id uuid
)
returns smallint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_xp_sum smallint;
begin
  select coalesce(sum(xp), 0)::smallint
    into v_xp_sum
  from slides
  where lecture_id = p_lecture_id
    and is_scoreable = true
    and status != 'archived';

  update user_progress
     set xp_earned = v_xp_sum
   where user_id = p_user_id
     and lecture_id = p_lecture_id;

  return v_xp_sum;
end;
$$;

-- Backfill: re-otorgar XP a completions existentes con el nuevo filtro.
-- Idempotente: award_lecture_xp sobrescribe xp_earned, recalculate_user_stats
-- upsertea. Si alguien ya tenía XP de otras lecciones completadas, las
-- vuelve a sumar y stats queda correcto.
do $$
declare
  r record;
begin
  for r in
    select distinct user_id, lecture_id
    from user_progress
    where is_completed = true
  loop
    perform award_lecture_xp(r.user_id, r.lecture_id);
  end loop;

  for r in
    select distinct user_id
    from user_progress
  loop
    perform recalculate_user_stats(r.user_id);
  end loop;
end $$;
