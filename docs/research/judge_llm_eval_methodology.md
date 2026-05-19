---
type: research
title: Judge LLM evaluation methodology — defensibilidad + sesgos + edge cases
date: 2026-05-19
author: claude
reviewers: [codex, pablo]
status: published
scope: review depth de cómo se evalúa el judge actual (lib/simulador/judge/) — rúbrica + calibration set (B4-002) + override matrix determinístico. Identifica sesgos potenciales, edge cases sin cubrir y mitigaciones. Sirve para defender el producto vs skeptical CTOs/CFOs que cuestionan "¿puede una LLM realmente medir criterio?"
related:
  - lib/simulador/judge/ (7 archivos: apply-overrides + index + mock-output + persist + prompt-builder + run + types)
  - codex B4-002 (calibration set + comparator, done)
  - codex B4-003 (doble firma human review queue, done con migración 024)
  - docs/research/risk_events_taxonomy_v2.md
---

# Judge LLM eval methodology — review

## TL;DR

El judge actual es **híbrido determinístico-probabilístico**: LLM (Opus 4.5/Sonnet 4.5) para detectar evidencia textual en transcript + override matrix TypeScript/SQL para mapear evidencia a bandas + recomendación. Calibration set y comparator añadidos por codex B4-002. Doble firma human review para risk events high (B4-003).

**Defensibilidad: alta para B2B v1.** No es "AI black box" — es "LLM como detector de evidencia, lógica determinística para clasificación final, humano valida edge cases".

**3 sesgos potenciales identificados** (mitigables, no eliminables):
1. **Sesgo de muestra del LLM training data** — Opus aprendió más sobre flows US enterprise que LATAM mid-market.
2. **Sesgo de optimismo en bandas Alto** — LLM tiende a interpretar respuestas ambiguas como "más Alto" si el participante usa lenguaje seguro.
3. **Sesgo de severidad en risk events** — judge puede sub-clasificar severity cuando el contexto es ambiguo.

**4 edge cases sin cubrir bien** identificados con propuestas de mitigation post-customer-zero.

## Arquitectura del judge

### Flow actual

```
[transcript completo del runtime]
         ↓
[prompt-builder.ts] construye system + user prompt
         ↓
[run.ts] Anthropic SDK Opus/Sonnet temperature=0 JSON mode
         ↓
[output LLM] = {
  dimensions: [{id, band, rationale, confidence}],
  risk_events: [{type, severity, step_id, evidence_text, jurisdiction, transfer_basis}],
  recommendation: {action, reason}
}
         ↓
[apply-overrides.ts] aplica override matrix (TS) → corrige recommendation si hay risk high
         ↓
[compute_recommendation SQL function] verifica consistency (defensive — same logic en DB para audit)
         ↓
[persist.ts] insert simulador.reports + simulador.risk_events + dispara human_review_queue si risk high
```

### Componentes

| Archivo | Responsabilidad | Determinístico vs LLM |
|---|---|---|
| `prompt-builder.ts` | Construye el prompt con rúbrica versionada + transcript | Determinístico |
| `run.ts` | Invoca Opus/Sonnet temperature=0 | LLM (con seed teóricamente reproducible) |
| `mock-output.ts` | Fallback en dev cuando no hay API key | Determinístico (devuelve mock fixed) |
| `apply-overrides.ts` | Override matrix: si risk event high → escalate; si ≥2 medium → pause; etc. | Determinístico (TS) |
| `types.ts` | Schema de output (Zod o equivalent) | Determinístico (validation) |
| `persist.ts` | Insert reports + risk_events + human_review_queue | Determinístico (SQL inserts) |
| `index.ts` | Orchestration | Determinístico |

**Insight:** solo `run.ts` es probabilístico (LLM). Los otros 6 archivos son determinísticos. El "LLM black box" es 1 de 7 componentes, restringido a detectar evidencia textual con confianza explícita.

### Override matrix (apply-overrides.ts + SQL function)

Recomendación final NO es lo que sale del LLM directo. Se aplica matriz post-LLM:

```
Si risk_event severity = high (1+) → recommendation = escalar
Sino, si risk_events medium ≥ 2 → recommendation = pausar
Sino, si dimension banda B en ≥ 2 dimensiones críticas → recommendation = pausar
Sino, si todas las dimensiones banda A → recommendation = pilotar
Sino → recommendation = entrenar (default mid-state)
```

**Determinística:** mismos inputs → misma recomendación. Si el LLM cambia su band para una dimensión, la recomendación cambia consistently.

**Auditable:** la función SQL `simulador.compute_recommendation(session_id)` re-calcula desde DB. Si el TS output no coincide con SQL output → bug, NOT model drift.

## Calibration set (codex B4-002)

**Qué hizo codex:** creó un calibration set fijo de N sessions sintéticas con bandas/risk events conocidos pre-asignados manualmente. Antes de cada deploy, corre el judge contra el calibration set y compara output vs expected.

**Métricas del comparator (codex B4-002):**
- Per-dimension agreement rate (LLM matches expected band)
- Risk event detection precision / recall
- Recommendation match rate (final action coincide)
- Confidence calibration (alta confianza → alta accuracy)

**Threshold típico (research-grade):** ≥80% agreement por dimensión + ≥90% risk event recall + ≥95% recommendation match.

**Implicación para defensibilidad:** podemos decir al buyer "antes de cada release, validamos contra N sesiones con bandas conocidas. El LLM acierta ≥X%. Por debajo, no deployamos." → ESO es lo que diferencia "research-grade" de "trust me bro".

## Sesgos potenciales (mitigables, no eliminables)

### Sesgo 1: training data US-centric

**Síntoma:** Opus aprendió más sobre flows US enterprise (Salesforce, Slack inglés, prácticas SaaS B2B US) que mid-market LATAM (HubSpot LATAM, WhatsApp Business, prácticas locales).

**Riesgo:** LLM puede interpretar "el participante usó WhatsApp para coordinar con cliente" como informal/risky cuando en LATAM mid-market es estándar profesional.

**Mitigación implementada parcialmente:**
- Calibration set incluye flows LATAM (si codex los puso) — verificar con codex.
- Prompt-builder explicita "contexto: mid-market LATAM, herramientas locales son estándar".

**Mitigación pendiente v2:**
- Calibration set con N≥50 sesiones LATAM específicas (no solo US-translated).
- A/B comparar Opus vs Claude 3.5 Sonnet en sesiones LATAM — si Sonnet performs equally well, usar Sonnet (más barato).

### Sesgo 2: optimismo en bandas Alto

**Síntoma:** LLM tiende a clasificar respuestas ambiguas como "Alto" si el participante usa lenguaje seguro/asertivo ("definitivamente verificaría con la fuente") aunque la acción concreta sea débil.

**Riesgo:** falsos positivos de banda Alto → manager sobreestima criterio real del equipo → decisión equivocada (autonomía vs supervisión).

**Mitigación implementada:**
- Override matrix exige risk events 0 para banda Alto. Si hay cualquier risk medium+, dimensión NO puede ser Alto.
- Rúbrica explicita: "Alto requiere evidencia textual de ejecución específica, NO solo aspiración."

**Mitigación pendiente v2:**
- Validation step: si LLM dice banda Alto + confidence <0.7, downgrade a Medio automáticamente.
- A/B human review en muestra 5-10% sesiones banda Alto para detectar drift.

### Sesgo 3: sub-clasificación de severity en risk events

**Síntoma:** judge puede clasificar `exposed_pii_to_model` como severity Medium cuando contextualmente es High (porque "el participante eventualmente pidió aclaración" — pero el daño primario YA pasó).

**Riesgo:** risk events high se under-count → human review queue no se dispara → manager no escala incidentes que debería.

**Mitigación implementada:**
- Specific rules en rúbrica: `exposed_pii_to_model` ALWAYS minimum severity Medium (no Low). Si contexto es enterprise/sensible → High.
- Doble firma human review (B4-003) para confirmar severity en muestra.

**Mitigación pendiente v2:**
- Severity-specific rubrics: cada event type tiene reglas explícitas para Low/Medium/High/Critical.
- Edge case library: catálogo de "casos donde LLM sub-clasificó + corrección manual" para refinar prompt-builder.

