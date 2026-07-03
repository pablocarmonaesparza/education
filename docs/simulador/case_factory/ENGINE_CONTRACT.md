# ENGINE_CONTRACT — contrato del motor de casos (generación → evaluación → reporte)

Fuente única de verdad de cómo un caso pasa de generarse a evaluarse a reportarse.
Si dos lugares del código se contradicen, **este documento manda** y el código se
alinea. Creado para cerrar el fix de *integridad de evaluación* (5 → 6 dimensiones).

Estado: **target en migración** (F0–F4 del plan). Las secciones marcadas
`[pendiente Fx]` aún no son verdad en el código; el resto ya lo es o se está
cerrando en esa fase.

## 1. Las 6 dimensiones canónicas (fuente: la rúbrica)

La taxonomía de evaluación es **una sola**, definida en
`docs/simulador/contrato_v0/rubricas/rubric_case_factory_v1.yaml` (`public.dimensions`):

| key | qué mide |
|---|---|
| `contexto` | entiende objetivo, audiencia, restricciones, stakeholder, éxito esperado |
| `datos` | usa información suficiente, minimizada, con permisos y calidad adecuada |
| `ejecucion_ia` | elige y configura prompt, workflow o agente según el nivel |
| `validacion` | revisa output, claims, logs, fuentes, errores, consistencia |
| `juicio` | detecta riesgo, autoridad, escalamiento, consecuencias, límites |
| `impacto` | convierte el uso de IA en decisión, ahorro, acción o resultado visible |

Bandas: `A` (85–100, listo para operar), `M` (65–84, listo con controles),
`B` (0–64, requiere supervisión). Pesos por nivel (N1/N2/N3) en `internal.level_weights`.

**Las 5 dimensiones legacy quedan retiradas:** `contexto, privacidad, validacion, juicio, decision`.

### Mapeo legacy → canónica

| legacy | canónica | nota |
|---|---|---|
| contexto | contexto | igual |
| privacidad | **datos** | privacidad deja de ser dimensión; sobrevive como **risk event** (`exposed_pii_to_model` y familia), que es donde comunica al manager: "¿hubo exposición o no?" |
| validacion | validacion | igual |
| juicio | juicio | igual |
| decision | **impacto** | de "elegir" a "resultado operativo" |
| — | **ejecucion_ia** | dimensión nueva: calidad de la ejecución con IA |

## 2. Runtime canónico

**F6 cerrado (2026-06-30).** Ya no hay dos rutas para lo mismo.

- **`/case/[case_id]`** (`RuntimeExperienceV2`, config-driven) es el **único**
  runtime: lee el `playable_json` rico y renderiza los 17 bloques vía
  `ExerciseBlockRenderer`. Vive en `app/(app)/case/[case_id]/page.tsx`
  (server component: resuelve org, carga el caso, fallback al registro
  estático si no hay org/sembrado).
- **`/jugar/[case_id]`** y el motor legacy hardcodeado a 5 step_types
  (`RuntimeExperience`, "el caso de Camila") **se eliminaron del repo**, no
  solo se ocultaron. El componente, la ruta y todas las referencias
  (`case-destination.ts`, `app/dev`, `app/motores`, `AppShell.tsx`) se
  actualizaron para apuntar a `/case`. Una URL `/jugar/*` ahora 404 limpio vía
  `app/not-found.tsx`.
- Las APIs de sesión/respuestas/evaluación son **agnósticas de ruta** — la
  consolidación no tocó backend.

## 3. Fuente de verdad de los datos

- **`playable_json`** (tabla `simulador.generated_cases`) es la verdad semántica del
  caso: secciones, slides, bloques, payloads.
- **`case_steps`** es una **proyección derivada** para sesión/juez. Nunca verdad
  semántica. Sus `evaluates_dimensions` se derivan **por bloque** de
  `exerciseBlocks[blockId].primaryDimensions` (implementado en
  `lib/simulador/generated-cases.ts`, F6), no de un array global.
  Bloques pasivos (`primaryDimensions: []`) no evalúan.
- Tras regenerar un caso, `case_steps` se re-siembra desde `playable_json`.

## 4. Invariante del juez (atómico)

El juez (`lib/simulador/judge/`) emite **exactamente las 6 dimensiones canónicas**.

- `JUDGE_TOOL_SCHEMA` (`prompt-builder.ts`): `minItems/maxItems = 6`, `enum` = las 6
  keys. El SDK de Anthropic valida server-side → **schema + prompt + `JUDGE_PROMPT_VERSION`
  cambian juntos en un solo commit/deploy.** Nunca por separado (rompería evals en vuelo, 422).
- El juez **consume `exerciseEvidence`** (payload tipado por bloque + metrics) como
  fuente primaria; `responses` crudas solo para steps legacy.
