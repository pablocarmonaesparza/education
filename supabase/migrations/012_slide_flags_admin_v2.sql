-- ============================================================================
-- Migration 012 — slide_flags_admin v2 + open_flags_by_section
-- ----------------------------------------------------------------------------
-- Dos cambios sobre la infra de flags admin:
--
-- 1) `slide_flags_admin` gana columna `open_reasons` (array de reasons que
--    siguen 'open'). La columna `reasons` se queda como histórico (todos
--    los reasons que ese slide ha tenido alguna vez). El dashboard admin
--    rendea los chips desde `open_reasons` para no mostrar reasons que
--    ya están resueltos.
--
-- 2) Nueva view `open_flags_by_section` que agrega en SQL en lugar de en JS.
--    El helper `getOpenFlagsBySection` corría un `array.reduce` sobre los
--    rows crudos, lo cual rompe contra el row-cap de PostgREST (1000 default)
--    si llegamos a tener miles de slides flageados — el conteo silencioso
--    queda corto. Mejor agregar SQL-side y pedir solo la fila por sección.
-- ============================================================================

-- CASCADE: si alguna vez una view dependiente (ej. una iteración previa
-- de `open_flags_by_section` que joineaba sobre `slide_flags_admin`) llega
-- a existir, el drop la arrastra para que el create-or-replace de abajo
-- pueda recrear la columna `open_reasons` sin pelear con dependencias.
drop view if exists slide_flags_admin cascade;

create or replace view slide_flags_admin as
select
  sf.slide_id                                       as slide_id,
  s.lecture_id                                      as lecture_id,
  s.kind                                            as slide_kind,
  s.order_in_lecture                                as slide_order,
  l.title                                           as lecture_title,
  l.section_id                                      as section_id,
  sec.name                                          as section_name,
  count(*)                                          as flag_count,
  count(*) filter (where sf.status = 'open')        as open_count,
  count(*) filter (
    where sf.created_at >= now() - interval '30 days'
  )                                                 as last_30d_count,
  -- histórico: todos los reasons que ese slide ha tenido alguna vez.
  array_agg(distinct sf.reason)                     as reasons,
  -- solo reasons que siguen 'open'. NULL collapsado a array vacío para
  -- que el caller pueda asumir array.
  coalesce(
    (
      select array_agg(distinct sf2.reason)
      from slide_flags sf2
      where sf2.slide_id = sf.slide_id
        and sf2.status = 'open'
    ),
    '{}'::text[]
  )                                                 as open_reasons,
  max(sf.created_at)                                as last_flagged_at
from slide_flags sf
join slides   s   on s.id = sf.slide_id
join lectures l   on l.id = s.lecture_id
join sections sec on sec.id = l.section_id
group by
  sf.slide_id, s.lecture_id, s.kind, s.order_in_lecture,
  l.title, l.section_id, sec.name
order by open_count desc, flag_count desc;

alter view slide_flags_admin set (security_invoker = true);


create or replace view open_flags_by_section as
select
  l.section_id                                      as section_id,
  sec.name                                          as section_name,
  count(*)                                          as open_flags
from slide_flags sf
join slides   s   on s.id = sf.slide_id
join lectures l   on l.id = s.lecture_id
join sections sec on sec.id = l.section_id
where sf.status = 'open'
group by l.section_id, sec.name
having count(*) > 0
order by open_flags desc;

alter view open_flags_by_section set (security_invoker = true);
