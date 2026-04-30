# schema del curso itera — v1

> Estado real del schema de contenido del curso post-pivote (10 secciones × 100 lecciones).
> Fuente de verdad operativa: las migrations en `supabase/migrations/`. Este doc resume estado actual + tablas pendientes.
>
> **Versión:** 1 — sync con migrations 000-003 aplicadas. Última actualización: 2026-04-22.
> **Versión anterior** (work in progress, 22 secciones × 665 lecciones) quedó superada por el pivote acordado el 2026-04-20.

---

## Estado de las tablas

| Orden | Tabla | Propósito | Estado | Migration |
|---|---|---|---|---|
| 1 | `sections` | 10 secciones del curso (id smallint 1..10, container entity) | ✅ creada + seeded | 001 + 002 |
| 2 | `lectures` | ~100 lecciones (uuid, versionable, freshness tracking) | ✅ creada, sin filas | 001 |
| 3 | `slides` | ~1,000 slides (10 por lección, JSONB content, 11+1 kinds) | ✅ creada, sin filas | 001 |
| 4 | `user_progress` | 1 fila por (user_id, lecture_id), avance granular + XP | ✅ creada, sin filas | 003 |
| 5 | `section_analytics` (view) | Resumen on-the-fly por sección | ✅ creada | 003 |
| 6 | `lecture_funnel` (view) | Funnel de abandono por lección | ✅ creada | 003 |
| 7 | `user_current_section` (view) | Sección actual de cada usuario (últ. 14d) | ✅ creada | 003 |
| 8 | `section_dropoffs` (view) | Usuarios que abandonaron sin completar | ✅ creada | 003 |
| 9 | `concepts` | ~100 conceptos nombrables (token, RAG, etc.) para spaced retrieval cross-lección | 🔵 en diseño |  |
| 10 | `lecture_embeddings` | 1 vector por lección (pgvector) para ruta personalizada | 🔵 en diseño |  |
| 11 | `slide_flags` | Reports de usuarios sobre slides (feedback loop) | 🔵 en diseño |  |

Todas las tablas viven en el mismo schema de Supabase (no hay múltiples databases). El maintenance mode actual mantiene `user_progress` vacía hasta que se publique contenido real.

---

## Tabla 1 — `sections` (✅ implementada)

### Propósito
Las 10 secciones del curso como entidades de primera clase. Container ordenado, con metadata pedagógica que informa al generador AI y permite reordenar el curso sin tocar las lecciones.

### Decisiones clave (ver migration 001 para SQL completo)

| Decisión | Por qué |
|---|---|
| `id smallint` (no uuid) | Las 10 secciones son públicas y bounded. Readability > opacidad. |
| `slug` separado de `name` | El nombre lleva acentos y puede cambiar; el slug vive en URLs y se mantiene estable. |
| `display_order` separado de `id` | Permite reordenar sin migration. |
| `pedagogy` not null | Toda sección debe tener su rol pedagógico definido al sembrarse. |
| `learning_arc`, `audience_note` nullable | Se llenan en workshop posterior, no bloquean el seed. |
| `prereq_ids smallint[]` | Una sección puede tener 0-N pre-requisitos. Vacío en MVP (lecciones autocontenidas, regla 14 metodología). |
| `status` con check constraint (`planned/drafted/in_review/published/archived`) | Ciclo de vida explícito. Hoy todas en `planned`. |

### Seed actual (migration 002)

10 filas, suma 100 lecciones esperadas:

| id | slug | name | est_lectures |
|---|---|---|---|
| 1 | introduccion | introducción | 2 |
| 2 | fundamentos | fundamentos | 12 |
| 3 | asistentes | asistentes | 10 |
| 4 | contenido | contenido | 10 |
| 5 | automatizacion | automatización | 12 |
| 6 | bases-de-datos | bases de datos | 12 |
| 7 | apis-mcps-skills | APIs, MCPs y skills | 14 |
| 8 | agentes | agentes | 10 |
| 9 | vibe-coding | vibe coding | 8 |
| 10 | implementacion | implementación | 10 |

**Nota:** la sección 7 quedó en 14 lecciones en el seed; [LESSONS_v1.md](./LESSONS_v1.md) lista 15. Pendiente reconciliar — fix de 1 línea (`update sections set est_lectures = 15 where id = 7`) o ajustar el outline. Bug menor, no bloqueante.

---

## Tabla 2 — `lectures` (✅ implementada, 0 filas)

### Propósito
Cada una de las ~100 lecciones del curso. Content entity con versioning soft (`supersedes_lecture_id`) y freshness tracking (`last_reviewed_at`) — porque AI cambia cada 6 meses y las lecciones envejecen.

### Decisiones clave

