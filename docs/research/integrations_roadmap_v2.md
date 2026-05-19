---
type: research
title: Integrations roadmap v2 — orden + criterios para HRIS/CRM/messaging integraciones
date: 2026-05-19
author: claude
reviewers: [pablo, codex]
status: published
scope: definir qué integraciones third-party van a pedir los customers, en qué orden invertir capacity codex, y qué NO integrar v1/v2. Sirve para responder objections en discovery + planear roadmap técnico
related:
  - docs/strategy/v2_roadmap_post_customer_zero.md (4 fases)
  - docs/research/buyer_persona_head_marketing_latam.md (stack típico)
  - docs/research/expansion_carreras_v2.md (HR/Ops carreras post-MGP)
---

# Integrations roadmap v2 — orden + criterios

## TL;DR

v1 Itera Simulador opera **stand-alone**: signup vía Itera, sprint vía Itera, reporte vía Itera. NO depende de integraciones third-party para funcionar. Esto es intencional para v1 (M9-3-D5/D17/D38: cero paid acquisition + sales-assisted + lock pricing).

**Pero customers van a pedir integraciones.** Las más probables (por orden de demand esperada en LATAM mid-market):

| # | Integración | Categoría | Demand expected | Effort estimate | Trigger build |
|---:|---|---|---|---|---|
| 1 | **Slack** | Messaging | alta (80%+) | 2-3 sem codex | ≥3 customers ask |
| 2 | **Microsoft Teams** | Messaging | alta (60%+) | 2-3 sem codex | ≥3 customers ask |
| 3 | **HubSpot CRM** | Sales/CRM | media-alta (50%) | 3-4 sem codex | F2 Sales launch + 5 customers |
| 4 | **Salesforce** | CRM enterprise | media (40%) | 4-6 sem codex | enterprise customer ask explícito |
| 5 | **BambooHR** | HRIS LATAM | media (30%) | 2-3 sem codex | F3 HR carrera launch |
| 6 | **Workday** | HRIS enterprise | baja-media (20%) | 6-8 sem codex | enterprise multi-LATAM ask |
| 7 | **Lattice** | Performance mgmt | baja (15%) | 3-4 sem codex | post 10 customers Sales/HR |
| 8 | **Google Workspace** | Identity + Calendar | alta (passive) | 1-2 sem codex | day 1 SSO ya parcial |
| 9 | **Microsoft 365** | Identity + Calendar | alta (passive) | 1-2 sem codex | enterprise customer ask |

**Recomendación:** NO build proactivamente. Reaccionar a demand explícita (≥3 customers para Tier 1, ≥2 para Tier 2-3).

## Por qué v1 NO incluye integraciones

5 razones:

1. **YAGNI principle:** sin customer signal, integrar es adivinar. ~50% de integraciones B2B SaaS construidas pre-customer-zero quedan sin uso (OpenView 2024).
2. **Capacity codex:** B7-001 + B5-002 + observability + smoke E2E ya saturan codex pre-launch. Integration work compite por bandwidth.
3. **Sustained maintenance overhead:** cada integración requiere monitor cuando third-party APIs cambian. 1 integración = ~10h/año mantenimiento. 5 integraciones = ~50h/año = ~6 días claude/codex desperdiciados.
4. **Customer surface confusion:** v1 surface limpio. Cada integración agrega settings page + setup flow + permission scope confirm = más friction onboarding.
5. **Compliance ripple:** cada integración data flow requiere DPA update + sub-processor disclosure. v1 conservador (B9-003-D5) — agregar integraciones aumenta DPA surface.

## Análisis por integración

### 1. Slack (alta demand)

**Por qué buyer LATAM lo pide:**
- 75% mid-market LATAM usa Slack (M9-3-D14 buyer stack)
- "Quiero notification cuando alguien complete el caso" es ask común
- "Quiero reporte semanal del sprint en mi #marketing channel" para visibility

