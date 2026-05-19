---
type: research
title: Case Method + Learning Evaluation — síntesis para Itera
task_id: B9-002
date: 2026-05-19
status: published
authors: [claude]
reviewers: [codex]
sources:
  - https://www.hbs.edu/case-method-project/about/Pages/case-method-teaching.aspx
  - https://www.kirkpatrickpartners.com/the-kirkpatrick-model/
  - https://case.hks.harvard.edu/about-us/
  - https://mitsloan.mit.edu/action-learning
  - https://bokcenter.harvard.edu/cases
---

# Case Method + Learning Evaluation — síntesis para Itera (B9-002)

## TL;DR

- **HBS Case Method** define el ADN del runtime: ponerse en zapatos del decisor, decision point estructurado, sin revelar la respuesta correcta. Itera ya respeta esto en contrato §7 — confirmado.
- **Kirkpatrick 4-level** define cómo medimos el valor del producto: Reacción (post-sesión), Aprendizaje (delta primary→resim), Comportamiento (transfer delta), Resultados (impacto P&L del cliente — out of scope v1).
- **MIT Sloan Action Learning** valida que aplicar frameworks a retos reales > teoría aislada. Confirma tesis Itera: "criterio operativo" sobre "conocimiento de IA".
- **HKS Case Program** + **Harvard Bok** agregan que buenos casos se construyen con investigación documental + entrevistas (no ocurrencias), tienen stakeholders en conflicto y forzan reflexión sobre el proceso de decisión.

## 1. HBS Case Method — principios canónicos

### Qué hace un caso "discutible" (no lecture)
> "A short narrative document — a story — that presents a particular challenge."

Implicación para Itera: el caso debe ser **historia**, no lista de hechos. La narrativa carga la tensión.

### Rol del participante
> "Put themselves in the shoes of the actual decision-makers to consider what they themselves would have done given the information available at the time."

Implicación: el contrato §7 ya respeta esto literalmente. Cada caso Itera arranca con perspectiva primera persona del decisor + información disponible en ese momento (no en retrospectiva).

### Rol del instructor (= judge Itera)
> "Poses carefully designed questions to guide discussion."

Implicación: judge LLM Itera NO entrega cátedra. Pregunta + observa + emite señal sin enseñar. Esto valida nuestra regla "no enseñar antes de medir" del contrato §7.

### Decision point structure
> "Each case builds to a particular decision point."

Implicación: las 6 secciones del runtime (Contexto → Datos → IA → Revisión → Decisión → Respuesta) tienen un **decision point por sección** que culmina en sección 5 (Decisión) y sección 6 (Respuesta a autoridad). El loop pedagógico de Itera respeta esto.

### Withheld resolution
> "Deliberately avoid revealing what decision was actually made."

Implicación: ningún caso Itera debe revelar "la respuesta correcta" durante el runtime. La sanitización §16 ya tiene esto como regla — confirmado. Practice beats (post-evaluación) sí pueden enseñar, porque ya está medido el criterio.

## 2. Kirkpatrick 4-Level — cómo medimos el valor del producto

### Mapeo a Itera

| Nivel | Pregunta | Cómo Itera lo captura | Cuándo |
|---|---|---|---|
| **L1 Reacción** | ¿Le gustó/sintió relevante al participante? | Survey post-sesión (1 pregunta NPS + 1 abierta) | Inmediato post-submit |
| **L2 Aprendizaje** | ¿Adquirió criterio? | Bandas A/M/B por dimensión + override matrix | Post-evaluación judge |
| **L3 Comportamiento** | ¿Aplicó el criterio en flujo nuevo? | **Transfer delta** entre primary y resim variant del mismo caso | 30-90 días post-sprint |
| **L4 Resultados** | ¿Cambió KPI del negocio? | NO mide directo en v1; manager reporta cualitativo | 3-6 meses (out of scope sin design partners) |

**Decisión clave:** Itera ya tiene infraestructura para L1+L2+L3. **L4 está fuera de scope v1** y debe comunicarse al buyer: "Itera mide criterio (L1-L3); cambio en P&L (L4) lo capturas tú con metrics existentes de tu equipo."

### "Foundational Principles" Kirkpatrick
> "Performance Environment acts as both a foundation and an influencer."

Implicación crítica: incluso un participante con criterio fuerte falla si su environment (manager, política interna, herramientas) no lo soporta. **Esto justifica la recomendación "Escalar"** del override matrix Itera: cuando el problema es proceso/legal/IT, no individual, escalamos en lugar de entrenar.

## 3. MIT Sloan Action Learning

> "Apply frameworks to real business challenges, not learn isolated theory."

Implicación: cada caso Itera se construye desde flujos reales del rol del participante (marketing manager con feedback de clientes, ops lead con automatización, etc.). NO casos hipotéticos de libro de texto. Esto ya está en contrato §6 y §7 — confirmado.

## 4. HKS Case Program + Harvard Bok Center

### HKS Case Program
> "Good cases are built with documentary research and interviews, not occurrences."

Implicación: cuando escribamos los 8 casos del sprint marketing_30d (o las 16 variantes resim), no podemos inventar tensión desde una sola conversación. Cada caso necesita:
- 1-2 entrevistas con role real del comprador
- Documentación de la situación arquetípica (ej. "Marketing Manager bajo presión de campaña" tiene N casos públicos)
- Sources verificables citables en el archetype doc

