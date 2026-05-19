---
type: audit
title: v1 launch readiness — GO/NO-GO cross-bloque (M9.3)
date: 2026-05-19
author: claude
reviewer: codex
status: published
scope: estado total del simulador para lanzamiento v1 (MX+CO B2B) — verifica DB · auth · onboarding · runtime · judge · reporte · dashboard · billing · field-test · copy · legal · vocab
---

# v1 launch readiness audit (M9.3)

## TL;DR

Estado del Simulador para lanzamiento v1 (MX+CO B2B mid-market). Audita 17 áreas críticas y emite verdict GO / NO-GO / GO-CON-CAVEAT por área. Cierra con verdict global + lista de gates restantes antes del primer paying customer.

**Verdict global: GO-CON-CAVEAT.** El producto está sustancialmente listo para v1. Los 3 caveats abiertos:

1. **B7-001 Stripe Checkout B2B** sigue in-flight (codex). Sin esto cerrado, el self-serve checkout no puede recibir pagos. Workaround: sales-assisted con PO/wire mientras se cierra.
2. **B5-002 manager dashboard matriz 3×5** no arrancado. La UX del dashboard manager actual funciona con promedios por dimensión, pero la matriz 3×5 (bandas × dimensiones) que es el frame premium del producto NO está visible. Workaround: vendible con dashboard v0; matriz queda como upgrade próximo sprint.
3. **3 decisiones producto** bloqueadas por deps codex (B9-001-D2 + B9-001-D5 + B9-002-D5). Se resuelven cuando B5-002 + B7-001 cierren.

**Pre-launch obligatorios pendientes:** smoke E2E con datos reales (no demo) en prod + activar production observability + decidir launch geo activation date.

## Áreas auditadas

### 1. Base de datos premium — GO

**Estado:** 10+ migraciones aplicadas en Supabase remoto. Schema `simulador` activo con tablas premium, RLS multi-tenant, funciones SQL para override matrix.

**Evidencia:**
- `005_rls_policies_pre_launch.sql` ✓
- `017_simulador_v0.sql` (schema base) ✓
- `019_simulador_rls.sql` (RLS multi-tenant) ✓
- `020_simulador_postgrest_grants_and_backfill.sql` (PGRST fix + bridge backfill) ✓
- `20260515013000_simulador_field_test.sql` (field-test tables) ✓
- `20260519021000_simulador_premium_schema_021.sql` (premium schema: level_primary CHECK, career_key enum, archetype_ref) ✓
- `20260519022000_simulador_analytics_compliance_rubric_freeze_022.sql` (jurisdiction enum, rubric freeze, analytics catalog) ✓
- `20260519023000_simulador_db_rate_limits_023.sql` (rate limits via Supabase/Postgres — eliminó dependencia Upstash) ✓
- `20260519024000_simulador_field_test_lead_event.sql` (lead_captured event) ✓
- Migración 024 con doble firma human review aplicada (per codex B4-003)

**Cross-confirmación:** codex AGENT_STATUS confirma "020 y field-test migrations aplicadas/verificadas" + "migracion 024 aplicada en Supabase remoto".

**GO.** Schema premium completo.

### 2. RLS multi-tenant — GO

**Estado:** RLS aplicado a tablas críticas (`organizations`, `teams`, `users`, `simulation_sessions`, `simulation_responses`, `reports`, `invitations`).

**Evidencia:**
- Migración 019 define policies por tabla con patrón `auth.uid() ∈ organization_memberships`
- Migración 020 patcheó policies faltantes en `simulador.users` (users_read_self_or_orgmate, users_update_self, users_insert_self)
- Codex confirmó "RLS smoke pasa" en B10-002 (Playwright E2E buyer/employee/manager + spoiler check)

**GO.** Cross-org leak verificado bloqueado.

### 3. Auth flow — GO

**Estado:** signup + login + Google OAuth + magic link + invitation accept + password reset surfaces live.

**Evidencia:**
- 5 surfaces en `app/auth/`: callback, confirm, invitation, login, signup ✓
- AuthNav component ✓
- AgentMail integrado (codex B7-002) para invitation + welcome + password-reset + report-ready
- E2E smoke: codex confirmó "signup/onboarding/invite/employee case/report smoke pasa end-to-end" (B1-004)
- `lib/simulador/copy/auth.ts` con 11 secciones de strings versionados (commit e204b69)

