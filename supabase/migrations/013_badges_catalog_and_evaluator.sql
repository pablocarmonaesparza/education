-- ============================================================================
-- Migration 013 — badges (catálogo) + user_badges (desbloqueados) + evaluator
-- ----------------------------------------------------------------------------
-- Completa el P2 de gamification. Agrega sobre 006+007 (user_stats):
--   1. Tabla `badges` (catálogo estático — común, rare, epic, legendary).
--   2. Tabla `user_badges` (fila por desbloqueo) con RLS per-usuario.
--   3. Función `evaluate_user_badges(user_id)` — itera el catálogo, evalúa
--      criterios contra user_stats/user_progress, inserta desbloqueos nuevos,
--      retorna set de badge_ids recién desbloqueados.
--   4. Trigger `on_user_progress_complete` extendido: tras
--      recalculate_user_stats, llama evaluate_user_badges.
--   5. Seed del catálogo: 10 badges B2B-apropiados (sin "primer reto";
--      feature eliminada en d146ed7).
--
-- Diseño:
--   * Criterios en `badges.requirement` como JSONB tipado por `kind`. Cada
--     kind se evalúa por un branch en evaluate_user_badges — más robusto
--     que DSL, más simple que funciones por badge.
--   * XP reward NO se mezcla con lección: al desbloquear un badge, se
--     suma a user_stats.total_xp directamente y se re-calcula nivel. El
--     cliente animará el delta con el modal de unlock.
--   * evaluate_user_badges es idempotente: ON CONFLICT DO NOTHING por
--     (user_id, badge_id). Correrla múltiples veces no duplica.
-- ============================================================================