- `DimensionKey` (`judge/types.ts`) = las 6 canónicas.
- Overrides (`apply-overrides.ts`): `CRITICAL_DIMENSIONS = {datos, juicio, impacto}`.
  Los `deterministic_overrides` de la rúbrica (`set_dimension_band(datos,B)` ante
  exposición, etc.) se respetan vía el cap de recomendación; el **band-cap
  determinista por dimensión es mejora pendiente** (`[pendiente]`, ver §7).
- El reporte al manager muestra las 6 dimensiones; la UI mapea **por `id`**, no por
  índice (reports viejos de 5 dims no deben crashear).
- **Proveedor LLM (v0 · decisión de Pablo 2026-06-08):** el juez de runtime corre con
  **DeepSeek** (primario) + Gemini (fallback) vía `lib/llm/client.ts` /
  `runOpenAiCompatibleJudge`. **No usa Anthropic en v0**; la validación de las 6 dims se
  hace en código (`run.ts`, `dimensions.length === 6`), no por el tool_use server-side.
  Modelo sugerido para evaluación: `deepseek-reasoner`. Política v0: runtime (fuera del
  local server) = DeepSeek con saldo mínimo; desarrollo/autoría (Claude Code / Codex) = la
  suscripción; el resto de keys del sistema se suben al primer usuario pagado. Anthropic +
  `JUDGE_TOOL_SCHEMA` (validación server-side) quedan como opción para entonces.

## 5. Orden de deploy: Expand → Migrate → Contract

1. **Expand (F1, BD additiva):** los `CHECK` de `dimension_key` aceptan la **unión**
   {6 nuevas + `privacidad` + `decision`} antes de que el código emita las nuevas.
   Tablas: `rubric_dimensions`, `risk_events`/`evaluation_runs`, `gap_definitions`,
   `practice_beats`/`practice_unlocks`. La rúbrica en BD se re-siembra a 6 dims.
2. **Migrate (F2/F3):** juez atómico a 6 + seed derivado por bloque + read-back (config.ts).
3. **Contract (cleanup posterior):** quitar `privacidad`/`decision` del CHECK una vez
   que no queden filas históricas que dependan de ellas. **No en el path crítico.**

## 6. Lugares a mantener en sync (si cambian las dimensiones)

- Rúbrica YAML (fuente) + seed de `rubric_dimensions` en BD.
- `lib/simulador/judge/`: `types.ts` (DimensionKey), `prompt-builder.ts` (schema + prompt),
  `run.ts` (validación de count), `apply-overrides.ts` (CRITICAL_DIMENSIONS), `mock-output.ts`.
- `lib/simulador/types.ts` (`SIMULATOR_DIMENSIONS`) + `contracts.ts` (validador).
- `lib/simulador/generated-cases.ts` (deriva dimensiones por bloque desde el catálogo).
- `lib/simulador/config.ts` (`DIMENSIONS` + sprint cases) — **denominador del promedio
  del dashboard del manager** (`reports/model.ts`).
- `lib/simulador/runtime.ts` (mock scores), `scripts/simulador/e2e-acceptance.mjs`.
- Copy de venta: `copy/landing.ts`, `LandingPage.tsx`, `report/[session_id]/page.tsx`.
- Migraciones SQL con `CHECK (dimension_key in ...)`.

Un check de CI que falle si el conteo de dims diverge entre estos sitios es deseable `[pendiente]`.

## 7. Pendientes conocidos

- **Band-cap determinista por dimensión:** hoy `apply-overrides` actúa sobre la
  *recomendación*; falta forzar la *banda* de una dimensión ante una condición
  (ej. exposición de PII → `datos` = B), tal como la rúbrica lo declara en
  `deterministic_overrides`. Requiere extender el tipo de override.
- **Inconsistencia en la rúbrica:** `missing_agent_monitoring` apunta a `juicio` en
  `deterministic_overrides` pero a `validacion` en `gap_taxonomy`. Reconciliar.
- **Contracción del enum BD** (quitar `privacidad`/`decision`) tras limpiar histórico.
- **Limpiar refs muertas a `/case-lab`** en docs (README, CASE_REVIEW_PROTOCOL, etc.).

## 8. Gate de negocio

No se generan lotes de casos nuevos hasta que `scripts/simulador/e2e-acceptance.mjs`
demuestre una sesión real → reporte de manager con las 6 dimensiones discriminantes,
contra el **juez real DeepSeek** (`judge_model: openai_compatible:deepseek*`, **no mock**) `[F4]`.
Requiere `DEEPSEEK_API_KEY` con saldo. Nota: hoy en local, sin `ANTHROPIC_API_KEY` y con
`NODE_ENV≠production`, el juez cae a mock — para el gate F4 hay que forzar el camino DeepSeek
(correr el e2e con `NODE_ENV=production` o un flag que vaya directo a `runOpenAiCompatibleJudge`).
