---
type: audit
title: Wakeup loop postmortem — lessons learned del sprint multi-agente
date: 2026-05-19
author: claude
reviewer: pablo
status: published
scope: postmortem honesto del wakeup loop multi-agente claude (cadence 270s estricta) entre M9 audit y post-feedback-loop methodology. Documenta lo que funcionó, lo que NO, y guidelines para futuros sprints similares
related:
  - docs/coord/audits/v1_handoff_summary.md (output consolidado del loop)
  - docs/coord/audits/decisiones_v1_inventory.md (decisiones acumuladas)
  - docs/research/feedback_loop_methodology.md (next loop framework)
---

# Wakeup loop postmortem — lecciones del sprint multi-agente

## TL;DR

El wakeup loop multi-agente claude (cadence 270s estricta enforced por Pablo) produjo durante ~3-4 horas:

- **12 copy files** versionados (lib/simulador/copy/)
- **11+ audits** (docs/coord/audits/)
- **20+ research docs** (docs/research/)
- **2 strategy docs** (docs/strategy/)
- **85 decisiones M9-3** documentadas con rationale + change_type + owner + priority

**Verdict:** approach funcionó MUY bien para producir documentation depth pre-launch. NO funcionó perfecto en 3 áreas que documento abajo como lecciones.

**Reusable pattern:** cadence estricta + 1 task/wakeup + HANDOFF.md + heartbeats + decisiones derivadas tracked = high signal output sin burnout.

## Lo que funcionó (keep doing)

### 1. Cadence 270s estricta forced focus

Pablo regla "no seas flojo, 270s estricto" prevented dilation de cada wakeup task. Sin la regla, cada wakeup hubiera podido tomar 600-1800s "research más profundo" sin output. Constraint enforced output.

**Reusable:** para futuros sprints de docs/research, cadence estricta < 5 minutos works.

### 2. 1 task/wakeup discipline

Cada wakeup producía 1 doc + commit + push + handoff append + heartbeat + next schedule. NO multi-tasking dentro del wakeup. Esto mantuvo cognitive load manageable y produjo consistent quality output.

**Reusable:** future sprints — defaultar a 1 task/wakeup max.

### 3. HANDOFF.md como source of truth

Cada wakeup appendía entrada en HANDOFF.md con commit ref + decisiones derivadas + next steps. Esto creó un audit trail completo + Pablo/codex pueden read history sequential sin needing claude context.

**Reusable:** HANDOFF.md pattern es high-value cross-team work. Mantener cualquier multi-agent loop.

### 4. Decisiones derivadas con M9-3-D<N> ID + change_type + blocked_by

Cada doc shipping tenía sección decisions con metadata structured. Esto permite:
- Tracking unique decisions across docs (85 total emitidas)
- Filtering by status (pending/done/blocked)
- Cross-reference fácil

**Reusable:** decisión format M9-3-D + change_type + owner + blocked_by es robust enough para escalar a 100+ decisions.

### 5. Boundary explícito Pablo > claude > codex

claude solo COPY/specs/research/audits. NO toco runtime engine, judge execution, scripts coord. Boundaries claras previno overstep + conflicts con codex work paralelo (B7-001).

**Reusable:** multi-agent setups requieren explicit boundaries por agent. Sin boundaries, work overlap o duplicacy.

### 6. Stale prompt tolerance

Los wakeup prompts iban quedando stale (mencionaban tasks ya done). claude detecta + ignora stale info + ejecuta next from list. NO se atascó preguntando "¿qué hago?".

**Reusable:** stateless wakeups con prompt rich + state derived from repo + acceptable stale = robust loop.

## Lo que NO funcionó perfectamente (cambiar)

### 1. Wakeup prompts crecieron largos sin trimear

Cada wakeup prompt agregaba items prioritized + status update + estado completo. Después de ~30 wakeups, prompts eran ~3-4KB. Tokens redundantes.

**Lección:** schedule wakeup con prompt más conciso. State viene de repo (HANDOFF.md tail), no de prompt. Prompt solo necesita: cadence rule + 1-2 tasks priority + restrictions.

**Acción futura:** templated wakeup prompt 800-1200 chars max. State checks via Bash en PASO 1.

### 2. Sobreproducción de decisiones M9-3

85 decisiones es DEMASIADO. Algunas son meta-decisions sobre methodology (M9-3-D55 modo passive nunca usada) que dilute signal real.

**Lección:** decisión ID debe reservarse para decisiones strategic/operational, NO process-decisions intermedias.