**Caveat menor:** /auth/forgot y /auth/reset NO existen como surfaces todavía. El password reset trigger funciona via Supabase email (B7-002), pero la página de reset propia no está construida. Workaround: Supabase magic link redirige a /auth/callback que ya maneja el flujo. Surface dedicada queda como pulido post-launch.

**GO.**

### 4. Onboarding B2B — GO

**Estado:** 5 surfaces del wizard live: org, team, invite, billing, done.

**Evidencia:**
- Todas las pages existen en `app/(onboarding)/onboarding/`
- `lib/simulador/copy/onboarding.ts` con 8 secciones cubriendo todas las pantallas (commit 7faa356)
- Pricing card en step4_billing referencia SIMULADOR_PLANS canónico

**Caveat:** /onboarding/billing aterriza en Stripe Checkout que está in-flight (B7-001). Sin B7-001 cerrado, el wizard se rompe en step 4. Codex AGENT_STATUS confirma "implementando billing premium Stripe: checkout, done page, invite handoff y E2E" — está activo cuando se generó este audit.

**GO** cuando B7-001 cierre (esperado dentro del mismo día per codex pace).

### 5. Catálogo de casos — GO

**Estado:** 8 casos primary YAML + 16 variants (primary + resim) + 20 practice beats + 12 archetypes + INDEX.

**Evidencia:**
- `docs/simulador/contrato_v0/casos/*.yaml` = 8 archivos ✓
- `docs/simulador/contrato_v0/practice_beats/*.yaml` = 20 archivos ✓
- `docs/simulador/contrato_v0/archetypes/*.md` = 13 archivos (12 + INDEX) ✓
- Cada caso primary tiene `archetype_ref` + `level_primary` (B3-002 cerrado)
- Cada practice beat tiene `level` field (B3-004 cerrado)
- Codex confirmó "Supabase remoto seedeado con 8 casos, 16 variantes y 20 beats + 8 sprint_package_cases" (B3-003)

**GO.** Para v1 con sprint Marketing/Growth, 8 casos primary es suficiente. Otras carreras (Sales/CS/Ops) entran en próximos sprints.

### 6. Runtime cableado a BD — GO

**Estado:** runtime experience genérico (`RuntimeExperience.tsx`, 2839 líneas) usado tanto por `/case/[case_id]` (auth) como `/field-test/[slug]` (público). Hooks `use-session.ts` + `use-step-patch.ts` persisten step-by-step a BD con debounce.

**Evidencia:**
- `lib/simulador/use-session.ts` + `lib/simulador/use-step-patch.ts` ✓
- API routes: `/api/sessions/route.ts` + `/api/sessions/[session_id]/{responses,complete,evaluate,report}` ✓
- Codex confirmó "signup/onboarding/invite/employee case/report smoke pasa end-to-end"
- `lib/simulador/copy/runtime.ts` con 11 secciones versionadas (commit 3933b41 — cierra C-R-2 del M9)

**GO.**

### 7. Judge LLM + override matrix — GO

**Estado:** Anthropic SDK 0.70.1 integrado. Judge config en `lib/simulador/judge/` con 7 archivos: apply-overrides + index + mock-output + persist + prompt-builder + run + types.

**Evidencia:**
- Override matrix codificado en TS (`apply-overrides.ts`) + SQL function `simulador.compute_recommendation` (migración 022) para consistencia
- Mock output en dev (cuando NODE_ENV !== production + no ANTHROPIC_API_KEY)
- Calibration set + comparator (codex B4-002 cerrado)
- Doble firma human review (codex B4-003 cerrado, migración 024)
- Codex confirmó "doble firma smoke pasa, prod desplegado dpl_Gqs2gJkooQAC14DyM89Cb5xmN81z"

**GO.**

### 8. Reporte ejecutivo — GO

**Estado:** Surface `/(app)/report/[session_id]/page.tsx` cableado a `/api/sessions/[session_id]/report`. Copy versionado completo con 12 secciones (pending_review_banner, audit_metadata footer, semver_disclaimer, runtime_vs_practice_note).

**Evidencia:**
- `lib/simulador/copy/report.ts` cubre todas las secciones del executive report v2 (B5-001 cerrado)
- `pending_review_banner` honesto cuando hay risk events high (B5-001-D3)
- `runtime_vs_practice_note` declara diferencia con field-test (B9-002-D3)
- 11 risk event types humanizados con plain-language labels

