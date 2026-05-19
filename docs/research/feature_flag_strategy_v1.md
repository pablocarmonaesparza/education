---
type: research
title: Feature flag strategy v1 — rollback safety + gradual rollout
date: 2026-05-19
author: claude
reviewers: [pablo, codex]
status: published
scope: define qué se debe poner detrás de feature flags para rollback safety pre-launch + post-launch. Lightweight v1 — no Optimizely/LaunchDarkly enterprise tooling
related:
  - docs/coord/audits/launch_day_runbook.md (RED incident rollback)
  - docs/strategy/v1_launch_playbook.md (4 gates rollback triggers)
  - lib/simulador/billing.ts (SIMULADOR_PLANS)
---

# Feature flag strategy v1 — lightweight rollback safety

## TL;DR

v1 NO usa LaunchDarkly/Optimizely (enterprise tooling caro $30K+/año). Implementa **3 mecanismos lightweight** que cubren 90% del riesgo rollback:

1. **Env flags Vercel** (`NEXT_PUBLIC_FEATURE_*`) — rollback rápido sin redeploy
2. **Database config table** (`simulador.feature_flags`) — toggles operationales
3. **Tier gating en code** (check de subscription tier antes de feature)

**Filosofía:** flags son para rollback rápido bajo incident, NO para A/B testing v1. A/B testing entra en v3+ cuando volumen lo justifique.

**Implementación v1:** ~3-4 días codex effort, incluido en F1 v2 roadmap.

## Por qué NO LaunchDarkly v1

5 razones:

1. **Costo:** LaunchDarkly Starter $33/mes/seat, Pro $99/mes/seat. Pre-customer-zero, agregar $30-100/mes overhead sin signal real es waste.
2. **Complexity:** SDK + permissions + analytics dashboard adds 2-3 días setup + ongoing config. Para 5 flags v1, manual override en env is faster.
3. **Vendor lock-in:** migrar de LaunchDarkly más adelante es painful. Mejor empezar lightweight.
4. **Bug surface:** SDK adds dependency con potencial latency/failure mode. Env flags son zero-dependency.
5. **GDPR/LATAM compliance:** LaunchDarkly como sub-processor agrega DPA work (M9-3-D58 sub-processors list). Eliminable v1.

**Trigger reconsider LaunchDarkly:** post 50 customers + ≥5 active concurrent A/B tests + dedicated PM hired.

## 3 mecanismos lightweight propuestos

### Mecanismo 1: Vercel environment flags

**Cómo funciona:** vars de entorno en Vercel Project Settings (production scope) que el código lee at build/runtime.

**Naming convention:**
```
NEXT_PUBLIC_FEATURE_<NAME>=<true|false|value>
```

Public prefix = accesible client-side. Sin public = server-side only.

**Flags propuestos v1:**

| Flag | Default | Toggle scenario |
|---|---|---|
| `NEXT_PUBLIC_FEATURE_LANDING_CTA_ENABLED` | true | Rollback flip switch CTA si bug detectado (T-0 RED incident) |
| `NEXT_PUBLIC_FEATURE_FIELD_TEST_PUBLIC` | true | Disable field-test si volumen genera capacity issue |
| `NEXT_PUBLIC_FEATURE_PRICING_PAGE_VISIBLE` | false (post-B7-001 true) | Mostrar /pricing solo cuando Stripe ready |
| `FEATURE_STRIPE_CHECKOUT_LIVE` | false | Toggle live vs test mode Stripe (default test) |
| `FEATURE_JUDGE_LLM_ENABLED` | true | Rollback judge to mock-only en dev/staging si Opus issue |
| `FEATURE_AGENT_MAIL_ENABLED` | true | Disable email triggers si AgentMail incident |
| `FEATURE_SENTRY_ENABLED` | false | Activar observability cuando esté integrado |

**Toggle latency:** ~1 minuto (Vercel rebuild). NO instant, pero acceptable para rollback non-critical.

**Rollback flow:**
1. Pablo identifies issue (e.g., landing CTA roto)
2. Vercel dashboard → Settings → Environment Variables → toggle `NEXT_PUBLIC_FEATURE_LANDING_CTA_ENABLED` to `false`
3. Vercel re-deploys con nuevo flag (~1 min)
4. Code lee flag y muestra fallback UI (e.g., landing reverts a CTA "Probar 1 caso de muestra")

### Mecanismo 2: Database config table

**Tabla propuesta:** `simulador.feature_flags`

```sql
create table simulador.feature_flags (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz default now(),
  updated_by text  -- email o user_id
);

-- Seed initial:
insert into simulador.feature_flags (key, value, description) values
  ('hybrid_onboarding_enabled', '{"enabled": false}', 'M9-3-D7: opt-in sales call banner pre-Stripe'),
  ('matrix_3x5_enabled', '{"enabled": false}', 'B5-002: manager dashboard matrix 3×5'),
  ('latam_evidence_stats_visible', '{"enabled": true}', 'M9-3-D11: LATAM stats sub-section en landing'),
  ('case_study_consent_in_nps', '{"enabled": true}', 'M9-3-D47: case study consent en NPS 90d survey'),
  ('webhook_endpoint_active', '{"enabled": false, "secret_required": true}', 'M9-3-D68: webhook genérico universal');
```

