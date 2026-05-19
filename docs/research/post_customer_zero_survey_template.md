---
type: research
title: Post customer-zero survey templates — +14d / +30d / +90d
date: 2026-05-19
author: claude
reviewers: [pablo, codex]
status: published
scope: templates ejecutables de los 3 surveys post-sprint (FSRR +14d / RCI +30d / NPS +90d) que cierran el loop de tracking de las 5 métricas canónicas Itera. Diseñados para envío manual v1 + automatización Fase 4 v2
related:
  - docs/research/retention_metrics_b2b_saas_assessment.md (M9-3-D39..D42)
  - docs/strategy/v1_launch_playbook.md (week 4/12 metrics)
  - lib/simulador/copy/emails.ts (templates futuros automatizados)
---

# Post customer-zero survey templates

## TL;DR

3 surveys ejecutables que mandamos al manager (buyer principal) y opcionalmente a participantes después del sprint cierre. Cada uno mide diferentes señales:

| Survey | Timing | Mide | Métrica feed |
|---|---|---|---|
| **FSRR** (First-Sprint Recommendation) | +14 días post-sprint | Recommendation likelihood | Proxy NPS adelantado |
| **RCI** (Repeat Contract Intent) | +30 días post-sprint | Intent de contratar otra vez | Proxy RCR adelantado |
| **NPS 90d** | +90 días post-sprint | Net Promoter Score post-shine | Métrica canónica RCR/ERR |

**Formato v1:** email manual con link a Typeform/Google Form (Pablo manda).

**Formato v2 (Fase 4):** automated trigger desde `simulador.customer_retention_events` table → templates en `lib/simulador/copy/emails.ts` extendidos.

## Survey 1 — FSRR (First-Sprint Recommendation Rate)

**Timing:** +14 días post-sprint cierre.

**Por qué +14 días:** suficiente tiempo para que el manager haya recibido el reporte ejecutivo + lo haya leído + discutido con su equipo o supervisor. Pero antes del "deliverable shine" decay (típico ~30 días).

**Audiencia:** solo el manager (buyer principal), NO participantes.

**Length:** 3 preguntas. Ultra-corto para maximizar response rate.

### Email body

```
Asunto: ¿Cómo te fue con el diagnóstico de [nombre del equipo]?

Hola [nombre del manager],

Pasaron 2 semanas desde que tu equipo completó el diagnóstico Itera. 
Te queremos preguntar 3 cosas — toma 90 segundos.

[Link al survey]

Es para mejorar el producto, no para venderte. Tu respuesta es 
confidencial.

Gracias,
Pablo
```

### Survey content

**Pregunta 1 (recommendation - core FSRR):**

> ¿Recomendarías Itera a otro Head/VP/Director de tu network que esté pensando cómo medir el criterio de su equipo en uso de IA?
> 
> ○ Sí, lo recomendaría con confianza
> ○ Quizás — depende del contexto
> ○ No, no lo recomendaría
> ○ Aún no lo tengo claro

**Pregunta 2 (open-text, friction discovery):**

> ¿Qué fue lo más confuso o lo que cambiarías del proceso? (deja en blanco si nada)
> 
> [text area, opcional]

**Pregunta 3 (use case validation):**

> En una frase, ¿cómo describirías a otra persona qué hizo Itera para tu equipo?
> 
> [text area, opcional]

### Métricas extraídas

- **FSRR**: % de respondents que eligen "Sí, lo recomendaría con confianza"
- **Target verde v1**: ≥70% (Sí + Quizás combinados — interpretation generous v1)
- **Friction signals**: aggregate de P2 — top 3 issues por frecuencia
- **Frame validation**: aggregate de P3 — qué dicen vs qué queremos que digan ("diagnóstico operativo de criterio en uso de IA")

### Anti-patterns en el survey

