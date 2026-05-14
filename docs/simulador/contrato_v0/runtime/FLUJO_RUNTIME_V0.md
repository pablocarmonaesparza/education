# Runtime logico v0

Este documento define la logica del motor antes de cualquier UI.

## Loop empleado

```text
assignment creado
  -> session iniciada
  -> render case_variant
  -> ejecutar steps en orden
  -> capturar events + llm_interactions + behavior_events + risk_events
  -> evaluation_run
  -> gap detection
  -> practice beat final
  -> evidence snapshots
  -> manager recommendation
  -> marcar siguiente accion o re-simulacion
```

## Loop manager

```text
importar equipo
  -> elegir sprint package
  -> diagnosticar baseline
  -> asignar sprint
  -> consumir evidencia
  -> tomar accion: pilotar | entrenar | pausar | escalar
```

## Estados de session

| Estado | Significado |
|---|---|
| `not_started` | Assignment existe, usuario no abrio el caso. |
| `in_progress` | Session abierta. |
| `paused` | Usuario salio y puede continuar. |
| `completed` | Steps terminados. |
| `evaluated` | Evaluation run completado. |
| `practice_assigned` | Hay practice beat recomendado. |
| `evidence_emitted` | Evidence snapshots listos. |
| `expired` | No termino en ventana permitida. |

## Event model

El runtime no debe depender solo de respuestas finales. Captura eventos granulares.

| Evento | Tabla destino |
|---|---|
| step iniciado / completado | `simulation_step_events` |
| decision enviada | `simulation_step_events` |
| prompt enviado al LLM | `llm_interactions` |
| respuesta del modelo | `llm_interactions` |
| hint pedido | `behavior_events` |
| respuesta cambiada | `behavior_events` |
| copia sensible detectada | `risk_events` + `behavior_events` |
| abandono | `behavior_events` |

## LLM beat v0

- proveedor: Itera-provided
- maximo: 2 turns
- se guarda prompt y respuesta
- manager no ve transcript individual completo por defecto
- evaluation usa decisiones observables y rubrica versionada

## Evaluation run

Cada corrida de evaluacion guarda:

- `rubric_id`
- `rubric_version`
- `judge_model`
- `judge_prompt_version`
- `input_snapshot`
- `dimension_scores`
- `gap_tags`
- `risk_events`
- `created_at`

La evaluacion historica no se recalcula silenciosamente si cambia la rubrica.

## Re-simulacion

La re-simulacion usa otra `case_variant` ligada por `parent_variant_id`.

Regla v0:

- misma rubrica para comparar transferencia
- variantes cambian contexto, presion o tipo de datos
- risk events pueden subir de severidad si el contexto lo exige
- no cambiar pesos de rubrica solo para una variante si se quiere comparar mejora

## Evidence

Evidence no es report. Evidence es data tipada.

Tipos v0:

- `readiness_dimension_scores`
- `risk_events_detected`
- `decision_replay`
- `transfer_delta`
- `manager_recommendation`

Reports, exports y dashboards consumen evidence snapshots.
