---
name: itera-memory-load
description: |
  Carga la memoria compartida de Itera desde docs/memory/ del repo, para tener contexto persistente entre sesiones (decisiones de producto, reglas pedagógicas, copy, experimentos vivos, gotchas).
  Úsalo cuando: (a) el usuario pida "carga memoria", "recuerda lo que sabes", "memory load", "itera memory"; (b) al empezar cualquier sesión sobre producto, copy, pricing, estrategia, lecciones o metodología de Itera; (c) antes de tomar decisiones que dependan de contexto previo no presente en los docs canónicos.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
---

# itera-memory-load

Recupera la memoria cross-sesión del proyecto Itera desde `docs/memory/` y la aplica al contexto actual.

## Backing store

- Índice: `docs/memory/INDEX.md` con vista dual — "## por tipo" (decisiones, gotchas, etc.) y "## por departamento" (ceo, cfo, cmo, cgo, cpo, cto, orq, shared).
- Memorias individuales: `docs/memory/<tipo>_<slug>.md` con frontmatter (`type`, `title`, `date`, `tags`, `dept`) + body.
- Linter (opcional): `bash scripts/lint-memory.sh` valida estructura y reporta departamentos silenciosos.

## Cómo cargar

1. **Lee primero el índice**: `docs/memory/INDEX.md`. Te da el mapa completo de lo que hay, agrupado por tipo (decisiones, aprendizajes, copy, negocio, experimentos, metodología, gotchas).

2. **Lee los archivos de memoria en paralelo**:
   - Si el usuario no especificó tema: lee todos los archivos listados en INDEX.md (normalmente pocos — si pasan de ~20, lee los 10 más recientes y los que hagan match con el contexto actual).
   - Si el usuario mencionó un tema específico (pricing, methodology, landing, etc.): filtra por tipo y/o haz `Grep` en `docs/memory/` por keywords del tema, luego lee solo los que hagan match.
   - **Si la sesión es de un C-suite específico** (CFO, CMO, CGO, CPO, CTO, ORQ): usa la sección "## por departamento" del INDEX para filtrar. Lee primero las memorias con tu `dept` en el frontmatter, después las marcadas `[shared]`. Las de otros C-suite se leen solo si el usuario las pide explícitamente o si el tema lo requiere.

3. **Cruza con docs canónicos cuando sean relevantes al tema actual**:
   - `AGENTS.md`, `docs/CONTEXT.md`, `docs/METODOLOGIA.md`, `docs/LESSONS_v1.md`, `docs/SCHEMA_v1.md`.
   - Si una memoria contradice un doc canónico → gana el doc. Los docs se actualizan conscientemente en git; la memoria puede estar stale. Marca mentalmente esa memoria para limpieza en la próxima `/itera-memory-save`.

4. **Presenta un resumen corto** al usuario, agrupado por tipo. Nunca vuelques el contenido completo — resume por título. El contenido lo usas internamente para decidir cómo ayudar en los turnos siguientes.

## Output al usuario

Formato:

```
Memoria Itera cargada (N entradas, última actualización: YYYY-MM-DD):

Decisiones:
- título 1
- título 2

Aprendizajes:
- título 3

Experimentos vivos:
- título 4

Gotchas:
- título 5

(…)
```

Omite secciones que estén vacías. Si `docs/memory/INDEX.md` no existe o no tiene entradas, di una línea: *"Memoria Itera vacía — usaré solo los docs canónicos."* Y continúa.

## Verificar antes de recomendar

Una memoria que nombra un archivo, función, flag, o decisión específica es una afirmación de cuando se escribió — puede haber cambiado. Antes de recomendarle algo a Pablo basado en una memoria:

- Si la memoria nombra un path: verifica que el archivo exista.
- Si la memoria nombra una función, flag, o variable: `Grep` para confirmar.
- Si la memoria habla de un experimento: revisa `app/experimentLanding/` y `git log` reciente.

Si algo cambió, usa lo que ves ahora, no lo que dice la memoria. Avisa al usuario en una línea: *"La memoria decía X pero ahora el repo muestra Y — voy con Y."*

## Cuándo recargar durante la sesión

- Si el usuario pivota a un tema nuevo y no lo cargaste en la primera pasada, haz un segundo read dirigido al tema.
- Si la sesión dura mucho y tomamos decisiones nuevas, sugiere correr `/itera-memory-save` antes de cerrar — eso es el ritual de cierre por C-suite (ver `docs/memory/metodologia_ritual_cierre_csuite.md`).

## Validación opcional

Si quieres confirmar que la memoria está sana antes de operar:

```bash
bash scripts/lint-memory.sh
```

El linter valida frontmatter (tipo, dept, date) y reporta departamentos silenciosos (>7 días sin update). No bloquea — solo informa. Útil al inicio de sesión del orquestador para detectar huecos.
