# Case quality checklist

## Gate automatico

Un caso falla si:

- no declara `level`;
- no declara `freshness.type`;
- `freshness.type` es `current` o `hybrid` y falta `refresh_due_at`;
- no declara departamentos, roles, industrias y seniority;
- no declara herramientas;
- no declara `estimated_minutes`;
- no declara `output_spec`;
- no declara `failure_modes`;
- no declara pesos por criterio que sumen 100;
- no tiene al menos 2 risk events posibles;
- no tiene practice mapping;
- no tiene resimulation;
- no tiene judge prompt o `judge.prompt_ref`;
- revela criterios internos/risk_event names en texto visible al participante.
- muestra copy escolar en runtime participante (`evidencia esperada`, `debrief`,
  `rubrica`, `manager signal`, `case reveal`, labels canonicos de bloques).
- presenta el bloque de ejercicio como protagonista en vez de una accion de
  trabajo dentro del caso.

## Gate humano

Un reviewer debe contestar si:

1. Hay presion real y no teatral.
2. Las opciones tienen tradeoff real.
3. El participante puede equivocarse de forma plausible.
4. La re-sim mide transferencia, no memoria.
5. El caso refleja una herramienta vigente o un principio evergreen claro.
6. El manager podria tomar una accion con el resultado.
7. El caso no depende de IP de HBR/MIT/terceros.
8. El caso puede resolverse en el tiempo estimado.
9. El judge puede evaluar evidencia textual, no inferencias invisibles.
10. El caso ensena despues de medir, no antes.
11. En los primeros 5 segundos de cada seccion se entiende que paso, que hacer,
    que material hay delante y que esta en juego.
12. Las consecuencias aparecen como estado del caso despues de responder, no
    como explicacion pedagogica antes de actuar.

## Distribucion minima antes del lote 50

Antes del lote 50 debe existir al menos un golden case aprobado. Hoy el golden
case activo es `sales_agent_followup_pipeline_v1`.

- 15 casos N1.
- 20 casos N2.
- 15 casos N3.
- Al menos 8 departamentos cubiertos.
- Al menos 8 industrias cubiertas.
- Al menos 20 herramientas registradas.
- 30% evergreen / 70% current por lote.
