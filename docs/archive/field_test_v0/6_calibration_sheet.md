# 6 — hoja de calibración (humano1 × humano2 × LLM-judge)

> **propósito.** estructura para consolidar las calificaciones de
> ambos evaluadores externos + LLM-judge sobre las 5 sesiones del
> field test. Codex audita esta consolidación para el cálculo de
> métricas de las señales 4 y 5 de la decision matrix.
>
> **15 cells evaluables por sesión × 5 sesiones = 75 cells totales por
> evaluador.**
>
> **versión:** 1.0.0 — congelada al commit de Fase B.

---

## cells evaluables (idénticas a `3_rubric_human_simplified.md`)

las 15 cells por sesión son:

| step | dimensiones a calificar | cells |
|---|---|---|
| 1 | contexto, privacidad | 2 |
| 2 | contexto, privacidad, validación, juicio, decisión | 5 |
| 3 | privacidad, validación, juicio | 3 |
| 4 | juicio, decisión | 2 |
| 5 | privacidad, juicio, decisión | 3 |
| **total** | | **15** |

**NO se califican** cells fuera de esta lista (no aplica al caso 1).

---

## archivo de output por sesión

`field_test_v0/sessions/<participant_id>/calibration.yaml`:

```yaml
participant_id: P001
calibration_date: 2026-05-25
evaluator_1_id: E1
evaluator_2_id: E2
evaluator_3_id: null  # o E3 si se invocó tie-breaker
judge_model: deepseek-v4-flash
judge_temperature: 0
judge_prompt_version: v0.1

cells:
  - cell_id: step_1.contexto
    evaluator_1: A | M | B
    evaluator_2: A | M | B
    evaluator_3: null | A | M | B  # solo si tie-breaker activado
    judge: A | M | B
    human_agreement: true | false  # E1 == E2
    judge_human_agreement: true | false  # judge == E1 OR judge == E2
    notes: |
      <opcional, máx 30 palabras si hay algo notable>

  - cell_id: step_1.privacidad
    # ... mismo formato

  # ... 13 cells más, una por (step, dimensión) evaluable

risk_events_aggregate:
  - event_id: re_001
    step: 2
    detected_by_e1: true | false
    severity_e1: critical | high | medium | low | null
    detected_by_e2: true | false
    severity_e2: critical | high | medium | low | null
    detected_by_judge: true | false
    severity_judge: critical | high | medium | low | null
    description_short: |
      <descripción de qué tipo de risk_event es, máx 1 oración>
    classification:
      true_positive_for_judge: true | false  # judge lo detectó Y al menos UN humano lo detectó
      false_negative_for_judge: true | false  # ningún detect del judge cuando al menos UN humano sí
      false_positive_for_judge: true | false  # judge lo detectó pero NINGÚN humano lo hizo
  # ... 0-N risk_events más

summary:
  human_agreement_count: <int>   # de 15 cells, cuántas con E1 == E2
  human_agreement_pct: <float>   # (human_agreement_count / 15) * 100
  judge_human_agreement_count: <int>  # de 15 cells, cuántas con judge == E1 OR judge == E2
  judge_human_agreement_pct: <float>
  risk_events_total_human: <int>
  risk_events_high_or_critical_total_human: <int>
  risk_events_high_or_critical_detected_by_judge: <int>
  judge_high_risk_recall: <float>  # detected_by_judge / total_human_high
  judge_high_risk_false_negatives: <int>
  judge_high_risk_false_positives: <int>
```

---

## tabla maestra al cierre de las 5 sesiones

`field_test_v0/sessions/_calibration_master.md` con esta estructura:

### parte 1 — agreement humano-humano (señal 4)

| sesión | cells (15) | E1==E2 count | agreement % |
|---|---|---|---|
| P001 | 15 | ? | ?% |
| P002 | 15 | ? | ?% |
| P003 | 15 | 15 | ?% |
| P004 | 15 | ? | ?% |
| P005 | 15 | ? | ?% |
| **total** | **75** | **?** | **?%** |

**cohen's kappa weighted (E1 vs E2 sobre las 75 cells):** `?`

**interpretación contra señal 4 de decision matrix:**

- kappa ≥ 0.4 → "mantener" (rúbrica funciona)
- kappa 0.2-0.4 → invocar 3er evaluador (E3 califica las mismas 5 sesiones)
- kappa < 0.2 → "matar la rúbrica como está", iterar rúbrica antes de matar caso

### parte 2 — agreement humano-judge (señal 5)

| sesión | cells (15) | judge agrees with E1 or E2 | % |
|---|---|---|---|
| P001 | 15 | ? | ?% |
| P002 | 15 | ? | ?% |
| P003 | 15 | ? | ?% |
| P004 | 15 | ? | ?% |
| P005 | 15 | ? | ?% |
| **total** | **75** | **?** | **?%** |

### parte 3 — risk_events high/critical (señal 5 asimétrica)

| métrica | valor | umbral mantener |
|---|---|---|
| total risk_events high/critical detectados por humanos (E1 OR E2) | ? | n/a |
| risk_events high/critical detectados por judge (de los humanos) | ? | n/a |
| **recall del judge en high/critical** | ?% | ≥ 85% |
| false negatives críticos del judge en toda la prueba | ? | ≤ 1 |
| false positives del judge (high/critical) | ? | n/a (no mata) |
| precision del judge en high/critical | ?% | ≥ 60% (aceptable inicial) |

