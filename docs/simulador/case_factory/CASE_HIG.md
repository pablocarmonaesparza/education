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

## Claridad de instrucciones

El caso debe dar informacion accionable de la situacion, no explicar el sistema.

Reglas:

- No escribir frases defensivas como "el caso ya esta definido" o "tu trabajo no
  es configurar". Eso pertenece al contrato interno, no al usuario.
- Cada pantalla de contexto debe responder una pregunta concreta: quien pide,
  que necesita, con que datos, para que decision y bajo que presion.
- Si una seccion tiene varias pantallas internas, el boton dice `Continuar`
  hasta que realmente cambie de seccion. Solo al final puede decir `Ir a datos`,
  `Ir a IA`, etc.
- Evitar anglicismos si existe una forma clara en espanol: usar "cuentas
  grandes", "revision humana", "afirmacion sin fuente", "ingreso anual estimado".
- El stakeholder ficticio puede presionar, pero su frase debe aclarar el
  trabajo. No usar frases vagas como "confio en tu criterio" si no agregan
  informacion.

## Reglas UI para ejercicios dentro de casos

El catalogo oficial vive en `EXERCISE_BLOCK_CATALOG.yaml`.

Reglas:

- El participante no elige el contexto, stakeholder, presion ni resultado
  esperado. Eso lo controla Itera.
- Ningun panel de respuesta, brief, memo, output o recomendacion puede venir
  prellenado. Las respuestas arrancan vacias y solo aparecen despues de una
  accion explicita del participante.
- El timer solo aparece en casos donde `time_pressure` lo justifica. Puede
  mostrarse como opcion de practica (`con timer` / `sin timer`) cuando el flujo
  sea demo o entrenamiento, pero no cambia la rubrica ni el contenido del caso.
- Usar botones rectangulares redondeados con minimo 44 px de alto. Evitar
  capsulas/pills para acciones principales o segmentadas, salvo que se trate de
  tags no interactivos.
- Los sliders solo se usan cuando la persona entiende naturalmente una prioridad
  continua. Valores en pasos de 10, nunca porcentajes finos como 37% o 86%.
- Cada ejercicio debe emitir evidencia: texto, decision, marca, permiso, orden,
  memo, log flag o accion elegida.
- La pagina `/exercise-lab` es laboratorio de tipos de ejercicio, no runtime de
  un caso completo.
- Cada patron debe caber en viewport de laptop (`1024x768`) antes de marcarlo
  como listo. Si no cabe, se redisenia con disclosure progresivo.

## Catalogo canonico de ejercicios

Estos son los bloques que Codex puede usar al crear casos. No se inventan
interacciones nuevas sin actualizar primero `EXERCISE_BLOCK_CATALOG.yaml`.

### 01A — Textfield de IA libre

**Uso:** cuando el caso quiere medir como la persona estructura una peticion sin
andamiaje.

**Mide:** contexto, ejecucion con IA, impacto.

**Personalizar:** modelo disponible, adjuntos permitidos, voz, placeholder,
artefactos que se pueden subir.

**Evitar:** si el objetivo es medir criterio granular; para eso usar 01B.

### 01B — Textfield de IA guiado

**Uso:** cuando el caso quiere medir decisiones discretas que construyen un
prompt o encargo: objetivo, audiencia, limites, modelo o prioridades.

**Mide:** contexto, datos, ejecucion con IA, juicio.

**Reglas:** inputs a la izquierda, respuestas a la derecha, textfield de IA
read-only cuando el objetivo es ensenar razonamiento. El boton de crear prompt
vive en Inputs y seleccion, no en Respuestas. Las respuestas arrancan vacias.

**Personalizar:** opciones de objetivo, audiencia, limites, modelo, sliders en
pasos de 10 para inteligencia/seguridad/costo.

**Evitar:** si las opciones serian obvias o caricaturescas.

### 02 — Tabla editable de datos

**Uso:** cuando el participante debe decidir que datos entran, se anonimizan, se
agregan o se excluyen antes de usar IA.

**Mide:** datos, juicio.

**Personalizar:** filas de datos, ejemplos, acciones permitidas, sensibilidad
del campo, consecuencias.

**Evitar:** sliders de sensibilidad. La decision debe ser concreta, no
porcentual.

### 03 — Matriz de permisos

**Uso:** cuando el caso requiere definir que puede hacer el sistema solo, que
requiere revision y que debe bloquearse.

**Mide:** datos, ejecucion con IA, juicio.

**Personalizar:** acciones del sistema, permisos, nivel de autonomia, severidad
de riesgos.