**Value proposition:**
- Notifications: sprint kicked off, participant completed, report ready, sprint closing soon
- Slash command: `/itera status` muestra progress agregado del sprint
- Bot interactivo: manager hace `/itera report @ana` para ver reporte de participante

**Effort estimate (codex):** 2-3 semanas
- Setup OAuth Slack
- Bot scope minimal (chat:write, commands)
- 3-4 trigger types desde Itera → Slack
- Manager configura webhook URL en `/admin/integrations`

**Trigger build:** ≥3 customers ask explícita. Probable en F2 v2 roadmap.

### 2. Microsoft Teams (alta demand)

**Por qué buyer LATAM lo pide:**
- Algunos mid-market (especialmente sectores tradicionales: finance, manufactura) usan Teams over Slack
- Enterprise customers default a Teams

**Value proposition:** mismo que Slack (notifications + slash command + bot)

**Effort:** 2-3 semanas (Microsoft API es más complex que Slack pero patrón similar)

**Trigger:** ≥3 customers ask Teams específicamente.

### 3. HubSpot CRM (media-alta demand)

**Por qué buyer LATAM lo pide:**
- 70% MGP LATAM mid-market usa HubSpot (M9-3-D14)
- Sales/Marketing wants Itera reports → HubSpot contact records (track "completed AI diagnostic = high engagement signal")

**Value proposition:**
- Sync: cuando employee completa sprint, log activity en HubSpot contact
- Manager dashboard puede embedded el HubSpot card

**Effort:** 3-4 semanas
- HubSpot OAuth + scope `contacts` + `engagements`
- Mapping: Itera `simulador.users` → HubSpot Contact (via email match)
- Webhook bidireccional: Itera complete → HubSpot activity + reverse direction (Itera invitation sent → HubSpot deal stage update)

**Trigger build:** F2 Sales launch + ≥5 customers v1 cerrados. Sales carrera naturalmente requiere CRM integration.

### 4. Salesforce (media demand, enterprise)

**Por qué enterprise lo pide:**
- F500 LATAM mid-market upper típicamente Salesforce > HubSpot
- Compliance + audit trail requirements

**Value proposition:** mismo conceptual que HubSpot pero target enterprise.

**Effort:** 4-6 semanas
- Salesforce API es notoriously complex
- Apex code podría requerirse para custom objects
- Sandbox testing extensive

**Trigger build:** enterprise customer ask explícita. Probable F4 v2 roadmap o post 10 customers MGP/Sales mixed.

### 5. BambooHR (media demand LATAM)

**Por qué buyer LATAM HR lo pide:**
- BambooHR es el HRIS más adoptado mid-market LATAM (vs Workday US-centric)
- HR director quiere employee directory sync

**Value proposition:**
- Auto-invite employees from BambooHR team groups
- Sync employee status (active/inactive) automatic
- Sprint completion logs en employee record

**Effort:** 2-3 semanas (BambooHR API es simple, well-documented)

**Trigger build:** F3 HR carrera launch v2 roadmap o ≥3 customers HR ask.

### 6. Workday (baja-media demand, enterprise multi-LATAM)

**Por qué enterprise lo pide:**
- F500 multi-LATAM (telco, retail, banking) usa Workday HRIS
- Compliance + integration con todo HR stack

**Value proposition:** mismo conceptual que BambooHR pero enterprise + multi-country.

**Effort:** 6-8 semanas
- Workday WQL queries complex
- Multi-tenancy scope confusion
- Enterprise customer puede pedir on-premise variant (NO scalable v2)

**Trigger build:** enterprise customer ask explícita + contract ≥$50K que justifique 6-8 sem codex investment.

### 7. Lattice (baja demand)

**Por qué buyer lo pide:**
- Performance management orgs usan Lattice para reviews
- "Quiero Itera score como signal en performance review"

**Value proposition:** sync banda promedio → Lattice "skill assessment" custom field.

**Effort:** 3-4 semanas

