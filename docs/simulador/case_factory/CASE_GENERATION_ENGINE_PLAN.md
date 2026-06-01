# Motor de generación de casos · plan

Cómo pasar de "los casos los escribe Claude a mano" a "el sistema genera casos
coherentes a partir de un brief". Revisado con Codex CLI.

## El marco: compilador, no agente

No se diseña como "un agente que escribe casos" (improvisa distinto cada vez y le
rezas al prompt). Se diseña como un **compilador de casos con LLMs en pasos
controlados**, con artefactos intermedios y validadores deterministas entre cada
paso. El YAML del caso es la **compilación final**, no el primer output creativo.
Así el sistema deja evidencia, falla de forma legible y se mejora con datos.

## El pipeline

```
intake -> brief normalizado -> dossier de research (sanitizado)
       -> biblia de continuidad -> blueprint de 25 slides
       -> YAML del caso -> GATES (en loop acotado) -> revisión humana -> servir
```

Cada flecha es un paso con su validación. No se salta al YAML de un tiro.

### Los gates (lo que ya está construido y de-risqueado en F0)

1. **Estructural + contenido** · `scripts/simulador/check-assembled-case.mjs` +
   `BLOCK_CONTENT_SCHEMAS.yaml`. Valida 5×5, ratio ai_native, secciones, niveles,
   primer/último slide, Y el contenido por bloque (knobs requeridos, conteos,
   campos prohibidos/prefill, ai_comparison exactamente 4 opciones, campos
   visibles vs judge_internal). Determinista.
2. **Copy** · `scripts/simulador/lint-case-copy.mjs`. Em dash, acrónimos
   prohibidos en prosa visible. Determinista.
3. **Narrativo** · `CASE_NARRATIVE_JUDGE.md`. Cuatro jueces LLM especializados
   (continuity, copy, manager_signal, adversarial). Cada uno extrae una fact
   table, cita evidencia, devuelve JSON, default FAIL sin evidencia. Optimizado
   para falsos negativos (frenar de más).

### El loop de autocorrección (acotado · de Codex)

Máximo 3 intentos. Los gates devuelven errores estructurados
(`criterio, sección, slot, actual, esperado, severidad`). La corrección es por
slide/patch, NO regeneración completa (si regenera todo, se cicla). A los 3
intentos sin PASS, va a revisión humana con el diagnóstico.

## Qué se de-risqueó en F0 (hecho y probado)

`scripts/simulador/test-case-factory.mjs` toma el caso de oro, genera 14
variantes rotas y prueba el comportamiento de los gates:

- **Gates deterministas**: 6 fixtures estructurales y 3 de contenido fallan
  `check-assembled-case`; 2 de copy fallan `lint-case-copy`. Todos cazados.
- **El resultado clave**: 3 fixtures NARRATIVOS (receptor cambiado a la jefa,
  dato que contradice, promesa abierta) **pasan** los gates deterministas. Son
  ciegos a la incoherencia narrativa. Por eso hace falta el juez.
- **El juez** (corrido vía Codex CLI contra golden + los 3 narrativos): da PASS
  al golden (no rubber-stampea) y FAIL a los 3 rotos, citando la ruptura exacta.
  4/4 correcto.

La pieza más riesgosa que marcó Codex (la falsa confianza del gate narrativo)
queda probada antes de conectarla a nada.

## Fases (~5 días c/u)

- **F0 · Harness de fábrica · HECHO.** Schemas por bloque, validador de
  contenido, copy lint, fixtures rotos, test de gates, rúbrica del juez, de-risk
  del juez con Codex. Todo en verde.
- **F1 · Generador core offline · HECHO** (rama `claude/case-engine`). Brief ->
  normaliza -> biblia -> blueprint por receta -> autor por sección -> gates +
  juez en loop acotado (<=3, reparación por slide, luego HUMAN_REVIEW). CLI:
  `scripts/simulador/gen/generate-case.mjs <brief.yaml>`. Un brief no-retail
  (Nova Pagos, cobranza) pasó los 3 gates al primer intento y **se juega en
  /case-demo** (render parametrizado a argv[2], reporte degrada con honestidad).
- **F2 · Juez conectado al loop · HECHO.** `judge-narrative.mjs` (3 jueces:
  continuidad, señal, adversarial) corre como 3er gate. De-risk **4/4** (golden
  PASS estable, 3 fixtures narrativos FAIL con cita). Falta el set ampliado
  (N2/N3 + más fixtures) = endurecimiento.
- **F3 · Bridge/migración del runtime productivo · PENDIENTE.** Nota corregida:
  el runtime productivo (`components/simulador/RuntimeExperience.tsx`) NO usa "6
  secciones" sino **5 step_types rígidos** hardcodeados (data_scope, llm_beat,
  artifact_review, decision_select, decision_open_short) con componentes inline,
  leyendo de la base. El motor produce el formato RICO de 17 bloques. El puente
  es: (A) adaptador caso 5x5 -> case_templates + case_steps por empresa, o (B)
  generalizar el runtime a los 17 bloques. Sin esto la fábrica vive en el demo.
- **F4 · Research + intake** estructurado. Intake con enums + preview editable,
  no formulario libre. El research se trata como DATOS no confiables: se
  sanitiza a dossier (`claim, fuente, confianza, uso permitido`); cualquier
  instrucción tipo "ignora lo anterior" se descarta; datos siempre sintéticos,
  cero PII real.
