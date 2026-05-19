---
type: archetypes_index
title: 12 arquetipos narrativos HBR/MIT/HKS aplicados a contexto IA — sin IP
task_id: B3-001
version: 1.0.0-draft
date: 2026-05-19
authors: [claude]
reviewers: [codex]
notes_de_confianza: "Estos arquetipos NO son copias de casos licenciados. Toman la estructura narrativa de casos clásicos (decision point, conflicto entre stakeholders, withheld resolution) y la trasplantan a contextos IA + LATAM + SaaS B2B mid-market sin reproducir nombres propios, datos numéricos o copy específico de las fuentes originales. Cumplen con la regla HKS: 'casos buenos se construyen con investigación documental + entrevistas, no ocurrencias' — el research base son los casos públicos referenciados como inspiración estructural, no como fuente textual."
---

# 12 arquetipos narrativos para Itera

## Por qué 12 y por qué estos

Cada arquetipo mapea a una **tensión operativa universal en uso de IA en empresa** que se observa en flujos reales de marketing/growth/ops/sales LATAM. Cada uno es **adaptable a múltiples carreras** (no exclusivo de un departamento) y a **los 3 niveles de dificultad operativa** (N1 IA como copiloto · N2 IA en workflow · N3 IA con agentes).

## Lista canónica

| # | Slug | Tensión arquetípica | Inspiración estructural | N1 | N2 | N3 |
|---|---|---|---|---|---|---|
| 1 | `entry-without-plan` | Estrategia formal vs descubrimiento accidental | Honda en EEUU (Pascale) | ✓ | ✓ | — |
| 2 | `incentives-vs-risk` | Incentivar adopción vs uso descontrolado | Lincoln Electric | — | ✓ | ✓ |
| 3 | `pause-or-double-down` | Continuar invertir vs admitir fracaso | Newton / pivot failures | ✓ | ✓ | ✓ |
| 4 | `crisis-velocity-vs-precision` | Velocidad de respuesta vs precisión | Tylenol crisis (J&J 1982) | ✓ | ✓ | — |
| 5 | `timeline-pressure-ignores-risk` | Presión de deadline vs evidencia técnica | Challenger O-rings | ✓ | ✓ | ✓ |
| 6 | `defer-expertise-vs-authority` | Defer a expertise vs presión de autoridad | Cuban Missile Crisis (ExComm) | ✓ | ✓ | ✓ |
| 7 | `metric-gaming-vs-ethics` | Cumplir métrica vs ética del proceso | VW emissions | — | ✓ | ✓ |
| 8 | `incremental-vs-redesign` | Cambio piecemeal vs rediseño workflow | Sears digital decline | — | ✓ | ✓ |
| 9 | `speed-to-action-vs-validation` | Acción rápida vs validación rigurosa | Toyota Way / Lean | ✓ | ✓ | — |
| 10 | `cannibalize-or-preserve` | Reemplazar workflow current vs status quo | Netflix DVD → streaming | — | ✓ | ✓ |
| 11 | `trust-vs-verify` | Confiar en sistema vs verificar | Boeing MCAS / 737 MAX | ✓ | ✓ | ✓ |
| 12 | `thoroughness-vs-deadline` | Rigor analítico vs deadline del cliente | Consulting "by Monday" classic | ✓ | ✓ | — |

## Cómo se usa

1. Cada arquetipo tiene 1 documento detallado en este directorio: `<slug>.md`.
2. Cuando se escribe un caso nuevo (e.g., `marketing_attribution_reporting_to_cmo_v1.yaml`), declara `archetype_ref: thoroughness-vs-deadline` en el frontmatter.
3. El validador `scripts/simulador/validate-case-yaml.mjs` (M5 quality bar) verifica que `archetype_ref` corresponda a un arquetipo existente.
4. Esto satisface el principio HKS: el caso tiene fundamento documental verificable + investigación previa, no es ocurrencia aislada.

## Mapeo a carreras (v1)

- **Marketing/Growth**: 1, 3, 4, 5, 6, 9, 11, 12 son los más resonantes.
- **Sales**: 4, 6, 11, 12.
- **Ops**: 2, 5, 7, 8, 10, 11.
- **Customer Success**: 4, 6, 9, 11.
- **Finance/Legal/HR/Product/Engineering**: a desarrollar en v2 con research específico de carrera.

## Source notes (sin IP licensing)

Los nombres "Honda en EEUU", "Lincoln Electric", "Tylenol crisis", etc. son referencias **estructurales públicas** documentadas en libros de business strategy (Pascale, Porter, Christensen, Drucker), no copias de casos HBR licenciados. La estructura narrativa "stakeholder en conflicto + decision point + withheld resolution" no está protegida por copyright; lo está el texto específico del caso HBR.

Itera escribe **historias originales** en cada `casos/*_v*.yaml` que toman la estructura del arquetipo, **NO** el texto. Esto sigue el modelo de cómo Wharton Interactive (cerrada en 2025), Forage, Attensi construyen contenido sin licencia HBR.

## Versionado

`INDEX.md@1.0.0-draft` (este doc). Patch bump cuando cambias copy de un arquetipo individual. Minor cuando agregas arquetipo 13+. Major cuando cambias slug o tensión arquetípica (forza revisión de casos existentes que referencian).

## Decisiones producto

<!-- decisions:data:start -->
```yaml
decisions:
  - id: B3-001-D1
    decision: "Cada caso YAML en docs/simulador/contrato_v0/casos/ debe declarar archetype_ref: <slug> en frontmatter; el validator M5 verifica que slug existe en /archetypes/"
    rationale: "HKS principle: casos buenos vienen de research documental, no ocurrencias. archetype_ref obliga a anclar cada caso a una tensión arquetípica reconocida. Sin este anchor, los YAMLs degeneran en escenarios sintéticos."
    change_type: rubric
    files_to_touch:
      - scripts/simulador/validate-case-yaml.mjs
      - docs/quality/case_admission_checklist.md
      - docs/simulador/contrato_v0/casos/marketing_urgent_campaign_pii_v1.yaml
    owner: claude
    blocked_by:
      - B3-002
    priority: high

  - id: B3-001-D2
    decision: "Los 8 casos actuales del sprint marketing_30d deben mapearse a archetypes (auditoría B3-002)"
    rationale: "Sin archetype_ref en cada caso existente, el quality bar M5 fallaría retroactivamente. B3-002 (auditar 8 casos contra niveles 1-2-3) se extiende a mapear archetype_ref también. Si un caso no mapea a ningún arquetipo en INDEX, o se elimina el caso o se agrega arquetipo nuevo (minor bump del INDEX)."
    change_type: process
    files_to_touch:
      - docs/simulador/contrato_v0/casos/
      - docs/coord/audits/cases_archetype_mapping.md
    owner: claude
    blocked_by: []
    priority: high

  - id: B3-001-D3
    decision: "v2 expand arquetipos a Sales / Ops / CS / Finance carreras requiere research carrera-específica antes de agregar arquetipos nuevos"
    rationale: "v1 INDEX cubre 12 arquetipos con resonancia primaria en Marketing/Growth. Sales/Ops/CS tienen tensiones distintas (e.g., relación con cliente, integridad de proceso, escalation paths formal). Agregar arquetipos sin research específico de cada carrera = inventar tensiones genéricas. Diferido a v2 con research dedicado por carrera."
    change_type: process
    files_to_touch:
      - docs/research/per_career_archetypes_v2_research_plan.md
    owner: claude
    blocked_by: []
    priority: low
```
<!-- decisions:data:end -->
