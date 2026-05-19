---
type: research
title: Risk events taxonomy v2 — review del catálogo 11 events
date: 2026-05-19
author: claude
reviewers: [codex, pablo]
status: published
scope: review depth del catálogo actual de 11 risk events (CHECK constraint en simulador.risk_events) vs flows reales del buyer LATAM mid-market. Identifica redundancia, gaps y calibración
related:
  - supabase/migrations/017_simulador_v0.sql (CHECK constraint actual)
  - docs/simulador/contrato_v0/casos/*.yaml (8 casos donde se disparan)
  - lib/simulador/copy/report.ts (humanización en reporte)
  - lib/simulador/copy/field-test.ts (severity_labels)
---

# Risk events taxonomy v2 — review

## TL;DR

Review del catálogo actual de **11 risk event types** (CHECK constraint en migración 017 + extendido en 021). Validación cross-vs:
- 8 casos primary YAML (Marketing/Growth sprint)
- Buyer persona LATAM mid-market (M9-3-D14)
- 5 dimensiones rúbrica (contexto/privacidad/validación/juicio/decisión)
- Override matrix (4 caminos: pilotar/entrenar/pausar/escalar)

**Conclusión: catálogo SOLID para v1.** No hay redundancia funcional, todos los 11 mapean a dimensiones distintas, severities están proporcionalmente distribuidas. **2 gaps identificados para v2** (post-customer-zero):

1. `output_used_without_attribution` — uso de output IA sin citar/aclarar autoría (relevante Marketing/Sales)
2. `decision_under_undisclosed_ai_assistance` — manager toma decisión sin saber que el output que recibió fue generado con IA

Ambos pueden esperar v2 (post 5 customers). v1 con 11 catálogo es suficiente.

## Catálogo actual — los 11 events

Source: `supabase/migrations/017_simulador_v0.sql` línea 248-260.

| # | event_type slug | Dimensión típica | Severity range | Categoría |
|---:|---|---|---|---|
| 1 | `exposed_pii_to_model` | privacidad | high–critical | PII / compliance |
| 2 | `hidden_pii_usage_from_authority` | privacidad + juicio | high | PII / governance |
| 3 | `accepted_unverified_claim` | validación | medium–high | Verificación output |
| 4 | `accepted_hallucinated_figures` | validación | high | Verificación output |
| 5 | `used_sensitive_commercial_data` | privacidad | medium–high | Confidencialidad |
| 6 | `shared_third_party_confidential` | privacidad + juicio | high | Confidencialidad terceros |
| 7 | `used_unapproved_vendor` | juicio + decisión | medium | Governance vendor |
| 8 | `prompt_injection_unawareness` | validación + juicio | low–medium | Security / awareness |
| 9 | `over_relied_on_output` | juicio | medium | Confianza calibrada |
| 10 | `overblocked_without_discrimination` | decisión | low–medium | Falso negativo |
| 11 | `ignored_escalation_path` | juicio + decisión | medium–high | Governance |

## Análisis por dimensión

### Privacidad (5 events)

- 1 `exposed_pii_to_model`
- 2 `hidden_pii_usage_from_authority`
- 5 `used_sensitive_commercial_data`
- 6 `shared_third_party_confidential`

**Validación:** dimensión más representada (5 de 11 events). Razonable — privacidad es el dolor más prevalent en buyer LATAM (M9-3-D14 latent "terror PII"). LFPDPPP MX + Ley 1581 CO requieren tracking de estos. ✓

**Gap identificado:** falta event para "almacenó output IA con PII en sistema sin política de retención" — pero es debatible si esto es responsabilidad de Itera medir o si pertenece a auditor de compliance separado. Lock v1.

### Validación (3 events)

- 3 `accepted_unverified_claim`
- 4 `accepted_hallucinated_figures`
- 8 `prompt_injection_unawareness`

**Validación:** dimensión core del producto (Itera mide criterio en uso de IA = validar output). 3 events es proporcional. ✓

**Gap menor:** `prompt_injection_unawareness` puede colapsar con `accepted_unverified_claim` en casos N1. La diferencia es: prompt_injection es ataque del modelo / adversarial; unverified_claim es claim normal sin verificar. Mantener separados — captura intención distinta.

### Juicio (3 events compartidos)

- 7 `used_unapproved_vendor` (juicio + decisión)
- 9 `over_relied_on_output`
- 11 `ignored_escalation_path` (juicio + decisión)

**Validación:** la dimensión juicio captura "saber cuándo escalar / cuándo no fiarse / cuándo no usar". 3 events captura los 3 momentos críticos. ✓

### Decisión (2 events compartidos)

- 10 `overblocked_without_discrimination` (solo decisión)
- 7 + 11 (compartidos arriba)

**Validación:** decisión es la "salida" del flujo — captura "cómo entregó la respuesta final". 2 events son adecuados para v1.

**Gap potencial:** falta event "delivered_to_manager_with_misleading_framing" — output IA entregado al manager presentado como propio sin disclosure. Esto es importante para Marketing/Sales (output a CMO/CEO sin clarificar "usé IA"). Candidato a v2: `output_used_without_attribution`.

### Contexto (0 events)

**Validación:** contexto es la dimensión INPUT (encuadrar el problema antes de prompt). Errores de contexto NO se manifiestan en risk events visibles — se manifiestan en mala banda en la dimensión "contexto" del reporte. ✓ No necesita events propios.

## Análisis por severity

Severity range del catálogo:
- **High–Critical:** 1, 2 (PII exposed/hidden)
- **High:** 4, 6 (hallucinated figures, third-party confidential)
- **Medium–High:** 3, 5, 11 (unverified, commercial data, escalation)
- **Medium:** 7, 9 (vendor, over-reliance)
- **Low–Medium:** 8, 10 (prompt injection, overblock)

**Validación:** distribución es coherente con el modelo de riesgo:
- PII tiene el peso más alto (compliance LATAM)
- Hallucinated > unverified (porque el operador "creyó" output falso)
- Vendor < PII (porque vendor unapproved es policy violation, no daño directo)
- Overblock < otros (porque es falso negativo, NO causa daño activo)

Sin recalibración necesaria v1. ✓

## Distribución probable por caso (Marketing/Growth sprint)

Mapeo 8 casos primary → events más probables:

| Caso | Events más probables |
|---|---|
| marketing_urgent_campaign_pii | 1, 2, 5 (PII heavy) |
| marketing_copy_with_brand_voice | 3, 4, 9 (verification heavy) |
| marketing_segment_with_sensitive_data | 1, 5, 7 (PII + vendor governance) |
| marketing_brief_to_agency_via_ia | 6, 9, 11 (third-party + escalation) |
| marketing_ad_creative_with_competitor_research | 3, 4, 6 (validation + competitive intel) |
| marketing_attribution_reporting_to_cmo | 4, 9, 11 (hallucinated figures + over-reliance + escalation) |
| marketing_content_calendar_under_pressure | 3, 9, 10 (validation + over/underblock) |
| marketing_crisis_response_with_ia | 4, 11, 8 (hallucinated under crisis + escalation) |

**Cobertura:** los 11 events están todos disparables en al menos 1 caso. ✓ Ningún event "huérfano" (nunca disparable en v1).

## Gaps identificados para v2 (post-customer-zero)

### Gap 1: `output_used_without_attribution`

**Definición candidata:** participante usa output IA en deliverable final SIN clarificar al manager/cliente que fue generado con IA. No es violación de privacidad ni de validación — es violación de transparencia.

**Dimensión asociada:** decisión + juicio
**Severity:** medium (low si interno; medium si externo)
**Why v2 no v1:** los 11 actuales cubren los riesgos materiales. Atribución es riesgo de transparencia / reputational, que aparece en empresas más maduras (post-customer-zero ya tendremos signal de si esto es common pain).

### Gap 2: `decision_under_undisclosed_ai_assistance`

**Definición candidata:** manager o stakeholder toma una decisión basado en output que NO sabe que fue generado con IA. Inverso del Gap 1 (focus en el receiver, no el emisor).

**Dimensión asociada:** juicio
**Severity:** medium–high (depende del peso de la decisión)
**Why v2:** mismo razonamiento. Es riesgo de governance que escala con la madurez de la org.

## No gaps — solidaridad del v1

Items considerados pero descartados como NO necesarios v1:

- ❌ "model_jailbreak_attempted" → trivial en uso casual, no es indicador útil
- ❌ "tokens_wasted_excessive" → métrica de costo, no de criterio
- ❌ "model_version_mismatch" → ops issue, no decisión humana
- ❌ "session_terminated_prematurely" → behavior event, no risk event
- ❌ "feedback_loop_uncalibrated" → demasiado abstracto para evidencia textual

## Recomendaciones

### v1 (immediate)

**NO cambiar el CHECK constraint.** Los 11 events son suficientes para Sprint Marketing/Growth + cubren los risks materiales del buyer LATAM identificados.

**Validar en field-test data:** después de 50+ field-tests completados, hacer query agregada:

```sql
select event_type, count(*), avg(judge_confidence)
from simulador.risk_events
group by event_type
order by count(*) desc;
```

Si algún event aparece 0 veces en 50+ sesiones, considerar deprecate. Si los 11 aparecen, lock.

### v2 (post-customer-zero, 5+ customers)

Agregar 2 events identificados como gaps:
- `output_used_without_attribution` (transparency)
- `decision_under_undisclosed_ai_assistance` (governance)

Requiere migración Alembic-style:
```sql
alter table simulador.risk_events drop constraint risk_events_event_type_check;
alter table simulador.risk_events add constraint risk_events_event_type_check
  check (event_type in (
    -- 11 existing
    'exposed_pii_to_model', /* ... */, 'ignored_escalation_path',
    -- 2 new
    'output_used_without_attribution',
    'decision_under_undisclosed_ai_assistance'
  ));
