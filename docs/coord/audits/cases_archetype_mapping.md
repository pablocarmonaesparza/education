---
type: audit
task_id: B3-002
date: 2026-05-19
author: claude
reviewer: codex
status: published
---

# B3-002 — Audit de 8 casos contra niveles 1-2-3 + archetype mapping

## TL;DR

Los 8 casos del sprint `marketing_30d` ahora declaran `archetype_ref` + `level_primary` + (opcional) `level_advanced_variant` en su frontmatter. El mapping respeta el principio HKS (B9-002-D2): cada caso ancla a una tensión arquetípica reconocida del INDEX. No se necesitaron arquetipos nuevos — los 12 existentes cubren las 8 tensiones.

## Tabla resumen

| Caso (slug) | Tensión declarada | archetype_ref | level_primary | level_advanced_variant |
|---|---|---|---|---|
| marketing_urgent_campaign_pii | velocidad vs privacidad | crisis-velocity-vs-precision | 1 | — |
| marketing_copy_with_brand_voice | velocidad vs voz de marca | speed-to-action-vs-validation | 1 | — |
| marketing_segment_with_sensitive_data | bias predictivo + privacidad behavioral | metric-gaming-vs-ethics | 2 | — |
| marketing_brief_to_agency_via_ia | leak estratégico a vendor externo | trust-vs-verify | 1 | — |
| marketing_ad_creative_with_competitor_research | plagio inadvertido | trust-vs-verify | 1 | — |
| marketing_attribution_reporting_to_cmo | datos parcialmente alucinados | speed-to-action-vs-validation | 2 | 3 |
| marketing_content_calendar_under_pressure | velocidad vs curaduría | speed-to-action-vs-validation | 2 | — |
| marketing_crisis_response_with_ia | velocidad vs approval chain | crisis-velocity-vs-precision | 2 | 3 |

## Distribución resultante

**Por arquetipo:**
- `speed-to-action-vs-validation`: 3 casos (copy, attribution, content_calendar) — la tensión más común en marketing/growth
- `crisis-velocity-vs-precision`: 2 casos (urgent_campaign_pii, crisis_response)
- `trust-vs-verify`: 2 casos (brief_to_agency, ad_creative_competitor)
- `metric-gaming-vs-ethics`: 1 caso (segment_with_sensitive_data)

**Por nivel primario:**
- Nivel 1 (IA como copiloto): 4 casos
- Nivel 2 (IA en workflow): 4 casos
- Nivel 3 (IA con agentes): 0 casos primarios; 2 casos con `level_advanced_variant: 3`

**Casos con variante avanzada Nivel 3:**
- `marketing_attribution_reporting_to_cmo`: variante N3 implica agentes cruzando múltiples fuentes de datos (CRM, GA, attribution platform, social) — tensión escala porque ahora el participante orquesta agentes, no sólo valida output único.
- `marketing_crisis_response_with_ia`: variante N3 implica agentes de monitoring (sentiment, press, social) actuando sobre signals — tensión escala porque el participante define los límites de acción autónoma del agente.

## Observaciones del audit

1. **Los 8 casos respetan "no enseñar antes de medir"** (verificado contra contrato §7). Cada caso construye tensión sin revelar la respuesta correcta. Sanitización §16 ya aplicada en `marketing_urgent_campaign_pii` (badges PII removidos en W6).
2. **Diversidad de arquetipos limitada a 4** — los 8 casos cubren sólo 4 de los 12 arquetipos del INDEX. Esto es esperado en v1 (track Marketing/Growth con tensiones core). Cuando expandamos a Sales/Ops/CS, los arquetipos restantes (entry-without-plan, incentives-vs-risk, pause-or-double-down, timeline-pressure-ignores-risk, defer-expertise-vs-authority, incremental-vs-redesign, cannibalize-or-preserve, thoroughness-vs-deadline) entrarán.
3. **Sesgo a Nivel 1/2** — cero casos primary N3. Esto refleja la realidad LATAM 2026: la mayoría de equipos de marketing/growth todavía usan IA como copiloto, no como agentes autónomos. Las variantes advanced N3 sirven para participantes/equipos que ya operan en N3 (early adopters). Validar con primeros 3 design partners si esta distribución resuena.

