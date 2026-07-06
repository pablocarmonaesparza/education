# Motor educativo — runbook de generación (v1 operable)

Cómo generar un **módulo de TEMA nuevo** (una herramienta o update del mercado de IA)
de punta a punta. Este es el motor que Pablo pidió (2026-07-03): módulos tipo
"aprende Fable 5" / "aprende conectores", no práctica remedial por gap.

**Estado:** pipeline E1/E2/E3 del `EDUCATIVE_ENGINE_SPEC` §4, operable HOY.
Interim pablo-007 (sin API keys): E1/E2 corren como workflow con agentes de Claude
Code como el LLM. Cuando la key de Anthropic viva, los mismos prompts se mueven a un
`.mjs` con `lib/llm/client` (2 llamadas, ~1 min) — el resto del pipeline no cambia.

## Los 3 pasos

**1. Escribe el brief** (~8 campos, 10 minutos de trabajo editorial):

```
docs/simulador/educative/briefs/brief_<tema>_n1.yaml
```

Campos: `tool_name`, `tool_version`, `what_changed` (qué salió/cambió),
`why_matters` (el ángulo de criterio), `level` (N1/N2/N3), `selected_blocks`,
`business_context`, `audience_scope: broadcast`. Ejemplos:
`brief_claude5_fable_n1.yaml` (Fable 5), `example_brief_connectors_n1.yaml`.

> Regla de contenido: el módulo enseña el CRITERIO de uso (qué delegas, qué datos
> das, qué revisas) más que specs volátiles — el criterio no caduca con el próximo
> lanzamiento. Precisión factual: lo que se afirme de la herramienta debe ser
> público y estable.

**2. Corre el motor** (E1 explicar → E2 ejercitar; genera explicación de ~150
palabras + ejercicios con feedback):

En Claude Code: `Workflow({ scriptPath: ".claude/workflows/educative-module.js",
args: { brief: <contenido del brief> } })`. Guarda el JSON de salida.

**3. Empaca y siembra** (E3, sin IA):

```bash
node scripts/simulador/educative/pack-module.mjs --module <salida.json> --id module_<tema>_n1
npm run simulador:seed-practice-beats -- --apply   # valida (gate R-10) y siembra
```

El módulo queda en `simulador.practice_beats` y es jugable en `/practica/<id>`
(producto) y `/aprender-demo` (demo público, cambiando `FEATURED_BEAT`).

## Reglas duras del contenido (las que Pablo ya corrigió a golpes)

1. **Cero muro de texto.** E1 está capado a ~150 palabras (el spec decía 300;
   Pablo lo recortó al ver el resultado). El aprendizaje vive en ejercicio+feedback.
2. **Anti-spoiler formativo:** lo visible antes de responder nunca revela la
   respuesta; el porqué va en `feedback`, después de responder.
3. **Módulo de tema ≠ beat remedial:** `module_kind: topic`, `triggered_by_gap: []`,
   `career_key: general`, `contributes_to_resim_score: false`. Los remediales
   siguen siendo suyos (disparados por gaps del judge).
4. **5-7 pantallas** (portada → contexto corto → 2-4 ejercicios → cierre).
5. Copy: español neutro LATAM, sin em dash, la única sigla es IA.

## Bloques soportados por el player formativo hoy

`categorize_rows` (feedback por filas) y `ai_output_review` (feedback por
segmentos). Ampliar el player (`/aprender-demo` + `/practica`) a más bloques con
feedback es la siguiente mejora del motor — el catálogo completo apto está en el
spec §9 (15 de 17 bloques).

## Cadencia

El latido del motor es semanal: 1 brief por semana (el update de IA más relevante
para equipos no técnicos) → 1 módulo broadcast para todas las empresas. El costo
editorial real es el brief (~10 min); la generación es el pipeline.
