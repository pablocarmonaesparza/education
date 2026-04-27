---
name: itera-memory-save
description: |
  Guarda aprendizajes, decisiones, copy, experimentos y gotchas de la conversación actual como archivos markdown en docs/memory/ del repo.
  La memoria es común entre conversaciones porque vive en el filesystem (versionada en git), así que lo que guardes aquí estará disponible al invocar /itera-memory-load en otra sesión.
  Úsalo cuando: (a) el usuario pida "guarda esto en memoria", "recuerda esto", "save memory", "memory save"; (b) al cerrar una sesión con trabajo significativo (decisiones de producto, cambios de estrategia, lecciones aprendidas, nuevas convenciones); (c) cuando se tome una decisión sobre copy, pricing, metodología pedagógica, schema, o roadmap.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
---

# itera-memory-save

Guarda memoria cross-sesión para el proyecto Itera como archivos markdown en `docs/memory/`. La memoria se comparte con cualquier otra conversación que invoque `/itera-memory-load`.

## Backing store

- Directorio: `docs/memory/` (relativo a la raíz del repo).
- Índice: `docs/memory/INDEX.md` (una línea por memoria, agrupado por tipo).
- Un archivo markdown por memoria: `<tipo>_<slug>.md` (ej. `decision_pivote_videos_a_ejercicios.md`).
- Todo versionado en git — commitear como parte del trabajo habitual.

## Qué guardar (sí)

- **Decisiones de producto**: pivotes, cambios de pricing, cambios de scope, hipótesis validadas/invalidadas.
- **Aprendizajes metodológicos**: reglas pedagógicas nuevas, patrones de lección que funcionaron/fallaron, feedback real de estudiantes LATAM.
- **Copy y tono**: frases que sí conectan, frases que Pablo rechazó explícitamente, micro-reglas de estilo que no están en `docs/CONTEXT.md`.
- **Contexto de negocio no obvio**: stakeholders, deadlines externos, constraints legales/fiscales, integraciones con herramientas externas (n8n, Supabase, etc.).
- **Experimentos vivos**: qué A/B está corriendo en `app/experimentLanding/`, qué métricas se miran, conclusión preliminar.
- **Gotchas crónicos**: cosas que volverán a morder si no se recuerdan (ej. "RLS de `slides` requiere service role para generator").

## Qué NO guardar

- Código, paths, estructura de carpetas → está en el repo, se deriva leyendo.
- Lo que ya está en `AGENTS.md`, `docs/CONTEXT.md`, `docs/METODOLOGIA.md`, `docs/LESSONS_v1.md`, `docs/SCHEMA_v1.md` → se leen directamente. Si una decisión cambia uno de estos docs, edítalo directamente ahí — no dupliques en memoria.
- Historial de git → `git log` es la fuente.
- Estado ephemeral ("lo que estoy haciendo ahora") → eso es plan/todo, no memoria.
- Secretos: claves de API, tokens, contraseñas. Nunca.

## Cómo guardar

1. **Revisa la conversación** y extrae 1–5 memorias concretas. Cada memoria es un bloque autónomo — un lector cold debe poder entenderla sin ver el hilo.

2. **Antes de escribir, busca duplicados**. Lee `docs/memory/INDEX.md` y haz `Grep` por palabras clave del título candidato en `docs/memory/`. Si existe una memoria parecida: actualízala con `Edit` (mantén el nombre de archivo, actualiza la fecha y añade un bloque `### Actualización YYYY-MM-DD` al final) en vez de duplicar.

3. **Elige tipo, dept y slug**:
   - Tipos válidos: `decision`, `aprendizaje`, `copy`, `negocio`, `experimento`, `gotcha`, `metodologia`.
   - Departamentos válidos para `dept`: `ceo`, `cfo`, `cmo`, `cgo`, `cpo`, `cto`, `orq`, `shared`. Es lista — puede ser multi-dept (ej. `[cpo, cgo]` para gamification, `[cpo, cto]` para mailing). Si no está claro a qué dept pertenece, usa `[shared]`.
   - Slug: minúsculas, palabras clave separadas por `_`, sin acentos (ej. `pivote_videos_a_ejercicios`).
   - Nombre de archivo: `docs/memory/<tipo>_<slug>.md`.

