# Schema del curso Itera — v1 (work in progress)

> Este documento captura el diseño de la base de datos del contenido del curso.
> Se construye **una tabla a la vez**, con checkpoint humano antes de cada avance.
> Nada se ejecuta en Supabase hasta que la tabla correspondiente esté firmada.

---

## Tablas planeadas (vista aérea)

| Orden | Tabla | Propósito | Estado |
|---|---|---|---|
| 1 | `sections` | 22 secciones del curso. Metadata de alto nivel y orden pedagógico | 🔵 en diseño |
| 2 | `concepts` | ~100 conceptos nombrables (token, ventana de contexto, RAG, etc.) | ⏳ siguiente |
| 3 | `lectures` | ~665 lecciones. Learning objective, Bloom verb, ruta cognitiva, narrative arc | ⏳ después |
| 4 | `slides` | ~6,650 slides (10 por lección). JSONB con el contenido de cada ejercicio o concepto | ⏳ después |
| 5 | `lecture_embeddings` | 1 vector por lección (pgvector) para retrieval de ruta personalizada | ⏳ después |
| 6 | `slide_flags` | Reports de usuarios sobre slides específicas (feedback loop) | ⏳ después |
| 7 | `user_progress` | Avance del usuario: lecciones completadas, XP, racha, etc. | ⏳ después |

Todas viven en el mismo schema de Supabase (no hay múltiples databases).

---

## Tabla 1 — `sections`

### Propósito
Guarda las 22 secciones del curso como entidades de primera clase. Hoy, `section_id` vive como `smallint` suelto dentro de `lectures` con su `section_name` denormalizado. Al promover secciones a tabla propia:

- El nombre de cada sección vive en un solo lugar (fin de los denormalizados desincronizados).
- Cada sección carga metadata que informa al generador AI (arco de aprendizaje, persona objetivo, orden pedagógico).
- Se puede reordenar el curso sin tocar las lecciones (se mueve `display_order`).
- Se puede archivar o cerrar una sección sin dropear sus lecciones (via `status`).

### Propuesta de columnas

```sql
create table sections (
  -- identidad
  id              smallint primary key,
                  -- 1..22, corresponde al orden del OUTLINE_2026.md.
                  -- Smallint por legibilidad y compatibilidad con el section_id
                  -- que ya existe en lectures.
  slug            text unique not null,
                  -- url-safe, para rutas futuras tipo /curso/fundamentals.
                  -- Ej: "introduccion", "fundamentals", "ai-modelos", "content-generation".
  name            text not null,
                  -- nombre visible, en minúsculas per Typography rule.
                  -- Ej: "fundamentals".

  -- orden
  display_order   smallint not null unique,
                  -- posición actual en el curso (1-22). Se puede cambiar sin
                  -- tocar id. Permite reordenar sin migration.

  -- pedagogía
  pedagogy        text,
                  -- 1-2 líneas describiendo el rol pedagógico de la sección.
                  -- Tomado del OUTLINE_2026.md columna "Pedagogía".
                  -- Ej: "Bases universales: qué es AI, cómo funciona un LLM,
                  -- tokens, contexto, prompting básico".
  learning_arc    text,
                  -- 2-4 líneas describiendo el arco en conjunto: de qué parte
                  -- el alumno, dónde termina, qué capability desbloquea.
                  -- Informa al generador de lecciones.
  audience_note   text,
                  -- override opcional si la sección desvía del default de
                  -- audiencia (non-technical LATAM). Ej: "asume que el alumno
                  -- ya domina prompting básico y sabe abrir una terminal".
                  -- NULL = usa el default global de la metodología.

  -- relaciones
  prereq_ids      smallint[] default '{}',
                  -- array de section.id que deben completarse antes.
                  -- Ej: para "APIs, MCPs & Skills" → [2] (Fundamentals).
                  -- Vacío = sin pre-requisito (ej: Introducción).

  -- operación
  est_lectures    smallint,
                  -- estimado de lecciones planeadas (6, 10, 15…).
                  -- Informa el generador y sirve para trackear progreso.
  status          text not null default 'planned'
                  check (status in ('planned', 'in_progress', 'published', 'archived')),
                  -- planned      → aún no se genera contenido
                  -- in_progress  → lecciones parcialmente escritas
                  -- published    → sección disponible a usuarios
                  -- archived     → fuera del curso activo (histórico)

  -- timestamps
  published_at    timestamptz,
                  -- NULL hasta que status pase a 'published'.
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- índice para filtrar por status rápidamente
create index sections_status_idx on sections(status);

-- trigger para mantener updated_at sincronizado
create or replace function sections_set_updated_at()
  returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger sections_updated_at
  before update on sections
  for each row execute function sections_set_updated_at();
```

