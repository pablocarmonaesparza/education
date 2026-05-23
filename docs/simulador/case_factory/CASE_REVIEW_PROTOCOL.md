# Case Review Protocol

Este protocolo es el gate de calidad antes de aceptar un caso nuevo del
simulador. Su objetivo no es "aprobar rapido"; es encontrar fallas antes de que
un manager, empleado o judge las encuentre en produccion.

## Principios

1. **Evidencia antes que gusto.** Un caso pasa por schema, research, ejercicios,
   rubrica, manager test y reviewer adversarial.
2. **No hay YAML directo.** El YAML es el resultado final del proceso, no el
   punto de partida.
3. **Claude Code CLI es reviewer, no autor.** Claude debe encontrar problemas,
   no reescribir el caso ni cambiar la direccion de producto.
4. **La IA no reemplaza revision humana.** Claude puede detectar inconsistencias,
   pero Itera decide contrato, publicacion y severidad final.
5. **Cada caso debe sobrevivir a usuarios sinteticos.** Debe distinguir entre
   una respuesta fuerte, una promedio y una riesgosa.

## Fundamento usado

- NIST AI RMF: evaluar y gestionar riesgos de IA como parte del diseno,
  desarrollo, uso y evaluacion de sistemas.
- OpenAI evals: definir objetivo, dataset, metricas, correr/comparar evals y
  evaluar continuamente; incluir casos tipicos, edge cases y adversariales.
- Anthropic eval tool: crear test cases, comparar versiones, calificar calidad y
  re-ejecutar suites cuando cambia el prompt.
- HBS/HKS case method: un caso debe poner a la persona en el lugar del
  decision-maker con informacion disponible al momento, decision point claro y
  teaching plan.
- MIT Sloan Action Learning: aplicar frameworks a retos reales, ambiguos y con
  impacto operativo.

## Gates

### Gate 0 — Preflight de archivos

- El caso existe y tiene root `case_template`.
- El catalogo de fabrica existe y valida.
- El caso apunta a nivel, perfil, herramientas, freshness y manager outcome.
- Tiene `manager_outcome.assignment_brief`.
- Tiene primary + resim.
- Tiene practice mapping.
- Tiene judge prompt ref.

### Gate 1 — Integridad del caso

Se valida contra:

- `CASE_SCHEMA.yaml`
- `CASE_TAXONOMY.yaml`
- `CASE_HIG.md`
- `EXERCISE_BLOCK_CATALOG.yaml`
- `CASE_RUBRIC_V1.md`
- `MANAGER_RESULTS_MODEL.md`

El caso falla si:

- el participante puede ver dimensiones, pesos, risk events o respuesta correcta;
- las respuestas vienen prellenadas;
- el manager no entiende cuando asignarlo;
- no hay decision real;
- no hay artefacto laboral;
- no hay riesgo observable;
- no hay transferencia real en resim.

### Gate 2 — Research freshness

El dossier debe comprobar:

- herramienta o workflow vigente;
- fuente oficial o primaria cuando aplique;
- limitaciones y riesgos;
- contradicciones o casos de fallo;
- refresh SLA.

Si el tema depende de una feature actual y no hay fuente verificable, el caso no
se publica.

### Gate 3 — Fit de ejercicios

Cada ejercicio debe venir de `EXERCISE_BLOCK_CATALOG.yaml`.

- N1: IA individual, datos, revision basica y decision.
- N2: workflow, permisos, validacion, dashboard o decision.
- N3: brief de agente, permisos, logs, monitoreo, escalamiento y decision.

Los ejercicios no deben abrir el caso a configuracion libre del participante. El
caso controla contexto, datos, presion y restricciones.

### Gate 4 — Evaluacion y judge

Cada paso debe emitir evidencia hacia:

- contexto
- datos
- ejecucion_ia
- validacion
- juicio
- impacto

Los risk events son eventos observables, no dimensiones. Todo risk event debe
tener evidencia textual o accion concreta del participante.

### Gate 5 — Synthetic participant set

Cada caso debe probarse mentalmente con tres perfiles:

- **strong:** controla datos, valida output, entiende tradeoffs y produce accion
  manager-ready.
- **average:** completa la tarea, pero deja huecos corregibles.
- **risky:** comete al menos un riesgo high o sobredelega sin control.

El caso falla si estos perfiles no producirian resultados distinguibles.

### Gate 6 — Manager test

Se genera un mini reporte sintetico y se pregunta:

`Puede un manager entender en 30 segundos que hacer con esta persona?`

Debe poder elegir:

- `pilotar`
- `entrenar`
- `pausar`
- `escalar`

### Gate 7 — Claude Case Critic

Claude Code CLI recibe el caso, los docs de fabrica y el protocolo. Debe
responder:

- `PASS` o `FAIL`;
- issues `P0/P1/P2`;
- archivo/seccion;
- por que importa;
- correccion esperada;
- si bloquea publicacion.

Claude no debe reescribir el caso completo.

### Gate 8 — Correccion y cierre

Un caso queda listo solo cuando:

- validadores automaticos pasan;
- Claude Case Critic no tiene P0/P1 abiertos;
- reviewer humano marca PASS;
- synthetic manager report es entendible;
- el caso corre en `/case-lab` o runtime sin romper claridad.

## Comando canonico

```bash
npm run simulador:review-case -- docs/simulador/contrato_v0/casos/<case>.yaml --claude
```

Sin `--claude`, el comando genera el paquete de revision y el prompt para correr
Claude manualmente.

## Outputs

Cada corrida crea:

```text
docs/simulador/case_reviews/<case_id>/<timestamp>.md
```

El archivo guarda:

- resultados automaticos;
- warnings;
- prompt enviado a Claude;
- respuesta de Claude si se ejecuto;
- decision final pendiente.
