# sessions/ — bitácora de sesiones del field test

> directorio para los outputs raw de las 5 sesiones del grupo A.
>
> regla: una carpeta por participante (`P001/`, `P002/`, ... `P005/`)
> con los archivos YAML de captura.

## estructura esperada por participante

```
sessions/P001/
├── metadata.yaml              # fecha, operador, modelo usado, duración
├── responses.yaml             # respuestas literales del participante (estructura definida en 2_response_form.md)
├── session_log.yaml           # timestamps + clarificaciones + eventos del operador
├── llm_beat_log.yaml          # prompt + respuesta(s) del LLM + followup
├── interview_notes.yaml       # respuestas literales a las 8 preguntas post-test
├── evaluator_1.yaml           # calificación de humano1 con rúbrica ciega
├── evaluator_2.yaml           # calificación de humano2 con rúbrica ciega
├── evaluator_3.yaml           # solo si se invocó 3er evaluador como tie-breaker
├── judge.yaml                 # output del LLM-judge (corre DESPUÉS de los humanos)
└── calibration.yaml           # consolidación humano1 × humano2 × judge
```

## reglas

1. los archivos `evaluator_*.yaml` son producidos por los 2 (o 3)
   consultores externos con acceso de solo lectura a `responses.yaml`
   (no acceso a `session_log.yaml`, `judge.yaml`, ni a otros evaluadores)

2. el judge corre cuando los 2 humanos ya entregaron — orden no-negociable
   (regla R3 del README de fase 0)

3. todos los datos son sintéticos a nivel caso (nombres, empresas,
   etc.). las respuestas del participante son reales pero anonimizadas
   en cualquier reporte posterior.

4. retención: archivos preservados anónimos 90 días post-sesión; luego
   se eliminan grabaciones y se conserva solo evidencia agregada
   (calibration.yaml + interview_notes.yaml con nombres reemplazados
   por IDs)

5. NO commitear datos de identificación personal real de
   participantes. el `name` real del participante vive solo en
   `outreach_tracker.yaml` (no commiteado a producción) o en notas
   externas; en este directorio se usa solo `participant_id` (P001,
   P002, ...).

## archivos agregados al cierre de fase 0

cuando se completan las 5 sesiones:

- `_grupo_a_summary.md` — resumen direccional de las 8 preguntas post-test
- `_calibration_master.md` — tabla consolidada de calibración humano-humano + humano-judge (estructura en `6_calibration_sheet.md`)
- `_analysis_v1.md` — análisis de las 3 validez (face/construct/buyer) y aplicación de `9_decision_matrix.md`
- `_decision_v1.md` — la decisión final (construir/iterar/matar) con firma de Pablo