- ❌ **NO mostrar precios** ni "¿pagarías de nuevo?" — eso es RCI (Survey 2)
- ❌ **NO 10+ preguntas** — drop rate >50% sobre 5 preguntas
- ❌ **NO logo bombing** ni "estaría agradecido si te tomas el tiempo" — Pablo conversacional, no corporate
- ❌ **NO promesa de respuesta directa** ("te respondemos en 24h") — el survey es para nosotros, no servicio al cliente

## Survey 2 — RCI (Repeat Contract Intent)

**Timing:** +30 días post-sprint cierre.

**Por qué +30 días:** el manager ya tomó decisiones operativas basadas en el reporte (asignaciones, conversaciones con su equipo). Suficiente data point para evaluar value real.

**Audiencia:** manager principal + opcionalmente CFO o quien aprobó la compra original.

**Length:** 5 preguntas.

### Email body

```
Asunto: ¿Sigues pensando en Itera para tu equipo?

Hola [nombre del manager],

Pasaron 30 días desde tu diagnóstico. Queremos saber qué decisiones 
operativas tomaste (o no tomaste) con el reporte, y si planeas usar 
Itera otra vez.

5 preguntas, toma 3 minutos.

[Link al survey]

Confidencial. No vamos a usar tu respuesta en marketing sin confirmar.

Pablo
```

### Survey content

**Pregunta 1 (RCI core):**

> ¿Planeas contratar Itera otra vez en los próximos 6 meses (para el mismo equipo o para otro equipo)?
> 
> ○ Sí, definitivamente
> ○ Probablemente sí
> ○ Aún no lo decidí
> ○ Probablemente no
> ○ No

**Pregunta 2 (action taken):**

> En las últimas 4 semanas, ¿tomaste alguna decisión operativa con el reporte de Itera? (pilotar / entrenar / pausar / escalar / otra)
> 
> ○ Sí, autoricé pilotar a [N] personas en flujos con IA
> ○ Sí, asigné entrenamiento o practice específico a [N] personas
> ○ Sí, pausé el uso de IA en flujos sensibles para [N] personas
> ○ Sí, escalé al equipo legal/compliance/IT
> ○ Sí, otra acción (especifica)
> ○ No, todavía estoy procesando el reporte
> ○ No, el reporte no aplicaba a mi decisión

**Pregunta 3 (expansion intent):**

> Si fueras a contratar otra vez, ¿qué tier elegirías?
> 
> ○ Diagnóstico de nuevo (mismo equipo en 6 meses)
> ○ Diagnóstico para otro equipo (Sales, CS, Ops, etc.)
> ○ Sprint (8 casos + practice + re-simulación)
> ○ Track completo N1-N3
> ○ Aún no lo sé

**Pregunta 4 (open-text, blocker discovery):**

> ¿Qué te detiene de contratar de nuevo (si algo te detiene)?
> 
> [text area]

**Pregunta 5 (referral discovery):**

> ¿Has mencionado Itera a algún colega? Si sí, ¿qué les dijiste?
> 
> [text area, opcional]

### Métricas extraídas

- **RCI %**: % de respondents que eligen "Sí, definitivamente" + "Probablemente sí" (combined)
- **Target verde v1**: ≥60%
- **ERR signal forecast**: distribución de P3 (¿qué tier piensan?). Si ≥40% piensan upgrade a Sprint/Track, ERR forecast >110%
- **Action taken validation**: % de respondents que ejecutaron acción operativa (P2 NO "no, todavía procesando" / "no, no aplicaba")
- **Blockers identified**: aggregate de P4 — top 3 razones por las que NO contratan otra vez
- **Word-of-mouth signal**: cuántos respondents han mencionado Itera (P5)

### Acción si RCI <30%

Producto no está generando suficiente value para repeat. Pablo + claude retrospect:

1. Review P4 blockers — ¿pricing? ¿calidad del reporte? ¿onboarding fricción?
2. Review P2 action taken — si ≥50% "no, todavía procesando", el reporte es demasiado denso o no actionable
3. Considerar pivot del positioning o iteración del reporte template