**Toggle latency:** instant (DB write). Code reads flag fresh cada request o con cache 60s.

**Rollback flow:**
1. Identify issue
2. SQL update: `update simulador.feature_flags set value = jsonb_set(value, '{enabled}', 'false') where key = 'matrix_3x5_enabled';`
3. App refreshes flag cache (60s max)
4. Feature disabled inmediato

**Use case:** flags que cambian frecuentemente o que requieren rollback más rápido que env vars permiten.

### Mecanismo 3: Tier gating en code

**Cómo funciona:** check de subscription tier antes de mostrar feature.

```typescript
// lib/simulador/feature-gating.ts
export function canUseFeature(orgTier: SimuladorBillingPlan, feature: string): boolean {
  const featureMatrix = {
    matrix_3x5: ['diagnostico', 'sprint', 'track'],
    practice_beats: ['sprint', 'track'],
    n3_agentes_cases: ['track'],
    hybrid_review: ['sprint', 'track'],
    custom_branding: [], // none v1
  };
  return featureMatrix[feature]?.includes(orgTier) ?? false;
}
```

**Use case:** features que vary by tier (M9-3-D6 tier-specific functionality).

**No requires DB flag o env flag** — derived from existing `simulador.subscriptions.plan_key`.

## Flags críticos para v1 launch

### Pre-launch (T-7 a T-0)

**OBLIGATORIOS antes de flip switch:**

| Flag | Estado pre-launch | Por qué |
|---|---|---|
| `NEXT_PUBLIC_FEATURE_LANDING_CTA_ENABLED` | true | Permite rollback T-0 si CTA roto |
| `FEATURE_STRIPE_CHECKOUT_LIVE` | true (post-Stripe live mode toggle) | Required for paid customer flow |
| `FEATURE_JUDGE_LLM_ENABLED` | true | Required for reports |
| `FEATURE_AGENT_MAIL_ENABLED` | true | Required for invitations + reports |
| `NEXT_PUBLIC_FEATURE_FIELD_TEST_PUBLIC` | true | Keeps field-test live as funnel |
| `NEXT_PUBLIC_FEATURE_PRICING_PAGE_VISIBLE` | true (post-Stripe ready) | Permite /pricing page navigation |

### Post-launch (when activate)

**Activate when relevant trigger fires:**

| Flag | Activate trigger |
|---|---|
| `hybrid_onboarding_enabled` (DB) | Post B7-001 + ≥1 customer Sprint/Track |
| `matrix_3x5_enabled` (DB) | Post B5-002 cierre |
| `webhook_endpoint_active` (DB) | Post ≥2 customers ask webhook |
| `FEATURE_SENTRY_ENABLED` (env) | Post Sentry account + integration |

## Cuándo NO usar flags

5 anti-patterns:

### ❌ Anti-pattern 1: A/B testing v1

Volumen v1 (target ≥1 customer week 4) NO permite statistical significance. A/B testing requires N>100 per variant. Trigger reconsider: post 50 customers + dedicated PM.

### ❌ Anti-pattern 2: per-user feature flags

Complexity high, value pre-customer-zero zero. Trigger: enterprise customer pide "beta access" exclusivo (F4+ v2 roadmap).

### ❌ Anti-pattern 3: flags como permanent business logic

Si flag estará always-on, ENGINEER la feature directo sin flag. Flags son temporal — purpose es rollback or rollout, NO config permanente.

### ❌ Anti-pattern 4: flag tech debt accumulation

Cada flag agrega complexity + branches en code. Cleanup post-rollout. Trigger: si flag está 100% on for ≥90 días, REMOVE flag y commit la feature como default.

### ❌ Anti-pattern 5: flags para hide bugs

Si feature tiene bug, FIX el bug. Don't hide behind flag indefinidamente. Flags son for graceful degradation, not permanent bug avoidance.

## Implementation roadmap

### Phase 1 — Pre-launch (codex T-7 to T-0)

**Effort:** 2 días codex

1. Setup env flags en Vercel Production scope (7 flags)
2. Create `lib/simulador/feature-flags.ts` reading env + DB
3. Update key surfaces (landing CTA, pricing page) to respect flags
4. Document flags en `docs/coord/feature_flags_state.md`

### Phase 2 — Post-launch F1 v2 (codex when active)

**Effort:** 1-2 días codex

1. Create `simulador.feature_flags` DB table + seed
2. Build `/admin/feature-flags` page (Pablo/staff toggle DB flags)
3. Cache layer (memoria con 60s TTL)
4. Add observability — log flag changes en `simulador.behavior_events`