### Justificación de cada decisión

| Decisión | Por qué |
|---|---|
| `id smallint` (no uuid) | Los ids son públicos en el outline (1-22). Readability > opacidad. Lectures ya usa smallint para section_id; compatible. |
| `slug` separado de `name` | El nombre puede llevar espacios, acentos, capitalización; el slug vive en URLs y se mantiene estable aunque el display cambie. |
| `display_order` separado de `id` | Permite reordenar sin migration. Si mañana movemos "Seguridad" de posición 6 a 3, solo actualizamos `display_order`. |
| `pedagogy`, `learning_arc`, `audience_note` como tres campos distintos | Separa **qué enseña** (pedagogy), **cómo arma su arco** (learning_arc) y **a quién** (audience_note). Cada uno tiene un uso diferente al generar. |
| `prereq_ids` como array | Una sección puede tener 0-N pre-requisitos. Más simple que tabla de join y usable directo en queries. |
| `status` con check constraint | Evita strings inválidos. Las 4 transiciones cubren el ciclo de vida esperado. |
| `published_at` nullable | Solo existe cuando `status='published'`. Facilita queries de "qué está disponible hoy". |
| Trigger para `updated_at` | Auto-mantenido, no depende de que la app recuerde. |

### Lo que NO incluye esta tabla (y por qué)

- **`total_est_minutes`** — vive en lectures agregado, no como cache aquí.
- **`theme_color`, `icon`, etc.** — UI concerns, no contenido. Si acaso, derivar de `slug`.
- **Stats de progreso agregado** — calculado al vuelo desde `user_progress`, no duplicado aquí.
- **Tags o keywords** — no los necesitamos todavía. Si hacen falta para retrieval, se agregan después.

### Preguntas abiertas para ti

1. **¿`id` smallint con rango 1-22 fijo, o algo más flexible?** Si planeas que un día haya >32k secciones, usar `int`. Hoy 22 cabe de sobra en smallint.

2. **`audience_note` — ¿útil o overkill?** Mi voto: útil, porque secciones tardías (Orchestrators, Agentes) necesitan asumir fluency que las primeras no. Si prefieres ser estricto (audiencia siempre la misma), lo quitamos.

3. **¿Falta alguna columna pensando ya en ruta personalizada?** Por ejemplo: `personalization_weight` (qué tan probable es que esta sección entre a un curso personalizado dado el input del usuario). Mi voto: no la metamos todavía — la decisión de personalización vive mejor en `lecture_embeddings` + rerank, no hardcoded en la sección.

4. **¿Queremos `source` para trackear de dónde viene el contenido** (AI-generated, Pablo, Codex)? Mi voto: no en `sections`. Sí útil en `lectures` y `slides` donde sí hay generación automatizada.

5. **Seeding inicial** — propongo que la migration que cree esta tabla la llene con las 22 filas del OUTLINE_2026.md (id, slug, name, display_order, pedagogy). Los campos `learning_arc`, `audience_note`, `prereq_ids`, `est_lectures` los llenamos contigo en un pase posterior (sección por sección, un workshop de 30-45 min). ¿Te parece?

---

## Siguientes tablas (pendientes)

Diseño cuando firmemos `sections`:
2. `concepts`
3. `lectures`
4. `slides`
5. `lecture_embeddings`
6. `slide_flags`
7. `user_progress`