## Survey 3 — NPS 90d delayed

**Timing:** +90 días post-sprint cierre.

**Por qué +90 días:** suficiente tiempo para que el manager haya integrado el reporte a su operación, haya visto resultados de las decisiones tomadas, y haya tenido conversaciones cross-functional sobre IA en su org. Mide retention real, no shine.

**Audiencia:** manager principal + opcionalmente otros stakeholders que vieron el reporte (CFO/COO/CTO).

**Length:** 4 preguntas. Más enfocado que RCI.

### Email body

```
Asunto: 90 días después — ¿cómo va con el criterio de [equipo]?

Hola [nombre del manager],

Pasaron 90 días desde tu diagnóstico Itera. Ya tienes datos reales 
sobre cómo decide tu equipo con IA. 

¿Nos cuentas cómo va?

4 preguntas, 2 minutos.

[Link al survey]

Pablo
```

### Survey content

**Pregunta 1 (NPS classic):**

> En una escala de 0 a 10, ¿qué tan probable es que recomiendes Itera a un colega que esté pensando cómo medir el criterio de su equipo en uso de IA?
> 
> [0 ... 10 slider]

**Pregunta 2 (NPS reason):**

> ¿Cuál es la razón principal de tu calificación?
> 
> [text area]

**Pregunta 3 (sustained value):**

> 90 días después, ¿el reporte de Itera te ayudó a tomar decisiones operativas que SIN Itera no habrías tomado? (o las habrías tomado distinto)
> 
> ○ Sí, claramente cambió decisiones que tomé
> ○ Sí, parcialmente — me dio data adicional pero la decisión la habría tomado igual
> ○ No, las decisiones las habría tomado igual sin Itera
> ○ No estoy seguro

**Pregunta 4 (case study consent):**

> ¿Estarías dispuesto a hacer un case study público con Itera? (con anonimización si prefieres)
> 
> ○ Sí, con mi nombre y nombre de la org
> ○ Sí, pero anonimizado (industria + tamaño, sin nombres)
> ○ No, prefiero mantener confidencial
> ○ Quizás, hablémoslo

### Métricas extraídas

- **NPS**: estándar — % promoters (9-10) − % detractors (0-6)
- **Target verde v1**: ≥30 a 90 días
- **Sustained value %**: % de respondents que dicen "Sí, claramente cambió decisiones" (P3) — proxy de retention real
- **Case study leads**: respondents que respondieron Sí o Quizás en P4 (P4)

### Acción según NPS

| NPS rango | Acción |
|---|---|
| ≥50 | Excellent — pedir referrals + caso de uso + advocate program |
| 30-50 | Healthy — sigue ejecutando + iterate based en P2 razones |
| 0-30 | Producto entrega valor pero no advocacy. P2 dice por qué. |
| <0 | Producto no entrega valor sostenido. Retrospective profunda. |

## Logística operativa

### v1 manual

**Pablo manda 3 emails por customer cerrado:**
- Día +14: Survey 1 (FSRR)
- Día +30: Survey 2 (RCI)
- Día +90: Survey 3 (NPS)

Recordatorios al día siguiente si no respondió. Máx 2 recordatorios — más es spam.

**Survey platform:** Google Forms o Typeform. Costo cero o <$50/mes.

**Tracking:** spreadsheet de Pablo con columnas:
- Customer ID + email
- Sprint cierre date
- Survey 1 send / response / score
- Survey 2 send / response / score
- Survey 3 send / response / score
- Notes

### v2 automated (Fase 4)

Codex implementa trigger en `simulador.customer_retention_events`:

```sql
-- Trigger event al cerrar sprint
insert into simulador.customer_retention_events (organization_id, event_type)
values (org_id, 'sprint_closed');

-- Cron job o equivalent dispara survey emails:
-- +14 días → manda FSRR survey link
-- +30 días → manda RCI survey link
-- +90 días → manda NPS survey link
```

