# Rubricas v0

Las rubricas son data versionada, no codigo.

## Principio

Mostrar al usuario dimensiones publicas. Mantener internos criterios, pesos, thresholds y penalizaciones para reducir gaming y permitir iteracion.

## Dimensiones publicas base

| Dimension | Definicion publica |
|---|---|
| `contexto` | Encadra situacion, audiencia, tono y restricciones al usar IA. |
| `privacidad` | Protege datos personales y confidenciales. |
| `validacion` | Verifica output de IA antes de usarlo. |
| `juicio` | Lee riesgos, autoridad y consecuencias antes de actuar. |
| `decision` | Toma una accion clara, justificada y responsable. |

## Versionado

Cada `evaluation_run` debe guardar:

- rubrica usada
- version
- modelo juez
- version del prompt juez
- snapshot de inputs evaluados

Cambiar una rubrica no debe alterar evaluaciones historicas.

## Riesgo

Riesgo vive en `risk_events`, no como sexta dimension. Esto permite capturar:

- severidad
- tipo de dato sensible
- step donde ocurrio
- evidencia textual
- estado de escalamiento

## Primer rubrica pendiente

Claude debe escribir:

`docs/simulador/contrato_v0/rubricas/rubric_marketing_v1.yaml`

Codex revisa estructura, versionado y compatibilidad con schema.
