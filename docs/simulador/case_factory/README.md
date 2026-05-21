# Case Factory — indice operativo

Este folder es la fuente de verdad para fabricar casos del simulador antes de
producir el lote de 50. La regla es simple: ningun caso nuevo entra a Supabase
si no pasa por este sistema.

## Artefactos

| Archivo | Uso |
|---|---|
| `RESEARCH_BASIS.md` | Fundamento externo y decisiones de producto derivadas. |
| `CASE_HIG.md` | Guia estilo HIG: que esperamos de un caso Itera. |
| `CASE_TAXONOMY.yaml` | Niveles, departamentos, roles, industrias, criterios, riesgos y herramientas. |
| `CASE_SCHEMA.yaml` | Forma canonica que debe tener cada caso nuevo. |
| `CASE_CREATION_SKILL.md` | Proceso operativo para crear un caso de principio a fin. |
| `CASE_RUBRIC_V1.md` | Criterios evaluables y bandas para manager. |
| `CASE_QUALITY_CHECKLIST.md` | Gate manual y automatico antes de publicar. |
| `TOOL_REGISTRY.yaml` | Registro de herramientas actuales, vigencia y frecuencia de revision. |
| `ROLE_INDUSTRY_TAGS.yaml` | Tags validos para redireccion por rol, carrera, industria y seniority. |
| `MANAGER_RESULTS_MODEL.md` | Como se traduce un caso a progreso visible para managers. |
| `BACKEND_REQUIREMENTS.md` | Campos y tablas que el backend debe soportar. |
| `FACTORY_WORKFLOW.md` | Proceso repetible para crear 50, luego 100, luego mas casos. |

## Decision central

No se crean los 50 casos todavia. Primero se cierra el framework, se validan 3
golden cases (N1, N2, N3) y luego se dispara la fabrica.

## Perfiles activos

Por decision de producto, la primera version de la fabrica se limita a 6
profile packs:

1. Marketing / Growth
2. Sales / RevOps
3. Customer Success / Support
4. Operations / Automation
5. Finance / FP&A
6. Legal / Compliance / Privacy

Product, People Ops, Data/BI y Chief of Staff quedan como expansion posterior,
no como catalogo activo.

## Estado actual

Por decision de Pablo, los 8 casos antiguos de Marketing/Growth fueron retirados
del contrato activo. El catalogo activo queda con un solo golden case:

`docs/simulador/contrato_v0/casos/sales_agent_followup_pipeline_v1.yaml`

Ese caso muestra el framework completo en N3: tabla de datos, brief de agente,
matriz de permisos, revision de logs, decision con tradeoff, respuesta ejecutiva,
practice beats y re-simulacion.

## Pagina de revision

Ruta local/publica sin subscripcion:

`/case-lab`

No debe linkearse desde la landing. Es un laboratorio de producto para revisar
estructura, taxonomia, criterios y cobertura antes de publicar casos.

## Pagina de ejercicios

Ruta local/publica sin subscripcion:

`/exercise-lab`

Muestra el catalogo visual de bloques de ejercicio. Sirve para decidir que
interacciones entran al contrato antes de escribir `EXERCISE_BLOCK_CATALOG.yaml`.