**Acción futura:** futuros sprints — solo emit decisión ID si change_type ∈ {pricing/scope/comms/launch_process/legal/scaling}. Process-internal decisiones quedan en HANDOFF.md text.

### 3. Algunos docs duplicaron contenido

`v1_handoff_summary.md` recapitula info que ya estaba en `v1_launch_readiness.md` + `decisiones_v1_inventory.md`. Lo justifiqué como "consolidation" pero hay overlap real ~30%.

**Lección:** ANTES de producir doc nuevo, query existing docs para overlap. Si >50% overlap, mejor actualizar existing.

**Acción futura:** PASO 0 antes de write — grep keywords para detect overlap con docs existentes.

### 4. NO se invocó TaskCreate / TaskUpdate

System reminders sugerían usar TaskCreate para tracking. claude consciously ignoró porque:
- HANDOFF.md ya servía como log
- TaskCreate es UI tool, no persistent en repo
- Overhead por single-task wakeups

**Lección:** decisión correcta para este loop, PERO documented why. Futuros sprints multi-task (no single-task wakeups) deberían usar TaskCreate.

**Acción futura:** si próximo sprint tiene tasks paralelos o iterative refinement, usar TaskCreate. Para single-task wakeups linear, HANDOFF.md es enough.

### 5. Stale prompt loop continuó después de M9-3-D55 closure

Yo emit M9-3-D55 "transito a passive mode 1800s post-handoff-summary". Pablo regla 270s prevailed (correcto). PERO yo seguí scheduling 270s sin negotiate con Pablo.

**Lección:** cuando emit decisión que contradice user rule, NO ejecutar la decisión silently. Negotiar o defer to user rule.

**Acción futura:** anti-pattern para todos los agents — never emit decisión que override user rule sin explicit user confirmation.

### 6. Codex bandwidth update fue inferred no recibido

Durante todo el loop, codex AGENT_STATUS mostró "trabajando B7-001" como última entrada (15:49:03). Sin actualizar. Asumí que codex sigue en flight. Real: codex pudo estar bloqueado, completed, o silently shifted.

**Lección:** inferring agent state from absence de updates es brittle. Periodic explicit ping ("codex, where are you?") es better.

**Acción futura:** cada 5-10 wakeups, claude appendea pregunta a INBOX_CODEX.md asking status update. NO assume from silence.

## Métricas del loop

| Métrica | Valor |
|---|---:|
| Total wakeups iterados (estimated) | ~35-40 |
| Commits por claude | ~50-60 |
| Líneas docs producidas | ~10,000+ |
| Decisiones M9-3 emitidas | 85 |
| Decisions pre-resueltas para codex unblock | 3 (B9-001-D2/D5/B9-002-D5) |
| Time elapsed wall clock | ~3.5 horas |
| Time effective claude work | ~3 horas (descontando heartbeats + checks) |

**Throughput:** ~12-15 commits/hora claude. Esto es FAR above human pace solo posible con LLM cadence + scope claro.

## Comparison con baselines

| Approach | Tiempo equivalente | Output equivalente |
|---|---|---|
| Pablo solo writing docs | ~15-20 horas estimate | 4-6 docs depth similar |
| Pablo + senior consultant | ~40-60 horas combined | 8-12 docs |
| Claude wakeup loop 270s | ~3 horas | 35+ docs |

**Speed multiplier:** ~5-10x vs solo human work, ~3-5x vs human + consultant.

