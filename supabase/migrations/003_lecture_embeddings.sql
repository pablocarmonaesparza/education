-- 003_lecture_embeddings.sql
-- Vector embeddings per lecture for personalized route retrieval.
-- Usa pgvector (v0.8+, ya habilitado en este proyecto).
-- Modelo default: OpenAI text-embedding-3-small (1536 dims).
-- Re-embeddear con text-embedding-3-large (3072 dims) es cambio de schema,
-- no lo hacemos hoy.

create extension if not exists vector;

create table if not exists lecture_embeddings (
  -- identidad: 1:1 con lectures. No versioning soft aquí — si una lecture
  -- cambia, re-embeddear y reemplazar. content_hash detecta drift.
  lecture_id         uuid primary key references lectures(id) on delete cascade,

  -- embedding
  embedding          vector(1536) not null,
  model              text not null default 'text-embedding-3-small',

  -- traceability
  embedded_text      text not null,
                     -- el texto exacto que se envió al modelo para embedder.
                     -- permite replicar el embedding y debugear mismatches.
  content_hash       text not null,
                     -- sha256(embedded_text). si hash cambia, re-embeddear.

  -- timestamps
  embedded_at        timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Index para búsqueda vectorial. HNSW para mejor recall que ivfflat en datasets
-- pequeños (<10k vectores). cosine distance = OpenAI recomendado.
create index if not exists lecture_embeddings_hnsw_idx
  on lecture_embeddings
  using hnsw (embedding vector_cosine_ops);

-- Index secundario para detectar drift rápido
create index if not exists lecture_embeddings_hash_idx
  on lecture_embeddings(content_hash);

-- Trigger para updated_at
create or replace function lecture_embeddings_set_updated_at()
  returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger lecture_embeddings_updated_at
  before update on lecture_embeddings
  for each row execute function lecture_embeddings_set_updated_at();

-- Helper view: lectures + su estado de embedding.
create or replace view lecture_embedding_status as
select
  l.id as lecture_id,
  l.section_id,
  l.slug,
  l.title,
  case when le.lecture_id is null then 'missing'
       when le.content_hash is null then 'invalid'
       else 'embedded'
  end as status,
  le.model,
  le.embedded_at
from lectures l
left join lecture_embeddings le on le.lecture_id = l.id;

comment on table lecture_embeddings is
  'Vector embeddings per lecture. Texto embebido = title + learning_objective + concept_name + narrative_arc. Re-embeddear cuando content_hash difiere.';
