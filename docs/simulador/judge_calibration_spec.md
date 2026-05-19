# judge calibration gate v1

## objetivo

El judge no puede ser una caja negra que "parece funcionar". Para que el
reporte sea defendible ante un manager, cada cambio en prompt/modelo/lógica del
judge debe compararse contra un set fijo de respuestas sintéticas con
expectativa humana.

## archivo canónico

`tests/simulador/judge/calibration_set.yaml`

Contiene 10 fixtures del caso `marketing_urgent_campaign_pii_v1`:

- casos fuertes sin riesgo, que deberían terminar en `pilotar`
- exposición directa de PII, que debe disparar high risk
- uso de vendor no aprobado
- ocultamiento de riesgo hacia autoridad
- aceptación de claims inventados
- sobre-bloqueo sin discriminación
- prompt injection no detectado

## métricas gate

El gate se considera PASS si:

- `band_match >= 80%` contra las 50 celdas esperadas (10 casos × 5 dimensiones)
- `high_risk_misses = 0`

La métrica de high risk es asimétrica: preferimos falsos positivos moderados a
perder un evento de riesgo alto. Esto sigue la lógica de producto ya definida:
Itera vende reducción de incertidumbre operativa, no sólo scoring bonito.

## comandos

Validar que el set está bien formado:

```bash
npm run simulador:judge-calibration
```

Validar un output real del judge contra el set:

```bash
npm run simulador:judge-calibration -- --actual tests/simulador/judge/latest_actual.yaml
```

`latest_actual.yaml` debe tener esta forma:

```yaml
cases:
  - id: pii_exposed_directly
    dimensions:
      - { id: contexto, band: M }
      - { id: privacidad, band: B }
      - { id: validacion, band: M }
      - { id: juicio, band: B }
      - { id: decision, band: B }
    risk_events:
      - { type: exposed_pii_to_model, severity: high }
```

## regla operativa

- Todo PR que toque `lib/simulador/judge/*`,
  `tests/simulador/judge/calibration_set.yaml` o el modelo
  `SIMULADOR_JUDGE_MODEL` debe correr este gate.
- Si el gate falla, el PR no se mergea.
- Cambiar el set requiere review de Claude porque altera la expectativa humana
  del producto.
- Cambiar el prompt del judge requiere bump de `JUDGE_PROMPT_VERSION` si cambia
  criterio, output o severidad.

## limitación actual

Este gate ya bloquea regresiones contra outputs capturados. El siguiente paso es
automatizar la generación de `latest_actual.yaml` llamando al judge contra cada
fixture en entorno controlado. No debe correr en cada `check:simulador` normal
porque implica costo de LLM; debe correr en PRs que toquen judge/modelo y en
release candidates.