| Decisión | Por qué |
|---|---|
| `id uuid` (no smallint) | Identidad de contenido, no orden. UUID escala sin reordenar. |
| `section_id smallint references sections(id) on delete restrict` | No se puede dropear una sección con lecciones. |
| Slug único dentro de la sección, no global | Permite que dos secciones tengan una "intro" cada una. |
| Campos pedagógicos (`learning_objective`, `bloom_verb`, `cognitive_route`, `concept_name`, `narrative_arc`, `scenario_character`) nullable | Se llenan en workshop, no bloquean creación. |
| Check constraint: no se puede pasar a `status='published'` sin los pedagógicos llenos | Gate de calidad automático. |
| `bloom_verb` con check constraint (`recordar/entender/aplicar/analizar/evaluar/crear`) | Vocabulario controlado per metodología §2.3. |
| `cognitive_route` con check constraint (`conceptual/procedimental/mixta`) | Vocabulario controlado per metodología §2.3. |
| `est_slides` default 10, check 8-15 | 10 fijo en MVP; 11-12 si worked example extra; 15 techo duro per metodología §3.2. |
| `prereq_lecture_ids uuid[]` default `'{}'` | Lecciones autocontenidas (regla 14 metodología). Vacío en MVP. |
| `source` con check (`planned/ai-generated/manual/pablo/codex`) | Útil al debuggear errores sistemáticos en el generador. |
| `version` + `supersedes_lecture_id` | Versioning soft: regenerar = nueva fila apuntando a la vieja. No snapshots completos. |
| `last_reviewed_at` | Cuándo se revisó por última vez. Útil cuando cambia el stack (ej. Seedance deja de ser el rey). |

### Lo que falta poblar
Cada una de las 100 lecciones del [LESSONS_v1.md](./LESSONS_v1.md) necesita 6 campos antes de poder llegar a `published`:
- `learning_objective`
- `bloom_verb`
- `cognitive_route`
- `concept_name`
- `scenario_character`
- `narrative_arc`

Workshop sección por sección con Pablo. Estimado: 30-45 min por sección × 10 secciones.

---

## Tabla 3 — `slides` (✅ implementada, 0 filas)

### Propósito
Cada slide individual. Contenido en JSONB (shape varía por `kind`). Versioning soft + freshness igual que lectures.

### Decisiones clave

| Decisión | Por qué |
|---|---|
| `id uuid` | Mismo razonamiento que lectures. |
| `lecture_id` con `on delete cascade` | Slide no vive sin su lección. |
| `kind` con check de 12 valores | 11 vivos: `concept`, `concept-visual`, `celebration`, `mcq`, `multi-select`, `true-false`, `fill-blank`, `order-steps`, `tap-match`, `code-completion`, `build-prompt`. 1 deferido: `ai-prompt`. |
| `phase` con check 5E (`engage/explore/explain/elaborate/evaluate`) nullable | NULL para `celebration` que no mapea a 5E. |
| `content jsonb` validado por lint, no por DB | Schema varía radicalmente por kind. Validación detallada vive en `scripts/lint-lessons.py` y en el renderer (`ExperimentLesson.tsx`). |
| `is_scoreable boolean` + check de consistencia con `kind` | Evita que un `concept` sea scoreable o que un `mcq` no lo sea. |
| `xp smallint` con check (scoreable implica xp > 0) | Evita ejercicios sin recompensa. |
| `version` + `supersedes_slide_id` | Mismo versioning soft que lectures. |

### Lo que falta poblar
~1,000 slides cuando las 100 lecciones tengan metadata completa. Generación pasa por:
1. Metadata de lección (workshop manual)
2. Generador automático (skill `/generate-lecture` futura)
3. Lint (`scripts/lint-lessons.py` — 9 reglas automatizables)
4. Revisión manual (rubric subjetivo, 10 puntos del [METODOLOGIA.md](./METODOLOGIA.md) §7)
5. Import a DB

---

## Tabla 4 — `user_progress` (✅ implementada, 0 filas)

### Propósito
Una fila por (user_id, lecture_id). Registra inicio, último activo, completion, XP y attempts.

### Decisiones clave

| Decisión | Por qué |
|---|---|
| Primary key compuesta `(user_id, lecture_id)` | Un usuario tiene 1 progreso por lección. Reinicio bumpea `attempts`, no crea nueva fila. |
| `slides_completed smallint` | Granularidad para mostrar progreso intra-lección. |
| `is_completed boolean` redundante con `completed_at` | Indexable, evita comparar timestamps en queries comunes. Check constraint mantiene consistencia. |
| `xp_earned smallint` por lección | Permite recalcular XP total con `sum()`, no se duplica. |
| `attempts integer` | Para debug de UX (¿esta lección se reinicia mucho?). |
| 4 índices: user, lecture, last_active, (is_completed, completed_at) | Cubre las queries esperadas: progreso de un user, popularidad de una lección, who's active, completion stats. |

### Las 4 views derivadas

Se calculan on-the-fly desde `user_progress`. Cuando haya data, devuelven números reales sin cambio de schema:

- **`section_analytics`** — usuarios totales/30d/7d, completados, mediana de tiempo por lección, XP total awarded.
- **`lecture_funnel`** — para cada lección: empezaron, completaron, droppearon, completion rate %.
- **`user_current_section`** — sección "actual" de cada usuario (últimos 14d), basada en la lección más recientemente tocada.
- **`section_dropoffs`** — usuarios que empezaron una sección, no completaron y no volvieron en 14+ días.

Consumers esperados: Education (admin-facing dashboard), Gamification (user-facing progreso personal).

---

## Tablas pendientes (en diseño, sin implementación)

### `concepts` — 🔵
**Propósito:** capturar las ideas nombrables del curso (~100 conceptos: token, ventana de contexto, RAG, embeddings, etc.) como entidades de primera clase para que el spaced retrieval cross-lección sea operacional, no aspiracional.

**Hoy denormalizado:** `lectures.concept_name text`. Funciona en MVP. Cuando se diseñe la tabla, normalizar.

**Cuándo:** después de que las primeras 20-30 lecciones estén `published` y se vea el patrón real de qué conceptos se introducen y dónde se prueban.

### `lecture_embeddings` — 🔵
**Propósito:** 1 vector por lección con pgvector. Habilita la ruta personalizada (input del usuario → top-N lecciones por similitud → Cohere rerank → curso custom).

**Stack candidato:** ver R6 (research pendiente). Comparativo OpenAI text-embedding-3 / Voyage / Cohere multilingual.

**Cuándo:** bloqueador de Education T2.4 (ruta personalizada). Subido a prioridad alta en la matriz de coordinación.

### `slide_flags` — 🔵
**Propósito:** botón de bandera por slide para que usuarios reporten errores, ambigüedad o desactualización. Feedback loop directo a content corrections.

**Cuándo:** lo dueña Education T1.1. No bloquea a nadie, arranca cuando Education esté libre.

---

## Pipeline de generación de contenido (recordatorio)

```
metadata de lección (workshop manual con Pablo)
       ↓
generador automático (skill /generate-lecture, futura)
       ↓
slides JSON (1 archivo por lección)
       ↓
lint (scripts/lint-lessons.py — 9 reglas automatizables del METODOLOGIA.md)
       ↓
revisión manual (rubric subjetivo, 10 puntos)
       ↓
import a DB (insert lectures + slides con status='in_review' → 'published')
```

Versioning soft: regenerar una lección = nueva fila con `supersedes_lecture_id` apuntando a la vieja. No snapshots completos.

---

## Cosas que NO incluye el schema (y por qué)

- **`total_est_minutes` cacheado en sections** — derivable de lectures via sum(), no se cachea.
- **`theme_color`, `icon`** en sections — UI concerns, derivar de `slug` o vivir en código.
- **Stats agregadas duplicadas** (XP total por sección, etc.) — calculadas on-the-fly desde `user_progress` via views.
- **Tags / keywords** en lectures — no necesarios todavía. Si hacen falta para retrieval, se agregan.
- **`personalization_weight`** en sections — la decisión de personalización vive en `lecture_embeddings` + rerank, no hardcoded.
- **Tabla `concepts` en MVP** — denormalizado en `lectures.concept_name` por ahora. Se promueve cuando haya patrón real.

---

## Decisiones diferidas (necesitan workshop con Pablo cuando lleguen)

1. **Diseño detallado de `concepts`** — schema, FK desde `lectures`, manejo de aliases (RAG = retrieval-augmented generation).
2. **Diseño detallado de `lecture_embeddings`** — depende de R6 (modelo de embeddings + dimensiones).
3. **Diseño detallado de `slide_flags`** — schema, severidad, lifecycle de un flag (open/triaged/fixed).
4. **Tabla de eventos para event tracking** — depende de R15 (analytics stack). Si va PostHog self-hosted, posible que viva fuera de Supabase.
5. **Reconciliar `est_lectures` de sección 7** — seed dice 14, [LESSONS_v1.md](./LESSONS_v1.md) dice 15.

---

## Mapa de archivos del schema

```
supabase/migrations/000_nuke_legacy.sql            → drop de 8 tablas legacy
supabase/migrations/001_init_content_schema.sql    → sections + lectures + slides
supabase/migrations/002_seed_sections.sql          → seed de las 10 secciones
supabase/migrations/003_user_progress_and_analytics.sql → user_progress + 4 views
docs/LESSONS_v1.md                                 → outline firmado de 100 lecciones
docs/METODOLOGIA.md                                → contrato pedagógico (gobierna content de slides)
docs/CONTEXT.md                                    → producto, arquitectura, roadmap
scripts/lint-lessons.py                            → lint automático de reglas pedagógicas
components/experiment/ExperimentLesson.tsx         → renderer de slides (define shape JSONB)
```

---

**Versión 1 — sync con realidad post-pivote.** Actualizar este doc cuando se aplique cualquier migration nueva o cuando se diseñe `concepts`, `lecture_embeddings` o `slide_flags`.