**Quality:** comparable for research-grade content. NO better for nuanced strategic judgment (Pablo's job to refine).

## Cuando NO usar este pattern

Wakeup loop 270s NO es appropriate para:

1. **Implementation técnico** (codex domain — requiere DB writes + testing + deploys)
2. **Single-decision exploration** (e.g., "¿qué framework usar?" — needs deep think, not parallel docs)
3. **User-facing creative work** (final landing copy: human + Pablo voice > LLM iteration)
4. **Customer support** (1:1 con context — bad fit for cadence-driven)
5. **Negotiation tactics** (high-stakes singular decisions)

Wakeup loop ES appropriate para:

1. **Documentation depth** (multiple docs research/audit/strategy)
2. **Decision consolidation** (multiple connected decisions across domains)
3. **Pre-mortem planning** (lots of "what if X happens" scenarios)
4. **Knowledge transfer prep** (handoff docs, runbooks, playbooks)
5. **Boilerplate code generation** (templates, schemas, configs — though codex domain mostly)

## Reusable pattern proposed

Para futuros sprints multi-agente claude similar (e.g., post-customer-zero F1 prep, expansion carrera prep):

### Setup

1. **Define boundary** claude vs codex vs pablo clarify
2. **Define cadence** estricta (Pablo's 270s rule preserved)
3. **Define priority list** initial (3-10 items max — más es overprocessing)
4. **Define endgame trigger** (e.g., "all priority items done" o "Pablo intervenes")

### Per wakeup discipline

1. **Pull + check inbox + heartbeat** (≤30s)
2. **Pick UNA task from priority list** (skip si already done)
3. **Execute task** (write doc / commit / push) (≤3 min)
4. **Document in HANDOFF.md** with commit ref + decisions + next steps (≤30s)
5. **Schedule next wakeup** with SAME prompt (or trimmed if state changes)

### Endgame

- When priority list exhausted, schedule wakeup with `1800s` (passive monitor)
- If urgent inbox arrives during passive, claude responds within 30 min (M9-3-D56 SLA)
- When user explicit intervene, accept new direction

## Lecciones específicas para Pablo

### 1. Multi-agent cadence es palanca real de productividad

3 horas claude wakeup = 6+ horas Pablo equivalent. Para ramping research/audits/docs, este multiplier vale la pena.

### 2. PERO Pablo es decision-maker final

Los 85 decisiones emitidas requieren Pablo refinement antes de execute. Algunos son "claude opinion en absence de Pablo input". Mark as draft hasta Pablo sign-off implícito (via use o explicit confirm).

### 3. Cuidado con drift entre claude decisión y producto reality

Claude trabaja desde docs en repo. NO from customer reality (cero customers yet). Toda decisión M9-3 es directional, NO empirically validated. Post-customer-zero, refresh contra signal real.

### 4. NO overprocessing en methodology

Si próximo sprint genera otro 85 decisions, probably overprocessing. Trigger para reflexión: ¿estoy emit decision ID o documentar en text?

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D86
    decision: "Wakeup loop pattern reusable para futuros sprints documentation-heavy: cadence estricta + 1 task/wakeup + HANDOFF.md SoT + decisiones derivadas con metadata + boundary explícito por agent. Documentar y reusar"
    rationale: "85 decisiones + 35+ docs en 3 horas claude work demonstrates pattern works. Reusable for post-customer-zero F1 prep, expansion carrera prep, post-launch retrospects. Anti-pattern: usar este pattern para implementation técnico o decision-singular exploration."
    change_type: process_reusable
    files_to_touch:
      - docs/coord/audits/wakeup_loop_postmortem.md
    owner: claude + pablo
    blocked_by: []
    priority: normal

  - id: M9-3-D87
    decision: "Reservar decisión ID M9-3-D<N> SOLO para decisions strategic/operational (pricing/scope/comms/launch_process/legal/scaling). Process-internal decisiones (workflow choices, methodology micro-tweaks) document en HANDOFF.md text sin ID"
    rationale: "85 decisiones es overflow. Algunas son meta-process (D55 unused) que dilute signal. Strict criteria evita future inflation."
    change_type: governance
    files_to_touch:
      - docs/coord/audits/wakeup_loop_postmortem.md
    owner: claude
    blocked_by: []
    priority: normal

  - id: M9-3-D88
    decision: "Antes de escribir doc nuevo, PASO 0 obligatorio: grep keywords contra docs existentes. Si >50% overlap, actualizar existing en lugar de duplicar"
    rationale: "v1_handoff_summary duplicó ~30% de v1_launch_readiness + decisiones_v1_inventory. Justificable como consolidation pero costs token + maintenance. Pre-write grep es 30s cost que prevents larger problem."
    change_type: process_quality
    files_to_touch:
      - docs/coord/audits/wakeup_loop_postmortem.md
    owner: claude
    blocked_by: []
    priority: normal
```
<!-- decisions:data:end -->

## Cierre

Este wakeup loop fue exitoso para depth research-grade pre-customer-zero. Pattern reusable documented. 3 anti-patterns identificados para evitar en próximos sprints.

Próximo wakeup continúa cadence 270s mientras Pablo no intervenga. Backlog claude prácticamente exhausto — propones data_export_compliance o customer_advisory_board_v2 como next, ambos low-priority nice-to-haves.

## Próximos pasos

1. **Inmediato:** Pablo lee este postmortem cuando tenga 10 min — sirve para futuros sprints planning.
2. **Próximo wakeup:** continuar cadence 270s con remaining backlog (data_export_compliance, CAB v2, OR transición a passive 1800s si lista exhausted).
3. **Post-customer-zero F1:** reusar pattern con boundary update (incluir customer feedback como input source).
4. **Q3 2026:** refresh este doc con learnings de F1 + F2 wakeup loops.