Email templates extender en `lib/simulador/copy/emails.ts`:

```typescript
survey_fsrr_14d: {
  subject_template: (teamName) => `¿Cómo te fue con el diagnóstico de ${teamName}?`,
  body_text: /* ... */,
  body_html: /* ... */,
  cta_label: "Responder en 90 segundos →",
  cta_href_template: (sessionId) => `https://itera.la/surveys/fsrr?session=${sessionId}`,
},
survey_rci_30d: { /* similar */ },
survey_nps_90d: { /* similar */ },
```

Y endpoint `/api/surveys/[surveyType]` para capturar responses en `simulador.customer_retention_events`.

## Cierre del loop con métricas canónicas

Las 3 surveys feeden las 5 métricas canónicas:

| Survey | Feeds |
|---|---|
| FSRR +14d | FSRR proxy (P1) + friction discovery (P2) + frame validation (P3) |
| RCI +30d | RCI proxy (P1) + action validation (P2) + ERR forecast (P3) + blockers (P4) + word-of-mouth (P5) |
| NPS 90d | NPS canónico (P1) + sustained value % (P3) + case study leads (P4) |

Combinado con:
- **TTRC**: medible cuando 2do contrato cierre (event-driven, no survey)
- **CAC Payback**: calculado desde spreadsheet de Pablo (Pablo time + tools cost / customers)

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D46
    decision: "3 surveys ejecutables post-sprint (FSRR +14d / RCI +30d / NPS +90d) con templates exactos definidos. Pablo manda manual v1 vía Google Forms o Typeform. Codex automatiza en Fase 4 v2 roadmap"
    rationale: "Manual v1 con N<10 customers es trivial. Automation pre-customer-zero es premature. Los 3 surveys cierran el loop de las 5 métricas canónicas Itera definidas en M9-3-D39."
    change_type: methodology
    files_to_touch:
      - docs/research/post_customer_zero_survey_template.md
      - lib/simulador/copy/emails.ts (extender en Fase 4)
      - supabase/migrations/0XX_customer_retention_events.sql (Fase 4)
    owner: pablo (v1 manual) + codex (v2 automation)
    blocked_by: []
    priority: normal

  - id: M9-3-D47
    decision: "Survey 3 (NPS 90d) incluye case study consent question. Capturar advocate signal early — case studies amplifican comms post-launch (M9-3-D18 cero paid acquisition, content marketing weak)"
    rationale: "Con cero paid acquisition, case studies son fuel principal de Pablo LinkedIn + sales. Pedir consent en NPS 90d (cuando customer ya valorida) > pedir en cold outreach. Ratio aceptación esperada 30-40% según ChartMogul 2024."
    change_type: comms_methodology
    files_to_touch:
      - docs/research/post_customer_zero_survey_template.md
    owner: pablo
    blocked_by: []
    priority: normal

  - id: M9-3-D48
    decision: "Recordatorios máx 2 por survey. Más es spam — daña relationship más de lo que aporta data"
    rationale: "B2B mid-market LATAM tiene fatiga survey alta. Pablo personal email > corporate auto-blast. Si responde en email 1 o recordatorio 1, OK. Si no responde 3 veces, asume non-respondent y mueve."
    change_type: operations
    files_to_touch:
      - docs/research/post_customer_zero_survey_template.md
    owner: pablo
    blocked_by: []
    priority: low
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Pre-customer-zero:** ninguna acción inmediata. Templates están ready para usar.
2. **Customer #1 cierre + 14 días:** Pablo manda Survey 1 FSRR manual.
3. **Customer #1 cierre + 30 días:** Pablo manda Survey 2 RCI manual.
4. **Customer #1 cierre + 90 días:** Pablo manda Survey 3 NPS manual.
5. **Fase 4 v2 roadmap:** codex implementa automation.