**Evitar:** tareas N1 simples donde no existe automatizacion real.

### 04 — Revision de output

**Uso:** cuando el participante debe leer una salida de IA y marcar errores,
datos sensibles, claims sin fuente, drift o riesgos.

**Mide:** validacion, juicio.

**Personalizar:** lineas marcables, severidad, correccion esperada, follow-up
con textfield de IA.

**Evitar:** outputs artificialmente malos. Deben parecer plausibles.

### 05 — Comparacion de respuestas

**Uso:** cuando hay dos o tres salidas plausibles y el participante debe elegir
la mejor para el negocio.

**Mide:** validacion, impacto.

**Personalizar:** numero de outputs, criterios visibles, tradeoffs, justificacion
corta.

**Evitar:** cuando una opcion es obviamente absurda.

### 06 — Workflow builder

**Uso:** cuando el caso mide si la persona entiende un flujo de trabajo con IA,
handoffs, checkpoints y revision humana.

**Mide:** ejecucion con IA, validacion, impacto.

**Personalizar:** pasos activables, orden, herramientas, checkpoints, punto de
entrega.

**Evitar:** si el caso solo requiere redactar mejor un prompt.

### 07 — Brief para agente

**Uso:** cuando el caso N3 requiere delegar trabajo a un agente sin perder
control.

**Mide:** ejecucion con IA, juicio, datos.

**Reglas:** flujo progresivo, una decision visible a la vez. Campos canonicos:
Tarea, Acceso permitido, Puede hacer, Debe detenerse si. El brief arranca vacio
y se llena solo con selecciones.

**Personalizar:** tarea, acceso, accion maxima, condicion de paro, permisos,
fallback, logs y costo.

**Evitar:** hacerlo demasiado especifico a Marketing, Sales u otro perfil. Debe
ser portable entre departamentos.

### 08 — Revision de logs

**Uso:** cuando el participante supervisa una corrida de automatizacion o agente
y debe detectar donde se rompe el control.

**Mide:** validacion, juicio.

**Personalizar:** timeline, eventos normales, eventos de riesgo, escalamiento,
severidad.

**Evitar:** logs demasiado tecnicos si el perfil no es tecnico.

### 09 — Dashboard / pivot

**Uso:** cuando el participante debe leer senales de negocio, filtrar datos y
llevar un takeaway al lider.

**Mide:** impacto, contexto.

**Personalizar:** metricas, tablas, filtros, cohortes, comparativos, caveats.

**Evitar:** dashboards decorativos que no fuerzan decision.

### 11 — Decision + memo

**Uso:** cierre de caso. El participante elige una accion y explica por que.

**Mide:** juicio, impacto, contexto.

**Reglas:** ninguna decision preseleccionada y memo vacio por defecto. Las
opciones deben tener ventajas y costos reales.

**Personalizar:** opciones de decision, consecuencias, longitud del memo,
audiencia del memo.

**Evitar:** pedir comunicacion sin decision operativa. Si solo mide redaccion,
no sirve como cierre de simulacion.

## Como elegir ejercicios para un caso

- N1 normalmente combina 01A o 01B + 02 o 04 + 11.
- N2 normalmente combina 01B + 03 o 06 + 04 u 09 + 11.
- N3 normalmente combina 07 + 03 + 08 + 09 + 11.
- Un caso puede tener muchos micro-pasos, pero cada paso debe emitir evidencia
  medible.
- La mezcla recomendada sigue siendo 60/40 o 70/30 a favor de ejercicios
  nativos de IA. Los ejercicios tradicionales apoyan, no reemplazan, el uso de
  IA.

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

## Brief de asignacion para manager

Cada caso debe incluir un parrafo breve para el manager antes de asignarlo. No
es copy de venta ni explicacion de la rubrica; es una guia para entender que
tarea real esta simulando, a que empleados conviene mandarlo y que senal
obtendra.

Formato:

`Asigna este caso cuando quieras saber si una persona puede <tarea laboral con
IA> en <situacion de presion>. Es especialmente util para <roles/perfiles> que
ya enfrentan <artefactos/herramientas>. El resultado te ayudara a decidir si
conviene <pilotar / entrenar / pausar / escalar> porque muestra <senal
observable>.`

Reglas:

- 60-90 palabras maximo.
- Escrito para managers, no para participantes.
- Habla de tareas, riesgos y decisiones; no de dimensiones internas, pesos ni
  risk events.
- Debe sonar como "que trabajo le puedo mandar a mi equipo", no como temario.
- Si el brief no ayuda al manager a elegir a quien asignarlo, el caso falla.

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