- **F5 · Lote de 10-15 + calibración humana.** Métricas: pass@1, intentos
  promedio, edición humana, falsos PASS del juez.

## Costo (hat de CFO)

No se monta como generación live por usuario todavía. Arranca como **CLI interna
de autoría**. Caché por hash de `brief + dossier + versión de catálogo/schema/
prompt`. Cada corrida se guarda (inputs, versiones, outputs, errores, intentos,
modelo, decisión humana) para auditar y medir drift.

## Reparto

- Claude (yo): lógica de generación, rúbricas de los jueces, biblia, golden +
  fixtures rotos, schemas de contenido. Es calidad de caso.
- Codex: harness de plumbing, migración de runtime, research + intake, wiring de
  API/caché/persistencia.

## Artefactos de F0 (en el repo)

- `docs/simulador/case_factory/BLOCK_CONTENT_SCHEMAS.yaml`
- `docs/simulador/case_factory/CASE_NARRATIVE_JUDGE.md`
- `scripts/simulador/check-assembled-case.mjs` (+ validación de contenido, acepta ruta)
- `scripts/simulador/lint-case-copy.mjs`
- `scripts/simulador/test-case-factory.mjs` (34 fixtures rotos)

## Endurecimiento del validador (lo que costó que fuera confiable)

El validador pasó por 4 rondas de Codex CLI + 1 pase adversarial con subagente
(el fallback de Ralph Wiggum, porque la auth de Codex CLI se degradó a mitad y
empezó a colgarse). Cada ronda cazó falsos PASS materiales (un caso que pasaba
el gate pero rompía en runtime). Todos cerrados, cada uno con su fixture:
tipos forzados, campos por elemento, enums (flagIfMarked daba 422), prefill
completo, not_data_driven, required escalares como string (name.split crasheaba),
meta.tools como lista (tools.map crasheaba la portada), ids únicos. La lección:
el gate no vale si da falsa confianza; hay que probarlo contra casos rotos hasta
que de verdad falle donde debe.

## Backlog para Codex (de las reviews de F0)

- **Drift del catálogo**: `default_empty_fields` en EXERCISE_BLOCK_CATALOG no
  coincide con los nombres reales del payload (dice `decision_choice`, el payload
  es `decision`; `chosen_output` vs `selected_output`). El validador lo compensa
  con `forbidden_keys` explícitos, pero el catálogo debería corregirse (regenera
  exercise-blocks).
- **Wirear workflow_builder y dashboard_pivot** a `caseContext` (hoy
  `not_data_driven`, el validador los rechaza en casos). Igual que se hizo con
  ai_textfield_guided y model_tradeoff_sliders.
- **Hardening teórico de bajo impacto** (no rompen runtime, los toleró el render):
  enum de `kpi.delta.direction`, validación de tipo de celdas de tabla. Para F1.

## F1 implementado: aprendizajes y realidad de proveedores

**Arquitectura del motor** (`scripts/simulador/gen/`):
- `llm/client.mjs`: cliente dual-proveedor (OpenAI por function calling, Anthropic
  por tool_use). Interfaz neutral `callTool(system, user, {name, description,
  schema})`. La validación fuerte la hacen los gates; el schema solo fuerza forma.
- `steps/`: normalize-brief, build-bible, build-blueprint (receta + intents),
  author-yaml (por sección), repair-slide (reparación puntual).
- `artifacts/`: recipe-presets (N1 sembrada del golden), block-schemas (deriva el
  contrato de content por bloque de BLOCK_CONTENT_SCHEMAS, palanca de calidad).
- `gates/run-gates.mjs`: corre los 3 gates con `--json`, agrupa findings por slide.
- `judge-narrative.mjs`: 3 jueces, ensemble 2x, evidence-gating.

**Aprendizajes de calibración del juez (de-risk, no a la primera):**
- El juez de COPY (LLM) se quitó: alucinaba guiones largos (reprobaba el golden);
  el linter determinista cubre guion y siglas de forma fiable. Copy objetivo =
  determinista, no LLM.
- Los jueces confundían el contenido PLANTADO a proposito (borradores de IA con
  cifras inventadas / datos personales en slides ai_output_review) con defectos.
  Se anota cada bloque con su naturaleza para que el juez no lo cuente.
- Contradicciones numéricas: el LLM compara mal. Patrón que funcionó: el LLM
  EXTRAE cada (métrica, valor) y el CÓDIGO compara; anclado a métricas canónicas
  (tarjetas de KPI) para no falsear con valores por fila de las tablas.
- Varianza del LLM aun a temperatura 0: ensemble (correr cada juez 2x y unir
  findings fundamentados) la cierra sin subir falsos positivos.

**Realidad de proveedores (importante):** la llave de Anthropic en `.env.local`
está inválida; el motor corrió sobre **OpenAI (gpt-4o)**. El juez productivo
(`lib/simulador/judge`) apunta a Anthropic con fallback a DeepSeek/Gemini, todos
caídos o sin saldo, así que la evaluación en producción probablemente está
degradada. El generador es dual-proveedor: cuando se refresque la llave de
Anthropic, basta `SIMULADOR_LLM_PROVIDER=anthropic` para volver a Claude.