**interpretación contra señal 5:**

- recall ≥85% AND ≤1 FN crítico → "mantener" judge automatizado
- recall 60-85% O 1-2 FN críticos → "zona intermedia"; iterar prompt
- recall <60% O ≥3 FN críticos → "matar judge automatizado" pero caso vive (runtime sin judge auto)

---

## protocolo de cálculo

los cálculos los hace **el operador (Pablo o Claude humano)** con
input crudo de `evaluator_1.yaml`, `evaluator_2.yaml`, `judge.yaml`.

**Codex audita aritmética** antes de declarar resultados:

1. operador llena la tabla maestra
2. operador commitea `_calibration_master.md` poblada
3. Codex revisa:
   - agreement counts vs YAMLs crudos
   - cálculo de kappa (formula weighted, no simple)
   - cálculo de recall + precision para risk_events high/critical
   - clasificación true_positive/false_negative correcta
4. Codex marca aprobación o señala correcciones
5. solo después de aprobación de Codex el operador usa estos números
   para aplicar `9_decision_matrix.md`

---

## fórmulas explícitas (para evitar interpretación)

### cohen's kappa weighted (E1 vs E2)

```
bandas ordinales: A, M, B
weights:
  same band = 1.0
  adjacent band (A/M or M/B) = 0.5
  opposite band (A/B) = 0.0

po_weighted = suma(observed_proportion_ij * weight_ij)
pe_weighted = suma(expected_proportion_ij * weight_ij)
kappa_weighted = (po_weighted - pe_weighted) / (1 - pe_weighted)
```

Usar weighted kappa con weights lineales. No usar kappa simple para la
decision matrix.

### recall del judge en risk_events high/critical

```
recall = (risk_events high/critical detectados por judge AND por al menos 1 humano)
       / (total risk_events high/critical detectados por al menos 1 humano)
```

### precision del judge en risk_events high/critical

```
precision = (risk_events high/critical detectados por judge AND por al menos 1 humano)
          / (total risk_events high/critical detectados por judge)
```

### false negative crítico

un FN crítico = risk_event high/critical detectado por al menos UN humano
+ NO detectado por el judge en absoluto.

(severity high detectada por humano, severity medium o ausente por
judge → cuenta como false negative parcial, no crítico. solo "judge
no detectó nada" cuenta como crítico.)

---

## casos especiales

### empate en cell (E1 y E2 dan bandas adyacentes)

ejemplo: E1=A, E2=M.

- **agreement count:** 0 (no son iguales)
- **weighted kappa:** desacuerdo de 0.5 (no 1.0)
- **3er evaluador:** se invoca SOLO si más de 50% de cells tienen este
  patrón, sugiriendo que la rúbrica no define A vs M con claridad
- **para reportes:** la cell se reporta como "M" (toma la banda menor)
  con nota explicativa

### empate con bandas no adyacentes (E1=A, E2=B)

esto es síntoma fuerte de problema de rúbrica.

- **agreement count:** 0
- **weighted kappa:** desacuerdo de 1.0
- **alerta:** si esto ocurre en ≥3 cells de las 75, escalar a Codex +
  Claude antes de continuar análisis. revisar si la rúbrica simplificada
  comunica claramente A vs B.

### sesión incompleta (participante abandonó)

si una sesión tiene <15 cells calificables porque el participante no
completó algún step:

- la sesión cuenta en denominadores ajustados (no 15, sino N cells
  con respuesta)
- se reporta como sesión parcial; el cálculo agregado lo señala
- no se reemplaza el participante para mantener honestidad sobre el
  abandono

### judge no produce output para una cell

si el LLM-judge falla en una llamada y no produce banda para una cell:

- esa cell NO cuenta en agreement humano-judge
- denominador del agreement se ajusta
- se documenta el fallo en `judge.yaml` con timestamp + reason
- Codex audita el fallo (puede ser por timeout, content filter, etc.)

---

## qué Codex audita específicamente

1. **cells count:** ¿cada `calibration.yaml` tiene exactamente las 15
   cells correctas?
2. **agreement count:** ¿el conteo de `human_agreement: true` cells
   coincide con E1 == E2 en los YAML originales?
3. **kappa weighted:** ¿la fórmula usa weights lineales para bandas
   ordinales? ¿no se usó kappa simple por error?
4. **risk_events:** ¿el conteo de high detectados por judge es
   consistente entre `calibration.yaml` y `judge.yaml`?
5. **recall:** ¿numerador y denominador correctos? (sin double-count
   si humano1 y humano2 detectan el mismo evento)
6. **integridad:** ¿hay sesiones con cells faltantes o evaluators
   missing? ¿se documentaron?

Codex publica resultado de audit en
`docs/simulador/contrato_v0/coordinacion/AUDIT_CALIBRATION_CODEX_<fecha>.md`.

---

## qué pasa después

calibración aprobada por Codex →

1. Claude llena la tabla maestra con los números reales
2. Claude evalúa cada señal contra `9_decision_matrix.md`
3. Claude propone decisión (A/B/C)
4. Codex verifica
5. Pablo confirma + ejecuta

el resultado va a `field_test_v0/sessions/_decision_v1.md` con commit
firmado por Pablo en el mensaje.
