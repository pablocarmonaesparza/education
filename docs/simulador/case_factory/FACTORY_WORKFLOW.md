# Factory workflow

## Antes de crear el lote 50

1. Cerrar `CASE_HIG.md`.
2. Cerrar `CASE_TAXONOMY.yaml`.
3. Cerrar `CASE_SCHEMA.yaml`.
4. Cerrar `CASE_RUBRIC_V1.md`.
5. Crear golden cases:
   - hoy existe 1 N3 agentes: `sales_agent_followup_pipeline_v1`;
   - faltan 1 N1 fundamentos y 1 N2 workflow antes del lote 50.
6. Correr validator automatico.
7. Revisar manualmente contra checklist.
8. Importar a staging.
9. Resolver con 3-5 usuarios internos/externos.
10. Ajustar pesos, judge prompts y tiempos estimados.

## Para producir cada caso

1. Elegir nivel.
2. Elegir departamento, rol, industria y seniority.
3. Elegir herramienta actual y principio evergreen.
4. Definir manager outcome y brief de asignacion.
5. Definir situacion y presion.
6. Definir artefactos/datos.
7. Definir output esperado.
8. Definir failure modes.
9. Definir risk events.
10. Definir pesos por criterio.
11. Escribir primary.
12. Escribir resim.
13. Mapear practice beats.
14. Escribir judge prompt.
15. Correr validator.
16. Hacer review humano.
17. Importar a DB.
18. Probar en runtime.

## Para mantener casos vivos

- Revision semanal de `case_refresh_queue`.
- Revision mensual de herramientas current.
- Deprecar casos que dependan de features removidas.
- Recalibrar si mas de 80% pasa N3 en primer intento.
- Recalibrar si el tiempo real excede 1.5x el estimado.