4. **Escribe el archivo** con esta estructura exacta:

   ```markdown
   ---
   type: <tipo>
   title: <título corto en minúsculas>
   date: <YYYY-MM-DD — hoy, absoluto, no relativo>
   tags: [<tag1>, <tag2>]
   dept: [<dept1>, <dept2>]
   ---

   <Hecho, decisión o regla concreta en 1–3 frases.>

   **Por qué:** <razón original: constraint, experimento, feedback literal de Pablo, incidente. Sin esto la memoria es inútil para edge cases.>

   **Cuándo aplicar:** <señales futuras que indican que esta memoria es relevante: "al tocar landing", "antes de cambiar pricing", "al generar lecciones nuevas", etc.>
   ```

5. **Actualiza `docs/memory/INDEX.md`** con `Edit`: añade una línea en la sección correcta de "## por tipo" Y otra línea por cada dept en la sección "## por departamento". Formato en "por tipo":
   ```
   - [título](<tipo>_<slug>.md) — YYYY-MM-DD — `[dept1, dept2]` — hook de una línea
   ```
   Formato en "por departamento" (una entrada por dept del archivo):
   ```
   - [título](<tipo>_<slug>.md) — <tipo> — YYYY-MM-DD *(comparte con depX)* (si multi-dept)
   ```
   Mantén orden cronológico descendente dentro de cada sección (lo nuevo arriba).

6. **Corre el linter** para validar el frontmatter:
   ```bash
   bash scripts/lint-memory.sh
   ```
   Debe salir `OK — frontmatter válido en todos los archivos`. Si falla, corregir antes de avisar al usuario.

7. **Confirma al usuario** qué guardaste. Formato:

   ```
   Guardado en docs/memory/:
   - [decision] título 1 → decision_slug1.md
   - [gotcha] título 2 → gotcha_slug2.md

   Total: N memorias. INDEX.md actualizado.
   ```

## Reglas de contenido

- **Captura el *por qué* literal** cuando es una corrección del usuario ("no, eso no funcionó porque…"). El por qué textual de Pablo pesa más que tu interpretación.
- **Fechas siempre absolutas**. Si el usuario dijo "la semana pasada", convierte a fecha concreta antes de escribir.
- **Títulos en minúsculas** (estilo del proyecto, coherente con `AGENTS.md`).
- **Moneda en USD siempre** si aparece dinero.
- **Una memoria por archivo**. No mezclar temas.
- **Multi-departamento.** Si una decisión cruza más de un C-suite (ej. mailing = `[cpo, cto]`, gamification = `[cpo, cgo]`), usa lista en `dept`. No dupliques el archivo por dept — un solo archivo lo cubre.

## Ritual de cierre por C-suite

Esta skill ES el ritual de cierre. Si vienes de una conversación-departamento (CEO, CFO, CMO, CGO, CPO, CTO, ORQ) y vas a cerrar sesión con una decisión nueva, invocarme antes de salir asegura que la decisión persiste y otros agentes la pueden leer. Ver `docs/memory/metodologia_ritual_cierre_csuite.md` para el ritual completo y `docs/memory/metodologia_protocolo_claude_codex.md` para el protocolo entre agentes.

## Cuándo no guardar nada

Si revisaste la conversación y no hay nada realmente no-obvio (todo ya está en docs, todo es código derivable, todo es estado ephemeral): díselo al usuario en una línea y no crees archivos. Memoria llena de fluff es peor que memoria vacía.

## Git

No commitees automáticamente. Cuando termines, avisa: *"Listo. Revisa `docs/memory/` y commitea cuando quieras."* Pablo decide cuándo entra a git.
