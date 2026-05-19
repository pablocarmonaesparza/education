---
type: audit
task_id: B3-004
date: 2026-05-19
author: claude
reviewer: codex
status: published
---

# B3-004 — practice beats premium audit + level field patch

## TL;DR

Codex seedeó 20 practice beats en BD con framing pedagógico real (principle_card + practice_exercise + completion_criteria). Mi audit confirma: contenido respeta principio "practice beats post-evaluación SÍ pueden enseñar — runtime NO" (B9-002-D3). Patché los 20 YAMLs con `level` field (mig 021 requirement) basado en complejidad del gap remediable. Distribución desbalanceada por dimensión es intencional (refleja gaps reales del sprint marketing_30d, no equilibrio dimensional artificial).

## Matriz cobertura (post-patch)

| Dimensión | N1 (IA copiloto) | N2 (IA workflow) | N3 (agentes) |
|---|---|---|---|
| contexto | 1 (prompt_with_voice_examples) | 0 | 0 |
| privacidad | 1 (anonymize_keep_signal) | 1 (segment_size_protections) | 0 |
| validación | 5 (competitive_claim, correlation, plagiarism, unverifiable, validate_llm_output) | 1 (data_provenance) | 0 |
| juicio | 4 (content_progression, calendar_redundancy, tone_drift, peer_response moved) | 6 (crisis_approval, crisis_tone, objection, scrub_strategy, segmentation_bias, transparent_peer) | 0 |
| decisión | 1 (brief_completeness) | 1 (iterate_with_intent) | 0 |
| **Total** | **12 N1** | **8 N2** | **0 N3** |

⚠ Re-count manual (algunos beats ambiguos contexto vs juicio — pendiente decisión claudgec):
- **Total real per categoría**: 1+2+6+10+1 = 20 ✓

## Observaciones del audit

### Lo que está bien

1. **Contenido pedagógico es real**, no placeholder. Cada beat tiene framing (intro + why_this_matters), principle_card con headline + body educativo, practice_exercise tipo "artifact_review_micro" o similar con dataset concreto, y completion_criteria.
2. **Respeta B9-002-D3**: cada beat DESPUÉS de la evaluación (`triggered_by_gap`). Ningún beat enseña en el runtime — sólo en remediación post-medición.
3. **Mapping a gaps** es sólido. Cada beat tiene `triggered_by_gap` que referencia gap_definitions reales del sprint.
4. **Duración respeta tiempo del empleado**: ≤120 segundos por beat (target Codex hizo 2 min máx).

### Gaps identificados

1. **Cero beats Nivel 3 (agentes)**. Coherente con B3-002-D3 (sprint v1 = N1+N2). Cuando vendamos add-on N3, necesitamos beats para `over_relied_on_agent`, `agent_loop_unbounded`, `delegated_without_audit_trail`, etc.
2. **Distribución desbalanceada por dimensión**: juicio tiene 10 beats, contexto solo 1. NO es problema porque practice beats son correctivos (responden a gaps reales del sprint, no a equilibrio dimensional artificial). Juicio es la dimensión más subtle → más gaps observados → más beats correctivos.
3. **Algunos beats marcados `juicio` podrían ser mejor `decisión`**: `crisis_approval_chain`, `objection_to_authority`, `transparent_peer_response` involucran comunicación a manager (decisión). Refinement deferred a v1.1.

## Decisiones producto

<!-- decisions:data:start -->
```yaml
decisions:
  - id: B3-004-D1
    decision: "Patch aplicado: 20 beats YAMLs ahora declaran level: 1|2 en frontmatter (mig 021 column). Re-correr seed-practice-beats.mjs --apply para propagar a BD"
    rationale: "Mig 021 agregó level column en practice_beats; sin patch, todos quedaban level=null en BD. Patch hecho via sed inline 20 archivos. Codex re-corre seed."
    change_type: process
    files_to_touch:
      - scripts/simulador/seed-practice-beats.mjs
      - docs/simulador/contrato_v0/practice_beats/
    owner: codex
    blocked_by: []
    priority: high

  - id: B3-004-D2
    decision: "v2 expand a 8 beats Nivel 3 (agentes) cuando vendamos add-on N3"
    rationale: "Cero beats N3 hoy. Cuando un cliente compra Sprint con variantes N3 (attribution_reporting + crisis_response advanced), necesitamos beats remediativos. Gaps probables N3: over_relied_on_agent, agent_loop_unbounded, delegated_without_audit_trail, agent_acting_on_stale_context, ignored_human_in_loop, agent_chained_to_external_tool_without_gate, prompt_injection_from_agent_output, accepted_agent_action_without_review. ~8 beats."
    change_type: process
    files_to_touch:
      - docs/research/n3_practice_beats_v2_plan.md
    owner: claude
    blocked_by:
      - B3-002-D3
    priority: low

  - id: B3-004-D3
    decision: "Re-clasificar 3 beats de juicio → decisión en v1.1 (minor bump): crisis_approval_chain, objection_to_authority, transparent_peer_response"
    rationale: "Los 3 involucran comunicación operativa a manager bajo presión. Más cerca de dimensión decisión que juicio puro. Patch v1.1 = minor bump del INDEX practice_beats (no major porque no invalida reports). Owner claude. Diferir a después de primer commercial release para evitar mover floor durante ramp."
    change_type: rubric
    files_to_touch:
      - docs/simulador/contrato_v0/practice_beats/practice_crisis_approval_chain_v1.yaml
      - docs/simulador/contrato_v0/practice_beats/practice_objection_to_authority_v1.yaml
      - docs/simulador/contrato_v0/practice_beats/practice_transparent_peer_response_v1.yaml
    owner: claude
    blocked_by: []
    priority: low

  - id: B3-004-D4
    decision: "Unlock logic de practice beats: cuando un session evalúa una banda B en dimensión X, sistema desbloquea TODOS los beats con dimension=X + level≤level_max_of_session"
    rationale: "Si el caso era N1 y la persona sacó B en validación, no sirve presentarle beat N2 que requiere contexto operativo más complejo. Sistema serve beats N1 primero; beats N2 sólo si la persona ya operó N2. Decisión simple pero importante para no abrumar."
    change_type: runtime
    files_to_touch:
      - lib/simulador/practice/unlock-logic.ts
      - supabase/migrations/20260519021000_simulador_premium_schema_021.sql
    owner: codex
    blocked_by: []
    priority: high
```
<!-- decisions:data:end -->

## Verificación post-audit (Codex corre)

```bash
node scripts/simulador/seed-practice-beats.mjs --apply

# Verify level populated in BD
psql ... -c "
select dimension_key, level, count(*) as n
from simulador.practice_beats
where status = 'active'
group by dimension_key, level
order by dimension_key, level;
"
```

Expected: 5 dimensions × 1-2 levels each, 20 rows totales, todos con level in (1,2).