### Phase 3 — Tier gating (codex F2 v2)

**Effort:** 1 día codex

1. Create `lib/simulador/feature-gating.ts`
2. Update features que vary by tier (matrix_3x5, practice_beats, n3_agentes)
3. UI hint "Upgrade to access [feature]" para tier-restricted features

## Documentation pattern

Cada flag debe tener:

```markdown
## NEXT_PUBLIC_FEATURE_LANDING_CTA_ENABLED

**Type:** env (Vercel)
**Default:** true
**Purpose:** rollback flip switch landing CTA si bug detectado
**Activate trigger:** T-0 launch (default true)
**Deactivate trigger:** RED incident (landing CTA roto)
**Owner:** Pablo
**Status:** active v1
```

Mantener en `docs/coord/feature_flags_state.md` (file vivo, update con cada change).

## Quick reference: flag mapping a M9-3 decisiones

| Decisión M9-3 | Flag mecanismo |
|---|---|
| D7 hybrid onboarding | `hybrid_onboarding_enabled` (DB) |
| D11 LATAM evidence stats | `latam_evidence_stats_visible` (DB) |
| D17 launch gates | `NEXT_PUBLIC_FEATURE_LANDING_CTA_ENABLED` (env) |
| D23 risk events v2 | NEW flag `risk_events_v2_enabled` (DB, post-customer-zero) |
| D29 Sonnet 4.5 migration | `FEATURE_JUDGE_MODEL` env (values: opus / sonnet) |
| D33 matrix 3×5 visual | `matrix_3x5_enabled` (DB, post-B5-002) |
| D47 case study consent | `case_study_consent_in_nps` (DB) |
| D58 sub-processors list | env vars per sub-processor (toggle if breach) |
| D68 webhook genérico | `webhook_endpoint_active` (DB) |

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D70
    decision: "v1 feature flags lightweight: 3 mecanismos (env Vercel + DB table simulador.feature_flags + tier gating en code). NO LaunchDarkly/Optimizely v1 — costo + complexity + lock-in. Reconsider post 50 customers + dedicated PM"
    rationale: "Pre-customer-zero, $30-100/mes LaunchDarkly overhead sin signal real es waste. Env vars + DB table cubren 90% del use case rollback. A/B testing entra en v3+ cuando volumen justifique."
    change_type: technical_strategy
    files_to_touch:
      - docs/research/feature_flag_strategy_v1.md
      - lib/simulador/feature-flags.ts (futuro codex)
      - supabase/migrations/0XX_feature_flags.sql (futuro codex F1 v2)
    owner: codex (implementation) + pablo (operations)
    blocked_by: []
    priority: normal

  - id: M9-3-D71
    decision: "7 env flags Vercel + 5 DB flags v1 seed. Pre-launch flags OBLIGATORIOS: LANDING_CTA_ENABLED, STRIPE_LIVE, JUDGE_LLM_ENABLED, AGENT_MAIL_ENABLED, FIELD_TEST_PUBLIC, PRICING_PAGE_VISIBLE. Cualquier flag adicional requires owner + activate/deactivate trigger documentados en docs/coord/feature_flags_state.md"
    rationale: "Flags incontrolados generan tech debt. Documentation pattern (type/default/purpose/triggers/owner/status) evita 'qué hace esto?' confusión. Lista cerrada v1 + new flag requires justification."
    change_type: governance
    files_to_touch:
      - docs/research/feature_flag_strategy_v1.md
      - docs/coord/feature_flags_state.md (futuro)
    owner: codex + claude
    blocked_by: []
    priority: normal

  - id: M9-3-D72
    decision: "Cleanup obligatorio: si flag está 100% on for ≥90 días, REMOVE flag y commit feature como default. Si flag está 100% off for ≥90 días, REMOVE flag y delete feature. Audit trimestral del flags state"
    rationale: "Flag tech debt accumulation es pattern común que reduces velocity. Cleanup forzado evita acumulación. Audit trimestral (alineado con competitive_pulse cadence M9-3-D9) es low-overhead check."
    change_type: tech_debt_prevention
    files_to_touch:
      - docs/coord/feature_flags_state.md (audit log)
    owner: codex
    blocked_by: []
    priority: low
```
<!-- decisions:data:end -->

## Próximos pasos

1. **T-7 to T-0 (codex):** setup 7 env flags Vercel + `lib/simulador/feature-flags.ts` (~2 días).
2. **F1 v2 (codex):** DB table `simulador.feature_flags` + `/admin/feature-flags` page + cache (~1-2 días).
3. **F2 v2 (codex):** tier gating en code (~1 día).
4. **Q3 2026 (claude):** primer audit trimestral flags state. Cleanup flags >90d 100% on/off.
5. **Post 50 customers:** reconsider LaunchDarkly si A/B testing demand emerges.