**Trigger build:** post 10 customers Sales/HR + ≥2 ask Lattice. Probable F4 v2 o later.

### 8. Google Workspace (alta passive demand)

**Por qué passive demand:**
- Google OAuth ya implementado v1 (auth flow)
- Calendar integration sería value-add (auto-schedule demo calls de Pablo)
- Drive integration sería value-add (export reportes a Drive folder de manager)

**Effort:** 1-2 semanas (OAuth ya base, scope expansion)

**Trigger build:** ≥1 customer pide explícitamente Calendar o Drive integration. Probable F2.

### 9. Microsoft 365 (alta passive demand)

**Por qué passive demand:**
- 30% mid-market LATAM usa Microsoft (vs Google)
- SSO + Calendar + OneDrive equivalents

**Effort:** 1-2 semanas

**Trigger build:** ≥1 customer enterprise pide explícitamente. Probable F3+.

## Integraciones NO recomendadas (NEVER o cuando crecimiento warrants)

### ❌ Zapier / Make / n8n (low-code automation)

Por qué NO:
- Itera puede convertirse en "Zapier source" sin agregar value
- Customers que necesitan automation custom van directo a Slack notifications
- Maintenance overhead alto para adoption real bajo

**Trigger reconsider:** post 50 customers + ≥10% reportan usar Zapier para Itera workflows.

### ❌ LMS integrations (Cornerstone, Docebo, etc.)

Por qué NO:
- Itera NO es LMS. Integrar lo posiciona como "content provider" → rompe frame "diagnóstico no curso"
- LMS landscape fragmented LATAM
- Effort high (2-3 meses por LMS) sin value clear

**Trigger reconsider:** NUNCA v1-v3. Si customer enterprise lo pide, escalate como "estamos en sprint diagnóstico, no LMS — workaround via export PDF report".

### ❌ Analytics platforms (Mixpanel, Amplitude, Segment)

Por qué NO:
- Para customers querer trackear Itera events en su Mixpanel: solamente envía via webhook simple
- Custom integration adds little value over generic webhook

**Trigger reconsider:** v3 si enterprise customer pide formal Segment connector.

### ❌ ATS integrations (Greenhouse, Lever)

Por qué NO:
- Forage compete en hiring screening — Itera NO
- ATS use case requires Itera shift product positioning hacia hiring (NO our wedge)

**Trigger reconsider:** NUNCA. Si customer pide, redirect a Forage.

### ❌ Custom enterprise SSO (Okta, Auth0 advanced)

Por qué NO inicialmente:
- Supabase Auth + Google + Magic link cubre 90% use cases
- Okta SAML integration adds complexity sin proportional value pre-customer-zero

**Trigger reconsider:** enterprise customer >$25K ask SAML explícitamente.

## Decisiones críticas sobre integraciones

### Decisión 1: webhook genérico universal v1

NO build per-integration v1. En vez, **build 1 webhook genérico** que customer puede point a Zapier/Make/Slack/HubSpot via their own integration tooling.

**Webhook events propuestos v1:**
- `session.completed` (participant termina caso)
- `report.published` (manager puede ver reporte)
- `sprint.closed` (sprint cierra al N días)
- `risk_event.high` (risk event high disparó)

**Endpoint:** `/api/webhooks/{customer_secret_token}`

**Effort:** 1 semana codex (Fase 1 v2 roadmap).

**Trigger build:** ≥2 customers ask "¿pueden mandar evento a mi sistema?"

### Decisión 2: priorizar Slack > HubSpot > BambooHR (orden expansion)

Si codex tiene bandwidth post-launch para 1 integración:

1. **Slack** primero (80% buyer adoption, 2-3 sem effort, alta demand)
2. **HubSpot** segundo (50% buyer adoption pero alineado con Sales carrera F2)
3. **BambooHR** tercero (HR carrera F3 unlock)

Salesforce/Workday solo si enterprise customer pide explícito.