## Decisiones producto

<!-- decisions:data:start -->
```yaml
decisions:
  - id: B3-002-D1
    decision: "Validator M5 enforce archetype_ref + level_primary obligatorios en frontmatter de cada caso YAML; level_advanced_variant opcional"
    rationale: "Audit demuestra que el mapping es factible (8/8 mapean a arquetypes existentes). Validator debe rechazar imports de YAMLs sin archetype_ref. Sin enforcement, casos futuros divergen del contrato HKS."
    change_type: rubric
    files_to_touch:
      - scripts/simulador/validate-case-yaml.mjs
      - docs/quality/case_admission_checklist.md
    owner: claude
    blocked_by:
      - B3-001-D1
    priority: high

  - id: B3-002-D2
    decision: "Re-correr seed-cases.mjs después del patch a 8 YAMLs para propagar archetype_ref + level_primary a BD via case_templates columnas nuevas (mig 021)"
    rationale: "Mig 021 agregó las columnas; mis updates a frontmatter pueblan los YAMLs; el seed necesita re-correr para que los rows en simulador.case_templates reflejen los valores. Codex ejecuta el re-seed (owner: codex)."
    change_type: process
    files_to_touch:
      - scripts/simulador/seed-cases.mjs
      - supabase/migrations/20260519021000_simulador_premium_schema_021.sql
    owner: codex
    blocked_by: []
    priority: high

  - id: B3-002-D3
    decision: "v1 sprint Marketing/Growth se vende como 'Sprint Nivel 1+2' explícito; Nivel 3 queda como add-on advanced opcional"
    rationale: "Distribución del audit muestra 4 casos N1 + 4 casos N2 + 0 casos primary N3 (sólo variantes). El pitch comercial debe ser honesto: 'Sprint cubre IA copiloto + IA en workflow. Para equipos que ya usan IA agentic, agregamos las 2 variantes N3 (attribution + crisis) como módulo opcional'. Esto evita oversell de 'Sprint completo Nivel 1-2-3' cuando realmente es 1+2."
    change_type: copy
    files_to_touch:
      - lib/simulador/copy/sales.ts
      - lib/simulador/copy/landing.ts
      - lib/simulador/config.ts
    owner: claude
    blocked_by: []
    priority: high

  - id: B3-002-D4
    decision: "Expand v2 Marketing/Growth a 12 casos (los 8 actuales + 4 nuevos que cubran los 8 arquetipos sin uso en v1)"
    rationale: "INDEX tiene 12 arquetipos. v1 sólo usa 4 (speed-to-action, crisis-velocity, trust-vs-verify, metric-gaming). v2 agregaría 4 casos nuevos en arquetipos no cubiertos: entry-without-plan (IA piloto sin política), pause-or-double-down (cuándo cortar piloto IA), defer-expertise-vs-authority (objetar a VP), thoroughness-vs-deadline (consulting style). Esto da catálogo completo Marketing/Growth para clientes recurrentes (re-sprint anual)."
    change_type: process
    files_to_touch:
      - docs/research/marketing_v2_case_expansion_plan.md
    owner: claude
    blocked_by:
      - B3-002
    priority: low
```
<!-- decisions:data:end -->

## Verificación post-audit (corre Codex)

```bash
# Re-correr seed para propagar a BD
cd /Users/pablocarmona/Desktop/Projects/Itera/Development/Web
node scripts/simulador/seed-cases.mjs --apply

# Verificar columnas pobladas
psql ... -c "
select slug, level_primary, level_advanced_variant, career_key, archetype_ref
from simulador.case_templates
where career_key = 'marketing'
order by slug;
"
```

Expected: 8 rows, todas con `level_primary in (1,2)`, `archetype_ref` populated, `career_key = 'marketing'`.
