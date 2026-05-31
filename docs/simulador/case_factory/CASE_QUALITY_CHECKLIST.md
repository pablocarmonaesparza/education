# Case quality checklist

## Gate automatico

Un caso falla si:

- no declara `level`;
- no declara `freshness.type`;
- `freshness.type` es `current` o `hybrid` y falta `refresh_due_at`;
- no declara departamentos, roles, industrias y seniority;
- no declara herramientas;
- no declara `estimated_minutes`;
- no declara `output_spec`;
- no declara `failure_modes`;
- no declara pesos por criterio que sumen 100;
- no tiene al menos 2 risk events posibles;
- no tiene practice mapping;
- no tiene resimulation;
- no tiene judge prompt o `judge.prompt_ref`;
- revela criterios internos/risk_event names en texto visible al participante.

## Gate humano

Un reviewer debe contestar si:

1. Hay presion real y no teatral.
2. Las opciones tienen tradeoff real.
3. El participante puede equivocarse de forma plausible.
4. La re-sim mide transferencia, no memoria.
5. El caso refleja una herramienta vigente o un principio evergreen claro.
6. El manager podria tomar una accion con el resultado.
7. El caso no depende de IP de HBR/MIT/terceros.
8. El caso puede resolverse en el tiempo estimado.
9. El judge puede evaluar evidencia textual, no inferencias invisibles.
10. El caso ensena despues de medir, no antes.

## Gate narrativo

Este gate verifica que el caso este bien CONTADO, no solo bien armado. El Gate
automatico y el Gate humano revisan estructura, metadata y pedagogia, pero un
caso puede pasar ambos y aun asi comunicar pesimo: dos historias que se
contradicen, promesas que no se cumplen, datos que chocan entre slides o
personajes que aparecen una vez y desaparecen. Cada pregunta se contesta si o
no. Si una sola falla, el caso no pasa.

1. El escenario del primer slide (rol del participante, empresa y tipo de
   trabajo) se sostiene identico hasta el ultimo slide.
2. El emisor y el receptor de cada mensaje son coherentes con el rol del
   participante. El participante nunca se escribe a si mismo ni le vende a su
   propia jefa.
3. Es el mismo tipo de trabajo de principio a fin. Una campana de retencion no
   se vuelve de adquisicion a medio caso, ni al reves.
4. Todo lo que el manager pide al inicio se entrega dentro del caso, y todo lo
   que el caso entrega se habia anunciado antes. No hay promesa abierta ni
   entrega sorpresa.
5. Cada nombre, numero, empresa y fecha es consistente entre todos los slides.
6. Ningun dato del escenario contradice a otro. Ejemplo de contradiccion a
   evitar: el mensaje dice "tus clientes abren nuestros correos desde hace
   meses" mientras la metrica del propio caso muestra que la apertura cayo por
   debajo del minimo.
7. Cada frase de instruccion aporta informacion operativa real. No hay relleno,
   ni frase de coach motivacional, ni telegrama (frases truncadas sin sentido
   como "presupuesto sin tocar").
8. Cada personaje, documento o entidad que se menciona se vuelve a usar en el
   caso. No hay atrezzo que aparezca una vez y nunca regrese (por ejemplo un
   comite que se nombra al inicio y nunca se aclara a quien se le presenta).
9. El destinatario del mensaje que el participante construye es siempre el
   mismo y tiene sentido dentro de la historia.
10. La identidad de la herramienta de inteligencia artificial esta clara: que
    hace, que puede y que no puede el participante (por ejemplo, si elige modelo
    o no). No es una caja negra, y el caso no se contradice sobre sus propias
    reglas de uso de la herramienta.

## Distribucion minima antes del lote 50

Antes del lote 50 debe existir al menos un golden case aprobado. Hoy el golden
case activo es `sales_agent_followup_pipeline_v1`.

- 15 casos N1.
- 20 casos N2.
- 15 casos N3.
- Al menos 8 departamentos cubiertos.
- Al menos 8 industrias cubiertas.
- Al menos 20 herramientas registradas.
- 30% evergreen / 70% current por lote.