```

Y actualizar:
- `lib/simulador/copy/report.ts.risk_events_section` con humanización de los 2 nuevos
- `lib/simulador/copy/field-test.ts.report.risk_events_section` mismo
- `lib/simulador/judge/prompt-builder.ts` para que el LLM detecte los 2 nuevos
- Rúbrica yaml para clarificar trigger conditions

### v3+ (future)

Considerar split por carrera. Marketing/Growth puede tener events específicos (`brand_voice_drift`) que no aplican a Sales (que tendría `committed_to_unverified_quote`) ni a Engineering (`generated_code_unreviewed`). Catálogo se vuelve árbol jerárquico:

```
risk_events
├── universal (los 11 actuales — aplican cross-carrera)
└── career-specific
    ├── marketing_growth (brand_voice_drift, etc.)
    ├── sales (committed_unverified_quote, etc.)
    ├── engineering (code_unreviewed_critical, etc.)
    └── ...
```

NO requerido v1/v2. Solo cuando expansion de carreras lo amerite (próximos 12+ meses).

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D22
    decision: "Lock catálogo 11 risk events para v1. Validar empíricamente con query agregada después de 50+ field-tests; si algún event aparece 0 veces, considerar deprecate en v2"
    rationale: "Los 11 events cubren las 5 dimensiones (privacidad 5 + validación 3 + juicio 3 + decisión 2 + contexto 0 propias). Distribución de severities coherente. Todos disparables en al menos 1 caso primary. Sin cambios estructurales necesarios v1."
    change_type: catálogo
    files_to_touch:
      - supabase/migrations/017_simulador_v0.sql (no changes v1)
    owner: claude
    blocked_by: []
    priority: normal

  - id: M9-3-D23
    decision: "Agregar 2 events en v2 (post-customer-zero): output_used_without_attribution (transparency) + decision_under_undisclosed_ai_assistance (governance). Requiere migración + update copy report/field-test + prompt-builder judge"
    rationale: "Los 2 gaps identificados son riesgos de transparencia/governance que escalan con la madurez de la org. v1 con 11 events es suficiente para Sprint Marketing/Growth. v2 agrega cobertura cuando tengamos signal de customers reales (no anticipar)."
    change_type: catálogo
    files_to_touch:
      - supabase/migrations/0XX_risk_events_v2.sql
      - lib/simulador/copy/report.ts (risk_events_section humanización)
      - lib/simulador/copy/field-test.ts (severity_labels mismo)
      - lib/simulador/judge/prompt-builder.ts
    owner: claude (specs) + codex (migration)
    blocked_by:
      - 5_customers_cerrados
    priority: low

  - id: M9-3-D24
    decision: "v3+ (futuro post 12 meses): considerar split jerárquico universal vs career-specific cuando expansion de carreras lo amerite. NO anticipar arquitectura prematuramente"
    rationale: "Split jerárquico es decisión arquitectural mayor. Solo justifica cuando tenemos ≥3 carreras activas y signal claro de que un catálogo único colapsa. Sales/CS/Ops pueden funcionar con catálogo universal mientras los events sean genéricos (validation/privacy/judgment cross-carrera)."
    change_type: deuda_arquitectural
    files_to_touch: []
    owner: claude (decision pending) + codex (implementation)
    blocked_by:
      - 3_carreras_activas
    priority: low
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato:** NO hacer nada al catálogo v1. Está bien.
2. **Post 50 field-tests:** correr query agregada de distribución. Si algún event 0, evaluar deprecate.
3. **Post customer-zero (5+):** evaluar agregar los 2 v2 events.
4. **Post 3 carreras activas (~12 meses):** evaluar split jerárquico v3.
