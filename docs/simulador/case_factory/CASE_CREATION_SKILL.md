# Case Creation Skill — draft operativo

> Estado: draft operativo v0.2. Este skill ya captura el proceso acordado para
> fabricar casos Itera y debe ejecutarse contra el catalogo formal de
> `exercise_blocks`.

## Cuando usar este skill

Usalo cada vez que Pablo pida crear, adaptar o evaluar un caso nuevo del
simulador.

No empieces escribiendo YAML. Primero construye evidencia, escenario, ejercicios
y senal manager.

## Objetivo

Crear casos que midan criterio operativo con IA en trabajo real.

Un caso Itera no es una leccion, quiz ni prompt suelto. Es una simulacion que
produce evidencia para que un manager decida si una persona puede:

- pilotar mas autonomia con IA;
- entrenar una brecha concreta;
- pausar un uso riesgoso;
- escalar como referente interno.

## Inputs minimos

Si Pablo no da todos los inputs, inferir conservadoramente y documentar la
suposicion.

1. `level`: N1 fundamentos, N2 workflow o N3 agentes.
2. `profile_pack`: uno de los 6 activos:
   - marketing_growth
   - sales_revops
   - customer_success_support
   - operations_automation
   - finance_fpa
   - legal_compliance_privacy
3. `moment_of_work`: momento laboral concreto.
4. `manager_signal`: pregunta que el manager necesita contestar.
5. `manager_assignment_brief`: parrafo breve que explica cuando asignar el caso.
6. `tools_and_data`: herramientas, datos y artefactos reales.
7. `risks_and_controls`: riesgos posibles y controles esperados.
8. `time_pressure`: opcional. Default `no_timer`.

## Proceso obligatorio

### 1. Brief del caso

Define el caso en lenguaje simple.

Debe incluir:

- nivel;
- perfil;
- momento de trabajo;
- senal para el manager;
- brief de asignacion para manager;
- herramientas y datos;
- riesgos y controles;
- si aplica timer o no.

Regla: si no puedes escribir el momento de trabajo en una escena concreta y un
manager no podria entender cuando asignarlo, el caso todavia no existe.

### 2. Research dossier profundo

Investiga antes de escribir.

El dossier debe producir evidencia, no solo links.

Debe cubrir:

- lanzamientos recientes de herramientas;
- workflows reales del perfil;
- problemas o fallas reales;
- contradiction search;
- evidence ledger;
- scenario candidates;
- scenario scoring;
- refresh SLA.

Regla 30/70:

- 30% evergreen: principios durables como privacidad, validacion, minimizacion,
  approval gates y escalamiento.
- 70% current: herramientas, lanzamientos, integraciones y workflows vigentes.

No uses solo marketing de vendors. Contrasta con problemas, limitaciones,
riesgos, docs oficiales y reportes externos.

### 3. Seleccionar recipe de exercise blocks

No inventes interacciones desde cero por caso.

Selecciona bloques del catalogo cerrado en
`docs/simulador/case_factory/EXERCISE_BLOCK_CATALOG.yaml`.

Bloques activos v0.2:

- `ai_textfield_free`;
- `ai_textfield_guided`;
- `data_table_triage`;
- `permission_matrix`;
- `ai_output_review`;
- `ai_comparison`;
- `workflow_builder`;
- `agent_brief_builder`;
- `run_log_review`;
- `dashboard_pivot`;
- `tradeoff_decision_memo`.

Preferencia de producto:

- 60/40 o 70/30 a favor de ejercicios nativos de IA;
- ejercicios tradicionales como complemento, no columna vertebral;
- cada bloque debe emitir evidencia medible.

Un caso puede tener muchos micro-pasos o interacciones. Lo importante es que
tenga momentos evaluativos claros y no sea ruido.

Reglas de presentacion:

- No convertir el caso en una configuracion editable por el participante.
- Contexto, datos, presion, stakeholder y resultado esperado los define Itera.
- Botones: rectangulos redondeados, labels claros y verbos accionables.
- Sliders: solo si representan una prioridad continua entendible; pasos de 10.
- Timer: solo si `time_pressure` lo justifica; no todos los casos llevan timer.
- Copy: dar informacion laboral concreta antes de pedir respuesta.
- Estados vacios: ningun brief, respuesta, memo, output, decision o prompt
  generado puede venir prellenado antes de una accion explicita del
  participante.

