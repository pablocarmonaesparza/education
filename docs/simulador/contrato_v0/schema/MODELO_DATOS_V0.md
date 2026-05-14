# Modelo de datos v0

Este modelo separa producto, ejecucion y evidencia. No es migracion aprobada; es contrato tecnico para derivar SQL y runtime.

## Separacion clave

| Capa | Tabla principal | Proposito |
|---|---|---|
| Template | `case_templates` | Define caso reusable. |
| Variant | `case_variants` | Render poblado con variables y datos sinteticos. |
| Session | `simulation_sessions` | Intento real de un usuario. |
| Events | `simulation_step_events` | Decision replay y telemetria granular. |
| Evidence | `evidence_snapshots` | Data tipada consumida por reports/dashboard. |

## Identidad y permisos

- `organizations`: empresa cliente.
- `teams`: unidad operativa compradora/usuaria.
- `users`: identidad de plataforma.
- `organization_memberships`: rol a nivel organizacion.
- `team_memberships`: rol a nivel equipo.

No usar tablas separadas para managers y empleados. Son roles sobre users.

## Producto vendible

- `sprint_packages`: catalogo de Sprints vendibles. Guarda `price_usd` solo como minimo operativo y `pricing_json` como fuente completa del pricing band tentativo.
- `sprint_package_cases`: casos incluidos en un paquete. Incluye `status`, `primary_variant_id`, `resim_variant_id`, `dimensions_emphasized`, `difficulty` y `tension` porque el SKU no solo lista casos: vende una progresion.
- `sprints`: instancia real corrida por un equipo.
- `assignments`: que caso/variante corre cada usuario dentro de un sprint. Distingue `assignment_kind` (`primary` | `resimulation`) y puede apuntar a `parent_assignment_id`.

## Evaluacion y evidencia

- `rubrics`, `rubric_dimensions`, `rubric_criteria`: rubrica versionada como data.
- `evaluation_runs`: corrida real de evaluacion con version de rubrica y juez.
- `human_review_queue`: cola operativa cuando el judge tiene baja confianza o aparece riesgo alto.
- `gap_definitions`: gaps posibles de un caso.
- `practice_beats`: practica correctiva.
- `evidence_snapshots`: readiness, risk, replay, transfer delta, recommendation.
- `manager_recommendations`: accion sugerida al manager.
- `reports`: vista/export, no fuente primaria.

## Riesgo y auditoria

- `behavior_events`: telemetria general.
- `risk_events`: eventos sensibles auditables. Incluye `dimension_key` explicito; si falta, el runtime puede inferir fallback, pero el contrato correcto es guardarlo.
- `audit_log`: cambios sensibles append-only.

## Convenciones tecnicas

- `case_steps.step_key` usa formato estable `step_<ordinal o id>`. Ejemplo: YAML `id: 1` se persiste como `step_1`.
- Las referencias por slug en YAML (`primary_variant_ref`, `resim_variant_ref`) se resuelven a UUID durante seed/import. El schema guarda UUIDs; los archivos de contrato conservan slugs legibles para revision humana.
- `sprint_package_cases` vive despues de `case_variants` en SQL porque referencia variantes primaria y de re-simulacion.
- La validacion local debe garantizar que todo practice beat usado por un caso exista y este en el catalogo del Sprint.

## Principios

1. Evidence no es report.
2. Risk event no es behavior event.
3. Rubrica no vive en codigo.
4. Session no modifica template ni variant.
5. Re-simulacion usa otra variant conectada a la primera.
6. Datos de ejemplo en variants deben marcarse como sinteticos.
7. Roles son aditivos en v0; permisos se calculan como union de roles.
8. Export de certificado es report tipado con `user_id`, no reporte agregado del manager.