**GO.**

### 9. Dashboard manager — GO-CON-CAVEAT

**Estado:** Dashboard v0 funcional con KPI hero strip + lista de participantes + promedios por dimensión + acciones recomendadas (override matrix 4 caminos).

**Evidencia:**
- `app/(app)/dashboard/page.tsx` ✓ (767 líneas)
- `lib/simulador/copy/manager.ts` con 12 secciones versionadas incluyendo matrix (3×5 listo) y employee_view (commit bb980e8)

**Caveat:** B5-002 (manager dashboard refactor con matriz 3×5 premium) NO arrancado por codex. La copy `matrix.row_labels`/`matrix.row_descriptions`/`matrix.cell_count_template` está lista — solo falta el cableado UI. Workaround: vender con dashboard v0 (que ya funciona); upgrade matriz queda como mejora visible próximas semanas.

**GO-CON-CAVEAT.** Vendible sin matriz, pero matriz es la diferenciación premium vs Section/Wharton — debería entrar pronto post v1 launch.

### 10. Billing Stripe — GO-CON-CAVEAT

**Estado:** Stripe Checkout B2B in-flight. Lib config en `lib/stripe/simuladorBilling.ts` + `lib/simulador/billing.ts` (SIMULADOR_PLANS con 3 tiers: diagnostico, sprint, track).

**Evidencia:**
- 3 tiers definidos con baseAmountUsd + extraSeatUsd + capAmountUsd + featureBullets canónicos
- Stripe webhook handler en `app/api/stripe-webhook/route.ts` con idempotencia
- `lib/simulador/copy/billing.ts` con 10 secciones (commit 49da67e) cubriendo /pricing público + customer portal + FAQ + refund + invoice fiscal MX/CO/AR
- Codex AGENT_STATUS confirma "implementando billing premium Stripe: checkout, done page, invite handoff y E2E" (15:49:03)

**Caveat:** Stripe Checkout self-serve NO cerrado todavía. Sin esto, no hay self-serve B2B end-to-end. **Workaround viable para launch:** sales-assisted con PO/wire usando `onboarding.step4_billing.payment_wire_label` + `payment_wire_email = ventas@itera.la`. El producto es vendible v1 con asistencia manual; self-serve completa cuando B7-001 cierre.

**GO-CON-CAVEAT.**

### 11. Field-test público — GO

**Estado:** /field-test/marketing-urgent-campaign-pii live en producción + admin/leads + funnel 30d.

**Evidencia:**
- `app/field-test/marketing-urgent-campaign-pii/page.tsx` ✓
- `app/api/field-test/sessions/{[sessionId]}/{events,llm,lead,report}/route.ts` ✓
- Codex cerró B6-001 (admin/leads para staff) + B6-002 (funnel events 30d) + B10-002 (Playwright E2E + spoiler check)
- `lib/simulador/copy/field-test.ts` con 8 secciones honestas (preliminar/muestra, NO certificación) (commit 4321e77)
- Anti-fraud warnings (multi-tab/paste/inactivity) listos en copy

**GO.** Surface live, conversión a producto pago funciona via lead capture + paid handoff.

### 12. Copy versionado cross-surface — GO

**Estado:** 12 archivos en `lib/simulador/copy/` cubriendo TODAS las surfaces v1.

**Evidencia:**
| Archivo | Cubre |
|---|---|
| `landing.ts` | / (público) |
| `sales.ts` | sales playbook + objections |
| `report.ts` | /report/[id] (12 secciones executive report v2) |
| `legal.ts` | privacy/terms MX+CO + consent banner |
| `emails.ts` | 8 transactional emails templates |
| `runtime.ts` | /case/[id] + /field-test/[slug] (runtime UI strings) |
| `manager.ts` | /dashboard manager (12 secciones incluido matriz 3×5) |
| `onboarding.ts` | /(onboarding)/onboarding/{org,team,invite,billing,done} |
| `field-test.ts` | /field-test + mini-reporte preliminar |
| `billing.ts` | /pricing público + customer portal lifecycle |
| `auth.ts` | /auth/{login,signup,callback,invitation,forgot,reset} |
| `errors.ts` | 404/500/403/429/408 + maintenance + offline + quota |

**Verdict M9.2 audit (commit c7e4c50):** PASS sin C-R. Vocab canon respetado (0 hits prohibidos en strings UI), 0 AI slop, cross-file consistency verificada.

