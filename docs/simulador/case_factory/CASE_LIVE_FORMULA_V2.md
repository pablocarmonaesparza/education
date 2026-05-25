# Formula v2 — caso vivo primero

Este contrato corrige la discrepancia entre la biblioteca de ejercicios y la
experiencia final del participante. El caso puede usar bloques canonicos del
Exercise Lab, pero el participante nunca debe sentir que esta llenando un
formulario pedagogico.

## Principio central

El runtime abre como una situacion de trabajo:

`quien soy -> que paso -> con que material trabajo -> que debo decidir -> que cambia despues`

La mecanica de evaluacion vive por debajo. La evidencia se captura, pero no se
anuncia como rubrica, respuesta correcta, learning goal ni criterio interno.

## Separacion por audiencia

| Audiencia | Ve | No ve |
|---|---|---|
| Participante | contexto, artefacto, presion, tarea, accion, siguiente estado | rubrica, manager signal, evidencia esperada, risk events internos, respuestas correctas |
| Manager | pregunta de negocio, senal observable, evidencia, riesgo, accion recomendada | widgets internos, pesos del judge, debugging |
| Autor/debug | bloque canonico usado, learning intent, expected evidence, manager signal, notas de auditoria | nada oculto; es superficie interna |

## Regla de slide

Cada pantalla debe tener una sola idea operativa. La slide existe para hacer
avanzar la simulacion, no para explicar la metodologia.

- Una pantalla de lectura plantea un evento, una tension o un artefacto.
- Una pantalla de accion pide una decision concreta sobre ese artefacto.
- Una pantalla no debe tener scroll interno en 1024x768.
- Las consecuencias aparecen como estado narrativo despues de responder: CRM
  acotado, borrador retenido, log bloqueado, memo listo, stakeholder informado.

## Palabras prohibidas en runtime participante

Estas palabras pueden existir en docs, author mode o datos internos, pero no en
la experiencia participante por defecto:

- `learning goal`
- `objetivo` como tarjeta pedagogica
- `evidencia esperada`
- `que afectara`
- `debrief`
- `rubrica`
- `manager signal`
- `case reveal`
- `respuesta correcta`
- `risk event`
- `ejercicio` como etiqueta de pantalla

## Uso de Exercise Lab

`/exercise-lab` sigue siendo la biblioteca canonica de interacciones. En un caso
vivo, esos bloques se envuelven con copy de escena:

- `data_table_triage` se presenta como decidir que material entra al trabajo.
- `agent_brief_builder` se presenta como limitar una delegacion real.
- `permission_matrix` se presenta como declarar permisos de una operacion.
- `run_log_review` se presenta como revisar una corrida antes de escalar.
- `dashboard_pivot` se presenta como elegir la senal que se lleva a negocio.
- `tradeoff_decision_memo` se presenta como cerrar una accion defendible.

Los labels canonicos del bloque pertenecen a laboratorio/author mode, no al
runtime participante.

## Gate de aceptacion

Un caso no esta listo si una persona no puede entender en 5 segundos:

1. que paso;
2. que tiene que hacer;
3. que esta en juego;
4. que material tiene delante;
5. que cambia cuando responde.

El checker automatico debe abrir `/case-lab/<case>` sin parametros y fallar si
aparecen spoilers, copy escolar o labels de bloques canonicos visibles.