## Edge cases sin cubrir bien

### Edge case 1: participante deliberately sandbagging (responde mal a propósito)

**Síntoma:** un participante puede dar respuestas obviously wrong para evitar ser visto como expert (anti-promotion). Su transcript reflejaría "sí, mandé el dataset completo al modelo sin filtrar" → judge clasifica como banda B en privacidad.

**Riesgo:** datos inválidos para evaluación. El manager ve "este empleado tiene gap" cuando realmente está manipulando el sistema.

**Mitigación v1 (limitada):**
- Anti-fraud warnings en field-test (`field-test.ts.anti_fraud.paste_detected_warning`, `inactivity_warning`) — disuasivos pero no detectivos.
- Manager dashboard nota el caso si el participante completa MUY rápido (<8 min suspicioso para un caso de 18-22 min).

**Mitigación pendiente v2:**
- Behavioral signatures: detectar patrones de responses cortas + low-effort + zero edits = posible sandbagging.
- Sentinel questions en runtime: pequeñas preguntas con respuestas obvias — si participante también las falla, flag.

### Edge case 2: participante usa "lo correcto teórico" sin contexto operativo

**Síntoma:** participante responde "yo verificaría con el legal team antes de mandar PII al modelo" — respuesta perfecta teóricamente, pero NO viable en su contexto (su org no tiene legal team).

**Riesgo:** judge clasifica banda Alto basado en respuesta teórica. Manager piensa "este empleado tiene criterio" — pero en la operación real no aplica esa respuesta.

**Mitigación v1 (parcial):**
- Rúbrica pide "viabilidad operativa": una respuesta sin contexto = banda Medio máximo.
- Reporte ejecutivo cita evidencia textual — el manager VE la respuesta y juzga viabilidad.

**Mitigación pendiente v2:**
- Cases tienen "constraints" explícitos (ej. "tu org tiene 12 empleados, no hay legal team"). Si la respuesta ignora constraint → judge degrada banda.
- Validation: el LLM revisa coherencia entre respuesta y constraints del caso.

### Edge case 3: participante en banda A consistently — ¿signal o ceiling?

**Síntoma:** un participante saca banda A en las 5 dimensiones en 3 casos consecutivos. ¿Es realmente expert o llegamos al ceiling del instrumento?

**Riesgo:** si TODOS los participantes sacan banda A, el instrumento no discrimina — pierde valor diagnóstico.

**Mitigación v1:**
- Calibration set incluye sesiones diseñadas para banda A — si TODOS sacan A, el judge debe sub-clasificar.
- Cases tienen difficulty: baseline / intermediate / advanced. Banda A en baseline no implica banda A en advanced.

**Mitigación pendiente v2:**
- N3 cases con agentes — difficulty ceiling más alto. Banda A en N3 es más informativo que banda A en N1.
- Cross-case consistency: si participante A en N1 pero M en N2 → más confiable señal que A en N1 solamente.

### Edge case 4: contexto multilingüe (transcript mezcla español/inglés)

**Síntoma:** participante LATAM escribe respuestas mezclando español + términos técnicos en inglés ("le pedí al modelo que generara el dashboard report"). Transcript es bilingüe natural.

**Riesgo:** LLM puede interpretar mal alguna parte del bilingüismo → mis-clasifica banda o no detecta risk event.

**Mitigación v1:**
- Prompt-builder explicita "transcript may be bilingual Spanish/English mix — treat as standard LATAM corporate communication".
- Opus 4.5 native multilingual — generally OK.

**Mitigación pendiente v2:**
- Calibration set bilingüe específico — verificar el judge mantiene accuracy.
- Validation: si LLM expresa confidence <0.6 + transcript bilingüe detected → human review automatic.

## Defensibilidad para skeptical CTO/CFO

Pregunta típica: "¿Cómo defendemos que una LLM puede medir criterio operativo?"

**Respuesta estructurada (Pablo en discovery):**

1. **El LLM NO es la respuesta — es el detector de evidencia.** El judge extrae evidencia textual del transcript completo (todas las decisiones step-by-step), no responde "qué banda dar". La clasificación final es determinística (override matrix).

