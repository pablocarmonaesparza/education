-- ============================================================================
-- Migration 003 — user_progress + views de analytics por sección
-- ----------------------------------------------------------------------------
-- Crea la tabla donde se registra cada interacción del alumno con una lección,
-- y las views derivadas que calculan métricas por sección al vuelo. Diseño:
--
--   - `user_progress` registra 1 fila por (user_id, lecture_id). Se actualiza
--     conforme el alumno avanza por los slides de esa lección.
--   - Las métricas por sección NO se guardan como columnas en `sections` —
--     se calculan al vuelo desde `user_progress` vía views. Así evitamos
--     duplicación que se desincroniza.
--
-- Hoy la tabla queda vacía (maintenance mode, sin usuarios). El túnel queda
-- abierto — cuando lanzemos, las views empiezan a devolver datos reales sin
-- cambiar schema.
-- ============================================================================

create table user_progress (
  -- identidad compuesta
  user_id            uuid not null references auth.users(id) on delete cascade,
  lecture_id         uuid not null references lectures(id)   on delete cascade,

  -- timestamps de la sesión
  started_at         timestamptz not null default now(),
                     -- primera vez que el alumno abrió esta lección
  completed_at       timestamptz,
                     -- NULL hasta completar. Cuando no es NULL, la lección está
                     -- terminada.
  last_active_at     timestamptz not null default now(),
                     -- se actualiza con cada interacción dentro de la lección

  -- progreso granular
  slides_completed   smallint not null default 0 check (slides_completed >= 0),
                     -- número de slides ya completados en esta lección (0..est_slides)
  is_completed       boolean not null default false,
                     -- true cuando el alumno terminó la última slide. Útil para
                     -- queries rápidas sin comparar slides_completed vs total.

  -- gamificación
  xp_earned          smallint not null default 0 check (xp_earned >= 0),
                     -- XP acumulado en esta lección
  attempts           integer not null default 1 check (attempts > 0),
                     -- veces que el alumno reinició la lección

  -- auditoría
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  primary key (user_id, lecture_id),

  -- regla: si is_completed=true, completed_at no puede ser NULL
  check (
    (is_completed = false and completed_at is null)
    or
    (is_completed = true and completed_at is not null)
  )
);

create index user_progress_user_idx         on user_progress(user_id);
create index user_progress_lecture_idx      on user_progress(lecture_id);
create index user_progress_last_active_idx  on user_progress(last_active_at);
create index user_progress_completed_idx    on user_progress(is_completed, completed_at);

create trigger user_progress_updated_at
  before update on user_progress
  for each row execute function set_updated_at();


-- ============================================================================
-- Views de analytics por sección
-- ----------------------------------------------------------------------------
-- Todas las views calculan on-the-fly desde user_progress. Cuando haya data,
-- empiezan a devolver números reales sin cambio de schema.
-- ============================================================================

-- View 1 — resumen por sección
-- usuarios actualmente activos (ult. 30d), completados, en progreso, tiempo
-- promedio y XP total.
create or replace view section_analytics as
select
  s.id                                        as section_id,
  s.name                                      as section_name,
  s.display_order                             as display_order,
  s.est_lectures                              as est_lectures,
  -- contar usuarios distintos con cualquier progreso en la sección
  count(distinct up.user_id)                  as total_users_ever,
  -- usuarios activos en los últimos 30 días
  count(distinct up.user_id) filter (
    where up.last_active_at >= now() - interval '30 days'
  )                                           as active_last_30d,
  count(distinct up.user_id) filter (
    where up.last_active_at >= now() - interval '7 days'
  )                                           as active_last_7d,
  -- usuarios que completaron TODAS las lecciones de la sección
  count(distinct up.user_id) filter (
    where up.is_completed = true
  )                                           as users_completed_any,
  -- tiempo mediano en una lección de la sección (para usuarios que completaron)
  extract(epoch from percentile_cont(0.5) within group (
    order by (up.completed_at - up.started_at)
  ))::int                                     as median_seconds_per_lecture,
  -- XP total otorgado en la sección
  coalesce(sum(up.xp_earned), 0)              as total_xp_awarded
from sections s
left join lectures l  on l.section_id = s.id
left join user_progress up on up.lecture_id = l.id
group by s.id, s.name, s.display_order, s.est_lectures
order by s.display_order;


-- View 2 — funnel de abandono por lección (dentro de cada sección)
-- para cada lección, cuántos empezaron, cuántos completaron, y drop-off.
create or replace view lecture_funnel as
select
  s.id                        as section_id,
  s.name                      as section_name,
  l.id                        as lecture_id,
  l.display_order             as lecture_order,
  l.title                     as lecture_title,
  count(up.user_id)           as users_started,
  count(up.user_id) filter (
    where up.is_completed = true
  )                           as users_completed,
  -- dropoff = users_started - users_completed
  count(up.user_id) - count(up.user_id) filter (
    where up.is_completed = true
  )                           as users_dropped,
  case
    when count(up.user_id) > 0 then
      round(
        100.0 *
        count(up.user_id) filter (where up.is_completed = true) /
        count(up.user_id),
        1
      )
    else null
  end                         as completion_rate_pct
from sections s
join lectures l on l.section_id = s.id
left join user_progress up on up.lecture_id = l.id
group by s.id, s.name, l.id, l.display_order, l.title
order by s.display_order, l.display_order;


-- View 3 — usuarios actualmente activos (últimos 14 días) con sección "actual"
-- La sección actual se define como la que contiene la lección más recientemente
-- tocada por el usuario.
create or replace view user_current_section as
select distinct on (up.user_id)
  up.user_id                  as user_id,
  l.section_id                as current_section_id,
  s.name                      as current_section_name,
  l.display_order             as current_lecture_order,
  l.title                     as current_lecture_title,
  up.last_active_at           as last_active_at,
  up.is_completed             as last_lecture_completed
from user_progress up
join lectures l on l.id = up.lecture_id
join sections s on s.id = l.section_id
where up.last_active_at >= now() - interval '14 days'
order by up.user_id, up.last_active_at desc;


-- View 4 — dropoff por sección (usuarios que empezaron la sección y no
-- regresaron en 14+ días, y no completaron).
create or replace view section_dropoffs as
select
  l.section_id                as section_id,
  s.name                      as section_name,
  count(distinct up.user_id)  as users_dropped,
  -- lección donde abandonaron (la última que tocaron antes de desaparecer)
  array_agg(distinct l.display_order order by l.display_order) as dropped_at_lectures
from sections s
join lectures l on l.section_id = s.id
join user_progress up on up.lecture_id = l.id
where up.is_completed = false
  and up.last_active_at < now() - interval '14 days'
group by l.section_id, s.name
order by l.section_id;


-- ============================================================================
-- FIN DE MIGRATION 003
-- ----------------------------------------------------------------------------
-- Uso cuando haya data:
--   select * from section_analytics;
--   select * from lecture_funnel where section_id = 2 order by lecture_order;
--   select * from user_current_section;
--   select * from section_dropoffs;
-- ============================================================================
