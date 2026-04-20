-- ============================================================================
-- Migration 001 — Initial content schema
-- ----------------------------------------------------------------------------
-- Crea las 3 tablas centrales del contenido del curso:
--   sections  → 10 secciones del curso (id smallint 1..N, bounded)
--   lectures  → N lecciones por sección (id uuid, versionable)
--   slides    → 10 slides por lección (id uuid, versionable)
--
-- Precondición: haber dropeado las tablas legacy (lectures, lecture_slides,
-- education_system, education_system_vectorized, user_exercises,
-- exercise_progress, checkpoint_submissions, video_progress) via la migration
-- de nuke que vive en la otra migration.
--
-- Seed: NO incluido aquí. Ver 002_seed_sections.sql para cargar las 10
-- secciones después de crear el schema.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Función compartida: auto-actualizar updated_at en cada UPDATE.
-- Usada por las 3 tablas via triggers.
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
  returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;


-- ============================================================================
-- Tabla 1 — sections
-- ----------------------------------------------------------------------------
-- Las 10 secciones del curso. Bounded, ordered, container entity.
-- No tiene versioning ni freshness tracking — es contenedor, no contenido.
-- ============================================================================
create table sections (
  -- identidad
  id              smallint primary key,
                  -- 1..N. Manualmente asignado, corresponde al orden del outline.
  slug            text unique not null,
                  -- url-safe, globalmente único. Ej: "fundamentos".
  name            text not null,
                  -- display form (minúsculas con excepciones de nombres propios
                  -- aplicadas). Storage canónico — se renderiza tal cual.

  -- orden
  display_order   smallint not null unique,
                  -- posición actual en el curso (1..N). Separada de id para
                  -- permitir reordenar sin migration.

  -- pedagogía
  pedagogy        text not null,
                  -- línea del outline. Rol de la sección en una frase.
  learning_arc    text,
                  -- 2-4 líneas del arco en conjunto. NULL en planned,
                  -- se llena en workshop posterior.
  audience_note   text,
                  -- override opcional de audiencia. NULL = default global.

  -- relaciones
  prereq_ids      smallint[] not null default '{}',
                  -- secciones que deben completarse antes. Vacío en MVP.

  -- operación
  est_lectures    smallint,
                  -- estimado planeado. NULL hasta que se define.
  status          text not null default 'planned'
                  check (status in (
                    'planned','drafted','in_review','published','archived'
                  )),

  -- timestamps
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index sections_status_idx        on sections(status);
create index sections_display_order_idx on sections(display_order);

create trigger sections_updated_at
  before update on sections
  for each row execute function set_updated_at();


-- ============================================================================
-- Tabla 2 — lectures
-- ----------------------------------------------------------------------------
-- Lecciones dentro de cada sección. Content entity con versioning y freshness.
-- Los campos pedagógicos son nullable hasta que status='published', momento
-- en que un check constraint los exige.
-- ============================================================================
create table lectures (
  -- identidad
  id                 uuid primary key default gen_random_uuid(),
  section_id         smallint not null references sections(id) on delete restrict,
                     -- FK a sections. RESTRICT: no dropear sección con lecciones.
  slug               text not null,
                     -- único dentro de la sección (no global).
  display_order      smallint not null,
                     -- posición dentro de la sección.

  -- contenido core (siempre presente)
  title              text not null,

  -- contenido pedagógico (nullable hasta diseño completo)
  learning_objective text,
                     -- frase con verbo Bloom. Qué sabe hacer el alumno al salir.
  bloom_verb         text
                     check (bloom_verb is null or bloom_verb in (
                       'recordar','entender','aplicar','analizar','evaluar','crear'
                     )),
  cognitive_route    text
                     check (cognitive_route is null or cognitive_route in (
                       'conceptual','procedimental','mixta'
                     )),
                     -- conceptual 40/60, procedimental 25/75, mixta 30/70
                     -- per §2.3 metodología.
  concept_name       text,
                     -- idea nombrable que introduce esta lección.
                     -- Denormalizado a propósito — no hay tabla concepts en MVP.
  narrative_arc      text,
                     -- 2-4 líneas del arco narrativo.
  scenario_character text,
                     -- personaje del roster §4.1. NULL si la lección es
                     -- explicación pura sin caso (regla 6.6).

  -- operación
  est_slides         smallint not null default 10
                     check (est_slides between 8 and 15),
                     -- §3.2: 10 fijo en MVP. 11-12 si worked example extra.
                     -- 15 techo duro.
  est_minutes        smallint,
                     -- derivable pero útil explícito para UI.
  prereq_lecture_ids uuid[] not null default '{}',
                     -- lecciones requeridas antes. Vacío en MVP per regla
                     -- nueva v1 (lecciones autocontenidas).

  -- meta / auditoría
  source             text not null default 'planned'
                     check (source in (
                       'planned','ai-generated','manual','pablo','codex'
                     )),
                     -- quién escribió. Útil al debuggear errores sistemáticos.
  status             text not null default 'planned'
                     check (status in (
                       'planned','drafted','in_review','published','archived'
                     )),

  -- versioning (soft)
  version                smallint not null default 1,
  supersedes_lecture_id  uuid references lectures(id) on delete set null,
                         -- apunta a versión previa si esta la reemplaza.
                         -- SET NULL: preservar nueva si se borra vieja.

  -- freshness
  last_reviewed_at   timestamptz,
                     -- timestamp de último review manual de vigencia del contenido.
                     -- Útil cuando cambia el stack (ej: Seedance deja de ser el rey).

  -- timestamps
  published_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- constraints de unicidad
  unique (section_id, slug),
  unique (section_id, display_order),

  -- gate de publicación: no puedes publicar sin campos pedagógicos definidos
  check (
    status <> 'published' or (
      learning_objective is not null
      and bloom_verb is not null
      and cognitive_route is not null
    )
  )
);

create index lectures_section_idx       on lectures(section_id);
create index lectures_status_idx        on lectures(status);
create index lectures_bloom_idx         on lectures(bloom_verb);
create index lectures_supersedes_idx    on lectures(supersedes_lecture_id);
create index lectures_last_reviewed_idx on lectures(last_reviewed_at);

create trigger lectures_updated_at
  before update on lectures
  for each row execute function set_updated_at();


-- ============================================================================
-- Tabla 3 — slides
-- ----------------------------------------------------------------------------
-- Slides individuales dentro de cada lección. Typed content en JSONB
-- (schema varía por `kind`). Misma estrategia de versioning y freshness
-- que lectures.
-- ============================================================================
create table slides (
  -- identidad
  id                 uuid primary key default gen_random_uuid(),
  lecture_id         uuid not null references lectures(id) on delete cascade,
                     -- FK a lectures. CASCADE: slide no vive sin su lección.
  order_in_lecture   smallint not null,
                     -- posición 1..N dentro de la lección.

  -- tipo y fase pedagógica
  kind               text not null
                     check (kind in (
                       'concept','concept-visual','celebration',
                       'mcq','multi-select','true-false','fill-blank',
                       'order-steps','tap-match','code-completion',
                       'build-prompt','ai-prompt'
                     )),
                     -- 11 vivos + 1 deferido (ai-prompt).
  phase              text
                     check (phase is null or phase in (
                       'engage','explore','explain','elaborate','evaluate'
                     )),
                     -- fase 5E a la que pertenece. NULL para celebration
                     -- que no mapea a 5E.

  -- contenido (shape varía por kind, validación en lint)
  content            jsonb not null default '{}'::jsonb,
                     -- estructura varía:
                     --   concept/concept-visual: {title, body, image?}
                     --   mcq: {prompt, options[], correctId, explanation}
                     --   tap-match: {prompt, pairs[], explanation}
                     --   ... etc. Ver ExperimentLesson.tsx para el shape.
                     -- La validación detallada la hace scripts/lint-lessons.py.

  -- scoring
  is_scoreable       boolean not null default false,
                     -- true para los 8 tipos de ejercicio,
                     -- false para concept/concept-visual/celebration.
  xp                 smallint not null default 0
                     check (xp >= 0),
                     -- XP al completar. 0 para no-scoreable.

  -- meta / auditoría
  source             text not null default 'planned'
                     check (source in (
                       'planned','ai-generated','manual','pablo','codex'
                     )),
  status             text not null default 'planned'
                     check (status in (
                       'planned','drafted','in_review','published','archived'
                     )),

  -- versioning (soft)
  version                smallint not null default 1,
  supersedes_slide_id    uuid references slides(id) on delete set null,

  -- freshness
  last_reviewed_at   timestamptz,

  -- timestamps
  published_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- constraints de unicidad
  unique (lecture_id, order_in_lecture),

  -- gate: publicar requiere content no-vacío
  check (
    status <> 'published' or (content <> '{}'::jsonb)
  ),

  -- consistencia kind ↔ is_scoreable:
  -- concept/concept-visual/celebration NO son scoreable;
  -- el resto (8 ejercicios + ai-prompt deferido) SÍ.
  check (
    (kind in ('concept','concept-visual','celebration') and is_scoreable = false)
    or
    (kind not in ('concept','concept-visual','celebration') and is_scoreable = true)
  ),

  -- regla: scoreable implica xp > 0
  check (
    not is_scoreable or xp > 0
  )
);

create index slides_lecture_idx       on slides(lecture_id);
create index slides_kind_idx          on slides(kind);
create index slides_status_idx        on slides(status);
create index slides_phase_idx         on slides(phase);
create index slides_supersedes_idx    on slides(supersedes_slide_id);
create index slides_last_reviewed_idx on slides(last_reviewed_at);

create trigger slides_updated_at
  before update on slides
  for each row execute function set_updated_at();


-- ============================================================================
-- FIN DE MIGRATION 001
-- ----------------------------------------------------------------------------
-- Siguiente: 002_seed_sections.sql carga las 10 secciones.
-- Siguiente-siguiente: cuando existan lectures y slides, más migrations
-- para tablas auxiliares (user_progress, slide_flags, lecture_embeddings).
-- ============================================================================