### 4. Disenar el caso en 5 secciones

Antes de escribir un solo slide, fija la BIBLIA DE CONTINUIDAD: una lista corta
de hechos canonicos que TODOS los slides van a respetar. Sin ella el caso se
construye por partes y se cuelan dos historias o datos que se contradicen (es la
causa raiz documentada en DIAGNOSTICO_COMUNICACION_v1.md). La biblia incluye, como
minimo:

- Empresa (una sola) y el rol del participante.
- Personas con su rol exacto y su funcion (quien asigna, quien revisa, quien
  recibe). Define desde aqui quien le escribe a quien; el participante nunca se
  escribe a si mismo ni le vende a su jefa.
- El destinatario del mensaje que el participante construye (siempre el mismo).
- La base de datos: sus campos y un set consistente de filas, con fechas
  ABSOLUTAS (nunca "hace X dias", que termina contradiciendose entre slides).
- Las promesas que el manager hace al inicio, para cerrarlas TODAS en el caso.
- La identidad de la herramienta de inteligencia artificial (que hace, que no,
  si se elige o es instrumento dado) y mantenerla coherente.

Ningun slide inventa un hecho fuera de la biblia. Esto es el lado PROACTIVO de
lo que el Gate narrativo (paso 9 y CASE_QUALITY_CHECKLIST) verifica de forma
reactiva: la biblia evita la ruptura, el gate la caza si se coló.

Estructura canonica (las secciones antes llamadas Decision y Respuesta se
consolidaron en Cierre; el modelo vigente es de 5 secciones, ver
CASE_ASSEMBLY_SCHEMA.yaml). No confundir con las 6 dimensiones de evaluacion,
que son otra cosa: contexto, datos, ejecucion_ia, validacion, juicio e impacto.

1. Contexto: que esta pasando y por que importa.
2. Datos: que puede o no puede usar.
3. IA: que le pide, configura o delega.
4. Revision: detecta errores, riesgos, afirmaciones sin fuente, drift o fallas.
5. Cierre: elige una accion con consecuencias y la explica al manager (que haria
   y por que).

Las secciones pueden contener mas de una interaccion si el caso lo amerita.

### 5. Mapear evaluacion

Cada paso debe emitir evidencia hacia las 6 dimensiones:

- contexto;
- datos;
- ejecucion_ia;
- validacion;
- juicio;
- impacto.

Separar siempre:

- habilidad: que tan bien decide;
- risk event: que incidente o riesgo aparece.

No mezclar "riesgo" como dimension. Riesgo es evento observable.

### 6. Crear variante de transferencia

Nunca publicar solo primary.

Cada caso debe tener:

- `primary`: diagnostico inicial;
- `resimulation`: mismo arquetipo, distinto contexto, empresa, datos,
  stakeholder o herramienta;
- misma rubrica y pesos entre primary y resim.

La resim mide transferencia, no memoria.

Ejemplo:

- primary: agente de follow-up comercial para SQLs.
- gap: permite envio externo sin approval gate.
- practice: mini-ejercicio de limites de autonomia.
- resim: agente de soporte que quiere cerrar tickets automaticamente.

Mismo principio, contexto distinto.

### 7. Crear practica correctiva personalizada

La practica no debe ser curso generico.

Debe tener dos capas:

1. `practice_beat` preestablecido:
   - objetivo;
   - ejercicio;
   - rubrica;
   - criterios de completion.
2. personalizacion IA:
   - usa evidencia de la sesion;
   - explica el gap;
   - adapta el ejemplo;
   - pide repetir una parte corta del comportamiento.

Regla: la IA personaliza dentro de un marco cerrado. No inventa la pedagogia
desde cero.

### 8. Validar con Case Critic

Antes de publicar, correr una critica estructural asistida por IA y revision
humana.

El Case Critic revisa:

- si mide criterio o solo conocimiento;
- si los ejercicios estan ligados a metricas;
- si hay spoilers de rubrica;
- si el brief de asignacion ayuda al manager a elegir la tarea correcta;
- si el manager recibe senal accionable;
- si los riesgos son observables;
- si primary y resim miden transferencia;
- si el caso esta demasiado facil o dificil;
- si la herramienta vigente esta bien usada;
- si depende demasiado de hype;
- si faltan datos, presion, tradeoff o consecuencia.

IA propone cambios. Itera controla contrato, rubrica y publicacion.

### 9. Lectura corrida final y autocorreccion de consistencia

Este es el paso que faltaba en el proceso. El caso se construye slide por slide
y optimizando cada slide para pasar reglas estructurales. Sin una lectura de
conjunto, las rupturas de historia no se ven: cada pieza parece correcta por
separado, pero juntas cuentan dos historias que se contradicen, dejan promesas
sin cumplir o suenan a telegrama. Este paso es obligatorio antes de marcar
cualquier caso como listo.

Procedimiento:

1. Lee el caso completo de principio a fin, como lo vive el empleado, de un
   tiron y sin pausas tecnicas. No lo leas como autor que revisa campos; leelo
   como la persona que recibe el brief y avanza slide por slide.
2. Mientras lees, anota toda ruptura, usando el Gate narrativo de
   CASE_QUALITY_CHECKLIST.md como guia. Anota tres tipos de ruptura:
   - ruptura de historia: el escenario, el tipo de trabajo, el emisor o el
     receptor cambian a mitad de caso;
   - ruptura de voz: frases de relleno, coach o telegrama, jerga, o redaccion
     que no suena a persona real;
   - promesa no cumplida: algo que el manager pide al inicio y el caso no
     entrega, o algo que el caso entrega sin haberlo anunciado.
3. Corrige todo lo anotado y vuelve a leer el caso completo otra vez. Haz
   multiples pasadas. Cada correccion puede introducir una ruptura nueva, asi
   que no basta una sola revision.
4. Verifica la consistencia entre el contenido del archivo TSX (la vitrina) y
   el YAML del caso, campo por campo. Ambos deben estar 1:1: mismo texto, mismos
   nombres, mismos numeros, mismos slides.
5. Repite el ciclo de leer, anotar y corregir hasta que el caso fluya como una
   sola historia coherente, sin ninguna ruptura pendiente.
6. Solo despues de que la lectura corrida fluya sin rupturas, marca el caso como
   listo y pasa al Manager test.

### 10. Manager test

Antes de entrar al catalogo, generar reporte sintetico con 2-3 perfiles:

- persona A: lo hizo bien;
- persona B: gap corregible;
- persona C: riesgo alto.

Pregunta final:

`Puede un manager entender en 30 segundos que hacer con cada persona?`

Si no, falla el caso o falla el reporte.

## Outputs esperados

Por cada caso nuevo:

- research dossier;
- evidence ledger;
- scenario scoring;
- selected scenario;
- manager assignment brief;
- primary case YAML;
- primary variant YAML;
- resim variant YAML;
- practice beats asociados;
- judge prompt ref;
- synthetic manager report;
- validation notes.

## Reglas de paro

Deten el caso y pide decision si:

- el research no encuentra workflow real;
- el escenario depende solo de hype de vendor;
- no hay senal clara para manager;
- no hay riesgo observable;
- no se puede construir resim sin copiar el caso;
- el exercise block necesario no existe todavia;
- el caso expone datos reales o no sinteticos;
- la herramienta current no puede verificarse con fuente razonable.

## Validacion tecnica

Antes de cerrar:

```bash
npm run simulador:validate-case-yaml
npm run simulador:validate
npm run simulador:case-factory
npm run check:simulador
```

Si se toca UI o Case Lab:

```bash
bun run build
```

## Mantenimiento del catalogo

Antes de crear un bloque nuevo, actualizar con Pablo
`EXERCISE_BLOCK_CATALOG.yaml` y revisar:

- ids canonicos;
- familias;
- niveles aplicables;
- perfiles aplicables;
- dimensiones que mide;
- outputs que emite;
- risk events detectables;
- patron UI;
- metodo de scoring;
- criterios de completion.

Si el bloque necesario no existe en el catalogo, no se inventa dentro del caso:
se detiene, se disena el bloque en `/exercise-lab`, se documenta y entonces se
usa.
