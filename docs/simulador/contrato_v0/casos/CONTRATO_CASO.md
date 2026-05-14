# Contrato de caso vivo v0

Un caso vivo no es una pagina ni una leccion. Es un contrato ejecutable que el runtime puede renderizar, evaluar y convertir en evidencia.

## Capas obligatorias

| Capa | Que representa |
|---|---|
| `case_template` | Definicion reusable: pasos, rubrica, inputs esperados, gaps, practice beats, policy. |
| `case_variant` | Render especifico con variables pobladas y datos sinteticos. |
| `simulation_session` | Intento real de un usuario sobre una variante. |
| `simulation_step_events` | Eventos granulares capturados durante la sesion. |

No mezclar estas capas en schema aunque un YAML canonico pueda mostrarlas juntas para lectura humana.

## Step types v0

| Tipo | Uso |
|---|---|
| `data_scope` | Decidir que datos usar, ocultar, transformar o anonimizar. |
| `llm_beat` | Interaccion controlada con IA real provista por Itera. Maximo 2 turns en v0. |
| `artifact_review` | Revisar output/documento y marcar problemas. |
| `decision_select` | Elegir entre opciones cerradas. |
| `decision_open_short` | Justificar accion en texto corto. |

`tool_pick` no existe como tipo v0. Vive dentro de `decision_select` hasta que la heuristica pida fragmentarlo.

## Dimensiones v0

| Dimension | Definicion publica |
|---|---|
| `contexto` | Que tan bien encuadra situacion, audiencia, tono y restricciones al pedirle algo a la IA. |
| `privacidad` | Que tan bien protege datos personales y confidenciales en cada paso. |
| `validacion` | Que tan rigurosamente verifica el output de la IA antes de usarlo. |
| `juicio` | Que tan bien lee riesgos, autoridad y consecuencias antes de actuar. |
| `decision` | Que tan clara, justificada y responsable es la accion final. |

Riesgo no es dimension scoreable independiente. Riesgo vive en `risk_events` y puede dispararse desde cualquier dimension.

## Manager actions

El manager no solo ve dashboard. El sistema debe ayudarlo a decidir:

- `pilotar`
- `entrenar`
- `pausar`
- `escalar`

## Telemetria requerida desde dia 1

- `time_on_step`
- `prompt_iterations`
- `hint_requested`
- `sensitive_copy_detected`
- `answer_changed`
- `abandoned_step`

Aunque no pese en el score v0, se captura desde el inicio.

## Politica de datos sinteticos

Todo input de ejemplo debe marcarse como sintetico. Prohibido usar datos reales de clientes en casos canonicos.

```yaml
inputs_resolved:
  synthetic: true
```

## Transparencia de evaluacion

El empleado puede ver las 5 dimensiones upfront. Los criterios internos, pesos, thresholds y penalizaciones permanecen internos.

## Practice beat

En v0 se dispara al final de la sesion. Preserva la narrativa del caso. Mid-session queda como experimento futuro.

## Manager visibility

V0: agregados, gaps, risk events y excerpts anonimizados si hay riesgo alto. No transcript individual completo del LLM beat por defecto.
