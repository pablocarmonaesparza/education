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
- **F1 · Generador core offline.** Brief manual -> biblia -> blueprint -> YAML,
  con los gates deterministas + el juez en loop acotado. Meta: que de un brief a
  mano salga un caso que pase TODOS los gates con <= 3 intentos. CLI interna, sin
  API por usuario.
- **F2 · Conectar el juez al loop** y calibrarlo contra un set ampliado
  (golden N1/N2/N3 + ~20 fixtures rotos cubriendo cada tipo de ruptura).
- **F3 · Bridge/migración del runtime productivo a 5 secciones**
  (`components/simulador/RuntimeExperience.tsx` aún usa el modelo viejo de 6).
  Sin esto, la fábrica vive en el demo, no en el producto.
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
- `scripts/simulador/test-case-factory.mjs`