### Decisión 3: NO build LMS integrations (NEVER)

Posicionamiento product "diagnóstico no curso" requires NEVER integrar con LMS. Rompe el frame.

Si customer pide LMS integration: redirect a workaround (export PDF) + reframe como "not our scope".

## Decisiones derivadas

<!-- decisions:data:start -->
```yaml
decisions:
  - id: M9-3-D66
    decision: "v1 NO incluye integraciones third-party. Stand-alone signup + sprint + reporte vía Itera. Integraciones reactivas a customer demand (≥3 customers Tier 1, ≥2 Tier 2-3)"
    rationale: "YAGNI principle + codex capacity saturada con B7-001/B5-002/observability/smoke E2E + integration maintenance overhead (~10h/año por integración) + DPA ripple per integración. Build solo cuando signal real exists."
    change_type: scope_decision
    files_to_touch:
      - docs/research/integrations_roadmap_v2.md
    owner: claude
    blocked_by: []
    priority: normal

  - id: M9-3-D67
    decision: "Orden expansion integraciones cuando demand confirmada: Slack (80% adoption, 2-3 sem) → HubSpot (50% + Sales F2 alignment, 3-4 sem) → BambooHR (HR F3, 2-3 sem) → Salesforce/Workday solo enterprise ask"
    rationale: "Slack tiene highest buyer adoption + lowest effort. HubSpot alinea con F2 Sales launch (cross-sell natural). BambooHR alinea con F3 HR carrera. Enterprise integrations (Salesforce/Workday) requieren contract value que justifique 4-8 sem codex investment."
    change_type: roadmap_v2
    files_to_touch:
      - docs/research/integrations_roadmap_v2.md
      - docs/strategy/v2_roadmap_post_customer_zero.md (cross-ref)
    owner: claude + codex
    blocked_by:
      - 3_customers_demand_per_integration
    priority: low

  - id: M9-3-D68
    decision: "Webhook genérico universal v1 (post-customer-zero F1) en lugar de per-integration build. Endpoint /api/webhooks/{customer_secret_token} con 4 event types (session.completed, report.published, sprint.closed, risk_event.high)"
    rationale: "1 webhook cubre 80% de integration asks sin maintenance overhead per-integration. Customer connecta su own Zapier/Make/HubSpot via webhook. Effort 1 semana codex vs 2-4 semanas per integración. Trade-off: customer hace setup work vs Itera hace integration work."
    change_type: technical_approach
    files_to_touch:
      - app/api/webhooks/[customer_secret_token]/route.ts (futuro)
      - lib/simulador/webhook-events.ts (futuro)
    owner: codex
    blocked_by:
      - 2_customers_ask_webhook
    priority: low

  - id: M9-3-D69
    decision: "NEVER integrar con LMS (Cornerstone, Docebo, etc.). Rompe el frame producto 'diagnóstico no curso'. Si customer pide, redirect a workaround (export PDF) + reframe scope"
    rationale: "LMS integration reframea Itera como content provider en LMS ecosystem. Frame breaking. Forage compete en LMS-adjacent territory — Itera NO. Mantener clear scope: diagnóstico operativo, no content."
    change_type: scope_explicit
    files_to_touch:
      - docs/research/integrations_roadmap_v2.md
    owner: claude
    blocked_by: []
    priority: low
```
<!-- decisions:data:end -->

## Próximos pasos

1. **Inmediato:** v1 stand-alone. NO integration build pre-customer-zero.
2. **Post 5 customers + ≥3 ask Slack:** codex implementa Slack integration (2-3 sem).
3. **F2 Sales launch:** HubSpot integration (~3-4 sem) si demand explícita ≥3 customers.
4. **F3 HR carrera:** BambooHR integration (~2-3 sem).
5. **Cuando ≥2 customers ask webhook genérico:** codex implementa universal webhook endpoint (~1 sem).
6. **Salesforce/Workday/Lattice:** reactive a enterprise customer ask only.
