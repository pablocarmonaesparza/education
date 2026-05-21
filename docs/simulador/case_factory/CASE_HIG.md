# Case HIG — reglas para casos Itera

## Principio

Un buen caso Itera mide criterio operativo bajo presion. No mide si la persona
"sabe IA"; mide si puede usar IA para producir trabajo mejor, mas seguro y mas
util para el negocio.

## Anatomia obligatoria

1. **Situacion viva:** hay un rol, una empresa, un stakeholder y una presion.
2. **Decision real:** el participante debe elegir, no solo opinar.
3. **Datos o artefactos:** CRM, tabla, brief, transcripcion, reporte, ticket,
   documento, correo, dashboard o herramienta concreta.
4. **Uso de IA contextual:** prompt, workflow, automatizacion o agente segun el
   nivel.
5. **Output revisable:** el participante entrega algo observable.
6. **Riesgo visible:** privacidad, exactitud, autoridad, compliance,
   reputacion, bias, costo, escalamiento o calidad.
7. **Resultado manager:** el caso produce una senal accionable para el manager.
8. **Re-sim posible:** existe una variante que mide transferencia, no memoria.

## Momento de trabajo

El caso debe partir de un momento laboral concreto, no de un tema abstracto.

Debe responder:

- que acaba de pasar;
- quien lo pidio;
- que artefacto tiene enfrente la persona;
- que debe entregar;
- que restriccion existe;
- que decision no puede evitar.

## Senal para el manager

Cada caso debe declarar la pregunta operativa que el reporte contestara para el
manager.

Formato recomendado:

`Puede esta persona hacer <trabajo con IA> sin causar <riesgo critico>?`

Ejemplo:

`Puede delegar follow-up comercial a un agente sin perder control, privacidad ni
confianza del cliente?`

## Presion temporal

Algunos casos deben incluir timer. El timer mide criterio bajo urgencia, no
velocidad vacia.

Modos permitidos:

- `no_timer`: tareas donde importa profundidad mas que urgencia.
- `soft_deadline`: deadline visible; se puede entregar tarde, pero queda
  registrado.
- `fixed_timer`: tiempo total fijo para todo el caso.
- `step_timer`: tiempo por seccion cuando triage, revision y decision tienen
  ventanas distintas.

Metricas minimas:

- `total_elapsed_seconds`
- `step_elapsed_seconds`
- `time_to_first_action_seconds`
- `review_time_ratio`
- `overtime_seconds`

Regla: una decision rapida con `risk_event high` no puede mejorar la
recomendacion manager. Velocidad solo cuenta cuando privacidad, validacion y
juicio estan controlados.

## Niveles

### N1 — Fundamentos / Prompt Engineering

Evalua si la persona sabe encuadrar bien una tarea individual con IA.

Debe incluir:
- contexto claro;
- instrucciones al modelo;
- datos seguros;
- validacion basica;
- decision final simple.

No debe incluir:
- agentes autonomos;
- integraciones complejas;
- automatizaciones multi-step.

### N2 — Workflow / Automatiza tu trabajo

Evalua si la persona puede insertar IA en un flujo real.

Debe incluir:
- handoffs entre herramientas;
- criterios de calidad;
- automatizacion parcial;
- revision humana;
- impacto de tiempo/calidad.

No debe ser solo "haz un prompt mejor".

### N3 — Agentes / Produccion y optimizacion

Evalua si la persona sabe delegar, supervisar y optimizar sistemas agenticos.

Debe incluir:
- autonomia limitada;
- permisos;
- monitoreo;
- fallback humano;
- costos;
- logs/evidencia;
- criterio de pausar o escalar.

No debe vender magia ni autonomia sin controles.

## Frescura

Cada caso declara:
- `freshness_type: evergreen | current | hybrid`
- `evergreen_weight`
- `current_weight`
- `tool_refs`
- `decay_signal`
- `last_verified_at`
- `refresh_due_at`

Regla de portafolio: 30% evergreen / 70% current. Un caso current sin fecha de
revision no puede publicarse.

## Anti-patrones

- Caso sin presion.
- Caso que solo pregunta "que prompt usarias".
- Caso donde todas las opciones malas son caricaturas.
- Caso que revela la rubrica.
- Caso con herramienta de moda sin utilidad real.
- Caso que no produce evidencia para manager.
- Caso que no se puede re-simular.
- Caso que confunde conocimiento teorico con comportamiento en trabajo.

## Test final

Si un manager no puede responder "que hago con esta persona/equipo manana" al
leer el resultado, el caso no esta listo.

## Golden case activo

El ejemplo canonico actual es `sales_agent_followup_pipeline_v1`.

Muestra:

- nivel N3;
- herramientas actuales;
- 30/70 evergreen/current;
- tipos de ejercicio variados;
- manager outcome explicito;
- criterios de 6 dimensiones;
- risk events;
- practice beats;
- variante resim.
