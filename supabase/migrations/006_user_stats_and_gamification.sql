-- ============================================================================
-- Migration 006 — user_stats, RPC de XP y trigger de gamification
-- ----------------------------------------------------------------------------
-- Conecta `user_progress` con un sistema real de XP, racha diaria y nivel.
--
-- Qué hace esta migración:
--   1. Crea tabla `user_stats` (agregado por usuario: total_xp, level,
--      current_streak, longest_streak, last_activity_date).
--   2. Crea función `award_lecture_xp(p_user_id, p_lecture_id)` que suma
--      slides.xp publicados/scoreable para esa lección y lo escribe en
--      user_progress.xp_earned.
--   3. Crea función `recalculate_user_stats(p_user_id)` que agrega user_progress
--      y actualiza user_stats (XP total, nivel, streak).
--   4. Crea trigger `on_user_progress_complete` que al marcar
--      `is_completed = true` llama a award_lecture_xp + recalculate_user_stats
--      automáticamente, de forma atómica.
--   5. Activa RLS en user_stats con policy read-only para el propio usuario.
--
-- Diseño:
--   * XP por lección = suma de slides.xp WHERE lecture_id = X AND
--     is_scoreable AND status = 'published'. Esto asegura que el XP refleja
--     el contenido realmente disponible para el alumno, no drafts.
--   * Nivel = floor(total_xp / 100) + 1 (Nivel 1 = 0-99 XP, Nivel 2 = 100-199 XP…).
--   * Racha diaria = días consecutivos con al menos 1 lección completada,
--     comparando last_activity_date vs la fecha del nuevo completed_at.
--   * Las funciones son SECURITY DEFINER con search_path fijo: corren con
--     los permisos de la tabla pero respetan RLS lógica de usuario vía el
--     parámetro p_user_id (que viene del trigger con auth.uid() implícito o
--     de una llamada client-side validada).
-- ============================================================================


