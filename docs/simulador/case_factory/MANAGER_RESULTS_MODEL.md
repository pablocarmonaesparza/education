# Manager results model

El manager no necesita saber si el empleado "aprendio IA". Necesita saber si
puede confiarle trabajo real con IA, en que nivel y bajo que controles.

## Resultado por persona

Cada caso debe producir:

- banda por criterio: A / M / B;
- banda global;
- nivel evaluado: N1 / N2 / N3;
- herramientas usadas;
- risk events detectados;
- evidencia textual breve;
- practice beats recomendados;
- elegibilidad para re-sim;
- metricas de tiempo cuando el caso tiene timer;
- recomendacion: pilotar, entrenar, pausar o escalar.

## Resultado por equipo

El dashboard manager debe poder agrupar:

- readiness por nivel;
- readiness por criterio;
- gaps recurrentes;
- herramientas con mayor riesgo;
- departamentos/roles con mayor avance;
- personas listas para pilotos;
- personas que requieren practica antes de ampliar uso;
- riesgos que requieren politica o governance.
- velocidad con control: quien decide rapido sin elevar riesgo.

## Metricas de tiempo

El timer no crea una dimension nueva. Contextualiza impacto y juicio.

Metricas:

- `total_elapsed_seconds`: cuanto tardo la sesion completa.
- `step_elapsed_seconds`: cuanto tardo cada seccion.
- `time_to_first_action_seconds`: cuanto tardo en pasar de leer a actuar.
- `review_time_ratio`: porcentaje del tiempo usado en revision/validacion.
- `overtime_seconds`: cuanto se paso del timer.
- `submit_after_warning`: si entrego despues de una advertencia de tiempo.

Lectura manager:

- rapido + sin riesgo high + buen impacto = candidato a piloto;
- rapido + riesgo high = sobreconfianza / pausar o entrenar;
- lento + buena validacion = necesita practica de fluidez, no necesariamente
  problema de criterio;
- lento + mala validacion = no listo para autonomia.

## Preguntas que debe responder

1. Quien puede usar IA con autonomia en tareas individuales?
2. Quien puede automatizar procesos sin romper controles?
3. Quien puede trabajar con agentes sin sobredelegar?
4. En que criterio esta fallando el equipo: datos, validacion, juicio o impacto?
5. Que herramienta esta generando mas riesgo?
6. Que practica debe asignarse esta semana?
7. Que casos conviene correr despues?
8. Quien mantiene calidad bajo presion temporal?

## Reglas de recomendacion

- `pilotar`: bandas A/M, sin risk high, impacto claro.
- `entrenar`: gaps corregibles, risk medium o criterio M/B puntual.
- `pausar`: risk high, privacidad/compliance, agente sin controles o validacion baja.
- `escalar`: buen criterio consistente + impacto claro + sin eventos high.