2. **Calibration set con threshold explícito.** Antes de cada release, validamos contra N sesiones con bandas conocidas. Si <80% agreement, no deployamos. Es accountability concreta, no "trust the AI".

3. **Doble firma human review en risk events high.** Cualquier risk event high → automáticamente pasa por revisor humano antes de publicarse al manager. Hybrid review = LLM detecta + humano valida.

4. **SQL function paralela para audit.** El `compute_recommendation` en SQL re-calcula desde DB usando misma lógica que TS. Si discrepancia, alerta. NO confiamos solo en el output del LLM.

5. **Transparencia de límites.** El reporte ejecutivo declara explícitamente: "Esto NO es certificación. Es diagnóstico operativo con metodología documentada. Métricas de calibration disponibles bajo NDA."

**Pregunta follow-up típica:** "¿Y si la rúbrica cambia? ¿Reportes pasados quedan inconsistentes?"

**Respuesta:** la rúbrica está versionada (B3-006 + migración 022 rubric_freeze). Cada sprint cierra con la rúbrica que tenía al inicio. Si en Q3 cambiamos a rubric_v2, Q3 reportes se generan con v2, pero Q1 reportes mantienen v1. No retroactive.

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D28
    decision: "Defensibilidad del judge para v1 es alta. NO necesita cambios arquitecturales para launch. Los 3 sesgos identificados (training US-centric, optimismo Alto, sub-severity) están mitigados parcialmente y los edge cases tienen workarounds. v2 prioriza calibration LATAM-specific."
    rationale: "El judge es híbrido determinístico-probabilístico (1 de 7 componentes es LLM, restringido a detección de evidencia). Override matrix TS+SQL es paralelo. Calibration set + threshold + human review en risk high = accountability suficiente para B2B v1 sin sobrecargar la arquitectura."
    change_type: defensibility
    files_to_touch:
      - lib/simulador/judge/ (NO changes v1)
    owner: claude
    blocked_by: []
    priority: normal

  - id: M9-3-D29
    decision: "v2 (post 50+ field-tests + 5 customers cerrados): construir calibration set LATAM-specific N≥50. Si Sonnet 4.5 performs equally well en LATAM cases vs Opus, migrar a Sonnet (cost saving 5-7x)"
    rationale: "Training data US-centric es sesgo real pero mitigable con calibration set local. Sonnet vs Opus: si accuracy difference <2% en LATAM specific cases, Sonnet wins por costo. Pero NO antes de tener data real LATAM."
    change_type: cost_optimization
    files_to_touch:
      - lib/simulador/judge/run.ts (model selector)
      - calibration set (codex maintains)
    owner: claude (decision) + codex (implementation)
    blocked_by:
      - 50_field_tests
      - 5_customers
    priority: low

  - id: M9-3-D30
    decision: "Anti-sandbagging behavioral signatures (edge case 1) entran en v2 cuando primer customer reporte sospecha de manipulation. NO anticipar — el riesgo es teórico hasta que tengamos signal real"
    rationale: "Sandbagging es riesgo real pero baja prevalencia en B2B paid context (employee tiene incentivo de verse bien, no mal). Anti-fraud warnings en runtime ya disuaden. Behavioral detection es trabajo significativo — solo si hay evidencia de pattern."
    change_type: deuda_features
    files_to_touch:
      - lib/simulador/judge/prompt-builder.ts (eventual)
      - components/simulador/RuntimeExperience.tsx (behavior tracking)
    owner: codex
    blocked_by:
      - sandbagging_evidence
    priority: low
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato:** NO cambios al judge v1. Defensibilidad es suficiente para primeros customers.
2. **Pablo prep:** memorizar la respuesta estructurada (5 puntos) para CTOs/CFOs skeptical en discovery.
3. **Post 50+ field-tests:** construir calibration set LATAM-specific. Iniciar comparación Opus vs Sonnet.
4. **Post 5 customers:** evaluar si Sonnet 4.5 viable (cost saving 5-7x).
5. **Adhoc:** si primer customer reporte sandbagging suspicion, iniciar behavioral signatures research.
