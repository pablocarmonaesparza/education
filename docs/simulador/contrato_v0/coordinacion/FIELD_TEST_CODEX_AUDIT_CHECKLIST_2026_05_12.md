# Field test v0 — checklist de auditoria Codex

> estado: usado para auditar Fase A y packet completo el 2026-05-12.
> objetivo: auditar el lock experimental sin tocar runtime, schema, Supabase ni UI.

## alcance

Codex audita solo la fase A:

- `docs/simulador/field_test_v0/README.md`
- `docs/simulador/field_test_v0/0_experiment_protocol.md`
- `docs/simulador/field_test_v0/9_decision_matrix.md`

Claude mantiene autoria de producto. Codex no reescribe el experimento salvo para corregir contradicciones, huecos de medicion o riesgos de contaminacion.

## criterios de auditoria

### 1. pre-registro real

- Las hipotesis estan escritas antes de la sesion 1.
- Las reglas de decision no dependen de interpretacion posterior.
- El protocolo dice que no se puede concluir con `n=5`.
- El protocolo separa claramente face validity, construct validity y buyer validity.

### 2. separacion de grupos

- Grupo A: participantes que resuelven el caso.
- Grupo B: managers/buyers que revisan reportes anonimizados.
- Las metricas de usuario y comprador no se mezclan.
- El criterio de venta depende explicitamente del grupo B.

### 3. calibracion humano-judge

- Los humanos califican antes que el judge.
- El judge no ve calificaciones humanas.
- Los revisores humanos reciben rubrica ciega: sin `gap_trigger_logic`, sin pesos internos, sin hipotesis esperadas.
- Metricas minimas:
  - acuerdo A/M/B general >= 70% contra al menos un humano;
  - kappa humano-humano >= 0.4 como senal minima;
  - high-risk recall del judge >= 85%;
  - maximo 1 false negative critico;
  - precision high-risk >= 60% aceptable inicial.

### 4. reproducibilidad wizard-of-oz

- Modelo del LLM beat congelado.
- Modelo del judge congelado.
- Temperature congelada.
- System prompts guardados.
- Timestamp por sesion.
- Operador no improvisa ni ayuda al participante.

### 5. decision matrix

- Mantener caso solo si las senales suficientes pasan.
- Matar caso si cae en umbrales duros.
- Zona intermedia obliga a iterar y repetir prueba, no construir.
- Runtime solo se autoriza si pasan las condiciones acordadas.

### 6. no contaminacion tecnica

- No hay dependencia de Supabase.
- No hay dependencia de UI.
- No hay dependencia de schema runtime.
- Las respuestas capturadas son exportables a estructura futura: participante, step, answer, timestamp, evaluator_id, band, risk_flag.

## salida esperada de Codex

Despues de revisar los 3 archivos, Codex debe emitir:

- `coordinacion/AUDIT_FIELD_TEST_CODEX_2026_05_12.md`
- resultado: `approved`, `approved_with_fixes` o `blocked`
- lista corta de bloqueantes, si existen
- lista corta de riesgos no bloqueantes

## resultado

Fase A recibida y auditada. Ver `AUDIT_FIELD_TEST_CODEX_2026_05_12.md`.

Fase B recibida y auditada. Ver `AUDIT_FIELD_TEST_PACKET_CODEX_2026_05_12.md`.

Resultado: `approved_with_fixes`.