-- ============================================================================
-- 1. Tabla badges (catálogo)
-- ============================================================================
create table if not exists badges (
  id             text primary key,
  name           text not null,
  description    text not null,
  emoji          text not null,
  rarity         text not null check (rarity in ('common','rare','epic','legendary')),
  xp_reward      smallint not null default 0 check (xp_reward >= 0),
  -- requirement: { kind: 'lessons_completed', min: 10 }
  --            | { kind: 'current_streak', min: 3 }
  --            | { kind: 'longest_streak', min: 7 }
  --            | { kind: 'first_lesson' }
  --            | { kind: 'first_section_completed' }
  --            | { kind: 'perfect_week' } — ≥1 lección cada día lun-vie misma ISO week
  --            | { kind: 'total_xp', min: 1000 }
  requirement    jsonb not null,
  display_order  smallint not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists badges_rarity_idx        on badges(rarity);
create index if not exists badges_display_order_idx on badges(display_order);

-- Public read: el catálogo se muestra en UI antes de desbloquear.
alter table badges enable row level security;

drop policy if exists "public_read_badges" on badges;
create policy "public_read_badges" on badges
  for select
  to anon, authenticated
  using (true);

-- Writes via service_role only (no INSERT/UPDATE/DELETE policies).


-- ============================================================================
-- 2. Tabla user_badges (desbloqueos)
-- ============================================================================
create table if not exists user_badges (
  user_id     uuid not null references auth.users(id) on delete cascade,
  badge_id    text not null references badges(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create index if not exists user_badges_user_idx     on user_badges(user_id);
create index if not exists user_badges_unlocked_idx on user_badges(unlocked_at);

alter table user_badges enable row level security;

drop policy if exists "users_read_own_badges" on user_badges;
create policy "users_read_own_badges" on user_badges
  for select
  to authenticated
  using (auth.uid() = user_id);

-- INSERT solo vía SECURITY DEFINER function. No policy de insert para el
-- usuario, no puede auto-desbloquear badges.


-- ============================================================================
-- 3. Función: evaluate_user_badges
-- ----------------------------------------------------------------------------
-- Evalúa todos los badges contra el estado actual del usuario, inserta los
-- que aplican y no están ya en user_badges. Para cada desbloqueo suma
-- xp_reward a user_stats.total_xp y re-calcula level.
--
-- Retorna: array de badge_ids recién desbloqueados, para que el cliente
-- pueda animar el modal de unlock.
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
  v_total_xp_delta     integer := 0;
  v_has_first_section  boolean;
  v_has_perfect_week   boolean;
begin
  -- Snapshot de user_stats — fuente principal para criterios agregados.
  select total_xp, current_streak, longest_streak, lessons_completed
    into v_stats
  from user_stats
  where user_id = p_user_id;

  -- Si el usuario no tiene fila de stats aún, nada que evaluar.
  if not found then
    return v_new_unlocks;
  end if;

  -- Pre-cómputos caros (solo si hacen falta): sección completa, perfect week.
  -- first_section_completed: existe alguna sección donde user completó TODAS
  -- sus lectures publicadas.
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

  -- perfect_week: existe alguna ISO-week (semana lun-dom) donde user
  -- completó ≥1 lección cada día lun-vie.
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

  -- Recorrer catálogo. Solo inserta si (a) aplica y (b) no está ya.
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

      -- Si la fila se insertó (no hubo conflicto), cuenta como nuevo unlock.
      if found then
        v_new_unlocks := v_new_unlocks || v_badge.id;
        v_total_xp_delta := v_total_xp_delta + coalesce(v_badge.xp_reward, 0)::int;
      end if;
    end if;
  end loop;

  -- Sumar XP de badges desbloqueados directamente a user_stats.
  -- No tocamos user_progress.xp_earned (eso es per-lección), solo el
  -- agregado que alimenta nivel y pill de XP.
  if v_total_xp_delta > 0 then
    update user_stats
       set total_xp = total_xp + v_total_xp_delta,
           level    = ((total_xp + v_total_xp_delta) / 100 + 1)::smallint,
           updated_at = now()
     where user_id = p_user_id;
  end if;

  return v_new_unlocks;
end;
$$;


-- ============================================================================
-- 4. Extender trigger on_user_progress_complete
-- ----------------------------------------------------------------------------
-- Después de award_lecture_xp + recalculate_user_stats, evaluar badges.
-- evaluate_user_badges es idempotente, así que está seguro llamarlo
-- también en re-completions.
-- ============================================================================
create or replace function handle_user_progress_complete()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_first_completion     boolean;
  v_completed_at_changed boolean;
begin
  v_first_completion := new.is_completed = true and (
    tg_op = 'INSERT'
    or (tg_op = 'UPDATE' and coalesce(old.is_completed, false) = false)
  );

  v_completed_at_changed := tg_op = 'UPDATE'
    and new.is_completed = true
    and new.completed_at is distinct from old.completed_at;

  if v_first_completion then
    perform award_lecture_xp(new.user_id, new.lecture_id);
  end if;

  if v_first_completion or v_completed_at_changed then
    perform recalculate_user_stats(new.user_id);
    -- Evaluator corre al final: consume el snapshot fresco de user_stats
    -- y otorga cualquier badge que haya cruzado el umbral con esta lección.
    perform evaluate_user_badges(new.user_id);
  end if;

  return new;
end;
$$;


-- ============================================================================
-- 5. Seed del catálogo B2B
-- ----------------------------------------------------------------------------
-- 10 badges. Sin "primer reto" — feature de retos eliminada en d146ed7.
-- display_order sigue una curva de dificultad creciente.
-- ============================================================================
insert into badges (id, name, description, emoji, rarity, xp_reward, requirement, display_order) values
  ('first-lesson',
   'Primera lección',
   'Completaste tu primera lección en Itera. Bien empezado.',
   '🎯', 'common', 10,
   '{"kind":"first_lesson"}'::jsonb, 10),

  ('lessons-10',
   '10 lecciones',
   'Completaste 10 lecciones. Ya tienes una base.',
   '📚', 'common', 50,
   '{"kind":"lessons_completed","min":10}'::jsonb, 20),

  ('first-section',
   'Primera sección completa',
   'Terminaste todas las lecciones de una sección. Hito real.',
   '🏁', 'common', 75,
   '{"kind":"first_section_completed"}'::jsonb, 30),

  ('streak-3',
   '3 días seguidos',
   'Tres días consecutivos aprendiendo. El hábito comienza.',
   '🔥', 'common', 25,
   '{"kind":"current_streak","min":3}'::jsonb, 40),

  ('streak-7',
   'Semana completa',
   'Siete días seguidos. Esto ya es rutina.',
   '🔥', 'rare', 100,
   '{"kind":"longest_streak","min":7}'::jsonb, 50),

  ('perfect-week',
   'Semana laboral perfecta',
   'Aprendiste cada día laboral de una misma semana (lun-vie).',
   '💼', 'epic', 300,
   '{"kind":"perfect_week"}'::jsonb, 60),

  ('lessons-50',
   '50 lecciones',
   'Llevas la mitad del camino. Impresionante constancia.',
   '🎓', 'rare', 200,
   '{"kind":"lessons_completed","min":50}'::jsonb, 70),

  ('streak-30',
   'Racha de 30 días',
   'Un mes entero aprendiendo sin parar. Pocos llegan aquí.',
   '⚡', 'epic', 500,
   '{"kind":"longest_streak","min":30}'::jsonb, 80),

  ('lessons-100',
   '100 lecciones',
   'Completaste el curso entero de Itera. Maestría.',
   '👑', 'epic', 1000,
   '{"kind":"lessons_completed","min":100}'::jsonb, 90),

  ('xp-10000',
   '10,000 XP',
   'Acumulaste 10,000 puntos de experiencia. Leyenda interna.',
   '💎', 'legendary', 2000,
   '{"kind":"total_xp","min":10000}'::jsonb, 100)
on conflict (id) do update set
  name          = excluded.name,
  description   = excluded.description,
  emoji         = excluded.emoji,
  rarity        = excluded.rarity,
  xp_reward     = excluded.xp_reward,
  requirement   = excluded.requirement,
  display_order = excluded.display_order;


-- ============================================================================
-- 6. Backfill: evaluar badges para usuarios con stats existentes
-- ----------------------------------------------------------------------------
-- Si hubo users que ya cumplían criterios antes de esta migración, les
-- desbloqueamos los badges ahora. evaluate_user_badges es idempotente.
-- ============================================================================
do $$
declare
  r record;
begin
  for r in select distinct user_id from user_stats loop
    perform evaluate_user_badges(r.user_id);
  end loop;
end $$;


-- ============================================================================
-- FIN MIGRATION 013
-- ----------------------------------------------------------------------------
-- Verificación:
--   select count(*) from badges;                       -- 10
--   select count(*) from user_badges;                  -- >0 si había users activos
--   select * from user_badges limit 5;
--   select pg_get_functiondef('evaluate_user_badges(uuid)'::regprocedure);
-- ============================================================================
