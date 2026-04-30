-- ============================================================================
-- Migration 009 — slide_flags + view admin
-- ----------------------------------------------------------------------------
-- Feedback loop por slide. Sin esto no hay TSLW (Time Spent Learning Well,
-- guardrail metric de Duolingo): permite identificar slides rotas/confusas
-- con telemetría real, no anecdótica.
--
-- Diseño:
--   - Una fila por (user_id, slide_id, reason). Permite múltiples reasons
--     distintas por slide, pero no spam del mismo motivo.
--   - `lecture_id` denormalizado para queries rápidas a nivel sección.
--   - `user_attempt` JSONB con snapshot del intento, útil para reproducir
--     el bug sin asumir que el slide es estático (las opciones pueden
--     reordenarse en el renderer, etc.).
--   - Triage interno via `status` — open → triaged → resolved/wontfix.
--   - `user_id` nullable para soportar reports anónimos (futura lección
--     demo pre-auth, T1.3).
--
-- Documentado en CONTEXT.md §9 (backlog) y SCHEMA_v1.md (tabla 6 planeada).
-- ============================================================================

create table slide_flags (
  id              uuid primary key default gen_random_uuid(),
  slide_id        uuid not null references slides(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete set null,
                  -- nullable: anonymous flagging (futuro pre-auth demo)

  reason          text not null
                  check (reason in (
                    'wrong_correct_answer',   -- mi respuesta era correcta, marcada mal
                    'wrong_incorrect_answer', -- la "correcta" no lo es
                    'unclear_explanation',    -- no entendí la explicación
                    'typo_or_grammar',        -- error de copy
                    'visual_issue',           -- imagen/render rota
                    'other'
                  )),
  comment         text
                  check (comment is null or char_length(comment) <= 500),
                  -- free text opcional, cap a 500 chars

  -- contexto para triage
  lecture_id      uuid references lectures(id) on delete cascade,
                  -- denormalizado para joins rápidos a nivel sección
  user_attempt    jsonb,
                  -- snapshot del intento del user al momento del flag.
                  -- Ej: {"selectedId": 2, "options": [...]} para mcq.

  -- triage interno (manejado vía service_role)
  status          text not null default 'open'
                  check (status in (
                    'open','triaged','resolved','wontfix','duplicate'
                  )),
  resolved_at     timestamptz,
  resolved_notes  text,

  -- timestamps
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index slide_flags_slide_idx       on slide_flags(slide_id);
create index slide_flags_lecture_idx     on slide_flags(lecture_id);
create index slide_flags_open_idx        on slide_flags(status) where status = 'open';
create index slide_flags_user_idx        on slide_flags(user_id) where user_id is not null;
create index slide_flags_created_idx     on slide_flags(created_at desc);

-- Anti-spam: misma persona no puede flagear el mismo slide con el mismo
-- reason más de una vez. Reasons distintas en el mismo slide sí permitidas
-- (el slide puede tener varios problemas a la vez).
create unique index slide_flags_user_slide_reason_unique
  on slide_flags(user_id, slide_id, reason)
  where user_id is not null;

create trigger slide_flags_updated_at
  before update on slide_flags
  for each row execute function set_updated_at();


-- ============================================================================
-- RLS — slide_flags
-- ----------------------------------------------------------------------------
-- INSERT: cualquier authenticated puede flagear (sus propias filas).
-- SELECT: cada user solo ve sus propios flags.
-- UPDATE/DELETE: solo service_role (triage interno).
-- ============================================================================

alter table slide_flags enable row level security;

drop policy if exists "users_insert_flags" on slide_flags;
create policy "users_insert_flags" on slide_flags
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users_read_own_flags" on slide_flags;
create policy "users_read_own_flags" on slide_flags
  for select
  to authenticated
  using (auth.uid() = user_id);

-- (sin policies de UPDATE/DELETE → bloqueado por defecto;
--  service_role bypassa RLS y maneja triage)


-- ============================================================================
-- View admin — top slides flagged + tendencia 30d
-- ----------------------------------------------------------------------------
-- Uso interno (service_role). Pivote para construir el dashboard de funnel
-- + flags que es el otro deliverable de T1.1.
-- ============================================================================

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
  array_agg(distinct sf.reason)                     as reasons,
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


-- ============================================================================
-- FIN DE MIGRATION 009
-- ----------------------------------------------------------------------------
-- Uso esperado:
--
--   -- Top slides con problemas abiertos (admin):
--   select * from slide_flags_admin limit 20;
--
--   -- Cuántos flags abiertos por sección:
--   select section_name, sum(open_count) as open_flags
--   from slide_flags_admin
--   group by section_name
--   order by open_flags desc;
--
--   -- Mis propios flags (authenticated user):
--   select * from slide_flags;  -- RLS filtra a auth.uid()
-- ============================================================================
