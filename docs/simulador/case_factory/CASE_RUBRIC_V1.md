# Case Rubric v1

La rubrica base tiene 6 criterios. Los pesos cambian por nivel y por caso, pero
siempre suman 100.

## Criterios

| Criterio | Que mide | Evidencia |
|---|---|---|
| contexto | Encuadre de objetivo, audiencia, restricciones, tono y exito esperado. | Prompt/brief incluye situacion real y tradeoffs. |
| datos | Calidad, minimizacion, privacidad, permisos y uso responsable de informacion. | Campos elegidos, anonimizacion, provenance y exclusiones. |
| ejecucion_ia | Capacidad de elegir y operar prompt, workflow o agente segun el nivel. | Prompt, workflow plan, agent brief, automation spec. |
| validacion | Revision de output, fuentes, claims, metricas y consistencia. | Checklist, marcas de riesgo, correcciones. |
| juicio | Lectura de riesgo, autoridad, escalamiento, reputacion y consecuencias. | Decide pausar/escalar/objetar cuando corresponde. |
| impacto | Traduccion del trabajo con IA a resultado operativo o decision util. | Memo, accion, KPI, ahorro, decision manager-ready. |

## Pesos base por nivel

| Nivel | contexto | datos | ejecucion_ia | validacion | juicio | impacto |
|---|---:|---:|---:|---:|---:|---:|
| N1 fundamentos | 20 | 18 | 22 | 18 | 12 | 10 |
| N2 workflow | 14 | 18 | 24 | 16 | 14 | 14 |
| N3 agentes | 10 | 20 | 22 | 16 | 20 | 12 |

## Bandas

| Banda | Score | Significado para manager |
|---|---:|---|
| A | 85-100 | Puede operar con autonomia razonable en ese nivel. |
| M | 65-84 | Puede operar con guia, controles o practica puntual. |
| B | 0-64 | No conviene ampliar uso sin entrenamiento o supervision. |

## Overrides

- Cualquier `risk_event` high de privacidad, compliance o agente autonomo capea
  la recomendacion en `pausar` o `entrenar`.
- N3 con `agent_overreach` high nunca puede terminar en `pilotar`.
- Score alto con validacion baja no se considera listo para produccion.
- Score alto con impacto bajo indica uso correcto pero poco valioso.

## Regla de oro

El resultado debe explicar progreso y riesgo. Si solo explica "sabe/no sabe",
la rubrica fracaso.