### Harvard Bok Center
> "Good cases have stakeholders, conflicting priorities, and reflection on the decision process."

Implicación: cada caso Itera debe tener:
1. **Stakeholders identificados:** el participante (operador), su manager (autoridad), peer (consensus), legal/compliance (riesgo externo).
2. **Prioridades en conflicto:** velocidad vs privacidad, validación vs presión de autoridad, etc. (contrato §6 ya lista tensiones por caso).
3. **Reflexión sobre proceso:** la sección 6 (Respuesta) ya captura esto — el participante explica su decisión, no solo la ejecuta.

## Decisiones producto

<!-- decisions:data:start -->
```yaml
decisions:
  - id: B9-002-D1
    decision: "Documentar mapeo Itera ↔ Kirkpatrick en marketing materials y sales decks"
    rationale: "Kirkpatrick es lingua franca de L&D/HR enterprise. Mapear explícito L1-L2-L3 (Itera mide) vs L4 (cliente mide solo) reduce fricción de venta. Manager objeta menos cuando entiende qué entrega Itera vs qué entrega él."
    change_type: copy
    files_to_touch:
      - lib/simulador/copy/sales.ts
      - lib/simulador/copy/landing.ts
      - docs/sales/kirkpatrick_positioning.md
    owner: claude
    blocked_by: []
    priority: high

  - id: B9-002-D2
    decision: "Hard rule: cada caso 1-8 (+ variantes resim) requiere archetype_ref docs/simulador/contrato_v0/archetypes/<id>.md con 1-2 entrevistas + 3+ sources documentales antes de import a BD"
    rationale: "HKS principle: casos buenos vienen de research, no ocurrencias. Sin esta regla, los YAMLs degeneran en casos sintéticos sin contexto LATAM real. Quality bar M5 debe enforce esto."
    change_type: rubric
    files_to_touch:
      - scripts/simulador/validate-case-yaml.mjs
      - docs/quality/case_admission_checklist.md
    owner: claude
    blocked_by:
      - B3-001

  - id: B9-002-D3
    decision: "Practice beats post-evaluación SÍ pueden enseñar — runtime NO. Codificar esta distinción en producto y copy"
    rationale: "HBS Case Method: withheld resolution durante el runtime. Pero Kirkpatrick L2/L3: aprendizaje pasa con enseñanza estructurada post-medición. Itera respeta ambos: runtime mide (no enseña), practice beats enseñan (después de medir). Copy y onboarding deben hacer esta distinción explícita al participante para que entienda por qué el reporte llega sin retroalimentación 'didáctica' inmediata."
    change_type: copy
    files_to_touch:
      - lib/simulador/copy/runtime.ts
      - lib/simulador/copy/report.ts
      - lib/simulador/copy/manager.ts
    owner: claude
    blocked_by: []
    priority: high

  - id: B9-002-D4
    decision: "Transfer delta (primary→resim) es la métrica core de L3 Comportamiento. Debe estar visible en manager dashboard y reporte ejecutivo"
    rationale: "Kirkpatrick L3 = ¿aplicó el criterio en flujo nuevo? Sin transfer delta, Itera vende assessment (L2) no readiness (L3). Schema premium B2-001 ya incluye compute_transfer_delta function — usar en P5-001 (estructura reporte ejecutivo v2) como KPI prominente."
    change_type: report
    files_to_touch:
      - docs/design/surfaces/executive_report.md
      - lib/simulador/copy/report.ts
    owner: claude
    blocked_by:
      - B5-001
      - B2-001

  - id: B9-002-D5
    decision: "Override matrix mantiene rama Escalar — justificación Kirkpatrick Performance Environment principle"
    rationale: "Kirkpatrick foundational: incluso skills perfectos fallan sin environment. Escalar es la recomendación cuando el gap es proceso/legal/IT, no individual. La rama existe en lib/simulador/judge/apply-overrides.ts y compute_recommendation SQL — verificar que esté documentada en copy del manager dashboard."
    change_type: copy
    files_to_touch:
      - lib/simulador/copy/manager.ts
      - docs/design/surfaces/manager_dashboard.md
    owner: claude
    blocked_by:
      - B5-002

  - id: B9-002-D6
    decision: "Survey L1 Reaction NO es opcional — implementar post-submit con 1 NPS + 1 abierta + 1 relevance score"
    rationale: "Kirkpatrick: relevancy es el strongest predictor de behavior transfer. Sin L1, no podemos calibrar si los casos resuenan con el participante real. 30 segundos post-submit. Codex implementa, claude define copy."
    change_type: schema
    files_to_touch:
      - supabase/migrations/022_simulador_analytics_compliance.sql
      - lib/simulador/copy/runtime.ts
    owner: codex
    blocked_by:
      - B2-003
```
<!-- decisions:data:end -->

## Notas operativas

- 6 decisiones producto emitidas (B9-002-D1 a D6). Mix copy + schema + report + rubric.
- Owner mayoritario: claude. 1 owner codex (D6 — survey L1 schema).
- Blocked_by: B3-001 (arquetipos), B5-001 (estructura reporte), B5-002, B2-001 (mig 021), B2-003 (mig 022).
- Próximo bloque relacionado: B9-003 (AI adoption + LATAM compliance) — Kirkpatrick L4 mapeo a métricas LATAM se cubre ahí.
