# R6 — embeddings + rerank stack para ruta personalizada

> Validación del stack actual y recomendación operativa. **Decisión técnica ya tomada en migration `003_lecture_embeddings.sql`:** OpenAI `text-embedding-3-small` (1536 dims) en pgvector con HNSW index.
>
> **Desbloquea:** Education T2.4 (ruta personalizada activa).

---

## 1. TL;DR — recomendación

**Mantener OpenAI `text-embedding-3-small` para embeddings (ya está wired en migration 003). Añadir Cohere `rerank-multilingual-v3.0` como segunda etapa para refinar top candidates.**

Razones:
1. **Cambiar embeddings = migration de schema** (vector(1536) → vector(otro)). Costo de cambio alto, ganancia marginal sin evidencia. La decisión actual es defendible.
2. **OpenAI `text-embedding-3-small` SÍ es multilingual** — soporta español sin traducción. Mi v1 dijo lo contrario; era falso.
3. **Cohere Rerank multilingual v3** es la capa que aporta mayor lift en español: rerank ≠ embedding, son etapas distintas, complementarias.
4. **El cuello de botella real no es el modelo, es el contenido del texto a embebir** (qué metadata se concatena) y la calidad del rerank step.

**Plan B:** si en M6 el retrieval real muestra recall pobre con `text-embedding-3-small`, evaluar `text-embedding-3-large` (3072 dims, mejor calidad, ~6.5x precio). El cambio es schema migration.

---

## 2. Lo que ya está construido (migration 003_lecture_embeddings.sql)

```sql
create table lecture_embeddings (
  lecture_id     uuid primary key references lectures(id) on delete cascade,
  embedding      vector(1536) not null,
  model          text not null default 'text-embedding-3-small',
  embedded_text  text not null,
  content_hash   text not null,
  embedded_at    timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index lecture_embeddings_hnsw_idx
  on lecture_embeddings using hnsw (embedding vector_cosine_ops);

create index lecture_embeddings_hash_idx on lecture_embeddings(content_hash);
```

El comment de la tabla especifica que el texto embebido es **`title + learning_objective + concept_name + narrative_arc`** y que se re-embebe cuando `content_hash` difiere.

Detalles técnicos a respetar:
- Vector cosine distance (recomendado por OpenAI para sus embeddings).
- HNSW > IVFFlat para nuestro volumen (<10k vectores).
- Hash detection para drift (no se re-embebe sin cambio).
- RLS habilitado en migration 005 con `public_read_lecture_embeddings`.

---

## 3. Comparativa de modelos (verificada)

### Embeddings

| Modelo | Dimensiones | Multilingual | Precio per 1M tokens |
|---|---|---|---|
| OpenAI `text-embedding-3-small` ✅ (actual) | 1536 | Sí (incluye español) | $0.02 |
| OpenAI `text-embedding-3-large` | 3072 | Sí (mejor que small) | $0.13 |
| Cohere `embed-multilingual-v3.0` | 1024 | 100+ idiomas, español first-class | $0.10 |
| Voyage `voyage-3-large` | 1024 | Decente | $0.18 |

**Aclaración importante:** `text-embedding-3-small` es multilingual. La SDK de OpenAI no requiere flag de idioma. La calidad en español es buena, no perfecta. Cohere multilingual tiene benchmarks ligeramente mejores en español según evaluations independientes, pero el delta de calidad raramente justifica el cambio de schema cuando el factor dominante en retrieval quality es el rerank step.

### Rerankers

| Modelo | Multilingual | Precio per 1k searches |
|---|---|---|
| Cohere `rerank-multilingual-v3.0` ✅ recomendado | Sí | $2.00 |
| Cohere `rerank-english-v3.0` | No | $2.00 |
| Voyage `rerank-2` | Limitado | $0.05 / 1k tokens |

Cohere Rerank v3 multilingual es el estándar de facto para queries en español. Vale el costo.

