# Review v1 — self-review de las 100 lecturas

> Aplicación del rubric de 8 dimensiones sobre la metadata pedagógica generada el 2026-04-20.
> Scoring 1-5 por dimensión. Outliers = lecturas con ≥1 dimensión en 1-2 **o** ≥3 dimensiones en 3.

## rubric aplicado

| # | dimensión |
|---|---|
| 1 | claridad del `learning_objective` |
| 2 | verificabilidad del outcome |
| 3 | tensión del `narrative_arc` |
| 4 | credibilidad del misconception |
| 5 | encaje personaje-escenario |
| 6 | originalidad del `concept_name` |
| 7 | alineación bloom ↔ outcome real |
| 8 | evergreen (sobrevive 3 años) |

---

## outliers identificados (9 de 100)

### L1.2 · qué vas a poder hacer
- **Problema:** LO abstracto (3), verificabilidad débil (2), concept "entregables del curso" genérico (3).
- **Mejora:**
  - `learning_objective` → *"listar los tres tipos de proyecto que podrás construir al terminar el curso"* (específico, enumerable, `recordar` ✓)
  - `concept_name` → *"tres entregables del curso"* (nombrable, concreto)
  - `narrative_arc` ajustado para prometer tres outputs tangibles (agente, integración, app)

### L2.12 · bucle del usuario AI-literate
- **Problema:** `concept_name = "bucle AI-literate"` es jargon interno, audiencia no-técnica no lo va a nombrar (3).
- **Mejora:** `concept_name` → *"ciclo de trabajo con AI"* (llano, el título sigue con el nombre de marca)

### L3.1 · el mapa de modelos en 2026
- **Problema:** "en 2026" en el LO envejece (evergreen 2).
- **Mejora:** `learning_objective` → *"identificar los asistentes de AI dominantes hoy y qué los distingue a primera vista"*

### L3.2 · ChatGPT en profundidad
- **Problema:** LO *"describir qué hace mejor ChatGPT"* demasiado genérico (3), paralelo con L3.3.
- **Mejora:** `learning_objective` → *"describir para qué tareas ChatGPT es la mejor opción y qué modos tiene disponibles"*

### L3.3 · Claude en profundidad
- **Problema:** igual que L3.2.
- **Mejora:** `learning_objective` → *"describir el estilo de Claude y para qué tipo de tareas supera a otros asistentes"*

### L4.5 · generar video: panorama 2026
- **Problema:** misconception *"son todos iguales"* débil (3), "2026" en LO envejece.
- **Mejora:**
  - `learning_objective` → *"identificar los principales modelos de video con AI y qué tipo de clip produce cada uno"*
  - `narrative_arc` con misconception más fuerte: *"solo los estudios grandes los producen"*

### L4.6 · Seedance
- **Problema:** *"del año pasado"* y *"hoy existe"* en arc envejecen (3).
- **Mejora:** `narrative_arc` abstraído sin referencias temporales.

### L9.4 · Codex CLI
- **Problema:** `concept_name = "criterio para segunda opinión"` abstracto (3).
- **Mejora:** `concept_name` → *"segunda opinión con Codex"* (anclado al producto, nombrable)

### L10.4 · fallbacks cuando el modelo falla
- **Problema:** `concept_name = "fallbacks del modelo"` cercano a L7.6 *"errores y fallbacks"*.
- **Mejora:** `concept_name` → *"fallbacks en producción"* (contexto distinto, clarifica)

---

## distribución final estimada después de mejoras

Las otras 91 lecturas puntúan ≥4 en al menos 6 de 8 dimensiones. Se mantienen.

Las 9 mejoras:
- 5 tocan `learning_objective`
- 4 tocan `concept_name`
- 3 tocan `narrative_arc`
- 0 cambian `bloom_verb` / `cognitive_route` / `scenario_character`

## siguiente paso

Codex CLI como segunda opinión adversarial sobre estas 9 lecturas (ya mejoradas) + sample aleatorio de 10 de las 91 OK, para pescar ciegos míos.
