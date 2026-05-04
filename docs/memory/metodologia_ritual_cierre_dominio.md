---
type: metodologia
title: ritual de cierre por dominio — escribir antes de cerrar sesión
date: 2026-05-04
tags: [orquestacion, dominio, ritual, memoria, handoff]
dept: [orquestador]
---

## qué es esto

cada conversación-dominio (automatizacion, datos, desarrollo, educacion, finanzas, fundraising, imagenes, legal, marketing, orquestador, producto, redes-sociales, soporte, ventas) ejecuta un **ritual de cierre** antes de terminar sesión: escribe sus decisiones nuevas en `docs/memory/` con frontmatter correcto.

sin ritual de cierre, las decisiones quedan en la cabeza de pablo y mueren con la conversación. con ritual de cierre, codex y el orquestador pueden leerlas y operar sin pedirle a pablo que recuerde.

ver `metodologia_estructura_dominios.md` para el catálogo completo de los 14 dominios y el mapping desde el modelo C-suite anterior.

## cuándo se aplica

al **cierre de sesión** de cualquier conversación-dominio donde se haya tomado:

- una decisión que cambia el rumbo (producto, copy, pricing, schema, infra).
- un experimento vivo que va a correr (con criterio de éxito).
- un aprendizaje no obvio (gotcha, anti-pattern, descubrimiento).
- una respuesta canónica a una pregunta recurrente.

**si no hubo decisión nueva, no se escribe.** el ritual no es bureaucracy — es persistencia de cambios.

## el ritual (3 pasos)

### 1. preguntarte: "¿qué decidí en esta sesión?"

si la respuesta es *"nada nuevo, solo ejecutamos código existente"* → no se escribe, sales.

si hay algo: continuá.

### 2. crear o actualizar archivo en `docs/memory/`

- naming: `<tipo>_<slug>.md` (ej. `decision_pricing_tier_2.md`, `gotcha_supabase_realtime_quota.md`).
- si la decisión actualiza una memoria existente, **edita la existente**, no crees duplicada.
- frontmatter obligatorio:

```yaml
---
type: decision | aprendizaje | copy | negocio | experimento | metodologia | gotcha
title: <una línea minúsculas>
date: YYYY-MM-DD
tags: [palabra1, palabra2, ...]
dept: [una o más de: automatizacion, datos, desarrollo, educacion, finanzas, fundraising, imagenes, legal, marketing, orquestador, producto, redes-sociales, soporte, ventas]
---
```

`dept` es lista — un doc puede ser cross-dominio (ej. mailing es `[producto, desarrollo]`, gamification es `[producto, educacion]`, telegram es `[automatizacion, desarrollo]`).

### 3. correr el linter

```bash
bash scripts/lint-memory.sh
```

debe salir limpio (`exit 0`). si falla, corregir antes de cerrar.

## qué actualiza INDEX.md

el INDEX se actualiza **a mano** por ahora. al final del ritual, agregar una línea en la sección correspondiente (por tipo) y el linter te recuerda si dejaste un dominio silencioso.

futuro (fase 2): script que genera INDEX desde frontmatter automáticamente. por ahora a mano para mantener descripciones humanas.

## qué NO va en `docs/memory/`

- código (vive en su carpeta normal).
- documentación canónica de producto (eso vive en `docs/CONTEXT.md`, `METODOLOGIA.md`, `LESSONS_v1.md`, `SCHEMA_v1.md`).
- secretos, tokens, credenciales (nunca, ni en frontmatter).
- discusiones sin decisión cerrada (eso vive en handoffs `docs/handoff/`).

## consecuencia para los agentes

- **claude/codex al iniciar sesión:** leen `docs/memory/INDEX.md` + filtran por `dept` relevante a la conversación actual.
- **pablo:** nunca le pregunta a una conversación qué decidió otra. lee de `docs/memory/`.
- **el orquestador (claude):** sintetiza estado cross-dominio leyendo todos los `dept`.

## cuándo reabrir este ritual

- si la disciplina cae (linter detecta dominios silenciosos 7+ días seguidos sin razón).
- si el formato YAML se vuelve barrera de entrada y los dominios empiezan a evitar escribir.
- si emerge una herramienta que automatiza esto (linter generativo, hook git, etc.) — entonces este ritual se delega.
