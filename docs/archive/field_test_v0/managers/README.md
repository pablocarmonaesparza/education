# managers/ — bitácora de entrevistas grupo B

> directorio para los outputs de las 3 entrevistas con managers que
> leen el reporte (sintético inicialmente, real después).
>
> regla: una carpeta por manager (`M001/`, `M002/`, `M003/`) con los
> archivos YAML de captura.

## estructura esperada por manager

```
managers/M001/
├── metadata.yaml              # fecha, canal de entrevista, duración
├── report_received.yaml       # qué reporte recibieron (sintético v0 o real de Pxxx) + fecha
├── interview_notes.yaml       # respuestas literales a las 4 preguntas grupo B
└── summary.yaml               # clasificación de respuestas según 5_post_test_interview_protocol.md
```

## las 4 preguntas grupo B

(definidas en `5_post_test_interview_protocol.md` sección parte 2)

1. qB1 — acción accionable
2. qB2 — qué falta del reporte
3. qB3 — qué sobra del reporte
4. qB4 — credibilidad para compartir upward

## reglas

1. los 3 managers reciben **el mismo reporte** (sintético v0 inicialmente)
   para controlar varianza entre reacciones

2. **un manager NO puede ser participante grupo A** ni conocer al
   participante del reporte real (preservar ceguera del manager)

3. la métrica de la señal 6 (manager accionable) se calcula como:
   - ≥ 2/3 managers con `is_actionable: true` → "mantener"
   - 1/3 → "zona intermedia"
   - 0/3 → "matar el reporte como está" (iterar formato, NO matar caso)

4. retención: 90 días, después anonimización

## archivos agregados al cierre

- `_grupo_b_summary.md` — consolidación de las 12 respuestas (4 preguntas × 3 managers) + cálculo de señal 6