-- ============================================================================
-- 1. Tabla user_stats
-- ============================================================================
create table if not exists user_stats (
  user_id              uuid primary key references auth.users(id) on delete cascade,

  -- xp y nivel
  total_xp             integer not null default 0 check (total_xp >= 0),
  level                smallint not null default 1 check (level >= 1),

  -- racha diaria
  current_streak       smallint not null default 0 check (current_streak >= 0),
                       -- días consecutivos con ≥1 lección completada.
  longest_streak       smallint not null default 0 check (longest_streak >= 0),
                       -- mayor racha alcanzada históricamente.
  last_activity_date   date,
                       -- último día con actividad. NULL si nunca completó nada.

  -- contadores agregados (cache para evitar queries costosas en cada render)
  lessons_completed    integer not null default 0 check (lessons_completed >= 0),

  -- timestamps
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index user_stats_level_idx        on user_stats(level);
create index user_stats_activity_idx     on user_stats(last_activity_date);

create trigger user_stats_updated_at
  before update on user_stats
  for each row execute function set_updated_at();


-- ============================================================================
-- 2. RLS: cada usuario solo ve sus propias stats
-- ============================================================================
alter table user_stats enable row level security;

drop policy if exists "users_read_own_stats" on user_stats;
create policy "users_read_own_stats" on user_stats
  for select
  to authenticated
  using (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies: user_stats se escribe únicamente vía
-- funciones SECURITY DEFINER invocadas por el trigger. El usuario nunca
-- tiene acceso de escritura directo.


-- ============================================================================
-- 3. Función: award_lecture_xp
-- ----------------------------------------------------------------------------
-- Suma slides.xp (is_scoreable + published) para la lección y lo escribe en
-- user_progress.xp_earned. Idempotente: si ya había un valor, lo reemplaza.
-- Retorna el XP ganado para que el caller pueda animar el delta.
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
  -- calcular XP total de la lección (slides publicados y scoreable)
  select coalesce(sum(xp), 0)::smallint
    into v_xp_sum
  from slides
  where lecture_id = p_lecture_id
    and is_scoreable = true
    and status = 'published';

  -- escribir en user_progress. Asume que la fila ya existe (trigger corre
  -- AFTER UPDATE de is_completed → true, y el caller ya hizo INSERT/UPDATE).
  update user_progress
     set xp_earned = v_xp_sum
   where user_id = p_user_id
     and lecture_id = p_lecture_id;

  return v_xp_sum;
end;
$$;


-- ============================================================================
-- 4. Función: recalculate_user_stats
-- ----------------------------------------------------------------------------
-- Agrega user_progress y upsertea user_stats:
--   - total_xp = SUM(xp_earned)
--   - level = floor(total_xp / 100) + 1
--   - lessons_completed = COUNT(is_completed=true)
--   - current_streak y longest_streak = derivados de completed_at por día
--   - last_activity_date = max(completed_at::date)
-- ============================================================================
create or replace function recalculate_user_stats(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_total_xp          integer;
  v_lessons_completed integer;
  v_last_date         date;
  v_current_streak    smallint;
  v_longest_streak    smallint;
begin
  -- agregados simples
  select
    coalesce(sum(xp_earned), 0)::integer,
    count(*) filter (where is_completed = true)::integer,
    max(completed_at::date)
  into
    v_total_xp,
    v_lessons_completed,
    v_last_date
  from user_progress
  where user_id = p_user_id;

  -- streak: grupos consecutivos de días con ≥1 completed.
  -- Técnica de grupos: restar row_number a la fecha; los días consecutivos
  -- quedan en el mismo bucket.
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

  -- upsert user_stats
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
-- 5. Trigger: on_user_progress_complete
-- ----------------------------------------------------------------------------
-- Se dispara AFTER INSERT/UPDATE en user_progress cuando is_completed pasa
-- a true. Llama award_lecture_xp (escribe xp_earned) y recalculate_user_stats
-- (actualiza user_stats) de forma atómica.
-- ============================================================================
create or replace function handle_user_progress_complete()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_first_completion boolean;
  v_completed_at_changed boolean;
begin
  -- Primera vez que esta lección se marca completada (false/NULL -> true):
  -- otorgamos XP. award_lecture_xp sobrescribe xp_earned, así que re-ejecutarlo
  -- es inofensivo pero innecesario.
  v_first_completion := new.is_completed = true and (
    tg_op = 'INSERT'
    or (tg_op = 'UPDATE' and coalesce(old.is_completed, false) = false)
  );

  -- Un re-completado ("replay") en otro día cambia completed_at. Aunque
  -- is_completed ya era true, necesitamos recalcular stats (streak,
  -- last_activity_date) para capturar esa nueva actividad.
  v_completed_at_changed := tg_op = 'UPDATE'
    and new.is_completed = true
    and new.completed_at is distinct from old.completed_at;

  if v_first_completion then
    perform award_lecture_xp(new.user_id, new.lecture_id);
  end if;

  if v_first_completion or v_completed_at_changed then
    perform recalculate_user_stats(new.user_id);
  end if;

  return new;
end;
$$;

drop trigger if exists on_user_progress_complete on user_progress;
create trigger on_user_progress_complete
  after insert or update of is_completed, completed_at on user_progress
  for each row execute function handle_user_progress_complete();


-- ============================================================================
-- 6. Backfill (opcional): recalcular stats para usuarios con progreso existente
-- ----------------------------------------------------------------------------
-- Sirve para la primera vez que corre la migración: si había usuarios con
-- lecciones marcadas como completadas pero xp_earned=0, les llena el XP y
-- user_stats con los valores correctos.
-- ============================================================================
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


-- ============================================================================
-- FIN DE MIGRATION 006
-- ----------------------------------------------------------------------------
-- Verificación:
--   1. select count(*) from user_stats;  -- debe ser > 0 si había usuarios
--   2. select total_xp, level, current_streak from user_stats limit 5;
--   3. select xp_earned from user_progress where is_completed = true limit 5;
--      (todos deben tener un valor > 0 si la lección tiene slides scoreable)
--
-- En el futuro:
--   - Para añadir badges: crear tablas badges/user_badges y evaluar dentro
--     de handle_user_progress_complete después de recalculate_user_stats.
--   - Para más tiers de nivel: cambiar la fórmula en recalculate_user_stats.
-- ============================================================================