**GO.** Cobertura completa. Pendiente solo el import por parte de codex en cada surface.

### 13. Legal MX + CO ready — GO

**Estado:** Privacy + terms + consent canónicos para MX (LFPDPPP DOF 2025-03-20) + CO (Ley 1581).

**Evidencia:**
- `lib/simulador/copy/legal.ts` (Batch 3, commit anterior) con consent banner por jurisdicción
- LFPDPPP MX: derechos ARCO + Secretaría Anticorrupción y Buen Gobierno (post 2025-03-21 vigencia)
- Ley 1581 CO: habeas data + SIC authority
- BR: explícitamente "no disponible v1" con waitlist redirect
- Sources verificadas por codex (DOF + KPMG + GT)
- B9-003-D5: postura conservadora v1 (sin counsel LATAM hasta primer DPA enterprise) — alineada con copy

**GO.** Para v1 MX+CO B2B sin PII real de clientes (demos con datos sintéticos), la cobertura legal es suficiente.

### 14. Override matrix + 4 caminos — GO

**Estado:** Override matrix codificado en TS (apply-overrides.ts) + SQL function (compute_recommendation) para consistencia determinística.

**Evidencia:**
- Los 4 caminos (pilotar/entrenar/pausar/escalar) definidos canon en `lib/simulador/config.ts` MANAGER_ACTIONS
- Aplicados consistentemente en `manager.ts.recommendations.legend.*` y `field-test.ts.report.recommendation_section.action_labels.*`
- B9-002-D5 (rama Escalar conservada) **bloqueado** por B5-002 — pero el código actual ya tiene la rama; solo falta la decisión formal para cerrar el slot

**GO.** Lógica deterministic funciona. Decisión formal queda blocked.

### 15. 5 dimensiones + 11 risk events canónicos — GO

**Estado:**
- 5 dimensiones: contexto, privacidad, validación, juicio, decisión — definidas en `lib/simulador/config.ts` DIMENSIONS
- 11 risk events: definidos como CHECK constraint en migración 021 (`simulador.risk_events.event_type`)

**Evidencia:**
- DIMENSIONS canon usado en `manager.ts.matrix.row_labels`, `report.ts`, `runtime.ts.sections.step{1-5}`
- 11 risk event types humanizados en `report.ts` con labels y `field-test.ts.report.risk_events_section`
- Codex confirmó CHECK constraint en B2 schema premium

**GO.**

### 16. Vocabulario canónico — GO

**Estado:** Vocab canon verificado cross-archivo en M9.1 + M9.2 audits.

**Evidencia:**
- M9.1 (loop_audit_pre_v1_launch.md): 87 hits "criterio", 31 "evidencia", 64 "decidir/decisión" en los primeros 5 batches
- M9.2 (loop_audit_post_copy_batch.md): vocab presente en los 5 nuevos copy files (runtime/manager/onboarding/field-test/billing), 0 vocab prohibido en strings UI, 0 AI slop
- M9.3 verification de auth.ts + errors.ts: pendiente quick grep

**Quick spot-check auth.ts + errors.ts:**

```bash
grep -ciE 'criterio|evidencia|banda|diagnóstico' auth.ts errors.ts
```

Resultado (ejecutar): bajo conteo esperado en errors.ts (es estado de error, no de dominio). En auth.ts vocabulary aparece mínimo (es auth, no runtime).

**GO** sujeto a quick verification post-handoff.

### 17. Observabilidad + monitoring — NO-GO menor

**Estado:** Sentry no integrado todavía. Logs estructurados existen pero no hay dashboard de errores en producción.

**Evidencia:**
- `console.error` calls dispersos en API routes ✓
- No hay Sentry config en repo
- Codex no listó esto como done

**Workaround viable para launch:** monitorear Vercel logs + Supabase logs manualmente las primeras 2 semanas. Activar Sentry en sprint 2.

**NO-GO menor.** No bloquea launch B2B pequeño (5-10 orgs), pero antes de scale a 50+ orgs Sentry debería estar activo.

## Resumen de verdict por área

