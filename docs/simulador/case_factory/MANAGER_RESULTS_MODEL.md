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

## Preguntas que debe responder

1. Quien puede usar IA con autonomia en tareas individuales?
2. Quien puede automatizar procesos sin romper controles?
3. Quien puede trabajar con agentes sin sobredelegar?
4. En que criterio esta fallando el equipo: datos, validacion, juicio o impacto?
5. Que herramienta esta generando mas riesgo?
6. Que practica debe asignarse esta semana?
7. Que casos conviene correr despues?

## Reglas de recomendacion

- `pilotar`: bandas A/M, sin risk high, impacto claro.
- `entrenar`: gaps corregibles, risk medium o criterio M/B puntual.
- `pausar`: risk high, privacidad/compliance, agente sin controles o validacion baja.
- `escalar`: buen criterio consistente + impacto claro + sin eventos high.

