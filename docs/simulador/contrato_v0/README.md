# El Simulador — contrato v0

Este directorio es la fuente de verdad inicial para **El Simulador**. No hereda diseno, botones, estructura ni rutas de la Itera anterior.

## Definicion canonica

El Simulador es un sistema de sprints donde un jefe de equipo entrena y mide si su gente puede usar IA con criterio en trabajo real, mediante casos vivos, un beat real de IA, re-simulacion para probar mejora y evidencia accionable para decidir que hacer.

## Loop central

```text
simulacion -> diagnostico -> practica -> re-simulacion -> evidencia -> accion del manager
```

Toda decision de producto o tecnologia debe mejorar una parte de ese loop. Si no mejora el loop, es accesorio.

## No es

- No es la Itera anterior con otro diseno.
- No es LMS.
- No es biblioteca de prompts.
- No es dashboard de completion.
- No es automatizador tipo n8n, Make o Zapier.
- No compite contra ChatGPT, Claude, Gemini, Codex, Veo o Nano Banana.

## Unidad vendible

La unidad vendible inicial es un **Sprint de equipo**:

- equipo concreto
- ventana de 30 dias
- set de casos vivos
- baseline y re-simulacion
- evidencia agregada
- recomendacion accionable para manager

## Unidad de experiencia

La unidad de experiencia es un **caso vivo**:

- situacion laboral realista
- tension de negocio
- datos o artefactos que manipular
- decisiones observables
- uno o dos turns con IA real provista por Itera
- evaluacion por rubrica versionada
- gaps detectados
- practica correctiva
- variante de re-simulacion

## Archivos

| Ruta | Proposito |
|---|---|
| `casos/` | Contratos y casos canonicos escritos por producto y consolidados por Codex. |
| `rubricas/` | Rubricas versionadas: dimensiones publicas, criterios internos. |
| `sprints/` | Sprint packages vendibles, no instancias de sprints corridos. |
| `schema/` | Modelo de datos y SQL candidate. No correr como migracion sin revision cruzada y aprobacion explicita. |
| `runtime/` | Flujo logico del motor, estados, eventos y evaluacion. |
| `coordinacion/` | Handoff vivo entre Codex y Claude. |

## Decisiones v0 cerradas

- ICP inicial: jefe de equipo, no CHRO.
- Entrada: sprint de equipo.
- Runtime: flow lineal multipasos con inputs controlados.
- IA real: maximo 2 turns por caso, provista por Itera en v0.
- Scoring: dimensiones publicas, criterios y pesos internos.
- Manager: ve agregados, gaps y risk events; no transcript individual completo en v0.
- Practice beat: al final de la sesion en v0.
- Re-simulacion: core, no opcional.
- Evidence: data tipada; reports son solo una vista.

## Estado actual

- Los ocho casos antiguos de Marketing/Growth fueron retirados del contrato activo.
- El contrato activo queda con un golden case: `sales_agent_followup_pipeline_v1`.
- El caso tiene primary + resim, 4 practice beats y rubrica `rubric_case_factory_v1@1.0.0`.
- El objetivo ya no es completar Marketing 30d; es validar el framework antes de fabricar 50 casos.
- CLI `npm run simulador:validate` debe pasar con 1 caso ready, 2 variantes y 4 practice beats.

## Pendiente inmediato

1. Revisar visualmente `/case-lab`.
2. Validar si el golden case representa la experiencia esperada.
3. Crear los golden cases N1 y N2 antes de producir el lote 50.