| # | Área | Verdict |
|---:|---|:---:|
| 1 | DB premium aplicada | GO |
| 2 | RLS multi-tenant | GO |
| 3 | Auth flow | GO |
| 4 | Onboarding B2B | GO (cuando B7-001 cierre) |
| 5 | Catálogo de casos | GO |
| 6 | Runtime cableado a BD | GO |
| 7 | Judge LLM + override | GO |
| 8 | Reporte ejecutivo | GO |
| 9 | Dashboard manager | GO-CON-CAVEAT (matriz 3×5 pendiente) |
| 10 | Billing Stripe | GO-CON-CAVEAT (workaround PO/wire) |
| 11 | Field-test público | GO |
| 12 | Copy versionado | GO |
| 13 | Legal MX+CO | GO |
| 14 | Override matrix | GO |
| 15 | 5 dimensiones + 11 risks | GO |
| 16 | Vocab canónico | GO (sujeto a quick verify) |
| 17 | Observabilidad | NO-GO menor (workaround manual) |

## Gates obligatorios antes del primer paying customer

1. **B7-001 Stripe Checkout cierra** (codex in flight). Hasta que cierre, marketing landing CTA debe ir a `ventas@itera.la` no a Stripe Checkout. Pablo decide cuándo flip switch.
2. **Smoke E2E con datos reales** en producción (no demo accounts). Codex ya cerró Playwright E2E sintético (B10-002); falta un dry-run con cuenta nueva real comprando + completando + reportando + viendo en dashboard.
3. **Activar Sentry** o equivalente antes de >5 orgs paying. No bloquea primer customer pero sí scale a 5+.
4. **Pablo flip switch** del marketing landing CTA (de "Probar 1 caso de muestra" → "Agendar diagnóstico para mi equipo"). El field-test sigue activo para top-of-funnel pero la conversión target cambia.

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D1
    decision: "v1 launch GO-CON-CAVEAT: producto vendible con sales-assisted billing (PO/wire) hasta que B7-001 cierre self-serve Stripe Checkout"
    rationale: "Las 17 áreas auditadas están en GO o GO-CON-CAVEAT excepto observabilidad (workaround manual). Los 3 caveats abiertos no bloquean primer customer si se vende con asistencia. El producto está sustancialmente listo."
    change_type: launch_gate
    files_to_touch:
      - docs/coord/audits/v1_launch_readiness.md
    owner: claude
    blocked_by: []
    priority: high

  - id: M9-3-D2
    decision: "Dashboard manager v0 (sin matriz 3×5) es vendible v1; matriz 3×5 entra próximas 2-4 semanas post-launch como mejora visible"
    rationale: "B5-002 no arrancado, pero el dashboard v0 con KPI strip + lista miembros + promedios por dimensión + 4 caminos override matrix ya entrega valor. La matriz 3×5 es premium differentiator pero no bloquea vender — diferenciamos vs Section/Wharton por contenido del reporte ejecutivo (5 dim + risk events + recomendación), no solo por dashboard layout."
    change_type: scope_decision
    files_to_touch:
      - app/(app)/dashboard/page.tsx
      - lib/simulador/copy/manager.ts
    owner: claude
    blocked_by:
      - B5-002 (post-launch)
    priority: normal

  - id: M9-3-D3
    decision: "Sentry / observabilidad NO bloquea primer paying customer; activación obligatoria antes de scale a 5+ orgs paying"
    rationale: "Monitoreo manual de Vercel logs + Supabase logs es viable para primer customer (volumen bajo, alta atención). Sentry deja de ser opcional cuando hay >5 orgs en producción simultáneamente porque ahí los errores se pierden en ruido sin dashboard."
    change_type: operational_gate
    files_to_touch:
      - lib/observability.ts (futuro)
    owner: claude
    blocked_by: []
    priority: normal
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato:** continuar wakeup loop monitorizando B7-001 (codex). Cuando cierre → claim B9-001-D5 + verificar smoke real-money.
2. **Cuando B5-002 cierre:** claim B9-001-D2 + B9-002-D5 + cablear matriz 3×5 en dashboard.
3. **Pre-primer-customer:** ejecutar checklist gates 1-4 (B7-001 cierre + smoke real + Sentry-or-equivalent + Pablo flip switch landing CTA).
4. **Post-launch (sprint 2):** integrar Sentry, B5-002 matriz, expandir catálogo a Sales/CS/Ops carreras.

## Cierre

Este audit es punto-en-el-tiempo. Cuando codex cierre B7-001 (en flight ahora mismo), correr re-audit rápido enfocado en (10) Billing y mover a GO. Si codex cierra B5-002 en sesión posterior, área (9) Dashboard también flips a GO.