Fuentes: [openai.com/api/pricing](https://openai.com/api/pricing/), [docs.cohere.com/docs/rerank-2](https://docs.cohere.com/docs/rerank-2), [dataa.dev/2025/01/17/embedding-models-compared-openai-vs-cohere-vs-voyage-vs-open-source/](https://dataa.dev/2025/01/17/embedding-models-compared-openai-vs-cohere-vs-voyage-vs-open-source/).

---

## 4. Costo proyectado para Itera

### Embeddings — embebir el catálogo

100 lecciones × ~1 documento por lección (concat de 4 campos cortos) × ~100-200 tokens por documento = **~10-20k tokens totales**.

Embebir todo el catálogo desde cero:
- OpenAI text-embedding-3-small: 20k × $0.02/1M = **$0.0004 USD**

Despreciable. Re-embebido completo cuesta menos de un centavo.

### Embeddings — queries en producción

Asunción: 1000 cuentas B2B × 10 users activos × 2 búsquedas semanales = ~80k queries/mes.

Cada query: ~30-50 tokens (descripción del user).
- OpenAI text-embedding-3-small: 80k × 50 × $0.02/1M = **$0.08/mes**

### Reranking

80k queries × 30 candidates a rerank cada una.

Cohere Rerank pricing es $2.00/1k searches (un "search" = una query con N docs). Para 80k searches:
- 80k × $2.00/1k = **$160/mes** sin cache

**Optimización con cache** (key = hash(query + filtros + candidate set + model version)):
- Hit rate realista 40-60% (queries similares de users distintos)
- Costo efectivo: **$60-100/mes**

### Storage pgvector

100 vectores × 1536 dims × 4 bytes = 600 KB. Despreciable.

### Total estimado run rate

| Concepto | Mensual | Anual |
|---|---|---|
| Embedding queries | $0.08 | ~$1 |
| Reranking (con cache) | $60-100 | $720-1,200 |
| Embebido + re-embebido catálogo | <$0.05 | <$1 |
| Storage | $0 | $0 |
| **Total** | **~$60-100** | **~$720-1,200** |

Costo bajo comparado con valor del moat (la ruta personalizada es la diferenciación principal vs Duolingo/Platzi/Coursera).

---

## 5. Implementación — pipeline retrieval

```
user input ("quiero automatizar mi correo de ventas")
    ↓
OpenAI embed query (model='text-embedding-3-small', tipo: query)
    ↓
pgvector cosine similarity → top 30 lecciones
    ↓
Cohere Rerank multilingual (query + 30 lecture summaries) → top 10
    ↓
Filtros lógicos (excluir completadas, respetar dependencias) → top 5-7
    ↓
Curso custom de 5-7 lecciones (per regla 14 metodología: autocontenidas)
```

Cohere Rerank no diferencia entre query embedding y document embedding; toma la query original (texto crudo) + lista de documentos (texto crudo) y los re-rankea. **No se le pasan vectores.**

OpenAI embeddings sí se pueden generar como query o como document — pero `text-embedding-3-small` no requiere flag distinto (a diferencia de Cohere embed que sí pide `input_type: 'search_query' | 'search_document'`). Si en algún momento se cambia a Cohere embed, agregar ese flag al pipeline.

### Cache de rerank — diseño correcto

Key del cache debe incluir **todo lo que afecta el ranking**:
- Query text (después de normalización: lowercase + trim)
- Lista ordenada de candidate IDs (set de candidatos cambia el rerank)
- Modelo + versión de Cohere Rerank
- Filtros aplicados (sección, tier de user, etc.)

```typescript
const cacheKey = sha256([
  normalizedQuery,
  candidateIds.sort().join(','),
  'cohere-rerank-multilingual-v3.0',
  JSON.stringify(filters),
].join('|'))
```

TTL: 7 días (Cohere modelo es estable; queries antiguas siguen válidas).

### Variables de entorno

```bash
OPENAI_API_KEY=sk-xxx
OPENAI_EMBED_MODEL=text-embedding-3-small
COHERE_API_KEY=co-xxx
COHERE_RERANK_MODEL=rerank-multilingual-v3.0
```

---

## 6. Decisiones tomadas

| Decisión | Valor |
|---|---|
| Embeddings model | OpenAI `text-embedding-3-small` (ya en DB, mantener) |
| Dimensiones | 1536 |
| Distance metric | cosine (default OpenAI) |
| Index | HNSW (ya creado) |
| Reranker | Cohere `rerank-multilingual-v3.0` (a wirear) |
| Texto a embedir | title + learning_objective + concept_name + narrative_arc (ya documentado en table comment) |
| Cache rerank | Sí, key incluye query + candidate set + modelo + filtros (no solo hash de query) |
| TTL cache | 7 días |
| Re-embed trigger | Cuando `content_hash` difiere (ya enforced) |

---

## 7. Plan B explícito

Si M6 muestra recall pobre con `text-embedding-3-small`:

| Trigger | Acción |
|---|---|
| Recall@10 < 70% en queries reales | Probar `text-embedding-3-large` (schema migration: ALTER TABLE → vector(3072), re-embed catálogo, ~$0.05) |
| Calidad rerank pobre | Probar Voyage rerank o ajustar texto pasado a rerank (más metadata por documento) |
| Costo Cohere prohibitivo a escala | Bajar a top-15 candidates en rerank (en vez de top-30); cache hit rate más agresivo |
| Cliente B2B exige no usar APIs externas | Self-host BGE-M3 (multilingual open source) en infra propia |

---

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| OpenAI cambia precios o deprecia el modelo | OpenAI deprecia con notice >12 meses; tiempo de planear migration |
| Latencia rerank impacta UX | Mostrar embed-only top-10 mientras rerank corre en background; swap cuando termine |
| Cache hit rate bajo | Cohere Rerank a $160/mes sin cache es manejable a esta escala; no bloqueante |
| Lecciones nuevas no aparecen en retrieval | Re-embed automático cuando `content_hash` difiere; trigger ya existe |
| Modelo entrenado pre-2024 no entiende términos AI 2026 | Re-evaluar OpenAI text-embedding-3-* updates trimestralmente |

---

## 9. Fuentes

- [openai.com/api/pricing/](https://openai.com/api/pricing/)
- [docs.cohere.com/docs/rerank-2](https://docs.cohere.com/docs/rerank-2)
- [docs.cohere.com/docs/embeddings](https://docs.cohere.com/docs/embeddings)
- [dataa.dev/2025/01/17/embedding-models-compared](https://dataa.dev/2025/01/17/embedding-models-compared-openai-vs-cohere-vs-voyage-vs-open-source/)
- [blog.voyageai.com/2025/05/20/voyage-3-5/](https://blog.voyageai.com/2025/05/20/voyage-3-5/)
- `supabase/migrations/003_lecture_embeddings.sql` (decisión técnica vigente)
- `supabase/migrations/005_rls_policies_pre_launch.sql` (RLS de embeddings)

---

**Versión 2** — corregido tras review (text-embedding-3-small es multilingual, costing consistente, schema/pipeline alineados con migration 003, cache key correcta, search_query vs search_document aclarado).
